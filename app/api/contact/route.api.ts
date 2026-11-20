import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { contactSchema, normalizeIndianMobile } from "@/lib/contact-schema";
import { rateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

const MIN_FILL_MS = 2500; // humans don't complete this form in under 2.5s

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: NextRequest) {
  // Rate limit: 5 submissions per 10 minutes per IP.
  const limited = rateLimit(`contact:${clientIp(req)}`);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a few minutes, or call us directly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Server-side validation — never trust the client.
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields.", fieldErrors },
      { status: 422 },
    );
  }
  const data = parsed.data;

  // Spam traps: honeypot filled, or submitted impossibly fast. Pretend success
  // so bots get no signal.
  const tooFast = typeof data.startedAt === "number" && Date.now() - data.startedAt < MIN_FILL_MS;
  if ((data.website && data.website.length > 0) || tooFast) {
    return NextResponse.json({ ok: true });
  }

  const phone = normalizeIndianMobile(data.phone)!;
  const rows: [string, string][] = [
    ["Name", data.name],
    ["Phone", phone],
    ["Email", data.email || "—"],
    ["City", data.city || "—"],
    ["Property type", data.propertyType || "—"],
    ["Budget", data.budget || "—"],
    ["Preferred contact", data.contactMethod],
    ["Message", data.message || "—"],
  ];

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#1a1a1a;max-width:560px">
      <h2 style="font-weight:500;margin:0 0 16px">New consultation request</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="border-bottom:1px solid #eee;color:#777;width:160px;vertical-align:top">${k}</td><td style="border-bottom:1px solid #eee;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
          )
          .join("")}
      </table>
    </div>`;

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !to) {
    if (process.env.NODE_ENV !== "production") {
      // Local development without credentials: log instead of failing.
      console.info("[contact] RESEND_API_KEY / CONTACT_TO_EMAIL not set — submission logged only:\n" + text);
      return NextResponse.json({ ok: true });
    }
    console.error("[contact] Missing RESEND_API_KEY or CONTACT_TO_EMAIL");
    return NextResponse.json(
      { ok: false, error: "We couldn't send your message right now. Please call or WhatsApp us instead." },
      { status: 500 },
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || `${siteConfig.name} Website <onboarding@resend.dev>`,
      to: to.split(",").map((s) => s.trim()),
      replyTo: data.email || undefined,
      subject: `Consultation request — ${data.name}${data.propertyType ? ` · ${data.propertyType}` : ""}`,
      text,
      html,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("[contact] Resend error", err);
    return NextResponse.json(
      { ok: false, error: "We couldn't send your message right now. Please try again, or call or WhatsApp us." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
