import { type FeatureSlug, type SeoPageContent } from "./seoPageTypes";

export const featureContent: Record<FeatureSlug, SeoPageContent> = {
  "verified-order": {
    path: "/features/verified-order",
    title: "Verified order for Instagram & WhatsApp Sellers",
    description:
      "Add a fixed order step before WhatsApp handoff so sellers get clearer buyer intent and product context.",
    h1: "Verified order for Instagram and WhatsApp sellers",
    summary:
      "PayPerTap verified order asks buyers to pay a fixed order fee before the WhatsApp handoff, so sellers can focus on more serious product enquiries.",
    whatItIs:
      "Verified order is a small paid commitment before the seller holds an item or spends more time in chat. The seller wallet covers PayPerTap's per-order charge on PayPerTap, PayPerTap charges the seller wallet for it as the platform per-order charge, and the seller collects the remaining amount directly.",
    howItWorks: [
      "Seller shares a store link or product link from Instagram, WhatsApp, bio, stories, status, or DMs.",
      "Buyer reviews the product and pays the fixed order via PayPerTap.",
      "Buyer continues to WhatsApp with product, buyer, Order, and remaining amount context.",
      "Seller confirms availability, delivery, UPI, COD, or the remaining payment directly with the buyer.",
    ],
    benefits: [
      "Adds an order step before sellers spend more time on casual holds and repeated 'available?' messages.",
      "Creates a clearer serious-buyer filter for limited-stock products.",
      "Keeps WhatsApp, UPI, COD, and seller-buyer confirmation intact.",
      "Gives every buyer conversation product and order context from the start.",
    ],
    bestFor: [
      "Instagram sellers who get many casual DMs.",
      "WhatsApp sellers who want an order signal before chat continues.",
      "Thrift, boutique, handmade, and student sellers with limited stock.",
    ],
    notBestFor: [
      "Large merchants looking for full checkout, seller payout, or split payments.",
      "Sellers who want custom advance amounts.",
    ],
    example:
      "A thrift seller can post a jacket link in Instagram Stories. Instead of holding the jacket for every casual message, the seller prioritizes the buyer who completed the order and moved to WhatsApp with details ready.",
    faqs: [
      {
        question: "How does verified order help filter casual enquiries?",
        answer:
          "A buyer who places an order has taken a small commitment step. That gives the seller clearer intent context before spending more time confirming the order.",
      },
      {
        question: "Does the seller receive the order fee?",
        answer:
          "No. PayPerTap charges the seller wallet for the fixed wallet as the platform per-order charge. The seller collects the remaining amount directly from the buyer.",
      },
      {
        question: "Is verified order useful for limited-stock products?",
        answer:
          "Yes. It works well for one-piece thrift drops, boutique items, handmade products, and social sellers who need stronger buyer intent before holding stock.",
      },
    ],
    related: [
      { label: "Pricing and order", path: "/pricing" },
      { label: "PayPerTap for thrift sellers", path: "/for/thrift-sellers" },
      { label: "order organization", path: "/features/order-organization" },
      { label: "PayPerTap vs Linktree", path: "/compare/paypertap-vs-linktree" },
    ],
  },
  "link-in-bio-storefront": {
    path: "/features/link-in-bio-storefront",
    title: "Link-in-Bio Storefront for Product Sellers",
    description:
      "Create a product-first Instagram bio storefront with product links, order, and WhatsApp handoff.",
    h1: "Link-in-bio storefront for product sellers",
    summary:
      "PayPerTap gives Instagram and WhatsApp sellers a clean store link that shows products, starts an order flow, and sends serious buyers to WhatsApp.",
    whatItIs:
      "A link-in-bio storefront is more than a list of links. For product sellers, it should show products, prices, order context, and the next WhatsApp step. PayPerTap is built for sellers who want that product-first flow without building a full ecommerce website.",
    howItWorks: [
      "Seller adds products, images, prices, and useful details.",
      "Seller shares the store link in Instagram bio, stories, DMs, WhatsApp chats, groups, or status.",
      "Buyer browses products and chooses the item they want to reserve.",
      "PayPerTap starts the fixed order and WhatsApp handoff flow.",
    ],
    benefits: [
      "Replaces screenshots, highlights, and repeated price replies with one store link.",
      "Works as an Instagram store link, WhatsApp store link, and product catalog layer.",
      "Supports both full-store sharing and product-specific links.",
      "Keeps the seller's direct WhatsApp closing process intact.",
    ],
    bestFor: [
      "Instagram sellers who want a product link in bio.",
      "WhatsApp sellers who need one clean link before chat begins.",
      "Small sellers not ready for Shopify or a custom website.",
    ],
    notBestFor: [
      "Creators who only need a generic list of social links.",
      "Merchants who need full ecommerce checkout and seller payout setup.",
    ],
    example:
      "A boutique owner can put one PayPerTap link in Instagram bio, organize the whole store around collections like new arrivals or festive drops, and let buyers browse product cards before Order and continuing to WhatsApp.",
    faqs: [
      {
        question: "How is PayPerTap different from a generic bio link tool?",
        answer:
          "Generic bio link tools are useful for linking to many pages. PayPerTap is built for product sellers who need product browsing, order, and WhatsApp handoff.",
      },
      {
        question: "Can I share individual product links too?",
        answer:
          "Yes. Sellers can share the full storefront for browsing and product-specific links when a buyer asks about one item.",
      },
      {
        question: "Can this work for Instagram and WhatsApp both?",
        answer:
          "Yes. The same storefront or product link can be shared in Instagram bio, DMs, stories, WhatsApp chats, groups, or status.",
      },
    ],
    related: [
      { label: "Product links", path: "/features/product-links" },
      { label: "Instagram sellers", path: "/for/instagram-sellers" },
      { label: "WhatsApp sellers", path: "/for/whatsapp-sellers" },
      { label: "PayPerTap vs Linktree", path: "/compare/paypertap-vs-linktree" },
    ],
  },
  "whatsapp-handoff": {
    path: "/features/whatsapp-handoff",
    title: "WhatsApp Handoff for product orders",
    description:
      "Send buyers to WhatsApp with product, order, remaining amount, and buyer details ready for seller confirmation.",
    h1: "WhatsApp handoff for product Orders",
    summary:
      "PayPerTap moves buyers from verified order to WhatsApp with the product and remaining-payment context already prepared.",
    whatItIs:
      "WhatsApp handoff is the step after Order where the buyer continues with the seller. PayPerTap does not auto-reply on WhatsApp or replace WhatsApp Business; it helps the buyer arrive with product, price, Order, and remaining amount context.",
    howItWorks: [
      "Buyer books a product with the PayPerTap per-order charge.",
      "PayPerTap prepares a WhatsApp message with product and order context.",
      "Buyer opens WhatsApp and sends the message to the seller.",
      "Seller confirms availability, delivery, UPI, COD, or remaining payment directly.",
    ],
    benefits: [
      "Reduces missing context in WhatsApp conversations.",
      "Works alongside WhatsApp Business greetings, away messages, and quick replies.",
      "Keeps final confirmation direct and human.",
      "Makes Instagram-to-WhatsApp selling easier to follow.",
    ],
    bestFor: [
      "WhatsApp sellers who still want to close deals in chat.",
      "Instagram sellers who move serious buyers to WhatsApp.",
      "Sellers who need product and order details in one message.",
    ],
    notBestFor: [
      "Sellers looking for WhatsApp auto-reply automation.",
      "Sellers looking for full product payment collection through PayPerTap.",
    ],
    example:
      "A buyer books a handmade tote and opens WhatsApp with a message mentioning the product title, product link, total price, order submitted, and remaining amount to confirm with the seller.",
    faqs: [
      {
        question: "Does PayPerTap send automatic WhatsApp replies?",
        answer:
          "No. PayPerTap does not automate seller replies. It helps the buyer reach WhatsApp with useful Order and product details.",
      },
      {
        question: "Can I use this with WhatsApp Business?",
        answer:
          "Yes. PayPerTap works well with WhatsApp Business because the final conversation still happens directly in WhatsApp.",
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
      { label: "How PayPerTap works", path: "/how-it-works" },
      { label: "PayPerTap vs WhatsApp Catalog", path: "/compare/paypertap-vs-whatsapp-catalog" },
    ],
  },
  "order-organization": {
    path: "/features/order-organization",
    title: "Instagram DM Order Management for Social Sellers",
    description:
      "Organize product interest, buyer details, order status, and WhatsApp follow-up for Instagram and WhatsApp sellers.",
    h1: "order organization for Instagram and WhatsApp sellers",
    summary:
      "PayPerTap charges the seller wallet for buyer context, product interest, order status, and WhatsApp follow-up together so sellers are not relying only on scattered DMs.",
    whatItIs:
      "order organization means sellers can see which buyer ordered which product, what still needs to happen, and where the WhatsApp conversation should continue. PayPerTap organizes the order layer while the seller handles delivery and remaining payment directly.",
    howItWorks: [
      "Seller shares a store or product link instead of manually repeating details.",
      "Buyer books with the fixed order fee.",
      "PayPerTap charges the seller wallet for product interest and buyer context together.",
      "Seller follows up on WhatsApp and updates the selling status.",
    ],
    benefits: [
      "Reduces scattered screenshots and manual notes.",
      "Connects product interest to the buyer conversation.",
      "Helps sellers distinguish reserved, contacted, and sold status.",
      "Keeps delivery and remaining payment with the seller.",
    ],
    bestFor: [
      "Instagram sellers managing orders from DMs and stories.",
      "WhatsApp sellers who want buyer context before chat.",
      "Small catalogs where every buyer conversation matters.",
    ],
    notBestFor: [
      "Teams needing warehouse-grade inventory or ERP workflows.",
      "Sellers who want PayPerTap to manage fulfillment or returns.",
    ],
    example:
      "A boutique seller can see which buyer booked a co-ord set, continue the conversation on WhatsApp, and later mark the product sold after direct confirmation.",
    faqs: [
      {
        question: "Does PayPerTap manage delivery?",
        answer:
          "No. The seller handles delivery, remaining payment, and final confirmation directly with the buyer.",
      },
      {
        question: "Can sellers track reserved products?",
        answer:
          "Yes. PayPerTap is designed to keep order context connected to product interest so sellers can follow up more clearly.",
      },
      {
        question: "Is this useful for Instagram DM order management?",
        answer:
          "Yes. It gives sellers a structured starting point before the chat continues, instead of relying only on DMs and screenshots.",
      },
    ],
    related: [
      { label: "Verified order", path: "/features/verified-order" },
      { label: "Customer leads", path: "/features/customer-leads" },
      { label: "Instagram sellers", path: "/for/instagram-sellers" },
      { label: "PayPerTap vs Google Forms", path: "/compare/paypertap-vs-google-forms" },
    ],
  },
  "product-links": {
    path: "/features/product-links",
    title: "Shareable Product Links for Instagram Sellers",
    description:
      "Share one product link in Instagram DMs, stories, and WhatsApp so buyers can see details, place an order, and continue to chat.",
    h1: "Shareable product links for Instagram and WhatsApp sellers",
    summary:
      "PayPerTap product links let sellers send one clean product page instead of repeating photos, price, availability, and order steps in every chat.",
    whatItIs:
      "A product link is a direct page for one item. It helps buyers review the product, understand the order step, and continue to WhatsApp with useful context.",
    howItWorks: [
      "Seller creates a product with images, price, and details.",
      "Seller shares the product link in DMs, stories, status, or chat.",
      "Buyer opens the product page and places an order.",
      "Buyer continues to WhatsApp for direct seller confirmation.",
    ],
    benefits: [
      "Makes one-item sharing cleaner than screenshots.",
      "Works well for thrift drops, boutique pieces, handmade products, books, and accessories.",
      "Carries product context into the WhatsApp handoff.",
      "Supports direct remaining payment discussion between buyer and seller.",
    ],
    bestFor: [
      "Sellers who answer product-specific questions in DMs.",
      "Drop-based pages that need fast product-by-product sharing.",
      "Student and thrift sellers with small catalogs.",
    ],
    notBestFor: [
      "Sellers who only want a static PDF catalog.",
      "Merchants who need a full shopping cart checkout.",
    ],
    example:
      "When a buyer asks about a specific bag, the seller can send one individual product link instead of typing the price, size, Order rules, and WhatsApp next steps again. The buyer lands directly on that item before Order.",
    faqs: [
      {
        question: "Can I share a product link instead of my whole store?",
        answer:
          "Yes. Sellers can share a full store link for browsing and a product link when a buyer asks about one item.",
      },
      {
        question: "Does a product link replace WhatsApp?",
        answer:
          "No. The product link gives buyers a cleaner starting point before the WhatsApp conversation continues.",
      },
      {
        question: "Where can I share product links?",
        answer:
          "You can share them in Instagram DMs, stories, bio links, WhatsApp chats, groups, or status.",
      },
    ],
    related: [
      { label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" },
      { label: "WhatsApp handoff", path: "/features/whatsapp-handoff" },
      { label: "Student sellers", path: "/for/student-sellers" },
      { label: "PayPerTap vs Google Forms", path: "/compare/paypertap-vs-google-forms" },
    ],
  },
  "customer-leads": {
    path: "/features/customer-leads",
    title: "Customer Leads and Buyer Context for Social Sellers",
    description:
      "Capture buyer context from verified orders so Instagram and WhatsApp sellers can follow up with clearer product interest.",
    h1: "Customer leads for social sellers",
    summary:
      "PayPerTap captures buyer context during Order, so WhatsApp follow-up starts with the product and buyer interest already attached.",
    whatItIs:
      "Customer leads in PayPerTap are buyer details connected to a product Order. The goal is not to sell buyer data or run ads; it is to help sellers manage their own Order and WhatsApp follow-up workflow.",
    howItWorks: [
      "Buyer chooses a product from the seller's PayPerTap link.",
      "Buyer completes the fixed order step.",
      "PayPerTap charges the seller wallet for buyer and product context together.",
      "Seller follows up directly on WhatsApp for remaining payment and delivery.",
    ],
    benefits: [
      "Keeps buyer intent attached to product interest.",
      "Makes follow-up clearer than scattered DMs.",
      "Helps sellers prioritize buyers who completed the order step.",
      "Keeps final confirmation direct between buyer and seller.",
    ],
    bestFor: [
      "Sellers who want buyer details connected to product interest.",
      "Handmade, boutique, and thrift sellers who need careful follow-up.",
      "WhatsApp-first sellers who want cleaner context before chat.",
    ],
    notBestFor: [
      "Businesses looking for an advertising data product.",
      "Teams needing CRM automation beyond order context.",
    ],
    example:
      "A handmade seller can see which buyer booked a necklace and continue on WhatsApp with the buyer's product interest already clear.",
    faqs: [
      {
        question: "Who collects the remaining amount?",
        answer:
          "The seller collects the remaining amount directly through WhatsApp, UPI, COD, or their usual process.",
      },
      {
        question: "Is customer lead data used for ads?",
        answer:
          "PayPerTap uses order context to operate the storefront and order workflow. It is not positioned as an advertising data product.",
      },
      {
        question: "Is this privacy-safe for buyers?",
        answer:
          "PayPerTap only asks for context needed to operate the Order and seller handoff. Sellers remain responsible for their direct buyer communication.",
      },
    ],
    related: [
      { label: "order organization", path: "/features/order-organization" },
      { label: "WhatsApp handoff", path: "/features/whatsapp-handoff" },
      { label: "Handmade sellers", path: "/for/handmade-sellers" },
      { label: "Privacy policy", path: "/privacy" },
    ],
  },
};
