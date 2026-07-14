import { type FaqItem } from "../../seo-pages/seoPageTypes";

export const marketingFaqs: FaqItem[] = [
  {
    group: "PayPerTap basics",
    question: "What is PayPerTap?",
    answer:
      "PayPerTap is a verified order storefront for Indian Instagram and WhatsApp sellers. Sellers can create a store link or product link, buyers can place an order to reserve an item, and the buyer then continues to WhatsApp with product and order context ready.",
    links: [
      { label: "See how it works", path: "/how-it-works" },
      { label: "Explore verified order", path: "/features/verified-order" },
    ],
  },
  {
    group: "PayPerTap basics",
    question: "Who is PayPerTap for?",
    answer:
      "PayPerTap is for small product sellers who already find buyers through Instagram, WhatsApp, stories, DMs, groups, and status updates. It fits sellers who want cleaner product pages and an order step before direct chat, not merchants looking for a full ecommerce payment and payout stack.",
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
      "Yes. PayPerTap is built for Indian Instagram and WhatsApp sellers and uses an order model. Sellers remain responsible for deciding where they sell, whether they can deliver to a buyer location, and which direct remaining-payment methods they offer.",
    links: [{ label: "Pricing details", path: "/pricing" }],
  },
  {
    group: "PayPerTap basics",
    question: "What problem does PayPerTap solve?",
    answer:
      "PayPerTap solves the gap between social product interest and a serious buyer conversation. Instead of relying only on screenshots, repeated DMs, and casual holds, sellers can share a product link, receive an order through PayPerTap, and continue with a more organized WhatsApp handoff.",
    links: [
      { label: "order organization", path: "/features/order-organization" },
      { label: "Product links", path: "/features/product-links" },
    ],
  },
  {
    group: "order model",
    question: "How does the order work?",
    answer:
      "A buyer covers an order through PayPerTap for the selected product. That order records buyer and product details and reserves the item in the PayPerTap flow. In the current model, the seller wallet covers PayPerTap's platform per-order charge, not an advance remitted to the seller.",
    links: [
      { label: "Verified order feature", path: "/features/verified-order" },
      { label: "Pricing details", path: "/pricing" },
    ],
  },
  {
    group: "order model",
    question: "Why does PayPerTap use an order?",
    answer:
      "PayPerTap uses an order to keep the current model simple and predictable for buyers and sellers. The seller wallet charge records order context and avoids custom seller advance amounts, payout rules, and split-payment complexity.",
    links: [{ label: "How PayPerTap works", path: "/how-it-works" }],
  },
  {
    group: "order model",
    question: "Does PayPerTap process buyer payments?",
    answer:
      "No. PayPerTap does not provide payouts, advances, or split payments. PayPerTap charges the seller wallet as its platform per-order charge, while the seller collects customer payments directly from the buyer.",
    links: [{ label: "Pricing details", path: "/pricing" }],
  },
  {
    group: "order model",
    question: "What does PayPerTap charge sellers for?",
    answer:
      "PayPerTap charges the seller wallet as the platform per-order charge. The fee supports the order workflow, product reservation context, buyer record, and WhatsApp handoff layer. It is not a seller payout and it is not the full product price.",
    links: [{ label: "Terms of service", path: "/terms" }],
  },
  {
    group: "order model",
    question: "Does PayPerTap collect the full product payment?",
    answer:
      "No. The seller wallet is not the full product payment. It is a fixed PayPerTap seller wallet charge that reserves the product in the order flow. The buyer still pays the remaining product amount directly to the seller through WhatsApp, UPI, COD, or the seller's offered process.",
    links: [{ label: "Refund and cancellation", path: "/refund-cancellation" }],
  },
  {
    group: "order model",
    question: "Can sellers change the order amount in current model?",
    answer:
      "No. Sellers cannot change the order amount in current model. PayPerTap uses one seller wallet charge so the buyer experience, seller wallet charge wording, and seller responsibilities stay clear. Custom seller advances are outside the current current scope.",
    links: [{ label: "Pricing details", path: "/pricing" }],
  },
  {
    group: "Seller payments and platform limits",
    question: "Who collects the remaining product amount?",
    answer:
      "The seller collects the remaining product amount directly from the buyer after the PayPerTap Order. The seller and buyer agree on the final payment method, delivery, pickup, or COD arrangement in their WhatsApp conversation or other direct channel.",
    links: [{ label: "How PayPerTap works", path: "/how-it-works" }],
  },
  {
    group: "Seller payments and platform limits",
    question: "Can sellers use UPI, Google Pay, PhonePe, or COD?",
    answer:
      "Yes. For the remaining product amount, sellers can use UPI, Google Pay, PhonePe, COD, or another direct process they offer to buyers. Those payments happen between buyer and seller. PayPerTap's current model payment role is limited to the seller wallet charge.",
    links: [{ label: "Pricing details", path: "/pricing" }],
  },
  {
    group: "Seller payments and platform limits",
    question: "Does PayPerTap provide seller payouts?",
    answer:
      "No. PayPerTap does not provide seller payouts in the current model, because the seller wallet charge is kept by PayPerTap and the remaining product amount is paid directly to the seller. Sellers do not receive settlement from PayPerTap for product purchases.",
    links: [{ label: "current model pricing", path: "/pricing" }],
  },
  {
    group: "Seller payments and platform limits",
    question: "Do sellers need payout KYC in current model?",
    answer:
      "No. Sellers do not need payout KYC for PayPerTap in the current model, because PayPerTap does not settle seller payouts. Sellers remain responsible for any requirements connected with their own direct payment methods, business obligations, and delivery process.",
    links: [{ label: "Terms of service", path: "/terms" }],
  },
  {
    group: "Seller payments and platform limits",
    question: "Is PayPerTap a payment gateway?",
    answer:
      "No. PayPerTap is not a full payment gateway in current model. It handles the seller wallet verified order, order record, product reservation context, and WhatsApp handoff. It does not process the full product price or settle the seller's remaining amount.",
    links: [{ label: "Pricing details", path: "/pricing" }],
  },
  {
    group: "Seller payments and platform limits",
    question: "Does PayPerTap support Razorpay Route or Cashfree split payments?",
    answer:
      "No. PayPerTap does not support Razorpay Route, Cashfree split payments, seller split settlement, or custom payment routing. The model is intentionally simpler: PayPerTap charges the seller wallet per order, and the seller collects the remaining product amount directly.",
    links: [{ label: "platform limits", path: "/pricing" }],
  },
  {
    group: "WhatsApp handoff",
    question: "What happens after a buyer books?",
    answer:
      "After a buyer orders, PayPerTap records the order details, reserves the product in the order flow, and prepares the WhatsApp handoff. The buyer continues to the seller with product, order, remaining amount, and contact context ready for direct confirmation.",
    links: [{ label: "How PayPerTap works", path: "/how-it-works" }],
  },
  {
    group: "WhatsApp handoff",
    question: "How does WhatsApp handoff work?",
    answer:
      "WhatsApp handoff works by preparing a message after the order. The message gives the seller product and buyer context so the conversation can continue without restarting from scratch. The buyer opens WhatsApp and sends the prepared details to the seller.",
    links: [{ label: "WhatsApp handoff feature", path: "/features/whatsapp-handoff" }],
  },
  {
    group: "WhatsApp handoff",
    question: "Does PayPerTap automatically send WhatsApp messages?",
    answer:
      "No. PayPerTap does not automatically send WhatsApp messages or auto-reply for sellers. It prepares the handoff context after Order, but the buyer and seller handle the WhatsApp conversation directly. Sellers remain responsible for replies, confirmation, and follow-up.",
    links: [{ label: "WhatsApp handoff feature", path: "/features/whatsapp-handoff" }],
  },
  {
    group: "WhatsApp handoff",
    question: "Can sellers use WhatsApp Business?",
    answer:
      "Yes. Sellers can use WhatsApp Business after a PayPerTap Order because the final conversation still happens directly in WhatsApp. PayPerTap provides the storefront, order record, and handoff context; it does not replace the seller's chosen WhatsApp account.",
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
      "Yes. Sellers can use WhatsApp Business quick replies or their usual WhatsApp Business workflow after the PayPerTap handoff. PayPerTap does not manage those replies; it simply helps the buyer arrive with product, Order, and remaining amount context.",
    links: [{ label: "WhatsApp sellers", path: "/for/whatsapp-sellers" }],
  },
  {
    group: "WhatsApp handoff",
    question: "What details are included in the WhatsApp message?",
    answer:
      "The WhatsApp message can include product title, product link, buyer details, total product price, the order paid via PayPerTap, and the remaining amount to discuss with the seller. The goal is to keep the next seller conversation clear.",
    links: [{ label: "WhatsApp handoff feature", path: "/features/whatsapp-handoff" }],
  },
  {
    group: "Storefronts, products, links, collections",
    question: "What does a PayPerTap storefront include?",
    answer:
      "A PayPerTap storefront includes product pages, images, prices, seller context, order flow, policy links, and WhatsApp handoff. It is built for product discovery before chat, not as a full ecommerce checkout with seller payout and shipping operations.",
    links: [{ label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" }],
  },
  {
    group: "Storefronts, products, links, collections",
    question: "Can sellers share direct product links?",
    answer:
      "Yes. Sellers can share direct product links in Instagram DMs, stories, bio links, WhatsApp chats, groups, status updates, or other permitted channels. Direct links help buyers review one item before placing the order and continuing to WhatsApp.",
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
      "Yes. Sellers can use product images to give buyers more context before Order. Clear photos help buyers understand the item, but the seller should still confirm condition, size, delivery, and remaining payment directly after the WhatsApp handoff.",
    links: [{ label: "Product links feature", path: "/features/product-links" }],
  },
  {
    group: "Storefronts, products, links, collections",
    question: "Can buyers search products?",
    answer:
      "Yes. PayPerTap storefronts are designed around cleaner product browsing, including search where available in the store experience. Search helps buyers find relevant products before Order, while the seller still manages final confirmation and product availability directly.",
    links: [{ label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" }],
  },
  {
    group: "Inventory, reserved, sold, and availability",
    question: "Does the product become reserved after Order?",
    answer:
      "Yes. Completing the order reserves the selected product in the PayPerTap order flow. The reservation gives the seller buyer and product context, but the seller still needs to confirm product accuracy, remaining payment, delivery, and final completion.",
    links: [{ label: "Verified order feature", path: "/features/verified-order" }],
  },
  {
    group: "Inventory, reserved, sold, and availability",
    question: "What is the difference between reserved and sold?",
    answer:
      "Reserved means a buyer has completed the PayPerTap Order and the seller has a serious follow-up to handle. Sold means the seller has completed their direct confirmation, remaining payment, and fulfilment decision. PayPerTap separates these because final payment happens outside PayPerTap.",
    links: [{ label: "order organization", path: "/features/order-organization" }],
  },
  {
    group: "Inventory, reserved, sold, and availability",
    question: "What happens if an item is already reserved?",
    answer:
      "If an item is already reserved, buyers should not treat it as freely available until the seller updates the product or order status. The seller remains responsible for confirming whether the first buyer completes the purchase, cancels, or leaves the item available again.",
    links: [{ label: "order organization", path: "/features/order-organization" }],
  },
  {
    group: "Inventory, reserved, sold, and availability",
    question: "Can sellers manually mark a product as sold?",
    answer:
      "Yes. Sellers can mark products or Orders as sold or complete through the available seller workflow after they finish direct confirmation with the buyer. This lets the order flow distinguish buyer intent from the seller's final product completion decision.",
    links: [{ label: "order organization", path: "/features/order-organization" }],
  },
  {
    group: "Buyer details, privacy, and leads",
    question: "What buyer details does PayPerTap collect?",
    answer:
      "PayPerTap collects buyer details needed for the Order and seller handoff, such as name, phone or contact details, selected product, Order information, and any buyer-provided context needed for the order discussion. The goal is to operate the order flow.",
    links: [{ label: "Privacy policy", path: "/privacy" }],
  },
  {
    group: "Buyer details, privacy, and leads",
    question: "How does PayPerTap use buyer details?",
    answer:
      "PayPerTap uses buyer details to operate the storefront, record the Order, prepare the WhatsApp handoff, help the seller manage the order context, and support the order workflow. Sellers then use the buyer conversation to complete direct confirmation and delivery.",
    links: [
      { label: "Customer leads", path: "/features/customer-leads" },
      { label: "Privacy policy", path: "/privacy" },
    ],
  },
  {
    group: "Buyer details, privacy, and leads",
    question: "Does PayPerTap sell buyer data to advertisers?",
    answer:
      "No. PayPerTap is not positioned as an advertising data product and does not sell buyer data to advertisers. Buyer details are used for the Order, seller handoff, order context, support, and related platform operations described in the privacy policy.",
    links: [{ label: "Privacy policy", path: "/privacy" }],
  },
  {
    group: "Returns, cancellations, and refunds",
    question: "Who handles product delivery?",
    answer:
      "The seller handles product delivery, pickup, shipping, COD, or local handover directly with the buyer. PayPerTap provides the order record and WhatsApp handoff, but it does not manage courier operations or guarantee seller fulfilment.",
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
    question: "Can buyers cancel an order?",
    answer:
      "Buyers can contact the seller about cancelling the product purchase and should review the seller's cancellation terms. The PayPerTap seller wallet charge has a specific platform role in the current model, while product-level cancellation depends on the seller conversation and policy.",
    links: [{ label: "Refund and cancellation", path: "/refund-cancellation" }],
  },
  {
    group: "Returns, cancellations, and refunds",
    question: "Is the order refundable?",
    answer:
      "The order is PayPerTap's platform per-order charge in the current model, not a seller advance. Buyers should read the refund and cancellation policy before Order and discuss product-level cancellation or remaining-payment refunds directly with the seller.",
    links: [{ label: "Refund and cancellation", path: "/refund-cancellation" }],
  },
  {
    group: "Returns, cancellations, and refunds",
    question: "What if the seller cannot fulfill the order?",
    answer:
      "If the seller cannot fulfill the order, the buyer should contact the seller on WhatsApp using the order context and seller policy. The seller handles product fulfilment, alternatives, cancellation, and any remaining amount paid directly to the seller.",
    links: [{ label: "Refund and cancellation", path: "/refund-cancellation" }],
  },
  {
    group: "Alternatives and comparisons",
    question: "Is PayPerTap like Linktree?",
    answer:
      "PayPerTap is different from Linktree because it is product-order-first, not a general list of links. Linktree can be useful for sharing many destinations, while PayPerTap focuses on product pages, order, and WhatsApp handoff for sellers.",
    links: [
      { label: "PayPerTap vs Linktree", path: "/compare/paypertap-vs-linktree" },
      { external: true, label: "Linktree link-in-bio tool", path: "https://linktr.ee/" },
    ],
  },
  {
    group: "Alternatives and comparisons",
    question: "Is PayPerTap like WhatsApp Catalog?",
    answer:
      "PayPerTap is different from WhatsApp Catalog because it gives sellers public store and product links with an order step before WhatsApp. WhatsApp Catalog is useful inside WhatsApp Business, while PayPerTap can work as an order layer alongside WhatsApp.",
    links: [{ label: "PayPerTap vs WhatsApp Catalog", path: "/compare/paypertap-vs-whatsapp-catalog" }],
  },
  {
    group: "Alternatives and comparisons",
    question: "Is PayPerTap like Google Forms?",
    answer:
      "PayPerTap is different from Google Forms because buyers see product pages and complete an order before WhatsApp handoff. Forms are useful for collecting responses, but PayPerTap is built around product discovery, buyer intent, and seller follow-up context.",
    links: [{ label: "PayPerTap vs Google Forms", path: "/compare/paypertap-vs-google-forms" }],
  },
  {
    group: "Alternatives and comparisons",
    question: "Is PayPerTap like Shopify Starter?",
    answer:
      "PayPerTap is lighter than Shopify Starter and is not a full ecommerce platform. Shopify Starter can fit merchants who want broader commerce tools, while PayPerTap fits sellers who want simple product links, order, and direct WhatsApp confirmation.",
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
      "Yes. PayPerTap is useful for thrift sellers because one-piece and limited-stock items often need a clearer reservation step. A buyer can review a product link, place the order, and continue to WhatsApp for remaining payment and delivery confirmation.",
    links: [{ label: "Thrift sellers", path: "/for/thrift-sellers" }],
  },
  {
    group: "Best use cases",
    question: "Is PayPerTap useful for boutiques?",
    answer:
      "Yes. PayPerTap is useful for boutiques that sell through Instagram and WhatsApp but want a cleaner storefront before chat. Boutique sellers can show product pages and collections, then use the order step before final direct confirmation.",
    links: [{ label: "Boutique owners", path: "/for/boutiques" }],
  },
  {
    group: "Best use cases",
    question: "Is PayPerTap useful for handmade sellers?",
    answer:
      "Yes. PayPerTap is useful for handmade sellers who want buyers to read product details before chatting about customization, delivery, or remaining payment. The Order gives seller and buyer a clearer starting point for the direct WhatsApp conversation.",
    links: [{ label: "Handmade sellers", path: "/for/handmade-sellers" }],
  },
  {
    group: "Best use cases",
    question: "Is PayPerTap useful for student sellers?",
    answer:
      "Yes. PayPerTap is useful for student sellers who sell thrift items, books, accessories, college merch, or small products through groups, status updates, and DMs. It provides a low-setup product link and order workflow before direct pickup or delivery discussion.",
    links: [{ label: "Student sellers", path: "/for/student-sellers" }],
  },
  {
    group: "Setup and onboarding",
    question: "How do sellers start using PayPerTap?",
    answer:
      "Sellers start by creating a PayPerTap store, adding products with clear images and prices, sharing the store or product link, and using the order record to follow up with buyers on WhatsApp. Sellers should keep product details and policies accurate before sharing links.",
    links: [
      { label: "Create your store", path: "/auth" },
      { label: "Setup walkthrough", path: "/how-it-works" },
    ],
  },
];
