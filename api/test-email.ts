import { Resend } from "resend";

import { loadLocalEnv } from "./_env.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sendJson(res: any, statusCode: number, body: unknown) {
  res.setHeader("Cache-Control", "no-store");
  res.status(statusCode).json(body);
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
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

export default async function handler(req: any, res: any) {
  loadLocalEnv({ override: true });

  if (process.env.PAYPERTAP_ENABLE_TEST_ENDPOINTS !== "true") {
    return sendJson(res, 404, { success: false, error: "Not found." });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { success: false, error: "Method not allowed." });
  }

  const apiKey = getRequiredEnv("RESEND_API_KEY");
  const fromEmail = getRequiredEnv("RESEND_FROM_EMAIL");
  const replyToEmail = getRequiredEnv("RESEND_REPLY_TO_EMAIL");

  if (!apiKey || !fromEmail || !replyToEmail) {
    return sendJson(res, 500, {
      success: false,
      error: "Resend email environment variables are not configured.",
    });
  }

  const normalizedFromEmail = normalizeEmailHeader(fromEmail);
  const normalizedReplyToEmail = normalizeEmailHeader(replyToEmail);
  const fromEmailAddress = getEmailAddressFromHeader(normalizedFromEmail);
  const replyToEmailAddress = getEmailAddressFromHeader(normalizedReplyToEmail);

  if (!emailPattern.test(fromEmailAddress) || !emailPattern.test(replyToEmailAddress)) {
    return sendJson(res, 500, {
      success: false,
      error: "Resend sender environment variables are not in a valid email format.",
    });
  }

  const body = getRequestBody(req);
  const to = typeof body?.to === "string" ? body.to.trim() : "";

  if (!to) {
    return sendJson(res, 400, { success: false, error: "Recipient email is required." });
  }

  if (!emailPattern.test(to)) {
    return sendJson(res, 400, { success: false, error: "Recipient email is invalid." });
  }

  try {
    const resend = new Resend(apiKey);
    const timestamp = new Date().toISOString();
    const result = await resend.emails.send({
      from: normalizedFromEmail,
      to,
      replyTo: normalizedReplyToEmail,
      subject: "PayPerTap email test",
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <h1 style="font-size: 20px; margin: 0 0 12px;">PayPerTap email test</h1>
          <p>PayPerTap email integration is working.</p>
          <p>This was sent from support@paypertap.in.</p>
          <p style="color: #4b5563;">Timestamp: ${timestamp}</p>
        </div>
      `,
    });

    if (result.error) {
      return sendJson(res, 502, {
        success: false,
        error: result.error.message || "Resend could not send the email.",
      });
    }

    return sendJson(res, 200, { success: true, id: result.data?.id ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email send failed.";
    return sendJson(res, 500, { success: false, error: message });
  }
}
