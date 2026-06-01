import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FolderOpen,
  Link2,
  MoreVertical,
  PackageOpen,
  Plus,
  Settings,
  ShoppingBag,
  Store as StoreIcon,
  Users,
} from "lucide-react";
import {
  PptBadge,
  PptBrandIcon,
  PptButton,
  PptEmptyState,
  PptIconButton,
  PptNotice,
  PptTapLoader,
  type PptTone,
} from "../components/ui";
import { useAuthUser } from "../hooks/useAuthUser";
import {
  assertValidImageFile,
  assertValidImageFiles,
  MAX_PRODUCT_IMAGE_COUNT,
} from "../lib/imageCompression";
import {
  COMPATIBILITY_COLLECTION_NAME,
  getCollectionNameKey,
  isCompatibilityCollectionName,
  normalizeCollectionName,
} from "../lib/collections";
import { formatINR } from "../lib/money";
import type { SellerConfirmationAdvanceType } from "../lib/confirmationAdvance";
import { normalizeIndianMobileInput } from "../lib/phone";
import {
  getDisplayImageUrl,
  getPrimaryProductImage,
  getProductImageUrls,
  productHasTemporaryImageUrls,
} from "../lib/imageUrls";
import { getAvailableQuantity, getProductUnavailableLabel } from "../lib/productAvailability";
import { buildBookingLabelData } from "../lib/labelData";
import {
  generateVariantCombinations,
  getVariantDetailsText,
  getVariantSummary,
  normalizeVariantOptions,
  productHasVariants,
  type ProductVariant,
  type ProductVariantOption,
} from "../lib/productVariants";
import {
  getCheckoutSessionsBySellerId,
  markBookingCancelled,
  markBookingSold,
  repairMissingCheckoutReservation,
} from "../services/checkoutService";
import {
  createSellerProduct,
  deleteSellerProduct,
  getSellerProductsForStore,
  updateSellerProduct,
  type ProductSaveProgress,
} from "../services/productService";
import {
  createStoreCollection,
  deleteStoreCollection,
  listStoreCollections,
  updateStoreCollection,
} from "../services/collectionService";
import {
  getSellerByUid,
  prepareSellerAfterAuth,
} from "../services/sellerService";
import {
  getStoreById,
  updateStoreCustomization,
  updateStoreTheme,
  updateStorePublishStatus,
} from "../services/storeService";
import { ThemeRenderer } from "../storefront/ThemeRenderer";
import { getStorefrontConfirmationPolicyText } from "../storefront/StorefrontPaymentBreakdown";
import { getProductGridImageUrl } from "../storefront/imageMedia";
import {
  DEFAULT_STOREFRONT_THEME_ID,
  isStorefrontThemeId,
  storefrontThemeRegistry,
} from "../storefront/themes/registry";
import type { StorefrontThemeId } from "../storefront/themes/types";
import { uploadImageToR2 } from "../services/uploadService";
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
  StoreCollection,
} from "../types/firestore";

function sanitizePositiveNumberInput(value: string): string {
  const digits = value.replace(/[^\d]/g, "");

  if (!digits || /^0+$/.test(digits)) return "";

  return digits.replace(/^0+/, "");
}

const sidebarItems = [
  "Overview",
  "Products",
  "Collections",
  "Bookings",
  "Customers",
  "Store",
  "Payments",
] as const;

type DashboardTab = (typeof sidebarItems)[number];
const mobileNavItems = [
  "Overview",
  "Products",
  "Collections",
  "Bookings",
  "Customers",
  "Store",
  "Payments",
] as const satisfies readonly DashboardTab[];

const sidebarIcons: Record<DashboardTab, typeof BarChart3> = {
  Overview: BarChart3,
  Products: ShoppingBag,
  Collections: FolderOpen,
  Bookings: CalendarCheck,
  Customers: Users,
  Store: StoreIcon,
  Payments: CreditCard,
};

function getProductImage(product: Product): string {
  return getPrimaryProductImage(product) || getProductGridImageUrl(product);
}

function parseVariantValues(value: string): string[] {
  const seen = new Set<string>();

  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter((item) => {
      const key = item.toLocaleLowerCase();
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);
}

function sanitizeNonNegativeNumberInput(value: string): string {
  return value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
}

function getVariantOptionsFromInputs(input: {
  sizes: string;
  colors: string;
}): ProductVariantOption[] {
  return normalizeVariantOptions([
    { name: "Size", values: parseVariantValues(input.sizes) },
    { name: "Color", values: parseVariantValues(input.colors) },
  ]);
}

function getVariantValuesInput(product: Product, optionName: "Size" | "Color"): string {
  const option = normalizeVariantOptions(product.variantOptions).find(
    (item) => item.name.toLocaleLowerCase() === optionName.toLocaleLowerCase()
  );

  return option?.values.join(", ") || "";
}

function getVariantPayload(input: {
  hasVariants: boolean;
  sizeValues: string;
  colorValues: string;
  variantRows: ProductVariant[];
}) {
  const variantOptions = getVariantOptionsFromInputs({
    sizes: input.sizeValues,
    colors: input.colorValues,
  });
  const variants = input.hasVariants
    ? generateVariantCombinations(variantOptions, input.variantRows)
    : [];

  return {
    hasVariants: Boolean(input.hasVariants && variantOptions.length > 0),
    variantOptions: input.hasVariants ? variantOptions : [],
    variants: input.hasVariants ? variants : [],
    defaultVariantId: variants.find((variant) => variant.isAvailable !== false)?.variantId || "",
  };
}

function BookingVariantLine({ booking }: { booking: CheckoutSession }) {
  const details = getVariantDetailsText(booking);

  if (!details) return null;

  return (
    <span className="mt-1 block break-words text-xs font-medium text-gray-600">
      {details}
    </span>
  );
}

function getProductPreviewImages(product: Product): string[] {
  return getProductImageUrls(product)
    .map((image) => image.thumbnailUrl || image.thumbUrl || image.url || "")
    .filter(Boolean);
}

function getProductPreviewImageItems(product: Product): Array<{ url: string; alt: string }> {
  return getProductImageUrls(product)
    .map((image, index) => ({
      url: image.thumbnailUrl || image.thumbUrl || image.url || "",
      alt: image.alt || `${product.title} image ${index + 1}`,
    }))
    .filter((image) => Boolean(image.url));
}

function ProductImagePreviewGrid({
  images,
  label,
}: {
  images: Array<{ url: string; alt: string }>;
  label?: string;
}) {
  if (!images.length) return null;

  return (
    <div className="mt-3 min-w-0">
      <div className="grid max-w-md min-w-0 grid-cols-3 gap-2">
        {images.map((image, index) => (
          <div
            className="aspect-square min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
            key={`${image.url}-${index}`}
          >
            <img
              src={image.url}
              alt={image.alt}
              decoding="async"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
      {label ? (
        <p className="mt-2 text-xs font-medium text-gray-500">{label}</p>
      ) : null}
    </div>
  );
}

function getProductSaveStatus(
  progress: ProductSaveProgress | null,
  fallbackSavingLabel: string
) {
  if (!progress) return fallbackSavingLabel;

  if (progress.phase === "saving") {
    return progress.totalImages > 0
      ? "Images uploaded, saving product..."
      : fallbackSavingLabel;
  }

  if (progress.totalImages <= 0) return fallbackSavingLabel;

  const activeImage = Math.min(
    progress.totalImages,
    progress.completedImages + 1
  );

  return `Uploading ${activeImage}/${progress.totalImages}...`;
}

function getStoreLogoUrl(store?: Store | null): string {
  return getDisplayImageUrl(store?.logoUrl || store?.storeLogoUrl);
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

function getShortDate(value: unknown): string {
  const millis = getTimeValue(value);

  if (!millis) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(millis));
}

function getStoreInstagramProfile(store?: Store | null): string {
  if (!store) return "";
  return store.instagramUrl || store.instagramProfile || (store.instagramHandle ? `@${store.instagramHandle}` : "");
}

function getSelectedStorefrontThemeId(store?: Store | null): StorefrontThemeId {
  if (isStorefrontThemeId(store?.themeId)) {
    return store.themeId;
  }

  if (isStorefrontThemeId(store?.selectedThemeId)) {
    return store.selectedThemeId;
  }

  return DEFAULT_STOREFRONT_THEME_ID;
}

function getCheckoutStatusTone(status: CheckoutSession["status"]): PptTone {
  if (status === "confirmed") return "success";
  if (status === "sold") return "neutral";
  if (status === "cancelled" || status === "released") return "neutral";
  if (status === "payment_pending") return "warning";
  if (status === "booking_paid") return "primary";
  return "info";
}

function getStatusLabel(status: CheckoutSession["status"]): string {
  if (!status) return "Choose action";
  if (["started", "details_submitted", "payment_pending", "booking_paid"].includes(status)) {
    return "New booking";
  }
  if (status === "whatsapp_opened") return "Contacted";
  if (status === "contacted") return "Contacted";
  if (status === "remaining_paid") return "Remaining paid";
  if (status === "confirmed") return "Confirmed";
  if (status === "sold") return "Sold";
  if (status === "released") return "Released";
  if (status === "cancelled") return "Cancelled";
  if (status === "abandoned") return "Cancelled";
  return status.replace(/_/g, " ");
}

function getSellerCollectAmountFromBooking(booking: CheckoutSession): number {
  const bookingWithLegacyAmounts = booking as CheckoutSession & {
    collectFromBuyer?: number;
    remainingAmount?: number;
  };

  return Math.max(
    0,
    Number(
      booking.sellerCollectAmount ||
        bookingWithLegacyAmounts.collectFromBuyer ||
        bookingWithLegacyAmounts.remainingAmount ||
        0
    )
  );
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
        lastVariantLabel: booking.selectedVariantLabel,
        lastVariantOptions: booking.selectedVariantOptions,
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
      existing.lastVariantLabel = booking.selectedVariantLabel;
      existing.lastVariantOptions = booking.selectedVariantOptions;
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

async function repairMissingReservations(
  bookings: CheckoutSession[]
): Promise<boolean> {
  const staleBookings = bookings.filter(
    (booking) => booking.reservationApplied === false
  );

  if (!staleBookings.length) return false;

  const results = await Promise.all(
    staleBookings.map((booking) =>
      repairMissingCheckoutReservation(booking).catch((error) => {
        console.warn("Could not repair booking reservation:", error);
        return false;
      })
    )
  );

  return results.some(Boolean);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthUser();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<StoreCollection[]>([]);
  const [bookings, setBookings] = useState<CheckoutSession[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>("Overview");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [copiedStoreLink, setCopiedStoreLink] = useState(false);
  const [addProductRequest, setAddProductRequest] = useState(0);

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
      if (!user) return;

      const uid = user.uid;

      try {
        setLoading(true);
        setError("");

        const prepared = await prepareSellerAfterAuth(user);

        if (prepared.nextRoute !== "/dashboard") {
          navigate(prepared.nextRoute, { replace: true });
          return;
        }

        const [sellerData, storeData] = await Promise.all([
          getSellerByUid(uid),
          getStoreById(prepared.storeId),
        ]);

        const [productData, bookingData] = storeData
          ? await Promise.all([
              getSellerProductsForStore(uid, storeData.storeId),
              getCheckoutSessionsBySellerId(uid, storeData.storeId).catch((bookingError) => {
                console.warn("Bookings unavailable:", bookingError);
                return [];
              }),
            ])
          : [[], []];
        const repairedReservations = storeData
          ? await repairMissingReservations(bookingData)
          : false;
        const [currentProductData, currentBookingData] =
          storeData && repairedReservations
            ? await Promise.all([
                getSellerProductsForStore(uid, storeData.storeId),
                getCheckoutSessionsBySellerId(uid, storeData.storeId).catch((bookingError) => {
                  console.warn("Bookings unavailable:", bookingError);
                  return bookingData;
                }),
              ])
            : [productData, bookingData];
        const collectionData = storeData
          ? await listStoreCollections(storeData.storeId, currentProductData).catch((collectionError) => {
              console.warn("Collections unavailable:", collectionError);
              return [];
            })
          : [];

        if (cancelled) return;

        setSeller(sellerData);
        setStore(storeData);
        setProducts(currentProductData);
        setCollections(collectionData);
        setBookings(currentBookingData);
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

  function openAddProduct() {
    setActiveTab("Products");
    setAddProductRequest((requestCount) => requestCount + 1);
  }

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

  function handleProductRemoved(productId: string) {
    setProducts((currentProducts) =>
      currentProducts.filter(
        (currentProduct) =>
          (currentProduct.productId || currentProduct.id) !== productId
      )
    );
  }

  async function refreshProductsAndBookings() {
    if (!user || !store?.storeId) return;

    const [productData, bookingData] = await Promise.all([
      getSellerProductsForStore(user.uid, store.storeId),
      getCheckoutSessionsBySellerId(user.uid, store.storeId).catch((bookingError) => {
        console.warn("Bookings unavailable:", bookingError);
        return [];
      }),
    ]);
    const repairedReservations = await repairMissingReservations(bookingData);
    const [currentProductData, currentBookingData] = repairedReservations
      ? await Promise.all([
          getSellerProductsForStore(user.uid, store.storeId),
          getCheckoutSessionsBySellerId(user.uid, store.storeId).catch((bookingError) => {
            console.warn("Bookings unavailable:", bookingError);
            return bookingData;
          }),
        ])
      : [productData, bookingData];
    const collectionData = await listStoreCollections(
      store.storeId,
      currentProductData
    ).catch((collectionError) => {
      console.warn("Collections unavailable:", collectionError);
      return collections;
    });

    setProducts(currentProductData);
    setCollections(collectionData);
    setBookings(currentBookingData);
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

  async function handleCopyStoreLink() {
    if (!storeLink) return;

    await copyText(storeLink);
    setCopiedStoreLink(true);
  }

  if (loading) {
    return (
      <main className="pds-page grid place-items-center">
        <PptTapLoader
          title="Loading dashboard..."
          description="Preparing your seller space."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="pds-page grid place-items-center px-4">
        <PptNotice tone="danger" title="Dashboard unavailable" className="max-w-sm">
          {error}
        </PptNotice>
      </main>
    );
  }

  return (
    <main className="ppt-dashboard-page">
      <div className="ppt-dashboard-shell">
        <aside className="ppt-dashboard-sidebar">
          <div className="ppt-dashboard-brand">
            <div className="ppt-dashboard-mark">P</div>
            <div>
              <p>PayPerTap</p>
              <span>Seller dashboard</span>
            </div>
          </div>

          <nav className="ppt-dashboard-nav" aria-label="Dashboard sections">
            {sidebarItems.map((item) => {
              const Icon = sidebarIcons[item];

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveTab(item)}
                  className={activeTab === item ? "is-active" : ""}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span>{item}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="ppt-dashboard-main">
          <header className="ppt-dashboard-header">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="ppt-dashboard-eyebrow">{seller?.email || "Seller"}</p>
                <PptBadge tone={store?.isPublished ? "success" : "warning"}>
                  {store?.isPublished ? "Live" : "Unpublished"}
                </PptBadge>
              </div>
              <h1>{store?.storeName || "Your store"}</h1>
              <p>Manage bookings, products and WhatsApp follow-ups.</p>
            </div>

            {storeSlug ? (
              <div className="ppt-dashboard-mobile-header-action">
                <PptIconButton
                  label="View public store"
                  tone="primary"
                  onClick={() => navigate(`/${storeSlug}`)}
                >
                  <ExternalLink size={17} aria-hidden="true" />
                </PptIconButton>
              </div>
            ) : null}

            <div className="ppt-dashboard-header-actions">
              <PptButton
                type="button"
                variant="primary"
                size="md"
                rounded="pill"
                icon={<Plus size={16} aria-hidden="true" />}
                onClick={openAddProduct}
              >
                Add product
              </PptButton>
              <PptButton
                type="button"
                variant="secondary"
                size="md"
                rounded="pill"
                icon={<ExternalLink size={16} aria-hidden="true" />}
                disabled={!storeSlug}
                onClick={() => {
                  if (storeSlug) navigate(`/${storeSlug}`);
                }}
              >
                View store
              </PptButton>
              <PptButton
                type="button"
                variant="ghost"
                size="md"
                rounded="pill"
                icon={<Copy size={16} aria-hidden="true" />}
                disabled={!storeLink}
                success={copiedStoreLink}
                onClick={handleCopyStoreLink}
              >
                {copiedStoreLink ? "Copied" : "Copy link"}
              </PptButton>
            </div>
          </header>

          <div className="ppt-dashboard-content">
            <div className="ppt-dashboard-mobile-nav" aria-label="Dashboard sections">
              {mobileNavItems.map((item) => {
                const Icon = sidebarIcons[item];

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveTab(item)}
                    className={activeTab === item ? "is-active" : ""}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === "Overview" ? (
              <OverviewTab
                bookings={bookings}
                customers={customers}
                onSelectTab={setActiveTab}
                products={products}
                store={store}
                storeLink={storeLink}
                onCopyStoreLink={handleCopyStoreLink}
                copiedStoreLink={copiedStoreLink}
              />
            ) : null}

            {activeTab === "Products" ? (
              <ProductsTab
                collections={collections}
                onSelectTab={setActiveTab}
                openAddProductSignal={addProductRequest}
                onProductCreated={handleProductCreated}
                onProductRemoved={handleProductRemoved}
                onProductUpdated={handleProductUpdated}
                bookings={bookings}
                products={products}
                store={store}
                user={user}
              />
            ) : null}

            {activeTab === "Collections" ? (
              <CollectionsManager
                collections={collections}
                onAddProduct={openAddProduct}
                onCollectionsChanged={setCollections}
                onProductsChanged={setProducts}
                onViewProducts={() => setActiveTab("Products")}
                products={products}
                store={store}
                user={user}
              />
            ) : null}

            {activeTab === "Bookings" ? (
              <BookingsTab
                bookings={bookings}
                onBookingChanged={refreshProductsAndBookings}
                products={products}
                store={store}
              />
            ) : null}

            {activeTab === "Customers" ? (
              <CustomersTab
                bookings={bookings}
                customers={customers}
                products={products}
                storeLink={storeLink}
              />
            ) : null}

            {activeTab === "Store" ? (
              <StoreTab
                collections={collections}
                onTogglePublish={handleTogglePublish}
                onStoreUpdated={(updatedStore) => setStore(updatedStore)}
                products={products}
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
  copiedStoreLink,
  customers,
  onCopyStoreLink,
  onSelectTab,
  products,
  store,
  storeLink,
}: {
  bookings: CheckoutSession[];
  copiedStoreLink: boolean;
  customers: DerivedCustomerLead[];
  onCopyStoreLink: () => void;
  onSelectTab: (tab: DashboardTab) => void;
  products: Product[];
  store: Store | null;
  storeLink: string;
}) {
  const activeBookingLeads = bookings.filter((booking) =>
    !["cancelled", "released"].includes(booking.status)
  ).length;
  const verifiedBookings = bookings.filter((booking) =>
    ["booking_paid", "contacted", "remaining_paid", "confirmed", "sold"].includes(
      booking.status
    )
  ).length;
  const pendingFollowUps = bookings.filter((booking) =>
    ["booking_paid", "whatsapp_opened", "payment_pending", "contacted"].includes(
      booking.status
    )
  ).length;
  const soldBookings = bookings.filter((booking) => booking.status === "sold");
  const sellerRevenue = soldBookings.reduce(
    (total, booking) => total + getSellerCollectAmountFromBooking(booking),
    0
  );
  const recentBookings = [...bookings]
    .sort((a, b) => getTimeValue(b.createdAt) - getTimeValue(a.createdAt))
    .slice(0, 3);
  const instagramProfile = getStoreInstagramProfile(store);
  const nextAction = getNextDashboardAction({
    products,
    pendingFollowUps,
    instagramProfile,
    storeLink,
    onSelectTab,
    onCopyStoreLink,
  });

  return (
    <div className="ppt-dashboard-overview">
      <div className="ppt-dashboard-compact-grid">
        <CompactStatCard
          icon={<CalendarCheck size={16} aria-hidden="true" />}
          label="Bookings"
          value={bookings.length}
          helper={`${verifiedBookings} progressed`}
        />
        <CompactStatCard
          icon={<CreditCard size={16} aria-hidden="true" />}
          label="Total seller revenue"
          value={formatINR(sellerRevenue)}
          helper="from sold bookings"
          tone="success"
        />
        <CompactStatCard
          icon={<CheckCircle2 size={16} aria-hidden="true" />}
          label="Sold"
          value={soldBookings.length}
          helper="completed sales"
          tone="info"
        />
        <CompactStatCard
          icon={<Users size={16} aria-hidden="true" />}
          label="Customers"
          value={customers.length}
          helper={`${activeBookingLeads} active buyer bookings`}
        />
      </div>

      <NextActionCard action={nextAction} />

      <section className="ppt-dashboard-quick-card">
        <div className="ppt-dashboard-quick-head">
          <PptBadge tone="primary">Quick actions</PptBadge>
          <span>Daily seller shortcuts</span>
        </div>
        <div className="ppt-dashboard-quick-row">
          <OverviewQuickAction
            icon={<Plus size={15} aria-hidden="true" />}
            label="Add product"
            onClick={() => onSelectTab("Products")}
          />
          <OverviewQuickAction
            icon={<ExternalLink size={15} aria-hidden="true" />}
            label="View store"
            disabled={!storeLink}
            onClick={() => {
              if (storeLink) window.open(new URL(storeLink).pathname, "_self");
            }}
          />
          <OverviewQuickAction
            icon={<Copy size={15} aria-hidden="true" />}
            label={copiedStoreLink ? "Copied" : "Copy link"}
            disabled={!storeLink}
            onClick={onCopyStoreLink}
          />
          <QuickActionCard
            icon={<CalendarCheck size={20} aria-hidden="true" />}
            title="Check bookings"
            description="Follow up with buyers who booked through PayPerTap."
            action={
              <PptButton
                type="button"
                size="sm"
                variant="dark"
                onClick={() => onSelectTab("Bookings")}
              >
                Open bookings
              </PptButton>
            }
          />
        </div>
      </section>

      <CompactRecentActivity
        bookings={recentBookings}
        onSelectTab={onSelectTab}
        store={store}
      />
    </div>
  );
}

type DashboardNextAction = {
  badge: string;
  title: string;
  helper: string;
  cta: string;
  onClick: () => void;
  secondary?: {
    label: string;
    onClick: () => void;
  };
};

function getNextDashboardAction({
  instagramProfile,
  onCopyStoreLink,
  onSelectTab,
  pendingFollowUps,
  products,
  storeLink,
}: {
  instagramProfile: string;
  onCopyStoreLink: () => void;
  onSelectTab: (tab: DashboardTab) => void;
  pendingFollowUps: number;
  products: Product[];
  storeLink: string;
}): DashboardNextAction {
  if (products.length === 0) {
    return {
      badge: "Start here",
      title: "Add your first product",
      helper: "Create one bookable product before sharing your store.",
      cta: "Add product",
      onClick: () => onSelectTab("Products"),
    };
  }

  if (pendingFollowUps > 0) {
    return {
      badge: "Needs follow-up",
      title: "Follow up pending bookings",
      helper: `${pendingFollowUps} buyer${pendingFollowUps === 1 ? "" : "s"} need a WhatsApp reply.`,
      cta: "Open bookings",
      onClick: () => onSelectTab("Bookings"),
    };
  }

  if (!instagramProfile) {
    return {
      badge: "Trust signal",
      title: "Add Instagram profile",
      helper: "Visible social proof helps buyers trust your store faster.",
      cta: "Customize store",
      onClick: () => onSelectTab("Store"),
    };
  }

  return {
    badge: "Ready to share",
    title: "Share your store link",
    helper: "Send buyers your PayPerTap link instead of taking messy DM orders.",
    cta: "Copy link",
    onClick: onCopyStoreLink,
    secondary: storeLink
      ? {
          label: "View store",
          onClick: () => window.open(new URL(storeLink).pathname, "_self"),
        }
      : undefined,
  };
}

function CompactStatCard({
  helper,
  icon,
  label,
  tone = "primary",
  value,
}: {
  helper: string;
  icon: ReactNode;
  label: string;
  tone?: "primary" | "success" | "info";
  value: number | string;
}) {
  return (
    <article className={`ppt-dashboard-compact-stat is-${tone}`}>
      <div className="ppt-dashboard-compact-stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{helper}</p>
      </div>
    </article>
  );
}

function NextActionCard({ action }: { action: DashboardNextAction }) {
  return (
    <section className="ppt-dashboard-next-action">
      <div className="min-w-0">
        <PptBadge tone="primary">{action.badge}</PptBadge>
        <h2>{action.title}</h2>
        <p>{action.helper}</p>
      </div>
      <div className="ppt-dashboard-next-actions">
        <PptButton type="button" size="sm" onClick={action.onClick}>
          {action.cta}
        </PptButton>
        {action.secondary ? (
          <button type="button" onClick={action.secondary.onClick}>
            {action.secondary.label}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function OverviewQuickAction({
  disabled,
  icon,
  label,
  onClick,
}: {
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="ppt-dashboard-quick-action"
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function CompactRecentActivity({
  bookings,
  onSelectTab,
  store,
}: {
  bookings: CheckoutSession[];
  onSelectTab: (tab: DashboardTab) => void;
  store: Store | null;
}) {
  return (
    <section className="ppt-dashboard-activity-card">
      <div className="ppt-dashboard-activity-head">
        <div>
          <PptBadge tone="info">Recent activity</PptBadge>
          <h2>Latest bookings</h2>
        </div>
        <button type="button" onClick={() => onSelectTab("Bookings")}>
          View all
        </button>
      </div>

      {bookings.length === 0 ? (
        <PptEmptyState
          title="No bookings yet"
          description={`Bookings will appear here when buyers reserve with ${formatINR(20)}.`}
          icon={<CalendarCheck size={22} aria-hidden="true" />}
          className="ppt-dashboard-empty-compact"
        />
      ) : (
        <div className="ppt-dashboard-activity-list">
          {bookings.map((booking) => {
            const message = buildSellerPaymentCollectionMessage(
              checkoutToSellerMessageInput(booking, store)
            );
            const whatsappUrl = buildBookingWhatsAppUrl(booking.buyerPhone, message);

            return (
              <article className="ppt-dashboard-activity-row" key={booking.checkoutId}>
                <div className="min-w-0">
                  <strong>{booking.buyerName || "Buyer"}</strong>
                  <span>{booking.productTitle}</span>
                  <BookingVariantLine booking={booking} />
                  <small>
                    Collect {formatINR(booking.sellerCollectAmount)} - {getShortDate(booking.createdAt)}
                  </small>
                </div>
                <PptBadge
                  tone={getCheckoutStatusTone(booking.status)}
                  className="ppt-dashboard-activity-badge"
                >
                  {getStatusLabel(booking.status)}
                </PptBadge>
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <PptBrandIcon type="whatsapp" size={14} />
                  <span>WhatsApp</span>
                </a>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

type BookingTrendPoint = {
  key: string;
  label: string;
  count: number;
};

function getLastSevenDayBookingTrend(bookings: CheckoutSession[]): BookingTrendPoint[] {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - index));

    return {
      date,
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
      count: 0,
    };
  });
  const byKey = new Map(days.map((day) => [day.key, day]));

  bookings.forEach((booking) => {
    const millis = getTimeValue(booking.createdAt);
    if (!millis) return;

    const date = new Date(millis);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().slice(0, 10);
    const day = byKey.get(key);

    if (day) {
      day.count += 1;
    }
  });

  return days.map(({ key, label, count }) => ({ key, label, count }));
}

function BookingTrendCard({ trend }: { trend: BookingTrendPoint[] }) {
  const hasData = trend.some((point) => point.count > 0);
  const maxCount = Math.max(...trend.map((point) => point.count), 1);
  const width = 360;
  const height = 150;
  const points = trend.map((point, index) => {
    const x = 18 + (index * (width - 36)) / Math.max(trend.length - 1, 1);
    const y = height - 24 - (point.count / maxCount) * (height - 48);

    return { ...point, x, y };
  });
  const path = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <section className="pds-chart-card">
      <div className="pds-chart-head">
        <div>
          <strong>Booking trend</strong>
          <span>Last 7 days of real booking sessions.</span>
        </div>
        <PptBadge tone="primary">7 days</PptBadge>
      </div>

      {hasData ? (
        <div className="ppt-dashboard-chart-wrap">
          <svg className="pds-chart" viewBox={`0 0 ${width} ${height}`} role="img">
            <title>Bookings over the last seven days</title>
            <defs>
              <linearGradient id="pptBookingTrendFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(91,53,245,.20)" />
                <stop offset="100%" stopColor="rgba(91,53,245,0)" />
              </linearGradient>
            </defs>
            <polyline
              points={`${points[0].x},${height - 18} ${path} ${points[points.length - 1].x},${height - 18}`}
              fill="url(#pptBookingTrendFill)"
              stroke="none"
            />
            <polyline
              points={path}
              fill="none"
              stroke="var(--pds-primary)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
            {points.map((point) => (
              <circle
                key={point.key}
                cx={point.x}
                cy={point.y}
                fill="white"
                r="5"
                stroke="var(--pds-primary)"
                strokeWidth="3"
              />
            ))}
          </svg>
          <div className="ppt-dashboard-chart-labels">
            {points.map((point) => (
              <span key={point.key}>
                {point.label}
                <strong>{point.count}</strong>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <PptEmptyState
          title="Your booking trend will appear after your first booking."
          description="When buyers reserve products with ₹20, daily counts will show here."
          icon={<BarChart3 size={24} aria-hidden="true" />}
          className="ppt-dashboard-empty-compact"
        />
      )}
    </section>
  );
}

function StoreStatusCard({
  copiedStoreLink,
  onCopyStoreLink,
  onSelectTab,
  onTogglePublish,
  publishing,
  store,
  storeLink,
}: {
  copiedStoreLink: boolean;
  onCopyStoreLink: () => void;
  onSelectTab: (tab: DashboardTab) => void;
  onTogglePublish: () => void;
  publishing: boolean;
  store: Store | null;
  storeLink: string;
}) {
  const hasWhatsApp = normalizeIndianMobileInput(
    store?.whatsappPhone || store?.phone || ""
  ).ok;

  return (
    <section className="pds-panel ppt-dashboard-store-card">
      <div className="ppt-dashboard-section-head">
        <div>
          <PptBadge tone={store?.isPublished ? "success" : "warning"}>
            {store?.isPublished ? "Store is live" : "Store unpublished"}
          </PptBadge>
          <h2>Store status</h2>
          <p>{storeLink || "Store link will appear after setup."}</p>
        </div>
      </div>

      <div className="ppt-dashboard-status-list">
        <StatusLine
          label="Public store"
          tone={store?.isPublished ? "success" : "warning"}
          value={store?.isPublished ? "Live" : "Unpublished"}
        />
        <StatusLine label="WhatsApp" tone={hasWhatsApp ? "success" : "warning"} value={hasWhatsApp ? "Connected" : "Missing"} />
        <StatusLine label="Instagram" tone="neutral" value="Not connected yet" />
      </div>

      <div className="ppt-dashboard-card-actions">
        <PptButton
          type="button"
          variant={store?.isPublished ? "secondary" : "primary"}
          size="sm"
          loading={publishing}
          disabled={publishing || !store?.storeId}
          onClick={onTogglePublish}
        >
          {store?.isPublished ? "Unpublish store" : "Publish store"}
        </PptButton>
        <PptButton
          type="button"
          variant="ghost"
          size="sm"
          disabled={!storeLink}
          success={copiedStoreLink}
          icon={<Link2 size={15} aria-hidden="true" />}
          onClick={onCopyStoreLink}
        >
          {copiedStoreLink ? "Copied" : "Copy link"}
        </PptButton>
        <PptButton
          type="button"
          variant="ghost"
          size="sm"
          icon={<Settings size={15} aria-hidden="true" />}
          onClick={() => onSelectTab("Store")}
        >
          Store settings
        </PptButton>
      </div>
    </section>
  );
}

function StatusLine({
  label,
  tone,
  value,
}: {
  label: string;
  tone: PptTone;
  value: string;
}) {
  return (
    <div>
      <span>{label}</span>
      <PptBadge tone={tone}>{value}</PptBadge>
    </div>
  );
}

function QuickActionCard({
  action,
  description,
  icon,
  title,
}: {
  action: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <article className="ppt-dashboard-action-card">
      <div className="ppt-dashboard-action-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {action}
    </article>
  );
}

function RecentBookingsCard({
  bookings,
  onSelectTab,
  store,
}: {
  bookings: CheckoutSession[];
  onSelectTab: (tab: DashboardTab) => void;
  store: Store | null;
}) {
  return (
    <section className="pds-panel">
      <div className="ppt-dashboard-section-head">
        <div>
          <PptBadge tone="info">Recent activity</PptBadge>
          <h2>Recent bookings</h2>
          <p>Buyer reservations and WhatsApp follow-ups.</p>
        </div>
        <PptButton type="button" variant="ghost" size="sm" onClick={() => onSelectTab("Bookings")}>
          View all
        </PptButton>
      </div>

      {bookings.length === 0 ? (
        <PptEmptyState
          title="No bookings yet"
          description="Bookings will appear here when buyers reserve products with ₹20."
          icon={<CalendarCheck size={24} aria-hidden="true" />}
          className="ppt-dashboard-empty-compact"
        />
      ) : (
        <div className="ppt-dashboard-list">
          {bookings.map((booking) => {
            const message = buildSellerPaymentCollectionMessage(
              checkoutToSellerMessageInput(booking, store)
            );
            const whatsappUrl = buildBookingWhatsAppUrl(booking.buyerPhone, message);

            return (
              <article className="ppt-dashboard-row" key={booking.checkoutId}>
                <div className="ppt-dashboard-row-icon">
                  <PptBrandIcon type="whatsapp" size={18} />
                </div>
                <div className="min-w-0">
                  <strong>{booking.buyerName || "Buyer"}</strong>
                  <span>{booking.productTitle}</span>
                  <BookingVariantLine booking={booking} />
                  <small>
                    {booking.buyerPhone} · Remaining {formatINR(booking.sellerCollectAmount)}
                  </small>
                </div>
                <PptBadge tone={booking.status === "booking_paid" ? "success" : "neutral"}>
                  {booking.status === "booking_paid" ? "₹20 paid" : getStatusLabel(booking.status)}
                </PptBadge>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ppt-dashboard-row-link"
                >
                  <PptBrandIcon type="whatsapp" size={14} />
                  <span>WhatsApp</span>
                </a>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function RecentProductsCard({
  onSelectTab,
  products,
}: {
  onSelectTab: (tab: DashboardTab) => void;
  products: Product[];
}) {
  return (
    <section className="pds-panel">
      <div className="ppt-dashboard-section-head">
        <div>
          <PptBadge tone="primary">Products</PptBadge>
          <h2>Recent products</h2>
          <p>Latest drops and availability.</p>
        </div>
        <PptButton type="button" variant="ghost" size="sm" onClick={() => onSelectTab("Products")}>
          Manage
        </PptButton>
      </div>

      {products.length === 0 ? (
        <PptEmptyState
          title="No products yet"
          description="Add your first product and share your PayPerTap store link."
          icon={<PackageOpen size={24} aria-hidden="true" />}
          className="ppt-dashboard-empty-compact"
        />
      ) : (
        <div className="ppt-dashboard-list">
          {products.map((product) => {
            const imageUrl = getProductImage(product);
            const available = getAvailableQuantity(product);
            const badge = getProductStatusBadge(product, available);

            return (
              <article className="ppt-dashboard-row" key={product.productId || product.id}>
                <div className="ppt-dashboard-product-thumb">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.title}
                      decoding="async"
                      loading="lazy"
                    />
                  ) : (
                    <PackageOpen size={18} aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <strong>{product.title}</strong>
                  <span>{formatINR(product.price)}</span>
                  <small>{available > 0 ? `${available} available` : "Unavailable"}</small>
                </div>
                <PptBadge tone={badge.tone}>{badge.label}</PptBadge>
                <button
                  type="button"
                  className="ppt-dashboard-row-link"
                  onClick={() => onSelectTab("Products")}
                >
                  Edit
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function getProductStatusBadge(
  product: Product,
  availableQuantity: number
): { label: string; tone: PptTone } {
  if (product.status === "sold") return { label: "Sold", tone: "sold" };
  if (product.status === "hold") return { label: "Reserved", tone: "reserved" };
  if (product.status === "draft") return { label: "Draft", tone: "warning" };
  if (product.status === "unpublished") return { label: "Hidden", tone: "neutral" };
  if (availableQuantity === 1) return { label: "1 left", tone: "hot" };
  if (availableQuantity <= 0) {
    const label = getProductUnavailableLabel(product);
    return {
      label,
      tone: label === "Reserved" ? "reserved" : label === "Sold out" ? "sold" : "neutral",
    };
  }
  return { label: "Open", tone: "success" };
}

function getSelectedProductImageFiles(fileList: FileList | null) {
  const files = Array.from(fileList ?? []);
  assertValidImageFiles(files, MAX_PRODUCT_IMAGE_COUNT);
  return files;
}

const NO_COLLECTION_VALUE = "__no_collection__";
const LEGACY_COLLECTION_PREFIX = "__legacy__:";

function getProductCollectionLabel(product: Product): string {
  const collectionName = normalizeCollectionName(product.collectionName);
  const categoryName = normalizeCollectionName(product.categoryName);
  const category = normalizeCollectionName(product.category);

  if (collectionName) return collectionName;
  if (categoryName) return categoryName;
  if (category && !isCompatibilityCollectionName(category)) return category;

  return "";
}

function findCollectionByProduct(
  product: Product,
  collections: StoreCollection[]
): StoreCollection | undefined {
  if (product.collectionId) {
    const byId = collections.find(
      (collection) => collection.collectionId === product.collectionId
    );
    if (byId) return byId;
  }

  const collectionLabel = getCollectionNameKey(getProductCollectionLabel(product));
  return collectionLabel
    ? collections.find(
        (collection) => getCollectionNameKey(collection.name) === collectionLabel
      )
    : undefined;
}

function getInitialCollectionSelection(
  product: Product | null,
  collections: StoreCollection[]
): string {
  if (!product) return NO_COLLECTION_VALUE;

  const managedCollection = findCollectionByProduct(product, collections);
  if (managedCollection) return managedCollection.collectionId;

  const legacyLabel = getProductCollectionLabel(product);
  return legacyLabel
    ? `${LEGACY_COLLECTION_PREFIX}${legacyLabel}`
    : NO_COLLECTION_VALUE;
}

function resolveCollectionSelection(
  selection: string,
  collections: StoreCollection[]
): { collectionId: string; collectionName: string } {
  if (!selection || selection === NO_COLLECTION_VALUE) {
    return { collectionId: "", collectionName: "" };
  }

  if (selection.startsWith(LEGACY_COLLECTION_PREFIX)) {
    return {
      collectionId: "",
      collectionName: selection.slice(LEGACY_COLLECTION_PREFIX.length),
    };
  }

  const collection = collections.find(
    (item) => item.collectionId === selection
  );

  return {
    collectionId: collection?.collectionId || "",
    collectionName: collection?.name || "",
  };
}

function getCollectionProductCount(
  collection: StoreCollection,
  products: Product[]
): number {
  const collectionName = getCollectionNameKey(collection.name);

  return products.filter((product) => {
    if (product.collectionId === collection.collectionId) return true;
    return getCollectionNameKey(getProductCollectionLabel(product)) === collectionName;
  }).length;
}

function ProductVariantEditor({
  colorValues,
  hasVariants,
  onColorValuesChange,
  onHasVariantsChange,
  onSizeValuesChange,
  onVariantRowsChange,
  sizeValues,
  variantRows,
}: {
  colorValues: string;
  hasVariants: boolean;
  onColorValuesChange: (value: string) => void;
  onHasVariantsChange: (value: boolean) => void;
  onSizeValuesChange: (value: string) => void;
  onVariantRowsChange: (variants: ProductVariant[]) => void;
  sizeValues: string;
  variantRows: ProductVariant[];
}) {
  const variantOptions = getVariantOptionsFromInputs({
    sizes: sizeValues,
    colors: colorValues,
  });
  const variants = hasVariants
    ? generateVariantCombinations(variantOptions, variantRows)
    : [];
  const combinationCount = variantOptions.reduce(
    (total, option) => total * Math.max(option.values.length, 1),
    variantOptions.length ? 1 : 0
  );

  function updateVariant(
    variantId: string,
    updates: Pick<ProductVariant, "isAvailable"> | Pick<ProductVariant, "inventoryQuantity">
  ) {
    const nextVariants = variants.map((variant) =>
      variant.variantId === variantId ? { ...variant, ...updates } : variant
    );

    onVariantRowsChange(nextVariants);
  }

  return (
    <section className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <label className="flex min-w-0 items-start gap-3 text-sm font-medium text-gray-900">
        <input
          type="checkbox"
          checked={hasVariants}
          onChange={(event) => onHasVariantsChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300"
        />
        <span className="min-w-0">
          <span className="block">This product has size/color options</span>
          <span className="mt-1 block text-xs font-normal leading-5 text-gray-500">
            Keep pricing at product level. Buyers select the exact piece before booking.
          </span>
        </span>
      </label>

      {hasVariants ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-800">
              Sizes
              <input
                value={sizeValues}
                onChange={(event) => onSizeValuesChange(event.target.value)}
                placeholder="XS, S, M, L, XL"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-950"
              />
              <span className="mt-1 block text-xs leading-5 text-gray-500">
                Try XS, S, M, L, XL or 28, 30, 32, 34, 36.
              </span>
            </label>
            <label className="text-sm font-medium text-gray-800">
              Colors
              <input
                value={colorValues}
                onChange={(event) => onColorValuesChange(event.target.value)}
                placeholder="Black, Blue, Vintage blue"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-950"
              />
              <span className="mt-1 block text-xs leading-5 text-gray-500">
                Use comma-separated values. Custom names are okay.
              </span>
            </label>
          </div>

          {combinationCount > 100 ? (
            <PptNotice tone="warning" title="Too many variants">
              Please keep generated combinations under 100.
            </PptNotice>
          ) : null}

          {variants.length ? (
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <PptBadge tone="primary">{variants.length} variants</PptBadge>
                <span className="text-xs font-medium text-gray-500">
                  Mark unavailable pieces before saving. Variant quantity controls availability display only; product stock still controls reservation count.
                </span>
              </div>
              <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
                {variants.map((variant) => (
                  <div
                    key={variant.variantId}
                    className="grid min-w-0 gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_120px_120px] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-gray-950">
                        {variant.label}
                      </p>
                      <p className="mt-1 break-words text-xs text-gray-500">
                        {Object.entries(variant.options)
                          .map(([name, value]) => `${name}: ${value}`)
                          .join(" · ")}
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={variant.isAvailable !== false}
                        onChange={(event) =>
                          updateVariant(variant.variantId, {
                            isAvailable: event.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      Available
                    </label>
                    <label className="text-xs font-medium text-gray-700">
                      Display qty
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={
                          typeof variant.inventoryQuantity === "number"
                            ? String(variant.inventoryQuantity)
                            : ""
                        }
                        onChange={(event) => {
                          const value = sanitizeNonNegativeNumberInput(event.target.value);
                          updateVariant(variant.variantId, {
                            inventoryQuantity: value ? Number(value) : undefined,
                          });
                        }}
                        placeholder="Optional"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-gray-950"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs leading-5 text-gray-500">
              Add at least one size or color to generate options.
            </p>
          )}
        </>
      ) : null}
    </section>
  );
}

function ProductsTab({
  bookings,
  collections,
  onSelectTab,
  onProductRemoved,
  onProductUpdated,
  openAddProductSignal,
  products,
  user,
  store,
  onProductCreated,
}: {
  bookings: CheckoutSession[];
  collections: StoreCollection[];
  onSelectTab: (tab: DashboardTab) => void;
  openAddProductSignal: number;
  products: Product[] | null | undefined;
  user: User | null;
  store: Store | null;
  onProductCreated: (product: Product) => void;
  onProductRemoved: (productId: string) => void;
  onProductUpdated: (product: Product) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [collectionSelection, setCollectionSelection] = useState(NO_COLLECTION_VALUE);
  const [inventoryQuantity, setInventoryQuantity] = useState("1");
  const [status, setStatus] = useState<ProductStatus>("open");
  const [hasVariants, setHasVariants] = useState(false);
  const [sizeValues, setSizeValues] = useState("");
  const [colorValues, setColorValues] = useState("");
  const [variantRows, setVariantRows] = useState<ProductVariant[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageFileName, setImageFileName] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [saveProgress, setSaveProgress] = useState<ProductSaveProgress | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const addProductFormRef = useRef<HTMLFormElement>(null);
  const addProductTitleRef = useRef<HTMLInputElement>(null);
  const safeProducts = Array.isArray(products) ? products : [];

  function getProductBookingCount(product: Product): number {
    const productId = product.productId || product.id;
    return bookings.filter((booking) => booking.productId === productId).length;
  }

  async function handleProductDeleted(product: Product) {
    const productId = product.productId || product.id;

    if (!productId) return;

    const bookingCount = getProductBookingCount(product);

    if (bookingCount > 0) {
      const confirmed = window.confirm(
        `This product has ${bookingCount} booking record${bookingCount === 1 ? "" : "s"}. It will be removed from the storefront and kept in history. Continue?`
      );

      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(
        "Delete this product permanently? This cannot be undone."
      );

      if (!confirmed) return;
    }

    if (!user) {
      setError("Please sign in again to delete this product.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result = await deleteSellerProduct(user, product, {
        preserveHistory: bookingCount > 0,
      });

      if (result.deleted) {
        onProductRemoved(productId);
      } else if (result.product) {
        onProductUpdated(result.product);
      }

      if ((editingProduct?.productId || editingProduct?.id) === productId) {
        setEditingProduct(null);
      }
    } catch (err) {
      console.error("Product delete failed:", err);
      setError(err instanceof Error ? err.message : "Could not delete product.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (openAddProductSignal === 0) return;

    setEditingProduct(null);
    setShowForm(true);
  }, [openAddProductSignal]);

  useEffect(() => {
    if (!showForm) return;

    window.requestAnimationFrame(() => {
      addProductFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      addProductTitleRef.current?.focus({ preventScroll: true });
    });
  }, [showForm]);

  useEffect(() => {
    if (imageFiles.length === 0) {
      setImagePreviewUrls([]);
      return;
    }

    const objectUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(objectUrls);

    return () => objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
  }, [imageFiles]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !store?.storeId) {
      setError("Store setup is not ready yet.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");
      setSaveProgress(null);
      const selectedCollection = resolveCollectionSelection(
        collectionSelection,
        collections
      );

      const product = await createSellerProduct(user, store.storeId, {
        title,
        price: Number(price),
        description,
        category: selectedCollection.collectionName || COMPATIBILITY_COLLECTION_NAME,
        collectionId: selectedCollection.collectionId,
        collectionName: selectedCollection.collectionName,
        inventoryQuantity: Number(inventoryQuantity),
        imageFiles,
        status,
        ...getVariantPayload({
          hasVariants,
          sizeValues,
          colorValues,
          variantRows,
        }),
        onProgress: setSaveProgress,
      });

      onProductCreated(product);
      setSuccessMessage("Product saved.");
      setTitle("");
      setPrice("");
      setDescription("");
      setCollectionSelection(NO_COLLECTION_VALUE);
      setInventoryQuantity("1");
      setStatus("open");
      setHasVariants(false);
      setSizeValues("");
      setColorValues("");
      setVariantRows([]);
      setImageFiles([]);
      setImageFileName("");
      setShowForm(false);
    } catch (err) {
      console.error("Product create failed:", err);
      setError(err instanceof Error ? err.message : "Could not add product.");
    } finally {
      setSaving(false);
      setSaveProgress(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Products</h2>
            <p className="mt-1 text-sm text-gray-500">
              Add and manage the items buyers can book from your storefront.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setSuccessMessage("");
                setShowForm((isOpen) => !isOpen);
              }}
              className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white"
            >
              {showForm ? "Close product form" : "Add product"}
            </button>
            <button
              type="button"
              onClick={() => onSelectTab("Collections")}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900"
            >
              Manage collections
            </button>
          </div>
        </div>

        {showForm ? (
          <form
            ref={addProductFormRef}
            onSubmit={handleSubmit}
            className="mt-5 scroll-mt-6 grid gap-4 border-t border-gray-100 pt-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                inputRef={addProductTitleRef}
                label="Title"
                required
                value={title}
                onChange={setTitle}
              />
              <Field
                label="Price"
                min="21"
                required
                type="number"
                value={price}
                onChange={setPrice}
              />
              <p className="-mt-2 text-xs leading-5 text-gray-500 sm:col-start-2">
                Enter the full product price. Buyers book first, then pay the remaining amount directly to you.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Pieces available"
                min="1"
                required
                type="number"
                value={inventoryQuantity}
                onChange={setInventoryQuantity}
              />
              <CollectionSelect
                collections={collections}
                label="Collection"
                value={collectionSelection}
                onChange={setCollectionSelection}
              />
              <label className="text-sm font-medium text-gray-800">
                Status
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ProductStatus)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
                >
                  <option value="open">Open</option>
                  <option value="hold">Reserved</option>
                  <option value="sold">Sold</option>
                  <option value="draft">Draft</option>
                  <option value="unpublished">Unpublished</option>
                </select>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Open: buyers can book. Reserved: temporarily unavailable. Sold: no longer bookable. Draft or Unpublished: hidden from buyers.
                </p>
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

            <ProductVariantEditor
              hasVariants={hasVariants}
              onHasVariantsChange={setHasVariants}
              sizeValues={sizeValues}
              onSizeValuesChange={setSizeValues}
              colorValues={colorValues}
              onColorValuesChange={setColorValues}
              variantRows={variantRows}
              onVariantRowsChange={setVariantRows}
            />

            <div>
              <label className="text-sm font-medium text-gray-800">Images</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => {
                  try {
                    const files = getSelectedProductImageFiles(event.target.files);
                    setImageFiles(files);
                    setImageFileName(files.map((file) => file.name).join(", "));
                    setError("");
                    setSuccessMessage("");
                  } catch (err) {
                    event.target.value = "";
                    setImageFiles([]);
                    setImageFileName("");
                    setError(err instanceof Error ? err.message : "Please choose valid images.");
                  }
                }}
                className="mt-2 w-full rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-950 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
              />
              {imagePreviewUrls.length ? (
                <ProductImagePreviewGrid
                  images={imagePreviewUrls.map((imagePreviewUrl, index) => ({
                    url: imagePreviewUrl,
                    alt: `Selected product preview ${index + 1}`,
                  }))}
                  label={
                    imagePreviewUrls.length > 1
                      ? `${imagePreviewUrls.length} images selected`
                      : "1 image selected"
                  }
                />
              ) : null}
              <p className="mt-2 text-xs text-gray-500">
                {imageFileName
                  ? `${imageFileName} selected.`
                  : `JPEG, PNG, or WebP. You can upload up to ${MAX_PRODUCT_IMAGE_COUNT} images per product.`}
              </p>
            </div>

            {error ? <ErrorBox message={error} /> : null}
            {successMessage ? (
              <p className="text-sm font-medium text-emerald-700">{successMessage}</p>
            ) : null}
            {saving ? (
              <p className="text-sm font-medium text-gray-700">
                {getProductSaveStatus(saveProgress, "Saving product...")}
              </p>
            ) : null}

            <div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? getProductSaveStatus(saveProgress, "Saving product...")
                  : "Save product"}
              </button>
            </div>
          </form>
        ) : null}

        {!showForm && successMessage ? (
          <p className="mt-4 text-sm font-medium text-emerald-700">{successMessage}</p>
        ) : null}

        {editingProduct ? (
          <EditProductForm
            onCancel={() => setEditingProduct(null)}
            onSaved={(product) => {
              onProductUpdated(product);
              setSuccessMessage("Product saved.");
              setEditingProduct(null);
            }}
            onDeleted={handleProductDeleted}
            collections={collections}
            bookingCount={getProductBookingCount(editingProduct)}
            product={editingProduct}
            user={user}
          />
        ) : null}

        {!showForm && !editingProduct && error ? (
          <div className="mt-5">
            <ErrorBox message={error} />
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        {safeProducts.length === 0 ? (
          <EmptyState
            title="No products yet"
            message="Add your first product so buyers can book from your store."
          >
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setSuccessMessage("");
                setShowForm(true);
              }}
              className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white"
            >
              Add product
            </button>
            <button
              type="button"
              onClick={() => onSelectTab("Collections")}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900"
            >
              Create collection
            </button>
          </EmptyState>
        ) : (
          <div className="divide-y divide-gray-100">
            {safeProducts.map((product) => (
              <ProductRow
                key={product.id || product.productId}
                collections={collections}
                onEdit={() => {
                  setShowForm(false);
                  setSuccessMessage("");
                  setEditingProduct(product);
                }}
                onDelete={() => {
                  void handleProductDeleted(product);
                }}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CollectionSelect({
  collections,
  label,
  legacyLabel,
  onChange,
  value,
}: {
  collections: StoreCollection[];
  label: string;
  legacyLabel?: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const normalizedLegacyLabel = normalizeCollectionName(legacyLabel);
  const legacyMatchesManaged = collections.some(
    (collection) =>
      getCollectionNameKey(collection.name) === getCollectionNameKey(normalizedLegacyLabel)
  );
  const showLegacyOption =
    normalizedLegacyLabel && !legacyMatchesManaged && value.startsWith(LEGACY_COLLECTION_PREFIX);

  return (
    <div>
      <label className="text-sm font-medium text-gray-800">
        {label}
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
        >
          <option value={NO_COLLECTION_VALUE}>No collection</option>
          {showLegacyOption ? (
            <option value={`${LEGACY_COLLECTION_PREFIX}${normalizedLegacyLabel}`}>
              {normalizedLegacyLabel} (legacy)
            </option>
          ) : null}
          {collections.map((collection) => (
            <option key={collection.collectionId} value={collection.collectionId}>
              {collection.name}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-2 text-xs leading-5 text-gray-500">
        {collections.length
          ? "Optional. Collections help buyers browse your storefront."
          : "Optional. No collections yet. You can create one after saving this product."}
      </p>
    </div>
  );
}

function CollectionsManager({
  collections,
  onAddProduct,
  onCollectionsChanged,
  onProductsChanged,
  onViewProducts,
  products,
  store,
  user,
}: {
  collections: StoreCollection[];
  onAddProduct: () => void;
  onCollectionsChanged: (collections: StoreCollection[]) => void;
  onProductsChanged: (products: Product[]) => void;
  onViewProducts: () => void;
  products: Product[];
  store: Store | null;
  user: User | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingCollectionId, setEditingCollectionId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const collectionNameRef = useRef<HTMLInputElement>(null);
  const editingCollection = collections.find(
    (collection) => collection.collectionId === editingCollectionId
  );

  useEffect(() => {
    if (!editingCollection) {
      setName("");
      setDescription("");
      return;
    }

    setName(editingCollection.name);
    setDescription(editingCollection.description || "");
  }, [editingCollection]);

  function resetForm() {
    setEditingCollectionId("");
    setName("");
    setDescription("");
  }

  function focusCollectionForm() {
    collectionNameRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    collectionNameRef.current?.focus({ preventScroll: true });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!store?.storeId || !user?.uid) {
      setError("Store setup is not ready yet.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingCollection) {
        const updatedCollection = await updateStoreCollection(
          store.storeId,
          user.uid,
          editingCollection.collectionId,
          { name, description }
        );
        onCollectionsChanged(
          collections.map((collection) =>
            collection.collectionId === updatedCollection.collectionId
              ? {
                  ...collection,
                  ...updatedCollection,
                  productCount: getCollectionProductCount(
                    updatedCollection,
                    products
                  ),
                }
              : collection
          )
        );
        onProductsChanged(
          products.map((product) =>
            product.collectionId === updatedCollection.collectionId
              ? {
                  ...product,
                  category: updatedCollection.name,
                  collectionName: updatedCollection.name,
                }
              : product
          )
        );
        setSuccess("Collection updated.");
      } else {
        const createdCollection = await createStoreCollection(store.storeId, {
          name,
          description,
        });
        onCollectionsChanged(
          [...collections, { ...createdCollection, productCount: 0 }].sort(
            (a, b) => a.name.localeCompare(b.name)
          )
        );
        setSuccess("Collection created.");
      }

      resetForm();
    } catch (err) {
      console.error("Collection save failed:", err);
      setError(err instanceof Error ? err.message : "Could not save collection.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(collectionToDelete: StoreCollection) {
    if (!store?.storeId || !user?.uid) {
      setError("Store setup is not ready yet.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${collectionToDelete.name}"? Products will stay in your store and become uncategorized.`
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await deleteStoreCollection(
        store.storeId,
        user.uid,
        collectionToDelete.collectionId
      );
      onCollectionsChanged(
        collections.filter(
          (collection) => collection.collectionId !== collectionToDelete.collectionId
        )
      );
      onProductsChanged(
        products.map((product) =>
          product.collectionId === collectionToDelete.collectionId
            ? {
                ...product,
                category: COMPATIBILITY_COLLECTION_NAME,
                collectionId: "",
                collectionName: "",
              }
            : product
        )
      );
      if (editingCollectionId === collectionToDelete.collectionId) resetForm();
      setSuccess("Collection deleted. Products were not deleted.");
    } catch (err) {
      console.error("Collection delete failed:", err);
      setError(err instanceof Error ? err.message : "Could not delete collection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Collections</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            Group products into storefront sections like New Drops, Thrift, Handmade, Sale, or Accessories.
          </p>
          <p className="mt-2 text-xs leading-5 text-gray-500">
            Collections are storefront groups, not sellable products. Add price, stock, and booking status on products.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <PptBadge tone="neutral">{collections.length} managed</PptBadge>
          <button
            type="button"
            onClick={onAddProduct}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900"
          >
            Add product
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3 border-t border-gray-100 pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <Field
          inputRef={collectionNameRef}
          label="Collection name"
          placeholder="New Arrivals"
          required
          value={name}
          onChange={setName}
        />
        <Field
          label="Description"
          placeholder="Optional storefront note"
          value={description}
          onChange={setDescription}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : editingCollection
                ? "Save collection"
                : "Create collection"}
          </button>
          {editingCollection ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {error ? <ErrorBox message={error} /> : null}
      {success ? (
        <PptNotice tone="success" title="Collections updated" className="mt-3">
          {success}
        </PptNotice>
      ) : null}

      <div className="mt-5 rounded-2xl border border-gray-100">
        {collections.length === 0 ? (
          <EmptyState
            title="No collections yet"
            message="Create collections to help buyers browse your storefront faster."
          >
            <button
              type="button"
              onClick={focusCollectionForm}
              className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white"
            >
              Create collection
            </button>
            <button
              type="button"
              onClick={onAddProduct}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900"
            >
              Add product
            </button>
          </EmptyState>
        ) : (
          <div className="divide-y divide-gray-100">
            {collections.map((collection) => (
              <article
                key={collection.collectionId}
                className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-semibold text-gray-950">
                    {collection.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {collection.description || "No description"} -{" "}
                    {getCollectionProductCount(collection, products)} assigned
                    product
                    {getCollectionProductCount(collection, products) === 1
                      ? ""
                      : "s"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onViewProducts}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-900"
                  >
                    View products
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setEditingCollectionId(collection.collectionId)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleDelete(collection)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EditProductForm({
  bookingCount,
  collections,
  onDeleted,
  onCancel,
  onSaved,
  product,
  user,
}: {
  bookingCount: number;
  collections: StoreCollection[];
  onDeleted: (product: Product) => Promise<void>;
  onCancel: () => void;
  onSaved: (product: Product) => void;
  product: Product;
  user: User | null;
}) {
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description || "");
  const [collectionSelection, setCollectionSelection] = useState(
    getInitialCollectionSelection(product, collections)
  );
  const [inventoryQuantity, setInventoryQuantity] = useState(
    String(product.inventoryQuantity)
  );
  const [status, setStatus] = useState<ProductStatus>(product.status);
  const [hasVariants, setHasVariants] = useState(productHasVariants(product));
  const [sizeValues, setSizeValues] = useState(getVariantValuesInput(product, "Size"));
  const [colorValues, setColorValues] = useState(getVariantValuesInput(product, "Color"));
  const [variantRows, setVariantRows] = useState<ProductVariant[]>(
    product.variants || []
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageFileName, setImageFileName] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(
    getProductPreviewImages(product)
  );
  const [saveProgress, setSaveProgress] = useState<ProductSaveProgress | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const editFormRef = useRef<HTMLFormElement>(null);
  const editTitleRef = useRef<HTMLInputElement>(null);
  const savedImageItems = getProductPreviewImageItems(product);
  const previewImageItems =
    imageFiles.length > 0
      ? imagePreviewUrls.map((imagePreviewUrl, index) => ({
          url: imagePreviewUrl,
          alt: `Selected product preview ${index + 1}`,
        }))
      : savedImageItems;
  const previewLabel =
    imageFiles.length > 0
      ? imageFiles.length > 1
        ? `${imageFiles.length} images selected`
        : "1 image selected"
      : savedImageItems.length > 1
        ? `${savedImageItems.length} images saved`
        : savedImageItems.length === 1
          ? "1 image saved"
          : "";
  const reservedQuantity = Number(product.reservedQuantity || 0);
  const soldQuantity = Number(product.soldQuantity || 0);
  const minimumTrackedInventory = reservedQuantity + soldQuantity;
  const currentAvailableQuantity = getAvailableQuantity(product);
  const requestedInventoryQuantity = Number(inventoryQuantity || 0);
  const formAvailableQuantity = Math.max(
    0,
    requestedInventoryQuantity - reservedQuantity - soldQuantity
  );
  const openingWithoutStock = status === "open" && formAvailableQuantity <= 0;
  const needsImageReupload = productHasTemporaryImageUrls(product);

  useEffect(() => {
    if (imageFiles.length === 0) {
      setImagePreviewUrls(getProductPreviewImages(product));
      return;
    }

    const objectUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(objectUrls);

    return () => objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
  }, [imageFiles, product]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      editFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      editTitleRef.current?.focus({ preventScroll: true });
    });
  }, [product.id, product.productId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setError("Please sign in again to edit this product.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");
      setSaveProgress(null);
      const selectedCollection = resolveCollectionSelection(
        collectionSelection,
        collections
      );
      const requestedInventory = Number(inventoryQuantity);

      if (requestedInventory < minimumTrackedInventory) {
        setError("Total stock cannot be less than reserved + sold quantity.");
        return;
      }

      const updatedProduct = await updateSellerProduct(user, product, {
        title,
        price: Number(price),
        description,
        category: selectedCollection.collectionName || COMPATIBILITY_COLLECTION_NAME,
        collectionId: selectedCollection.collectionId,
        collectionName: selectedCollection.collectionName,
        inventoryQuantity: requestedInventory,
        status,
        imageFiles,
        ...getVariantPayload({
          hasVariants,
          sizeValues,
          colorValues,
          variantRows,
        }),
        onProgress: setSaveProgress,
      });

      setImageFiles([]);
      setImageFileName("");
      setSuccessMessage("Product saved.");
      onSaved(updatedProduct);
    } catch (err) {
      console.error("Product update failed:", err);
      setError(err instanceof Error ? err.message : "Could not update product.");
    } finally {
      setSaving(false);
      setSaveProgress(null);
    }
  }

  async function handleDelete() {
    try {
      setSaving(true);
      setError("");
      await onDeleted(product);
    } catch (err) {
      console.error("Product delete failed:", err);
      setError(err instanceof Error ? err.message : "Could not delete product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      ref={editFormRef}
      onSubmit={handleSubmit}
      className="mt-5 scroll-mt-6 grid gap-4 border-t border-gray-100 pt-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Edit mode
          </p>
          <h3 className="mt-1 break-words text-base font-semibold tracking-tight">
            Editing: {product.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-900"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          inputRef={editTitleRef}
          label="Title"
          required
          value={title}
          onChange={setTitle}
        />
        <Field
          label="Price"
          min="21"
          required
          type="number"
          value={price}
          onChange={setPrice}
        />
        <p className="-mt-2 text-xs leading-5 text-gray-500 sm:col-start-2">
          Enter the full product price. Buyers book first, then pay the remaining amount directly to you.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Field
            label="Total stock capacity"
            min={String(minimumTrackedInventory)}
            required
            type="number"
            value={inventoryQuantity}
            onChange={setInventoryQuantity}
          />
          <p className="mt-2 text-xs leading-5 text-gray-500">
            Available now: {formAvailableQuantity} | Reserved: {reservedQuantity} | Sold: {soldQuantity}
          </p>
        </div>
        <CollectionSelect
          collections={collections}
          label="Collection"
          legacyLabel={getProductCollectionLabel(product)}
          value={collectionSelection}
          onChange={setCollectionSelection}
        />
        <label className="text-sm font-medium text-gray-800">
          Status
          <select
            value={status}
            onChange={(event) => {
              const nextStatus = event.target.value as ProductStatus;
              setStatus(nextStatus);

              if (
                nextStatus === "open" &&
                Number(inventoryQuantity || 0) < minimumTrackedInventory
              ) {
                setInventoryQuantity(String(minimumTrackedInventory));
              }
            }}
            className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
          >
            <option value="open">Open</option>
            <option value="hold">Reserved</option>
            <option value="sold">Sold</option>
            <option value="draft">Draft</option>
            <option value="unpublished">Unpublished</option>
          </select>
          <p className="mt-2 text-xs leading-5 text-gray-500">
            Open: buyers can book. Reserved: temporarily unavailable. Sold: no longer bookable. Draft or Unpublished: hidden from buyers.
          </p>
        </label>
      </div>

      <div className="grid gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-3 sm:grid-cols-4">
        <Metric label="Available now" value={String(currentAvailableQuantity)} />
        <Metric label="Reserved" value={String(reservedQuantity)} />
        <Metric label="Sold" value={String(soldQuantity)} />
        <Metric label="Total stock" value={String(product.inventoryQuantity)} />
      </div>

      <PptNotice tone={openingWithoutStock ? "warning" : "info"} title="Stock follows reservations and sales.">
        {openingWithoutStock
          ? "This product can be Open, but public checkout will stay disabled until available stock is above zero."
          : "Public checkout uses available stock, not the original total capacity."}
      </PptNotice>

      {needsImageReupload ? (
        <PptNotice tone="warning" title="This image needs to be re-uploaded.">
          The saved image URL is temporary, so buyers will see the fallback until you replace it.
        </PptNotice>
      ) : null}

      <label className="text-sm font-medium text-gray-800">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
        />
      </label>

      <ProductVariantEditor
        hasVariants={hasVariants}
        onHasVariantsChange={setHasVariants}
        sizeValues={sizeValues}
        onSizeValuesChange={setSizeValues}
        colorValues={colorValues}
        onColorValuesChange={setColorValues}
        variantRows={variantRows}
        onVariantRowsChange={setVariantRows}
      />

      <div>
        <label className="text-sm font-medium text-gray-800">Replace images (up to 3 images max)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => {
            try {
              const files = getSelectedProductImageFiles(event.target.files);
              setImageFiles(files);
              setImageFileName(files.map((file) => file.name).join(", "));
              setError("");
              setSuccessMessage("");
            } catch (err) {
              event.target.value = "";
              setImageFiles([]);
              setImageFileName("");
              setError(err instanceof Error ? err.message : "Please choose valid images.");
            }
          }}
          className="mt-2 w-full rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-950 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        />
        <ProductImagePreviewGrid images={previewImageItems} label={previewLabel} />
        <p className="mt-2 text-xs text-gray-500">
          {imageFileName
            ? `${imageFileName} selected.`
            : savedImageItems.length
              ? "Current image will be preserved unless you choose a new one."
              : `JPEG, PNG, or WebP. You can upload up to ${MAX_PRODUCT_IMAGE_COUNT} images per product.`}
        </p>
      </div>

      {error ? <ErrorBox message={error} /> : null}
      {successMessage ? (
        <p className="text-sm font-medium text-emerald-700">{successMessage}</p>
      ) : null}
      {saving ? (
        <p className="text-sm font-medium text-gray-700">
          {getProductSaveStatus(saveProgress, "Saving changes...")}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? getProductSaveStatus(saveProgress, "Saving changes...")
            : "Save changes"}
        </button>
      </div>

      <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-900">Delete product</p>
        <p className="mt-1 text-xs leading-5 text-red-700">
          {bookingCount > 0
            ? "This product has booking history, so delete will hide it from the storefront and keep past records intact."
            : "This product has no bookings, so delete will permanently remove it."}
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="mt-3 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bookingCount > 0 ? "Remove from storefront" : "Delete product"}
        </button>
      </div>
    </form>
  );
}

function ProductRow({
  collections,
  onDelete,
  onEdit,
  product,
}: {
  collections: StoreCollection[];
  onDelete: () => void;
  onEdit: () => void;
  product: Product;
}) {
  const imageUrl = getProductImage(product);
  const productImageCount = getProductImageUrls(product).length;
  const availableQuantity = getAvailableQuantity(product);
  const badge = getProductStatusBadge(product, availableQuantity);
  const needsImageReupload = productHasTemporaryImageUrls(product);
  const managedCollection = findCollectionByProduct(product, collections);
  const collectionLabel =
    managedCollection?.name || getProductCollectionLabel(product) || "Uncategorized";

  return (
    <div className="grid min-w-0 gap-4 p-4 lg:grid-cols-[72px_minmax(0,1fr)_auto] lg:items-center">
      <div className="h-18 w-18 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            decoding="async"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-gray-400">
            Product image
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="min-w-0 break-words text-sm font-semibold text-gray-950">
            {product.title}
          </p>
          <StatusBadge label={badge.label} />
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-gray-900"
          >
            Edit product
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-700"
          >
            Delete
          </button>
        </div>
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
          <span className="max-w-full truncate rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
            {collectionLabel}
          </span>
          {needsImageReupload ? (
            <span className="max-w-full rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
              This image needs to be re-uploaded.
            </span>
          ) : null}
          {productImageCount > 1 ? (
            <span className="max-w-full rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600">
              {productImageCount} images
            </span>
          ) : null}
          {productHasVariants(product) ? (
            <span className="max-w-full rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
              {getVariantSummary(product)}
            </span>
          ) : null}
        </div>
        {product.description ? (
          <p className="mt-2 line-clamp-2 min-w-0 break-words text-xs leading-5 text-gray-500">
            {product.description}
          </p>
        ) : (
          <p className="mt-2 text-xs text-gray-400">No description</p>
        )}
        <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-4 lg:max-w-2xl">
          <Metric label="Available" value={String(availableQuantity)} />
          <Metric label="Total stock" value={String(product.inventoryQuantity)} />
          <Metric label="Reserved" value={String(product.reservedQuantity)} />
          <Metric label="Sold" value={String(product.soldQuantity)} />
        </div>
      </div>
      <div className="grid gap-2 text-sm lg:min-w-56">
        <InfoRow label="Price" value={formatINR(product.price)} />
        <InfoRow label="Advance" value={formatINR(product.bookingAdvanceAmount)} />
        <InfoRow label="Collect" value={formatINR(product.sellerCollectAmount)} />
      </div>
    </div>
  );
}

function BookingsTab({
  bookings,
  onBookingChanged,
  products,
  store,
}: {
  bookings: CheckoutSession[];
  onBookingChanged: () => Promise<void>;
  products: Product[];
  store: Store | null;
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold tracking-tight">Bookings</h2>
        <p className="mt-1 text-sm text-gray-500">
          These are buyers who booked or started booking your products. Open WhatsApp to confirm delivery and collect the remaining amount directly.
        </p>
      </div>

      <div className="space-y-3">
        {bookings.length === 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white">
            <EmptyState
              title="No bookings yet"
              message="Buyer bookings will appear here after someone starts or completes a booking."
            />
          </section>
        ) : (
          bookings.map((booking) => {
            const matchedProduct =
              products.find(
                (product) =>
                  (product.productId || product.id) === booking.productId
              ) || null;

            return (
              <BookingCard
                key={booking.checkoutId}
                booking={booking}
                onBookingChanged={onBookingChanged}
                product={matchedProduct}
                store={store}
              />
            );
          })
        )}
      </div>
    </section>
  );
}

function BookingCard({
  booking,
  onBookingChanged,
  product,
  store,
}: {
  booking: CheckoutSession;
  onBookingChanged: () => Promise<void>;
  product: Product | null;
  store: Store | null;
}) {
  const [copied, setCopied] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState(false);
  const [savingAction, setSavingAction] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState<
    "cancelled" | "sold" | null
  >(null);
  const [actionError, setActionError] = useState("");
  const [labelError, setLabelError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<CheckoutSession["status"] | "">(
    booking.status || ""
  );
  const sellerMessageInput = checkoutToSellerMessageInput(booking, store);
  const message = buildSellerPaymentCollectionMessage(sellerMessageInput);
  const deliveryMessage = buildDeliveryDetailsMessage(sellerMessageInput);
  const confirmedMessage = buildOrderConfirmedMessage(sellerMessageInput);
  const whatsappUrl = buildBookingWhatsAppUrl(booking.buyerPhone, message);
  const deliveryWhatsappUrl = buildBookingWhatsAppUrl(booking.buyerPhone, deliveryMessage);
  const confirmedWhatsappUrl = buildBookingWhatsAppUrl(booking.buyerPhone, confirmedMessage);
  const sellerUpiId = getSellerUpiId(store);

  useEffect(() => {
    setSelectedStatus(booking.status || "");
  }, [booking.checkoutId, booking.status]);

  async function handleCopy() {
    await copyText(message);
    setCopied(true);
  }

  async function handleDownloadLabel() {
    if (!store) {
      setLabelError("Store details are required to generate a label.");
      return;
    }

    try {
      setGeneratingLabel(true);
      setLabelError("");
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "https://paypertap.in";
      const labelData = buildBookingLabelData({
        booking,
        store,
        product,
        origin,
      });
      const { downloadBookingLabelPdf } = await import("../lib/labelPdf");

      await downloadBookingLabelPdf(labelData);
    } catch (err) {
      setLabelError(err instanceof Error ? err.message : "Could not generate label.");
    } finally {
      setGeneratingLabel(false);
    }
  }

  async function runBookingAction(
    nextStatus: CheckoutSession["status"],
    action: () => Promise<void>
  ): Promise<boolean> {
    const previousStatus = selectedStatus;

    try {
      setSavingAction(nextStatus);
      setSelectedStatus(nextStatus);
      setActionError("");
      await action();
      await onBookingChanged();
      return true;
    } catch (err) {
      console.error("Booking action failed:", err);
      setSelectedStatus(previousStatus);
      setActionError(err instanceof Error ? err.message : "Could not update booking.");
      return false;
    } finally {
      setSavingAction("");
    }
  }

  async function handleConfirmBookingAction() {
    if (savingAction) return;

    if (pendingConfirmation === "cancelled") {
      const succeeded = await runBookingAction("cancelled", () =>
        markBookingCancelled(booking.checkoutId)
      );
      if (succeeded) setPendingConfirmation(null);
      return;
    }

    if (pendingConfirmation === "sold") {
      const succeeded = await runBookingAction("sold", () =>
        markBookingSold(booking.checkoutId)
      );
      if (succeeded) setPendingConfirmation(null);
    }
  }

  const confirmationContent =
    pendingConfirmation === "cancelled"
      ? {
          title: "Cancel booking?",
          description:
            "This will release the reserved stock and make the product available again.",
          detail:
            "Use this only when the buyer did not complete confirmation or the order should not continue.",
          confirmLabel: "Cancel booking",
          cancelLabel: "Keep booking",
          loadingLabel: "Cancelling...",
          variant: "danger" as const,
        }
      : pendingConfirmation === "sold"
        ? {
            title: "Mark item sold?",
            description: "This will move 1 reserved unit to sold inventory.",
            detail: "Use this only after the order is confirmed/completed with the buyer.",
            confirmLabel: "Mark sold",
            cancelLabel: "Go back",
            loadingLabel: "Marking sold...",
            variant: "default" as const,
          }
        : null;

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-base font-semibold tracking-tight text-gray-950">
              {booking.productTitle}
            </h3>
            <PptBadge tone={getCheckoutStatusTone(booking.status)}>
              {getStatusLabel(booking.status)}
            </PptBadge>
          </div>
          <p className="mt-2 break-words text-sm text-gray-600">
            {booking.buyerName} - {booking.buyerPhone}
          </p>
          <BookingVariantLine booking={booking} />
          <p className="mt-1 text-xs text-gray-500">
            {booking.buyerCity} {booking.buyerPincode} - Created {formatDate(booking.createdAt)}
          </p>
        </div>
        <div className="grid gap-2 sm:min-w-64">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="pds-button pds-button-whatsapp pds-button-md pds-button-rounded-lg is-full"
          >
            <PptBrandIcon type="whatsapp" size={17} />
            <span>Open WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={handleDownloadLabel}
            disabled={generatingLabel || Boolean(savingAction)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:border-gray-950 disabled:opacity-50"
          >
            <Download size={15} aria-hidden="true" />
            <span>{generatingLabel ? "Generating label..." : "Download Label"}</span>
          </button>
          <div className="grid gap-2">
            <span className="text-xs font-medium text-gray-500">Update status</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActionError("");
                  setPendingConfirmation("cancelled");
                }}
                disabled={Boolean(savingAction)}
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition hover:border-gray-950 disabled:opacity-50"
              >
                Cancelled
              </button>
              <button
                type="button"
                onClick={() => {
                  setActionError("");
                  setPendingConfirmation("sold");
                }}
                disabled={Boolean(savingAction)}
                className="rounded-xl bg-gray-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                Sold
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <Metric label="Product price" value={formatINR(booking.productPrice)} />
        {getVariantDetailsText(booking) ? (
          <Metric label="Variant" value={getVariantDetailsText(booking)} />
        ) : null}
        <Metric label="PayPerTap booking fee" value={formatINR(booking.bookingAdvanceAmount)} />
        <Metric label="Collect from buyer" value={formatINR(booking.sellerCollectAmount)} />
      </div>

      <details className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-gray-800">
          <span>Details and messages</span>
          <MoreVertical size={16} aria-hidden="true" />
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={Boolean(savingAction) || booking.status === "sold"}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 disabled:opacity-50"
          >
            {copied ? "Message copied" : "Copy follow-up message"}
          </button>
          <a
            href={deliveryWhatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900"
          >
            <PptBrandIcon type="whatsapp" size={15} />
            <span>Delivery details</span>
          </a>
          <a
            href={confirmedWhatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900"
          >
            <PptBrandIcon type="whatsapp" size={15} />
            <span>Order confirmed</span>
          </a>
          <Metric label="Buyer opened WhatsApp" value={booking.whatsappOpened ? "Yes" : "No"} />
        </div>
      </details>
      {!sellerUpiId ? (
        <p className="mt-3 text-xs leading-5 text-amber-700">
          Add your UPI ID in Store settings later to auto-fill payment messages.
        </p>
      ) : null}
      {labelError ? <ErrorBox message={labelError} /> : null}
      {actionError ? <ErrorBox message={actionError} /> : null}
      {confirmationContent ? (
        <ConfirmActionModal
          open={Boolean(pendingConfirmation)}
          title={confirmationContent.title}
          description={confirmationContent.description}
          detail={confirmationContent.detail}
          confirmLabel={confirmationContent.confirmLabel}
          cancelLabel={confirmationContent.cancelLabel}
          loadingLabel={confirmationContent.loadingLabel}
          variant={confirmationContent.variant}
          loading={Boolean(savingAction)}
          errorMessage={actionError}
          onCancel={() => setPendingConfirmation(null)}
          onConfirm={() => void handleConfirmBookingAction()}
        />
      ) : null}
    </article>
  );
}

type ConfirmActionModalProps = {
  cancelLabel: string;
  confirmLabel: string;
  description: string;
  detail: string;
  errorMessage?: string;
  loading: boolean;
  loadingLabel: string;
  open: boolean;
  title: string;
  variant?: "danger" | "default";
  onCancel: () => void;
  onConfirm: () => void;
};

function ConfirmActionModal({
  cancelLabel,
  confirmLabel,
  description,
  detail,
  errorMessage,
  loading,
  loadingLabel,
  open,
  title,
  variant = "default",
  onCancel,
  onConfirm,
}: ConfirmActionModalProps) {
  const titleId = useId();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const isDanger = variant === "danger";

  useEffect(() => {
    if (!open) return;

    confirmButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [loading, onCancel, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-gray-950/45 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (!loading && event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
              isDanger
                ? "border-red-100 bg-red-50 text-red-700"
                : "border-gray-200 bg-gray-50 text-gray-950"
            }`}
          >
            {isDanger ? (
              <AlertTriangle size={21} aria-hidden="true" />
            ) : (
              <CheckCircle2 size={21} aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <h3 id={titleId} className="text-lg font-semibold tracking-tight text-gray-950">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-700">{description}</p>
            <p className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-500">
              {detail}
            </p>
          </div>
        </div>

        {errorMessage ? <ErrorBox message={errorMessage} /> : null}

        <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto] sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-gray-950 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-32"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-32 ${
              isDanger ? "bg-red-600 hover:bg-red-700" : "bg-gray-950 hover:bg-gray-800"
            }`}
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function CustomersTab({
  bookings,
  customers,
  products,
  storeLink,
}: {
  bookings: CheckoutSession[];
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
        <h2 className="text-lg font-semibold tracking-tight">Buyer contacts</h2>
        <p className="mt-1 text-sm text-gray-500">
          View people who booked or shared details through your store. Use this list to follow up on WhatsApp, confirm orders, or message previous buyers.
        </p>
        <p className="mt-2 text-xs leading-5 text-gray-500">
          Buyer details are shown here only to help you confirm bookings and follow up on orders.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        {customers.length === 0 ? (
          <EmptyState title="No buyer contacts yet" message="Buyer details will appear here after your first booking." />
        ) : (
          <div className="divide-y divide-gray-100">
            {customers.map((customer) => (
              <CustomerRow
                bookings={bookings.filter((booking) => {
                  const bookingPhone = booking.buyerPhone.replace(/[^\d]/g, "");
                  const customerPhone = customer.buyerPhone.replace(/[^\d]/g, "");
                  return bookingPhone === customerPhone;
                })}
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
  bookings,
  customer,
  products,
  storeLink,
}: {
  bookings: CheckoutSession[];
  customer: DerivedCustomerLead;
  products: Product[];
  storeLink: string;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
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
    <div className="p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-950">{customer.buyerName}</p>
            <PptBadge tone={getCheckoutStatusTone(customer.lastBookingStatus)}>
              {getStatusLabel(customer.lastBookingStatus)}
            </PptBadge>
          </div>
          <p className="mt-1 break-words text-xs text-gray-500">
            {customer.buyerPhone}
            {customer.buyerCity ? ` - ${customer.buyerCity}` : ""}
            {customer.buyerPincode ? ` ${customer.buyerPincode}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            <span>{customer.totalBookings} booking{customer.totalBookings === 1 ? "" : "s"}</span>
            <span>Last: {customer.lastProductTitle}</span>
            {getVariantDetailsText({
              selectedVariantLabel: customer.lastVariantLabel,
              selectedVariantOptions: customer.lastVariantOptions,
            }) ? (
              <span>
                {getVariantDetailsText({
                  selectedVariantLabel: customer.lastVariantLabel,
                  selectedVariantOptions: customer.lastVariantOptions,
                })}
              </span>
            ) : null}
            <span>{getShortDate(customer.lastCreatedAt)}</span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-72">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="pds-button pds-button-whatsapp pds-button-md pds-button-rounded-lg is-full"
        >
          <PptBrandIcon type="whatsapp" size={17} />
          <span>Open WhatsApp</span>
        </a>
        <button
          type="button"
          onClick={() => setExpanded((isOpen) => !isOpen)}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900"
        >
          {expanded ? "Hide details" : "View details"}
        </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Phone" value={customer.buyerPhone} />
            <Metric label="Email" value={bookings.find((booking) => booking.buyerEmail)?.buyerEmail || "Not shared"} />
            <Metric label="Full address" value={bookings[0]?.buyerAddress || "Not shared"} />
            <Metric label="Total bookings" value={String(customer.totalBookings)} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Bookings</p>
            <div className="mt-2 grid gap-2">
              {bookings.map((booking) => (
                <div
                  key={booking.checkoutId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white p-3 text-sm"
                >
                  <span className="font-medium text-gray-950">{booking.productTitle}</span>
                  <BookingVariantLine booking={booking} />
                  <span className="text-xs text-gray-500">{formatDate(booking.createdAt)}</span>
                  <PptBadge tone={getCheckoutStatusTone(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </PptBadge>
                </div>
              ))}
            </div>
          </div>

          <label className="block text-xs font-medium text-gray-600">
            Message with product
            <select
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-950"
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

          <button
            type="button"
            onClick={handleCopy}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 sm:w-fit"
          >
            {copied ? "New drop message copied" : "Copy new drop message"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function StoreTab({
  collections,
  products,
  store,
  storeSlug,
  storeLink,
  publishing,
  onTogglePublish,
  onStoreUpdated,
}: {
  collections: StoreCollection[];
  products: Product[];
  store: Store | null;
  storeSlug: string;
  storeLink: string;
  publishing: boolean;
  onTogglePublish: () => void;
  onStoreUpdated: (store: Store) => void;
}) {
  const [storeName, setStoreName] = useState(store?.storeName || "");
  const [bio, setBio] = useState(store?.bio || "");
  const [whatsappPhone, setWhatsappPhone] = useState(store?.whatsappPhone || store?.phone || "");
  const [instagramProfile, setInstagramProfile] = useState(getStoreInstagramProfile(store));
  const [ownerName, setOwnerName] = useState(store?.ownerName || "");
  const [supportEmail, setSupportEmail] = useState(store?.supportEmail || "");
  const [supportPhone, setSupportPhone] = useState(store?.supportPhone || "");
  const [returnsPolicyType, setReturnsPolicyType] = useState<
    NonNullable<Store["returnsPolicyType"]>
  >(store?.returnsPolicyType || "exchange_only");
  const [returnsPolicyNotes, setReturnsPolicyNotes] = useState(
    store?.returnsPolicyNotes || ""
  );
  const [confirmationAdvanceType, setConfirmationAdvanceType] =
    useState<SellerConfirmationAdvanceType>(
      store?.sellerConfirmationAdvanceType || "paypertap_only"
    );
  const [confirmationFixedAmount, setConfirmationFixedAmount] = useState(
    store?.sellerConfirmationAdvanceFixedAmount
      ? String(store.sellerConfirmationAdvanceFixedAmount)
      : ""
  );
  const [confirmationPercent, setConfirmationPercent] = useState(
    store?.sellerConfirmationAdvancePercent
      ? String(store.sellerConfirmationAdvancePercent)
      : ""
  );
  const [heroHeading, setHeroHeading] = useState(store?.heroTitle || store?.heroHeading || "");
  const [heroSubtitle, setHeroSubtitle] = useState(store?.heroSubtitle || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoFileName, setLogoFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [whatsappPhoneError, setWhatsappPhoneError] = useState("");
  const [previewThemeId, setPreviewThemeId] = useState<StorefrontThemeId | null>(null);
  const [themeSavingId, setThemeSavingId] = useState<StorefrontThemeId | null>(null);
  const [themeSavedMessage, setThemeSavedMessage] = useState("");
  const [themeError, setThemeError] = useState("");
  const selectedThemeId = getSelectedStorefrontThemeId(store);
  const draftFixedAmount =
    confirmationAdvanceType === "fixed"
      ? Math.max(20, Math.round(Number(confirmationFixedAmount) || 20))
      : null;
  const draftPercent =
    confirmationAdvanceType === "percentage"
      ? Math.max(1, Math.round(Number(confirmationPercent) || 0))
      : null;
  const draftStore: Store | null = store
    ? {
        ...store,
        storeName,
        bio,
        whatsappPhone,
        phone: whatsappPhone,
        instagramProfile,
        ownerName,
        supportEmail,
        supportPhone,
        returnsPolicyType,
        returnsPolicyNotes,
        sellerConfirmationAdvanceType: confirmationAdvanceType,
        sellerConfirmationAdvanceFixedAmount: draftFixedAmount,
        sellerConfirmationAdvancePercent: draftPercent,
        heroTitle: heroHeading,
        heroSubtitle,
      }
    : null;
  const safeLogoUrl = getStoreLogoUrl(draftStore || store);
  const confirmationPolicyText = getStorefrontConfirmationPolicyText(draftStore || store);

  useEffect(() => {
    setStoreName(store?.storeName || "");
    setBio(store?.bio || "");
    setWhatsappPhone(store?.whatsappPhone || store?.phone || "");
    setInstagramProfile(getStoreInstagramProfile(store));
    setOwnerName(store?.ownerName || "");
    setSupportEmail(store?.supportEmail || "");
    setSupportPhone(store?.supportPhone || "");
    setReturnsPolicyType(store?.returnsPolicyType || "exchange_only");
    setReturnsPolicyNotes(store?.returnsPolicyNotes || "");
    setConfirmationAdvanceType(store?.sellerConfirmationAdvanceType || "paypertap_only");
    setConfirmationFixedAmount(
      store?.sellerConfirmationAdvanceFixedAmount
        ? String(store.sellerConfirmationAdvanceFixedAmount)
        : ""
    );
    setConfirmationPercent(
      store?.sellerConfirmationAdvancePercent
        ? String(store.sellerConfirmationAdvancePercent)
        : ""
    );
    setHeroHeading(store?.heroTitle || store?.heroHeading || "");
    setHeroSubtitle(store?.heroSubtitle || "");
    setWhatsappPhoneError("");
  }, [store]);

  async function handleSaveStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!store?.storeId) return;

    try {
      setSaving(true);
      setSaved(false);
      setError("");
      setWhatsappPhoneError("");

      const normalizedWhatsappPhone = normalizeIndianMobileInput(whatsappPhone);

      if (!normalizedWhatsappPhone.ok || !normalizedWhatsappPhone.localNumber) {
        const message =
          normalizedWhatsappPhone.error ||
          "Please enter a valid 10-digit Indian WhatsApp number.";
        setWhatsappPhoneError(message);
        throw new Error(message);
      }

      setWhatsappPhone(normalizedWhatsappPhone.localNumber);
      const fixedAmount = Math.round(Number(confirmationFixedAmount) || 0);
      const percent = Math.round(Number(confirmationPercent) || 0);

      if (confirmationAdvanceType === "fixed" && fixedAmount < 20) {
        throw new Error("Fixed confirmation amount must be at least ₹20.");
      }

      if (confirmationAdvanceType === "percentage" && percent <= 0) {
        throw new Error("Confirmation percentage must be greater than 0.");
      }

      let uploadedLogo: { url: string; key: string } | null = null;
      if (logoFile) {
        uploadedLogo = await uploadImageToR2(logoFile, "stores");
      }

      const updatedFields = await updateStoreCustomization(store.storeId, {
        storeName,
        bio,
        whatsappPhone: normalizedWhatsappPhone.localNumber,
        phone: normalizedWhatsappPhone.localNumber,
        instagramProfile,
        ownerName,
        supportEmail,
        supportPhone,
        returnsPolicyType,
        returnsPolicyNotes,
        sellerConfirmationAdvanceType: confirmationAdvanceType,
        sellerConfirmationAdvanceFixedAmount: fixedAmount,
        sellerConfirmationAdvancePercent: percent,
        heroHeading,
        heroSubtitle,
        logoUrl: uploadedLogo?.url,
      });

      if (
        updatedFields.sellerConfirmationAdvanceType !== confirmationAdvanceType ||
        (confirmationAdvanceType === "fixed" &&
          Number(updatedFields.sellerConfirmationAdvanceFixedAmount) !== fixedAmount) ||
        (confirmationAdvanceType === "percentage" &&
          Number(updatedFields.sellerConfirmationAdvancePercent) !== percent)
      ) {
        throw new Error("Store saved, but confirmation advance did not persist. Please try again.");
      }

      onStoreUpdated(updatedFields);
      setLogoFile(null);
      setLogoFileName("");
      setSaved(true);
    } catch (err) {
      console.error("Store customization update failed:", err);
      setError(err instanceof Error ? err.message : "Could not save store settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleApplyTheme(themeId: StorefrontThemeId) {
    if (!store?.storeId || !isStorefrontThemeId(themeId)) return;

    try {
      setThemeSavingId(themeId);
      setThemeSavedMessage("");
      setThemeError("");

      const updatedFields = await updateStoreTheme(store.storeId, themeId);

      onStoreUpdated({
        ...store,
        ...updatedFields,
      });
      setPreviewThemeId(null);
      setThemeSavedMessage("Theme applied. Your public storefront will use it now.");
    } catch (err) {
      console.error("Theme update failed:", err);
      setThemeError(err instanceof Error ? err.message : "Could not apply this theme.");
    } finally {
      setThemeSavingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <form onSubmit={handleSaveStore} className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Store</h2>
            <p className="mt-1 text-sm text-gray-500">Customize your public storefront and trust signals.</p>
          </div>
          <div className="grid gap-2 sm:flex sm:items-center">
            <PptButton
              type="button"
              variant={store?.isPublished ? "secondary" : "primary"}
              onClick={onTogglePublish}
              disabled={publishing || !store?.storeId}
            >
              {publishing ? "Saving..." : store?.isPublished ? "Unpublish store" : "Publish store"}
            </PptButton>
            <PptButton type="submit" loading={saving} success={saved} disabled={!store?.storeId || saving}>
              {saved ? "Saved" : "Save changes"}
            </PptButton>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="h-32 w-32 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              {safeLogoUrl ? (
                <img
                  src={safeLogoUrl}
                  alt={store.storeName}
                  decoding="async"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-400">
                  Store logo
                </div>
              )}
            </div>
            <label className="mt-4 block text-xs font-medium text-gray-600">
              Logo upload
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  try {
                    const file = event.target.files?.[0] || null;
                    if (file) assertValidImageFile(file);
                    setLogoFile(file);
                    setLogoFileName(file?.name || "");
                    setError("");
                  } catch (err) {
                    event.target.value = "";
                    setLogoFile(null);
                    setLogoFileName("");
                    setError(err instanceof Error ? err.message : "Please choose a valid logo image.");
                  }
                }}
                className="mt-2 w-full rounded-xl border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-600 file:mr-2 file:rounded-lg file:border-0 file:bg-gray-950 file:px-2 file:py-1 file:text-xs file:font-medium file:text-white"
              />
            </label>
            <p className="mt-2 text-xs text-gray-500">
              {logoFileName || "JPEG, PNG, or WebP. We'll optimize your image automatically."}
            </p>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gray-950 text-sm font-semibold text-white">
                  {safeLogoUrl ? (
                    <img
                      src={safeLogoUrl}
                      alt=""
                      decoding="async"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <StoreIcon size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-950">{storeName || "Store name"}</p>
                  <p className="line-clamp-1 text-xs text-gray-500">{bio || "Store tagline"}</p>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-gray-950">
                {heroHeading || "Fresh drops are live"}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                {heroSubtitle || confirmationPolicyText}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <PptBadge tone={store?.isPublished ? "success" : "warning"}>
                  {store?.isPublished ? "Live" : "Unpublished"}
                </PptBadge>
                {instagramProfile ? (
                  <PptBadge tone="instagram" icon={<PptBrandIcon type="instagram" size={13} />}>
                    Instagram
                  </PptBadge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Store name" value={storeName} onChange={setStoreName} required />
              <Field
                label="WhatsApp number"
                value={whatsappPhone}
                onChange={(value) => {
                  setWhatsappPhone(value);
                  setWhatsappPhoneError("");
                }}
                onBlur={() => {
                  if (!whatsappPhone.trim()) return;
                  const normalizedWhatsappPhone = normalizeIndianMobileInput(whatsappPhone);
                  if (normalizedWhatsappPhone.ok && normalizedWhatsappPhone.localNumber) {
                    setWhatsappPhone(normalizedWhatsappPhone.localNumber);
                    setWhatsappPhoneError("");
                  } else {
                    setWhatsappPhoneError(
                      normalizedWhatsappPhone.error ||
                        "Please enter a valid 10-digit Indian WhatsApp number."
                    );
                  }
                }}
                placeholder="Enter 10-digit WhatsApp number"
                helper="Only enter your 10-digit Indian WhatsApp number. Example: 7067508872"
                error={whatsappPhoneError}
                type="tel"
                inputMode="numeric"
                maxLength={16}
              />
            </div>
            <Field label="Tagline / bio" value={bio} onChange={setBio} />
            <Field
              label="Instagram profile"
              value={instagramProfile}
              onChange={setInstagramProfile}
              placeholder="https://instagram.com/yourstore or @yourstore"
            />
            <SellerConfirmationAdvancePanel
              fixedAmount={confirmationFixedAmount}
              onFixedAmountChange={setConfirmationFixedAmount}
              onPercentChange={setConfirmationPercent}
              onTypeChange={setConfirmationAdvanceType}
              percent={confirmationPercent}
              type={confirmationAdvanceType}
            />
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-gray-950">
                  Contact and storefront policies
                </h3>
                <p className="text-xs leading-5 text-gray-500">
                  We'll generate a simple storefront policy from this. You can edit detailed policy text later.
                </p>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Store owner/contact name"
                  value={ownerName}
                  onChange={setOwnerName}
                  placeholder="Aditya"
                />
                <Field
                  label="Support email"
                  value={supportEmail}
                  onChange={setSupportEmail}
                  placeholder="support@yourstore.com"
                />
                <Field
                  label="Support phone"
                  value={supportPhone}
                  onChange={setSupportPhone}
                  placeholder={whatsappPhone || "Defaults to WhatsApp number"}
                />
                <label className="text-sm font-medium text-gray-800">
                  Returns policy
                  <select
                    value={returnsPolicyType}
                    onChange={(event) =>
                      setReturnsPolicyType(
                        event.target.value as NonNullable<Store["returnsPolicyType"]>
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-950"
                  >
                    <option value="returns_accepted">Accept returns</option>
                    <option value="exchange_only">Exchange only</option>
                    <option value="no_returns">No returns</option>
                  </select>
                </label>
              </div>
              <label className="mt-4 block text-sm font-medium text-gray-800">
                Returns policy notes
                <textarea
                  value={returnsPolicyNotes}
                  onChange={(event) => setReturnsPolicyNotes(event.target.value)}
                  placeholder="Optional note buyers should know before booking"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-950"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hero heading" value={heroHeading} onChange={setHeroHeading} placeholder="Fresh drops are live" />
              <Field label="Hero subtitle" value={heroSubtitle} onChange={setHeroSubtitle} placeholder="Reserve with ₹20. Confirm the rest on WhatsApp." />
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <InfoRow label="Store link name" value={storeSlug || "Not set"} />
              <InfoRow label="Public link" value={storeLink || "Not set"} />
              <InfoRow label="Booking fee" value={formatINR(store?.bookingAdvanceAmount || 20)} />
              <InfoRow
                label="Confirmation advance"
                value={
                  confirmationAdvanceType === "fixed"
                    ? `Fixed ${formatINR(Number(confirmationFixedAmount) || 20)}`
                    : confirmationAdvanceType === "percentage"
                      ? `${Number(confirmationPercent) || 0}% of product price`
                      : "Only ₹20 PayPerTap booking"
                }
              />
              <InfoRow label="Theme" value={storefrontThemeRegistry[selectedThemeId].name} />
            </div>
            <p className="text-xs leading-5 text-gray-500">
              This becomes your public store link, for example paypertap.in/your-store-name.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          Buyers pay ₹20 booking via PayPerTap. If you set an extra confirmation advance, the buyer pays that extra amount directly to you on WhatsApp/UPI/COD.
        </div>
        {error ? <ErrorBox message={error} /> : null}
      </form>

      <ThemeSelector
        collections={collections}
        currentThemeId={selectedThemeId}
        error={themeError}
        onApplyTheme={handleApplyTheme}
        onPreviewTheme={setPreviewThemeId}
        products={products}
        savingThemeId={themeSavingId}
        store={draftStore}
        storeSlug={storeSlug}
        successMessage={themeSavedMessage}
      />

      {previewThemeId && draftStore ? (
        <ThemePreviewModal
          onApply={() => handleApplyTheme(previewThemeId)}
          onClose={() => setPreviewThemeId(null)}
          products={products}
          collections={collections}
          saving={themeSavingId === previewThemeId}
          store={draftStore}
          storeSlug={storeSlug}
          themeId={previewThemeId}
        />
      ) : null}

      <QuickReplies />
    </section>
  );
}

function SellerConfirmationAdvancePanel({
  fixedAmount,
  onFixedAmountChange,
  onPercentChange,
  onTypeChange,
  percent,
  type,
}: {
  fixedAmount: string;
  onFixedAmountChange: (value: string) => void;
  onPercentChange: (value: string) => void;
  onTypeChange: (value: SellerConfirmationAdvanceType) => void;
  percent: string;
  type: SellerConfirmationAdvanceType;
}) {
  const fixedValue = Number(fixedAmount) || 0;
  const percentValue = Number(percent) || 0;
  const showHighWarning =
    (type === "fixed" && fixedValue >= 1000) ||
    (type === "percentage" && percentValue > 50);

  return (
    <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-950">
        How much advance do you usually collect before confirming an order?
      </h3>
      <div className="mt-4 grid gap-3">
        <DashboardAdvanceOption
          checked={type === "paypertap_only"}
          label="Only ₹20 PayPerTap booking"
          description="Buyer pays ₹20 to reserve the product. You collect the rest directly on WhatsApp."
          onChange={() => onTypeChange("paypertap_only")}
        />
        <DashboardAdvanceOption
          checked={type === "fixed"}
          label="Fixed confirmation amount"
          description="Example: ₹100, ₹150, ₹200 total advance before final confirmation."
          onChange={() => onTypeChange("fixed")}
        />
        {type === "fixed" ? (
          <Field
            label="Total confirmation advance"
            type="number"
            min="20"
            inputMode="numeric"
            value={fixedAmount}
            onChange={(value) => onFixedAmountChange(sanitizeNonNegativeNumberInput(value))}
            placeholder="150"
          />
        ) : null}
        <DashboardAdvanceOption
          checked={type === "percentage"}
          label="Percentage of product price"
          description="Example: 10%, 20%, 30% of product price as total advance."
          onChange={() => onTypeChange("percentage")}
        />
        {type === "percentage" ? (
          <Field
            label="Total confirmation advance percentage"
            type="number"
            min="1"
            inputMode="numeric"
            value={percent}
            onChange={(value) => onPercentChange(sanitizeNonNegativeNumberInput(value))}
            placeholder="10"
          />
        ) : null}
      </div>
      <p className="mt-4 text-xs leading-5 text-gray-500">
        Higher advance can improve buyer commitment, but it may also reduce bookings. We recommend keeping it reasonable for faster confirmations.
      </p>
      {showHighWarning ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium leading-5 text-amber-800">
          High advance may reduce buyer conversions.
        </p>
      ) : null}
    </section>
  );
}

function DashboardAdvanceOption({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-3">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 shrink-0 accent-gray-950"
      />
      <span>
        <strong className="block text-sm text-gray-950">{label}</strong>
        <span className="mt-1 block text-xs leading-5 text-gray-500">
          {description}
        </span>
      </span>
    </label>
  );
}

function ThemeSelector({
  collections,
  currentThemeId,
  error,
  onApplyTheme,
  onPreviewTheme,
  products,
  savingThemeId,
  store,
  storeSlug,
  successMessage,
}: {
  collections: StoreCollection[];
  currentThemeId: StorefrontThemeId;
  error: string;
  onApplyTheme: (themeId: StorefrontThemeId) => void;
  onPreviewTheme: (themeId: StorefrontThemeId) => void;
  products: Product[];
  savingThemeId: StorefrontThemeId | null;
  store: Store | null;
  storeSlug: string;
  successMessage: string;
}) {
  const themes = Object.values(storefrontThemeRegistry);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Store theme</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            Preview your storefront themes and apply the one that fits your brand.
          </p>
        </div>
        <PptBadge tone="primary">
          Current: {storefrontThemeRegistry[currentThemeId].previewLabel}
        </PptBadge>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {themes.map((theme) => {
          const isSelected = theme.id === currentThemeId;
          const isSaving = savingThemeId === theme.id;

          return (
            <article
              key={theme.id}
              className={`flex min-w-0 flex-col rounded-2xl border p-4 ${
                isSelected
                  ? "border-gray-950 bg-gray-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    {theme.previewLabel}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-gray-950">
                    {theme.name}
                  </h3>
                </div>
                {isSelected ? <PptBadge tone="success">Selected</PptBadge> : null}
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-950">
                <div
                  className={
                    theme.id === "theme1"
                      ? "h-24 bg-white p-3"
                      : theme.id === "theme2"
                        ? "h-24 bg-[#f5eee6] p-3"
                        : "h-24 bg-neutral-950 p-3"
                  }
                >
                  <div
                    className={
                      theme.id === "theme3"
                        ? "h-full rounded-xl border border-white/18 bg-white/8"
                        : "h-full rounded-xl border border-gray-200 bg-white"
                    }
                  >
                    <div
                      className={
                        theme.id === "theme3"
                          ? "mx-3 mt-3 h-3 w-20 rounded-full bg-white"
                          : "mx-3 mt-3 h-3 w-20 rounded-full bg-gray-950"
                      }
                    />
                    <div
                      className={
                        theme.id === "theme2"
                          ? "mx-3 mt-3 h-8 rounded-xl bg-[#e8ded2]"
                          : theme.id === "theme3"
                            ? "mx-3 mt-3 grid grid-cols-2 gap-2"
                            : "mx-3 mt-3 grid grid-cols-2 gap-2"
                      }
                    >
                      <span
                        className={
                          theme.id === "theme3"
                            ? "h-8 rounded-lg bg-white/20"
                            : "h-8 rounded-lg bg-gray-100"
                        }
                      />
                      <span
                        className={
                          theme.id === "theme3"
                            ? "h-8 rounded-lg bg-white/20"
                            : "h-8 rounded-lg bg-gray-100"
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 min-h-12 text-sm leading-6 text-gray-500">
                {theme.description}
              </p>

              <div className="mt-auto grid gap-2 pt-4">
                <PptButton
                  type="button"
                  variant="secondary"
                  onClick={() => onPreviewTheme(theme.id)}
                  disabled={!store?.storeId}
                >
                  Preview
                </PptButton>
                <PptButton
                  type="button"
                  variant={isSelected ? "secondary" : "primary"}
                  loading={isSaving}
                  disabled={!store?.storeId || isSaving || isSelected}
                  onClick={() => onApplyTheme(theme.id)}
                >
                  {isSelected ? "Current theme" : "Use this theme"}
                </PptButton>
              </div>
            </article>
          );
        })}
      </div>

      {!store?.storeId ? (
        <PptNotice tone="warning" title="Store not ready" className="mt-4">
          Finish store setup before applying a storefront theme.
        </PptNotice>
      ) : null}
      <p className="mt-4 text-xs leading-5 text-gray-500">
        Preview uses your current store data and {products.length} product
        {products.length === 1 ? "" : "s"} across {collections.length} collection
        {collections.length === 1 ? "" : "s"}. It does not save until you apply a theme.
      </p>
      {successMessage ? (
        <PptNotice tone="success" title="Theme saved" className="mt-4">
          {successMessage}
        </PptNotice>
      ) : null}
      {error ? <ErrorBox message={error} /> : null}
    </section>
  );
}

function ThemePreviewModal({
  collections,
  onApply,
  onClose,
  products,
  saving,
  store,
  storeSlug,
  themeId,
}: {
  collections: StoreCollection[];
  onApply: () => void;
  onClose: () => void;
  products: Product[];
  saving: boolean;
  store: Store;
  storeSlug: string;
  themeId: StorefrontThemeId;
}) {
  const theme = storefrontThemeRegistry[themeId];
  const previewStore: Store = {
    ...store,
    selectedThemeId: themeId,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/58 px-3 py-4 backdrop-blur-sm">
      <section
        aria-label={`${theme.name} preview`}
        aria-modal="true"
        role="dialog"
        className="mx-auto grid w-full max-w-5xl gap-5 rounded-[28px] bg-white p-4 shadow-2xl lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <PptBadge tone="primary">Preview only</PptBadge>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950">
                {theme.name}
              </h2>
            </div>
            <PptButton type="button" variant="secondary" onClick={onClose}>
              Close
            </PptButton>
          </div>

          <div className="mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-[34px] border-[10px] border-gray-950 bg-gray-950 shadow-[0_24px_70px_rgba(17,24,39,0.28)]">
            <div
              className="h-full w-full overflow-y-auto overscroll-contain rounded-[22px] bg-white"
              onClickCapture={(event) => {
                const target = event.target as HTMLElement;
                const interactiveElement = target.closest("a, button");

                if (interactiveElement) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }}
            >
              <ThemeRenderer
                collections={collections}
                isOwnerPreview
                products={products}
                selectedThemeId={themeId}
                store={previewStore}
                storeSlug={storeSlug || store.storeSlug || store.storeId}
              />
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            Theme preview
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-gray-950">
            {theme.previewLabel}
          </h3>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {theme.description}
          </p>
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-600">
            This is a preview. Your public storefront will not change until you apply this theme.
          </div>
          <div className="mt-5 grid gap-2">
            <PptButton type="button" loading={saving} disabled={saving} onClick={onApply}>
              Apply this theme
            </PptButton>
            <PptButton type="button" variant="secondary" onClick={onClose}>
              Keep current theme
            </PptButton>
          </div>
        </aside>
      </section>
    </div>
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
      <p className="text-sm font-medium text-gray-500">Booking model</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">
        Fixed ₹20 PayPerTap booking fee
      </h2>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        PayPerTap collects ₹20 from the buyer to reserve the item. You collect
        any extra confirmation advance and the remaining product amount directly on WhatsApp/UPI/COD. You get a managed dashboard with buyer bookings, product details, and follow-up context in one place.
      </p>
      <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-600">
        Seller confirmation advance settings live in Store settings. They never change the ₹20 PayPerTap online payment amount.
      </div>
    </section>
  );
}

function EmptyState({
  children,
  message,
  title,
}: {
  children?: ReactNode;
  message: string;
  title: string;
}) {
  return (
    <div className="p-8 text-center">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
      {children ? (
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          {children}
        </div>
      ) : null}
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
  error,
  helper,
  inputMode,
  inputRef,
  label,
  maxLength,
  min,
  onBlur,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: {
  error?: string;
  helper?: string;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  inputRef?: RefObject<HTMLInputElement | null>;
  label: string;
  maxLength?: number;
  min?: string;
  onBlur?: () => void;
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
        ref={inputRef}
        autoComplete={type === "number" ? "off" : undefined}
        inputMode={inputMode || (type === "number" ? "numeric" : undefined)}
        maxLength={maxLength}
        min={min}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        step={type === "number" ? "1" : undefined}
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            type === "number"
              ? sanitizePositiveNumberInput(event.target.value)
              : event.target.value
          )
        }
        className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-gray-950 ${
          error ? "border-red-300 bg-red-50/40" : "border-gray-300"
        }`}
      />
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-700">{error}</span>
      ) : helper ? (
        <span className="mt-1 block text-xs leading-5 text-gray-500">{helper}</span>
      ) : null}
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
