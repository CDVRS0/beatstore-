import { Resend } from "resend";
import { getSiteUrl } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "CDVRS <orders@cdvrswrld.com>";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "CDVRS";
const SITE_URL = getSiteUrl();

type OrderEmailItem = {
  beatTitle: string;
  licenseName: string;
  price: string;
  downloadUrl: string;
};

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  total: string;
  items: OrderEmailItem[];
}) {
  const { to, orderNumber, total, items } = params;

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #23262C;color:#F3F4F1;font-family:Arial,sans-serif;">
            <div style="font-weight:700;">${escapeHtml(item.beatTitle)}</div>
            <div style="color:#8A8F98;font-size:13px;">${escapeHtml(item.licenseName)} — £${item.price}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #23262C;text-align:right;">
            <a href="${item.downloadUrl}" style="color:#2E5CFF;text-decoration:none;font-weight:700;font-family:Arial,sans-serif;">Download ↓</a>
          </td>
        </tr>`
    )
    .join("");

  const html = `
  <div style="background:#0A0B0D;padding:32px 0;">
    <div style="max-width:560px;margin:0 auto;background:#131519;border:1px solid #23262C;border-radius:8px;padding:32px;font-family:Arial,sans-serif;">
      <h1 style="color:#F3F4F1;font-size:20px;margin:0 0 4px;">Order confirmed</h1>
      <p style="color:#8A8F98;font-size:14px;margin:0 0 24px;">Order #${orderNumber} · Thanks for supporting ${SITE_NAME}</p>
      <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
      <div style="text-align:right;padding-top:16px;color:#F3F4F1;font-weight:700;font-family:Arial,sans-serif;">
        Total: £${total}
      </div>
      <p style="color:#8A8F98;font-size:12px;margin-top:24px;">
        Download links expire in 7 days. Save your files somewhere safe. Need a re-send? Reply to this email.
      </p>
    </div>
  </div>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${SITE_NAME} order #${orderNumber}`,
    html,
  });
}

export async function sendContactNotification(params: { name: string; email: string; message: string }) {
  return resend.emails.send({
    from: FROM,
    to: process.env.ADMIN_EMAIL || FROM,
    replyTo: params.email,
    subject: `New contact form message from ${params.name}`,
    text: params.message,
  });
}

export async function sendNewsletterWelcome(to: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to ${SITE_NAME}`,
    html: `<p style="font-family:Arial,sans-serif;">You're in. New beat drops and exclusive discounts land in your inbox first. Browse the shop: <a href="${SITE_URL}/shop">${SITE_URL}/shop</a></p>`,
  });
}

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
