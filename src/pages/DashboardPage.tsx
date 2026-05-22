import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { User } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";
import { formatINR } from "../lib/money";
import {
  cancelOrReleaseBooking,
  getCheckoutSessionsBySellerId,
  markBookingConfirmed,
  markBookingContacted,
  markBookingRemainingPaid,
  markBookingSold,
} from "../services/checkoutService";
import {
  createSellerProduct,
  getSellerProductsForStore,
  updateSellerProduct,
} from "../services/productService";
import {
  getSellerByUid,
  prepareSellerAfterAuth,
} from "../services/sellerService";
import { getStoreById, updateStorePublishStatus } from "../services/storeService";
import {
  buildBookingWhatsAppUrl,
  buildDeliveryDetailsMessage,
  buildOrderConfirmedMessage,
  buildSellerPaymentCollectionMessage,
  buildNewDropRetargetingMessage,
  checkoutToSellerMessageInput,
  getSellerUpiId,
  buildRetargetingWhatsAppUrl,
} from "../services/whatsappService";
import type {
  CheckoutSession,
  DerivedCustomerLead,
  Product,
  ProductStatus,
  Seller,
  Store,
} from "../types/firestore";

const sidebarItems = [
  "Overview",
  "Products",
  "Bookings",
  "Customers",
  "Store",
  "Payments",
] as const;

type DashboardTab = (typeof sidebarItems)[number];

function getAvailableQuantity(product: Product): number {
  return Math.max(
    product.inventoryQuantity - product.reservedQuantity - product.soldQuantity,
    0
  );
}

function getProductImage(product: Product): string {
  const image = product.images?.find(
    (item) => item.thumbUrl || item.url || item.mediumUrl
  );

  return image?.thumbUrl || image?.url || image?.mediumUrl || "";
}

function getTimeValue(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }

  return 0;
}

function formatDate(value: unknown): string {
  const millis = getTimeValue(value);

  if (!millis) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(millis));
}

function getStatusLabel(status: CheckoutSession["status"]): string {
  if (status === "booking_paid") return "Verified booking";
  if (status === "payment_pending") return "Payment pending";
  if (status === "whatsapp_opened") return "WhatsApp opened";
  if (status === "contacted") return "Contacted";
  if (status === "remaining_paid") return "Remaining paid";
  if (status === "confirmed") return "Confirmed";
  if (status === "released") return "Released";
  return status.replace(/_/g, " ");
}

function isActiveBookingLead(status: CheckoutSession["status"]): boolean {
  return [
    "payment_pending",
    "booking_paid",
    "whatsapp_opened",
    "contacted",
    "remaining_paid",
    "confirmed",
    "sold",
  ].includes(status);
}

function deriveCustomerLeads(bookings: CheckoutSession[]): DerivedCustomerLead[] {
  const leadsByPhone = new Map<string, DerivedCustomerLead>();

  bookings.forEach((booking) => {
    const key = booking.buyerPhone.replace(/[^\d]/g, "") || booking.buyerPhone;
    const existing = leadsByPhone.get(key);
    const bookingTime = getTimeValue(booking.createdAt);
    const existingTime = getTimeValue(existing?.lastCreatedAt);

    if (!existing) {
      leadsByPhone.set(key, {
        buyerName: booking.buyerName,
        buyerPhone: booking.buyerPhone,
        buyerCity: booking.buyerCity,
        buyerPincode: booking.buyerPincode,
        totalBookings: 1,
        lastProductTitle: booking.productTitle,
        lastProductId: booking.productId,
        lastBookingStatus: booking.status,
        lastCreatedAt: booking.createdAt,
      });
      return;
    }

    existing.totalBookings += 1;

    if (bookingTime >= existingTime) {
      existing.buyerName = booking.buyerName || existing.buyerName;
      existing.buyerCity = booking.buyerCity || existing.buyerCity;
      existing.buyerPincode = booking.buyerPincode || existing.buyerPincode;
      existing.lastProductTitle = booking.productTitle;
      existing.lastProductId = booking.productId;
      existing.lastBookingStatus = booking.status;
      existing.lastCreatedAt = booking.createdAt;
    }
  });

  return Array.from(leadsByPhone.values()).sort(
    (a, b) => getTimeValue(b.lastCreatedAt) - getTimeValue(a.lastCreatedAt)
  );
}

async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthUser();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<CheckoutSession[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>("Overview");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      setLoading(false);
      navigate("/auth", { replace: true });
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const prepared = await prepareSellerAfterAuth(user);

        if (prepared.nextRoute !== "/dashboard") {
          navigate(prepared.nextRoute, { replace: true });
          return;
        }

        const [sellerData, storeData] = await Promise.all([
          getSellerByUid(user.uid),
          getStoreById(prepared.storeId),
        ]);

        const [productData, bookingData] = storeData
          ? await Promise.all([
              getSellerProductsForStore(user.uid, storeData.storeId),
              getCheckoutSessionsBySellerId(user.uid, storeData.storeId),
            ])
          : [[], []];

        if (cancelled) return;

        setSeller(sellerData);
        setStore(storeData);
        setProducts(productData);
        setBookings(bookingData);
      } catch (err) {
        console.error("Dashboard load failed:", err);
        if (!cancelled) {
          setError("Could not load your dashboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [authLoading, navigate, user]);

  const customers = useMemo(() => deriveCustomerLeads(bookings), [bookings]);
  const storeSlug = store?.storeSlug || store?.storeId || seller?.storeId || "";
  const storeLink = storeSlug ? `${window.location.origin}/${storeSlug}` : "";

  function handleProductCreated(product: Product) {
    setProducts((currentProducts) =>
      [product, ...currentProducts].sort((a, b) => b.sortOrder - a.sortOrder)
    );
  }

  function handleProductUpdated(product: Product) {
    setProducts((currentProducts) =>
      currentProducts
        .map((currentProduct) =>
          (currentProduct.productId || currentProduct.id) ===
          (product.productId || product.id)
            ? product
            : currentProduct
        )
        .sort((a, b) => b.sortOrder - a.sortOrder)
    );
  }

  async function refreshProductsAndBookings() {
    if (!user || !store?.storeId) return;

    const [productData, bookingData] = await Promise.all([
      getSellerProductsForStore(user.uid, store.storeId),
      getCheckoutSessionsBySellerId(user.uid, store.storeId),
    ]);

    setProducts(productData);
    setBookings(bookingData);
  }

  async function handleTogglePublish() {
    if (!store?.storeId) return;

    try {
      setPublishing(true);
      setError("");

      const nextPublished = !store.isPublished;
      await updateStorePublishStatus(store.storeId, nextPublished);
      setStore({
        ...store,
        isPublished: nextPublished,
      });
    } catch (err) {
      console.error("Publish toggle failed:", err);
      setError("Could not update publish status.");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f7f9] px-4">
        <p className="text-sm font-medium text-gray-600">Loading dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f7f9] px-4">
        <div className="rounded-2xl border border-red-200 bg-white px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-gray-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-gray-200 bg-white px-4 py-5 md:block">
          <div className="px-2">
            <p className="text-lg font-semibold tracking-tight">PayPerTap</p>
            <p className="mt-1 text-xs font-medium text-gray-500">Seller dashboard</p>
          </div>

          <nav className="mt-8 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveTab(item)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium ${
                  activeTab === item ? "bg-gray-950 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {seller?.email || "Seller"}
                </p>
                <h1 className="text-xl font-semibold tracking-tight">
                  {store?.storeName || "Your store"}
                </h1>
              </div>

              {storeSlug ? (
                <Link
                  to={`/${storeSlug}`}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                >
                  View Store
                </Link>
              ) : null}
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6">
            <div className="mb-5 flex gap-2 overflow-x-auto md:hidden">
              {sidebarItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveTab(item)}
                  className={`shrink-0 rounded-xl px-3 py-2 text-sm font-medium ${
                    activeTab === item
                      ? "bg-gray-950 text-white"
                      : "border border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {activeTab === "Overview" ? (
              <OverviewTab
                bookings={bookings}
                customers={customers}
                onSelectTab={setActiveTab}
                products={products}
                store={store}
                storeLink={storeLink}
                publishing={publishing}
                onTogglePublish={handleTogglePublish}
              />
            ) : null}

            {activeTab === "Products" ? (
              <ProductsTab
                onProductCreated={handleProductCreated}
                onProductUpdated={handleProductUpdated}
                products={products}
                store={store}
                user={user}
              />
            ) : null}

            {activeTab === "Bookings" ? (
              <BookingsTab
                bookings={bookings}
                onBookingChanged={refreshProductsAndBookings}
                store={store}
              />
            ) : null}

            {activeTab === "Customers" ? (
              <CustomersTab
                customers={customers}
                products={products}
                storeLink={storeLink}
              />
            ) : null}

            {activeTab === "Store" ? (
              <StoreTab
                onTogglePublish={handleTogglePublish}
                publishing={publishing}
                store={store}
                storeLink={storeLink}
                storeSlug={storeSlug}
              />
            ) : null}

            {activeTab === "Payments" ? <PaymentsTab /> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function OverviewTab({
  bookings,
  customers,
  onTogglePublish,
  onSelectTab,
  products,
  publishing,
  store,
  storeLink,
}: {
  bookings: CheckoutSession[];
  customers: DerivedCustomerLead[];
  onTogglePublish: () => void;
  onSelectTab: (tab: DashboardTab) => void;
  products: Product[];
  publishing: boolean;
  store: Store | null;
  storeLink: string;
}) {
  const openProducts = products.filter(
    (product) => product.status === "open" && getAvailableQuantity(product) > 0
  ).length;
  const reservedProducts = products.filter((product) =>
    product.reservedQuantity > 0 || product.status === "hold"
  ).length;
  const soldProducts = products.filter(
    (product) => product.status === "sold" || product.soldQuantity > 0
  ).length;
  const activeBookingLeads = bookings.filter((booking) =>
    !["cancelled", "released"].includes(booking.status)
  ).length;
  const verifiedBookings = bookings.filter((booking) =>
    ["booking_paid", "contacted", "remaining_paid", "confirmed", "sold"].includes(
      booking.status
    )
  ).length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Total products" value={String(products.length)} detail="In this store" />
        <DashboardCard label="Open products" value={String(openProducts)} detail="Ready to book" />
        <DashboardCard label="Reserved/hold" value={String(reservedProducts)} detail="Needs follow-up" />
        <DashboardCard label="Sold" value={String(soldProducts)} detail="Completed inventory" />
        <DashboardCard label="Booking leads" value={String(activeBookingLeads)} detail="Active checkout sessions" />
        <DashboardCard label="Verified bookings" value={String(verifiedBookings)} detail="Paid or progressed" />
        <DashboardCard label="Customers/leads" value={String(customers.length)} detail="Unique buyer phones" />
        <DashboardCard
          label="Store status"
          value={store?.isPublished ? "Published" : "Unpublished"}
          detail="Public visibility"
        />
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold tracking-tight">Next actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ActionButton label="Add product" onClick={() => onSelectTab("Products")} />
          <ActionButton label="Check bookings" onClick={() => onSelectTab("Bookings")} />
          <Link
            to={storeLink ? new URL(storeLink).pathname : "#"}
            className="rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 transition hover:bg-gray-50"
          >
            View store
          </Link>
          <ActionButton
            label="Copy store link"
            onClick={() => {
              if (storeLink) void copyText(storeLink);
            }}
          />
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={onTogglePublish}
            disabled={publishing || !store?.storeId}
            className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publishing
              ? "Saving..."
              : store?.isPublished
                ? "Unpublish store"
                : "Publish store"}
          </button>
        </div>
      </section>
    </>
  );
}

function ProductsTab({
  onProductUpdated,
  products,
  user,
  store,
  onProductCreated,
}: {
  products: Product[];
  user: User | null;
  store: Store | null;
  onProductCreated: (product: Product) => void;
  onProductUpdated: (product: Product) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [inventoryQuantity, setInventoryQuantity] = useState("1");
  const [status, setStatus] = useState<ProductStatus>("open");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !store?.storeId) {
      setError("Store setup is not ready yet.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const product = await createSellerProduct(user, store.storeId, {
        title,
        price: Number(price),
        description,
        category,
        inventoryQuantity: Number(inventoryQuantity),
        imageFile,
        status,
      });

      onProductCreated(product);
      setTitle("");
      setPrice("");
      setDescription("");
      setCategory("");
      setInventoryQuantity("1");
      setStatus("open");
      setImageFile(null);
      setImageFileName("");
      setShowForm(false);
    } catch (err) {
      console.error("Product create failed:", err);
      setError(err instanceof Error ? err.message : "Could not add product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Products</h2>
            <p className="mt-1 text-sm text-gray-500">
              Products created during onboarding and dashboard add both appear here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((isOpen) => !isOpen)}
            className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white"
          >
            {showForm ? "Close" : "Add product"}
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="mt-5 grid gap-4 border-t border-gray-100 pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" required value={title} onChange={setTitle} />
              <Field
                label="Price"
                min="21"
                required
                type="number"
                value={price}
                onChange={setPrice}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Inventory"
                min="1"
                required
                type="number"
                value={inventoryQuantity}
                onChange={setInventoryQuantity}
              />
              <Field label="Category" value={category} onChange={setCategory} placeholder="General" />
              <label className="text-sm font-medium text-gray-800">
                Status
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ProductStatus)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
                >
                  <option value="open">Open</option>
                  <option value="hold">Hold</option>
                  <option value="sold">Sold</option>
                  <option value="draft">Draft</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </label>
            </div>

            <label className="text-sm font-medium text-gray-800">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
              />
            </label>

            <div>
              <label className="text-sm font-medium text-gray-800">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setImageFile(file);
                  setImageFileName(file?.name || "");
                }}
                className="mt-2 w-full rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-950 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
              />
              {imagePreviewUrl ? (
                <div className="mt-3 max-w-xs overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  <img
                    src={imagePreviewUrl}
                    alt="Selected product preview"
                    className="h-40 w-full object-cover"
                  />
                </div>
              ) : null}
              <p className="mt-2 text-xs text-gray-500">
                {imageFileName
                  ? `${imageFileName} selected.`
                  : "JPEG, PNG, WebP, or GIF up to 5MB."}
              </p>
            </div>

            {error ? <ErrorBox message={error} /> : null}

            <div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && imageFile ? "Uploading image..." : saving ? "Saving product..." : "Save product"}
              </button>
            </div>
          </form>
        ) : null}

        {editingProduct ? (
          <EditProductForm
            onCancel={() => setEditingProduct(null)}
            onSaved={(product) => {
              onProductUpdated(product);
              setEditingProduct(null);
            }}
            product={editingProduct}
            user={user}
          />
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        {products.length === 0 ? (
          <EmptyState title="No products yet" message="Add your first product to make it available in your store." />
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <ProductRow
                key={product.id || product.productId}
                onEdit={() => setEditingProduct(product)}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EditProductForm({
  onCancel,
  onSaved,
  product,
  user,
}: {
  onCancel: () => void;
  onSaved: (product: Product) => void;
  product: Product;
  user: User | null;
}) {
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description || "");
  const [category, setCategory] = useState(product.category || "");
  const [inventoryQuantity, setInventoryQuantity] = useState(
    String(product.inventoryQuantity)
  );
  const [status, setStatus] = useState<ProductStatus>(product.status);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState(getProductImage(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(getProductImage(product));
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile, product]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setError("Please sign in again to edit this product.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedProduct = await updateSellerProduct(user, product, {
        title,
        price: Number(price),
        description,
        category,
        inventoryQuantity: Number(inventoryQuantity),
        status,
        imageFile,
      });

      onSaved(updatedProduct);
    } catch (err) {
      console.error("Product update failed:", err);
      setError(err instanceof Error ? err.message : "Could not update product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 grid gap-4 border-t border-gray-100 pt-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight">Edit product</h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-900"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" required value={title} onChange={setTitle} />
        <Field
          label="Price"
          min="21"
          required
          type="number"
          value={price}
          onChange={setPrice}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label={`Inventory (reserved ${product.reservedQuantity}, sold ${product.soldQuantity})`}
          min={String(product.reservedQuantity + product.soldQuantity)}
          required
          type="number"
          value={inventoryQuantity}
          onChange={setInventoryQuantity}
        />
        <Field label="Category" value={category} onChange={setCategory} placeholder="General" />
        <label className="text-sm font-medium text-gray-800">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ProductStatus)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
          >
            <option value="open">Open</option>
            <option value="hold">Hold</option>
            <option value="sold">Sold</option>
            <option value="draft">Draft</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </label>
      </div>

      <label className="text-sm font-medium text-gray-800">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
        />
      </label>

      <div>
        <label className="text-sm font-medium text-gray-800">Replace image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0] || null;
            setImageFile(file);
            setImageFileName(file?.name || "");
          }}
          className="mt-2 w-full rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-950 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        />
        {imagePreviewUrl ? (
          <div className="mt-3 max-w-xs overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            <img
              src={imagePreviewUrl}
              alt="Product preview"
              className="h-40 w-full object-cover"
            />
          </div>
        ) : null}
        <p className="mt-2 text-xs text-gray-500">
          {imageFileName
            ? `${imageFileName} selected.`
            : imagePreviewUrl
              ? "Current image will be preserved unless you choose a new one."
              : "JPEG, PNG, WebP, or GIF up to 5MB."}
        </p>
      </div>

      {error ? <ErrorBox message={error} /> : null}

      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && imageFile ? "Uploading image..." : saving ? "Saving changes..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function ProductRow({
  onEdit,
  product,
}: {
  onEdit: () => void;
  product: Product;
}) {
  const imageUrl = getProductImage(product);
  const availableQuantity = getAvailableQuantity(product);

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[72px_1fr_auto] lg:items-center">
      <div className="h-18 w-18 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-gray-400">
            No image
          </div>
        )}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-950">{product.title}</p>
          <StatusBadge label={product.status} />
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-gray-900"
          >
            Edit
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {product.category || "General"} - {product.description || "No description"}
        </p>
        <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-3 lg:max-w-xl">
          <Metric label="Inventory" value={String(product.inventoryQuantity)} />
          <Metric label="Reserved" value={String(product.reservedQuantity)} />
          <Metric label="Sold" value={String(product.soldQuantity)} />
        </div>
      </div>
      <div className="grid gap-2 text-sm lg:min-w-56">
        <InfoRow label="Price" value={formatINR(product.price)} />
        <InfoRow label="Advance" value={formatINR(product.bookingAdvanceAmount)} />
        <InfoRow label="Collect" value={formatINR(product.sellerCollectAmount)} />
        <InfoRow label="Available" value={String(availableQuantity)} />
      </div>
    </div>
  );
}

function BookingsTab({
  bookings,
  onBookingChanged,
  store,
}: {
  bookings: CheckoutSession[];
  onBookingChanged: () => Promise<void>;
  store: Store | null;
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold tracking-tight">Bookings</h2>
        <p className="mt-1 text-sm text-gray-500">
          These are checkout session leads for your store. Production orders will be backend-created later.
        </p>
      </div>

      <div className="space-y-3">
        {bookings.length === 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white">
            <EmptyState title="No booking leads yet" message="Buyer checkout sessions will appear here." />
          </section>
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.checkoutId}
              booking={booking}
              onBookingChanged={onBookingChanged}
              store={store}
            />
          ))
        )}
      </div>
    </section>
  );
}

function BookingCard({
  booking,
  onBookingChanged,
  store,
}: {
  booking: CheckoutSession;
  onBookingChanged: () => Promise<void>;
  store: Store | null;
}) {
  const [copied, setCopied] = useState(false);
  const [savingAction, setSavingAction] = useState("");
  const [actionError, setActionError] = useState("");
  const sellerMessageInput = checkoutToSellerMessageInput(booking, store);
  const message = buildSellerPaymentCollectionMessage(sellerMessageInput);
  const deliveryMessage = buildDeliveryDetailsMessage(sellerMessageInput);
  const confirmedMessage = buildOrderConfirmedMessage(sellerMessageInput);
  const whatsappUrl = buildBookingWhatsAppUrl(booking.buyerPhone, message);
  const deliveryWhatsappUrl = buildBookingWhatsAppUrl(booking.buyerPhone, deliveryMessage);
  const confirmedWhatsappUrl = buildBookingWhatsAppUrl(booking.buyerPhone, confirmedMessage);
  const sellerUpiId = getSellerUpiId(store);

  async function handleCopy() {
    await copyText(message);
    setCopied(true);
  }

  async function runBookingAction(label: string, action: () => Promise<void>) {
    try {
      setSavingAction(label);
      setActionError("");
      await action();
      await onBookingChanged();
    } catch (err) {
      console.error("Booking action failed:", err);
      setActionError(err instanceof Error ? err.message : "Could not update booking.");
    } finally {
      setSavingAction("");
    }
  }

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">{booking.productTitle}</h3>
            <StatusBadge label={getStatusLabel(booking.status)} />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {booking.buyerName} - {booking.buyerPhone} - {booking.buyerCity} {booking.buyerPincode}
          </p>
          <p className="mt-1 text-xs text-gray-500">Created: {formatDate(booking.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white"
          >
            Open WhatsApp
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900"
          >
            {copied ? "Copied" : "Copy message"}
          </button>
          <a
            href={deliveryWhatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900"
          >
            Delivery details
          </a>
          <a
            href={confirmedWhatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900"
          >
            Order confirmed
          </a>
          <button
            type="button"
            onClick={() =>
              runBookingAction("contacted", () =>
                markBookingContacted(booking.checkoutId)
              )
            }
            disabled={Boolean(savingAction)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 disabled:opacity-50"
          >
            Mark contacted
          </button>
          <button
            type="button"
            onClick={() =>
              runBookingAction("remaining_paid", () =>
                markBookingRemainingPaid(booking.checkoutId)
              )
            }
            disabled={Boolean(savingAction)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 disabled:opacity-50"
          >
            Mark remaining paid
          </button>
          <button
            type="button"
            onClick={() =>
              runBookingAction("confirmed", () =>
                markBookingConfirmed(booking.checkoutId)
              )
            }
            disabled={Boolean(savingAction)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 disabled:opacity-50"
          >
            Mark confirmed
          </button>
          <button
            type="button"
            onClick={() =>
              runBookingAction("sold", () => markBookingSold(booking))
            }
            disabled={Boolean(savingAction) || booking.status === "sold"}
            className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Mark sold
          </button>
          <button
            type="button"
            onClick={() =>
              runBookingAction("released", () => cancelOrReleaseBooking(booking))
            }
            disabled={
              Boolean(savingAction) ||
              ["sold", "cancelled", "released"].includes(booking.status)
            }
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
          >
            Cancel / release hold
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Product price" value={formatINR(booking.productPrice)} />
        <Metric label="Advance paid" value={formatINR(booking.bookingAdvanceAmount)} />
        <Metric label="Collect from buyer" value={formatINR(booking.sellerCollectAmount)} />
        <Metric label="WhatsApp opened" value={booking.whatsappOpened ? "Yes" : "No"} />
        <Metric label="Status" value={booking.status} />
      </div>
      {!sellerUpiId ? (
        <p className="mt-3 text-xs leading-5 text-amber-700">
          Add your UPI ID in Store settings later to auto-fill payment messages.
        </p>
      ) : null}
      {actionError ? <ErrorBox message={actionError} /> : null}
    </article>
  );
}

function CustomersTab({
  customers,
  products,
  storeLink,
}: {
  customers: DerivedCustomerLead[];
  products: Product[];
  storeLink: string;
}) {
  const promotableProducts = products.filter(
    (product) => product.status === "open" && getAvailableQuantity(product) > 0
  );

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold tracking-tight">Customers</h2>
        <p className="mt-1 text-sm text-gray-500">
          Customer leads are grouped from checkout sessions until backend customer records are added.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        {customers.length === 0 ? (
          <EmptyState title="No customer leads yet" message="Unique buyers from bookings will appear here." />
        ) : (
          <div className="divide-y divide-gray-100">
            {customers.map((customer) => (
              <CustomerRow
                customer={customer}
                key={customer.buyerPhone}
                products={promotableProducts}
                storeLink={storeLink}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CustomerRow({
  customer,
  products,
  storeLink,
}: {
  customer: DerivedCustomerLead;
  products: Product[];
  storeLink: string;
}) {
  const [copied, setCopied] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const selectedProduct = products.find(
    (product) => (product.productId || product.id) === selectedProductId
  );
  const isAlreadyBooked =
    selectedProduct &&
    ((selectedProduct.productId || selectedProduct.id) === customer.lastProductId ||
      selectedProduct.title === customer.lastProductTitle);
  const message =
    selectedProduct && !isAlreadyBooked
      ? buildNewDropRetargetingMessage({
          buyerName: customer.buyerName,
          storeLink,
          product: selectedProduct,
        })
      : buildNewDropRetargetingMessage({
          buyerName: customer.buyerName,
          storeLink,
        });
  const whatsappUrl = buildRetargetingWhatsAppUrl(customer.buyerPhone, message);

  async function handleCopy() {
    await copyText(message);
    setCopied(true);
  }

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <p className="text-sm font-semibold text-gray-950">{customer.buyerName}</p>
        <p className="mt-1 text-xs text-gray-500">
          {customer.buyerPhone} - {customer.buyerCity} {customer.buyerPincode}
        </p>
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
          <Metric label="Bookings" value={String(customer.totalBookings)} />
          <Metric label="Last product" value={customer.lastProductTitle} />
          <Metric label="Last status" value={customer.lastBookingStatus} />
          <Metric label="Last booking" value={formatDate(customer.lastCreatedAt)} />
        </div>
        <label className="mt-3 block text-xs font-medium text-gray-600">
          Retarget with product
          <select
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
          >
            <option value="">General store message</option>
            {products.map((product) => {
              const productId = product.productId || product.id;
              const disabled =
                productId === customer.lastProductId ||
                product.title === customer.lastProductTitle;

              return (
                <option key={productId} value={productId} disabled={disabled}>
                  {disabled
                    ? `Already booked: ${product.title}`
                    : `${product.title} - ${formatINR(product.price)}`}
                </option>
              );
            })}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white"
        >
          Open WhatsApp
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900"
        >
          {copied ? "Copied" : "Copy retargeting message"}
        </button>
      </div>
    </div>
  );
}

function StoreTab({
  store,
  storeSlug,
  storeLink,
  publishing,
  onTogglePublish,
}: {
  store: Store | null;
  storeSlug: string;
  storeLink: string;
  publishing: boolean;
  onTogglePublish: () => void;
}) {
  const colors = [
    store?.primaryColor || "#111827",
    store?.secondaryColor || "#F9FAFB",
    store?.accentColor || "#2563EB",
  ].join(" / ");

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Store</h2>
            <p className="mt-1 text-sm text-gray-500">Store preview and publishing controls.</p>
          </div>
          <button
            type="button"
            onClick={onTogglePublish}
            disabled={publishing || !store?.storeId}
            className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publishing
              ? "Saving..."
              : store?.isPublished
                ? "Unpublish store"
                : "Publish store"}
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[160px_1fr]">
          <div className="h-32 w-32 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            {store?.logoUrl ? (
              <img src={store.logoUrl} alt={store.storeName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-400">
                No logo
              </div>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <InfoRow label="Store name" value={store?.storeName || "Not set"} />
            <InfoRow label="Slug" value={storeSlug || "Not set"} />
            <InfoRow label="Public link" value={storeLink || "Not set"} />
            <InfoRow label="Published" value={store?.isPublished ? "Yes" : "No"} />
            <InfoRow label="Phone" value={store?.phone || "Not set"} />
            <InfoRow label="WhatsApp" value={store?.whatsappPhone || store?.phone || "Not set"} />
            <InfoRow label="Booking advance" value={formatINR(store?.bookingAdvanceAmount || 20)} />
            <InfoRow label="Theme" value={store?.themeId || "minimal-clean"} />
            <InfoRow label="Colors" value={colors} />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          Buyers pay ₹20 advance on PayPerTap. You collect the remaining product amount directly on WhatsApp/UPI/COD.
        </div>
      </div>

      <QuickReplies />
    </section>
  );
}

function QuickReplies() {
  const replies = [
    {
      label: "/payment",
      text: [
        "Thanks for your booking.",
        "",
        "Please pay the remaining amount here:",
        "UPI ID: {your UPI ID}",
        "",
        "After payment, please share the screenshot here so we can confirm your delivery.",
      ].join("\n"),
    },
    {
      label: "/delivery",
      text: [
        "Please share your complete delivery details:",
        "",
        "Name:",
        "Phone:",
        "Address:",
        "City:",
        "Pincode:",
      ].join("\n"),
    },
    {
      label: "/confirm",
      text: [
        "Your order is confirmed. Thank you for shopping with us.",
        "We will update you shortly with delivery details.",
      ].join("\n"),
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold tracking-tight">WhatsApp Business quick replies</h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {replies.map((reply) => (
          <QuickReplyCard key={reply.label} label={reply.label} text={reply.text} />
        ))}
      </div>
    </section>
  );
}

function QuickReplyCard({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyText(text);
    setCopied(true);
  }

  return (
    <article className="rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-950">{label}</p>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-900"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mt-3 whitespace-pre-wrap text-xs leading-5 text-gray-600">{text}</pre>
    </article>
  );
}

function PaymentsTab() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <p className="text-sm font-medium text-gray-500">Phase 1 mode</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">
        Fixed ₹20 PayPerTap booking advance
      </h2>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        PayPerTap collects ₹20 from the buyer to reserve the item. You collect
        the remaining product amount directly on WhatsApp/UPI/COD.
      </p>
      <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-600">
        Custom advance and seller payout will be available later after Razorpay
        Route/Cashfree split setup.
      </div>
    </section>
  );
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 transition hover:bg-gray-50"
    >
      {label}
    </button>
  );
}

function DashboardCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-950">{value}</p>
      <p className="mt-2 text-xs font-medium text-gray-500">{detail}</p>
    </article>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="p-8 text-center">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
      {message}
    </div>
  );
}

function Field({
  label,
  min,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: {
  label: string;
  min?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="text-sm font-medium text-gray-800">
      {label}
      <input
        min={min}
        placeholder={placeholder}
        required={required}
        step={type === "number" ? "1" : undefined}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
      />
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-950">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 break-words font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="w-fit rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium capitalize text-gray-600">
      {label}
    </span>
  );
}
