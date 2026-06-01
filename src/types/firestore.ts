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
  bookingAdvanceAmount?: number;
  sellerConfirmationAdvanceType?: "paypertap_only" | "fixed" | "percentage";
  sellerConfirmationAdvanceFixedAmount?: number | null;
  sellerConfirmationAdvancePercent?: number | null;
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
  themeStyle?: "soft-boutique" | "dark-drop" | "clean-minimal" | string;
  selectedThemeId?: string;
  emailEvents?: {
    storeCreatedSentAt?: unknown;
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
  bookingAdvanceAmount: number;
  sellerCollectAmount: number;
  category: string;
  categoryName?: string;
  collectionId?: string;
  collectionName?: string;
  images?: ProductImage[];
  imageUrl?: string;
  thumbnailUrl?: string;
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
  advanceAmount?: number;
  remainingAmount?: number;
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
  | "started"
  | "details_submitted"
  | "payment_pending"
  | "payment_created"
  | "booking_paid"
  | "payment_failed"
  | "whatsapp_opened"
  | "contacted"
  | "remaining_paid"
  | "confirmed"
  | "sold"
  | "abandoned"
  | "expired"
  | "cancelled"
  | "released";

export type CheckoutSession = {
  checkoutId: string;
  sellerId: string;
  storeId: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  bookingAdvanceAmount: number;
  sellerCollectAmount: number;
  confirmationAdvanceType?: "paypertap_only" | "fixed" | "percentage";
  totalConfirmationAdvance?: number;
  sellerConfirmationAmountPending?: number;
  finalBalanceAfterConfirmation?: number;
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
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  emailEvents?: {
    sellerBookingSentAt?: unknown;
    buyerBookingSentAt?: unknown;
  };
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
  totalBookings: number;
  lastProductTitle: string;
  lastProductId: string;
  lastVariantLabel?: string;
  lastVariantOptions?: Record<string, string>;
  lastBookingStatus: CheckoutSessionStatus;
  lastCreatedAt?: unknown;
};
