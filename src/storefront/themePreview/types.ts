export type PreviewThemeId = "editorial" | "boutique" | "instagram";

export type PreviewProduct = {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  galleryUrls?: string[];
  collection: string;
  badge: string;
  scarcity: string;
  description: string;
  sizes?: string[];
  colors?: string[];
  unavailableSizes?: string[];
  unavailableColors?: string[];
};

export type PreviewStore = {
  name: string;
  logoText: string;
  announcement: string;
  heroTitle: string;
  heroSubtitle: string;
  story: string;
  socialProof: string[];
  trustBadges: string[];
  collections: string[];
};

export type PreviewTestimonial = {
  quote: string;
  name: string;
  meta: string;
  rating?: number;
  dateTag?: string;
};

export type PreviewFaq = {
  question: string;
  answer: string;
};

export type PreviewStorefrontData = {
  store: PreviewStore;
  products: PreviewProduct[];
  testimonials: PreviewTestimonial[];
  faqs: PreviewFaq[];
};

export type PreviewThemeProps = PreviewStorefrontData & {
  onProductSelect: (product: PreviewProduct) => void;
  previewDevice?: "desktop" | "mobile";
};
