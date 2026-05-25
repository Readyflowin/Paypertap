import { type FeatureSlug, type SeoPageContent } from "./seoPageTypes";

export const featureContent: Record<FeatureSlug, SeoPageContent> = {
  "verified-booking": {
    path: "/features/verified-booking",
    title: "Verified Booking for Instagram and WhatsApp Sellers",
    description:
      "Reduce fake buyers and low-intent DMs with PayPerTap verified booking and a fixed Rs. 20 buyer booking step.",
    h1: "Verified Booking for Instagram and WhatsApp Sellers",
    summary:
      "PayPerTap verified booking helps social sellers filter casual DMs by asking buyers to pay a fixed Rs. 20 booking fee before the WhatsApp handoff.",
    whatItIs:
      "Verified booking means a buyer reserves a product with a small paid signal before the seller spends time confirming the order in chat. In PayPerTap Phase 1, the buyer pays Rs. 20 on PayPerTap and the seller collects the remaining amount directly.",
    howItWorks: [
      "Seller shares a store or product link.",
      "Buyer chooses a product and pays the fixed Rs. 20 booking fee.",
      "Buyer continues to WhatsApp with product and booking context.",
      "Seller confirms availability, delivery, and remaining payment directly.",
    ],
    benefits: [
      "Reduces fake buyers and low-intent holds.",
      "Works well for limited-stock thrift, boutique, and handmade products.",
      "Keeps the seller's WhatsApp, UPI, and COD flow intact.",
      "Creates a cleaner starting point for every buyer conversation.",
    ],
    example:
      "A thrift seller can share a jacket link from Instagram Stories. Instead of replying to ten casual 'available?' messages, the seller sees the buyer who booked with Rs. 20 and continues with that buyer on WhatsApp.",
    faqs: [
      {
        question: "Does the seller receive the Rs. 20 booking fee?",
        answer:
          "No. In Phase 1, PayPerTap keeps the fixed Rs. 20 as the platform verified-booking fee. The seller collects the remaining amount directly from the buyer.",
      },
      {
        question: "Is verified booking useful for limited-stock products?",
        answer:
          "Yes. It is especially useful for one-piece thrift drops, boutique items, handmade products, and social sellers who want stronger buyer intent.",
      },
    ],
    related: [
      { label: "PayPerTap for thrift sellers", path: "/for/thrift-sellers" },
      { label: "Order organization", path: "/features/order-organization" },
      { label: "PayPerTap vs Linktree", path: "/compare/paypertap-vs-linktree" },
    ],
  },
  "link-in-bio-storefront": {
    path: "/features/link-in-bio-storefront",
    title: "Link-in-Bio Storefront for Product Sellers",
    description:
      "Create a clean store link for Instagram bio, stories, DMs, and WhatsApp sharing with PayPerTap.",
    h1: "Link-in-Bio Storefront for Product Sellers",
    summary:
      "PayPerTap gives product sellers a clean store link that does more than list links: it shows products and starts a verified booking flow.",
    whatItIs:
      "A link-in-bio storefront is a public store link for sellers who want buyers to browse products without building a full website. PayPerTap is designed for product sellers, not just creators sharing multiple links.",
    howItWorks: [
      "Add products, prices, images, and details.",
      "Share the store link in Instagram bio, Stories, DMs, or WhatsApp.",
      "Buyers browse products and choose what they want.",
      "The booking flow moves serious buyers toward WhatsApp confirmation.",
    ],
    benefits: [
      "Replaces scattered screenshots and repeated product replies.",
      "Gives Instagram and WhatsApp buyers one clean place to browse.",
      "Supports store links and product-specific links.",
      "Keeps the seller's direct closing process intact.",
    ],
    example:
      "A boutique owner can put one PayPerTap link in Instagram bio and send the same store link in WhatsApp status. Buyers see product cards instead of asking for every price manually.",
    faqs: [
      {
        question: "How is this different from a generic bio link?",
        answer:
          "Generic bio links send buyers to many destinations. PayPerTap is built around product discovery, Rs. 20 verified booking, and WhatsApp handoff.",
      },
      {
        question: "Can I share individual products too?",
        answer:
          "Yes. Sellers can share a store link for browsing and product links when a buyer asks about a specific item.",
      },
    ],
    related: [
      { label: "Product links", path: "/features/product-links" },
      { label: "Instagram sellers", path: "/for/instagram-sellers" },
      { label: "PayPerTap vs Linktree", path: "/compare/paypertap-vs-linktree" },
    ],
  },
  "whatsapp-handoff": {
    path: "/features/whatsapp-handoff",
    title: "WhatsApp Handoff for Product Bookings",
    description:
      "Move buyers from PayPerTap booking to WhatsApp with product and booking details ready for confirmation.",
    h1: "WhatsApp Handoff for Product Bookings",
    summary:
      "PayPerTap helps buyers continue to WhatsApp with the product, booking context, and remaining payment conversation ready.",
    whatItIs:
      "WhatsApp handoff is the step after booking where the buyer continues the conversation with the seller. PayPerTap does not automate WhatsApp replies; it simply makes the handoff cleaner.",
    howItWorks: [
      "Buyer books a product with the fixed Rs. 20 booking fee.",
      "PayPerTap prepares a WhatsApp message with product context.",
      "Buyer opens WhatsApp and sends the message to the seller.",
      "Seller confirms delivery, availability, and remaining amount directly.",
    ],
    benefits: [
      "Reduces missing context in WhatsApp chats.",
      "Works with WhatsApp Business greetings, away messages, and quick replies.",
      "Keeps final confirmation human and direct.",
      "Makes Instagram-to-WhatsApp selling easier to follow.",
    ],
    example:
      "A buyer books a handmade tote and opens WhatsApp with a message mentioning the product title, product link, total price, Rs. 20 paid, and remaining amount to confirm.",
    faqs: [
      {
        question: "Does PayPerTap send automatic WhatsApp replies?",
        answer:
          "No. PayPerTap does not automate seller replies. It helps the buyer reach WhatsApp with useful booking details.",
      },
      {
        question: "Who collects the remaining amount?",
        answer:
          "The seller collects the remaining amount directly through WhatsApp, UPI, COD, or their usual process.",
      },
    ],
    related: [
      { label: "WhatsApp sellers", path: "/for/whatsapp-sellers" },
      { label: "Customer leads", path: "/features/customer-leads" },
      { label: "PayPerTap vs WhatsApp Catalog", path: "/compare/paypertap-vs-whatsapp-catalog" },
    ],
  },
  "order-organization": {
        question: "Is verified booking useful for limited-stock products?",
        answer:
          "Yes. It is especially useful for one-piece thrift drops, boutique items, handmade products, and social sellers who want stronger buyer intent.",
      },
  "product-links": {
        question: "Can I share individual products too?",
        answer:
          "Yes. Sellers can share a store link for browsing and product links when a buyer asks about a specific item.",
      },
  "customer-leads": {
        question: "Who collects the remaining amount?",
        answer:
          "The seller collects the remaining amount directly through WhatsApp, UPI, COD, or their usual process.",
      },
};
