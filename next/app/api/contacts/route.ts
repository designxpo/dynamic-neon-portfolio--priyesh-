import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
import { connectDB } from '../../../lib/db/mongoose';
import { sendMail } from '../../../lib/email';
import Contact from '../../../models/Contact';
import SiteConfig from '../../../models/SiteConfig';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, contactNumber, message } = body || {};

    if (!name || !email || !contactNumber || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Basic input length limits to prevent abuse
    if (String(name).length > 200 || String(email).length > 320 || String(contactNumber).length > 30 || String(message).length > 10000) {
      return NextResponse.json({ error: 'Input exceeds allowed length' }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    await connectDB();
    const saved = await Contact.create({ name, email, contactNumber, message });

    // Load contact settings from DB to determine notification behavior
    let notifyUser = true;
    let notifyAdmin = true;
    let notifyEmail: string | undefined = undefined;
    try {
      const cfg = await SiteConfig.getSingleton();
      const contactCfg: any = (cfg as any).contact || {};
      notifyUser = contactCfg.notifyUserOnSubmit ?? true;
      notifyAdmin = contactCfg.notifyAdminOnSubmit ?? true;
      notifyEmail = contactCfg.notifyEmail || contactCfg.email || process.env.CONTACT_NOTIFY_TO || process.env.SMTP_FROM || process.env.SMTP_USER;
    } catch {}

    const siteName = 'Priyesh Mishra';

    // Fire-and-forget confirmation email to the submitter; do not block success on failures
    if (notifyUser && email) {
      const subject = `Thanks for reaching out, ${name}!`;
      const text = `Hi ${name},\n\nThanks for getting in touch — I received your message and will get back to you shortly.\n\nHere’s a copy of what you sent:\n${message}\n\n— ${siteName}`;
      const html = `
        <div style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a;\">\n          <h2 style=\"margin:0 0 12px;\">Thanks for reaching out, ${escapeHtml(name)}!</h2>\n          <p style=\"margin:0 0 16px; line-height:1.6;\">I received your message and will get back to you shortly.</p>\n          <div style=\"background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; margin: 0 0 16px;\">\n            <div style=\"font-weight:600; margin-bottom:8px;\">Your message:</div>\n            <div style=\"white-space:pre-wrap;\">${escapeHtml(message)}</div>\n          </div>\n          <p style=\"margin:0 0 8px; line-height:1.6;\">— ${siteName}</p>\n        </div>`;
      sendMail({ to: email, subject, text, html }).then((res) => {
        if (!res.ok) console.error('Confirmation email failed:', res);
      }).catch((e) => console.error('Confirmation email error:', e));
    }

    // Admin notification
    if (notifyAdmin && notifyEmail) {
      const subject = `New contact submission from ${name}`;
      const text = `You received a new contact submission:\n\nName: ${name}\nEmail: ${email}\nPhone: ${contactNumber}\nMessage:\n${message}\n\n— ${siteName} website`;
      const html = `
        <div style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a;\">\n          <h2 style=\"margin:0 0 12px;\">New contact submission</h2>\n          <table style=\"border-collapse:collapse; width:100%; margin:0 0 12px;\">\n            <tbody>\n              <tr><td style=\"padding:6px 0;\"><b>Name:</b></td><td style=\"padding:6px 0;\">${escapeHtml(name)}</td></tr>\n              <tr><td style=\"padding:6px 0;\"><b>Email:</b></td><td style=\"padding:6px 0;\">${escapeHtml(email)}</td></tr>\n              <tr><td style=\"padding:6px 0;\"><b>Phone:</b></td><td style=\"padding:6px 0;\">${escapeHtml(contactNumber)}</td></tr>\n            </tbody>\n          </table>\n          <div style=\"background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px;\">\n            <div style=\"font-weight:600; margin-bottom:8px;\">Message:</div>\n            <div style=\"white-space:pre-wrap;\">${escapeHtml(message)}</div>\n          </div>\n        </div>`;
      sendMail({ to: notifyEmail, subject, text, html }).then((res) => {
        if (!res.ok) console.error('Admin notification failed:', res);
      }).catch((e) => console.error('Admin notification error:', e));
    }

    return NextResponse.json({ message: 'Contact form submitted successfully', contact: saved, emailSent: !!(notifyUser && email) }, { status: 201 });
  } catch (err) {
    console.error('Error saving contact:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Basic HTML escape to prevent injection in email body
function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function GET() {
  try {
    await connectDB();
    const contacts = await Contact.find().sort({ submittedAt: -1 });
    return NextResponse.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    await connectDB();
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error deleting contact:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
