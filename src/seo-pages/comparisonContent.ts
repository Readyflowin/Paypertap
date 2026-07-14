import { type ComparisonPageContent, type ComparisonSlug } from "./seoPageTypes";

const commonRows = [
  {
    label: "Verified order",
    other: "Usually not built around a paid product Order signal.",
    paypertap: "Fixed order step before WhatsApp handoff.",
  },
  {
    label: "Buyer context",
    other: "May require manual follow-up or separate notes.",
    paypertap: "Product, buyer, Order, and remaining amount context stay together.",
  },
  {
    label: "Remaining payment",
    other: "Depends on the tool and setup.",
    paypertap: "Seller collects the remaining amount directly through WhatsApp, UPI, or COD.",
  },
  {
    label: "Payment role",
    other: "May be link-only, catalog-only, form-only, or full ecommerce.",
    paypertap: "PayPerTap is not a full payment gateway; it keeps the seller wallet per-order charge.",
  },
];

export const comparisonContent: Record<ComparisonSlug, ComparisonPageContent> = {
  "paypertap-vs-linktree": {
    path: "/compare/paypertap-vs-linktree",
    title: "PayPerTap vs Linktree | product order Storefront vs Link-in-Bio Tool",
    description:
      "Compare PayPerTap and Linktree for Instagram sellers who need product pages, buyer details, order, and WhatsApp handoff.",
    h1: "PayPerTap vs Linktree",
    summary:
      "Linktree is useful for sharing many links. PayPerTap fits product sellers who need a storefront, buyer context, order, and WhatsApp handoff.",
    whatItIs:
      "Linktree is a broad link-in-bio tool for creators, brands, and businesses. PayPerTap is narrower: a verified order storefront for Indian Instagram and WhatsApp sellers who sell physical products through links and chat.",
    rows: [
      {
        label: "Best use",
        other: "Creators or businesses that mainly need a list of links.",
        paypertap: "Product sellers who want buyers to browse, book, and continue to WhatsApp.",
      },
      {
        label: "Product selling",
        other: "Link-first experience, not product-order-first.",
        paypertap: "Storefront and product links built around Order intent.",
      },
      ...commonRows,
    ],
    bestFor: [
      "Use Linktree if you mainly need a simple list of links.",
      "Use PayPerTap if you sell products and want product-specific Order.",
      "Use PayPerTap if uncommitted holds, repeated DMs, and WhatsApp handoff are the real problem.",
    ],
    honestNote:
      "Linktree is a strong link-in-bio tool. PayPerTap is not trying to be a generic link page; it is built for sellers who want the link to start a product order flow.",
    faqs: [
      {
        question: "Is PayPerTap a Linktree alternative for sellers?",
        answer:
          "Yes. For product sellers, PayPerTap can replace a generic bio link with a product-focused store link and verified order flow.",
      },
      {
        question: "When is Linktree still the right fit?",
        answer:
          "Linktree is better if your main need is sending people to many different links, not product browsing and Order.",
      },
      {
        question: "Does PayPerTap include product pages?",
        answer:
          "Yes. PayPerTap supports storefront and product links so buyers can see product context before Order.",
      },
    ],
    related: [
      { label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" },
      { label: "Instagram sellers", path: "/for/instagram-sellers" },
      { label: "Verified order", path: "/features/verified-order" },
      { label: "Pricing", path: "/pricing" },
    ],
  },
  "paypertap-vs-whatsapp-catalog": {
    path: "/compare/paypertap-vs-whatsapp-catalog",
    title: "PayPerTap vs WhatsApp Catalog | Public Store Link With Order",
    description:
      "Compare WhatsApp Catalog and PayPerTap for sellers who want public product links, order, and WhatsApp Business handoff.",
    h1: "PayPerTap vs WhatsApp Catalog",
    summary:
      "WhatsApp Catalog helps display products inside WhatsApp. PayPerTap gives sellers public store and product links with order before WhatsApp handoff.",
    whatItIs:
      "WhatsApp Catalog is useful inside WhatsApp Business. PayPerTap can work alongside it by giving Instagram and WhatsApp buyers a public product link and an order step before the chat continues.",
    rows: [
      {
        label: "Where buyers browse",
        other: "Mostly inside WhatsApp.",
        paypertap: "Public store and product links shareable across Instagram and WhatsApp.",
      },
      {
        label: "order step",
        other: "Catalog browsing is not the same as order.",
        paypertap: "Fixed order before WhatsApp handoff.",
      },
      {
        label: "Works with WhatsApp Business",
        other: "Native WhatsApp Business catalog feature.",
        paypertap: "Complements WhatsApp Business by sending buyers into chat with context.",
      },
      ...commonRows,
    ],
    bestFor: [
      "Use WhatsApp Catalog if you mainly sell inside WhatsApp.",
      "Use PayPerTap if buyers also come from Instagram bio, stories, DMs, or public links.",
      "Use both if WhatsApp Business is your closing channel and PayPerTap is your order layer.",
    ],
    honestNote:
      "PayPerTap does not replace every WhatsApp Business feature. It works best as the public storefront and verified order layer before the WhatsApp conversation.",
    faqs: [
      {
        question: "Can PayPerTap work with WhatsApp Business?",
        answer:
          "Yes. PayPerTap is designed to hand off buyers to WhatsApp, including WhatsApp Business workflows.",
      },
      {
        question: "Does PayPerTap automate WhatsApp replies?",
        answer:
          "No. PayPerTap helps with the handoff, but the seller still replies and confirms directly.",
      },
      {
        question: "Why use PayPerTap if I already have WhatsApp Catalog?",
        answer:
          "Use PayPerTap when you want a public product link and an order signal before the buyer reaches WhatsApp.",
      },
    ],
    related: [
      { label: "WhatsApp handoff", path: "/features/whatsapp-handoff" },
      { label: "WhatsApp sellers", path: "/for/whatsapp-sellers" },
      { label: "How it works", path: "/how-it-works" },
      { label: "Pricing", path: "/pricing" },
    ],
  },
  "paypertap-vs-google-forms": {
    path: "/compare/paypertap-vs-google-forms",
    title: "PayPerTap vs Google Forms | Storefront and Order vs DIY Form",
    description:
      "Compare PayPerTap and Google Forms for sellers who need product pages, buyer context, order, and WhatsApp handoff.",
    h1: "PayPerTap vs Google Forms",
    summary:
      "Google Forms collects responses. PayPerTap gives sellers a product storefront, buyer context, order, and WhatsApp handoff.",
    whatItIs:
      "Google Forms is flexible for surveys and simple data collection. PayPerTap is purpose-built for social sellers who need product discovery, Order, and follow-up context in one selling flow.",
    rows: [
      {
        label: "Buyer experience",
        other: "Form-first experience can feel manual.",
        paypertap: "Product storefront with a clearer buyer flow.",
      },
      {
        label: "Product display",
        other: "Usually text-heavy and form-based.",
        paypertap: "Product cards, product links, and order flow.",
      },
      {
        label: "Trust signal",
        other: "A response alone does not show paid intent.",
        paypertap: "order helps show stronger buyer intent.",
      },
      ...commonRows,
    ],
    bestFor: [
      "Use Google Forms for surveys, internal requests, or simple information collection.",
      "Use PayPerTap when buyers need to see products and book.",
      "Use PayPerTap when WhatsApp handoff and buyer context matter.",
    ],
    honestNote:
      "Google Forms is flexible and useful. PayPerTap is more purpose-built for product sellers who need a buyer-facing storefront and order signal.",
    faqs: [
      {
        question: "Why not just use a form for orders?",
        answer:
          "Forms can collect responses, but PayPerTap combines product discovery, order, and WhatsApp handoff in one seller-focused flow.",
      },
      {
        question: "Does PayPerTap still collect buyer details?",
        answer:
          "Yes. Order captures useful buyer context while keeping product interest connected.",
      },
      {
        question: "When is Google Forms enough?",
        answer:
          "Google Forms can be enough when you only need responses and do not need product pages, order, or WhatsApp handoff.",
      },
    ],
    related: [
      { label: "order organization", path: "/features/order-organization" },
      { label: "Customer leads", path: "/features/customer-leads" },
      { label: "Student sellers", path: "/for/student-sellers" },
      { label: "How it works", path: "/how-it-works" },
    ],
  },
  "paypertap-vs-shopify-starter": {
    path: "/compare/paypertap-vs-shopify-starter",
    title: "PayPerTap vs Shopify Starter | Social Selling Order Flow",
    description:
      "Compare PayPerTap and Shopify Starter for Instagram and WhatsApp sellers choosing between full ecommerce and order-first social selling.",
    h1: "PayPerTap vs Shopify Starter",
    summary:
      "Shopify is powerful for full ecommerce. PayPerTap is lighter for early Instagram and WhatsApp sellers who want order before direct seller payment.",
    whatItIs:
      "Shopify Starter and Shopify's broader commerce tools are useful for merchants ready for a fuller ecommerce setup. PayPerTap is simpler and order-first for sellers who still close on WhatsApp.",
    rows: [
      {
        label: "Setup style",
        other: "Commerce platform setup for broader selling needs.",
        paypertap: "Lightweight store and product links for social sellers.",
      },
      {
        label: "Payment model",
        other: "Built around ecommerce checkout flows.",
        paypertap: "Fixed order; seller collects remaining amount directly.",
      },
      {
        label: "Best stage",
        other: "Fits merchants ready for more full-stack ecommerce.",
        paypertap: "Fits sellers who want a simple order-first social selling flow.",
      },
      ...commonRows,
    ],
    bestFor: [
      "Use Shopify Starter if you want a broader ecommerce platform.",
      "Use PayPerTap if you mainly sell through Instagram and WhatsApp.",
      "Use PayPerTap if you do not want seller payout setup, split payments, or full settlement complexity.",
    ],
    honestNote:
      "Shopify is powerful for full ecommerce. PayPerTap is simpler for early social sellers who want product links, order, and WhatsApp confirmation without claiming full payment processing.",
    faqs: [
      {
        question: "Is PayPerTap a Shopify replacement?",
        answer:
          "Not for every merchant. PayPerTap is a lighter option for social sellers who want product links, verified order, and WhatsApp confirmation.",
      },
      {
        question: "Does PayPerTap handle full ecommerce checkout?",
        answer:
          "No. PayPerTap records the fixed order fee and the seller collects the remaining amount directly.",
      },
      {
        question: "When should a seller choose Shopify instead?",
        answer:
          "Choose Shopify if you need a fuller ecommerce store, more checkout infrastructure, and broader commerce operations.",
      },
    ],
    related: [
      { label: "Boutique owners", path: "/for/boutiques" },
      { label: "Pricing", path: "/pricing" },
      { label: "How it works", path: "/how-it-works" },
      { label: "Verified order", path: "/features/verified-order" },
    ],
  },
};
