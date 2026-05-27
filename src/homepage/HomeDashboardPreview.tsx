import { Search } from "lucide-react";

import { MarketingCard } from "../components/marketing/MarketingCard";
import { MarketingSection } from "../components/marketing/MarketingSection";
import { WhatsAppIcon } from "./HeroBadge";

const products = [
  {
    alt: "Denim jacket product thumbnail",
    booking: "₹20 booked",
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=220&q=80",
    name: "Vintage denim jacket",
    remaining: "₹1,479 remaining",
    status: "Reserved",
  },
  {
    alt: "Linen outfit product thumbnail",
    booking: "₹20 booked",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=220&q=80",
    name: "Linen co-ord set",
    remaining: "₹879 remaining",
    status: "Contacted",
  },
  {
    alt: "Handmade tote product thumbnail",
    booking: "₹20 booked",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=220&q=80",
    name: "Handmade bag",
    remaining: "₹629 remaining",
    status: "Sold",
  },
];

const leads = [
  ["Aarav", "Denim jacket", "Bengaluru"],
  ["Meera", "Linen co-ord", "Pune"],
  ["Zoya", "Handmade bag", "Delhi"],
];

export function HomeDashboardPreview() {
  return (
    <MarketingSection
      eyebrow="Seller dashboard"
      title="A calmer place to manage the work behind the store."
      intro="Products, bookings, leads, follow-ups, collections, and themes stay in one operating surface."
    >
      <MarketingCard className="ppt-home-dashboard-panel">
        <div className="ppt-home-dashboard-window">
          <div className="ppt-home-dashboard-browserbar">
            <div>
              <span />
              <span />
              <span />
            </div>
            <span className="ppt-faux-strong">Seller workspace</span>
          </div>

          <div className="ppt-home-dashboard-app">
            <aside className="ppt-home-dashboard-sidebar" aria-label="Dashboard navigation preview">
              <span className="ppt-faux-strong">PayPerTap</span>
              {["Products", "Bookings", "Customers", "Collections", "Themes"].map((item, index) => (
                <span className={index === 1 ? "is-active" : ""} key={item}>
                  {item}
                </span>
              ))}
            </aside>

            <div className="ppt-home-dashboard-main">
              <div className="ppt-home-dashboard-topline">
                <div>
                  <span>Bookings</span>
                  <span className="ppt-faux-strong">Reserved buyer details</span>
                </div>
                <button type="button">
                  <WhatsAppIcon size={16} />
                  Open WhatsApp
                </button>
              </div>

              <div className="ppt-home-dashboard-toolbar">
                <div>
                  <Search size={15} aria-hidden="true" />
                  <span>Search products or buyers</span>
                </div>
                <span className="ppt-faux-strong">₹20 booking via PayPerTap</span>
              </div>

              <div className="ppt-home-dashboard-summary" aria-label="Dashboard capability summary">
                <div>
                  <span>Products</span>
                  <span className="ppt-faux-strong">Catalog ready</span>
                </div>
                <div>
                  <span>Bookings</span>
                  <span className="ppt-faux-strong">Intent filtered</span>
                </div>
                <div>
                  <span>Follow-ups</span>
                  <span className="ppt-faux-strong">WhatsApp next</span>
                </div>
              </div>

              <div className="ppt-home-dashboard-content">
                <div className="ppt-home-dashboard-table" aria-label="Booking rows preview">
                  {products.map((product) => (
                    <div className="ppt-home-dashboard-row" key={product.name}>
                      <img
                        src={product.image}
                        alt={product.alt}
                        width={220}
                        height={220}
                        loading="lazy"
                        decoding="async"
                      />
                      <div>
                        <span className="ppt-faux-strong">{product.name}</span>
                        <span>{product.booking} · {product.remaining}</span>
                      </div>
                      <em>{product.status}</em>
                    </div>
                  ))}
                </div>

                <div className="ppt-home-dashboard-leads" aria-label="Customer lead cards preview">
                  <p>Customer leads</p>
                  {leads.map(([name, product, city]) => (
                    <div key={`${name}-${product}`}>
                      <span className="ppt-faux-strong">{name}</span>
                      <span>{product} · {city}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MarketingCard>
    </MarketingSection>
  );
}
