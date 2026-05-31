import { CheckCircle2 } from "lucide-react";

import { MarketingCard } from "../components/marketing/MarketingCard";
import { MarketingSection } from "../components/marketing/MarketingSection";
import { WhatsAppIcon } from "./HeroBadge";

const messageRows = [
  ["Product", "Vintage denim jacket"],
  ["Product link", "paypertap.in/aditya.thrift/denim-jacket"],
  ["Product price", "₹1,499"],
  ["Booking paid via PayPerTap", "₹20"],
  ["Remaining amount to pay seller", "₹1,479"],
  ["Buyer details", "Aarav, +91 98XXXXXX21, Bengaluru"],
];

export function HomeBuyerFlow() {
  return (
    <MarketingSection
      eyebrow="WhatsApp handoff"
      title="Why does WhatsApp handoff matter?"
      intro="PayPerTap prepares the booking context. The seller still owns the WhatsApp conversation."
    >
      <MarketingCard className="ppt-whatsapp-panel">
        <div className="ppt-whatsapp-copy">
          <div className="ppt-whatsapp-icon">
            <WhatsAppIcon size={24} />
          </div>
          <h3>Seller keeps the relationship in WhatsApp.</h3>
          <p>
            After the ₹20 booking via PayPerTap, the buyer continues to WhatsApp with
            their details ready to share. Official{" "}
            <a
              href="https://whatsappbusiness.com/products/business-platform/"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Business use cases
            </a>{" "}
            include order confirmations and shipment updates; PayPerTap prepares a
            handoff and does not send automated WhatsApp replies.
          </p>
          <div className="ppt-whatsapp-quick-replies" aria-label="WhatsApp Business tools">
            <span>Greeting</span>
            <span>Away message</span>
            <span>Quick replies</span>
          </div>
          <div className="ppt-whatsapp-tip">
            <CheckCircle2 size={17} aria-hidden="true" />
            <span>Clear handoff, seller-owned conversation.</span>
          </div>
        </div>

        <div className="ppt-whatsapp-message" aria-label="Example WhatsApp buyer message">
          <div className="ppt-whatsapp-message-top">
            <div>
              <span />
              <span />
              <span />
            </div>
            <span className="ppt-faux-strong">WhatsApp message ready</span>
          </div>
          <div className="ppt-whatsapp-bubble">
            <p>Hi, I booked this product on Aditya Thrift. Please share UPI/payment details and delivery confirmation.</p>
            <div className="ppt-whatsapp-rows">
              {messageRows.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <span className="ppt-faux-strong">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="ppt-whatsapp-send">
            <WhatsAppIcon size={17} />
            Continue to WhatsApp
          </button>
        </div>
      </MarketingCard>
    </MarketingSection>
  );
}
