export type Theme = {
  themeId: string;
  themeName: string;
  themeType: string;
  isFree: boolean;
  mobileFirst: boolean;
  layoutConfig: {
    heroLayout: string;
    productGrid: string;
    cardStyle: string;
    buttonStyle: string;
  };
  defaultColors: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  createdAt?: unknown;
};

export type Store = {
  storeId: string;
  sellerId: string;
  storeSlug: string;
  storeName: string;
  storeDescription?: string;
  description?: string;
  bio: string;
  tagline?: string;
  logoUrl?: string;
  storeLogoUrl?: string;
  logoKey?: string;
  heroImageUrl?: string;
  heroImageKey?: string;
  announcementText?: string;
  themeId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  colors?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  fontStyle: string;
  isPublished: boolean;
  acceptingOrders?: boolean;
  pauseReason?: "wallet_empty" | string | null;
  paymentMode?: "cod" | "partial_advance";
  advanceAmount?: number;
  paymentProvider?: "razorpay";
  paymentLink?: string;
  paymentReturnToken?: string;
  phone?: string;
  whatsappPhone?: string;
  whatsappNumber?: string;
  instagramProfile?: string;
  instagramUrl?: string;
  instagramHandle?: string;
  ownerName?: string;
  supportEmail?: string;
  supportPhone?: string;
  returnsPolicyType?: "returns_accepted" | "exchange_only" | "no_returns";
  returnsPolicyNotes?: string;
  heroTitle?: string;
  heroHeading?: string;
  heroSubtitle?: string;
  heroEyebrowText?: string;
  heroPrimaryCtaText?: string;
  heroSecondaryCtaText?: string;
  themeStyle?: "soft-boutique" | "dark-drop" | "clean-minimal" | string;
  selectedThemeId?: string;
  emailEvents?: {
    storeCreatedSentAt?: unknown;
    lowWalletSentAt?: unknown;
    walletEmptySentAt?: unknown;
  };
  adminOnboardingEmailSentAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type StoreSlugReservation = {
  slug: string;
  storeId: string;
  sellerId: string;
  createdAt?: unknown;
};

export type SellerStatus = "active" | "paused" | "suspended";
export type SellerOnboardingStatus =
  | "auth_completed"
  | "store_completed"
  | "product_completed"
  | "completed";
export type SellerOnboardingStep = "store" | "product" | "dashboard";

export type Seller = {
  sellerId: string;
  authUid: string;
  name: string;
  email: string;
  phone: string;
  storeId: string;
  status: SellerStatus;
  razorpayLinked: boolean;
  profileImageUrl: string;
  onboardingStatus: SellerOnboardingStatus;
  onboardingStep: SellerOnboardingStep;
  emailEvents?: {
    welcomeSentAt?: unknown;
  };
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ProductStatus = "draft" | "open" | "hold" | "sold" | "unpublished";

export type ProductImage = {
  id?: string;
  url?: string;
  publicUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  thumbUrl?: string;
  mediumUrl?: string;
  path?: string;
  alt?: string;
  key?: string;
  thumbKey?: string;
  name?: string;
  originalName?: string;
  width?: number;
  height?: number;
  size?: number;
  sizeBytes?: number;
  mimeType?: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  sortOrder?: number;
  uploadedAt?: unknown;
};

export type ProductVariantOption = {
  name: string;
  values: string[];
};

export type ProductVariant = {
  variantId: string;
  label: string;
  options: Record<string, string>;
  inventoryQuantity?: number;
  isAvailable?: boolean;
  sortOrder?: number;
};

export type Product = {
  id: string;
  productId: string;
  sellerId: string;
  storeId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  categoryName?: string;
  collectionId?: string;
  collectionName?: string;
  images?: ProductImage[];
  imageUrl?: string;
  thumbnailUrl?: string;
  sizeChartImage?: string;
  sizeChartImageUrl?: string;
  sizeChartImageKey?: string;
  status: ProductStatus;
  isFeatured: boolean;
  sortOrder: number;
  inventoryQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  hasVariants?: boolean;
  variantOptions?: ProductVariantOption[];
  variants?: ProductVariant[];
  defaultVariantId?: string;
  emailEvents?: {
    productAddedSentAt?: unknown;
  };
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type StoreCollection = {
  id: string;
  collectionId: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type CheckoutSessionStatus =
  | "pending_payment"
  | "pending_confirmation"
  | "awaiting_payment"
  | "payment_returned"
  | "confirmed"
  | "processing"
  | "completed"
  | "cancelled"
  | "released";

export type WalletStatus = "active" | "low_balance" | "empty" | "paused";

export type CheckoutSession = {
  checkoutId: string;
  orderId?: string;
  sellerId: string;
  storeId: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  advanceAmount?: number;
  paymentAmount?: number;
  sellerAmountDue?: number;
  paymentMode?: "cod" | "partial_advance";
  paymentProvider?: "razorpay";
  paymentLink?: string;
  paymentRedirectUrl?: string;
  paymentReturnUrl?: string;
  paymentTrackingToken?: string;
  paymentReturnedAt?: unknown;
  paymentReturnDetected?: boolean;
  paymentReturnMethod?: "razorpay_redirect";
  sellerPaymentConfirmedAt?: unknown;
  sellerConfirmationAt?: unknown;
  sellerAcceptedAt?: unknown;
  processingAt?: unknown;
  completedAt?: unknown;
  walletStatusSnapshot?: {
    balance: number;
    freeOrdersRemaining: number;
    status: WalletStatus;
    hasFunds: boolean;
  };
  walletCharge?: number;
  walletTransactionId?: string;
  walletType?: "free_order" | "order_charge";
  walletBalanceAfter?: number;
  freeOrdersRemainingAfter?: number;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone: string;
  sellerPhone?: string;
  sellerWhatsAppPhone?: string;
  sellerWhatsAppE164?: string;
  buyerAddress: string;
  buyerCity: string;
  buyerPincode: string;
  status: CheckoutSessionStatus;
  whatsappOpened: boolean;
  reservationApplied?: boolean;
  reservationReleased?: boolean;
  reservationSold?: boolean;
  reservedProductId?: string;
  reservedQuantity?: number;
  selectedVariantId?: string;
  selectedVariantLabel?: string;
  selectedVariantOptions?: Record<string, string>;
  emailEvents?: {
    sellerOrdersentAt?: unknown;
    buyerOrdersentAt?: unknown;
  };
  sellerNotes?: string;
  cancelledAt?: unknown;
  releasedAt?: unknown;
  soldAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type DerivedCustomerLead = {
  buyerName: string;
  buyerPhone: string;
  buyerCity: string;
  buyerPincode: string;
  totalOrders: number;
  lastProductTitle: string;
  lastProductId: string;
  lastVariantLabel?: string;
  lastVariantOptions?: Record<string, string>;
  lastOrderstatus: CheckoutSessionStatus;
  lastCreatedAt?: unknown;
};
