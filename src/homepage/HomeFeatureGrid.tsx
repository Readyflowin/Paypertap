import {
  ArrowRight,
  BadgeCheck,
  FolderHeart,
  Grid3X3,
  Heart,
  Link2,
  MessageCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingCard } from "../components/marketing/MarketingCard";
import { MarketingSection } from "../components/marketing/MarketingSection";

const storefrontFeatures = [
  { icon: <Link2 size={18} />, label: "Clean store link" },
  { icon: <Grid3X3 size={18} />, label: "Product grid" },
  { icon: <BadgeCheck size={18} />, label: "Product detail page" },
  { icon: <FolderHeart size={18} />, label: "Collections" },
  { icon: <Heart size={18} />, label: "Wishlist / saved" },
  { icon: <Search size={18} />, label: "Search" },
  { icon: <ShieldCheck size={18} />, label: "Footer and policies" },
  { icon: <MessageCircle size={18} />, label: "WhatsApp handoff" },
];

const featureLinks = [
  {
    copy: "Filter casual chats with a fixed ₹20 booking via PayPerTap.",
    label: "Verified booking",
    path: "/features/verified-booking",
  },
  {
    copy: "Use one bio-ready link for discovery and reservations.",
    label: "Link-in-bio storefront",
    path: "/features/link-in-bio-storefront",
  },
  {
    copy: "Move buyers to WhatsApp with booking context intact.",
    label: "WhatsApp handoff",
    path: "/features/whatsapp-handoff",
  },
  {
    copy: "Keep bookings, buyer context, and follow-up status clearer.",
    label: "Order organization",
    path: "/features/order-organization",
  },
  {
    copy: "Send one item page instead of repeating photos and price.",
    label: "Product links",
    path: "/features/product-links",
  },
  {
    copy: "Keep buyer details connected to the product they booked.",
    label: "Customer leads",
    path: "/features/customer-leads",
  },
];

const products = [
  {
    alt: "Denim jacket on a clothing rack",
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=520&q=74",
    name: "Denim jacket",
    price: "₹1,499",
  },
  {
    alt: "Neutral linen outfit flatlay",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=520&q=74",
    name: "Linen co-ord",
    price: "₹899",
  },
  {
    alt: "Handmade tote bag close up",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=520&q=74",
    name: "Handmade bag",
    price: "₹649",
  },
  {
    alt: "Minimal jewellery tray",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=520&q=74",
    name: "Drop earrings",
    price: "₹399",
  },
];

export function HomeFeatureGrid() {
  return (
    <MarketingSection
      eyebrow="What sellers get"
      title="A storefront that looks cleaner than a screenshot catalog."
      intro="Product pages, collections, search, booking, and handoff in one seller-owned flow."
    >
      <div className="ppt-storefront-layout">
        <MarketingCard className="ppt-storefront-preview">
          <div className="ppt-browser-bar">
            <span />
            <span />
            <span />
            <strong>paypertap.in/aditya.thrift</strong>
          </div>

          <div className="ppt-storefront-hero">
            <div>
              <span>New summer drop</span>
              <h3>Curated thrift pieces</h3>
              <p>Reserve the item, then confirm delivery and remaining payment on WhatsApp.</p>
            </div>
            <div className="ppt-storefront-badge">₹20 booking</div>
          </div>

          <div className="ppt-storefront-search">
            <Search size={15} aria-hidden="true" />
            <span>Search jackets, co-ords, accessories</span>
          </div>

          <div className="ppt-storefront-products">
            {products.map((product) => (
              <div className="ppt-storefront-product" key={product.name}>
                <div className="ppt-storefront-product-media">
                  <img
                    src={product.image}
                    alt={product.alt}
                    width={520}
                    height={347}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="ppt-storefront-product-copy">
                  <p>{product.name}</p>
                  <span>{product.price}</span>
                </div>
                <strong>Reserve</strong>
              </div>
            ))}
          </div>

          <div className="ppt-storefront-trust-strip">
            <span>Policies</span>
            <span>Seller UPI / COD</span>
            <span>WhatsApp handoff</span>
          </div>
        </MarketingCard>

        <div className="ppt-storefront-side">
          <div className="ppt-mini-feature-grid">
            {storefrontFeatures.map((feature) => (
              <div className="ppt-mini-feature" key={feature.label}>
                {feature.icon}
                <span>{feature.label}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-3">
            {featureLinks.map((item) => (
              <Link key={item.path} to={item.path} className="ppt-feature-link-card">
                <div>
                  <p>{item.label}</p>
                  <span>{item.copy}</span>
                </div>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MarketingSection>
  );
}
