import { type SeoPageContent, type UseCaseSlug } from "./seoPageTypes";

export const useCaseContent: Record<UseCaseSlug, SeoPageContent> = {
  "instagram-sellers": {
    path: "/for/instagram-sellers",
    title: "PayPerTap for Instagram Sellers in India | Seller Wallet Orders",
    description:
      "An Instagram seller tool for India: create a store link, share product links, add order intent, and continue on WhatsApp.",
    h1: "PayPerTap for Instagram sellers in India",
    summary:
      "PayPerTap helps Instagram sellers turn bio clicks, stories, and DMs into cleaner product Orders with a store link, order, and WhatsApp handoff.",
    whatItIs:
      "This page is for Instagram sellers who are tired of repeating prices, sharing screenshots, managing 'available?' DMs, and holding products for buyers who disappear. PayPerTap gives them a product-first store link and a serious-buyer order step.",
    howItWorks: [
      "Put your PayPerTap store link in Instagram bio and share product links in DMs, stories, reels, and posts.",
      "Buyer opens the product page instead of asking for every detail again.",
      "Buyer books with the PayPerTap per-order charge.",
      "Buyer continues to WhatsApp with product and remaining amount context ready.",
    ],
    benefits: [
      "Cleaner Instagram store link than screenshots, highlights, and repeated replies.",
      "Adds an order step before low-intent DMs consume more seller time.",
      "Gives buyers product pages, prices, and order context before chat.",
      "Keeps WhatsApp confirmation and direct remaining payment with the seller.",
    ],
    bestFor: [
      "Instagram sellers in India who sell through DMs and stories.",
      "Fashion, thrift, handmade, accessory, and reseller pages.",
      "Sellers who want a simple product link before WhatsApp.",
    ],
    notBestFor: [
      "Large ecommerce teams needing full checkout and payout infrastructure.",
      "Creators who only need a link list with no product Order.",
    ],
    example:
      "A fashion reseller can post a story, send the product link to interested buyers, and focus on the buyer who completes the order before moving to WhatsApp.",
    faqs: [
      {
        question: "Can I use PayPerTap as my Instagram bio link?",
        answer:
          "Yes. Your PayPerTap store can work as a product-focused Instagram bio link for buyers who want to browse and book.",
      },
      {
        question: "Does PayPerTap help with Instagram DM order management?",
        answer:
          "Yes. It gives buyers a product link and order step before chat continues, reducing repeated details and scattered DMs.",
      },
      {
        question: "Does PayPerTap replace Instagram DMs?",
        answer:
          "No. It adds a cleaner product link and verified order step before the WhatsApp or DM conversation continues.",
      },
    ],
    related: [
      { label: "Verified order", path: "/features/verified-order" },
      { label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" },
      { label: "Product links", path: "/features/product-links" },
      { label: "PayPerTap vs Linktree", path: "/compare/paypertap-vs-linktree" },
    ],
  },
  "whatsapp-sellers": {
    path: "/for/whatsapp-sellers",
    title: "PayPerTap for WhatsApp Sellers | Store Link and Order",
    description:
      "A WhatsApp selling tool for product links, order, and WhatsApp Business-friendly order handoff.",
    h1: "PayPerTap for WhatsApp sellers",
    summary:
      "PayPerTap helps WhatsApp sellers share cleaner store and product links before buyers continue to chat with Order and product context ready.",
    whatItIs:
      "This is for sellers who already close deals on WhatsApp but want a cleaner storefront link before chat begins. PayPerTap can work alongside WhatsApp Business without replacing the seller's direct conversation.",
    howItWorks: [
      "Share your store link in WhatsApp status, groups, chats, or Instagram bio.",
      "Send product links when buyers ask for specific items.",
      "Buyer books through PayPerTap with the per-order charge.",
      "Buyer reaches WhatsApp with product, Order, and remaining amount details.",
    ],
    benefits: [
      "Works alongside WhatsApp Business greetings, away messages, and quick replies.",
      "Gives buyers product context before they message.",
      "Reduces repeated product detail messages.",
      "Seller collects remaining payment directly through UPI, COD, or their process.",
    ],
    bestFor: [
      "WhatsApp sellers who want a public store link.",
      "Sellers using WhatsApp Business as their main closing channel.",
      "Sellers comparing PayPerTap with WhatsApp Catalog.",
    ],
    notBestFor: [
      "Sellers looking for WhatsApp auto-reply automation.",
      "Sellers looking for full payment collection or seller payout from PayPerTap.",
    ],
    example:
      "A seller can share a PayPerTap product link in WhatsApp status. Buyers see details first, book, and continue the conversation with useful context already included.",
    faqs: [
      {
        question: "Can I use PayPerTap with WhatsApp Business?",
        answer:
          "Yes. PayPerTap works well with WhatsApp Business because the final confirmation still happens directly in WhatsApp.",
      },
      {
        question: "Is PayPerTap a WhatsApp Catalog alternative?",
        answer:
          "It can be. WhatsApp Catalog displays products inside WhatsApp, while PayPerTap gives sellers public store and product links with an order step before WhatsApp handoff.",
      },
      {
        question: "Does PayPerTap collect the full product payment?",
        answer:
          "No. PayPerTap only uses the fixed order fee. Sellers collect the remaining amount directly.",
      },
    ],
    related: [
      { label: "WhatsApp handoff", path: "/features/whatsapp-handoff" },
      { label: "Product links", path: "/features/product-links" },
      { label: "Pricing", path: "/pricing" },
      { label: "PayPerTap vs WhatsApp Catalog", path: "/compare/paypertap-vs-whatsapp-catalog" },
    ],
  },
  "thrift-sellers": {
    path: "/for/thrift-sellers",
    title: "Thrift Store Order System for Instagram Sellers | PayPerTap",
    description:
      "Reserve limited-stock thrift items with order, product links, and Instagram-to-WhatsApp handoff.",
    h1: "A thrift store Order system for limited-stock drops",
    summary:
      "PayPerTap helps thrift sellers reserve one-piece products only after a buyer completes an order and continues to WhatsApp.",
    whatItIs:
      "This is for thrift sellers who run drops, sell one-piece items, and deal with fake 'available?' messages. PayPerTap gives every product a clean link and every serious hold a small order step.",
    howItWorks: [
      "Upload each thrift item as a product with price, photos, and details.",
      "Share product links in Instagram drops, DMs, bio, or WhatsApp status.",
      "Buyer places an order to show intent.",
      "Seller confirms remaining payment, pickup, shipping, or delivery directly.",
    ],
    benefits: [
      "Useful for one-piece products and fast drops.",
      "Adds a clearer reservation step before sellers hold items for casual enquiries.",
      "Keeps products visible in a clean storefront instead of scattered posts.",
      "Works naturally with Instagram and WhatsApp selling.",
    ],
    bestFor: [
      "Instagram thrift pages with limited stock.",
      "Vintage, pre-loved, and drop-based fashion sellers.",
      "Student thrift sellers who want a low-setup flow.",
    ],
    notBestFor: [
      "Stores needing variant-heavy ecommerce checkout.",
      "Sellers who want PayPerTap to manage delivery or returns.",
    ],
    example:
      "For a vintage shirt drop, a seller can share the product link and reserve the piece only after a buyer completes the order step.",
    faqs: [
      {
        question: "Can PayPerTap help with one-piece thrift items?",
        answer:
          "Yes. Verified order is especially useful when each product has only one unit or limited availability.",
      },
      {
        question: "Does Order automatically mean delivery is confirmed?",
        answer:
          "No. The seller still confirms availability, delivery, and remaining payment directly with the buyer.",
      },
      {
        question: "Can thrift sellers share direct product links?",
        answer:
          "Yes. Sellers can share individual thrift product links in stories, DMs, or WhatsApp status.",
      },
    ],
    related: [
      { label: "Verified order", path: "/features/verified-order" },
      { label: "Instagram sellers", path: "/for/instagram-sellers" },
      { label: "Product links", path: "/features/product-links" },
      { label: "Pricing", path: "/pricing" },
    ],
  },
  boutiques: {
    path: "/for/boutiques",
    title: "Boutique Store Link for Instagram and WhatsApp | PayPerTap",
    description:
      "Create a boutique storefront link with product pages, order, and WhatsApp handoff for direct confirmation.",
    h1: "A cleaner store link for boutique owners",
    summary:
      "PayPerTap helps boutique owners show products in one link, filter serious buyers with order, and continue order confirmation on WhatsApp.",
    whatItIs:
      "This is for boutique and fashion sellers who want a professional product link without switching to a heavy ecommerce stack. PayPerTap charges the seller wallet for product discovery clean and the final conversation direct.",
    howItWorks: [
      "Add boutique products with images, prices, and details.",
      "Share the store link across Instagram and WhatsApp.",
      "Let buyers book with the fixed wallet PayPerTap fee.",
      "Collect the remaining amount directly through UPI, COD, or chat.",
    ],
    benefits: [
      "Clean catalog-like storefront for boutique products.",
      "Useful product pages instead of repeated photo sharing.",
      "Works with WhatsApp selling and direct UPI/COD collection.",
      "Organizes product discovery before chat.",
    ],
    bestFor: [
      "Boutiques selling through Instagram and WhatsApp.",
      "Fashion sellers who want a catalog-like link without full ecommerce setup.",
      "Sellers who collect remaining payment directly.",
    ],
    notBestFor: [
      "Boutiques needing a full payment gateway or settlement stack.",
      "Brands needing advanced ecommerce automation.",
    ],
    example:
      "A boutique owner can list new arrivals, sizes, colors, kurtis, co-ords, or festive drops in one PayPerTap store. A buyer books the item, then the seller confirms size, delivery, and remaining payment on WhatsApp.",
    faqs: [
      {
        question: "Is PayPerTap suitable for boutique catalogs?",
        answer:
          "Yes. Boutique sellers can use PayPerTap as a simple storefront for product browsing and Order.",
      },
      {
        question: "Can I still collect payment on UPI or COD?",
        answer:
          "Yes. The remaining amount is collected directly by the seller through their preferred method.",
      },
      {
        question: "Is PayPerTap a Shopify replacement for boutiques?",
        answer:
          "Not for every boutique. It is best for early social sellers who want product links and order before a full ecommerce setup.",
      },
    ],
    related: [
      { label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" },
      { label: "order organization", path: "/features/order-organization" },
      { label: "Shopify Starter comparison", path: "/compare/paypertap-vs-shopify-starter" },
      { label: "How it works", path: "/how-it-works" },
    ],
  },
  "handmade-sellers": {
    path: "/for/handmade-sellers",
    title: "Handmade Seller Online Store Link | PayPerTap",
    description:
      "A simple online store link for handmade sellers to share product stories, qualify serious buyers, and confirm orders on WhatsApp.",
    h1: "A simple storefront for handmade sellers",
    summary:
      "PayPerTap gives handmade sellers product pages, buyer context, order, and WhatsApp confirmation without complex store setup.",
    whatItIs:
      "This is for craft, handmade, and small-batch sellers who want buyers to understand product details before chatting. PayPerTap charges the seller wallet for the product story visible and the final confirmation personal.",
    howItWorks: [
      "Add handmade products with images, descriptions, and prices.",
      "Share product or store links with interested buyers.",
      "Buyer places an order as a serious-buyer signal.",
      "Seller confirms customization, delivery, and remaining payment directly.",
    ],
    benefits: [
      "Supports product storytelling and small-batch detail.",
      "Helps filter serious buyers for custom or handmade work.",
      "Keeps confirmation personal through WhatsApp.",
      "Avoids complex ecommerce setup.",
    ],
    bestFor: [
      "Handmade jewelry, crafts, gifts, home decor, and small-batch sellers.",
      "Sellers who discuss customization after buyer intent is clear.",
      "Creators selling physical products through Instagram and WhatsApp.",
    ],
    notBestFor: [
      "Digital product sellers needing downloads and licensing.",
      "Sellers who need PayPerTap to handle full payment or delivery.",
    ],
    example:
      "A handmade jewelry seller can share a made-to-order product page with materials, batch limits, and price. A buyer books interest first, then the seller confirms timeline, custom details, and delivery on WhatsApp.",
    faqs: [
      {
        question: "Can handmade sellers use PayPerTap without a full website?",
        answer:
          "Yes. PayPerTap provides a simple storefront link without a full website build.",
      },
      {
        question: "Can sellers discuss custom details after Order?",
        answer:
          "Yes. Customization and final confirmation can happen directly on WhatsApp after Order.",
      },
      {
        question: "Does PayPerTap handle delivery for handmade products?",
        answer:
          "No. Delivery and remaining payment are handled directly between buyer and seller.",
      },
    ],
    related: [
      { label: "Customer leads", path: "/features/customer-leads" },
      { label: "WhatsApp handoff", path: "/features/whatsapp-handoff" },
      { label: "Product links", path: "/features/product-links" },
      { label: "Instagram sellers", path: "/for/instagram-sellers" },
    ],
  },
  "student-sellers": {
    path: "/for/student-sellers",
    title: "Student Seller Product Store for Instagram and WhatsApp | PayPerTap",
    description:
      "A low-setup storefront and order flow for students selling thrift, accessories, books, college merch, and small products.",
    h1: "A low-setup product store for student sellers",
    summary:
      "PayPerTap helps student sellers start with simple product links, buyer order, and WhatsApp confirmation instead of a full website.",
    whatItIs:
      "This is for students selling thrift pieces, accessories, books, college merch, or small products through Instagram, WhatsApp groups, and status updates.",
    howItWorks: [
      "Add products to a simple storefront.",
      "Share product links in DMs, groups, stories, or status.",
      "PayPerTap charges the seller wallet after the buyer places an order.",
      "Seller confirms the remaining amount and pickup or delivery directly.",
    ],
    benefits: [
      "No full website needed.",
      "Simple product links for small catalogs.",
      "buyer order gives the seller clearer intent context before follow-up.",
      "Easy WhatsApp continuation for pickup, delivery, UPI, or COD.",
    ],
    bestFor: [
      "Students selling thrift, books, accessories, merch, or small products.",
      "First-time sellers who want a clean link without Shopify setup.",
      "Small catalogs shared through Instagram and WhatsApp groups.",
    ],
    notBestFor: [
      "Sellers needing full payment gateway features.",
      "Large teams needing advanced fulfillment tools.",
    ],
    example:
      "A student selling second-hand books can send a product link to a class group and follow up only with buyers who complete the Order.",
    faqs: [
      {
        question: "Do student sellers need a website?",
        answer:
          "No. PayPerTap acts as a simple storefront and product-link layer.",
      },
      {
        question: "Can I use PayPerTap for small side selling?",
        answer:
          "Yes. It is useful for small product lists, student thrift pages, accessories, books, and merch.",
      },
      {
        question: "Can sellers pay the rest by UPI or COD?",
        answer:
          "Yes. The seller collects the remaining amount directly through UPI, COD, or their usual process.",
      },
    ],
    related: [
      { label: "Product links", path: "/features/product-links" },
      { label: "Verified order", path: "/features/verified-order" },
      { label: "Google Forms comparison", path: "/compare/paypertap-vs-google-forms" },
      { label: "Pricing", path: "/pricing" },
    ],
  },
};
