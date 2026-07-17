import dns from "node:dns";
import { NextResponse } from "next/server";

dns.setDefaultResultOrder("ipv4first");

export async function POST(req: Request) {
  try {
    const { name, company, email, revenue, message } = await req.json();

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_URL is not set");
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }

    void fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        company,
        email,
        revenue,
        message,
        submittedAt: new Date().toISOString(),
        source: "website-contact-form",
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("n8n webhook failed:", res.status, await res.text());
        }
      })
      .catch((err) => console.error("n8n webhook error:", err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}