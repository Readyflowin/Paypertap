import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  CalendarCheck,
  Copy,
  CreditCard,
  ExternalLink,
  Link2,
  MessageCircle,
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
} from "@/components/ui";
import { useAuthUser } from "../hooks/useAuthUser";
import { formatINR } from "../lib/money";
import { STORE_THEME_DEFAULTS } from "../lib/storeTheme";
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
import {
  getStoreById,
  updateStoreCustomization,
  updateStorePublishStatus,
} from "../services/storeService";
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
const mobileNavItems = [
  "Overview",
  "Products",
  "Bookings",
  "Customers",
  "Store",
] as const satisfies readonly DashboardTab[];

const sidebarIcons: Record<DashboardTab, typeof BarChart3> = {
  Overview: BarChart3,
  Products: ShoppingBag,
  Bookings: CalendarCheck,
  Customers: Users,
  Store: StoreIcon,
  Payments: CreditCard,
};

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
  return store.instagramUrl || (store.instagramHandle ? `@${store.instagramHandle}` : "");
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
  const [copiedStoreLink, setCopiedStoreLink] = useState(false);

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
          description="Preparing your seller cockpit."
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
                onClick={() => setActiveTab("Products")}
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
                bookings={bookings}
                customers={customers}
                products={products}
                storeLink={storeLink}
              />
            ) : null}

            {activeTab === "Store" ? (
              <StoreTab
                onTogglePublish={handleTogglePublish}
                onStoreUpdated={(updatedStore) => setStore(updatedStore)}
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
  const openProducts = products.filter(
    (product) => product.status === "open" && getAvailableQuantity(product) > 0
  ).length;
  const reservedProducts = products.filter((product) =>
    product.reservedQuantity > 0 || product.status === "hold"
  ).length;
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
          helper={`${verifiedBookings} verified/progressed`}
        />
        <CompactStatCard
          icon={<ShoppingBag size={16} aria-hidden="true" />}
          label="Open products"
          value={openProducts}
          helper="ready to book"
          tone="success"
        />
        <CompactStatCard
          icon={<MessageCircle size={16} aria-hidden="true" />}
          label="Follow-ups"
          value={Math.max(pendingFollowUps, reservedProducts)}
          helper="needs WhatsApp"
          tone="info"
        />
        <CompactStatCard
          icon={<Users size={16} aria-hidden="true" />}
          label="Customers"
          value={customers.length}
          helper={`${activeBookingLeads} active leads`}
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
            description="Follow up with buyers who paid the ₹20 booking advance."
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
                  WhatsApp
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
  const hasWhatsApp = Boolean(store?.whatsappPhone || store?.phone);

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
                  WhatsApp
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
                    <img src={imageUrl} alt={product.title} />
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
  if (availableQuantity <= 0) return { label: "Sold out", tone: "sold" };
  return { label: "Open", tone: "success" };
}

function ProductsTab({
  onProductUpdated,
  products,
  user,
  store,
  onProductCreated,
}: {
  products: Product[] | null | undefined;
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
  const safeProducts = Array.isArray(products) ? products : [];

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
        {safeProducts.length === 0 ? (
          <EmptyState title="No products yet" message="Add your first product to make it available in your store." />
        ) : (
          <div className="divide-y divide-gray-100">
            {safeProducts.map((product) => (
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
  const reservedQuantity = Number(product.reservedQuantity || 0);
  const soldQuantity = Number(product.soldQuantity || 0);
  const minimumTrackedInventory = reservedQuantity + soldQuantity;
  const formAvailableQuantity =
    Number(inventoryQuantity || 0) - reservedQuantity - soldQuantity;
  const openingWithoutStock = status === "open" && formAvailableQuantity <= 0;

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
      const requestedInventory = Number(inventoryQuantity);
      const nextInventoryQuantity =
        status === "open" && requestedInventory <= minimumTrackedInventory
          ? minimumTrackedInventory + 1
          : requestedInventory;

      const updatedProduct = await updateSellerProduct(user, product, {
        title,
        price: Number(price),
        description,
        category,
        inventoryQuantity: nextInventoryQuantity,
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
          label={`Inventory (reserved ${reservedQuantity}, sold ${soldQuantity})`}
          min={String(reservedQuantity + soldQuantity)}
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
            onChange={(event) => {
              const nextStatus = event.target.value as ProductStatus;
              setStatus(nextStatus);

              if (
                nextStatus === "open" &&
                Number(inventoryQuantity || 0) <= minimumTrackedInventory
              ) {
                setInventoryQuantity(String(minimumTrackedInventory + 1));
              }
            }}
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

      <PptNotice tone={openingWithoutStock ? "warning" : "info"} title="Opening this product makes it bookable again. Make sure stock is available.">
        {openingWithoutStock
          ? "Saving as Open will add 1 available unit without erasing sold or reserved history."
          : "Public checkout will stay disabled unless available quantity is above zero."}
      </PptNotice>

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
          <label className="text-xs font-medium text-gray-500">
            Update status
            <select
              value=""
              onChange={(event) => {
                const value = event.target.value;
                event.target.value = "";
                if (value === "contacted") {
                  void runBookingAction("contacted", () => markBookingContacted(booking.checkoutId));
                }
                if (value === "remaining_paid") {
                  void runBookingAction("remaining_paid", () => markBookingRemainingPaid(booking.checkoutId));
                }
                if (value === "confirmed") {
                  void runBookingAction("confirmed", () => markBookingConfirmed(booking.checkoutId));
                }
                if (value === "sold") {
                  void runBookingAction("sold", () => markBookingSold(booking));
                }
                if (value === "released") {
                  void runBookingAction("released", () => cancelOrReleaseBooking(booking));
                }
              }}
              disabled={Boolean(savingAction)}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:border-gray-950 disabled:opacity-50"
            >
              <option value="">{savingAction ? "Updating..." : "Choose action"}</option>
              <option value="contacted">Mark contacted</option>
              <option value="remaining_paid">Mark remaining paid</option>
              <option value="confirmed">Mark confirmed</option>
              <option value="sold" disabled={booking.status === "sold"}>Mark sold</option>
              <option
                value="released"
                disabled={["sold", "cancelled", "released"].includes(booking.status)}
              >
                Cancel / release hold
              </option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <Metric label="Product price" value={formatINR(booking.productPrice)} />
        <Metric label="Advance paid" value={formatINR(booking.bookingAdvanceAmount)} />
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
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900"
          >
            Delivery details
          </a>
          <a
            href={confirmedWhatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900"
          >
            Order confirmed
          </a>
          <Metric label="WhatsApp opened" value={booking.whatsappOpened ? "Yes" : "No"} />
        </div>
      </details>
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
        <h2 className="text-lg font-semibold tracking-tight">Customers</h2>
        <p className="mt-1 text-sm text-gray-500">
          Customer leads are grouped from checkout sessions until backend customer records are added.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        {customers.length === 0 ? (
          <EmptyState title="No customer leads yet" message="Buyer details will appear here after your first booking." />
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
                  <span className="text-xs text-gray-500">{formatDate(booking.createdAt)}</span>
                  <PptBadge tone={getCheckoutStatusTone(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </PptBadge>
                </div>
              ))}
            </div>
          </div>

          <label className="block text-xs font-medium text-gray-600">
            Retarget with product
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
            {copied ? "Retargeting message copied" : "Copy retargeting message"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function StoreTab({
  store,
  storeSlug,
  storeLink,
  publishing,
  onTogglePublish,
  onStoreUpdated,
}: {
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
  const [heroHeading, setHeroHeading] = useState(store?.heroHeading || "");
  const [heroSubtitle, setHeroSubtitle] = useState(store?.heroSubtitle || "");
  const [themeStyle, setThemeStyle] = useState(store?.themeStyle || "clean-minimal");
  const [fontStyle, setFontStyle] = useState(store?.fontStyle || "clean-sans");
  const [backgroundColor, setBackgroundColor] = useState(
    store?.backgroundColor || STORE_THEME_DEFAULTS.backgroundColor
  );
  const [textColor, setTextColor] = useState(
    store?.textColor || STORE_THEME_DEFAULTS.textColor
  );
  const [cardColor, setCardColor] = useState(
    store?.cardColor || STORE_THEME_DEFAULTS.cardColor
  );
  const [primaryColor, setPrimaryColor] = useState(
    store?.primaryColor || STORE_THEME_DEFAULTS.primaryColor
  );
  const [accentColor, setAccentColor] = useState(
    store?.accentColor || STORE_THEME_DEFAULTS.accentColor
  );
  const [buttonColor, setButtonColor] = useState(
    store?.buttonColor || STORE_THEME_DEFAULTS.buttonColor
  );
  const [buttonTextColor, setButtonTextColor] = useState(
    store?.buttonTextColor || STORE_THEME_DEFAULTS.buttonTextColor
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoFileName, setLogoFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStoreName(store?.storeName || "");
    setBio(store?.bio || "");
    setWhatsappPhone(store?.whatsappPhone || store?.phone || "");
    setInstagramProfile(getStoreInstagramProfile(store));
    setHeroHeading(store?.heroHeading || "");
    setHeroSubtitle(store?.heroSubtitle || "");
    setThemeStyle(store?.themeStyle || "clean-minimal");
    setFontStyle(store?.fontStyle || "clean-sans");
    setBackgroundColor(store?.backgroundColor || STORE_THEME_DEFAULTS.backgroundColor);
    setTextColor(store?.textColor || STORE_THEME_DEFAULTS.textColor);
    setCardColor(store?.cardColor || STORE_THEME_DEFAULTS.cardColor);
    setPrimaryColor(store?.primaryColor || STORE_THEME_DEFAULTS.primaryColor);
    setAccentColor(store?.accentColor || STORE_THEME_DEFAULTS.accentColor);
    setButtonColor(store?.buttonColor || STORE_THEME_DEFAULTS.buttonColor);
    setButtonTextColor(store?.buttonTextColor || STORE_THEME_DEFAULTS.buttonTextColor);
  }, [store]);

  async function handleSaveStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!store?.storeId) return;

    try {
      setSaving(true);
      setSaved(false);
      setError("");

      let uploadedLogo: { url: string; key: string } | null = null;
      if (logoFile) {
        uploadedLogo = await uploadImageToR2(logoFile, "stores");
      }

      const updatedFields = await updateStoreCustomization(store.storeId, {
        storeName,
        bio,
        tagline: bio,
        whatsappPhone,
        whatsappNumber: whatsappPhone,
        phone: store.phone || whatsappPhone,
        instagramProfile,
        heroHeading,
        heroSubtitle,
        themeStyle,
        fontStyle,
        backgroundColor,
        textColor,
        cardColor,
        primaryColor,
        accentColor,
        buttonColor,
        buttonTextColor,
        logoUrl: uploadedLogo?.url,
        logoKey: uploadedLogo?.key,
      });

      onStoreUpdated({
        ...store,
        ...updatedFields,
        storeName,
        bio,
        tagline: bio,
        whatsappPhone,
        whatsappNumber: whatsappPhone,
        instagramUrl: String(updatedFields.instagramUrl || ""),
        instagramHandle: String(updatedFields.instagramHandle || ""),
        heroHeading,
        heroSubtitle,
        themeStyle,
        fontStyle,
        backgroundColor,
        textColor,
        cardColor,
        primaryColor,
        accentColor,
        buttonColor,
        buttonTextColor,
        logoUrl: uploadedLogo?.url || store.logoUrl,
        logoKey: uploadedLogo?.key || store.logoKey,
      });
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

  const previewHeroHeading =
    heroHeading || STORE_THEME_DEFAULTS.heroHeading;
  const previewHeroSubtitle =
    heroSubtitle || STORE_THEME_DEFAULTS.heroSubtitle;
  const previewTagline = bio || STORE_THEME_DEFAULTS.tagline;

  return (
    <section className="space-y-4">
      <form onSubmit={handleSaveStore} className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <PptBadge tone="primary">Store appearance</PptBadge>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">Customize your storefront</h2>
            <p className="mt-1 text-sm text-gray-500">Control your public store identity, hero, theme, and colors.</p>
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
              {store?.logoUrl ? (
                <img src={store.logoUrl} alt={store.storeName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-400">
                  No logo
                </div>
              )}
            </div>
            <label className="mt-4 block text-xs font-medium text-gray-600">
              Logo upload
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setLogoFile(file);
                  setLogoFileName(file?.name || "");
                }}
                className="mt-2 w-full rounded-xl border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-600 file:mr-2 file:rounded-lg file:border-0 file:bg-gray-950 file:px-2 file:py-1 file:text-xs file:font-medium file:text-white"
              />
            </label>
            <p className="mt-2 text-xs text-gray-500">
              {logoFileName || "JPEG, PNG, WebP, or GIF up to 5MB."}
            </p>

            <div
              className="mt-4 rounded-2xl border p-4"
              style={{
                background: cardColor,
                borderColor: `${accentColor}66`,
                color: textColor,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl text-sm font-semibold text-white"
                  style={{ background: primaryColor }}
                >
                  {store?.logoUrl ? (
                    <img src={store.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <StoreIcon size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{storeName || "Store name"}</p>
                  <p className="line-clamp-1 text-xs opacity-70">{previewTagline}</p>
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {previewHeroHeading}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 opacity-70">
                {previewHeroSubtitle}
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
              <button
                type="button"
                className="mt-4 w-full rounded-xl px-4 py-2 text-sm font-medium"
                style={{ background: buttonColor, color: buttonTextColor }}
              >
                Button preview
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Store name" value={storeName} onChange={setStoreName} required />
              <Field label="WhatsApp number" value={whatsappPhone} onChange={setWhatsappPhone} />
            </div>
            <Field label="Tagline / bio" value={bio} onChange={setBio} />
            <Field
              label="Instagram profile"
              value={instagramProfile}
              onChange={setInstagramProfile}
              placeholder="https://instagram.com/yourstore or @yourstore"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hero heading" value={heroHeading} onChange={setHeroHeading} placeholder="Fresh drops are live" />
              <Field label="Hero subtitle" value={heroSubtitle} onChange={setHeroSubtitle} placeholder="Reserve with ₹20. Confirm the rest on WhatsApp." />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-medium text-gray-800">
                Theme style
                <select
                  value={themeStyle}
                  onChange={(event) => setThemeStyle(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
                >
                  <option value="soft-boutique">Soft Boutique</option>
                  <option value="dark-drop">Dark Drop</option>
                  <option value="clean-minimal">Clean Minimal</option>
                  <option value="streetwear-pop">Streetwear Pop</option>
                </select>
              </label>
              <label className="text-sm font-medium text-gray-800">
                Font style
                <select
                  value={fontStyle}
                  onChange={(event) => setFontStyle(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
                >
                  <option value="clean-sans">Clean Sans</option>
                  <option value="boutique-serif">Boutique Serif</option>
                  <option value="bold-street">Bold Street</option>
                  <option value="minimal-modern">Minimal Modern</option>
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ColorField label="Store background" value={backgroundColor} onChange={setBackgroundColor} />
              <ColorField label="Text color" value={textColor} onChange={setTextColor} />
              <ColorField label="Card color" value={cardColor} onChange={setCardColor} />
              <ColorField label="Primary color" value={primaryColor} onChange={setPrimaryColor} />
              <ColorField label="Accent color" value={accentColor} onChange={setAccentColor} />
              <ColorField label="Button color" value={buttonColor} onChange={setButtonColor} />
              <ColorField label="Button text" value={buttonTextColor} onChange={setButtonTextColor} />
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <InfoRow label="Slug" value={storeSlug || "Not set"} />
              <InfoRow label="Public link" value={storeLink || "Not set"} />
              <InfoRow label="Booking advance" value={formatINR(store?.bookingAdvanceAmount || 20)} />
              <InfoRow label="Theme" value={store?.themeId || "minimal-clean"} />
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          Buyers pay ₹20 advance on PayPerTap. You collect the remaining product amount directly on WhatsApp/UPI/COD.
        </div>
        {error ? <ErrorBox message={error} /> : null}
      </form>

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

function ColorField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="text-sm font-medium text-gray-800">
      {label}
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-2 py-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-11 shrink-0 rounded-lg border border-gray-200 bg-white p-1"
        />
        <span className="min-w-0 font-mono text-xs uppercase text-gray-500">
          {value}
        </span>
      </div>
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
