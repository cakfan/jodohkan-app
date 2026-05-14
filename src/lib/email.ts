import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY belum diset");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export function getResendFrom(): string {
  const from = process.env.RESEND_FROM;
  if (!from) {
    throw new Error("RESEND_FROM belum diset");
  }
  return from;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  const from = getResendFrom();
  return getResend().emails.send({
    from,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]*>/g, ""),
  });
}
