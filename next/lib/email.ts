import nodemailer from 'nodemailer';

type PartialBool = boolean | undefined | null;

export type MailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
};

function getEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v : undefined;
}

function isTruthy(v: string | undefined): boolean {
  if (!v) return false;
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
}

export async function sendMail(options: MailOptions): Promise<{ ok: true } | { ok: false; error: string }> {
  const host = getEnv('SMTP_HOST');
  const portStr = getEnv('SMTP_PORT');
  const user = getEnv('SMTP_USER');
  const pass = getEnv('SMTP_PASS');
  const fromEnv = getEnv('SMTP_FROM');
  const secureEnv = getEnv('SMTP_SECURE');

  // If SMTP is not configured, log and no-op to avoid breaking contact flow in dev
  if (!host || !portStr || !user || !pass) {
    console.warn('[email] SMTP env not fully configured; skipping real send. Would send:', {
      to: options.to,
      subject: options.subject,
    });
    return { ok: true };
  }

  const port = Number(portStr);
  const secure: PartialBool = typeof secureEnv !== 'undefined' ? isTruthy(secureEnv) : (port === 465);

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: Boolean(secure),
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: options.from || fromEnv || user,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return { ok: true };
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error('[email] sendMail failed:', msg);
    return { ok: false, error: msg };
  }
}
