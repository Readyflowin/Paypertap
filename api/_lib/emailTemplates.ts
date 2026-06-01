export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

export type EmailEventType =
  | "seller_welcome"
  | "store_created"
  | "product_added"
  | "booking_created"
  | "buyer_booking_confirmation"
  | "admin_seller_onboarded";

export type SellerWelcomePayload = {
  sellerEmail: string;
  sellerName?: string;
  ctaUrl: string;
};

export type StoreCreatedPayload = {
  sellerEmail: string;
  sellerName?: string;
  storeName: string;
  storeUrl: string;
  productUrl: string;
};

export type ProductAddedPayload = {
  sellerEmail: string;
  productTitle: string;
  price: number;
  bookingAdvanceAmount: number;
  sellerCollectAmount: number;
  productUrl?: string;
  storeUrl?: string;
};

export type BookingCreatedPayload = {
  sellerEmail: string;
  storeName?: string;
  productTitle: string;
  productUrl?: string;
  variantDetails?: string;
  productPrice: number;
  bookingAdvanceAmount: number;
  sellerCollectAmount: number;
  sellerConfirmationAmountPending?: number;
  finalBalanceAfterConfirmation?: number;
  buyerName: string;
  buyerPhone: string;
  buyerAddress?: string;
  buyerCity?: string;
  buyerPincode?: string;
  checkoutId?: string;
  bookingDateText?: string;
  dashboardUrl: string;
};

export type BuyerBookingConfirmationPayload = {
  buyerEmail: string;
  buyerName?: string;
  storeName?: string;
  productTitle: string;
  productPrice: number;
  bookingAdvanceAmount: number;
  sellerCollectAmount: number;
  whatsappUrl?: string;
};

export type AdminSellerOnboardedPayload = {
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  storeName: string;
  storeSlug: string;
  storeUrl: string;
  sellerConfirmationAdvanceType?: string;
  sellerConfirmationAdvanceFixedAmount?: number | null;
  sellerConfirmationAdvancePercent?: number | null;
  createdAtText?: string;
  sellerId: string;
  storeId: string;
};

export type EmailEventPayload =
  | SellerWelcomePayload
  | StoreCreatedPayload
  | ProductAddedPayload
  | BookingCreatedPayload
  | BuyerBookingConfirmationPayload
  | AdminSellerOnboardedPayload;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function renderLayout({
  body,
  ctaLabel,
  ctaUrl,
  preview,
  title,
}: {
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  preview: string;
  title: string;
}) {
  const escapedTitle = escapeHtml(title);
  const cta = ctaLabel && ctaUrl
    ? `<p style="margin: 24px 0 4px;"><a href="${escapeHtml(ctaUrl)}" style="display: inline-block; border-radius: 12px; background: #111827; color: #ffffff; font-weight: 700; padding: 12px 18px; text-decoration: none;">${escapeHtml(ctaLabel)}</a></p>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0; background:#f6f7f9; font-family: Arial, sans-serif; color:#111827;">
    <div style="display:none; max-height:0; overflow:hidden;">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7f9; padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; background:#ffffff; border:1px solid #e5e7eb; border-radius:18px; overflow:hidden;">
            <tr>
              <td style="padding:24px 24px 8px;">
                <div style="font-weight:800; font-size:18px; color:#4f46e5;">PayPerTap</div>
                <h1 style="font-size:24px; line-height:1.25; margin:18px 0 0;">${escapedTitle}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 24px 24px; font-size:15px; line-height:1.65; color:#374151;">
                ${body}
                ${cta}
                <p style="margin:24px 0 0; color:#6b7280; font-size:13px;">Reply to this email if you need help. We are at support@paypertap.in.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function paragraph(text: string) {
  return `<p style="margin:14px 0;">${escapeHtml(text)}</p>`;
}

function details(rows: Array<[string, string]>) {
  return `<div style="margin:18px 0; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden;">${rows
    .map(
      ([label, value]) =>
        `<div style="padding:12px 14px; border-bottom:1px solid #f3f4f6;"><strong style="display:block; color:#111827;">${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span></div>`
    )
    .join("")}</div>`;
}

export function getSellerWelcomeTemplate(payload: SellerWelcomePayload): EmailTemplate {
  const name = payload.sellerName?.trim() || "there";
  const body = [
    paragraph(`Hi ${name}, welcome to PayPerTap.`),
    paragraph("You can create your store, add products, and share one clean PayPerTap link with buyers."),
    paragraph("PayPerTap helps reduce fake buyers using a ₹20 verified booking advance, while you collect the remaining amount directly from the buyer on WhatsApp/UPI/COD."),
    paragraph("When buyers message you on Instagram or WhatsApp, share your PayPerTap store/product link instead of taking manual DM orders. This keeps bookings, customers, and inventory organized."),
  ].join("");

  return {
    subject: "Welcome to PayPerTap — start selling in minutes",
    html: renderLayout({
      body,
      ctaLabel: "Complete your store",
      ctaUrl: payload.ctaUrl,
      preview: "Welcome to PayPerTap. Complete your store and start sharing your link.",
      title: "Start selling in minutes",
    }),
    text: [
      `Hi ${name}, welcome to PayPerTap.`,
      "You can create your store, add products, and share one clean PayPerTap link with buyers.",
      "PayPerTap helps reduce fake buyers using a ₹20 verified booking advance, while you collect the remaining amount directly from the buyer on WhatsApp/UPI/COD.",
      "Complete your store: " + payload.ctaUrl,
    ].join("\n\n"),
  };
}

export function getStoreCreatedTemplate(payload: StoreCreatedPayload): EmailTemplate {
  const body = [
    paragraph(`Your PayPerTap store "${payload.storeName}" is live.`),
    details([
      ["Store", payload.storeName],
      ["Public store link", payload.storeUrl],
    ]),
    paragraph("Share this link with Instagram and WhatsApp buyers instead of taking manual DM orders."),
    paragraph("When buyers message you on Instagram or WhatsApp, share your PayPerTap store/product link instead of taking manual DM orders. This keeps bookings, customers, and inventory organized."),
  ].join("");

  return {
    subject: "Your PayPerTap store is live",
    html: renderLayout({
      body,
      ctaLabel: "Add your first product",
      ctaUrl: payload.productUrl,
      preview: `${payload.storeName} is live on PayPerTap.`,
      title: "Your store is live",
    }),
    text: [
      `Your PayPerTap store "${payload.storeName}" is live.`,
      `Public store link: ${payload.storeUrl}`,
      "Share this link with Instagram and WhatsApp buyers instead of taking manual DM orders.",
      `Add your first product: ${payload.productUrl}`,
    ].join("\n\n"),
  };
}

export function getProductAddedTemplate(payload: ProductAddedPayload): EmailTemplate {
  const link = payload.productUrl || payload.storeUrl || "";
  const body = [
    paragraph(`Product added: ${payload.productTitle}`),
    details([
      ["Product price", formatINR(payload.price)],
      ["Booking advance", formatINR(payload.bookingAdvanceAmount)],
      ["Remaining amount buyer pays you", formatINR(payload.sellerCollectAmount)],
    ]),
    paragraph("When buyers message you on Instagram or WhatsApp, share your PayPerTap store/product link instead of taking manual DM orders. This keeps bookings, customers, and inventory organized."),
  ].join("");

  return {
    subject: `Product added: ${payload.productTitle}`,
    html: renderLayout({
      body,
      ctaLabel: link ? "View product" : undefined,
      ctaUrl: link || undefined,
      preview: `${payload.productTitle} has been added to PayPerTap.`,
      title: "Product added",
    }),
    text: [
      `Product added: ${payload.productTitle}`,
      `Product price: ${formatINR(payload.price)}`,
      `Booking advance: ${formatINR(payload.bookingAdvanceAmount)}`,
      `Remaining amount buyer pays you: ${formatINR(payload.sellerCollectAmount)}`,
      link ? `View product/store: ${link}` : "",
    ].filter(Boolean).join("\n\n"),
  };
}

export function getBookingCreatedTemplate(payload: BookingCreatedPayload): EmailTemplate {
  const location = [payload.buyerCity, payload.buyerPincode].filter(Boolean).join(" ");
  const body = [
    paragraph(`You have a new verified booking for ${payload.productTitle}.`),
    paragraph("The buyer has paid ₹20 on PayPerTap as a verified booking. Please collect the remaining amount directly from the buyer on WhatsApp/UPI/COD before confirming delivery."),
    details([
      ["Buyer", payload.buyerName],
      ["Phone", payload.buyerPhone],
      ["City/Pincode", location || "Not provided"],
      ["Product", payload.productTitle],
      ["Product price", formatINR(payload.productPrice)],
      ["Advance paid", formatINR(payload.bookingAdvanceAmount)],
      ["Remaining amount", formatINR(payload.sellerCollectAmount)],
    ]),
    paragraph("Open WhatsApp and ask buyer to pay remaining amount to confirm delivery."),
  ].join("");

  return {
    subject: `New ₹20 booking: ${payload.productTitle}`,
    html: renderLayout({
      body,
      ctaLabel: "Open dashboard",
      ctaUrl: payload.dashboardUrl,
      preview: `New ₹20 booking for ${payload.productTitle}.`,
      title: "New verified booking",
    }),
    text: [
      `New ₹20 booking: ${payload.productTitle}`,
      "The buyer has paid ₹20 on PayPerTap as a verified booking. Please collect the remaining amount directly from the buyer on WhatsApp/UPI/COD before confirming delivery.",
      `Buyer: ${payload.buyerName}`,
      `Phone: ${payload.buyerPhone}`,
      `City/Pincode: ${location || "Not provided"}`,
      `Product price: ${formatINR(payload.productPrice)}`,
      `Advance paid: ${formatINR(payload.bookingAdvanceAmount)}`,
      `Remaining amount: ${formatINR(payload.sellerCollectAmount)}`,
      `Open dashboard: ${payload.dashboardUrl}`,
    ].join("\n"),
  };
}

export function getSellerBookingCreatedTemplate(payload: BookingCreatedPayload): EmailTemplate {
  const location = [payload.buyerCity, payload.buyerPincode].filter(Boolean).join(" ");
  const sellerConfirmationAmountPending = Number(payload.sellerConfirmationAmountPending || 0);
  const finalBalanceAfterConfirmation =
    payload.finalBalanceAfterConfirmation ?? payload.sellerCollectAmount;
  const variantDetails = payload.variantDetails?.trim() || "Not selected";
  const body = [
    paragraph(`You have a new verified booking for ${payload.productTitle}.`),
    paragraph(`The buyer has paid ${formatINR(payload.bookingAdvanceAmount)} on PayPerTap as a verified booking. Use WhatsApp to collect the remaining confirmation amount and coordinate delivery.`),
    details([
      ["Store", payload.storeName || "PayPerTap store"],
      ["Buyer", payload.buyerName],
      ["Phone", payload.buyerPhone],
      ["Address", payload.buyerAddress || "Not provided"],
      ["City/Pincode", location || "Not provided"],
      ["Product", payload.productTitle],
      ["Product link", payload.productUrl || "Not available"],
      ["Variant", variantDetails],
      ["Product price", formatINR(payload.productPrice)],
      ["Paid on PayPerTap", formatINR(payload.bookingAdvanceAmount)],
      ...(sellerConfirmationAmountPending > 0
        ? [[
            "Seller confirmation amount pending",
            formatINR(sellerConfirmationAmountPending),
          ] as [string, string]]
        : []),
      ["Final balance after confirmation", formatINR(finalBalanceAfterConfirmation)],
      ["Booking/session ID", payload.checkoutId || "Not available"],
      ["Date/time", payload.bookingDateText || "Just now"],
    ]),
    paragraph("WhatsApp handoff: message the buyer, confirm product details, collect any pending confirmation amount, and continue the order from your dashboard once complete."),
  ].join("");

  return {
    subject: `New PayPerTap booking: ${payload.productTitle}`,
    html: renderLayout({
      body,
      ctaLabel: "Open dashboard",
      ctaUrl: payload.dashboardUrl,
      preview: `New PayPerTap booking for ${payload.productTitle}.`,
      title: "New verified booking",
    }),
    text: [
      `New PayPerTap booking: ${payload.productTitle}`,
      `The buyer has paid ${formatINR(payload.bookingAdvanceAmount)} on PayPerTap as a verified booking.`,
      `Store: ${payload.storeName || "PayPerTap store"}`,
      `Buyer: ${payload.buyerName}`,
      `Phone: ${payload.buyerPhone}`,
      `Address: ${payload.buyerAddress || "Not provided"}`,
      `City/Pincode: ${location || "Not provided"}`,
      `Product: ${payload.productTitle}`,
      `Product link: ${payload.productUrl || "Not available"}`,
      `Variant: ${variantDetails}`,
      `Product price: ${formatINR(payload.productPrice)}`,
      `Paid on PayPerTap: ${formatINR(payload.bookingAdvanceAmount)}`,
      sellerConfirmationAmountPending > 0
        ? `Seller confirmation amount pending: ${formatINR(sellerConfirmationAmountPending)}`
        : "",
      `Final balance after confirmation: ${formatINR(finalBalanceAfterConfirmation)}`,
      `Booking/session ID: ${payload.checkoutId || "Not available"}`,
      `Date/time: ${payload.bookingDateText || "Just now"}`,
      "WhatsApp handoff: message the buyer, confirm product details, collect any pending confirmation amount, and continue the order from your dashboard once complete.",
      `Open dashboard: ${payload.dashboardUrl}`,
    ].filter(Boolean).join("\n"),
  };
}

export function getBuyerBookingConfirmationTemplate(
  payload: BuyerBookingConfirmationPayload
): EmailTemplate {
  const body = [
    paragraph(`Your booking for ${payload.productTitle} is recorded.`),
    paragraph("Your ₹20 booking advance has been recorded. Please message the seller on WhatsApp to complete the remaining payment and delivery confirmation."),
    details([
      ["Product", payload.productTitle],
      ["Product price", formatINR(payload.productPrice)],
      ["Advance paid", formatINR(payload.bookingAdvanceAmount)],
      ["Remaining amount", formatINR(payload.sellerCollectAmount)],
    ]),
  ].join("");

  return {
    subject: `Booking confirmed: ${payload.productTitle}`,
    html: renderLayout({
      body,
      ctaLabel: payload.whatsappUrl ? "Message seller on WhatsApp" : undefined,
      ctaUrl: payload.whatsappUrl,
      preview: `Your ₹20 booking for ${payload.productTitle} is recorded.`,
      title: "Booking confirmed",
    }),
    text: [
      `Your booking for ${payload.productTitle} is recorded.`,
      "Your ₹20 booking advance has been recorded. Please message the seller on WhatsApp to complete the remaining payment and delivery confirmation.",
      `Product price: ${formatINR(payload.productPrice)}`,
      `Advance paid: ${formatINR(payload.bookingAdvanceAmount)}`,
      `Remaining amount: ${formatINR(payload.sellerCollectAmount)}`,
      payload.whatsappUrl ? `Message seller: ${payload.whatsappUrl}` : "",
    ].filter(Boolean).join("\n\n"),
  };
}

export function getAdminSellerOnboardedTemplate(
  payload: AdminSellerOnboardedPayload
): EmailTemplate {
  const fixedAdvance =
    payload.sellerConfirmationAdvanceFixedAmount === null ||
    payload.sellerConfirmationAdvanceFixedAmount === undefined
      ? "Not set"
      : formatINR(payload.sellerConfirmationAdvanceFixedAmount);
  const percentAdvance =
    payload.sellerConfirmationAdvancePercent === null ||
    payload.sellerConfirmationAdvancePercent === undefined
      ? "Not set"
      : `${payload.sellerConfirmationAdvancePercent}%`;
  const body = [
    paragraph(`A new seller completed store onboarding on PayPerTap: ${payload.storeName}.`),
    details([
      ["Seller name", payload.sellerName || "Not provided"],
      ["Seller email", payload.sellerEmail || "Not provided"],
      ["Seller phone / WhatsApp", payload.sellerPhone || "Not provided"],
      ["Store name", payload.storeName],
      ["Store slug", payload.storeSlug],
      ["Store URL", payload.storeUrl],
      ["Advance type", payload.sellerConfirmationAdvanceType || "paypertap_only"],
      ["Fixed advance", fixedAdvance],
      ["Percent advance", percentAdvance],
      ["Created/onboarded time", payload.createdAtText || "Just now"],
      ["Seller ID", payload.sellerId],
      ["Store ID", payload.storeId],
    ]),
  ].join("");

  return {
    subject: `New seller onboarded on PayPerTap: ${payload.storeName}`,
    html: renderLayout({
      body,
      ctaLabel: "Open store",
      ctaUrl: payload.storeUrl,
      preview: `${payload.storeName} completed PayPerTap onboarding.`,
      title: "New seller onboarded",
    }),
    text: [
      `New seller onboarded on PayPerTap: ${payload.storeName}`,
      `Seller name: ${payload.sellerName || "Not provided"}`,
      `Seller email: ${payload.sellerEmail || "Not provided"}`,
      `Seller phone / WhatsApp: ${payload.sellerPhone || "Not provided"}`,
      `Store name: ${payload.storeName}`,
      `Store slug: ${payload.storeSlug}`,
      `Store URL: ${payload.storeUrl}`,
      `Advance type: ${payload.sellerConfirmationAdvanceType || "paypertap_only"}`,
      `Fixed advance: ${fixedAdvance}`,
      `Percent advance: ${percentAdvance}`,
      `Created/onboarded time: ${payload.createdAtText || "Just now"}`,
      `Seller ID: ${payload.sellerId}`,
      `Store ID: ${payload.storeId}`,
    ].join("\n"),
  };
}

export function getEmailTemplate(
  eventType: EmailEventType,
  payload: EmailEventPayload
): EmailTemplate {
  if (eventType === "seller_welcome") {
    return getSellerWelcomeTemplate(payload as SellerWelcomePayload);
  }

  if (eventType === "store_created") {
    return getStoreCreatedTemplate(payload as StoreCreatedPayload);
  }

  if (eventType === "product_added") {
    return getProductAddedTemplate(payload as ProductAddedPayload);
  }

  if (eventType === "booking_created") {
    return getSellerBookingCreatedTemplate(payload as BookingCreatedPayload);
  }

  if (eventType === "admin_seller_onboarded") {
    return getAdminSellerOnboardedTemplate(payload as AdminSellerOnboardedPayload);
  }

  return getBuyerBookingConfirmationTemplate(payload as BuyerBookingConfirmationPayload);
}
