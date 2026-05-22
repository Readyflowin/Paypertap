import {
  type BookingCreatedPayload,
  type BuyerBookingConfirmationPayload,
  type EmailEventType,
  type ProductAddedPayload,
  type SellerWelcomePayload,
  type StoreCreatedPayload,
  getEmailTemplate,
} from "./_lib/emailTemplates";
import { isValidEmail, sendResendEmail } from "./_lib/resendClient";

function sendJson(res: any, statusCode: number, body: unknown) {
  res.status(statusCode).json(body);
}

function getRequestBody(req: any) {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  return req.body && typeof req.body === "object" ? req.body : null;
}

function requiredString(payload: Record<string, unknown>, field: string) {
  const value = payload[field];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

function requiredNumber(payload: Record<string, unknown>, field: string) {
  const value = Number(payload[field]);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function validateSellerEmail(payload: Record<string, unknown>, field = "sellerEmail") {
  const email = requiredString(payload, field);
  return email && isValidEmail(email) ? email : "";
}

function validateEventPayload(eventType: EmailEventType, payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Email payload is required.");
  }

  const data = payload as Record<string, unknown>;

  if (eventType === "seller_welcome") {
    const sellerEmail = validateSellerEmail(data);
    const ctaUrl = requiredString(data, "ctaUrl");
    if (!sellerEmail || !ctaUrl) throw new Error("sellerEmail and ctaUrl are required.");
    return { ...data, sellerEmail, ctaUrl } as SellerWelcomePayload;
  }

  if (eventType === "store_created") {
    const sellerEmail = validateSellerEmail(data);
    const storeName = requiredString(data, "storeName");
    const storeUrl = requiredString(data, "storeUrl");
    const productUrl = requiredString(data, "productUrl");
    if (!sellerEmail || !storeName || !storeUrl || !productUrl) {
      throw new Error("sellerEmail, storeName, storeUrl, and productUrl are required.");
    }
    return { ...data, sellerEmail, storeName, storeUrl, productUrl } as StoreCreatedPayload;
  }

  if (eventType === "product_added") {
    const sellerEmail = validateSellerEmail(data);
    const productTitle = requiredString(data, "productTitle");
    const price = requiredNumber(data, "price");
    const bookingAdvanceAmount = requiredNumber(data, "bookingAdvanceAmount");
    const sellerCollectAmount = requiredNumber(data, "sellerCollectAmount");
    if (!sellerEmail || !productTitle || price === null || bookingAdvanceAmount === null || sellerCollectAmount === null) {
      throw new Error("sellerEmail, productTitle, price, bookingAdvanceAmount, and sellerCollectAmount are required.");
    }
    return {
      ...data,
      sellerEmail,
      productTitle,
      price,
      bookingAdvanceAmount,
      sellerCollectAmount,
    } as ProductAddedPayload;
  }

  if (eventType === "booking_created") {
    const sellerEmail = validateSellerEmail(data);
    const productTitle = requiredString(data, "productTitle");
    const buyerName = requiredString(data, "buyerName");
    const buyerPhone = requiredString(data, "buyerPhone");
    const dashboardUrl = requiredString(data, "dashboardUrl");
    const productPrice = requiredNumber(data, "productPrice");
    const bookingAdvanceAmount = requiredNumber(data, "bookingAdvanceAmount");
    const sellerCollectAmount = requiredNumber(data, "sellerCollectAmount");
    if (
      !sellerEmail ||
      !productTitle ||
      !buyerName ||
      !buyerPhone ||
      !dashboardUrl ||
      productPrice === null ||
      bookingAdvanceAmount === null ||
      sellerCollectAmount === null
    ) {
      throw new Error("sellerEmail, booking details, and dashboardUrl are required.");
    }
    return {
      ...data,
      sellerEmail,
      productTitle,
      buyerName,
      buyerPhone,
      dashboardUrl,
      productPrice,
      bookingAdvanceAmount,
      sellerCollectAmount,
    } as BookingCreatedPayload;
  }

  const buyerEmail = validateSellerEmail(data, "buyerEmail");
  const productTitle = requiredString(data, "productTitle");
  const productPrice = requiredNumber(data, "productPrice");
  const bookingAdvanceAmount = requiredNumber(data, "bookingAdvanceAmount");
  const sellerCollectAmount = requiredNumber(data, "sellerCollectAmount");
  if (!buyerEmail || !productTitle || productPrice === null || bookingAdvanceAmount === null || sellerCollectAmount === null) {
    throw new Error("buyerEmail, productTitle, productPrice, bookingAdvanceAmount, and sellerCollectAmount are required.");
  }
  return {
    ...data,
    buyerEmail,
    productTitle,
    productPrice,
    bookingAdvanceAmount,
    sellerCollectAmount,
  } as BuyerBookingConfirmationPayload;
}

function getRecipient(eventType: EmailEventType, payload: ReturnType<typeof validateEventPayload>) {
  if (eventType === "buyer_booking_confirmation") {
    return (payload as BuyerBookingConfirmationPayload).buyerEmail;
  }

  return (payload as SellerWelcomePayload).sellerEmail;
}

export default async function handler(req: any, res: any) {
  // TODO: Require authenticated seller/session checks before production launch.
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { success: false, error: "Method not allowed." });
  }

  const body = getRequestBody(req);
  const eventType = body?.eventType as EmailEventType | undefined;
  const allowedEvents: EmailEventType[] = [
    "seller_welcome",
    "store_created",
    "product_added",
    "booking_created",
    "buyer_booking_confirmation",
  ];

  if (!eventType || !allowedEvents.includes(eventType)) {
    return sendJson(res, 400, { success: false, error: "Unsupported email event type." });
  }

  try {
    const payload = validateEventPayload(eventType, body?.payload);
    const template = getEmailTemplate(eventType, payload);
    const id = await sendResendEmail({
      to: getRecipient(eventType, payload),
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return sendJson(res, 200, { success: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email send failed.";
    console.error(`Event email failed (${eventType}):`, error);
    return sendJson(res, 500, { success: false, error: message });
  }
}
