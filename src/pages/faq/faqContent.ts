import { type FaqItem } from "../../seo-pages/seoPageTypes";

export const marketingFaqs: FaqItem[] = [
  {
    group: "PayPerTap basics",
    question: "What is PayPerTap?",
    answer:
      "PayPerTap is a verified booking storefront for Indian Instagram and WhatsApp sellers. Sellers can create a store link or product link, buyers can place a fixed ₹20 booking to reserve an item, and the buyer then continues to WhatsApp with product and booking context ready.",
    links: [
      { label: "See how it works", path: "/how-it-works" },
      { label: "Explore verified booking", path: "/features/verified-booking" },
    ],
  },
  {
    group: "PayPerTap basics",
    question: "Who is PayPerTap for?",
    answer:
      "PayPerTap is for small product sellers who already find buyers through Instagram, WhatsApp, stories, DMs, groups, and status updates. It fits sellers who want cleaner product pages and a booking step before direct chat, not merchants looking for a full ecommerce payment and payout stack.",
    links: [
      { label: "Instagram seller guide", path: "/for/instagram-sellers" },
      { label: "WhatsApp seller guide", path: "/for/whatsapp-sellers" },
    ],
  },
  {
    group: "PayPerTap basics",
    question: "Is PayPerTap made for Instagram sellers?",
    answer:
      "Yes. PayPerTap is made for Instagram sellers who need a product-first link before the DM conversation becomes messy. A seller can add a store link to bio, share product links in DMs or stories, and let interested buyers book before moving to WhatsApp for remaining payment and delivery confirmation.",
    links: [
      { label: "Instagram sellers", path: "/for/instagram-sellers" },
      { label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" },
    ],
  },
  {
    group: "PayPerTap basics",
    question: "Is PayPerTap useful for WhatsApp sellers?",
    answer:
      "Yes. PayPerTap is useful for WhatsApp sellers who want buyers to see organized product details before starting or continuing a chat. The seller can share a store or product link, the buyer books the item, and the conversation continues in WhatsApp with clearer context.",
    links: [
      { label: "WhatsApp sellers", path: "/for/whatsapp-sellers" },
      { label: "WhatsApp handoff", path: "/features/whatsapp-handoff" },
    ],
  },
  {
    group: "PayPerTap basics",
    question: "Is PayPerTap available in India?",
    answer:
      "Yes. PayPerTap is built for Indian Instagram and WhatsApp sellers and uses a fixed ₹20 booking model. Sellers remain responsible for deciding where they sell, whether they can deliver to a buyer location, and which direct remaining-payment methods they offer.",
    links: [{ label: "Pricing details", path: "/pricing" }],
  },
  {
    group: "PayPerTap basics",
    question: "What problem does PayPerTap solve?",
    answer:
      "PayPerTap solves the gap between social product interest and a serious buyer conversation. Instead of relying only on screenshots, repeated DMs, and casual holds, sellers can share a product link, collect a fixed booking through PayPerTap, and continue with a more organized WhatsApp handoff.",
    links: [
      { label: "Order organization", path: "/features/order-organization" },
      { label: "Product links", path: "/features/product-links" },
    ],
  },
  {
    group: "₹20 booking model",
    question: "How does the ₹20 booking work?",
    answer:
      "A buyer pays a fixed ₹20 booking through PayPerTap for the selected product. That booking records buyer and product details and reserves the item in the PayPerTap flow. In Phase 1, the ₹20 is PayPerTap's platform verified-booking fee, not an advance remitted to the seller.",
    links: [
      { label: "Verified booking feature", path: "/features/verified-booking" },
      { label: "Pricing details", path: "/pricing" },
    ],
  },
  {
    group: "₹20 booking model",
    question: "Why does PayPerTap use a fixed ₹20 booking?",
    answer:
      "PayPerTap uses a fixed ₹20 booking to keep the Phase 1 model simple and predictable for buyers and sellers. The fee creates a small commitment signal, records booking context, and avoids custom seller advance amounts, payout rules, and split-payment complexity.",
    links: [{ label: "How PayPerTap works", path: "/how-it-works" }],
  },
  {
    group: "₹20 booking model",
    question: "Does the seller receive the ₹20?",
    answer:
      "No. In Phase 1, the seller does not receive the fixed ₹20 as a payout, advance, or split payment. PayPerTap keeps the ₹20 as its platform verified-booking fee, while the seller collects the remaining product amount directly from the buyer.",
    links: [{ label: "Pricing details", path: "/pricing" }],
  },
  {
    group: "₹20 booking model",
    question: "What does PayPerTap do with the ₹20?",
    answer:
      "PayPerTap keeps the ₹20 as the platform verified-booking fee in Phase 1. The fee supports the booking workflow, product reservation context, buyer record, and WhatsApp handoff layer. It is not a seller payout and it is not the full product price.",
    links: [{ label: "Terms of service", path: "/terms" }],
  },
  {
    group: "₹20 booking model",
    question: "Is the ₹20 a full product payment?",
    answer:
      "No. The ₹20 is not the full product payment. It is a fixed PayPerTap booking fee that reserves the product in the booking flow. The buyer still pays the remaining product amount directly to the seller through WhatsApp, UPI, COD, or the seller's offered process.",
    links: [{ label: "Refund and cancellation", path: "/refund-cancellation" }],
  },
  {
    group: "₹20 booking model",
    question: "Can sellers change the booking amount in Phase 1?",
    answer:
      "No. Sellers cannot change the booking amount in Phase 1. PayPerTap uses one fixed ₹20 booking fee so the buyer experience, platform fee wording, and seller responsibilities stay clear. Custom seller advances are outside the current Phase 1 scope.",
    links: [{ label: "Pricing details", path: "/pricing" }],
  },
  {
    group: "Seller payments and Phase 1 limits",
    question: "Who collects the remaining product amount?",
    answer:
      "The seller collects the remaining product amount directly from the buyer after the PayPerTap booking. The seller and buyer agree on the final payment method, delivery, pickup, or COD arrangement in their WhatsApp conversation or other direct channel.",
    links: [{ label: "How PayPerTap works", path: "/how-it-works" }],
  },
  {
    group: "Seller payments and Phase 1 limits",
    question: "Can sellers use UPI, Google Pay, PhonePe, or COD?",
    answer:
      "Yes. For the remaining product amount, sellers can use UPI, Google Pay, PhonePe, COD, or another direct process they offer to buyers. Those payments happen between buyer and seller. PayPerTap's Phase 1 payment role is limited to the fixed ₹20 booking fee.",
    links: [{ label: "Pricing details", path: "/pricing" }],
  },
  {
    group: "Seller payments and Phase 1 limits",
    question: "Does PayPerTap provide seller payouts?",
    answer:
      "No. PayPerTap does not provide seller payouts in Phase 1 because the ₹20 booking fee is kept by PayPerTap and the remaining product amount is paid directly to the seller. Sellers do not receive settlement from PayPerTap for product purchases.",
    links: [{ label: "Phase 1 pricing", path: "/pricing" }],
  },
  {
    group: "Seller payments and Phase 1 limits",
    question: "Do sellers need payout KYC in Phase 1?",
    answer:
      "No. Sellers do not need payout KYC for PayPerTap in Phase 1 because PayPerTap does not settle seller payouts. Sellers remain responsible for any requirements connected with their own direct payment methods, business obligations, and delivery process.",
    links: [{ label: "Terms of service", path: "/terms" }],
  },
  {
    group: "Seller payments and Phase 1 limits",
    question: "Is PayPerTap a payment gateway?",
    answer:
      "No. PayPerTap is not a full payment gateway in Phase 1. It handles the fixed ₹20 verified booking, booking record, product reservation context, and WhatsApp handoff. It does not process the full product price or settle the seller's remaining amount.",
    links: [{ label: "Pricing details", path: "/pricing" }],
  },
  {
    group: "Seller payments and Phase 1 limits",
    question: "Does PayPerTap support Razorpay Route or Cashfree split payments?",
    answer:
      "No. PayPerTap does not support Razorpay Route, Cashfree split payments, seller split settlement, or custom payment routing in Phase 1. The model is intentionally simpler: buyer pays ₹20 to PayPerTap, and seller collects the remaining product amount directly.",
    links: [{ label: "Phase 1 limits", path: "/pricing" }],
  },
  {
    group: "WhatsApp handoff",
    question: "What happens after a buyer books?",
    answer:
      "After a buyer books, PayPerTap records the booking details, reserves the product in the booking flow, and prepares the WhatsApp handoff. The buyer continues to the seller with product, booking, remaining amount, and contact context ready for direct confirmation.",
    links: [{ label: "How PayPerTap works", path: "/how-it-works" }],
  },
  {
    group: "WhatsApp handoff",
    question: "How does WhatsApp handoff work?",
    answer:
      "WhatsApp handoff works by preparing a message after the fixed ₹20 booking. The message gives the seller product and buyer context so the conversation can continue without restarting from scratch. The buyer opens WhatsApp and sends the prepared details to the seller.",
    links: [{ label: "WhatsApp handoff feature", path: "/features/whatsapp-handoff" }],
  },
  {
    group: "WhatsApp handoff",
    question: "Does PayPerTap automatically send WhatsApp messages?",
    answer:
      "No. PayPerTap does not automatically send WhatsApp messages or auto-reply for sellers. It prepares the handoff context after booking, but the buyer and seller handle the WhatsApp conversation directly. Sellers remain responsible for replies, confirmation, and follow-up.",
    links: [{ label: "WhatsApp handoff feature", path: "/features/whatsapp-handoff" }],
  },
  {
    group: "WhatsApp handoff",
    question: "Can sellers use WhatsApp Business?",
    answer:
      "Yes. Sellers can use WhatsApp Business after a PayPerTap booking because the final conversation still happens directly in WhatsApp. PayPerTap provides the storefront, booking record, and handoff context; it does not replace the seller's chosen WhatsApp account.",
    links: [
      {
        external: true,
        label: "WhatsApp Business use cases",
        path: "https://whatsappbusiness.com/products/business-platform/",
      },
    ],
  },
  {
    group: "WhatsApp handoff",
    question: "Can sellers use WhatsApp Business quick replies?",
    answer:
      "Yes. Sellers can use WhatsApp Business quick replies or their usual WhatsApp Business workflow after the PayPerTap handoff. PayPerTap does not manage those replies; it simply helps the buyer arrive with product, booking, and remaining amount context.",
    links: [{ label: "WhatsApp sellers", path: "/for/whatsapp-sellers" }],
  },
  {
    group: "WhatsApp handoff",
    question: "What details are included in the WhatsApp message?",
    answer:
      "The WhatsApp message can include product title, product link, buyer details, total product price, the ₹20 booking paid via PayPerTap, and the remaining amount to discuss with the seller. The goal is to keep the next seller conversation clear.",
    links: [{ label: "WhatsApp handoff feature", path: "/features/whatsapp-handoff" }],
  },
  {
    group: "Storefronts, products, links, collections",
    question: "What does a PayPerTap storefront include?",
    answer:
      "A PayPerTap storefront includes product pages, images, prices, seller context, booking flow, policy links, and WhatsApp handoff. It is built for product discovery before chat, not as a full ecommerce checkout with seller payout and shipping operations.",
    links: [{ label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" }],
  },
  {
    group: "Storefronts, products, links, collections",
    question: "Can sellers share direct product links?",
    answer:
      "Yes. Sellers can share direct product links in Instagram DMs, stories, bio links, WhatsApp chats, groups, status updates, or other permitted channels. Direct links help buyers review one item before placing the fixed booking and continuing to WhatsApp.",
    links: [{ label: "Product links feature", path: "/features/product-links" }],
  },
  {
    group: "Storefronts, products, links, collections",
    question: "Can sellers create collections?",
    answer:
      "Yes. Where collections are available in the storefront, sellers can organize products into browsable groups while still sharing individual product links. Collections help buyers browse categories or drops before choosing a product to book.",
    links: [{ label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" }],
  },
  {
    group: "Storefronts, products, links, collections",
    question: "Can sellers add multiple product images?",
    answer:
      "Yes. Sellers can use product images to give buyers more context before booking. Clear photos help buyers understand the item, but the seller should still confirm condition, size, delivery, and remaining payment directly after the WhatsApp handoff.",
    links: [{ label: "Product links feature", path: "/features/product-links" }],
  },
  {
    group: "Storefronts, products, links, collections",
    question: "Can buyers search products?",
    answer:
      "Yes. PayPerTap storefronts are designed around cleaner product browsing, including search where available in the store experience. Search helps buyers find relevant products before booking, while the seller still manages final confirmation and product availability directly.",
    links: [{ label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" }],
  },
  {
    group: "Inventory, reserved, sold, and availability",
    question: "Does the product become reserved after booking?",
    answer:
      "Yes. Completing the fixed ₹20 booking reserves the selected product in the PayPerTap booking flow. The reservation gives the seller buyer and product context, but the seller still needs to confirm product accuracy, remaining payment, delivery, and final completion.",
    links: [{ label: "Verified booking feature", path: "/features/verified-booking" }],
  },
  {
    group: "Inventory, reserved, sold, and availability",
    question: "What is the difference between reserved and sold?",
    answer:
      "Reserved means a buyer has completed the PayPerTap booking and the seller has a serious follow-up to handle. Sold means the seller has completed their direct confirmation, remaining payment, and fulfilment decision. PayPerTap separates these because final payment happens outside PayPerTap.",
    links: [{ label: "Order organization", path: "/features/order-organization" }],
  },
  {
    group: "Inventory, reserved, sold, and availability",
    question: "What happens if an item is already reserved?",
    answer:
      "If an item is already reserved, buyers should not treat it as freely available until the seller updates the product or booking status. The seller remains responsible for confirming whether the first buyer completes the purchase, cancels, or leaves the item available again.",
    links: [{ label: "Order organization", path: "/features/order-organization" }],
  },
  {
    group: "Inventory, reserved, sold, and availability",
    question: "Can sellers manually mark a product as sold?",
    answer:
      "Yes. Sellers can mark products or bookings as sold or complete through the available seller workflow after they finish direct confirmation with the buyer. This lets the booking flow distinguish buyer intent from the seller's final product completion decision.",
    links: [{ label: "Order organization", path: "/features/order-organization" }],
  },
  {
    group: "Buyer details, privacy, and leads",
    question: "What buyer details does PayPerTap collect?",
    answer:
      "PayPerTap collects buyer details needed for the booking and seller handoff, such as name, phone or contact details, selected product, booking information, and any buyer-provided context needed for the order discussion. The goal is to operate the booking flow.",
    links: [{ label: "Privacy policy", path: "/privacy" }],
  },
  {
    group: "Buyer details, privacy, and leads",
    question: "How does PayPerTap use buyer details?",
    answer:
      "PayPerTap uses buyer details to operate the storefront, record the booking, prepare the WhatsApp handoff, help the seller manage the order context, and support the booking workflow. Sellers then use the buyer conversation to complete direct confirmation and delivery.",
    links: [
      { label: "Customer leads", path: "/features/customer-leads" },
      { label: "Privacy policy", path: "/privacy" },
    ],
  },
  {
    group: "Buyer details, privacy, and leads",
    question: "Does PayPerTap sell buyer data to advertisers?",
    answer:
      "No. PayPerTap is not positioned as an advertising data product and does not sell buyer data to advertisers. Buyer details are used for the booking, seller handoff, order context, support, and related platform operations described in the privacy policy.",
    links: [{ label: "Privacy policy", path: "/privacy" }],
  },
  {
    group: "Returns, cancellations, and refunds",
    question: "Who handles product delivery?",
    answer:
      "The seller handles product delivery, pickup, shipping, COD, or local handover directly with the buyer. PayPerTap provides the booking record and WhatsApp handoff, but it does not manage courier operations or guarantee seller fulfilment.",
    links: [{ label: "Refund and cancellation", path: "/refund-cancellation" }],
  },
  {
    group: "Returns, cancellations, and refunds",
    question: "Who handles returns and exchanges?",
    answer:
      "The seller handles returns and exchanges according to the seller's own product terms and policy. PayPerTap does not handle the full product payment or seller-managed remaining amount, so product-level return, exchange, and delivery issues are discussed with the seller.",
    links: [{ label: "Refund and cancellation", path: "/refund-cancellation" }],
  },
  {
    group: "Returns, cancellations, and refunds",
    question: "Can buyers cancel a booking?",
    answer:
      "Buyers can contact the seller about cancelling the product purchase and should review the seller's cancellation terms. The PayPerTap ₹20 booking fee has a specific platform role in Phase 1, while product-level cancellation depends on the seller conversation and policy.",
    links: [{ label: "Refund and cancellation", path: "/refund-cancellation" }],
  },
  {
    group: "Returns, cancellations, and refunds",
    question: "Is the ₹20 booking refundable?",
    answer:
      "The ₹20 booking is PayPerTap's platform verified-booking fee in Phase 1, not a seller advance. Buyers should read the refund and cancellation policy before booking and discuss product-level cancellation or remaining-payment refunds directly with the seller.",
    links: [{ label: "Refund and cancellation", path: "/refund-cancellation" }],
  },
  {
    group: "Returns, cancellations, and refunds",
    question: "What if the seller cannot fulfill the order?",
    answer:
      "If the seller cannot fulfill the order, the buyer should contact the seller on WhatsApp using the booking context and seller policy. The seller handles product fulfilment, alternatives, cancellation, and any remaining amount paid directly to the seller.",
    links: [{ label: "Refund and cancellation", path: "/refund-cancellation" }],
  },
  {
    group: "Alternatives and comparisons",
    question: "Is PayPerTap like Linktree?",
    answer:
      "PayPerTap is different from Linktree because it is product-booking-first, not a general list of links. Linktree can be useful for sharing many destinations, while PayPerTap focuses on product pages, fixed ₹20 booking, and WhatsApp handoff for sellers.",
    links: [
      { label: "PayPerTap vs Linktree", path: "/compare/paypertap-vs-linktree" },
      { external: true, label: "Linktree link-in-bio tool", path: "https://linktr.ee/" },
    ],
  },
  {
    group: "Alternatives and comparisons",
    question: "Is PayPerTap like WhatsApp Catalog?",
    answer:
      "PayPerTap is different from WhatsApp Catalog because it gives sellers public store and product links with a paid booking step before WhatsApp. WhatsApp Catalog is useful inside WhatsApp Business, while PayPerTap can work as a booking layer alongside WhatsApp.",
    links: [{ label: "PayPerTap vs WhatsApp Catalog", path: "/compare/paypertap-vs-whatsapp-catalog" }],
  },
  {
    group: "Alternatives and comparisons",
    question: "Is PayPerTap like Google Forms?",
    answer:
      "PayPerTap is different from Google Forms because buyers see product pages and complete a fixed booking before WhatsApp handoff. Forms are useful for collecting responses, but PayPerTap is built around product discovery, buyer intent, and seller follow-up context.",
    links: [{ label: "PayPerTap vs Google Forms", path: "/compare/paypertap-vs-google-forms" }],
  },
  {
    group: "Alternatives and comparisons",
    question: "Is PayPerTap like Shopify Starter?",
    answer:
      "PayPerTap is lighter than Shopify Starter and is not a full ecommerce platform. Shopify Starter can fit merchants who want broader commerce tools, while PayPerTap fits sellers who want simple product links, fixed ₹20 booking, and direct WhatsApp confirmation.",
    links: [
      { label: "PayPerTap vs Shopify Starter", path: "/compare/paypertap-vs-shopify-starter" },
      {
        external: true,
        label: "Shopify Starter plan",
        path: "https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-starter-plan",
      },
    ],
  },
  {
    group: "Best use cases",
    question: "Is PayPerTap useful for thrift sellers?",
    answer:
      "Yes. PayPerTap is useful for thrift sellers because one-piece and limited-stock items often need a clearer reservation step. A buyer can review a product link, place the fixed booking, and continue to WhatsApp for remaining payment and delivery confirmation.",
    links: [{ label: "Thrift sellers", path: "/for/thrift-sellers" }],
  },
  {
    group: "Best use cases",
    question: "Is PayPerTap useful for boutiques?",
    answer:
      "Yes. PayPerTap is useful for boutiques that sell through Instagram and WhatsApp but want a cleaner storefront before chat. Boutique sellers can show product pages and collections, then use the booking step before final direct confirmation.",
    links: [{ label: "Boutique owners", path: "/for/boutiques" }],
  },
  {
    group: "Best use cases",
    question: "Is PayPerTap useful for handmade sellers?",
    answer:
      "Yes. PayPerTap is useful for handmade sellers who want buyers to read product details before chatting about customization, delivery, or remaining payment. The booking gives seller and buyer a clearer starting point for the direct WhatsApp conversation.",
    links: [{ label: "Handmade sellers", path: "/for/handmade-sellers" }],
  },
  {
    group: "Best use cases",
    question: "Is PayPerTap useful for student sellers?",
    answer:
      "Yes. PayPerTap is useful for student sellers who sell thrift items, books, accessories, college merch, or small products through groups, status updates, and DMs. It provides a low-setup product link and booking workflow before direct pickup or delivery discussion.",
    links: [{ label: "Student sellers", path: "/for/student-sellers" }],
  },
  {
    group: "Setup and onboarding",
    question: "How do sellers start using PayPerTap?",
    answer:
      "Sellers start by creating a PayPerTap store, adding products with clear images and prices, sharing the store or product link, and using the booking record to follow up with buyers on WhatsApp. Sellers should keep product details and policies accurate before sharing links.",
    links: [
      { label: "Create your store", path: "/auth" },
      { label: "Setup walkthrough", path: "/how-it-works" },
    ],
  },
];
