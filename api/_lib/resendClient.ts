import { Resend } from "resend";

import { loadLocalEnv } from "../_env.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRequiredEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function stripWrappingQuotes(value: string) {
  let normalized = value.trim();

  while (
    normalized.length >= 2 &&
    ((normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'")))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
}

function normalizeEmailHeader(value: string) {
  const normalized = stripWrappingQuotes(value).replace(/\s+/g, " ");
  const angleMatch = normalized.match(/^(.+?)\s*<([^<>]+)>$/);

  if (angleMatch) {
    const displayName = stripWrappingQuotes(angleMatch[1]);
    const email = stripWrappingQuotes(angleMatch[2]).toLowerCase();
    return `${displayName} <${email}>`;
  }

  return normalized.toLowerCase();
}

function getEmailAddressFromHeader(value: string) {
  const angleMatch = value.match(/<([^<>]+)>/);
  return (angleMatch ? angleMatch[1] : value).trim();
}

export function isValidEmail(email: string) {
  return emailPattern.test(email.trim());
}

export async function sendResendEmail({
  html,
  subject,
  text,
  to,
}: {
  html: string;
  subject: string;
  text: string;
  to: string;
}) {
  loadLocalEnv({ override: true });

  const apiKey = getRequiredEnv("RESEND_API_KEY");
  const fromEmail = getRequiredEnv("RESEND_FROM_EMAIL");
  const replyToEmail = getRequiredEnv("RESEND_REPLY_TO_EMAIL");

  if (!apiKey || !fromEmail || !replyToEmail) {
    throw new Error("Resend email environment variables are not configured.");
  }

  const normalizedFromEmail = normalizeEmailHeader(fromEmail);
  const normalizedReplyToEmail = normalizeEmailHeader(replyToEmail);
  const fromEmailAddress = getEmailAddressFromHeader(normalizedFromEmail);
  const replyToEmailAddress = getEmailAddressFromHeader(normalizedReplyToEmail);

  if (!isValidEmail(fromEmailAddress) || !isValidEmail(replyToEmailAddress)) {
    throw new Error("Resend sender environment variables are not in a valid email format.");
  }

  if (!isValidEmail(to)) {
    throw new Error("Recipient email is invalid.");
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: normalizedFromEmail,
    to: to.trim(),
    replyTo: normalizedReplyToEmail,
    subject,
    html,
    text,
  });

  if (result.error) {
    throw new Error(result.error.message || "Resend could not send the email.");
  }

  return result.data?.id ?? null;
}
