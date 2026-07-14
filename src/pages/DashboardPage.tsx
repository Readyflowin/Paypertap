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
  Bell,
  CalendarCheck,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  FolderOpen,
  Link2,
  PackageOpen,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Store as StoreIcon,
  Users,
  Wallet as WalletIcon,
  X,
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
  compressHeroImage,
  MAX_PRODUCT_IMAGE_COUNT,
} from "../lib/imageCompression";
import {
  COMPATIBILITY_COLLECTION_NAME,
  getCollectionNameKey,
  isCompatibilityCollectionName,
  normalizeCollectionName,
} from "../lib/collections";
import { formatINR } from "../lib/money";
import { normalizeIndianMobileInput } from "../lib/phone";
import {
  getDisplayImageUrl,
  getPrimaryProductImage,
  getProductImageUrls,
  productHasTemporaryImageUrls,
} from "../lib/imageUrls";
import { getAvailableQuantity, getProductUnavailableLabel } from "../lib/productAvailability";
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
  getOrdersBySellerId,
  repairMissingOrderReservation,
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
  getStorePaymentSettings,
  getStoreById,
  updateStorePaymentSettings,
  updateStoreCustomization,
  updateStorePublishStatus,
  type StorePaymentSettings,
  type StorePaymentMode,
} from "../services/storeService";
import {
  getWallet,
  getWalletTransactions,
  INITIAL_FREE_ORDERS,
  reconcileWalletFromActivity,
  startWalletRecharge,
  WALLET_LOW_BALANCE_THRESHOLD,
  WALLET_ORDER_CHARGE_AMOUNT,
  WALLET_RECHARGE_AMOUNTS,
  WALLET_RECHARGE_MAX_AMOUNT,
  WALLET_RECHARGE_MIN_AMOUNT,
  type SellerWallet,
  type WalletTransactionRecord,
} from "../services/walletService";
import { getProductGridImageUrl } from "../storefront/imageMedia";
import {
  DEFAULT_STOREFRONT_THEME_ID,
  storefrontThemeRegistry,
} from "../storefront/themes/registry";
import type { StorefrontThemeId } from "../storefront/themes/types";
import { uploadImageToR2, uploadOptimizedHeroImage } from "../services/uploadService";
import {
  buildOrderWhatsAppUrl,
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
import { OrderManagementDashboard } from "../components/orders";

function sanitizePositiveNumberInput(value: string): string {
  const digits = value.replace(/[^\d]/g, "");

  if (!digits || /^0+$/.test(digits)) return "";

  return digits.replace(/^0+/, "");
}

const sidebarItems = [
  "Dashboard",
  "Orders",
  "Products",
  "Customers",
  "Storefront",
  "Marketing",
  "Wallet",
  "Settings",
] as const;

type DashboardTab = (typeof sidebarItems)[number];
const DEFAULT_HERO_TITLE = "Curated drops, one piece at a time.";
const DEFAULT_HERO_SUBTITLE =
  "Browse available pieces and reserve before the chat moves to WhatsApp.";
const DEFAULT_HERO_EYEBROW_TEXT = "Premium thrift / archive drop";
const DEFAULT_HERO_PRIMARY_CTA_TEXT = "Shop new drop";
const DEFAULT_HERO_SECONDARY_CTA_TEXT = "How ordering works";
const DEFAULT_ANNOUNCEMENT_TEXT = "LIMITED DROP LIVE - ORDER BEFORE IT'S GONE";

const mobileNavItems = [
  "Dashboard",
  "Orders",
  "Products",
  "Customers",
  "Storefront",
  "Wallet",
  "Settings",
] as const satisfies readonly DashboardTab[];

const sidebarIcons: Record<DashboardTab, typeof BarChart3> = {
  Dashboard: BarChart3,
  Orders: CalendarCheck,
  Products: ShoppingBag,
  Customers: Users,
  Storefront: StoreIcon,
  Marketing: Bell,
  Wallet: WalletIcon,
  Settings,
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

function OrderVariantLine({ order }: { order: CheckoutSession }) {
  const details = getVariantDetailsText(order);

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

function getProductSizeChartImageUrl(product: Product): string {
  return product.sizeChartImageUrl || product.sizeChartImage || "";
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

function formatRelativeTime(value: unknown): string {
  const millis = getTimeValue(value);

  if (!millis) return "Just now";

  const diffMs = Date.now() - millis;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return formatDate(value);
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
  void store;
  return DEFAULT_STOREFRONT_THEME_ID;
}

function getCheckoutStatusTone(status: CheckoutSession["status"]): PptTone {
  if (status === "confirmed" || status === "processing") return "success";
  if (status === "completed") return "neutral";
  if (status === "cancelled" || status === "released") return "neutral";
  if (
    status === "pending_payment" ||
    status === "awaiting_payment" ||
    status === "payment_returned"
  ) return "warning";
  if (status === "pending_confirmation") return "primary";
  return "info";
}

function getStatusLabel(status: CheckoutSession["status"]): string {
  if (!status) return "Choose action";
  if (status === "pending_payment") return "Pending payment";
  if (status === "pending_confirmation") return "Pending confirmation";
  if (status === "awaiting_payment") return "Awaiting payment";
  if (status === "payment_returned") return "Payment Returned";
  if (status === "confirmed") return "Confirmed";
  if (status === "processing") return "Processing";
  if (status === "completed") return "Completed";
  if (status === "released") return "Released";
  if (status === "cancelled") return "Cancelled";
  return status.replace(/_/g, " ");
}

function getSellerAmountDueFromOrder(order: CheckoutSession): number {
  return Math.max(0, Number(order.sellerAmountDue || 0));
}

function isActiveOrderLead(status: CheckoutSession["status"]): boolean {
  return [
    "pending_payment",
    "pending_confirmation",
    "awaiting_payment",
    "payment_returned",
    "confirmed",
    "processing",
  ].includes(status);
}

function deriveCustomerLeads(orders: CheckoutSession[]): DerivedCustomerLead[] {
  const leadsByPhone = new Map<string, DerivedCustomerLead>();

  orders.forEach((order) => {
    const key = order.buyerPhone.replace(/[^\d]/g, "") || order.buyerPhone;
    const existing = leadsByPhone.get(key);
    const orderTime = getTimeValue(order.createdAt);
    const existingTime = getTimeValue(existing?.lastCreatedAt);

    if (!existing) {
      leadsByPhone.set(key, {
        buyerName: order.buyerName,
        buyerPhone: order.buyerPhone,
        buyerCity: order.buyerCity,
        buyerPincode: order.buyerPincode,
        totalOrders: 1,
        lastProductTitle: order.productTitle,
        lastProductId: order.productId,
        lastVariantLabel: order.selectedVariantLabel,
        lastVariantOptions: order.selectedVariantOptions,
        lastOrderstatus: order.status,
        lastCreatedAt: order.createdAt,
      });
      return;
    }

    existing.totalOrders += 1;

    if (orderTime >= existingTime) {
      existing.buyerName = order.buyerName || existing.buyerName;
      existing.buyerCity = order.buyerCity || existing.buyerCity;
      existing.buyerPincode = order.buyerPincode || existing.buyerPincode;
      existing.lastProductTitle = order.productTitle;
      existing.lastProductId = order.productId;
      existing.lastVariantLabel = order.selectedVariantLabel;
      existing.lastVariantOptions = order.selectedVariantOptions;
      existing.lastOrderstatus = order.status;
      existing.lastCreatedAt = order.createdAt;
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
  orders: CheckoutSession[]
): Promise<boolean> {
  const staleOrders = orders.filter(
    (order) => order.reservationApplied === false
  );

  if (!staleOrders.length) return false;

  const results = await Promise.all(
    staleOrders.map((order) =>
      repairMissingOrderReservation(order).catch((error) => {
        console.warn("Could not repair order reservation:", error);
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
  const [Orders, setOrders] = useState<CheckoutSession[]>([]);
  const [wallet, setWallet] = useState<SellerWallet | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<
    WalletTransactionRecord[]
  >([]);
  const [walletError, setWalletError] = useState("");
  const [activeTab, setActiveTab] = useState<DashboardTab>("Dashboard");
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

        const [sellerData, storeData, walletResult, walletTransactionData] = await Promise.all([
          getSellerByUid(uid),
          getStoreById(prepared.storeId),
          getWallet(uid)
            .then((walletData) => ({ walletData, error: "" }))
            .catch((walletLoadError) => {
              console.warn("Wallet unavailable:", walletLoadError);
              return {
                walletData: null,
                error: "Wallet information is temporarily unavailable.",
              };
            }),
          getWalletTransactions(uid).catch((walletActivityError) => {
            console.warn("Wallet activity unavailable:", walletActivityError);
            return [];
          }),
        ]);
        const paymentSettings = storeData
          ? await getStorePaymentSettings(storeData.storeId).catch((paymentSettingsError) => {
              console.warn("Payment settings unavailable:", paymentSettingsError);
              return null;
            })
          : null;
        const storeWithPaymentSettings = storeData
          ? {
              ...storeData,
              ...(paymentSettings || {}),
            }
          : null;

        const [productData, OrderData] = storeWithPaymentSettings
          ? await Promise.all([
              getSellerProductsForStore(uid, storeWithPaymentSettings.storeId),
              getOrdersBySellerId(uid, storeWithPaymentSettings.storeId).catch((OrderError) => {
                console.warn("Orders unavailable:", OrderError);
                return [];
              }),
            ])
          : [[], []];
        const repairedReservations = storeWithPaymentSettings
          ? await repairMissingReservations(OrderData)
          : false;
        const [currentProductData, currentOrderData] =
          storeWithPaymentSettings && repairedReservations
            ? await Promise.all([
                getSellerProductsForStore(uid, storeWithPaymentSettings.storeId),
                getOrdersBySellerId(uid, storeWithPaymentSettings.storeId).catch((OrderError) => {
                  console.warn("Orders unavailable:", OrderError);
                  return OrderData;
                }),
              ])
            : [productData, OrderData];
        const collectionData = storeWithPaymentSettings
          ? await listStoreCollections(storeWithPaymentSettings.storeId, currentProductData).catch((collectionError) => {
              console.warn("Collections unavailable:", collectionError);
              return [];
            })
          : [];
        const currentWalletData = await reconcileWalletIfActivityIsAhead(
          walletResult.walletData,
          walletTransactionData
        );

        if (cancelled) return;

        setSeller(sellerData);
        setStore(storeWithPaymentSettings);
        setProducts(currentProductData);
        setCollections(collectionData);
        setOrders(currentOrderData);
        setWallet(currentWalletData);
        setWalletTransactions(walletTransactionData);
        setWalletError(walletResult.error);
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

  const customers = useMemo(() => deriveCustomerLeads(Orders), [Orders]);
  const storeSlug = store?.storeSlug || store?.storeId || seller?.storeId || "";
  const storeLink = storeSlug ? `${window.location.origin}/${storeSlug}` : "";
  const ordersNeedingAction = Orders.filter((order) =>
    [
      "pending_payment",
      "pending_confirmation",
      "awaiting_payment",
      "payment_returned",
    ].includes(order.status)
  ).length;
  const walletNeedsAttention =
    wallet &&
    wallet.freeOrdersRemaining <= 0 &&
    wallet.balance < WALLET_LOW_BALANCE_THRESHOLD;

  function getNavBadge(item: DashboardTab): string {
    if (item === "Orders" && ordersNeedingAction > 0) return String(ordersNeedingAction);
    if (item === "Wallet" && walletNeedsAttention) return "!";
    return "";
  }

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

  async function refreshProductsAndOrders() {
    if (!user || !store?.storeId) return;

    const [productData, OrderData, walletData, walletTransactionData] = await Promise.all([
      getSellerProductsForStore(user.uid, store.storeId),
      getOrdersBySellerId(user.uid, store.storeId).catch((OrderError) => {
        console.warn("Orders unavailable:", OrderError);
        return [];
      }),
      getWallet(user.uid).catch((walletLoadError) => {
        console.warn("Wallet unavailable:", walletLoadError);
        return wallet;
      }),
      getWalletTransactions(user.uid).catch((walletActivityError) => {
        console.warn("Wallet activity unavailable:", walletActivityError);
        return walletTransactions;
      }),
    ]);
    const repairedReservations = await repairMissingReservations(OrderData);
    const [currentProductData, currentOrderData] = repairedReservations
      ? await Promise.all([
          getSellerProductsForStore(user.uid, store.storeId),
            getOrdersBySellerId(user.uid, store.storeId).catch((OrderError) => {
            console.warn("Orders unavailable:", OrderError);
            return OrderData;
          }),
        ])
      : [productData, OrderData];
    const collectionData = await listStoreCollections(
      store.storeId,
      currentProductData
    ).catch((collectionError) => {
      console.warn("Collections unavailable:", collectionError);
      return collections;
    });
    const currentWalletData = await reconcileWalletIfActivityIsAhead(
      walletData,
      walletTransactionData
    );

    setProducts(currentProductData);
    setCollections(collectionData);
    setOrders(currentOrderData);
    setWallet(currentWalletData);
    setWalletTransactions(walletTransactionData);
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
    <main className="ppt-dashboard-page ppt-admin-workspace">
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
                  {getNavBadge(item) ? (
                    <strong className="ppt-dashboard-nav-badge">{getNavBadge(item)}</strong>
                  ) : null}
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
                {ordersNeedingAction > 0 ? (
                  <PptBadge tone="warning">{ordersNeedingAction} need action</PptBadge>
                ) : null}
              </div>
              <h1>{store?.storeName || "Your store"}</h1>
              <p>Run daily orders, products, storefront, customers, and wallet from one workspace.</p>
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

            <div className="ppt-dashboard-commandbar" role="search">
              <Search size={16} aria-hidden="true" />
              <span>Search orders, products, customers</span>
              <kbd>/</kbd>
            </div>

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
                    {getNavBadge(item) ? (
                      <strong className="ppt-dashboard-nav-badge">{getNavBadge(item)}</strong>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {activeTab === "Dashboard" ? (
              <OverviewTab
                Orders={Orders}
                customers={customers}
                onSelectTab={setActiveTab}
                products={products}
                store={store}
                storeLink={storeLink}
                onCopyStoreLink={handleCopyStoreLink}
                copiedStoreLink={copiedStoreLink}
                wallet={wallet}
                walletError={walletError}
              />
            ) : null}

            {activeTab === "Products" ? (
              <ProductsWorkspace
                collections={collections}
                onAddProduct={openAddProduct}
                onCollectionsChanged={setCollections}
                onProductsChanged={setProducts}
                onSelectTab={setActiveTab}
                openAddProductSignal={addProductRequest}
                onProductCreated={handleProductCreated}
                onProductRemoved={handleProductRemoved}
                onProductUpdated={handleProductUpdated}
                Orders={Orders}
                products={products}
                store={store}
                user={user}
              />
            ) : null}

            {activeTab === "Orders" ? (
              <OrderManagementDashboard
                orders={Orders}
                onOrderChanged={refreshProductsAndOrders}
                products={products}
                store={store}
              />
            ) : null}

            {activeTab === "Customers" ? (
              <CustomersTab
                Orders={Orders}
                customers={customers}
                products={products}
                storeLink={storeLink}
              />
            ) : null}

            {activeTab === "Storefront" ? (
              <StorefrontWorkspace
                onTogglePublish={handleTogglePublish}
                onStoreUpdated={(updatedStore) => setStore(updatedStore)}
                publishing={publishing}
                store={store}
                storeLink={storeLink}
                storeSlug={storeSlug}
              />
            ) : null}

            {activeTab === "Marketing" ? (
              <MarketingWorkspace
                Orders={Orders}
                customers={customers}
                products={products}
                storeLink={storeLink}
              />
            ) : null}

            {activeTab === "Wallet" ? (
              <WalletWorkspace
                wallet={wallet}
                walletError={walletError}
                walletTransactions={walletTransactions}
              />
            ) : null}

            {activeTab === "Settings" ? (
              <SettingsWorkspace
                onTogglePublish={handleTogglePublish}
                onStoreUpdated={(updatedStore) => setStore(updatedStore)}
                publishing={publishing}
                store={store}
                storeLink={storeLink}
                storeSlug={storeSlug}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function OverviewTab({
  Orders,
  copiedStoreLink,
  customers,
  onCopyStoreLink,
  onSelectTab,
  products,
  store,
  storeLink,
  wallet,
  walletError,
}: {
  Orders: CheckoutSession[];
  copiedStoreLink: boolean;
  customers: DerivedCustomerLead[];
  onCopyStoreLink: () => void;
  onSelectTab: (tab: DashboardTab) => void;
  products: Product[];
  store: Store | null;
  storeLink: string;
  wallet: SellerWallet | null;
  walletError: string;
}) {
  const activeOrderLeads = Orders.filter((Order) =>
    !["cancelled", "released"].includes(Order.status)
  ).length;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaysOrders = Orders.filter((order) => {
    const created = getTimeValue(order.createdAt);
    return created && new Date(created).toISOString().slice(0, 10) === todayKey;
  });
  const pendingFollowUps = Orders.filter((Order) =>
    [
      "pending_payment",
      "pending_confirmation",
      "awaiting_payment",
      "payment_returned",
    ].includes(Order.status)
  ).length;
  const completedOrders = Orders.filter((Order) => Order.status === "completed");
  const sellerRevenue = completedOrders.reduce(
    (total, order) => total + getSellerAmountDueFromOrder(order),
    0
  );
  const recentOrders = [...Orders]
    .sort((a, b) => getTimeValue(b.createdAt) - getTimeValue(a.createdAt))
    .slice(0, 3);
  const topProducts = products
    .map((product) => {
      const productId = product.productId || product.id;
      const orderCount = Orders.filter((order) => order.productId === productId).length;

      return { product, orderCount };
    })
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 4);
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
      <section className="ppt-dashboard-home-hero">
        <div className="min-w-0">
          <PptBadge tone="primary">Business today</PptBadge>
          <h2>What needs attention right now?</h2>
          <p>
            A compact view of orders, wallet health, storefront readiness, and the
            next best action for your store.
          </p>
        </div>
        <div className="ppt-dashboard-home-actions">
          <PptButton type="button" variant="primary" icon={<Plus size={16} />} onClick={() => onSelectTab("Products")}>
            Add Product
          </PptButton>
          <PptButton type="button" variant="secondary" icon={<WalletIcon size={16} />} onClick={() => onSelectTab("Wallet")}>
            Recharge
          </PptButton>
          <PptButton type="button" variant="ghost" icon={<ExternalLink size={16} />} disabled={!storeLink} onClick={() => storeLink && window.open(new URL(storeLink).pathname, "_self")}>
            Open Store
          </PptButton>
        </div>
      </section>

      <div className="ppt-dashboard-compact-grid">
        <CompactStatCard
          icon={<CalendarCheck size={16} aria-hidden="true" />}
          label="Today's orders"
          value={todaysOrders.length}
          helper={`${pendingFollowUps} need action`}
        />
        <CompactStatCard
          icon={<CreditCard size={16} aria-hidden="true" />}
          label="Revenue"
          value={formatINR(sellerRevenue)}
          helper="from completed orders"
          tone="success"
        />
        <CompactStatCard
          icon={<CheckCircle2 size={16} aria-hidden="true" />}
          label="Completed"
          value={completedOrders.length}
          helper="completed sales"
          tone="info"
        />
        <CompactStatCard
          icon={<Users size={16} aria-hidden="true" />}
          label="Customers"
          value={customers.length}
          helper={`${activeOrderLeads} active buyer orders`}
        />
      </div>

      <div className="ppt-dashboard-home-grid">
        <NextActionCard action={nextAction} />
        <WalletSnapshotCard
          error={walletError}
          onOpenWallet={() => onSelectTab("Wallet")}
          wallet={wallet}
        />
      </div>

      <div className="ppt-dashboard-home-grid">
        <StorefrontSnapshotCard
          onCopyStoreLink={onCopyStoreLink}
          onOpenStorefront={() => onSelectTab("Storefront")}
          store={store}
          storeLink={storeLink}
        />
        <TopProductsCard products={topProducts} onOpenProducts={() => onSelectTab("Products")} />
      </div>

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
            title="Check orders"
            description="Follow up with buyers who need confirmation or payment checks."
            action={
              <PptButton
                type="button"
                size="sm"
                variant="dark"
                onClick={() => onSelectTab("Orders")}
              >
                Open orders
              </PptButton>
            }
          />
        </div>
      </section>

      <CompactRecentActivity
        Orders={recentOrders}
        onSelectTab={onSelectTab}
        store={store}
      />
    </div>
  );
}

type WalletDisplayStatus = {
  label: string;
  tone: PptTone;
};

function getWalletDisplayStatus(wallet: SellerWallet): WalletDisplayStatus {
  if (
    wallet.freeOrdersRemaining > 0 ||
    wallet.balance >= WALLET_LOW_BALANCE_THRESHOLD
  ) {
    return { label: "Active", tone: "success" };
  }

  if (
    wallet.balance >= WALLET_ORDER_CHARGE_AMOUNT &&
    wallet.balance < WALLET_LOW_BALANCE_THRESHOLD
  ) {
    return { label: "Low balance", tone: "warning" };
  }

  return { label: "Paused", tone: "danger" };
}

function WalletSnapshotCard({
  error,
  onOpenWallet,
  wallet,
}: {
  error: string;
  onOpenWallet: () => void;
  wallet: SellerWallet | null;
}) {
  const status = wallet ? getWalletDisplayStatus(wallet) : null;
  const paidOrdersRemaining = wallet
    ? Math.floor(wallet.balance / WALLET_ORDER_CHARGE_AMOUNT)
    : 0;

  return (
    <section className="ppt-dashboard-snapshot-card">
      <div className="ppt-dashboard-snapshot-head">
        <div>
          <PptBadge tone={status?.tone || "neutral"}>{status?.label || "Wallet"}</PptBadge>
          <h2>Wallet</h2>
        </div>
        <button type="button" onClick={onOpenWallet}>Open</button>
      </div>
      {wallet ? (
        <div className="ppt-dashboard-snapshot-metrics">
          <Metric label="Balance" value={formatINR(wallet.balance)} />
          <Metric label="Free orders" value={String(wallet.freeOrdersRemaining)} />
          <Metric label="Paid orders left" value={String(paidOrdersRemaining)} />
        </div>
      ) : (
        <p className="ppt-dashboard-snapshot-note">
          {error || "Wallet information is temporarily unavailable."}
        </p>
      )}
    </section>
  );
}

function StorefrontSnapshotCard({
  onCopyStoreLink,
  onOpenStorefront,
  store,
  storeLink,
}: {
  onCopyStoreLink: () => void;
  onOpenStorefront: () => void;
  store: Store | null;
  storeLink: string;
}) {
  const hasWhatsApp = normalizeIndianMobileInput(
    store?.whatsappPhone || store?.phone || ""
  ).ok;

  return (
    <section className="ppt-dashboard-snapshot-card">
      <div className="ppt-dashboard-snapshot-head">
        <div>
          <PptBadge tone={store?.isPublished ? "success" : "warning"}>
            {store?.isPublished ? "Published" : "Unpublished"}
          </PptBadge>
          <h2>Storefront</h2>
        </div>
        <button type="button" onClick={onOpenStorefront}>Customize</button>
      </div>
      <div className="ppt-dashboard-readiness">
        <StatusLine label="Store URL" tone={storeLink ? "success" : "warning"} value={storeLink ? "Ready" : "Missing"} />
        <StatusLine label="WhatsApp" tone={hasWhatsApp ? "success" : "warning"} value={hasWhatsApp ? "Connected" : "Missing"} />
        <StatusLine label="Products" tone="neutral" value="Managed in Products" />
      </div>
      <PptButton
        type="button"
        variant="ghost"
        size="sm"
        disabled={!storeLink}
        icon={<Copy size={15} aria-hidden="true" />}
        onClick={onCopyStoreLink}
      >
        Share Store
      </PptButton>
    </section>
  );
}

function TopProductsCard({
  onOpenProducts,
  products,
}: {
  onOpenProducts: () => void;
  products: Array<{ product: Product; orderCount: number }>;
}) {
  return (
    <section className="ppt-dashboard-snapshot-card">
      <div className="ppt-dashboard-snapshot-head">
        <div>
          <PptBadge tone="info">Performance</PptBadge>
          <h2>Top Products</h2>
        </div>
        <button type="button" onClick={onOpenProducts}>Manage</button>
      </div>
      {products.length ? (
        <div className="ppt-dashboard-mini-list">
          {products.map(({ product, orderCount }) => (
            <div key={product.productId || product.id}>
              <span>{product.title}</span>
              <strong>{orderCount} order{orderCount === 1 ? "" : "s"}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="ppt-dashboard-snapshot-note">
          Product performance appears after your first order.
        </p>
      )}
    </section>
  );
}

function getWalletTransactionTypeLabel(type: WalletTransactionRecord["type"]) {
  const labels: Record<WalletTransactionRecord["type"], string> = {
    adjustment: "Adjustment",
    bonus: "Bonus",
    free_order: "Free Order",
    order_charge: "Order Charge",
    recharge: "Recharge",
    refund: "Refund",
  };

  return labels[type] || type.replace(/_/g, " ");
}

function getLatestTransactionBalanceAfter(
  transactions: WalletTransactionRecord[]
): number {
  const latestTransaction = [...transactions]
    .filter((transaction) => transaction.balanceAfter !== undefined)
    .sort((a, b) => getTimeValue(b.createdAt) - getTimeValue(a.createdAt))[0];

  return Number(latestTransaction?.balanceAfter) || 0;
}

async function reconcileWalletIfActivityIsAhead(
  wallet: SellerWallet | null,
  transactions: WalletTransactionRecord[]
): Promise<SellerWallet | null> {
  if (!wallet) return wallet;

  const latestTransactionBalanceAfter = getLatestTransactionBalanceAfter(transactions);

  if (latestTransactionBalanceAfter <= wallet.balance) return wallet;

  try {
    const result = await reconcileWalletFromActivity();

    return result.wallet;
  } catch (error) {
    console.warn("Wallet balance repair unavailable:", error);
    return {
      ...wallet,
      balance: latestTransactionBalanceAfter,
    };
  }
}

function WalletDashboardSection({
  error,
  transactions,
  wallet,
}: {
  error: string;
  transactions: WalletTransactionRecord[];
  wallet: SellerWallet | null;
}) {
  const [dismissedWalletNotice, setDismissedWalletNotice] = useState("");
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [selectedRechargeAmount, setSelectedRechargeAmount] = useState<number | "custom">(
    WALLET_RECHARGE_AMOUNTS[0]
  );
  const [customRechargeAmount, setCustomRechargeAmount] = useState("");
  const [rechargeError, setRechargeError] = useState("");
  const [rechargeLoading, setRechargeLoading] = useState(false);

  if (!wallet) {
    return (
      <section className="ppt-dashboard-wallet-card">
        <div className="ppt-dashboard-wallet-head">
          <div className="ppt-dashboard-wallet-title">
            <span className="ppt-dashboard-wallet-icon">
              <WalletIcon size={18} aria-hidden="true" />
            </span>
            <div>
              <PptBadge tone="primary">Wallet</PptBadge>
              <h2>Wallet Balance</h2>
            </div>
          </div>
        </div>
        <div className="ppt-dashboard-wallet-empty">
          {error || "Wallet information is temporarily unavailable."}
        </div>
      </section>
    );
  }

  const latestTransactionBalanceAfter = getLatestTransactionBalanceAfter(transactions);
  const displayWallet =
    latestTransactionBalanceAfter > wallet.balance
      ? {
          ...wallet,
          balance: latestTransactionBalanceAfter,
        }
      : wallet;
  const displayStatus = getWalletDisplayStatus(displayWallet);
  const paidOrdersRemaining = Math.floor(
    displayWallet.balance / WALLET_ORDER_CHARGE_AMOUNT
  );
  const walletNotice =
    displayStatus.label === "Paused"
      ? {
          key: "paused",
          tone: "danger" as const,
          title: "Wallet paused",
          message: "Recharge required to receive new orders.",
        }
      : displayStatus.label === "Low balance"
        ? {
            key: "low",
            tone: "warning" as const,
            title: "Wallet running low",
            message: "Recharge recommended so new orders are not interrupted.",
          }
        : null;
  const rechargeAmount =
    selectedRechargeAmount === "custom"
      ? Math.round(Number(customRechargeAmount) || 0)
      : selectedRechargeAmount;

  async function handleStartRecharge() {
    try {
      setRechargeLoading(true);
      setRechargeError("");

      if (
        rechargeAmount < WALLET_RECHARGE_MIN_AMOUNT ||
        rechargeAmount > WALLET_RECHARGE_MAX_AMOUNT
      ) {
        throw new Error(
          `Recharge amount must be between ${formatINR(WALLET_RECHARGE_MIN_AMOUNT)} and ${formatINR(WALLET_RECHARGE_MAX_AMOUNT)}.`
        );
      }

      const recharge = await startWalletRecharge(rechargeAmount);
      window.location.assign(recharge.paymentLink);
    } catch (err) {
      setRechargeError(
        err instanceof Error ? err.message : "Wallet recharge could not be started."
      );
    } finally {
      setRechargeLoading(false);
    }
  }

  return (
    <div className="ppt-dashboard-wallet-stack">
      {walletNotice && dismissedWalletNotice !== walletNotice.key ? (
        <div className="relative">
          <PptNotice tone={walletNotice.tone} title={walletNotice.title}>
            {walletNotice.message}
          </PptNotice>
          <button
            type="button"
            aria-label="Dismiss wallet notice"
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full border border-black/10 bg-white/70 text-gray-600 transition hover:bg-white hover:text-gray-950"
            onClick={() => setDismissedWalletNotice(walletNotice.key)}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <section className="ppt-dashboard-wallet-card">
        <div className="ppt-dashboard-wallet-head">
          <div className="ppt-dashboard-wallet-title">
            <span className="ppt-dashboard-wallet-icon">
              <WalletIcon size={18} aria-hidden="true" />
            </span>
            <div>
              <PptBadge tone="primary">Wallet</PptBadge>
              <h2>Wallet Balance</h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PptBadge tone={displayStatus.tone}>{displayStatus.label}</PptBadge>
            <PptButton
              type="button"
              variant="dark"
              size="sm"
              rounded="pill"
              icon={<WalletIcon size={15} aria-hidden="true" />}
              onClick={() => setRechargeOpen(true)}
            >
              Recharge Wallet
            </PptButton>
          </div>
        </div>

        <div className="ppt-dashboard-wallet-summary">
          <div className="ppt-dashboard-wallet-balance">
            <span>Wallet Balance</span>
            <div className="ppt-dashboard-wallet-balance-value">
              <strong>{formatINR(displayWallet.balance)}</strong>
              <button
                type="button"
                className="ppt-dashboard-wallet-balance-add"
                aria-label="Add money to wallet"
                title="Add money to wallet"
                onClick={() => setRechargeOpen(true)}
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="ppt-dashboard-wallet-metrics">
            <Metric
              label="Free Orders Remaining"
              value={String(displayWallet.freeOrdersRemaining)}
            />
            <Metric
              label="Estimated Paid Orders Remaining"
              value={String(paidOrdersRemaining)}
            />
            <Metric label="Wallet Status" value={displayStatus.label} />
            <Metric
              label="Last Updated"
              value={formatRelativeTime(displayWallet.updatedAt || displayWallet.createdAt)}
            />
          </div>
        </div>
      </section>

      <section className="ppt-dashboard-wallet-help">
        <h2>How Wallet Works</h2>
        <ul>
          <li>Your first {INITIAL_FREE_ORDERS} orders are free.</li>
          <li>
            After free orders are exhausted, {formatINR(WALLET_ORDER_CHARGE_AMOUNT)} will
            be deducted from your wallet for every new order.
          </li>
          <li>
            When your wallet runs low, we'll notify you by email and inside your
            dashboard.
          </li>
          <li>
            If your wallet reaches {formatINR(0)}, your store will temporarily stop
            receiving new orders until you recharge.
          </li>
        </ul>
      </section>

      <section className="ppt-dashboard-wallet-activity">
        <div className="ppt-dashboard-wallet-activity-head">
          <div>
            <PptBadge tone="info">Wallet Activity</PptBadge>
            <h2>Transaction history</h2>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="ppt-dashboard-wallet-empty">
            No wallet activity yet.
          </div>
        ) : (
          <div className="ppt-dashboard-wallet-table-wrap">
            <table className="ppt-dashboard-wallet-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Reference</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.transactionId}>
                    <td>{formatDate(transaction.createdAt)}</td>
                    <td>{getWalletTransactionTypeLabel(transaction.type)}</td>
                    <td>{formatINR(transaction.amount)}</td>
                    <td>{formatINR(transaction.balanceAfter)}</td>
                    <td>{transaction.referenceId || "-"}</td>
                    <td>{transaction.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {rechargeOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/40 p-3">
          <section className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  PayPerTap Wallet
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-gray-950">
                  Recharge Wallet
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  This balance is only for seller wallet charges. Customer payments still go directly to you.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close recharge"
                className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 text-gray-600 transition hover:border-gray-950 hover:text-gray-950"
                onClick={() => setRechargeOpen(false)}
              >
                <X size={17} aria-hidden="true" />
              </button>
            </header>

            <div className="grid gap-5 p-5">
              <div className="grid gap-2 sm:grid-cols-4">
                {WALLET_RECHARGE_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      selectedRechargeAmount === amount
                        ? "border-gray-950 bg-gray-950 text-white"
                        : "border-gray-200 bg-white text-gray-900 hover:border-gray-400"
                    }`}
                    onClick={() => {
                      setSelectedRechargeAmount(amount);
                      setRechargeError("");
                    }}
                  >
                    {formatINR(amount)}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-medium text-gray-800">
                Custom Amount
                <input
                  value={customRechargeAmount}
                  onChange={(event) => {
                    setSelectedRechargeAmount("custom");
                    setCustomRechargeAmount(
                      event.target.value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "")
                    );
                    setRechargeError("");
                  }}
                  placeholder={`${WALLET_RECHARGE_MIN_AMOUNT}`}
                  type="number"
                  min={WALLET_RECHARGE_MIN_AMOUNT}
                  max={WALLET_RECHARGE_MAX_AMOUNT}
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-950"
                />
                <span className="mt-1 block text-xs leading-5 text-gray-500">
                  Minimum {formatINR(WALLET_RECHARGE_MIN_AMOUNT)}. Maximum{" "}
                  {formatINR(WALLET_RECHARGE_MAX_AMOUNT)}.
                </span>
              </label>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <Metric label="Selected recharge" value={formatINR(rechargeAmount)} />
              </div>

              {rechargeError ? <ErrorBox message={rechargeError} /> : null}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <PptButton
                  type="button"
                  variant="secondary"
                  onClick={() => setRechargeOpen(false)}
                >
                  Cancel
                </PptButton>
                <PptButton
                  type="button"
                  variant="primary"
                  loading={rechargeLoading}
                  icon={<WalletIcon size={16} aria-hidden="true" />}
                  onClick={handleStartRecharge}
                >
                  Proceed to Recharge
                </PptButton>
              </div>
            </div>
          </section>
        </div>
      ) : null}
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
      helper: "Create one order-ready product before sharing your store.",
      cta: "Add product",
      onClick: () => onSelectTab("Products"),
    };
  }

  if (pendingFollowUps > 0) {
    return {
      badge: "Needs follow-up",
      title: "Follow up pending orders",
      helper: `${pendingFollowUps} buyer${pendingFollowUps === 1 ? "" : "s"} need a WhatsApp reply.`,
      cta: "Open orders",
      onClick: () => onSelectTab("Orders"),
    };
  }

  if (!instagramProfile) {
    return {
      badge: "Trust signal",
      title: "Add Instagram profile",
      helper: "Visible social proof helps buyers trust your store faster.",
      cta: "Customize store",
      onClick: () => onSelectTab("Storefront"),
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
  Orders,
  onSelectTab,
  store,
}: {
  Orders: CheckoutSession[];
  onSelectTab: (tab: DashboardTab) => void;
  store: Store | null;
}) {
  return (
    <section className="ppt-dashboard-activity-card">
      <div className="ppt-dashboard-activity-head">
        <div>
          <PptBadge tone="info">Recent activity</PptBadge>
          <h2>Latest orders</h2>
        </div>
        <button type="button" onClick={() => onSelectTab("Orders")}>
          View all
        </button>
      </div>

      {Orders.length === 0 ? (
        <PptEmptyState
          title="No orders yet"
          description="Orders will appear here when buyers submit their details."
          icon={<CalendarCheck size={22} aria-hidden="true" />}
          className="ppt-dashboard-empty-compact"
        />
      ) : (
        <div className="ppt-dashboard-activity-list">
          {Orders.map((order) => {
            const message = buildSellerPaymentCollectionMessage(
              checkoutToSellerMessageInput(order, store)
            );
            const whatsappUrl = buildOrderWhatsAppUrl(order.buyerPhone, message);

            return (
              <article className="ppt-dashboard-activity-row" key={order.checkoutId}>
                <div className="min-w-0">
                  <strong>{order.buyerName || "Buyer"}</strong>
                  <span>{order.productTitle}</span>
                  <OrderVariantLine order={order} />
                  <small>
                    Amount due {formatINR(getSellerAmountDueFromOrder(order))} - {getShortDate(order.createdAt)}
                  </small>
                </div>
                <PptBadge
                  tone={getCheckoutStatusTone(order.status)}
                  className="ppt-dashboard-activity-badge"
                >
                  {getStatusLabel(order.status)}
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

type OrderTrendPoint = {
  key: string;
  label: string;
  count: number;
};

function getLastSevenDayOrderTrend(Orders: CheckoutSession[]): OrderTrendPoint[] {
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

  Orders.forEach((Order) => {
    const millis = getTimeValue(Order.createdAt);
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

function OrderTrendCard({ trend }: { trend: OrderTrendPoint[] }) {
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
          <strong>Order trend</strong>
          <span>Last 7 days of real orders.</span>
        </div>
        <PptBadge tone="primary">7 days</PptBadge>
      </div>

      {hasData ? (
        <div className="ppt-dashboard-chart-wrap">
          <svg className="pds-chart" viewBox={`0 0 ${width} ${height}`} role="img">
            <title>Orders over the last seven days</title>
            <defs>
              <linearGradient id="pptOrderTrendFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(91,53,245,.20)" />
                <stop offset="100%" stopColor="rgba(91,53,245,0)" />
              </linearGradient>
            </defs>
            <polyline
              points={`${points[0].x},${height - 18} ${path} ${points[points.length - 1].x},${height - 18}`}
              fill="url(#pptOrderTrendFill)"
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
          title="Your order trend will appear after your first order."
          description="When buyers place orders, daily counts will show here."
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
          onClick={() => onSelectTab("Storefront")}
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

function RecentOrdersCard({
  Orders,
  onSelectTab,
  store,
}: {
  Orders: CheckoutSession[];
  onSelectTab: (tab: DashboardTab) => void;
  store: Store | null;
}) {
  return (
    <section className="pds-panel">
      <div className="ppt-dashboard-section-head">
        <div>
          <PptBadge tone="info">Recent activity</PptBadge>
          <h2>Recent orders</h2>
          <p>Buyer orders and WhatsApp follow-ups.</p>
        </div>
        <PptButton type="button" variant="ghost" size="sm" onClick={() => onSelectTab("Orders")}>
          View all
        </PptButton>
      </div>

      {Orders.length === 0 ? (
        <PptEmptyState
          title="No orders yet"
          description="Orders will appear here when buyers submit their details."
          icon={<CalendarCheck size={24} aria-hidden="true" />}
          className="ppt-dashboard-empty-compact"
        />
      ) : (
        <div className="ppt-dashboard-list">
          {Orders.map((order) => {
            const message = buildSellerPaymentCollectionMessage(
              checkoutToSellerMessageInput(order, store)
            );
            const whatsappUrl = buildOrderWhatsAppUrl(order.buyerPhone, message);

            return (
              <article className="ppt-dashboard-row" key={order.checkoutId}>
                <div className="ppt-dashboard-row-icon">
                  <PptBrandIcon type="whatsapp" size={18} />
                </div>
                <div className="min-w-0">
                  <strong>{order.buyerName || "Buyer"}</strong>
                  <span>{order.productTitle}</span>
                  <OrderVariantLine order={order} />
                  <small>
                    {order.buyerPhone} - Amount due {formatINR(getSellerAmountDueFromOrder(order))}
                  </small>
                </div>
                <PptBadge tone={getCheckoutStatusTone(order.status)}>
                  {getStatusLabel(order.status)}
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
          {products.slice(0, 5).map((product) => {
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

function getSelectedSingleImageFile(fileList: FileList | null) {
  const file = fileList?.[0] ?? null;
  if (file) assertValidImageFile(file);
  return file;
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
            Keep pricing at product level. Buyers select the exact piece before ordering.
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
                          .join(" - ")}
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

function WorkspaceSectionHeader({
  action,
  eyebrow,
  helper,
  title,
}: {
  action?: ReactNode;
  eyebrow: string;
  helper: string;
  title: string;
}) {
  return (
    <section className="ppt-dashboard-workspace-head">
      <div>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        <span>{helper}</span>
      </div>
      {action ? <div className="ppt-dashboard-workspace-actions">{action}</div> : null}
    </section>
  );
}

function ProductsWorkspace({
  Orders,
  collections,
  onAddProduct,
  onCollectionsChanged,
  onProductCreated,
  onProductRemoved,
  onProductUpdated,
  onProductsChanged,
  onSelectTab,
  openAddProductSignal,
  products,
  store,
  user,
}: {
  Orders: CheckoutSession[];
  collections: StoreCollection[];
  onAddProduct: () => void;
  onCollectionsChanged: (collections: StoreCollection[]) => void;
  onProductCreated: (product: Product) => void;
  onProductRemoved: (productId: string) => void;
  onProductUpdated: (product: Product) => void;
  onProductsChanged: (products: Product[]) => void;
  onSelectTab: (tab: DashboardTab) => void;
  openAddProductSignal: number;
  products: Product[] | null | undefined;
  store: Store | null;
  user: User | null;
}) {
  const safeProducts = Array.isArray(products) ? products : [];
  const liveProducts = safeProducts.filter(
    (product) => product.status === "open" && getAvailableQuantity(product) > 0
  ).length;
  const outOfStock = safeProducts.filter((product) => getAvailableQuantity(product) <= 0).length;

  return (
    <section className="ppt-dashboard-workspace">
      <WorkspaceSectionHeader
        eyebrow="Catalog"
        title="Products"
        helper="Manage live products, inventory, variants, images, size charts, and collections."
        action={
          <>
            <PptButton type="button" variant="primary" icon={<Plus size={16} />} onClick={onAddProduct}>
              Add Product
            </PptButton>
            <PptButton
              type="button"
              variant="secondary"
              icon={<FolderOpen size={16} />}
              onClick={() =>
                document
                  .getElementById("dashboard-collections")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              Collections below
            </PptButton>
          </>
        }
      />
      <div className="ppt-dashboard-compact-grid">
        <CompactStatCard icon={<ShoppingBag size={16} />} label="Products" value={safeProducts.length} helper={`${liveProducts} live`} />
        <CompactStatCard icon={<CheckCircle2 size={16} />} label="Collections" value={collections.length} helper="storefront groups" tone="info" />
        <CompactStatCard icon={<AlertTriangle size={16} />} label="Out of stock" value={outOfStock} helper="need attention" />
        <CompactStatCard icon={<CalendarCheck size={16} />} label="Product orders" value={Orders.length} helper="all-time orders" tone="success" />
      </div>
      <ProductsTab
        Orders={Orders}
        collections={collections}
        onProductCreated={onProductCreated}
        onProductRemoved={onProductRemoved}
        onProductUpdated={onProductUpdated}
        onSelectTab={onSelectTab}
        openAddProductSignal={openAddProductSignal}
        products={products}
        store={store}
        user={user}
      />
      <div id="dashboard-collections">
        <CollectionsManager
          collections={collections}
          onAddProduct={onAddProduct}
          onCollectionsChanged={onCollectionsChanged}
          onProductsChanged={onProductsChanged}
          onViewProducts={() => onSelectTab("Products")}
          products={safeProducts}
          store={store}
          user={user}
        />
      </div>
    </section>
  );
}

function ProductsTab({
  Orders,
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
  Orders: CheckoutSession[];
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
  const [sizeChartImageFile, setSizeChartImageFile] = useState<File | null>(null);
  const [sizeChartFileName, setSizeChartFileName] = useState("");
  const [sizeChartPreviewUrl, setSizeChartPreviewUrl] = useState("");
  const [saveProgress, setSaveProgress] = useState<ProductSaveProgress | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const addProductFormRef = useRef<HTMLFormElement>(null);
  const addProductTitleRef = useRef<HTMLInputElement>(null);
  const safeProducts = Array.isArray(products) ? products : [];
  const [visibleProductRows, setVisibleProductRows] = useState(20);
  const visibleProducts = safeProducts.slice(0, visibleProductRows);
  const canLoadMoreProductRows = visibleProductRows < safeProducts.length;

  function getProductOrderCount(product: Product): number {
    const productId = product.productId || product.id;
    return Orders.filter((Order) => Order.productId === productId).length;
  }

  async function handleProductDeleted(product: Product) {
    const productId = product.productId || product.id;

    if (!productId) return;

    const OrderCount = getProductOrderCount(product);

    if (OrderCount > 0) {
      const confirmed = window.confirm(
        `This product has ${OrderCount} order record${OrderCount === 1 ? "" : "s"}. It will be removed from the storefront and kept in history. Continue?`
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
        preserveHistory: OrderCount > 0,
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
    setVisibleProductRows(20);
  }, [safeProducts.length]);

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

  useEffect(() => {
    if (!sizeChartImageFile) {
      setSizeChartPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(sizeChartImageFile);
    setSizeChartPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [sizeChartImageFile]);

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
        sizeChartImageFile,
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
      setSizeChartImageFile(null);
      setSizeChartFileName("");
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
              Add and manage the items buyers can order from your storefront.
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
              onClick={() => onSelectTab("Products")}
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
                Enter the full product price. Buyers place an order first, then pay you directly.
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
                  Open: buyers can order. Reserved: temporarily unavailable. Sold: no longer available. Draft or unpublished: hidden from buyers.
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
            OrderCount={getProductOrderCount(editingProduct)}
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
            message="Add your first product so buyers can order from your store."
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
              onClick={() => onSelectTab("Products")}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900"
            >
              Create collection
            </button>
          </EmptyState>
        ) : (
          <div className="divide-y divide-gray-100">
            {visibleProducts.map((product) => {
              const productId = product.productId || product.id;
              const editingProductId = editingProduct?.productId || editingProduct?.id;

              return (
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
                suppressImage={Boolean(productId && productId === editingProductId)}
              />
              );
            })}
            {safeProducts.length > 20 ? (
              <div className="p-4 text-center">
                {canLoadMoreProductRows ? (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleProductRows((current) =>
                        Math.min(current + 20, safeProducts.length)
                      )
                    }
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900"
                  >
                    Load more products
                  </button>
                ) : (
                  <p className="text-xs font-medium text-gray-500">
                    All products loaded.
                  </p>
                )}
              </div>
            ) : null}
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
            Collections are storefront groups, not sellable products. Add price, stock, and order status on products.
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
  OrderCount,
  collections,
  onDeleted,
  onCancel,
  onSaved,
  product,
  user,
}: {
  OrderCount: number;
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
  const [sizeChartImageFile, setSizeChartImageFile] = useState<File | null>(null);
  const [sizeChartFileName, setSizeChartFileName] = useState("");
  const [sizeChartPreviewUrl, setSizeChartPreviewUrl] = useState(
    getProductSizeChartImageUrl(product)
  );
  const [saveProgress, setSaveProgress] = useState<ProductSaveProgress | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const editFormRef = useRef<HTMLFormElement>(null);
  const editTitleRef = useRef<HTMLInputElement>(null);
  const savedImageItems = getProductPreviewImageItems(product);
  const savedSizeChartImageUrl = getProductSizeChartImageUrl(product);
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
    if (!sizeChartImageFile) {
      setSizeChartPreviewUrl(getProductSizeChartImageUrl(product));
      return;
    }

    const objectUrl = URL.createObjectURL(sizeChartImageFile);
    setSizeChartPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [sizeChartImageFile, product]);

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
        sizeChartImageFile,
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
      setSizeChartImageFile(null);
      setSizeChartFileName("");
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
          Enter the full product price. Buyers place an order first, then pay you directly.
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
            Open: buyers can order. Reserved: temporarily unavailable. Sold: no longer available. Draft or unpublished: hidden from buyers.
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
        <label className="text-sm font-medium text-gray-800">
          Replace images (up to {MAX_PRODUCT_IMAGE_COUNT} images max)
        </label>
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
          {OrderCount > 0
            ? "This product has order history, so delete will hide it from the storefront and keep past records intact."
            : "This product has no orders, so delete will permanently remove it."}
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="mt-3 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {OrderCount > 0 ? "Remove from storefront" : "Delete product"}
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
  suppressImage = false,
}: {
  collections: StoreCollection[];
  onDelete: () => void;
  onEdit: () => void;
  product: Product;
  suppressImage?: boolean;
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
        {imageUrl && !suppressImage ? (
          <img
            src={imageUrl}
            alt={product.title}
            decoding="async"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-gray-400">
            {suppressImage ? "Editing" : "Product image"}
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
      </div>
    </div>
  );
}

function CustomersTab({
  Orders,
  customers,
  products,
  storeLink,
}: {
  Orders: CheckoutSession[];
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
          View people who ordered or shared details through your store. Use this list to follow up on WhatsApp, confirm orders, or message previous buyers.
        </p>
        <p className="mt-2 text-xs leading-5 text-gray-500">
          Buyer details are shown here only to help you confirm orders and follow up with buyers.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        {customers.length === 0 ? (
          <EmptyState title="No buyer contacts yet" message="Buyer details will appear here after your first order." />
        ) : (
          <div className="divide-y divide-gray-100">
            {customers.map((customer) => (
              <CustomerRow
                Orders={Orders.filter((Order) => {
                  const OrderPhone = Order.buyerPhone.replace(/[^\d]/g, "");
                  const customerPhone = customer.buyerPhone.replace(/[^\d]/g, "");
                  return OrderPhone === customerPhone;
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
  Orders,
  customer,
  products,
  storeLink,
}: {
  Orders: CheckoutSession[];
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
            <PptBadge tone={getCheckoutStatusTone(customer.lastOrderstatus)}>
              {getStatusLabel(customer.lastOrderstatus)}
            </PptBadge>
          </div>
          <p className="mt-1 break-words text-xs text-gray-500">
            {customer.buyerPhone}
            {customer.buyerCity ? ` - ${customer.buyerCity}` : ""}
            {customer.buyerPincode ? ` ${customer.buyerPincode}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            <span>{customer.totalOrders} order{customer.totalOrders === 1 ? "" : "s"}</span>
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
            <Metric label="Email" value={Orders.find((Order) => Order.buyerEmail)?.buyerEmail || "Not shared"} />
            <Metric label="Full address" value={Orders[0]?.buyerAddress || "Not shared"} />
            <Metric label="Total orders" value={String(customer.totalOrders)} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Orders</p>
            <div className="mt-2 grid gap-2">
              {Orders.map((order) => (
                <div
                  key={order.checkoutId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white p-3 text-sm"
                >
                  <span className="font-medium text-gray-950">{order.productTitle}</span>
                  <OrderVariantLine order={order} />
                  <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                  <PptBadge tone={getCheckoutStatusTone(order.status)}>
                    {getStatusLabel(order.status)}
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
                      ? `Already ordered: ${product.title}`
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

function StorefrontWorkspace({
  onStoreUpdated,
  onTogglePublish,
  publishing,
  store,
  storeLink,
  storeSlug,
}: {
  onStoreUpdated: (store: Store) => void;
  onTogglePublish: () => void;
  publishing: boolean;
  store: Store | null;
  storeLink: string;
  storeSlug: string;
}) {
  return (
    <section className="ppt-dashboard-workspace">
      <WorkspaceSectionHeader
        eyebrow="Online store"
        title="Storefront"
        helper="Control the buyer-facing experience: hero, branding, logo, publish state, store URL, and preview."
        action={
          <>
            <PptButton type="button" variant="secondary" disabled={!storeLink} icon={<ExternalLink size={16} />} onClick={() => storeLink && window.open(storeLink, "_blank", "noopener,noreferrer")}>
              Preview
            </PptButton>
            <PptButton type="button" variant={store?.isPublished ? "secondary" : "primary"} loading={publishing} onClick={onTogglePublish}>
              {store?.isPublished ? "Unpublish" : "Publish"}
            </PptButton>
          </>
        }
      />
      <StoreTab
        onStoreUpdated={onStoreUpdated}
        onTogglePublish={onTogglePublish}
        publishing={publishing}
        store={store}
        storeLink={storeLink}
        storeSlug={storeSlug}
      />
    </section>
  );
}

function MarketingWorkspace({
  Orders,
  customers,
  products,
  storeLink,
}: {
  Orders: CheckoutSession[];
  customers: DerivedCustomerLead[];
  products: Product[];
  storeLink: string;
}) {
  return (
    <section className="ppt-dashboard-workspace">
      <WorkspaceSectionHeader
        eyebrow="Growth"
        title="Marketing"
        helper="Reuse WhatsApp templates, retarget previous buyers, and share new drops without rebuilding messages every time."
        action={
          <PptButton type="button" variant="secondary" icon={<Copy size={16} />} disabled={!storeLink} onClick={() => storeLink && copyText(storeLink)}>
            Copy Store Link
          </PptButton>
        }
      />
      <QuickReplies />
      <CustomersTab
        Orders={Orders}
        customers={customers}
        products={products}
        storeLink={storeLink}
      />
    </section>
  );
}

function WalletWorkspace({
  wallet,
  walletError,
  walletTransactions,
}: {
  wallet: SellerWallet | null;
  walletError: string;
  walletTransactions: WalletTransactionRecord[];
}) {
  return (
    <section className="ppt-dashboard-workspace">
      <WorkspaceSectionHeader
        eyebrow="Finance"
        title="Wallet"
        helper="Track PayPerTap order charges, recharge balance, free orders, transaction history, and wallet alerts."
      />
      <WalletDashboardSection
        error={walletError}
        transactions={walletTransactions}
        wallet={wallet}
      />
      <PaymentsTab />
    </section>
  );
}

function SettingsWorkspace({
  onStoreUpdated,
  onTogglePublish,
  publishing,
  store,
  storeLink,
  storeSlug,
}: {
  onStoreUpdated: (store: Store) => void;
  onTogglePublish: () => void;
  publishing: boolean;
  store: Store | null;
  storeLink: string;
  storeSlug: string;
}) {
  return (
    <section className="ppt-dashboard-workspace">
      <WorkspaceSectionHeader
        eyebrow="Business settings"
        title="Settings"
        helper="Manage contact details, policies, order mode, payment link, return URL, and store safety controls."
      />
      <StoreTab
        onStoreUpdated={onStoreUpdated}
        onTogglePublish={onTogglePublish}
        publishing={publishing}
        store={store}
        storeLink={storeLink}
        storeSlug={storeSlug}
      />
    </section>
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
  const [ownerName, setOwnerName] = useState(store?.ownerName || "");
  const [supportEmail, setSupportEmail] = useState(store?.supportEmail || "");
  const [supportPhone, setSupportPhone] = useState(store?.supportPhone || "");
  const [returnsPolicyType, setReturnsPolicyType] = useState<
    NonNullable<Store["returnsPolicyType"]>
  >(store?.returnsPolicyType || "exchange_only");
  const [returnsPolicyNotes, setReturnsPolicyNotes] = useState(
    store?.returnsPolicyNotes || ""
  );
  const [paymentMode, setPaymentMode] = useState<StorePaymentMode>(
    store?.paymentMode || "cod"
  );
  const [advanceAmount, setAdvanceAmount] = useState(
    store?.advanceAmount ? String(store.advanceAmount) : "100"
  );
  const [paymentLink, setPaymentLink] = useState(store?.paymentLink || "");
  const [paymentReturnToken, setPaymentReturnToken] = useState(
    store?.paymentReturnToken || ""
  );
  const [copiedPaymentReturnUrl, setCopiedPaymentReturnUrl] = useState(false);
  const [heroHeading, setHeroHeading] = useState(store?.heroTitle || store?.heroHeading || "");
  const [heroSubtitle, setHeroSubtitle] = useState(store?.heroSubtitle || "");
  const [heroEyebrowText, setHeroEyebrowText] = useState(store?.heroEyebrowText || "");
  const [heroPrimaryCtaText, setHeroPrimaryCtaText] = useState(
    store?.heroPrimaryCtaText || ""
  );
  const [heroSecondaryCtaText, setHeroSecondaryCtaText] = useState(
    store?.heroSecondaryCtaText || ""
  );
  const [announcementText, setAnnouncementText] = useState(store?.announcementText || "");
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroFileName, setHeroFileName] = useState("");
  const [heroPreviewUrl, setHeroPreviewUrl] = useState("");
  const [saveProgress, setSaveProgress] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoFileName, setLogoFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [appearanceSaving, setAppearanceSaving] = useState(false);
  const [appearanceSaved, setAppearanceSaved] = useState(false);
  const [appearanceError, setAppearanceError] = useState("");
  const [appearanceProgress, setAppearanceProgress] = useState("");
  const [whatsappPhoneError, setWhatsappPhoneError] = useState("");
  const selectedThemeId = getSelectedStorefrontThemeId(store);
  const paymentReturnUrl = getPaymentReturnUrl(paymentReturnToken);
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
        paymentMode,
        advanceAmount: Math.max(1, Math.round(Number(advanceAmount) || 100)),
        paymentProvider: "razorpay",
        paymentLink,
        paymentReturnToken,
        heroTitle: heroHeading,
        heroSubtitle,
        heroEyebrowText,
        heroPrimaryCtaText,
        heroSecondaryCtaText,
        announcementText,
        heroImageUrl: store.heroImageUrl,
      }
    : null;
  const safeLogoUrl = getStoreLogoUrl(draftStore || store);
  const savedHeroImageUrl = getDisplayImageUrl(store?.heroImageUrl);
  const heroImagePreviewUrl = heroPreviewUrl || savedHeroImageUrl;
  const announcementPreviewText =
    announcementText.trim() || DEFAULT_ANNOUNCEMENT_TEXT;
  const heroTitlePreview = heroHeading.trim() || DEFAULT_HERO_TITLE;
  const heroSubtitlePreview = heroSubtitle.trim() || DEFAULT_HERO_SUBTITLE;
  const heroEyebrowPreview = heroEyebrowText.trim() || DEFAULT_HERO_EYEBROW_TEXT;
  const heroPrimaryCtaPreview =
    heroPrimaryCtaText.trim() || DEFAULT_HERO_PRIMARY_CTA_TEXT;
  const heroSecondaryCtaPreview =
    heroSecondaryCtaText.trim() || DEFAULT_HERO_SECONDARY_CTA_TEXT;

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
    setPaymentMode(store?.paymentMode || "cod");
    setAdvanceAmount(store?.advanceAmount ? String(store.advanceAmount) : "100");
    setPaymentLink(store?.paymentLink || "");
    setPaymentReturnToken(store?.paymentReturnToken || "");
    setCopiedPaymentReturnUrl(false);
    setHeroHeading(store?.heroTitle || store?.heroHeading || "");
    setHeroSubtitle(store?.heroSubtitle || "");
    setHeroEyebrowText(store?.heroEyebrowText || "");
    setHeroPrimaryCtaText(store?.heroPrimaryCtaText || "");
    setHeroSecondaryCtaText(store?.heroSecondaryCtaText || "");
    setAnnouncementText(store?.announcementText || "");
    setHeroFile(null);
    setHeroFileName("");
    setSaveProgress("");
    setAppearanceProgress("");
    setWhatsappPhoneError("");
  }, [store]);

  useEffect(() => {
    return () => {
      if (heroPreviewUrl) {
        URL.revokeObjectURL(heroPreviewUrl);
      }
    };
  }, [heroPreviewUrl]);

  async function handleHeroImageChange(file: File | null, resetInput: () => void) {
    if (!file) {
      setHeroFile(null);
      setHeroFileName("");
      return;
    }

    try {
      assertValidImageFile(file);
      const croppedFile = await compressHeroImage(file);
      setHeroFile(file);
      setHeroFileName(file.name);
      setAppearanceError("");
      setAppearanceSaved(false);
      setAppearanceProgress("");
      setHeroPreviewUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return URL.createObjectURL(croppedFile);
      });
    } catch (err) {
      resetInput();
      setHeroFile(null);
      setHeroFileName("");
      setHeroPreviewUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return "";
      });
      setAppearanceError(
        err instanceof Error ? err.message : "Could not process this image. Please try another photo."
      );
    }
  }

  async function handleSaveAppearance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!store?.storeId) return;

    try {
      setAppearanceSaving(true);
      setAppearanceSaved(false);
      setAppearanceError("");
      setAppearanceProgress("");

      let uploadedHero: { url: string; key: string } | null = null;
      if (heroFile) {
        setAppearanceProgress("Optimizing hero image...");
        const optimizedHeroFile = await compressHeroImage(heroFile);
        setAppearanceProgress("Uploading hero image...");
        uploadedHero = await uploadOptimizedHeroImage(optimizedHeroFile);
      }

      setAppearanceProgress("Saving storefront...");
      const updatedFields = await updateStoreCustomization(store.storeId, {
        heroTitle: heroHeading,
        heroSubtitle,
        heroEyebrowText,
        heroPrimaryCtaText,
        heroSecondaryCtaText,
        announcementText,
        heroImageUrl: uploadedHero?.url,
        heroImageKey: uploadedHero?.key,
      });

      onStoreUpdated(updatedFields);
      setHeroFile(null);
      setHeroFileName("");
      setHeroPreviewUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return "";
      });
      setAppearanceSaved(true);
      setAppearanceProgress("Storefront updated.");
    } catch (err) {
      console.error("Storefront appearance update failed:", err);
      setAppearanceError(
        err instanceof Error ? err.message : "Could not save storefront appearance."
      );
    } finally {
      setAppearanceSaving(false);
      setAppearanceProgress((current) => (current === "Storefront updated." ? current : ""));
    }
  }

  async function handleSaveStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!store?.storeId) return;

    try {
      setSaving(true);
      setSaved(false);
      setError("");
      setSaveProgress("");
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
      const normalizedAdvanceAmount = Math.round(Number(advanceAmount) || 0);

      let uploadedLogo: { url: string; key: string } | null = null;
      if (logoFile) {
        uploadedLogo = await uploadImageToR2(logoFile, "stores");
      }

      setSaveProgress("Saving storefront...");
      let updatedFields: Store;
      try {
        updatedFields = await updateStoreCustomization(store.storeId, {
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
          logoUrl: uploadedLogo?.url,
        });
      } catch (customizationError) {
        console.error("Store customization fields update failed:", customizationError);
        throw customizationError;
      }

      setSaveProgress("Saving payment settings...");
      let updatedPaymentSettings: StorePaymentSettings;
      try {
        updatedPaymentSettings = await updateStorePaymentSettings(store.storeId, {
          paymentMode,
          advanceAmount: normalizedAdvanceAmount,
          paymentLink,
        });
      } catch (paymentSettingsError) {
        console.error("Store payment settings update failed:", paymentSettingsError);
        throw paymentSettingsError;
      }

      setPaymentMode(updatedPaymentSettings.paymentMode);
      setAdvanceAmount(String(updatedPaymentSettings.advanceAmount));
      setPaymentLink(updatedPaymentSettings.paymentLink);
      setPaymentReturnToken(updatedPaymentSettings.paymentReturnToken);
      onStoreUpdated({
        ...updatedFields,
        ...updatedPaymentSettings,
      });
      setLogoFile(null);
      setLogoFileName("");
      setSaved(true);
      setSaveProgress("Store settings updated.");
    } catch (err) {
      console.error("Store customization update failed:", err);
      setError(err instanceof Error ? err.message : "Could not save store settings.");
    } finally {
      setSaving(false);
      setSaveProgress((current) => (current === "Store settings updated." ? current : ""));
    }
  }

  return (
    <section className="space-y-4">
      <form
        onSubmit={handleSaveAppearance}
        className="rounded-2xl border border-gray-200 bg-white p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Storefront appearance</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Customize the first section buyers see when they open your store.
            </p>
          </div>
          <div className="grid gap-2 sm:flex sm:items-center">
            <PptButton
              type="button"
              variant="secondary"
              icon={<ExternalLink size={16} />}
              disabled={!storeLink}
              onClick={() => {
                if (storeLink) window.open(storeLink, "_blank", "noopener,noreferrer");
              }}
            >
              View store
            </PptButton>
            <PptButton
              type="submit"
              loading={appearanceSaving}
              success={appearanceSaved}
              disabled={!store?.storeId || appearanceSaving}
            >
              {appearanceSaved ? "Storefront updated" : "Save storefront appearance"}
            </PptButton>
          </div>
        </div>

        <section className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold tracking-tight text-gray-950">
              Hero and announcement
            </h3>
            <p className="text-sm leading-6 text-gray-500">
              Set the image and message buyers see before they browse products.
            </p>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-semibold text-gray-950">Hero section</h4>
                  <p className="text-xs leading-5 text-gray-500">
                    Best with a vertical 2:3 image. We'll automatically crop and optimize it for your storefront.
                  </p>
                </div>
                <label className="mt-4 block text-sm font-medium text-gray-800">
                  Hero image
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(event) => {
                      const input = event.currentTarget;
                      void handleHeroImageChange(input.files?.[0] || null, () => {
                        input.value = "";
                      });
                    }}
                    className="mt-2 w-full rounded-xl border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-600 file:mr-2 file:rounded-lg file:border-0 file:bg-gray-950 file:px-2 file:py-1 file:text-xs file:font-medium file:text-white"
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  {heroFileName || "PNG, JPG, JPEG, or WebP. Saved as one optimized 2:3 hero image."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Hero title"
                  value={heroHeading}
                  onChange={(value) => {
                    setHeroHeading(value);
                    setAppearanceSaved(false);
                  }}
                  placeholder={DEFAULT_HERO_TITLE}
                />
                <Field
                  label="Announcement text"
                  value={announcementText}
                  onChange={(value) => {
                    setAnnouncementText(value);
                    setAppearanceSaved(false);
                  }}
                  placeholder={DEFAULT_ANNOUNCEMENT_TEXT}
                />
              </div>
              <Field
                label="Hero subtitle"
                value={heroSubtitle}
                onChange={(value) => {
                  setHeroSubtitle(value);
                  setAppearanceSaved(false);
                }}
                placeholder={DEFAULT_HERO_SUBTITLE}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Hero eyebrow"
                  value={heroEyebrowText}
                  onChange={(value) => {
                    setHeroEyebrowText(value);
                    setAppearanceSaved(false);
                  }}
                  placeholder={DEFAULT_HERO_EYEBROW_TEXT}
                />
                <Field
                  label="Primary button"
                  value={heroPrimaryCtaText}
                  onChange={(value) => {
                    setHeroPrimaryCtaText(value);
                    setAppearanceSaved(false);
                  }}
                  placeholder={DEFAULT_HERO_PRIMARY_CTA_TEXT}
                />
                <Field
                  label="Secondary button"
                  value={heroSecondaryCtaText}
                  onChange={(value) => {
                    setHeroSecondaryCtaText(value);
                    setAppearanceSaved(false);
                  }}
                  placeholder={DEFAULT_HERO_SECONDARY_CTA_TEXT}
                />
              </div>
            </div>

            <Theme1HeroPreviewCard
              announcement={announcementPreviewText}
              eyebrow={heroEyebrowPreview}
              heroImageUrl={heroImagePreviewUrl}
              logoUrl={safeLogoUrl}
              primaryCtaText={heroPrimaryCtaPreview}
              secondaryCtaText={heroSecondaryCtaPreview}
              storeName={storeName || store?.storeName || "Store name"}
              subtitle={heroSubtitlePreview}
              title={heroTitlePreview}
            />
          </div>
        </section>

        {appearanceProgress ? (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
            {appearanceProgress}
          </div>
        ) : null}
        {appearanceError ? <ErrorBox message={appearanceError} /> : null}
      </form>

      <form onSubmit={handleSaveStore} className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Store settings</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your store identity, contact details, and trust signals.
            </p>
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
              {saved ? "Store settings updated" : "Save store settings"}
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
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                Store identity
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Logo, contact, and policy details appear across your storefront.
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
            <StorePaymentSettingsPanel
              advanceAmount={advanceAmount}
              copiedReturnUrl={copiedPaymentReturnUrl}
              onAdvanceAmountChange={setAdvanceAmount}
              onCopyReturnUrl={async () => {
                if (!paymentReturnUrl) return;
                await copyText(paymentReturnUrl);
                setCopiedPaymentReturnUrl(true);
              }}
              onPaymentLinkChange={setPaymentLink}
              onPaymentModeChange={setPaymentMode}
              paymentLink={paymentLink}
              paymentMode={paymentMode}
              returnUrl={paymentReturnUrl}
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
                  placeholder="Optional note buyers should know before ordering"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-950"
                />
              </label>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <InfoRow label="Store link name" value={storeSlug || "Not set"} />
              <InfoRow label="Public link" value={storeLink || "Not set"} />
              <InfoRow
                label="Order mode"
                value={paymentMode === "partial_advance" ? "Partial advance" : "Cash on Delivery"}
              />
              <InfoRow label="Payment provider" value="Razorpay" />
              <InfoRow label="Theme" value={storefrontThemeRegistry[selectedThemeId].name} />
            </div>
            <p className="text-xs leading-5 text-gray-500">
              This becomes your public store link, for example paypertap.in/your-store-name.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          These settings control how buyers pay you after placing an order. Customer payments go directly to your seller payment flow.
        </div>
        {saveProgress ? (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
            {saveProgress}
          </div>
        ) : null}
        {error ? <ErrorBox message={error} /> : null}
      </form>

      <StorefrontStyleSummary currentThemeId={selectedThemeId} />

      <QuickReplies />
    </section>
  );
}

function Theme1HeroPreviewCard({
  announcement,
  eyebrow,
  heroImageUrl,
  logoUrl,
  primaryCtaText,
  secondaryCtaText,
  storeName,
  subtitle,
  title,
}: {
  announcement: string;
  eyebrow: string;
  heroImageUrl: string;
  logoUrl: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  storeName: string;
  subtitle: string;
  title: string;
}) {
  const initials = storeName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <article className="overflow-hidden rounded-[28px] border border-gray-200 bg-[#F6F1E8] shadow-sm">
      <div className="bg-[#111111] px-3 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.18em] text-[#F6F1E8]">
        {announcement}
      </div>
      <div className="flex items-center justify-between border-b border-[#DDD4C7] px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#111111] text-xs font-semibold text-[#F6F1E8]">
            {logoUrl ? (
              <img src={logoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              initials || "PT"
            )}
          </span>
          <span className="min-w-0 truncate text-sm font-semibold text-[#111111]">
            {storeName}
          </span>
        </div>
        <span className="text-xs font-semibold text-[#7A2E2E]">Theme 1</span>
      </div>
      <div className="p-3">
        {heroImageUrl ? (
          <div className="relative min-h-[360px] overflow-hidden rounded-lg bg-[#111111]">
            <img
              src={heroImageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-[0.82]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-[#111111]/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-[#F6F1E8]">
              <p className="w-fit border border-[#F6F1E8]/40 bg-[#111111]/40 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em]">
                {eyebrow}
              </p>
              <h3
                className="mt-4 line-clamp-3 break-words text-4xl font-semibold leading-[0.98]"
                style={{ fontFamily: "Georgia, ui-serif, serif" }}
              >
                {title}
              </h3>
              <p className="mt-3 line-clamp-3 text-xs leading-5 text-[#F6F1E8]/80">
                {subtitle}
              </p>
              <div className="mt-4 grid gap-2">
                <span className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#F6F1E8] px-4 text-xs font-bold text-[#111111]">
                  {primaryCtaText} -&gt;
                </span>
                <span className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#F6F1E8]/40 px-4 text-xs font-bold text-[#F6F1E8]">
                  {secondaryCtaText}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#111111] p-5 text-[#F6F1E8]">
            <p className="w-fit border border-[#F6F1E8]/35 bg-[#2d1b16] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#EFE3C8]">
              New drop
            </p>
            <h3
              className="mt-5 break-words text-4xl font-semibold leading-[0.96]"
              style={{ fontFamily: "Georgia, ui-serif, serif" }}
            >
              {title}
            </h3>
            <p className="mt-4 text-xs leading-5 text-[#F6F1E8]/72">
              {subtitle}
            </p>
            <span className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-[#F6F1E8] px-4 text-xs font-bold text-[#111111]">
              {primaryCtaText} -&gt;
            </span>
            <span className="mt-2 inline-flex min-h-10 items-center justify-center rounded-full border border-[#F6F1E8]/40 px-4 text-xs font-bold text-[#F6F1E8]">
              {secondaryCtaText}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

function StorefrontStyleSummary({
  currentThemeId,
}: {
  currentThemeId: StorefrontThemeId;
}) {
  const theme = storefrontThemeRegistry[currentThemeId];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Storefront style</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            Your store uses PayPerTap&apos;s flagship mobile-first storefront.
            Customize your hero image, text, logo, and contact details above.
          </p>
        </div>
        <PptBadge tone="primary">{theme.previewLabel}</PptBadge>
      </div>
      <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-950">{theme.name}</p>
        <p className="mt-2 text-sm leading-6 text-gray-600">{theme.description}</p>
      </div>
    </section>
  );
}

function QuickReplies() {
  const replies = [
    {
      label: "/payment",
      text: [
        "Thanks for your order.",
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

function getPaymentReturnUrl(token: string): string {
  const trimmedToken = token.trim();

  if (!trimmedToken) return "";

  return `${window.location.origin}/payment-return/${trimmedToken}`;
}

function StorePaymentSettingsPanel({
  advanceAmount,
  copiedReturnUrl,
  onAdvanceAmountChange,
  onCopyReturnUrl,
  onPaymentLinkChange,
  onPaymentModeChange,
  paymentLink,
  paymentMode,
  returnUrl,
}: {
  advanceAmount: string;
  copiedReturnUrl: boolean;
  onAdvanceAmountChange: (value: string) => void;
  onCopyReturnUrl: () => void;
  onPaymentLinkChange: (value: string) => void;
  onPaymentModeChange: (value: StorePaymentMode) => void;
  paymentLink: string;
  paymentMode: StorePaymentMode;
  returnUrl: string;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-gray-950">Payment Settings</h3>
        <p className="text-xs leading-5 text-gray-500">
          One payment configuration applies to every product in this store.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <div>
          <p className="text-sm font-medium text-gray-800">Order Mode</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <DashboardRadioOption
              checked={paymentMode === "cod"}
              label="Cash on Delivery"
              description="No online payment link is needed for this mode."
              onChange={() => onPaymentModeChange("cod")}
            />
            <DashboardRadioOption
              checked={paymentMode === "partial_advance"}
              label="Partial advance"
              description="Use one Razorpay payment link for every product."
              onChange={() => onPaymentModeChange("partial_advance")}
            />
          </div>
        </div>

        {paymentMode === "partial_advance" ? (
          <>
            <Field
              label="Advance amount"
              value={advanceAmount}
              onChange={(value) => onAdvanceAmountChange(sanitizeNonNegativeNumberInput(value))}
              placeholder="99"
              type="number"
              min="1"
              inputMode="numeric"
              required
            />
            <InfoRow label="Payment provider" value="Razorpay" />
            <Field
              label="Payment link"
              value={paymentLink}
              onChange={onPaymentLinkChange}
              placeholder="https://rzp.io/..."
              type="url"
              required
              helper="This payment link will automatically be used for every product in your store."
            />
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-950">Your return URL</p>
                  <p className="mt-2 break-all rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
                    {returnUrl || "Generating return URL..."}
                  </p>
                </div>
                <PptButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!returnUrl}
                  success={copiedReturnUrl}
                  onClick={onCopyReturnUrl}
                >
                  {copiedReturnUrl ? "Copied" : "Copy"}
                </PptButton>
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-500">
                Paste this return URL into your Razorpay payment page settings.
              </p>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                Configure this once in Razorpay. Customers will automatically return to
                PayPerTap after completing payment.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function DashboardRadioOption({
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

function PaymentsTab() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <p className="text-sm font-medium text-gray-500">Order model</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">
        Seller wallet flow
      </h2>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        Buyers place orders without paying PayPerTap. Depending on your store settings,
        buyers either choose Cash on Delivery or continue to your Razorpay payment link for
        a partial advance.
      </p>
      <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-600">
        PayPerTap charges your seller wallet when a buyer successfully creates an order.
        Your store automatically pauses if the wallet cannot cover new orders.
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
