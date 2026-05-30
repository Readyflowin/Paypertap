export type IndianMobileNormalizationResult = {
  ok: boolean;
  localNumber?: string;
  e164?: string;
  whatsappNumber?: string;
  error?: string;
};

const INVALID_INDIAN_MOBILE_MESSAGE =
  "Please enter a valid 10-digit Indian WhatsApp number.";

export function normalizeIndianMobileInput(
  input: string
): IndianMobileNormalizationResult {
  let digits = String(input || "").replace(/\D/g, "");

  if (!digits) {
    return {
      ok: false,
      error: INVALID_INDIAN_MOBILE_MESSAGE,
    };
  }

  if (digits.startsWith("091") && digits.length === 13) {
    digits = digits.slice(3);
  } else if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return {
      ok: false,
      error: INVALID_INDIAN_MOBILE_MESSAGE,
    };
  }

  return {
    ok: true,
    localNumber: digits,
    e164: `+91${digits}`,
    whatsappNumber: `91${digits}`,
  };
}

export function buildWhatsAppUrl(phone: string, message: string): string | null {
  const normalizedPhone = normalizeIndianMobileInput(phone);

  if (!normalizedPhone.ok || !normalizedPhone.whatsappNumber) {
    return null;
  }

  return `https://wa.me/${normalizedPhone.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

