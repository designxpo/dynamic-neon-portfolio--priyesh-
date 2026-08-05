import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ISO-3166 alpha-2 → international dialing code. Covers common markets; the
// contact form only applies it when the code exists in its dropdown anyway.
const DIAL: Record<string, string> = {
  US: '+1', CA: '+1', GB: '+44', IN: '+91', CN: '+86', JP: '+81', DE: '+49', FR: '+33', IT: '+39', RU: '+7',
  BR: '+55', AU: '+61', NZ: '+64', ZA: '+27', AE: '+971', SA: '+966', QA: '+974', KW: '+965', BH: '+973', OM: '+968',
  SG: '+65', KR: '+82', TH: '+66', MY: '+60', PH: '+63', VN: '+84', ID: '+62', ES: '+34', NL: '+31', SE: '+46',
  CH: '+41', BE: '+32', AT: '+43', IE: '+353', PT: '+351', PL: '+48', DK: '+45', NO: '+47', FI: '+358', GR: '+30',
  PK: '+92', BD: '+880', LK: '+94', NP: '+977', NG: '+234', KE: '+254', EG: '+20', MX: '+52', AR: '+54', CL: '+56',
  CO: '+57', TR: '+90', IL: '+972', UA: '+380', RO: '+40', CZ: '+420', HU: '+36', HK: '+852', TW: '+886',
};

// GET /api/geo — approximate location from the CDN geo headers (Vercel /
// Cloudflare). Used by the contact form to pre-fill location + phone code.
export async function GET(req: Request) {
  const safeDecode = (v: string) => { try { return decodeURIComponent(v); } catch { return v; } };
  const country = (req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || '').toUpperCase();
  const region = req.headers.get('x-vercel-ip-country-region') || '';
  const city = safeDecode(req.headers.get('x-vercel-ip-city') || '');

  let countryName = '';
  if (country) {
    try {
      countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(country) || country;
    } catch {
      countryName = country;
    }
  }

  return NextResponse.json({
    country: country || null,
    region: region || null,
    city: city || null,
    countryName: countryName || null,
    callingCode: (country && DIAL[country]) || null,
  });
}
