import { type ComparisonPageContent, type ComparisonSlug } from "./seoPageTypes";

const commonRows = [
  {
    label: "Verified booking",
    other: "Usually not built around paid product booking.",
    paypertap: "Fixed Rs. 20 booking step before WhatsApp handoff.",
  },
  {
    label: "Buyer details",
    other: "May require manual follow-up or separate forms.",
    paypertap: "Booking context stays connected to product interest.",
  },
  {
    label: "Remaining payment",
    other: "Depends on the tool and setup.",
    paypertap: "Seller collects remaining amount directly through WhatsApp, UPI, or COD.",
  },
];

export const comparisonContent: Record<ComparisonSlug, ComparisonPageContent> = {
  "paypertap-vs-linktree": {
    path: "/compare/paypertap-vs-linktree",
    title: "PayPerTap vs Linktree",
    description:
      "Compare PayPerTap and Linktree for product sellers who need more than a list of links.",
    h1: "PayPerTap vs Linktree",
    summary:
      "Linktree is good for sharing many links; PayPerTap is built for product storefronts, Rs. 20 verified booking, and WhatsApp handoff.",
    whatItIs:
      "Linktree is a broad link-in-bio tool. PayPerTap is narrower: a verified booking storefront for Instagram and WhatsApp sellers.",
    rows: [
      {
        label: "Best use",
        other: "Creators or businesses with many links.",
        paypertap: "Product sellers who want buyers to browse and book.",
      },
      {
        label: "Product catalog",
        other: "Link-first page, not product-booking-first.",
        paypertap: "Storefront and product links for sellers.",
      },
      ...commonRows,
    ],
    bestFor: [
      "Use Linktree if you mainly share links to many destinations.",
      "Use PayPerTap if you sell products and want product-specific booking.",
      "Use PayPerTap if fake holds and repeated DMs are the real problem.",
    ],
    honestNote:
      "Linktree is fine for creators with many links. PayPerTap is better suited for sellers who need a product storefront and booking step.",
    faqs: [
      {
        question: "Is PayPerTap a Linktree replacement?",
        answer:
          "For product sellers, PayPerTap can replace a generic bio link with a product-focused store link and verified booking flow.",
      },
      {
        question: "Can I still link to other pages?",
        answer:
          "PayPerTap is focused on product selling, so it is best used when your main goal is product browsing and booking.",
      },
    ],
    related: [
      { label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" },
      { label: "Instagram sellers", path: "/for/instagram-sellers" },
      { label: "Pricing", path: "/pricing" },
    ],
  },
  "paypertap-vs-whatsapp-catalog": {
    path: "/compare/paypertap-vs-whatsapp-catalog",
    title: "PayPerTap vs WhatsApp Catalog",
    description:
      "Compare PayPerTap and WhatsApp Catalog for sellers who want public product links plus verified booking.",
    h1: "PayPerTap vs WhatsApp Catalog",
    summary:
      "WhatsApp Catalog helps show products inside WhatsApp; PayPerTap gives sellers public store and product links with verified booking before WhatsApp.",
    whatItIs:
      "WhatsApp Catalog is useful inside WhatsApp Business. PayPerTap can work alongside WhatsApp by giving buyers a public link and booking flow before the chat.",
    rows: [
      {
        label: "Where buyers browse",
        other: "Mostly inside WhatsApp.",
        paypertap: "Public store and product links shareable across Instagram and WhatsApp.",
      },
      {
        label: "Booking step",
        other: "Catalog browsing is not the same as paid booking.",
        paypertap: "Fixed Rs. 20 booking before WhatsApp handoff.",
      },
      ...commonRows,
    ],
    bestFor: [
      "Use WhatsApp Catalog if you mainly sell inside WhatsApp.",
      "Use PayPerTap if buyers also come from Instagram bio, stories, and DMs.",
      "Use both if WhatsApp Business is your closing channel.",
    ],
    honestNote:
      "PayPerTap does not trash WhatsApp Catalog. It works best as a public storefront and booking layer before WhatsApp confirmation.",
    faqs: [
      {
        question: "Can PayPerTap work with WhatsApp Business?",
        answer:
          "Yes. PayPerTap is designed to hand off booked buyers to WhatsApp, including WhatsApp Business workflows.",
      },
      {
        question: "Does PayPerTap automate WhatsApp replies?",
        answer:
          "No. PayPerTap helps with the handoff, but the seller still replies and confirms directly.",
      },
    ],
    related: [
      { label: "WhatsApp handoff", path: "/features/whatsapp-handoff" },
      { label: "WhatsApp sellers", path: "/for/whatsapp-sellers" },
      { label: "How it works", path: "/how-it-works" },
    ],
  },
  "paypertap-vs-google-forms": {
    path: "/compare/paypertap-vs-google-forms",
    title: "PayPerTap vs Google Forms",
    description:
      "Compare PayPerTap and Google Forms for sellers who need product cards, buyer context, and verified booking.",
    h1: "PayPerTap vs Google Forms",
    summary:
      "Google Forms collects responses; PayPerTap gives sellers a product storefront, buyer context, Rs. 20 verified booking, and WhatsApp handoff.",
    whatItIs:
      "Google Forms can be useful for collecting information, but it is not designed as a buyer-facing product storefront.",
    rows: [
      {
        label: "Buyer trust",
        other: "Form-first experience can feel manual.",
        paypertap: "Product storefront with a clearer selling flow.",
      },
      {
        label: "Product display",
        other: "Usually text-heavy and form-based.",
        paypertap: "Product cards, product links, and booking flow.",
      },
      ...commonRows,
    ],
    bestFor: [
      "Use Google Forms for simple surveys or internal data collection.",
      "Use PayPerTap when buyers need to see products and book.",
      "Use PayPerTap when WhatsApp handoff matters.",
    ],
    honestNote:
      "Google Forms is flexible and free. PayPerTap is more purpose-built for social sellers and product bookings.",
    faqs: [
      {
        question: "Why not just use a form for orders?",
        answer:
          "Forms can collect responses, but PayPerTap combines product discovery, booking, and WhatsApp handoff in one seller-focused flow.",
      },
      {
        question: "Does PayPerTap still collect buyer details?",
        answer:
          "Yes. Booking captures useful buyer context while keeping product interest connected.",
      },
    ],
    related: [
      { label: "Order organization", path: "/features/order-organization" },
      { label: "Customer leads", path: "/features/customer-leads" },
      { label: "Student sellers", path: "/for/student-sellers" },
    ],
  },
  "paypertap-vs-shopify-starter": {
    path: "/compare/paypertap-vs-shopify-starter",
    title: "PayPerTap vs Shopify Starter",
    description:
      "Compare PayPerTap and Shopify Starter for early Instagram and WhatsApp sellers choosing between full ecommerce and booking-first selling.",
    h1: "PayPerTap vs Shopify Starter",
    summary:
      "Shopify is powerful for full ecommerce; PayPerTap is lighter for Instagram and WhatsApp sellers who want verified booking before direct seller payment.",
    whatItIs:
      "Shopify Starter and Shopify's broader commerce tools are useful for merchants ready for a fuller ecommerce setup. PayPerTap is simpler and booking-first.",
    rows: [
      {
        label: "Setup style",
        other: "Commerce platform setup for broader selling needs.",
        paypertap: "Lightweight store and product links for social sellers.",
      },
      {
        label: "Payment model",
        other: "Built around ecommerce checkout flows.",
        paypertap: "Fixed Rs. 20 booking; seller collects remaining amount directly.",
      },
      ...commonRows,
    ],
    bestFor: [
      "Use Shopify if you want a fuller ecommerce stack.",
      "Use PayPerTap if you mainly sell through Instagram and WhatsApp.",
      "Use PayPerTap if you do not want payout setup in Phase 1.",
    ],
    honestNote:
      "Shopify is powerful for full ecommerce. PayPerTap is simpler for early social sellers who want booking-first selling without claiming full payment processing.",
    faqs: [
      {
        question: "Is PayPerTap a Shopify replacement?",
        answer:
          "Not for every merchant. PayPerTap is a lighter option for social sellers who want product links, verified booking, and WhatsApp confirmation.",
      },
      {
        question: "Does PayPerTap handle full ecommerce checkout?",
        answer:
          "No. In Phase 1, PayPerTap handles the fixed Rs. 20 booking fee and the seller collects the remaining amount directly.",
      },
    ],
    related: [
      { label: "Boutique owners", path: "/for/boutiques" },
      { label: "Pricing", path: "/pricing" },
      { label: "How it works", path: "/how-it-works" },
    ],
  },
};
