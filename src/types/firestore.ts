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
  bio: string;
  tagline?: string;
  logoUrl?: string;
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
  phone?: string;
  whatsappPhone?: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  instagramHandle?: string;
  ownerName?: string;
  supportEmail?: string;
  supportPhone?: string;
  returnsPolicyType?: "returns_accepted" | "exchange_only" | "no_returns";
  returnsPolicyNotes?: string;
  heroHeading?: string;
  heroSubtitle?: string;
  themeStyle?: "soft-boutique" | "dark-drop" | "clean-minimal" | string;
  selectedThemeId?: string;
  emailEvents?: {
    storeCreatedSentAt?: unknown;
  };
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
  url: string;
  thumbUrl: string;
  alt: string;
  key: string;
  thumbKey?: string;
  sortOrder: number;
  mediumUrl?: string;
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
  status: ProductStatus;
  isFeatured: boolean;
  sortOrder: number;
  inventoryQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
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
  | "booking_paid"
  | "whatsapp_opened"
  | "contacted"
  | "remaining_paid"
  | "confirmed"
  | "sold"
  | "abandoned"
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
  buyerName: string;
  buyerEmail?: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  buyerPincode: string;
  status: CheckoutSessionStatus;
  whatsappOpened: boolean;
  reservationApplied?: boolean;
  reservedProductId?: string;
  reservedQuantity?: number;
  emailEvents?: {
    sellerBookingSentAt?: unknown;
    buyerBookingSentAt?: unknown;
  };
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
  lastBookingStatus: CheckoutSessionStatus;
  lastCreatedAt?: unknown;
};
