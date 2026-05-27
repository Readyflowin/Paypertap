import { type ReactNode } from "react";
import { Link } from "react-router-dom";

import { WhatsAppIcon } from "./HeroBadge";

type Capability = {
  copy: string;
  path: string;
  title: string;
  visual: ReactNode;
};

const productImage =
  "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=360&q=74";

const toteImage =
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=360&q=74";

const capabilities: Capability[] = [
  {
    title: "Storefront",
    copy: "A clean link with products, search, and collections.",
    path: "/features/link-in-bio-storefront",
    visual: (
      <div className="ppt-capability-store-ui" aria-hidden="true">
        <div>
          <span>aditya.thrift</span>
          <strong>New drop</strong>
        </div>
        <div>
          <img
            src={productImage}
            alt="PayPerTap storefront product card preview"
            width={360}
            height={240}
            loading="lazy"
            decoding="async"
          />
          <img
            src={toteImage}
            alt="PayPerTap storefront product collection preview"
            width={360}
            height={240}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    ),
  },
  {
    title: "Booking intent",
    copy: "The buyer commits with a fixed ₹20 booking.",
    path: "/features/verified-booking",
    visual: (
      <div className="ppt-capability-booking-ui" aria-hidden="true">
        <span>Booking via PayPerTap</span>
        <strong>₹20</strong>
        <em>Reserved</em>
      </div>
    ),
  },
  {
    title: "WhatsApp handoff",
    copy: "Product and buyer details move into the chat.",
    path: "/features/whatsapp-handoff",
    visual: (
      <div className="ppt-capability-whatsapp-ui" aria-hidden="true">
        <div>
          <WhatsAppIcon size={16} />
          <strong>Message ready</strong>
        </div>
        <span>Product, price, booking, buyer details.</span>
      </div>
    ),
  },
  {
    title: "Seller dashboard",
    copy: "Products, bookings, leads, and themes.",
    path: "/how-it-works",
    visual: (
      <div className="ppt-capability-dashboard-ui" aria-hidden="true">
        {["Products", "Bookings", "Customers"].map((item, index) => (
          <span className={index === 1 ? "is-active" : ""} key={item}>
            {item}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Direct remaining payment",
    copy: "Seller collects the remaining amount directly.",
    path: "/pricing",
    visual: (
      <div className="ppt-capability-payment-ui" aria-hidden="true">
        <span>Buyer</span>
        <strong>PayPerTap</strong>
        <span>Seller</span>
      </div>
    ),
  },
];

export function HomeCapabilityRail() {
  return (
    <section className="ppt-capability-section px-4 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="ppt-capability-head">
          <span>Product proof</span>
          <p>Five surfaces sellers need before they put the link in bio.</p>
        </div>

        <div className="ppt-capability-rail" aria-label="PayPerTap product capabilities">
          {capabilities.map((capability) => (
            <Link className="ppt-capability-card" to={capability.path} key={capability.title}>
              <div className="ppt-capability-visual">{capability.visual}</div>
              <div>
                <strong>{capability.title}</strong>
                <span>{capability.copy}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
