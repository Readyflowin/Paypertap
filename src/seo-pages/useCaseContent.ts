import { type SeoPageContent, type UseCaseSlug } from "./seoPageTypes";

export const useCaseContent: Record<UseCaseSlug, SeoPageContent> = {
  "instagram-sellers": {
    path: "/for/instagram-sellers",
    title: "PayPerTap for Instagram Sellers",
    description:
      "PayPerTap helps Instagram sellers use a bio link, product links, verified booking, and WhatsApp handoff.",
    h1: "PayPerTap for Instagram Sellers",
    summary:
      "PayPerTap helps Instagram sellers turn DMs, stories, and bio clicks into cleaner product bookings.",
    whatItIs:
      "This is for Instagram sellers who are tired of repeating prices, sharing screenshots, and holding products for buyers who disappear.",
    howItWorks: [
      "Put your PayPerTap store link in Instagram bio.",
      "Share product links in DMs, stories, and posts.",
      "Let serious buyers book with the fixed Rs. 20 fee.",
      "Continue the order on WhatsApp with context.",
    ],
    benefits: [
      "Cleaner bio link than scattered posts and highlights.",
      "Less DM chaos for price and availability questions.",
      "Verified booking helps filter fake buyers.",
      "WhatsApp continuation keeps your familiar selling process.",
    ],
    example:
      "A fashion reseller can post a story, send the product link to interested buyers, and focus on the buyer who completes the Rs. 20 booking.",
    faqs: [
      {
        question: "Can I use PayPerTap as my Instagram bio link?",
        answer:
          "Yes. Your PayPerTap store can work as a product-focused bio link for buyers coming from Instagram.",
      },
      {
        question: "Does PayPerTap replace Instagram DMs?",
        answer:
          "No. It gives sellers a cleaner link and booking step before the WhatsApp or DM conversation continues.",
      },
    ],
    related: [
      { label: "Verified booking", path: "/features/verified-booking" },
      { label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" },
      { label: "PayPerTap vs Linktree", path: "/compare/paypertap-vs-linktree" },
    ],
  },
  "whatsapp-sellers": {
    path: "/for/whatsapp-sellers",
    title: "PayPerTap for WhatsApp Sellers",
    description:
      "Create product links and cleaner booking flows for WhatsApp sellers and WhatsApp Business users.",
    h1: "PayPerTap for WhatsApp Sellers",
    summary:
      "PayPerTap helps WhatsApp sellers share product links and receive buyers with more context.",
    whatItIs:
      "This is for sellers who already close deals on WhatsApp but want a cleaner storefront link before chat begins.",
    howItWorks: [
      "Share your store link in WhatsApp status, groups, or chats.",
      "Send product links when buyers ask for specific items.",
      "Buyer books through PayPerTap.",
      "Buyer reaches WhatsApp with product details ready.",
    ],
    benefits: [
      "Works alongside WhatsApp Business workflows.",
      "Useful with greeting messages, away messages, and quick replies.",
      "Reduces repeated product detail messages.",
      "Seller collects remaining payment directly through UPI, COD, or their process.",
    ],
    example:
      "A seller can share a PayPerTap product link in WhatsApp status. Buyers see details first, then book and continue the conversation with context.",
    faqs: [
      {
        question: "Can I use PayPerTap with WhatsApp Business?",
        answer:
          "Yes. PayPerTap works well with WhatsApp Business because the final confirmation still happens directly in WhatsApp.",
      },
      {
        question: "Does PayPerTap collect the full product payment?",
        answer:
          "No. PayPerTap only uses the fixed Rs. 20 verified booking fee in Phase 1. Sellers collect the remaining amount directly.",
      },
    ],
    related: [
      { label: "WhatsApp handoff", path: "/features/whatsapp-handoff" },
      { label: "Product links", path: "/features/product-links" },
      { label: "PayPerTap vs WhatsApp Catalog", path: "/compare/paypertap-vs-whatsapp-catalog" },
    ],
  },
  "thrift-sellers": {
    path: "/for/thrift-sellers",
    title: "PayPerTap for Thrift Sellers",
    description:
      "Reserve limited-stock thrift items with Rs. 20 verified booking and a cleaner Instagram-to-WhatsApp flow.",
    h1: "PayPerTap for Thrift Sellers",
    summary:
      "PayPerTap helps thrift sellers handle one-piece products, fake 'available?' messages, and fast Instagram drops.",
    whatItIs:
      "This is for thrift sellers who sell limited-stock pieces and need a stronger signal before holding an item.",
    howItWorks: [
      "Upload each thrift item as a product.",
      "Share product links in Instagram drops or WhatsApp status.",
      "Buyer books with Rs. 20 to show intent.",
      "Seller confirms remaining payment and delivery directly.",
    ],
    benefits: [
      "Useful for one-piece products and fast drops.",
      "Reduces fake holds from casual buyers.",
      "Keeps products visible in a clean storefront.",
      "Works naturally with Instagram selling.",
    ],
    example:
      "For a vintage shirt drop, a seller can share the product link and reserve the piece only after a buyer completes the booking step.",
    faqs: [
      {
        question: "Can PayPerTap help with one-piece thrift items?",
        answer:
          "Yes. Verified booking is especially useful when each product has only one unit or limited availability.",
      },
      {
        question: "Does booking automatically mean delivery is confirmed?",
        answer:
          "No. The seller still confirms availability, delivery, and remaining payment directly with the buyer.",
      },
    ],
    related: [
      { label: "Verified booking", path: "/features/verified-booking" },
      { label: "Instagram sellers", path: "/for/instagram-sellers" },
      { label: "Product links", path: "/features/product-links" },
    ],
  },
  "boutiques": {
    path: "/for/boutiques",
    title: "PayPerTap for Boutique Owners",
    description:
      "A clean storefront and verified booking flow for boutique owners selling on Instagram and WhatsApp.",
    h1: "PayPerTap for Boutique Owners",
    summary:
      "PayPerTap helps boutique owners create a catalog-like store and move serious buyers into WhatsApp.",
    whatItIs:
      "This is for boutique and fashion sellers who want a professional product link without switching to a heavy ecommerce stack.",
    howItWorks: [
      "Add boutique products with images and prices.",
      "Share the store link across Instagram and WhatsApp.",
      "Let buyers book with the fixed Rs. 20 fee.",
      "Collect the remaining amount directly through UPI, COD, or chat.",
    ],
    benefits: [
      "Clean catalog-like storefront.",
      "Trust-focused storefront themes.",
      "Works with WhatsApp selling and direct UPI/COD collection.",
      "Organizes product discovery before chat.",
    ],
    example:
      "A boutique owner can keep products arranged in a PayPerTap store and share one link instead of sending photos manually to every buyer.",
    faqs: [
      {
        question: "Is PayPerTap suitable for boutique catalogs?",
        answer:
          "Yes. Boutique sellers can use PayPerTap as a simple storefront for product browsing and booking.",
      },
      {
        question: "Can I still collect payment on UPI or COD?",
        answer:
          "Yes. The remaining amount is collected directly by the seller through their preferred method.",
      },
    ],
    related: [
      { label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" },
      { label: "Order organization", path: "/features/order-organization" },
      { label: "Shopify Starter comparison", path: "/compare/paypertap-vs-shopify-starter" },
    ],
  },
  "handmade-sellers": {
    path: "/for/handmade-sellers",
    title: "PayPerTap for Handmade Sellers",
    description:
      "PayPerTap helps handmade sellers share product stories, qualify serious buyers, and confirm orders on WhatsApp.",
    h1: "PayPerTap for Handmade Sellers",
    summary:
      "PayPerTap gives handmade sellers a simple storefront and booking-first flow without complex store setup.",
    whatItIs:
      "This is for craft, handmade, and small-batch sellers who want buyers to understand product details before chatting.",
    howItWorks: [
      "Add handmade products with images and descriptions.",
      "Share product or store links with interested buyers.",
      "Buyer books with Rs. 20 as a serious-buyer signal.",
      "Seller confirms customization, delivery, and remaining payment directly.",
    ],
    benefits: [
      "Supports product storytelling.",
      "Helps filter serious buyers for custom or small-batch work.",
      "Keeps confirmation personal through WhatsApp.",
      "Avoids complex ecommerce setup.",
    ],
    example:
      "A handmade jewelry seller can share one product page with details, then continue with a buyer who has already booked.",
    faqs: [
      {
        question: "Can handmade sellers use PayPerTap without a full website?",
        answer:
          "Yes. PayPerTap is designed to provide a simple storefront link without a full website build.",
      },
      {
        question: "Can sellers discuss custom details after booking?",
        answer:
          "Yes. Customization and final confirmation can happen directly on WhatsApp after booking.",
      },
    ],
    related: [
      { label: "Customer leads", path: "/features/customer-leads" },
      { label: "WhatsApp handoff", path: "/features/whatsapp-handoff" },
      { label: "Instagram sellers", path: "/for/instagram-sellers" },
    ],
  },
  "student-sellers": {
    path: "/for/student-sellers",
    title: "PayPerTap for Student Sellers",
    description:
      "A simple storefront and Rs. 20 booking flow for students selling thrift, accessories, books, and merch.",
    h1: "PayPerTap for Student Sellers",
    summary:
      "PayPerTap helps student sellers start with a simple product link and WhatsApp flow instead of a full website.",
    whatItIs:
      "This is for students selling thrift pieces, accessories, books, college merch, or small products through Instagram and WhatsApp.",
    howItWorks: [
      "Add products to a simple storefront.",
      "Share product links in DMs, groups, or status.",
      "Buyer pays Rs. 20 to book the item.",
      "Seller confirms the remaining amount and pickup or delivery directly.",
    ],
    benefits: [
      "No full website needed.",
      "Simple product links for small catalogs.",
      "Rs. 20 buyer commitment reduces casual holds.",
      "Easy WhatsApp continuation.",
    ],
    example:
      "A student selling second-hand books can send a product link to a class group and follow up only with buyers who book.",
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
    ],
    related: [
      { label: "Product links", path: "/features/product-links" },
      { label: "Verified booking", path: "/features/verified-booking" },
      { label: "Google Forms comparison", path: "/compare/paypertap-vs-google-forms" },
    ],
  },
};
