import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_TOPICS, isContactTopic } from "@/lib/site-info";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const receiver = process.env.CONTACT_RECEIVER_EMAIL;

  if (!apiKey || !receiver) {
    console.error("Contact email is missing RESEND_API_KEY or CONTACT_RECEIVER_EMAIL.");
    return NextResponse.json(
      { error: "The contact form is temporarily unavailable." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const fields = body as Record<string, unknown>;
  const name = typeof fields.name === "string" ? fields.name.trim() : "";
  const email = typeof fields.email === "string" ? fields.email.trim().toLowerCase() : "";
  const topic = typeof fields.topic === "string" ? fields.topic : "";
  const message = typeof fields.message === "string" ? fields.message.trim() : "";
  const website = typeof fields.website === "string" ? fields.website.trim() : "";

  // Bots commonly complete this visually hidden field. Return success without sending.
  if (website) return NextResponse.json({ success: true });

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }
  if (email.length > 254 || !emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!isContactTopic(topic)) {
    return NextResponse.json({ error: "Choose a valid topic." }, { status: 400 });
  }
  if (message.length < 10 || message.length > 2000) {
    return NextResponse.json(
      { error: "Your message must be between 10 and 2,000 characters." },
      { status: 400 },
    );
  }

  const topicLabel = CONTACT_TOPICS.find((item) => item.value === topic)?.label ?? "Contact";
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeTopic = escapeHtml(topicLabel);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const subjectName = name.replace(/[\r\n]+/g, " ");
  const replySubject = encodeURIComponent(`Re: ${topicLabel} enquiry`);

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || "Jeroso Contact <onboarding@resend.dev>",
      to: receiver,
      replyTo: email,
      subject: `New ${topicLabel.toLowerCase()} enquiry from ${subjectName} | Jeroso`,
      text: `Name: ${name}\nEmail: ${email}\nTopic: ${topicLabel}\n\n${message}`,
      html: `
        <!doctype html>
        <html lang="en">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="color-scheme" content="light" />
            <title>New Jeroso enquiry</title>
          </head>
          <body style="margin:0;padding:0;background-color:#f2f0e9;color:#20241f;font-family:Arial,Helvetica,sans-serif;">
            <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
              ${safeName} sent a ${safeTopic.toLowerCase()} enquiry through Jeroso.
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f2f0e9;">
              <tr>
                <td align="center" style="padding:40px 16px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;">
                    <tr>
                      <td style="padding:0 4px 18px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-style:italic;line-height:1;color:#20241f;">Jeroso</td>
                            <td align="right" style="font-size:11px;line-height:1.4;letter-spacing:2px;text-transform:uppercase;color:#737a70;">Website enquiry</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="overflow:hidden;border:1px solid #dedbd2;border-radius:20px;background-color:#ffffff;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="padding:38px 40px 34px;background-color:#1b211b;">
                              <span style="display:inline-block;padding:7px 11px;border:1px solid #687965;border-radius:999px;font-size:10px;font-weight:bold;line-height:1;letter-spacing:1.5px;text-transform:uppercase;color:#c8d5c3;">${safeTopic}</span>
                              <h1 style="margin:18px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:normal;font-style:italic;line-height:1.15;color:#ffffff;">A new note has arrived.</h1>
                              <p style="margin:0;font-size:14px;line-height:1.6;color:#b7beb5;">Sent through the Jeroso contact form.</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:34px 40px 8px;">
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td style="padding:0 0 18px;border-bottom:1px solid #ebe9e2;">
                                    <p style="margin:0 0 5px;font-size:10px;font-weight:bold;line-height:1.4;letter-spacing:1.5px;text-transform:uppercase;color:#899184;">From</p>
                                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;color:#20241f;">${safeName}</p>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding:18px 0;border-bottom:1px solid #ebe9e2;">
                                    <p style="margin:0 0 5px;font-size:10px;font-weight:bold;line-height:1.4;letter-spacing:1.5px;text-transform:uppercase;color:#899184;">Email</p>
                                    <a href="mailto:${safeEmail}" style="font-size:15px;line-height:1.5;color:#596d55;text-decoration:none;">${safeEmail}</a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:24px 40px 12px;">
                              <p style="margin:0 0 10px;font-size:10px;font-weight:bold;line-height:1.4;letter-spacing:1.5px;text-transform:uppercase;color:#899184;">Message</p>
                              <div style="padding:22px 24px;border-radius:12px;background-color:#f6f6f1;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.65;color:#30362f;">${safeMessage}</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:20px 40px 40px;">
                              <a href="mailto:${safeEmail}?subject=${replySubject}" style="display:inline-block;padding:14px 22px;border-radius:10px;background-color:#596d55;font-size:14px;font-weight:bold;line-height:1;color:#ffffff;text-decoration:none;">Reply to ${safeName}</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:20px 20px 0;font-size:11px;line-height:1.6;color:#858a81;">
                        This message was sent from the Jeroso website contact form.<br />
                        Replying to this email will respond directly to ${safeName}.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (!error) return NextResponse.json({ success: true });
    console.error("Resend contact email failed:", error);
  } catch (error) {
    console.error("Resend contact email request failed:", error);
  }

  return NextResponse.json(
    { error: "Your message could not be sent. Please try again." },
    { status: 502 },
  );
}
