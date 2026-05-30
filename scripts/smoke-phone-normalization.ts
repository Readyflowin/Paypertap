import { buildWhatsAppUrl, normalizeIndianMobileInput } from "../src/lib/phone";

const validCases = [
  "7067508872",
  "07067508872",
  "+91 7067508872",
  "0917067508872",
  "91 7067508872",
  "917067508872",
  "+917067508872",
  "70675-08872",
];

const invalidCases = ["12345", "5067508872", "999999999999999", "", "abc"];

for (const input of validCases) {
  const result = normalizeIndianMobileInput(input);

  if (
    !result.ok ||
    result.localNumber !== "7067508872" ||
    result.e164 !== "+917067508872" ||
    result.whatsappNumber !== "917067508872"
  ) {
    throw new Error(`Expected valid normalization for "${input}", got ${JSON.stringify(result)}`);
  }
}

for (const input of invalidCases) {
  const result = normalizeIndianMobileInput(input);

  if (result.ok) {
    throw new Error(`Expected invalid normalization for "${input}", got ${JSON.stringify(result)}`);
  }
}

const whatsappUrl = buildWhatsAppUrl("07067508872", "Hello PayPerTap");

if (whatsappUrl !== "https://wa.me/917067508872?text=Hello%20PayPerTap") {
  throw new Error(`Expected encoded WhatsApp URL, got ${whatsappUrl}`);
}

console.log("Phone normalization smoke checks passed.");
