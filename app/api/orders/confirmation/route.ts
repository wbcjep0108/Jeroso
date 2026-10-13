import { NextResponse } from "next/server";
import { Resend } from "resend";
import { formatPrice, formatWineMeta, getWineBySlug } from "@/lib/wines";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const senderPattern = /^[^<>\r\n]+\s<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

type RequestedItem = { slug: string; quantity: number };

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.ORDER_FROM_EMAIL?.trim() || process.env.CONTACT_FROM_EMAIL?.trim();
  const replyTo = process.env.CONTACT_RECEIVER_EMAIL?.trim();

  if (!apiKey || !from || !senderPattern.test(from)) {
    console.error("Order confirmation email configuration is incomplete.", {
      hasResendApiKey: Boolean(apiKey),
      hasOrderFromEmail: Boolean(process.env.ORDER_FROM_EMAIL?.trim()),
      hasContactFromEmail: Boolean(process.env.CONTACT_FROM_EMAIL?.trim()),
      from,
      validFromFormat: Boolean(from && senderPattern.test(from)),
    });
    return NextResponse.json({ error: "Order confirmation email is unavailable." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid order confirmation request." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid order confirmation request." }, { status: 400 });
  }

  const fields = body as Record<string, unknown>;
  const email = typeof fields.email === "string" ? fields.email.trim().toLowerCase() : "";
  const firstName = typeof fields.firstName === "string" ? fields.firstName.trim() : "";
  const orderId = typeof fields.orderId === "string" ? fields.orderId.trim() : "";
  const requestedItems = Array.isArray(fields.items) ? fields.items : [];

  if (!emailPattern.test(email) || email.length > 254 || !firstName || !orderId) {
    return NextResponse.json({ error: "Invalid order confirmation request." }, { status: 400 });
  }

  const items: RequestedItem[] = [];
  for (const item of requestedItems) {
    if (!item || typeof item !== "object") return NextResponse.json({ error: "Invalid order items." }, { status: 400 });
    const values = item as Record<string, unknown>;
    const slug = typeof values.slug === "string" ? values.slug : "";
    const quantity = typeof values.quantity === "number" ? values.quantity : 0;
    if (!slug || !Number.isInteger(quantity) || quantity < 1 || quantity > 12) {
      return NextResponse.json({ error: "Invalid order items." }, { status: 400 });
    }
    items.push({ slug, quantity });
  }

  if (!items.length || items.length > 12) {
    return NextResponse.json({ error: "Invalid order items." }, { status: 400 });
  }

  const wines = await Promise.all(items.map(async (item) => ({ item, wine: await getWineBySlug(item.slug) })));
  if (wines.some(({ wine }) => !wine)) {
    return NextResponse.json({ error: "One or more ordered wines could not be found." }, { status: 400 });
  }

  const total = wines.reduce((sum, { item, wine }) => sum + (wine?.price ?? 0) * item.quantity, 0);
  const safeName = escapeHtml(firstName);
  const safeOrderId = escapeHtml(orderId.slice(0, 8).toUpperCase());
  const itemsHtml = wines.map(({ item, wine }) => {
    if (!wine) return "";
    const imageUrl = new URL(wine.image, request.url).toString();
    return `
      <tr>
        <td style="padding:18px 0;border-bottom:1px solid #ebe9e2;vertical-align:top;">
          <img src="${imageUrl}" width="74" height="112" alt="${escapeHtml(wine.name)}" style="display:block;width:74px;height:112px;object-fit:contain;border-radius:8px;background:#f6f6f1;" />
        </td>
        <td style="padding:18px 0 18px 16px;border-bottom:1px solid #ebe9e2;vertical-align:top;">
          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:19px;font-style:italic;line-height:1.25;color:#20241f;">${escapeHtml(wine.name)}</p>
          <p style="margin:6px 0 0;font-size:12px;line-height:1.5;color:#737a70;">${escapeHtml(formatWineMeta(wine))}</p>
          <p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:#4c544a;">${item.quantity} × ${escapeHtml(formatPrice(wine.price))}</p>
        </td>
        <td align="right" style="padding:18px 0;border-bottom:1px solid #ebe9e2;vertical-align:top;font-size:14px;font-weight:bold;color:#20241f;white-space:nowrap;">${escapeHtml(formatPrice(wine.price * item.quantity))}</td>
      </tr>`;
  }).join("");

  const textItems = wines.map(({ item, wine }) => {
    if (!wine) return "";
    return `${wine.name}\n${formatWineMeta(wine)}\n${item.quantity} × ${formatPrice(wine.price)} = ${formatPrice(wine.price * item.quantity)}`;
  }).join("\n\n");

  try {
    const resend = new Resend(apiKey);
    console.info("Attempting Resend order confirmation.", { from, to: email });
    const { error, headers } = await resend.emails.send({
      from,
      to: email,
      ...(replyTo ? { replyTo } : {}),
      subject: `Your Jeroso order is being processed | ${orderId.slice(0, 8).toUpperCase()}`,
      text: `Hello ${firstName},\n\nThank you for your Jeroso order. It is now being processed. We will confirm availability, payment, and delivery details shortly.\n\nOrder reference: ${orderId.slice(0, 8).toUpperCase()}\n\n${textItems}\n\nOrder total: ${formatPrice(total)}`,
      html: `
        <!doctype html>
        <html lang="en">
          <body style="margin:0;padding:0;background-color:#f2f0e9;color:#20241f;font-family:Arial,Helvetica,sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f2f0e9;">
              <tr><td align="center" style="padding:40px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;">
                  <tr><td style="padding:0 4px 18px;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-style:italic;color:#20241f;">Jeroso</td></tr>
                  <tr><td style="overflow:hidden;border:1px solid #dedbd2;border-radius:20px;background-color:#ffffff;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr><td style="padding:38px 40px 34px;background-color:#1b211b;">
                        <p style="margin:0;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#c8d5c3;">Order processing</p>
                        <h1 style="margin:18px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:normal;font-style:italic;line-height:1.15;color:#ffffff;">Your selection is being prepared.</h1>
                        <p style="margin:0;font-size:14px;line-height:1.6;color:#b7beb5;">Hello ${safeName}, we’ll confirm availability, payment, and delivery details shortly.</p>
                      </td></tr>
                      <tr><td style="padding:30px 40px 6px;">
                        <p style="margin:0 0 18px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#899184;">Order reference · ${safeOrderId}</p>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${itemsHtml}</table>
                      </td></tr>
                      <tr><td style="padding:22px 40px 38px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
                          <td style="font-size:13px;color:#737a70;">Order total</td>
                          <td align="right" style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#20241f;">${escapeHtml(formatPrice(total))}</td>
                        </tr></table>
                      </td></tr>
                    </table>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>`,
    });

    if (!error) return NextResponse.json({ success: true });
    console.error("Resend order confirmation failed.", {
      message: error.message,
      statusCode: error.statusCode,
      providerCode: error.name,
      from,
      to: email,
      responseBody: error,
      responseHeaders: headers,
    });
  } catch (error) {
    console.error("Resend order confirmation request failed.", {
      message: error instanceof Error ? error.message : String(error),
      from,
      to: email,
      responseBody: error,
    });
  }

  return NextResponse.json({ error: "Your order was saved, but we could not send its confirmation email." }, { status: 502 });
}
