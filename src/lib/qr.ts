import QRCode from "qrcode";

export async function generateQrDataUrl(value: string): Promise<string> {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 6,
    type: "image/png",
  });
}
