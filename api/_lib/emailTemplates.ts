export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

export type EmailEventType =
  | "seller_welcome"
  | "store_created"
  | "product_added"
  | "admin_seller_onboarded"
  | "wallet_recharge_successful"
  | "wallet_low"
  | "wallet_empty";

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
  productUrl?: string;
  storeUrl?: string;
};

export type AdminSellerOnboardedPayload = {
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  storeName: string;
  storeSlug: string;
  storeUrl: string;
  createdAtText?: string;
  sellerId: string;
  storeId: string;
};

export type WalletRechargeSuccessfulPayload = {
  sellerEmail: string;
  sellerName?: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId: string;
  dashboardUrl: string;
};

export type WalletStatePayload = {
  sellerEmail: string;
  sellerName?: string;
  balance: number;
  freeOrdersRemaining: number;
  dashboardUrl: string;
};

export type EmailEventPayload =
  | SellerWelcomePayload
  | StoreCreatedPayload
  | ProductAddedPayload
  | AdminSellerOnboardedPayload
  | WalletRechargeSuccessfulPayload
  | WalletStatePayload;

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
  }).format(amount);
}

function paragraph(text: string) {
  return `<p style="margin:0 0 14px;color:#4b5563;line-height:1.6">${escapeHtml(text)}</p>`;
}

function rows(items: Array<[string, string | number | undefined]>) {
  return items
    .filter(([, value]) => value !== undefined && value !== "")
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;color:#6b7280">${escapeHtml(label)}</td><td style="padding:8px 0;text-align:right;color:#111827;font-weight:700">${escapeHtml(value)}</td></tr>`
    )
    .join("");
}

function shell({
  ctaLabel,
  ctaUrl,
  intro,
  subject,
  title,
  rows: detailRows = [],
}: {
  ctaLabel?: string;
  ctaUrl?: string;
  intro: string[];
  subject: string;
  title: string;
  rows?: Array<[string, string | number | undefined]>;
}): EmailTemplate {
  const details = detailRows.length
    ? `<table style="width:100%;border-collapse:collapse;margin:18px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb">${rows(detailRows)}</table>`
    : "";
  const cta = ctaUrl
    ? `<a href="${escapeHtml(ctaUrl)}" style="display:inline-block;margin-top:10px;background:#111827;color:#ffffff;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:700">${escapeHtml(ctaLabel || "Open PayPerTap")}</a>`
    : "";
  const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:620px;margin:0 auto;padding:28px;background:#ffffff;color:#111827"><p style="margin:0 0 10px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">PayPerTap</p><h1 style="margin:0 0 16px;font-size:24px;line-height:1.2">${escapeHtml(title)}</h1>${intro.map(paragraph).join("")}${details}${cta}</div>`;
  const text = [title, "", ...intro, "", ...detailRows.map(([label, value]) => `${label}: ${value}`), ctaUrl || ""]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

export function getSellerWelcomeTemplate(payload: SellerWelcomePayload): EmailTemplate {
  const name = payload.sellerName || "there";
  return shell({
    subject: "Welcome to PayPerTap",
    title: `Welcome, ${name}`,
    intro: [
      "Your seller workspace is ready.",
      "Add products, share your store link, and manage orders from the dashboard.",
    ],
    ctaLabel: "Open dashboard",
    ctaUrl: payload.ctaUrl,
  });
}

export function getStoreCreatedTemplate(payload: StoreCreatedPayload): EmailTemplate {
  return shell({
    subject: `Your PayPerTap store is ready: ${payload.storeName}`,
    title: "Store created",
    intro: [
      `${payload.storeName} is ready to share with buyers.`,
      "Buyer payments go directly to your configured seller payment flow when you use partial advance.",
    ],
    rows: [
      ["Store", payload.storeUrl],
      ["First product", payload.productUrl],
    ],
    ctaLabel: "View store",
    ctaUrl: payload.storeUrl,
  });
}

export function getProductAddedTemplate(payload: ProductAddedPayload): EmailTemplate {
  return shell({
    subject: `Product added: ${payload.productTitle}`,
    title: "Product added",
    intro: ["Your product is available in your PayPerTap store."],
    rows: [
      ["Product", payload.productTitle],
      ["Price", formatINR(payload.price)],
    ],
    ctaLabel: "View product",
    ctaUrl: payload.productUrl || payload.storeUrl,
  });
}

export function getAdminSellerOnboardedTemplate(
  payload: AdminSellerOnboardedPayload
): EmailTemplate {
  return shell({
    subject: `New seller onboarded: ${payload.storeName}`,
    title: "New seller onboarded",
    intro: ["A seller completed PayPerTap onboarding."],
    rows: [
      ["Seller", payload.sellerName],
      ["Email", payload.sellerEmail],
      ["Phone", payload.sellerPhone],
      ["Store", payload.storeName],
      ["Slug", payload.storeSlug],
      ["Seller ID", payload.sellerId],
      ["Store ID", payload.storeId],
      ["Created", payload.createdAtText],
    ],
    ctaLabel: "View store",
    ctaUrl: payload.storeUrl,
  });
}

export function getWalletRechargeSuccessfulTemplate(
  payload: WalletRechargeSuccessfulPayload
): EmailTemplate {
  return shell({
    subject: `Wallet recharged: ${formatINR(payload.amount)}`,
    title: "Wallet recharge successful",
    intro: ["Your PayPerTap seller wallet has been credited."],
    rows: [
      ["Recharge amount", formatINR(payload.amount)],
      ["Balance before", formatINR(payload.balanceBefore)],
      ["Balance after", formatINR(payload.balanceAfter)],
      ["Reference", payload.referenceId],
    ],
    ctaLabel: "Open wallet",
    ctaUrl: payload.dashboardUrl,
  });
}

export function getWalletStateTemplate(
  eventType: "wallet_low" | "wallet_empty",
  payload: WalletStatePayload
): EmailTemplate {
  const empty = eventType === "wallet_empty";

  return shell({
    subject: empty ? "Wallet empty: recharge required" : "Wallet running low",
    title: empty ? "Wallet paused" : "Wallet running low",
    intro: empty
      ? ["Recharge your wallet to continue receiving new orders."]
      : ["Recharge is recommended so your store can continue receiving orders."],
    rows: [
      ["Wallet balance", formatINR(payload.balance)],
      ["Free orders remaining", payload.freeOrdersRemaining],
    ],
    ctaLabel: "Recharge wallet",
    ctaUrl: payload.dashboardUrl,
  });
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
  if (eventType === "admin_seller_onboarded") {
    return getAdminSellerOnboardedTemplate(payload as AdminSellerOnboardedPayload);
  }
  if (eventType === "wallet_recharge_successful") {
    return getWalletRechargeSuccessfulTemplate(payload as WalletRechargeSuccessfulPayload);
  }
  return getWalletStateTemplate(eventType, payload as WalletStatePayload);
}
