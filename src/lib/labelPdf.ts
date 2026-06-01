import { jsPDF } from "jspdf";

import { generateQrDataUrl } from "./qr";
import type { BookingLabelData } from "./labelData";

const LABEL_WIDTH_MM = 100;
const LABEL_HEIGHT_MM = 150;
const MARGIN_MM = 5;
const CONTENT_WIDTH_MM = LABEL_WIDTH_MM - MARGIN_MM * 2;
const TEXT_BLACK = "#111111";
const TEXT_GRAY = "#555555";
const BORDER_GRAY = "#777777";
const LIGHT_BORDER = "#c8c8c8";
const WHITE = "#ffffff";

type TextStyle = {
  fontSize?: number;
  fontStyle?: "normal" | "bold";
  color?: string;
  maxLines?: number;
  lineHeight?: number;
};

function sanitizeFilename(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatLabelMoney(amount: unknown): string {
  const safeAmount = Number(amount);
  const roundedAmount = Number.isFinite(safeAmount) ? Math.max(0, Math.round(safeAmount)) : 0;

  return `Rs. ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(roundedAmount)}`;
}

function setTextStyle(pdf: jsPDF, style: TextStyle = {}) {
  pdf.setFont("helvetica", style.fontStyle || "normal");
  pdf.setFontSize(style.fontSize || 8);
  pdf.setTextColor(style.color || TEXT_BLACK);
}

function drawHorizontalLine(pdf: jsPDF, y: number, x1 = MARGIN_MM, x2 = LABEL_WIDTH_MM - MARGIN_MM) {
  pdf.setDrawColor(BORDER_GRAY);
  pdf.setLineWidth(0.25);
  pdf.line(x1, y, x2, y);
}

function drawSectionBox(pdf: jsPDF, x: number, y: number, width: number, height: number) {
  pdf.setDrawColor(LIGHT_BORDER);
  pdf.setFillColor(WHITE);
  pdf.setLineWidth(0.2);
  pdf.rect(x, y, width, height, "S");
}

function drawSectionTitle(pdf: jsPDF, title: string, x: number, y: number) {
  setTextStyle(pdf, { fontSize: 7.2, fontStyle: "bold", color: TEXT_BLACK });
  pdf.text(title.toUpperCase(), x, y);
}

function truncateToWidth(pdf: jsPDF, text: string, maxWidth: number) {
  const safeText = text || "-";

  if (pdf.getTextWidth(safeText) <= maxWidth) return safeText;

  let truncated = safeText;
  while (truncated.length > 0 && pdf.getTextWidth(`${truncated}...`) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }

  return truncated ? `${truncated}...` : "...";
}

function drawFittedText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  {
    fontSize = 8,
    minFontSize = 5.5,
    fontStyle = "normal",
    color = TEXT_BLACK,
  }: TextStyle & { minFontSize?: number } = {}
) {
  let currentFontSize = fontSize;
  setTextStyle(pdf, { fontSize: currentFontSize, fontStyle, color });

  while (currentFontSize > minFontSize && pdf.getTextWidth(text || "-") > maxWidth) {
    currentFontSize -= 0.5;
    setTextStyle(pdf, { fontSize: currentFontSize, fontStyle, color });
  }

  pdf.text(truncateToWidth(pdf, text || "-", maxWidth), x, y);
}

function drawWrappedText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  style: TextStyle = {}
) {
  const fontSize = style.fontSize || 8;
  const lineHeight = style.lineHeight || fontSize * 0.44 + 1;
  const maxLines = style.maxLines || 99;

  setTextStyle(pdf, style);
  const lines = pdf.splitTextToSize(text || "-", maxWidth).slice(0, maxLines);

  if (lines.length === maxLines && pdf.splitTextToSize(text || "-", maxWidth).length > maxLines) {
    lines[lines.length - 1] = truncateToWidth(pdf, lines[lines.length - 1], maxWidth);
  }

  pdf.text(lines, x, y);

  return y + Math.max(lines.length, 1) * lineHeight;
}

function drawKeyValueRow(
  pdf: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number
) {
  const amountX = x + width;

  setTextStyle(pdf, { fontSize: 8, color: TEXT_BLACK });
  pdf.text(truncateToWidth(pdf, label, width - 34), x, y);

  setTextStyle(pdf, { fontSize: 8, fontStyle: "bold", color: TEXT_BLACK });
  const fittedValue = truncateToWidth(pdf, value, 32);
  pdf.text(fittedValue, amountX - pdf.getTextWidth(fittedValue), y);
}

function drawHeader(pdf: jsPDF, labelData: BookingLabelData) {
  setTextStyle(pdf, { fontSize: 13, fontStyle: "bold", color: TEXT_BLACK });
  pdf.text("PAYPERTAP", MARGIN_MM, 10);
  setTextStyle(pdf, { fontSize: 7.5, color: TEXT_BLACK });
  pdf.text("Verified Booking Label", MARGIN_MM, 15);

  const rightX = 57;
  const rightWidth = LABEL_WIDTH_MM - MARGIN_MM - rightX;
  drawFittedText(pdf, `Booking ID: ${labelData.bookingId || "-"}`, rightX, 9, rightWidth, {
    fontSize: 7,
    minFontSize: 5,
    color: TEXT_BLACK,
  });
  drawFittedText(pdf, `Date: ${labelData.bookingDateText || "-"}`, rightX, 14, rightWidth, {
    fontSize: 6.6,
    minFontSize: 5,
    color: TEXT_BLACK,
  });

  drawHorizontalLine(pdf, 19);
}

function drawQrSection(pdf: jsPDF, qrDataUrl: string) {
  const x = 66;
  const y = 23;
  const width = 29;
  const height = 36;

  drawSectionBox(pdf, x, y, width, height);
  pdf.addImage(qrDataUrl, "PNG", x + 5.5, y + 4, 18, 18);

  setTextStyle(pdf, { fontSize: 6.8, fontStyle: "bold", color: TEXT_BLACK });
  pdf.text("Scan to view product", x + width / 2, y + 26, { align: "center" });

  setTextStyle(pdf, { fontSize: 6.3, color: TEXT_BLACK });
  pdf.text("paypertap.in", x + width / 2, y + 31, { align: "center" });
}

function drawShipToSection(pdf: jsPDF, labelData: BookingLabelData) {
  const x = MARGIN_MM;
  const y = 23;
  const width = 58;
  const height = 36;
  const innerX = x + 3;
  const maxWidth = width - 6;

  drawSectionBox(pdf, x, y, width, height);
  drawSectionTitle(pdf, "Ship To", innerX, y + 6);

  drawWrappedText(pdf, labelData.buyerName || "-", innerX, y + 12, maxWidth, {
    fontSize: 9,
    fontStyle: "bold",
    maxLines: 2,
    lineHeight: 4.2,
  });

  let cursorY = y + 22;
  cursorY = drawWrappedText(pdf, labelData.buyerAddress || "-", innerX, cursorY, maxWidth, {
    fontSize: 7.4,
    maxLines: 2,
    lineHeight: 3.7,
  });
  drawFittedText(
    pdf,
    `${labelData.buyerCity || "-"} - ${labelData.buyerPincode || "-"}`,
    innerX,
    cursorY,
    maxWidth,
    { fontSize: 7.4, color: TEXT_BLACK }
  );
  drawFittedText(pdf, `Phone: ${labelData.buyerPhone || "-"}`, innerX, cursorY + 4, maxWidth, {
    fontSize: 7.4,
    color: TEXT_BLACK,
  });
}

function drawProductSection(pdf: jsPDF, labelData: BookingLabelData) {
  const x = MARGIN_MM;
  const y = 63;
  const width = CONTENT_WIDTH_MM;
  const innerX = x + 3;
  const maxWidth = width - 6;

  drawSectionBox(pdf, x, y, width, 25);
  drawSectionTitle(pdf, "Product Details", innerX, y + 6);

  let cursorY = drawWrappedText(pdf, labelData.productTitle || "-", innerX, y + 12, maxWidth, {
    fontSize: 8.8,
    fontStyle: "bold",
    maxLines: 2,
    lineHeight: 4.2,
  });

  if (labelData.variantText) {
    cursorY = drawWrappedText(
      pdf,
      `Variant: ${labelData.variantText}`,
      innerX,
      cursorY + 0.5,
      maxWidth - 14,
      {
        fontSize: 7.4,
        color: TEXT_BLACK,
        maxLines: 1,
        lineHeight: 3.8,
      }
    );
  }

  drawFittedText(pdf, `Qty: ${labelData.quantity || 1}`, innerX, Math.min(cursorY + 1, y + 22), 20, {
    fontSize: 7.4,
    color: TEXT_BLACK,
  });
}

function drawPaymentBreakdown(pdf: jsPDF, labelData: BookingLabelData) {
  const x = MARGIN_MM;
  const y = 92;
  const width = CONTENT_WIDTH_MM;
  const innerX = x + 3;
  const rowWidth = width - 6;
  const rows =
    labelData.sellerConfirmationAmountPending > 0
      ? [
          ["Paid", formatLabelMoney(labelData.paidOnPayPerTap)],
          ["Collected on WhatsApp", formatLabelMoney(labelData.sellerConfirmationAmountPending)],
          ["To be paid at COD", formatLabelMoney(labelData.finalBalanceAfterConfirmation)],
          ["Total", formatLabelMoney(labelData.totalProductPrice)],
        ]
      : [
          ["Paid", formatLabelMoney(labelData.paidOnPayPerTap)],
          ["Balance to collect", formatLabelMoney(labelData.finalBalanceAfterConfirmation)],
          ["Total", formatLabelMoney(labelData.totalProductPrice)],
        ];

  drawSectionBox(pdf, x, y, width, 29);
  drawSectionTitle(pdf, "Payment Status", innerX, y + 6);

  rows.forEach(([label, value], index) => {
    drawKeyValueRow(pdf, label, value, innerX, y + 12 + index * 4.2, rowWidth);
  });
}

function drawSellerSection(pdf: jsPDF, labelData: BookingLabelData) {
  const x = MARGIN_MM;
  const y = 125;
  const width = CONTENT_WIDTH_MM;
  const innerX = x + 3;
  const phone = labelData.sellerPhone || "Not available";

  drawSectionBox(pdf, x, y, width, 12);
  drawSectionTitle(pdf, "Seller / Store", innerX, y + 5);
  drawFittedText(pdf, `Store: ${labelData.storeName || "-"}`, innerX, y + 9, 43, {
    fontSize: 6.8,
    color: TEXT_BLACK,
  });
  drawFittedText(pdf, `Seller WhatsApp: ${phone}`, 52, y + 9, 40, {
    fontSize: 6.8,
    color: TEXT_BLACK,
  });
}

function drawFooter(pdf: jsPDF) {
  drawHorizontalLine(pdf, 140);

  setTextStyle(pdf, { fontSize: 5.8, fontStyle: "bold", color: TEXT_BLACK });
  pdf.text("This is a PayPerTap booking label, not a courier/shipping label.", 50, 144, {
    align: "center",
  });

  setTextStyle(pdf, { fontSize: 5.5, color: TEXT_GRAY });
  pdf.text("Do not share this label publicly. | www.paypertap.in", 50, 148, {
    align: "center",
  });
}

export async function downloadBookingLabelPdf(labelData: BookingLabelData): Promise<void> {
  const qrDataUrl = await generateQrDataUrl(labelData.productUrl);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [LABEL_WIDTH_MM, LABEL_HEIGHT_MM],
  });

  pdf.setProperties({
    title: `PayPerTap Label ${labelData.bookingId}`,
    subject: "PayPerTap verified booking label",
    creator: "PayPerTap",
  });

  pdf.setFillColor(WHITE);
  pdf.rect(0, 0, LABEL_WIDTH_MM, LABEL_HEIGHT_MM, "F");
  pdf.setDrawColor(BORDER_GRAY);
  pdf.setLineWidth(0.25);
  pdf.setLineDashPattern([1.6, 1.2], 0);
  pdf.rect(MARGIN_MM, MARGIN_MM, CONTENT_WIDTH_MM, LABEL_HEIGHT_MM - MARGIN_MM * 2);
  pdf.setLineDashPattern([], 0);

  drawHeader(pdf, labelData);
  drawShipToSection(pdf, labelData);
  drawQrSection(pdf, qrDataUrl);
  drawProductSection(pdf, labelData);
  drawPaymentBreakdown(pdf, labelData);
  drawSellerSection(pdf, labelData);
  drawFooter(pdf);

  const filename = sanitizeFilename(
    `paypertap-label-${labelData.bookingId || labelData.productId || "booking"}`
  );
  pdf.save(`${filename || "paypertap-label-booking"}.pdf`);
}
