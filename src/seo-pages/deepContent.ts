import { type ComparisonRow, type FaqItem } from "./seoPageTypes";

type SourceContext = {
  anchor: string;
  before: string;
  href: string;
  after: string;
};

type QuestionAnswer = {
  answer: string;
  question: string;
};

type ResponsibilityRow = {
  paypertap: string;
  seller: string;
  stage: string;
};

export type ClusterDeepContent = {
  answers: QuestionAnswer[];
  benefitsTitle: string;
  directAnswer: string;
  extraFaqs: FaqItem[];
  introTitle: string;
  responsibilities: ResponsibilityRow[];
  source: SourceContext;
  workflowTitle: string;
};

export type ComparisonDeepContent = {
  additionalRows: ComparisonRow[];
  answers: QuestionAnswer[];
  directAnswer: string;
  enoughBody: string;
  enoughTitle: string;
  example: string;
  extraFaqs: FaqItem[];
  source: SourceContext;
};

const MORDOR_URL =
  "https://www.mordorintelligence.com/industry-reports/india-social-commerce-market";
const WHATSAPP_URL = "https://whatsappbusiness.com/products/business-platform/";
const INSTAGRAM_URL = "https://help.instagram.com/1187859655048322";
const CATALOG_URL = "https://faq.whatsapp.com/405903568419894";
const LINKTREE_URL = "https://linktr.ee/";
const FORMS_URL = "https://workspace.google.com/intl/en_in/products/forms/";
const SHOPIFY_URL =
  "https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-starter-plan";

export const clusterDeepContent: Record<string, ClusterDeepContent> = {
  "/features/verified-booking": {
    directAnswer:
      "Verified booking means a buyer pays a fixed ₹20 through PayPerTap before moving to WhatsApp. In Phase 1, PayPerTap keeps that platform fee, the selected product becomes reserved in the booking flow, and the seller uses the buyer and product context to continue final payment and delivery confirmation directly.",
    introTitle: "What is verified booking for sellers?",
    workflowTitle: "How does the ₹20 verified booking work?",
    benefitsTitle: "Why can verified booking make DMs easier to manage?",
    source: {
      before:
        "Indian sellers increasingly operate in a social and mobile discovery environment: research on ",
      anchor: "India's social commerce market",
      href: MORDOR_URL,
      after:
        " describes continued growth and mobile-first discovery behaviour. PayPerTap uses that context only to explain why an organized booking step can matter; it does not claim a guaranteed sale or guaranteed improvement in buyer behaviour.",
    },
    answers: [
      {
        question: "What happens to product availability after booking?",
        answer:
          "When the buyer completes the fixed ₹20 booking, the product becomes reserved in PayPerTap's booking flow. That reservation gives the seller a clear item and buyer record for follow-up. It does not guarantee completion, and the seller still confirms availability, delivery, and remaining payment.",
      },
      {
        question: "What buyer details are captured?",
        answer:
          "The booking flow can connect buyer contact details with the chosen product, displayed price, booking payment, and context needed for the WhatsApp handoff. This helps the seller avoid searching through unrelated screenshots or DMs when responding to a buyer who has already booked.",
      },
      {
        question: "Does the seller receive the ₹20?",
        answer:
          "No. In Phase 1, PayPerTap keeps the fixed ₹20 as the platform verified-booking fee. The seller receives no payout or split payment from that fee. The seller collects any remaining product amount directly through WhatsApp, UPI, COD, or their offered process.",
      },
      {
        question: "What is the honest limitation?",
        answer:
          "A booking is a recorded buyer action, not a promise that the remaining payment or delivery will be completed. Sellers should keep product information current, confirm fulfilment directly, and use their own cancellation, return, and exchange policy for the product transaction.",
      },
    ],
    responsibilities: [
      {
        stage: "Booking payment",
        paypertap: "Collects and records the fixed ₹20 platform verified-booking fee.",
        seller: "Does not receive the ₹20 fee in Phase 1.",
      },
      {
        stage: "Reservation context",
        paypertap: "Connects the booked product with buyer details and reserved status.",
        seller: "Checks availability and continues the buyer conversation.",
      },
      {
        stage: "Completion",
        paypertap: "Provides booking-flow support where needed.",
        seller: "Collects remaining payment and handles delivery, returns, or exchanges.",
      },
    ],
    extraFaqs: [
      {
        question: "Is verified booking a product advance paid to the seller?",
        answer:
          "No. The ₹20 is a fixed PayPerTap platform verified-booking fee in Phase 1, not a custom advance paid onward to the seller.",
      },
      {
        question: "Can an Instagram seller share a direct booking link?",
        answer:
          "Yes. A seller can share a store link or a direct product link, then continue with the booked buyer in WhatsApp.",
      },
      {
        question: "Does verified booking guarantee fewer casual enquiries?",
        answer:
          "No guarantee is made. It records a paid booking action before follow-up, which gives the seller clearer intent context than an uncommitted message alone.",
      },
    ],
  },
  "/features/link-in-bio-storefront": {
    directAnswer:
      "A PayPerTap link-in-bio storefront is a shareable product store link for Instagram and WhatsApp sellers. Buyers can browse product cards and prices, choose an item, place the fixed ₹20 booking, and continue to WhatsApp. It is product-and-booking focused rather than a general collection of unrelated creator links.",
    introTitle: "What is a link-in-bio storefront?",
    workflowTitle: "How does a bio store link lead to booking?",
    benefitsTitle: "Why do product sellers need more than a link list?",
    source: {
      before:
        "Instagram commerce workflows can already include product discovery: official help for ",
      anchor: "Instagram Shops help",
      href: INSTAGRAM_URL,
      after:
        " describes tools for businesses to display and sell products. PayPerTap is not affiliated with Instagram; it supplies a separate booking-first storefront link for sellers who continue confirmation directly in WhatsApp.",
    },
    answers: [
      {
        question: "How is a storefront different from a link list?",
        answer:
          "A link list points visitors to destinations. A product storefront is organized around items: image, name, price, product detail, and a booking path. PayPerTap is for sellers who want the buyer to pick and book a product rather than decide which general link to open next.",
      },
      {
        question: "What does the buyer see before WhatsApp?",
        answer:
          "The buyer can start from the seller's store link, review product cards and an individual product page, and understand the fixed ₹20 booking step. Once a selected item is booked, PayPerTap prepares the context needed for the buyer to continue to the seller on WhatsApp.",
      },
      {
        question: "Who should use a product-first bio link?",
        answer:
          "It suits Instagram boutiques, thrift pages, handmade sellers, resellers, and students who regularly answer product-specific questions. Creators who only want to share destinations or profiles may be better served by a general link-in-bio tool instead of a booking storefront.",
      },
      {
        question: "Is this a full online checkout store?",
        answer:
          "No. In Phase 1, PayPerTap handles only its fixed ₹20 verified-booking fee and WhatsApp handoff context. The seller collects the product's remaining amount directly and manages fulfilment, return terms, and product support in their own process.",
      },
    ],
    responsibilities: [
      {
        stage: "Discovery",
        paypertap: "Displays store and product pages behind one shareable storefront link.",
        seller: "Adds accurate photos, price, description, and availability.",
      },
      {
        stage: "Booking",
        paypertap: "Provides fixed ₹20 booking and reservation context.",
        seller: "Responds after handoff with final confirmation.",
      },
      {
        stage: "Purchase completion",
        paypertap: "Does not process full product payment.",
        seller: "Collects remaining amount and fulfils the order directly.",
      },
    ],
    extraFaqs: [
      {
        question: "Can a seller share both a store link and product links?",
        answer:
          "Yes. The storefront supports discovery, while a direct product link is useful when a buyer asks about one specific item.",
      },
      {
        question: "Is PayPerTap the same as Linktree?",
        answer:
          "No. Linktree serves link-sharing needs; PayPerTap is built around product pages, fixed booking, reservation context, and WhatsApp handoff.",
      },
      {
        question: "Can WhatsApp sellers use a link-in-bio storefront too?",
        answer:
          "Yes. The same store link can be shared in chats or status so buyers review products before beginning confirmation in WhatsApp.",
      },
    ],
  },
  "/features/whatsapp-handoff": {
    directAnswer:
      "WhatsApp handoff is the step after a PayPerTap buyer places the fixed ₹20 booking. The buyer continues to WhatsApp with product title, link, price, booking paid, remaining amount, and contact context ready to share. The seller confirms directly; PayPerTap does not automatically send or answer WhatsApp messages.",
    introTitle: "What is WhatsApp handoff?",
    workflowTitle: "How does a booked buyer move into WhatsApp?",
    benefitsTitle: "Why does prepared message context matter?",
    source: {
      before:
        "WhatsApp can be used as a customer communication channel: official ",
      anchor: "WhatsApp Business use cases",
      href: WHATSAPP_URL,
      after:
        " include order confirmations and shipment updates. PayPerTap can hand a booked buyer into that conversation, but it does not claim to operate business messaging APIs or automate the seller's replies.",
    },
    answers: [
      {
        question: "What information goes into the handoff?",
        answer:
          "The handoff can carry the chosen product title and product link, displayed product price, confirmation that the ₹20 PayPerTap booking was paid, the remaining amount to discuss with the seller, and buyer contact details supplied for order confirmation.",
      },
      {
        question: "Does the message complete the purchase?",
        answer:
          "No. The message gives seller and buyer shared context after booking. The seller still confirms the product, final remaining amount, payment method, pickup or delivery arrangement, and any product policy. PayPerTap is not a full payment gateway for that final transaction.",
      },
      {
        question: "Can the seller use WhatsApp Business tools manually?",
        answer:
          "Yes. A seller may use WhatsApp or WhatsApp Business for their own communication workflow, including any available manual or business-account features they choose. PayPerTap's role ends at preparing booking context and enabling the buyer's handoff into chat.",
      },
      {
        question: "What does PayPerTap never claim to do here?",
        answer:
          "PayPerTap does not promise automated WhatsApp replies, automatic delivery updates, or automatic order completion. The seller remains the person communicating with the buyer and deciding how to handle direct payment, fulfilment, support, cancellation, return, or exchange questions.",
      },
    ],
    responsibilities: [
      {
        stage: "Message preparation",
        paypertap: "Prepares product, booking, amount, and buyer context for handoff.",
        seller: "Chooses how to respond to the buyer in WhatsApp.",
      },
      {
        stage: "Remaining payment",
        paypertap: "Keeps only its fixed ₹20 platform fee.",
        seller: "Collects the remaining product amount directly.",
      },
      {
        stage: "After confirmation",
        paypertap: "Does not automate seller communications.",
        seller: "Handles delivery updates and product support directly.",
      },
    ],
    extraFaqs: [
      {
        question: "Does PayPerTap send the WhatsApp message itself?",
        answer:
          "No. PayPerTap prepares handoff context so the buyer can continue to the seller in WhatsApp.",
      },
      {
        question: "Can the handoff include remaining payment context?",
        answer:
          "Yes. It can state what was booked and the amount the buyer still needs to discuss and pay directly to the seller.",
      },
      {
        question: "Can PayPerTap work alongside WhatsApp Business?",
        answer:
          "Yes. PayPerTap can sit before the WhatsApp conversation as a storefront and verified-booking layer.",
      },
    ],
  },
  "/features/order-organization": {
    directAnswer:
      "PayPerTap order organization gives social sellers a structured booking record instead of relying only on DMs and screenshots. A booked product can show reservation context, buyer details, and the WhatsApp follow-up path. The seller still confirms remaining payment, delivery, completion, returns, and exchanges directly with the buyer.",
    introTitle: "What is order organization for social sellers?",
    workflowTitle: "How do booking records replace scattered follow-up?",
    benefitsTitle: "Why is organized booking context useful?",
    source: {
      before:
        "Order organization matters in a wider social-selling context. Research describing the ",
      anchor: "social commerce market",
      href: MORDOR_URL,
      after:
        " in India identifies mobile-first discovery as a growth driver. PayPerTap does not claim market results; it gives sellers who share products socially a place to connect bookings with product and buyer context.",
    },
    answers: [
      {
        question: "What can a booking record show?",
        answer:
          "A booking record can associate a selected product with buyer details, the fixed ₹20 booking, reserved status, and the follow-up context that moves into WhatsApp. It gives the seller a practical reference when several people ask about different items across social conversations.",
      },
      {
        question: "How are reserved and sold different?",
        answer:
          "Reserved means a buyer completed PayPerTap's booking step for an item. Sold or complete reflects the seller's later confirmation after remaining payment and fulfilment are handled directly. Keeping those states separate avoids treating every booking as an automatically completed product sale.",
      },
      {
        question: "Does PayPerTap become the delivery manager?",
        answer:
          "No. The seller remains responsible for final product confirmation, delivery method, remaining payment collection, and product-level issues. PayPerTap organizes booking context and supports the handoff; it does not run shipping, returns, exchanges, or seller payout settlement.",
      },
      {
        question: "How is this different from screenshots and DMs?",
        answer:
          "A screenshot can show a message but may lose product, amount, and status context. PayPerTap begins from a product link and booking record, making it easier to identify which buyer booked which item before the seller continues their direct WhatsApp conversation.",
      },
    ],
    responsibilities: [
      {
        stage: "Booking list",
        paypertap: "Keeps the product, buyer context, and booking state connected.",
        seller: "Reviews booked items and decides next follow-up.",
      },
      {
        stage: "Status",
        paypertap: "Supports reserved and selling-flow context.",
        seller: "Marks completion after direct fulfilment is confirmed.",
      },
      {
        stage: "Order outcome",
        paypertap: "Does not settle the product price.",
        seller: "Handles payment balance, delivery, and product policy.",
      },
    ],
    extraFaqs: [
      {
        question: "Is a reserved item automatically sold?",
        answer:
          "No. Reservation records the booking step; the seller later confirms completion after direct payment and fulfilment.",
      },
      {
        question: "Can the record include customer context?",
        answer:
          "Yes. It can keep useful buyer and product booking context together for the seller's follow-up.",
      },
      {
        question: "Does PayPerTap replace a full inventory system?",
        answer:
          "No. It is focused on social-selling booking organization, not warehouse-grade operations or fulfilment management.",
      },
    ],
  },
  "/features/product-links": {
    directAnswer:
      "PayPerTap product links are direct pages sellers can share for individual products in Instagram bios, stories, DMs, and WhatsApp. Buyers see product details and price, place a fixed ₹20 booking to reserve the selected item, then continue to the seller on WhatsApp for remaining payment and fulfilment confirmation.",
    introTitle: "What are shareable product links?",
    workflowTitle: "How does a direct product link become a booking?",
    benefitsTitle: "Why share an item page instead of repeating details?",
    source: {
      before:
        "Product discovery is already part of social selling: official information on ",
      anchor: "Instagram Shops help",
      href: INSTAGRAM_URL,
      after:
        " describes businesses displaying and selling products through Instagram commerce workflows. PayPerTap is a separate product-link and verified-booking flow for sellers who complete discussion directly on WhatsApp.",
    },
    answers: [
      {
        question: "What is the difference between a store link and product link?",
        answer:
          "A store link lets buyers browse a seller's available products. A product link opens one selected item with relevant details and a booking action. Sellers can share the storefront for discovery, then send the direct item URL when a buyer asks about a particular piece.",
      },
      {
        question: "Where can sellers share direct product URLs?",
        answer:
          "Sellers can place a store or selected product link in an Instagram bio, story, or DM and share it in WhatsApp chats, groups, or status. Each seller should follow the applicable rules of the platform on which they share links.",
      },
      {
        question: "What happens after the booking CTA?",
        answer:
          "The buyer pays the fixed ₹20 PayPerTap platform verified-booking fee and the selected item becomes reserved in the booking flow. The buyer is then guided toward WhatsApp with context for final confirmation; the seller collects the remaining amount directly.",
      },
      {
        question: "Why is a direct link useful for limited-stock selling?",
        answer:
          "When items are one-off or drop-based, a direct link helps the buyer identify the exact product being discussed. It reduces the risk of confusing product photos or prices across chats, although it does not guarantee that a buyer will complete final payment.",
      },
    ],
    responsibilities: [
      {
        stage: "Product page",
        paypertap: "Provides the shareable page and booking action.",
        seller: "Maintains accurate product, price, photo, and availability details.",
      },
      {
        stage: "Booking",
        paypertap: "Collects fixed ₹20 fee and records reservation context.",
        seller: "Receives no ₹20 payout in Phase 1.",
      },
      {
        stage: "Direct completion",
        paypertap: "Prepares the WhatsApp handoff.",
        seller: "Collects the remaining price and handles delivery.",
      },
    ],
    extraFaqs: [
      {
        question: "Can one product link be shared in a DM?",
        answer:
          "Yes. A seller can share the selected product URL when responding to a product-specific enquiry.",
      },
      {
        question: "Does a product page include full payment checkout?",
        answer:
          "No. PayPerTap's Phase 1 flow handles a fixed ₹20 booking only; final product payment stays direct to the seller.",
      },
      {
        question: "Can buyers browse before selecting a product?",
        answer:
          "Yes. Sellers can share their full storefront link for browsing as well as individual links for focused booking.",
      },
    ],
  },
  "/features/customer-leads": {
    directAnswer:
      "Customer leads in PayPerTap are buyer details attached to a selected product and completed ₹20 booking. The purpose is to help a seller follow up in WhatsApp with clearer context, not to promise sales or sell personal data to advertisers. The seller remains responsible for respectful direct communication and fulfilment.",
    introTitle: "What is customer lead context in PayPerTap?",
    workflowTitle: "How is buyer context captured for follow-up?",
    benefitsTitle: "Why keep product interest attached to buyer details?",
    source: {
      before:
        "For sellers who continue support in messaging, official ",
      anchor: "WhatsApp Business use cases",
      href: WHATSAPP_URL,
      after:
        " include business communication such as order confirmations and shipment updates. PayPerTap prepares booking context for the buyer's handoff; it does not claim automatic messaging or guaranteed lead conversion.",
    },
    answers: [
      {
        question: "What buyer information is relevant to a booking?",
        answer:
          "A booking may associate the buyer's supplied name and contact details with the selected product, displayed price, ₹20 booking record, remaining amount context, and message handoff. Sellers should use those details only for operating and supporting their direct buyer relationship appropriately.",
      },
      {
        question: "How does this help follow-up?",
        answer:
          "Instead of trying to match a phone number or DM with an old product screenshot, a seller starts with a booked product and associated buyer context. That can make responses more organized, while the seller still determines how and when to communicate directly.",
      },
      {
        question: "Does PayPerTap promise retargeting results?",
        answer:
          "No. PayPerTap is not described as an advertising or guaranteed lead-generation product. Booking context can support the seller's own follow-up for the relevant order, subject to responsible handling of buyer information and the seller's communication practices.",
      },
      {
        question: "Where can buyers read how data is handled?",
        answer:
          "The PayPerTap Privacy Policy explains handling of seller, buyer, product, booking, and contact information for the storefront and booking flow. Sellers remain responsible for any information they manage within their direct WhatsApp communication after handoff.",
      },
    ],
    responsibilities: [
      {
        stage: "Information capture",
        paypertap: "Keeps booking and relevant buyer context connected.",
        seller: "Provides accurate products and uses context for order follow-up.",
      },
      {
        stage: "Handoff",
        paypertap: "Prepares product and booking context for WhatsApp.",
        seller: "Communicates directly and responsibly with the buyer.",
      },
      {
        stage: "Product transaction",
        paypertap: "Does not handle full product payment.",
        seller: "Collects balance, fulfils order, and applies product policies.",
      },
    ],
    extraFaqs: [
      {
        question: "Does PayPerTap sell buyer data to advertisers?",
        answer:
          "No. PayPerTap is not presented as an advertising data product; its buyer context supports the booking workflow.",
      },
      {
        question: "Does a lead guarantee an order completion?",
        answer:
          "No. A completed booking supplies context, while the remaining purchase and fulfilment still require seller and buyer confirmation.",
      },
      {
        question: "Where can sellers check privacy information?",
        answer:
          "Sellers and buyers can review the Privacy Policy linked from PayPerTap's public pages.",
      },
    ],
  },
  "/for/instagram-sellers": {
    directAnswer:
      "PayPerTap is an Instagram seller tool for Indian product sellers who share items through bios, stories, comments, and DMs. Sellers can send a clean store or product link, buyers pay a fixed ₹20 booking to reserve an item, and booked buyers continue to WhatsApp with useful context for direct completion.",
    introTitle: "What problem does an Instagram seller face?",
    workflowTitle: "How can an Instagram enquiry become a booking?",
    benefitsTitle: "How does PayPerTap help Instagram sellers?",
    source: {
      before:
        "Instagram can be part of commerce discovery: official help for ",
      anchor: "Instagram Shops help",
      href: INSTAGRAM_URL,
      after:
        " describes businesses displaying and selling products. PayPerTap is not an Instagram partner; it is an independent booking storefront for sellers who share product links and complete confirmation on WhatsApp.",
    },
    answers: [
      {
        question: "How can stories, comments, and DMs connect to one flow?",
        answer:
          "A seller can keep a storefront link in their bio and share a direct item link when a buyer replies to a story or asks in a DM. The product page supplies a consistent price and booking action before the seller continues direct confirmation in WhatsApp.",
      },
      {
        question: "What happens to repeated 'available?' messages?",
        answer:
          "PayPerTap does not stop people from asking questions or guarantee buyer behaviour. It offers a clear next step: a buyer who wants the item can review its page and place the fixed booking, giving the seller an organized record before follow-up.",
      },
      {
        question: "What buyer context arrives after booking?",
        answer:
          "The seller can continue from product, buyer, booking, and remaining-amount context rather than rebuilding those details across DMs. This is especially useful when several story replies refer to different products, sizes, or limited-stock pieces.",
      },
      {
        question: "What still belongs to the Instagram seller?",
        answer:
          "The seller remains responsible for accurate product display, availability, final remaining-payment method, delivery, and product policy. PayPerTap keeps the ₹20 platform verified-booking fee in Phase 1 and does not provide full product checkout or seller payouts.",
      },
    ],
    responsibilities: [
      {
        stage: "Instagram discovery",
        paypertap: "Provides store and direct product pages to share.",
        seller: "Chooses where to share links and maintains product accuracy.",
      },
      {
        stage: "Booking",
        paypertap: "Collects fixed ₹20 fee and reserves the item in the flow.",
        seller: "Uses the booking context to prioritize follow-up.",
      },
      {
        stage: "WhatsApp completion",
        paypertap: "Prepares context for handoff.",
        seller: "Collects balance and confirms fulfilment directly.",
      },
    ],
    extraFaqs: [
      {
        question: "Can I put a PayPerTap store link in my Instagram bio?",
        answer:
          "Yes. Sellers can share a store link in their bio and direct product links when responding to item-specific interest.",
      },
      {
        question: "Does an Instagram booking guarantee a final sale?",
        answer:
          "No. It records booking intent before the seller confirms remaining payment and fulfilment.",
      },
      {
        question: "Can Instagram sellers continue on WhatsApp?",
        answer:
          "Yes. PayPerTap is designed to hand booked buyers into the seller's direct WhatsApp confirmation flow.",
      },
    ],
  },
  "/for/whatsapp-sellers": {
    directAnswer:
      "PayPerTap helps WhatsApp-first sellers share product details before a long chat begins. A buyer opens a storefront or product link, pays the fixed ₹20 booking to reserve an item, and continues into WhatsApp with product and payment context ready. PayPerTap works alongside WhatsApp Business and does not automate seller replies.",
    introTitle: "What problem does a WhatsApp-first seller face?",
    workflowTitle: "How can a WhatsApp seller use booking before conversation?",
    benefitsTitle: "How does PayPerTap support WhatsApp selling?",
    source: {
      before:
        "Official ",
      anchor: "WhatsApp Business use cases",
      href: WHATSAPP_URL,
      after:
        " include business messaging such as order confirmations and shipment updates. PayPerTap can sit before that direct conversation by preparing a buyer's booking handoff; it does not automatically reply, message, or manage WhatsApp on a seller's behalf.",
    },
    answers: [
      {
        question: "Why show product details before the chat starts?",
        answer:
          "A product link lets a buyer review the item and price without requiring a seller to resend the same photos and information repeatedly. When the buyer places a booking, the subsequent WhatsApp conversation begins with a selected product and clear payment context.",
      },
      {
        question: "Can this work with WhatsApp Business?",
        answer:
          "Yes. Sellers can use their own WhatsApp or WhatsApp Business account for communication after a booking. PayPerTap's handoff prepares the product, booking, remaining amount, and buyer details; the seller handles messages and any business tools directly.",
      },
      {
        question: "Is this the same as a WhatsApp Catalog?",
        answer:
          "No. A catalog is a WhatsApp product-display feature, while PayPerTap is a separate public storefront and fixed booking layer before handoff. Sellers may decide that one or both tools suit their workflow; PayPerTap does not replace all WhatsApp Business functions.",
      },
      {
        question: "Who receives payment in Phase 1?",
        answer:
          "PayPerTap keeps the fixed ₹20 platform verified-booking fee, and the seller does not receive it. Once the conversation continues in WhatsApp, the seller collects the remaining product amount directly using UPI, COD, or their stated process.",
      },
    ],
    responsibilities: [
      {
        stage: "Product sharing",
        paypertap: "Gives the seller public product and store links.",
        seller: "Shares links through appropriate chats or status.",
      },
      {
        stage: "Booking handoff",
        paypertap: "Records ₹20 booking and prepares message context.",
        seller: "Replies and confirms directly in WhatsApp.",
      },
      {
        stage: "Fulfilment",
        paypertap: "Does not automate messages or full payment.",
        seller: "Handles balance, delivery, and policies.",
      },
    ],
    extraFaqs: [
      {
        question: "Does PayPerTap send WhatsApp messages automatically?",
        answer:
          "No. The buyer continues to WhatsApp with prepared context, and the seller manages the conversation.",
      },
      {
        question: "Can a seller use WhatsApp status to share a link?",
        answer:
          "A seller can share their product or store link through the channels they already use and are permitted to use.",
      },
      {
        question: "Can PayPerTap and WhatsApp Catalog be used together?",
        answer:
          "They serve different roles and can sit in the same seller workflow when appropriate.",
      },
    ],
  },
  "/for/thrift-sellers": {
    directAnswer:
      "PayPerTap gives thrift sellers a booking system for one-piece and limited-stock drops. A seller shares a thrift product link, a buyer places the fixed ₹20 booking, the item becomes reserved in the booking flow, and the seller confirms remaining payment and delivery directly on WhatsApp without a guaranteed final sale claim.",
    introTitle: "What problem does a thrift seller face?",
    workflowTitle: "How does a one-piece thrift item get reserved?",
    benefitsTitle: "Why is booking useful for thrift drops?",
    source: {
      before:
        "Thrift sellers operate inside a broader social-product discovery pattern. Research on India's ",
      anchor: "social commerce market",
      href: MORDOR_URL,
      after:
        " identifies mobile-first discovery as important market context. That context does not prove results for PayPerTap; it explains why limited-stock social sellers may value an organized reservation step.",
    },
    answers: [
      {
        question: "Why are one-piece items difficult to manage in DMs?",
        answer:
          "A thrift seller may have only one jacket, bag, or vintage piece while several people reply to a drop. Questions, holds, and screenshots can become hard to reconcile. A product-specific booking record gives the seller a defined buyer and item context.",
      },
      {
        question: "When is a thrift product reserved?",
        answer:
          "The product becomes reserved in the PayPerTap booking flow after the buyer completes the fixed ₹20 booking. The seller can then follow up with that buyer, while remembering reservation is not the same as completed remaining payment or delivered order.",
      },
      {
        question: "Can a seller run drop-based sharing?",
        answer:
          "Yes. A seller can publish or share direct item links for a drop through Instagram or WhatsApp. Each product link gives the buyer the relevant product context before booking, useful when pieces differ in size, condition, or availability.",
      },
      {
        question: "Does PayPerTap guarantee serious buyers?",
        answer:
          "No. PayPerTap records a buyer's fixed booking action, which can help a seller distinguish it from an informal enquiry. It cannot guarantee that a buyer will make the remaining direct payment, accept delivery, or complete the sale.",
      },
    ],
    responsibilities: [
      {
        stage: "Drop listing",
        paypertap: "Provides links for specific thrift products.",
        seller: "Describes condition, measurements, price, and policies accurately.",
      },
      {
        stage: "Reservation",
        paypertap: "Records ₹20 booking and reserved status.",
        seller: "Confirms that the reserved item can be fulfilled.",
      },
      {
        stage: "Final sale",
        paypertap: "Does not guarantee or process full sale.",
        seller: "Collects balance, ships or arranges pickup, and supports buyer.",
      },
    ],
    extraFaqs: [
      {
        question: "Does reservation prevent every incomplete thrift order?",
        answer:
          "No. A reservation records booking intent, while completion remains between the seller and buyer.",
      },
      {
        question: "Can a thrift seller show condition details first?",
        answer:
          "Yes. Product pages can present information the seller provides before a buyer decides to book.",
      },
      {
        question: "Who handles returns for thrift products?",
        answer:
          "The seller handles product-level returns or exchanges according to the seller's stated policy.",
      },
    ],
  },
  "/for/boutiques": {
    directAnswer:
      "PayPerTap gives boutique sellers a clean storefront link for curated products shared through Instagram and WhatsApp. Buyers can view a product, place the fixed ₹20 booking, and continue to WhatsApp with context ready. The boutique seller remains responsible for final remaining payment, delivery, product accuracy, returns, and exchanges.",
    introTitle: "What problem does a boutique seller face?",
    workflowTitle: "How does a boutique link lead to confirmation?",
    benefitsTitle: "How does PayPerTap help boutique sellers?",
    source: {
      before:
        "Boutique product discovery can take place through social content: research covering ",
      anchor: "social commerce in India",
      href: MORDOR_URL,
      after:
        " identifies social and mobile discovery as growing context. PayPerTap applies a booking-first workflow for independent sellers without making performance claims about boutique sales.",
    },
    answers: [
      {
        question: "Why might a curated catalog need product pages?",
        answer:
          "Boutique buyers often need item photos, price, style information, and availability before confirming. A storefront and selected product link let the seller present those basics consistently instead of sending a different set of images and explanations in each conversation.",
      },
      {
        question: "How does buyer context help a boutique?",
        answer:
          "After a product is booked, the seller can start the WhatsApp follow-up with the selected item, booking context, and buyer information aligned. The seller can then discuss variants, delivery, remaining payment, or product policy without confusing separate chat enquiries.",
      },
      {
        question: "Can boutiques still offer UPI or COD?",
        answer:
          "Yes. In Phase 1 the boutique seller chooses how to collect the remaining product amount directly, including methods the seller offers such as UPI or COD. PayPerTap keeps its fixed ₹20 platform fee and does not provide settlement to sellers.",
      },
      {
        question: "When is PayPerTap not enough?",
        answer:
          "A boutique needing full online checkout, broad ecommerce operations, advanced fulfilment, or integrated seller settlements should evaluate tools built for those requirements. PayPerTap is intentionally focused on product booking and WhatsApp confirmation.",
      },
    ],
    responsibilities: [
      {
        stage: "Catalog display",
        paypertap: "Supplies a browsable storefront and individual product pages.",
        seller: "Maintains product descriptions, prices, images, and stock context.",
      },
      {
        stage: "Buyer booking",
        paypertap: "Collects ₹20 platform fee and records the booked item.",
        seller: "Follows up with the buyer after handoff.",
      },
      {
        stage: "Boutique fulfilment",
        paypertap: "Does not handle final product checkout.",
        seller: "Collects balance, delivers, and applies return policy.",
      },
    ],
    extraFaqs: [
      {
        question: "Can a boutique share collections and product links?",
        answer:
          "A boutique can organize products for browsing and share individual links for product-specific enquiries.",
      },
      {
        question: "Does PayPerTap replace a full ecommerce platform?",
        answer:
          "No. It is a booking-first storefront for sellers who continue direct payment and confirmation.",
      },
      {
        question: "Who handles boutique exchanges?",
        answer:
          "The seller handles exchanges or returns according to their stated product policy.",
      },
    ],
  },
  "/for/handmade-sellers": {
    directAnswer:
      "PayPerTap helps handmade sellers show product detail before a buyer starts final confirmation. A buyer can choose a handmade item, place the fixed ₹20 booking, and move to WhatsApp with context ready. For custom or made-to-order work, the seller must still confirm scope, timeline, remaining payment, and delivery directly.",
    introTitle: "What problem does a handmade seller face?",
    workflowTitle: "How can a handmade product move from story to booking?",
    benefitsTitle: "Why can a booking-first storefront help handmade selling?",
    source: {
      before:
        "Handmade sellers may participate in the broader social-selling environment: research on ",
      anchor: "India's social commerce market",
      href: MORDOR_URL,
      after:
        " describes growing social and mobile discovery. PayPerTap uses this as context for a storefront workflow only; it makes no unsupported claim about handmade-sector demand or seller outcomes.",
    },
    answers: [
      {
        question: "Why does product storytelling matter here?",
        answer:
          "Handmade items can require material notes, dimensions, variation expectations, care information, or the story of how a piece is made. A product page lets the seller provide relevant detail before the buyer books and before the personal WhatsApp conversation continues.",
      },
      {
        question: "How should a custom order be treated?",
        answer:
          "A fixed ₹20 booking does not automatically approve custom specifications or a made-to-order timeline. A handmade seller should use WhatsApp follow-up to confirm scope, availability, final pricing, production time, remaining payment, dispatch, and any applicable cancellation policy.",
      },
      {
        question: "Does booking prove the buyer will complete?",
        answer:
          "No. Booking records a buyer action linked to a product or enquiry, but it does not guarantee the seller will accept custom work or the buyer will pay the balance. Both sides should confirm expectations clearly before fulfilment begins.",
      },
      {
        question: "What remains personal in the workflow?",
        answer:
          "The seller continues the direct conversation on WhatsApp, where questions about customization, gifting, packaging, dispatch, or delivery can be discussed. PayPerTap supplies product and booking context; it does not automate that relationship or fulfil a handmade order.",
      },
    ],
    responsibilities: [
      {
        stage: "Product presentation",
        paypertap: "Provides shareable product and storefront pages.",
        seller: "Writes accurate handmade details and customization limits.",
      },
      {
        stage: "Booking",
        paypertap: "Records fixed ₹20 booking and buyer context.",
        seller: "Confirms whether the selected or custom request can proceed.",
      },
      {
        stage: "Making and delivery",
        paypertap: "Does not manage production or final payment.",
        seller: "Collects balance, makes or dispatches item, and supports buyer.",
      },
    ],
    extraFaqs: [
      {
        question: "Does a handmade booking confirm customization?",
        answer:
          "No. Custom details must still be agreed directly between seller and buyer.",
      },
      {
        question: "Can sellers share detailed product pages?",
        answer:
          "Yes. Product links can provide the seller's item detail before booking and WhatsApp follow-up.",
      },
      {
        question: "Who manages production timelines?",
        answer:
          "The handmade seller manages stated production, dispatch, and delivery timelines directly.",
      },
    ],
  },
  "/for/student-sellers": {
    directAnswer:
      "PayPerTap is a low-setup product storefront for students selling thrift pieces, books, accessories, merchandise, or small inventory through Instagram and WhatsApp. A student seller shares product links, the buyer pays a fixed ₹20 booking, and the remaining amount and pickup or delivery details are confirmed directly in WhatsApp.",
    introTitle: "What problem does a student seller face?",
    workflowTitle: "How does a small student inventory get booked?",
    benefitsTitle: "Why can a low-setup store link help?",
    source: {
      before:
        "A student seller can participate in a wider mobile-first selling context. Research on ",
      anchor: "social commerce in India",
      href: MORDOR_URL,
      after:
        " describes social and mobile discovery growth. PayPerTap does not claim student-market results; it offers a simple booking flow for sellers managing their own small product lists.",
    },
    answers: [
      {
        question: "What products fit a student store link?",
        answer:
          "A student may use a product page for a second-hand textbook, a thrift item, accessories, small merchandise, or another physical item they are able to sell and deliver. They should list product condition, price, availability, and pickup or delivery expectations accurately.",
      },
      {
        question: "Why share a product link in a group or DM?",
        answer:
          "A product link gives interested buyers the same item information before they book. This can be simpler than rewriting price, condition, or booking instructions across class groups, Instagram conversations, and WhatsApp chats when a seller is managing a small inventory.",
      },
      {
        question: "How does payment stay simple?",
        answer:
          "The buyer pays the fixed ₹20 PayPerTap booking to reserve the item in the flow. PayPerTap keeps that fee in Phase 1. The student seller collects the remaining amount directly and agrees pickup, delivery, UPI, or COD details with the buyer.",
      },
      {
        question: "When is this not the right setup?",
        answer:
          "PayPerTap is not a full commerce operation, payment gateway, or shipping service. A seller managing complex stock, broader checkout requirements, or formal fulfilment operations should choose tooling appropriate to those needs rather than rely only on a booking-first storefront.",
      },
    ],
    responsibilities: [
      {
        stage: "Small catalog",
        paypertap: "Provides simple product and store links.",
        seller: "Lists owned or available items accurately.",
      },
      {
        stage: "Booking",
        paypertap: "Takes fixed ₹20 platform booking fee.",
        seller: "Receives booking context, not a fee payout.",
      },
      {
        stage: "Exchange or delivery",
        paypertap: "Prepares WhatsApp handoff.",
        seller: "Arranges pickup, delivery, balance payment, and support.",
      },
    ],
    extraFaqs: [
      {
        question: "Does a student need a full website?",
        answer:
          "No. PayPerTap provides shareable product and store links for its booking-first workflow.",
      },
      {
        question: "Can buyers book second-hand books or thrift items?",
        answer:
          "A seller can list physical items they sell, with accurate details and their own fulfilment terms.",
      },
      {
        question: "Does PayPerTap collect the final selling price?",
        answer:
          "No. The seller collects the remaining amount directly after booking.",
      },
    ],
  },
};

export const comparisonDeepContent: Record<string, ComparisonDeepContent> = {
  "/compare/paypertap-vs-linktree": {
    directAnswer:
      "Linktree is a link-in-bio tool for sharing multiple links. PayPerTap is a verified booking storefront for product sellers: buyers see product pages, supply booking context, pay the fixed ₹20 platform fee, reserve an item in the flow, and move to WhatsApp. PayPerTap is not intended as a general creator link hub.",
    enoughTitle: "Where Linktree is enough",
    enoughBody:
      "Linktree can be enough when a creator, brand, or seller only needs one simple bio link that routes people to many destinations. It is useful for profile links, content, campaigns, forms, or general navigation. PayPerTap becomes more relevant when the link needs product-level booking, buyer details, reserved status, and WhatsApp context after a buyer chooses one item.",
    source: {
      before:
        "Linktree describes itself as a ",
      anchor: "Linktree link-in-bio tool",
      href: LINKTREE_URL,
      after:
        " for bringing links together. That is a useful purpose. PayPerTap addresses a narrower selling task: product presentation, fixed verified booking, reservation context, and WhatsApp handoff for sellers of physical products.",
    },
    answers: [
      {
        question: "What is Linktree best for?",
        answer:
          "Linktree fits creators, brands, and businesses that want to share multiple destinations through one bio link. A seller who mainly wants links to profiles, content, sign-up pages, or different destinations may prefer that general link-sharing job.",
      },
      {
        question: "What is PayPerTap best for?",
        answer:
          "PayPerTap fits Indian Instagram and WhatsApp sellers whose link needs to show products and begin a booking flow. It connects a selected product with buyer context, fixed ₹20 booking, reserved status, and a WhatsApp handoff for direct remaining-payment confirmation.",
      },
      {
        question: "Can a seller use both kinds of tool?",
        answer:
          "Yes. These tools do not have to be universal replacements. A creator may want a general link hub for several destinations while choosing PayPerTap when a product buyer needs a focused storefront and booking path.",
      },
      {
        question: "What limitation should sellers know?",
        answer:
          "PayPerTap is not a generic creator landing page and does not handle full product payment. Linktree is not being presented as a PayPerTap-style paid booking workflow. A seller should compare the actual job: navigation across links or booking a physical item.",
      },
    ],
    additionalRows: [
      { label: "Bio link depth", other: "Strong for bringing several destinations together behind one bio link.", paypertap: "One store link is focused on product browsing and booking rather than broad navigation." },
      { label: "Product-level booking", other: "Not designed around a paid booking action for one selected item.", paypertap: "Each product can lead to the fixed ₹20 booking before WhatsApp." },
      { label: "Buyer details", other: "A general link hub may require another tool to capture order context.", paypertap: "Buyer details stay attached to the selected product booking." },
      { label: "Post-booking WhatsApp context", other: "Usually sends visitors onward without a booking record.", paypertap: "Handoff includes product, booking, and remaining amount context." },
    ],
    example:
      "An Instagram thrift seller who only wants buyers to find multiple social channels may choose a link-in-bio tool. If the seller wants a buyer to open one jacket page, pay the fixed ₹20 booking, reserve that item, and then continue in WhatsApp with details ready, PayPerTap fits that product-booking task.",
    extraFaqs: [
      {
        question: "Does PayPerTap replace every use of Linktree?",
        answer:
          "No. Linktree remains useful for sharing multiple links; PayPerTap is focused on product booking workflows.",
      },
      {
        question: "Who receives the ₹20 on PayPerTap?",
        answer:
          "PayPerTap keeps its fixed platform verified-booking fee in Phase 1. The seller collects the remaining product amount directly.",
      },
      {
        question: "Does PayPerTap provide reserved product context?",
        answer:
          "Yes. A completed booking associates the selected item and buyer context with a reservation in the flow.",
      },
    ],
  },
  "/compare/paypertap-vs-whatsapp-catalog": {
    directAnswer:
      "WhatsApp Catalog helps businesses show products and services to customers inside WhatsApp. PayPerTap serves a different step: a public store or product link with a fixed ₹20 booking before WhatsApp handoff. Sellers can use PayPerTap alongside WhatsApp Business; it does not replace its broader communication or catalog capabilities.",
    enoughTitle: "Where WhatsApp Catalog is enough",
    enoughBody:
      "WhatsApp Catalog can be enough when a seller already runs discovery, questions, and confirmation inside WhatsApp and wants buyers to browse products there. It is useful for WhatsApp-native selling. PayPerTap is more relevant when the seller also needs an Instagram bio or public product-link flow, a paid booking signal before chat, and lead or order context outside scattered conversations.",
    source: {
      before:
        "Official WhatsApp help explains that a ",
      anchor: "WhatsApp Catalog help",
      href: CATALOG_URL,
      after:
        " helps businesses share products and services with customers. PayPerTap is a separate public-link and verified-booking workflow that can pass buyer context into a seller's WhatsApp conversation after a product is booked.",
    },
    answers: [
      {
        question: "What is WhatsApp Catalog best for?",
        answer:
          "WhatsApp Catalog is useful for a business presenting products or services to customers within the WhatsApp environment. For sellers already operating mainly in chat, keeping browsing in that channel may be a sensible fit for their workflow.",
      },
      {
        question: "What is PayPerTap best for?",
        answer:
          "PayPerTap fits sellers who want a public store or product link they can share in Instagram as well as WhatsApp, followed by a fixed booking before the buyer reaches chat. It prepares product, buyer, and remaining-payment context for direct confirmation.",
      },
      {
        question: "Can PayPerTap work alongside WhatsApp Business?",
        answer:
          "Yes. PayPerTap can act as the booking-first layer, while the seller uses their own WhatsApp Business workflow after handoff. PayPerTap does not automate messages, replace seller replies, or claim to replace WhatsApp Business functionality.",
      },
      {
        question: "Where do payment responsibilities differ?",
        answer:
          "In PayPerTap Phase 1, the buyer pays a fixed ₹20 platform verified-booking fee to PayPerTap and the seller receives no payout from it. The seller collects the remaining product amount directly and manages delivery or return discussions.",
      },
    ],
    additionalRows: [
      { label: "Catalog browsing", other: "Good for showing products inside the WhatsApp environment.", paypertap: "Shows products through public storefront and item links before chat." },
      { label: "Instagram bio sharing", other: "Centered on WhatsApp-native discovery.", paypertap: "Store and product links can be shared from Instagram bio, DMs, stories, or WhatsApp." },
      { label: "Booking signal", other: "Browsing a catalog is not the same as a paid booking action.", paypertap: "Fixed ₹20 booking records stronger buyer intent before handoff." },
      { label: "Lead/order organization", other: "Follow-up usually stays inside chat history and seller notes.", paypertap: "Buyer and product context are connected to the booking record." },
    ],
    example:
      "A WhatsApp-first seller may value a catalog for product browsing inside chat. A seller receiving interest from Instagram stories and WhatsApp status can share a PayPerTap product link, record a fixed booking before the conversation, and still use WhatsApp Business to respond and confirm directly.",
    extraFaqs: [
      {
        question: "Does PayPerTap replace WhatsApp Catalog?",
        answer:
          "No. It provides a different booking-first public link flow and can be used alongside WhatsApp tools.",
      },
      {
        question: "Does PayPerTap automate WhatsApp Business replies?",
        answer:
          "No. The seller handles all WhatsApp replies and confirmation directly.",
      },
      {
        question: "Does the seller receive PayPerTap's ₹20 fee?",
        answer:
          "No. PayPerTap keeps that fixed platform fee in Phase 1; the seller collects the remaining amount directly.",
      },
    ],
  },
  "/compare/paypertap-vs-google-forms": {
    directAnswer:
      "Google Forms is useful for creating forms and gathering responses. PayPerTap is for sellers who need a buyer-facing product page, fixed ₹20 verified booking, reservation context, and WhatsApp handoff. A simple interest form may be enough for some workflows; PayPerTap fits product booking rather than general data collection.",
    enoughTitle: "Where Google Forms is enough",
    enoughBody:
      "Google Forms can be enough for surveys, preorder interest, waitlists, custom requests, or collecting responses before a seller decides what to do next. It is flexible for information collection. PayPerTap is more relevant when buyers need product-first browsing, product cards, reserved or sold states, buyer confidence from a clear flow, and WhatsApp continuation after a specific item is booked.",
    source: {
      before:
        "Google describes ",
      anchor: "Google Forms product page",
      href: FORMS_URL,
      after:
        " as an online form builder for forms, surveys, and response collection. That is valuable for collecting information. PayPerTap is designed for a different sequence: product review, fixed booking, reserved context, and seller confirmation on WhatsApp.",
    },
    answers: [
      {
        question: "What is Google Forms best for?",
        answer:
          "Google Forms fits surveys, registrations, internal requests, and straightforward response collection. A seller asking only for expressions of interest or custom information may find a form sufficiently flexible without needing a booking-focused product flow.",
      },
      {
        question: "What is PayPerTap best for?",
        answer:
          "PayPerTap fits physical-product sellers who want buyers to see a product page and make a fixed booking action before direct follow-up. It joins product context, buyer details, reserved state, and WhatsApp handoff rather than requiring the seller to rebuild an order flow in a form.",
      },
      {
        question: "Why does a product-led flow matter?",
        answer:
          "A product page lets buyers begin with the item, its price, and the booking model. A generic response form can collect information, but a seller may still need to separately explain which item, whether it is reserved, and how direct payment and confirmation occur.",
      },
      {
        question: "What limits apply to PayPerTap?",
        answer:
          "PayPerTap is not a full checkout or form builder for every request. It keeps a fixed ₹20 verified-booking fee and hands completion to the seller. Sellers needing broad surveys or unrestricted data collection should choose a tool built for that task.",
      },
    ],
    additionalRows: [
      { label: "Form response collection", other: "Strong for surveys, interest forms, and flexible response fields.", paypertap: "Collects booking context for a selected product, not broad survey data." },
      { label: "Product browsing", other: "Product display must be manually built into the form.", paypertap: "Storefront cards and direct product pages are central." },
      { label: "Buyer trust", other: "A form can feel like a request rather than a shopping flow.", paypertap: "Buyer sees product, price, booking fee, and next step before WhatsApp." },
      { label: "WhatsApp continuation", other: "Seller usually copies response context into chat manually.", paypertap: "Booking handoff keeps product and remaining amount context ready." },
    ],
    example:
      "A student seller collecting general interest in a future merchandise design could use a form. If the item is available now and the seller wants a buyer to view that product, place a fixed ₹20 booking, and carry the order context into WhatsApp, PayPerTap addresses the more specific workflow.",
    extraFaqs: [
      {
        question: "Is Google Forms a poor tool for sellers?",
        answer:
          "No. It is useful for response collection; it simply solves a different primary task from PayPerTap's booking storefront.",
      },
      {
        question: "Does PayPerTap collect buyer context?",
        answer:
          "Yes. Booking connects relevant buyer details with selected product and WhatsApp handoff context.",
      },
      {
        question: "Does PayPerTap support custom survey forms?",
        answer:
          "It is not presented as a general form builder; its focus is the fixed verified-booking flow.",
      },
    ],
  },
  "/compare/paypertap-vs-shopify-starter": {
    directAnswer:
      "Shopify Starter is designed for merchants selling through social media or messaging apps using product links. PayPerTap is a lighter, booking-first storefront for Indian Instagram and WhatsApp sellers: a buyer pays fixed ₹20 before WhatsApp, while the seller collects the remaining amount directly. PayPerTap is not a full Shopify replacement.",
    enoughTitle: "Where Shopify Starter is enough",
    enoughBody:
      "Shopify Starter can be enough when a seller wants a Shopify-backed commerce setup with product pages and checkout structure. It may fit sellers preparing for a broader ecommerce stack. PayPerTap is intentionally narrower: it does not replace full ecommerce, full payment processing, seller payout, or KYC workflows; it fits WhatsApp-first sellers who only need fixed booking before direct confirmation.",
    source: {
      before:
        "Shopify's official help describes ",
      anchor: "Shopify Starter plan",
      href: SHOPIFY_URL,
      after:
        " for merchants selling through social media or messaging apps using product links. PayPerTap addresses a narrower verified-booking flow for sellers who intend to complete remaining payment and confirmation directly through WhatsApp.",
    },
    answers: [
      {
        question: "What is Shopify Starter best for?",
        answer:
          "Shopify Starter suits merchants who want Shopify's approach to selling products through social channels and messaging apps. Sellers planning for broader ecommerce infrastructure should assess Shopify's features, pricing, payment arrangements, and operating requirements directly.",
      },
      {
        question: "What is PayPerTap best for?",
        answer:
          "PayPerTap suits early social sellers who want a product link and a fixed verified booking before a WhatsApp conversation. Its Phase 1 model is intentionally limited: PayPerTap keeps ₹20, and the seller collects the remaining product amount directly.",
      },
      {
        question: "Is one product a replacement for the other?",
        answer:
          "No universal replacement claim is made. Shopify Starter and PayPerTap reflect different setup models. A merchant seeking fuller ecommerce capabilities may prefer Shopify; a seller seeking a booking-first social flow with direct seller collection may consider PayPerTap.",
      },
      {
        question: "What should a seller compare before choosing?",
        answer:
          "A seller should compare product presentation, checkout and payment responsibilities, delivery and policy needs, platform fees, customer communication, and future operating needs. PayPerTap does not provide seller payout, split payments, full product processing, or full ecommerce operations.",
      },
    ],
    additionalRows: [
      { label: "Setup complexity", other: "Commerce setup may be worthwhile when the seller wants broader ecommerce structure.", paypertap: "Lighter setup for booking-first social selling." },
      { label: "Full ecommerce depth", other: "Part of Shopify's broader commerce ecosystem.", paypertap: "Narrow storefront, booking, and WhatsApp handoff flow." },
      { label: "Seller payout/KYC", other: "Depends on the seller's Shopify payment and operating setup.", paypertap: "No seller payout or payout KYC from the ₹20 fee in Phase 1." },
      { label: "WhatsApp-first booking", other: "Useful when the seller wants a fuller checkout path.", paypertap: "Useful when the seller keeps remaining payment and confirmation on WhatsApp." },
    ],
    example:
      "A boutique preparing for broader ecommerce requirements may decide Shopify Starter better fits its roadmap. A small Instagram seller who wants to show an item, record a fixed ₹20 booking, and continue direct UPI or COD confirmation in WhatsApp may choose PayPerTap's narrower flow.",
    extraFaqs: [
      {
        question: "Is PayPerTap a full Shopify replacement?",
        answer:
          "No. PayPerTap is booking-first and does not claim full ecommerce capabilities.",
      },
      {
        question: "Can Shopify Starter support social sellers?",
        answer:
          "Shopify's official material describes it for selling through social media or messaging apps using product links.",
      },
      {
        question: "Does PayPerTap provide seller settlement?",
        answer:
          "No. PayPerTap keeps the fixed ₹20 fee, while the seller collects the remaining product amount directly.",
      },
    ],
  },
};

export const compareHubFaqs: FaqItem[] = [
  {
    question: "Who should compare PayPerTap with other selling tools?",
    answer:
      "Instagram and WhatsApp sellers should compare tools when they are deciding whether they need a link list, catalog, form, full ecommerce platform, or a booking-first storefront with WhatsApp handoff.",
  },
  {
    question: "When does PayPerTap fit better?",
    answer:
      "PayPerTap fits when a seller needs product pages, a fixed ₹20 verified booking, reservation context, buyer details, and direct WhatsApp confirmation for the remaining amount.",
  },
  {
    question: "When should a seller choose another tool?",
    answer:
      "A seller should choose another tool when they mainly need generic links, broad forms, WhatsApp-native catalog display, full ecommerce checkout, shipping operations, seller payout, or split-payment infrastructure.",
  },
  {
    question: "Does PayPerTap replace Shopify, Linktree, Google Forms, or WhatsApp Business?",
    answer:
      "No. PayPerTap is not positioned as a universal replacement. It solves a narrower product-booking job for social sellers and can sit alongside other tools when those tools remain useful.",
  },
];
