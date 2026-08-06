# Project Cost Estimator — Pricing Research (2025–2026)

> **Purpose:** Calibrate a project cost estimator with current, defensible market-rate
> benchmarks for custom software / web / design services.
> **Target profile:** A *skilled freelancer or small studio* operating at **mid-market**
> level — not an enterprise agency, not an offshore-bargain shop.
> **Currency:** All figures are **USD** unless otherwise noted.

## Methodology & Caveats

- Ranges are triangulated from multiple 2025–2026 pricing guides and rate datasets, with
  preference for high-trust aggregators (Clutch.co, index.dev, Stack Overflow Developer
  Survey) over single-vendor marketing pages. Vendor "cost guides" (agency blogs) are
  useful for *shape* and *relative multipliers* but tend to inflate absolute numbers to
  justify agency pricing, so their high ends are discounted for the freelancer/small-studio
  profile.
- **All figures are indicative, not quotes.** Real quotes swing widely with scope,
  seniority, and client budget. Treat these as calibration priors, not guarantees.
- **Region factors blend two things:** foreign-exchange / cost-of-living differences AND
  local market rate expectations. They are *not* pure salary ratios. A US project priced at
  1.0 does not become "the same work" at 0.3 in India — it reflects what that market
  typically charges/pays for comparable delivery.
- Where sources materially disagree, this is flagged in the "Sources Disagree / Low
  Confidence" section rather than papered over with false precision.
- Data thinness is real for: UAE/Gulf project rates, "design-only" project pricing, and
  domain multipliers (mostly inferred from cost-guide deltas, not controlled datasets).

---

## Baseline hourly rate anchor (mid-market freelancer / small studio, US)

The estimator's implied blended rate should sit around **$75–$150/hr** for a US
freelancer/small studio:

- US software-dev companies on Clutch cluster at **$50–$99/hr**; Canada and Australia at
  **$100–$149/hr** [Clutch, Software Development Pricing Guide, 2026].
- US freelance developers average **$95–$110/hr** (seniors $100–$150) [index.dev, Freelance
  Developer Rates by Country, 2025–2026].
- US web-design agency hourly rates commonly quoted at **$75–$200/hr**
  [Fiverr / Blacksmith cost guides, 2025].
- Mid-market software firms broadly **$120–$250/hr**; enterprise US firms **$400+/hr**
  (out of scope for this profile) [multiple custom-software guides, 2025].

**Confidence: High** on the $75–$150 mid-market band.

---

## 1. Marketing / Brand Website

Small end = a focused brochure/landing site; large end = a multi-page custom brand site with
CMS, custom design, and content/strategy work.

| Endpoint | Range (USD) | Source |
|---|---|---|
| Small / starting | **$1,500 – $5,000** | Freelancer brochure/landing sites $800–$5,000; 5-page brochure $1,000–$4,000 [Fiverr 2025; OuterBox 2026] |
| Large / complex | **$8,000 – $25,000** | Custom marketing sites $5,000–$25,000+; agency w/ strategy+copy+testing $2,500–$8,000, custom builds $10k–$50k [Blacksmith 2025; Fiverr 2025; thewebfactory 2025] |

- Template-based builds land **$1,000–$5,000**; truly custom **$5,000–$20,000+**
  [gotechark / f22labs 2025].
- **Recommended base range: $2,000 – $12,000** (mid-market freelancer/small studio, custom
  but not enterprise). **Confidence: High.**

---

## 2. Web App / SaaS Dashboard

Small end = a lean MVP (auth + dashboard + one core feature); large end = multi-feature SaaS
with integrations, APIs, and custom UI.

| Endpoint | Range (USD) | Source |
|---|---|---|
| Small / starting | **$15,000 – $30,000** | Simple MVP (login, dashboard, one core feature) $15k–$25k [designrevision 2026]; with freelancers $20k–$60k [ptolemay 2025] |
| Large / complex | **$60,000 – $150,000** | Advanced MVP >$50k; USA SaaS MVP $50k–$150k; most startups spend $75k–$150k [waqarhabib 2025; vrinsofts 2025] |

- Agency-built SaaS reaches **$50k–$250k+**; freelancer/small-studio band sits lower
  ($20k–$150k) [ptolemay 2025].
- **Recommended base range: $18,000 – $90,000** for the mid-market profile.
  **Confidence: Medium-High** (wide scope variance is inherent).

---

## 3. Mobile App (iOS / Android)

Small end = simple, few screens, minimal backend; large end = feature-rich with
integrations and custom UI. Note cost guides here skew high (agency-oriented).

| Endpoint | Range (USD) | Source |
|---|---|---|
| Small / starting | **$15,000 – $50,000** | Simple apps $40k–$100k (agency); simple Android $5k–$20k [droidsonroids 2025; creolestudios 2025] |
| Large / complex | **$80,000 – $300,000** | Feature-rich w/ advanced integrations $80k–$300k+; moderate $100k–$200k [cubix 2026; kellton 2026] |

- Dual-native (iOS + Android) costs **60–70% more** than a single cross-platform codebase
  [droidsonroids 2025] — a useful platform multiplier.
- iPhone app range quoted **$20k–$250k** [zazz 2025].
- **Recommended base range: $20,000 – $150,000** for mid-market (below agency headline
  numbers, above offshore-bargain). **Confidence: Medium** — heavy source inflation; the
  $40k "simple" floors are agency numbers, real freelancer simple apps start lower.

---

## 4. Custom Software / Platform

Small end = simple business MVP; large end = mid-sized multi-module platform with
integrations (excluding true enterprise $400k–$1M+).

| Endpoint | Range (USD) | Source |
|---|---|---|
| Small / starting | **$20,000 – $50,000** | Simple MVP from ~$20k [artezio 2025] |
| Large / complex | **$150,000 – $300,000** | "Sweet spot" $50k–$250k; average project $75k–$250k; enterprise $150k–$850k+ [multisyn 2025; saritasa 2025; Kevin's Tech 2025] |

- Clutch reports average software project **~$132,480** with typical range **$10k–$49k** per
  project and 13-month timelines [Clutch, Software Dev Pricing Guide, 2026] — the Clutch
  "per project" band is lower than vendor guides because it counts many smaller engagements.
- **Recommended base range: $30,000 – $200,000** for mid-market.
  **Confidence: Medium** (very scope-dependent).

---

## 5. UI/UX Design Only (no build)

Small end = small-scope app or landing redesign; large end = full product UX + design system.

| Endpoint | Range (USD) | Source |
|---|---|---|
| Small / starting | **$2,000 – $8,000** | Small app redesign $1k–$3k; "a few thousand" for simple projects [designmonks 2025; twine 2025] |
| Large / complex | **$15,000 – $40,000+** | Complex SaaS UX overhaul $15k–$40k+; $20k+ for apps w/ full design systems [designmonks 2025] |

- Freelance UI/UX hourly: mid-level ~**$78/hr**, senior ~**$138/hr** (range $30–$285)
  [goLance 2026; ruul 2025].
- A rough heuristic: **design-only ≈ 25–40% of a full build** of the same product.
- **Recommended base range: $3,000 – $30,000.** **Confidence: Medium** — "design-only"
  project data is thinner than build data.

---

## Multiplier: Design Tier (baseline = 1.0)

Evidence from template-vs-custom cost deltas:

- Template/theme builds: **$1,000–$5,000**; custom builds: **$5,000–$20,000+**
  → custom is roughly **2–4×** a template [gotechark 2025; f22labs 2025; thewebfactory 2025].
- A **full design system** (tokens, components, IA, cross-team facilitation) commands a
  further premium: designers doing strategic/design-system work charge **30–80% more** than
  screen-only designers [contra 2025; designmonks 2025].

| Tier | Multiplier | Basis |
|---|---|---|
| Template / theme | **0.6–0.7×** | Template builds ~40–60% cheaper than custom |
| Custom (baseline) | **1.0×** | Reference point |
| Premium / full design system | **1.3–1.6×** | +30–80% for design-system + strategic work |

**Confidence: Medium-High** for template↔custom; **Medium** for the premium tier
(inferred from designer-rate premiums, not project datasets).

---

## Multiplier: Rush / Priority Timeline (baseline = 1.0)

Freelance rush-fee conventions are fairly consistent across sources:

- Typical rush surcharge: **25–100%** on top of base rate, scaling with how compressed the
  deadline is [freelancermap 2025; LegalClarity 2025; SoloPricing 2026].
- Common tiered structure: **+25%** for a moderately shorter timeline, **+50%** for
  delivery in <50% of standard time, **+75–100%** for <48h turnarounds
  [nation1099 2025; Vicarel Studios 2025].

| Rush level | Multiplier |
|---|---|
| Normal timeline | 1.0× |
| Moderate compression | 1.25× |
| Heavy compression (<50% time) | 1.5× |
| Extreme (<48h / drop-everything) | 1.75–2.0× |

**Recommended single default (for a simple estimator): rushCostMult = 1.5×.**
**Confidence: High** — this is a well-established freelance norm.

---

## Multiplier: Industry / Domain Complexity (baseline = general build = 1.0)

Domain premiums come mostly from cost-guide deltas rather than controlled data, so treat as
directional. Ordering (fintech/healthcare highest, general lowest) is well supported.

| Domain | Multiplier | Basis |
|---|---|---|
| General | **1.0×** | Reference |
| E-commerce | **1.3–1.5×** | Ecommerce typically 1–2× (often 3–10× at high complexity) a brochure site; adds catalog, checkout, payments, tax, inventory [OuterBox 2026; makeitseen 2025] |
| Education | **1.1–1.3×** | Moderate: content, LMS/quiz logic; modest premium over general (inferred) |
| Social | **1.3–1.5×** | Real-time feeds, notifications, moderation, scaling (inferred from marketplace/feed complexity) |
| SaaS | **1.4–1.6×** | Multi-tenancy, billing, roles, integrations; SaaS builds priced well above brochure/general web [ptolemay 2025; designrevision 2026] |
| Marketplace | **1.6–2.0×** | Two-sided platform = effectively two apps + admin; marketplaces $80k–$350k+ vs standard ecommerce [Codica 2026; developers.dev 2025] |
| AI / Data | **1.5–2.0×** | AI/ML engineers command **40–60%** premiums; data prep is 60–80% of ML effort; specialized infra [index.dev 2025; softteco 2026; appinventiv 2026] |
| Healthcare | **1.3–1.6×** | HIPAA architecture adds **20–30%**; compliance = 15–25% of build [acquaintsoft 2026; saigontechnology 2026] |
| Fintech | **1.5–1.8×** | PCI-DSS/PSD2 + security; compliance modules $40k–$60k; dual health+finance adds 20–35% [aleaitsolutions 2025; acquaintsoft 2026] |

**Confidence: Medium** for the ordering; **Low-Medium** on the exact factor values
(these are calibrated estimates, not measured coefficients — do not over-trust the decimals).

---

## Multiplier: Regional Pricing (baseline = US = 1.0)

Blends FX/cost-of-living with local market rate expectations. Anchored to blended hourly
rates from Clutch (by country) and index.dev freelance rates, cross-checked with Stack
Overflow 2025 salary signals.

| Region | Factor vs US | Basis |
|---|---|---|
| USA | **1.0×** | Anchor. Dev $95–$110/hr freelance; Clutch $50–$99/hr companies [index.dev 2025; Clutch 2026] |
| India (IN) | **0.30–0.40×** | Clutch India $25–$49/hr; freelance $30–$50/hr avg; SO median eng-mgr salary ~$52k vs US $200k [Clutch 2026; index.dev 2025; SO Survey 2025] |
| UK (GB) | **0.80–0.90×** | Freelance $75–$95/hr vs US $95–$110 [index.dev 2025] |
| Western Europe (EU) | **0.75–0.85×** | Germany freelance $70–$85/hr; SO Germany eng-mgr ~$118k vs US $200k [index.dev 2025; SO Survey 2025] |
| UAE / Gulf (AE) | **0.65–0.85×** | Dubai agencies AED 250–700/hr; senior devs $125+/hr but South-Asian teams much lower; wide spread [scaleupally 2025; growlio 2025; codknox 2025] |
| Australia (AU) | **0.90–1.05×** | Freelance ~$93/hr avg; Clutch AU companies $100–$149/hr [index.dev 2025; Clutch 2026] |
| Canada (CA) | **0.85–1.00×** | Freelance $85–$100/hr; Clutch CA $100–$149/hr [index.dev 2025; Clutch 2026] |

**Confidence:** High for IN, GB, EU, CA, AU (multiple corroborating datasets).
**Low-Medium for AE** — Gulf data is thin and bimodal (Western vs South-Asian staff inside
the same market), so the range is wide by necessity.

---

## Sources Disagree / Low Confidence Notes

1. **Mobile app "simple" floor.** Agency guides (cubix, kellton, zazz) put "simple" apps at
   $40k+; cross-platform/freelancer sources (creolestudios, droidsonroids) show $5k–$20k for
   basic Android. For a freelancer/small studio, the true floor is nearer **$15–25k**, not
   $40k. Numbers here lean to the lower, freelancer-realistic side.
2. **SaaS / MVP spread is enormous** ($15k → $250k) depending on who builds it (starter-kit
   DIY vs freelancer vs agency). The estimator baseline uses the *freelancer/small-studio*
   slice, deliberately below agency headline figures.
3. **Domain multipliers are directional, not measured.** The compliance premiums
   (HIPAA +20–30%, AI/ML +40–60% talent premium) are well-cited *inputs*; converting them
   into a single project-level factor (e.g., fintech = 1.6×) is a modeling choice, not a
   datapoint. Keep decimals coarse.
4. **UAE/Gulf is bimodal.** The same Dubai market contains AED 65–120/hr South-Asian teams
   and AED 200–350/hr Western developers — a 3× internal spread. Any single AE factor is a
   compromise.
5. **Clutch "per project" vs vendor "cost guides" disagree by design.** Clutch's software
   average (~$132k, typical $10k–$49k) counts many small engagements; vendor guides quote
   larger flagship builds. Both are cited; the estimator base ranges sit between them.
6. **"Design-only" project pricing is thin.** Most sources price design *inside* a build.
   The design-only ranges here are partly derived from the "design ≈ 25–40% of build"
   heuristic plus the few explicit design-only quotes available.

---

## Recommended Defaults (concrete, plug-in-ready)

**Base USD ranges (mid-market freelancer / small studio, US baseline, region=1.0):**

| Project type | Min | Max |
|---|---|---|
| Marketing / brand website | $2,000 | $12,000 |
| Web app / SaaS dashboard | $18,000 | $90,000 |
| Mobile app (iOS/Android) | $20,000 | $150,000 |
| Custom software / platform | $30,000 | $200,000 |
| UI/UX design only | $3,000 | $30,000 |

**Design-tier multipliers:** template `0.65`, custom `1.0`, premium/design-system `1.45`.

**Rush multiplier:** `rushCostMult = 1.5` (single default; or tier 1.25 / 1.5 / 1.9).

**Domain multipliers:** general `1.0`, ecommerce `1.4`, saas `1.5`, marketplace `1.8`,
fintech `1.65`, healthcare `1.45`, education `1.2`, social `1.4`, ai `1.7`.

**Region multipliers (US = 1.0, applied to USD base):** IN `0.35`, EU `0.80`, GB `0.85`,
AE `0.75`, AU `0.95`, CA `0.90`.

> **Honesty note:** Base ranges and the rush/design-tier multipliers are **high confidence**.
> Region factors are **high confidence except AE (low-medium)**. Domain factors are
> **directional (medium/low)** — the ordering is trustworthy, the exact decimals are a
> calibrated guess. Figures are indicative; region factors blend FX + local market rates.

### Key sources
- Clutch.co — Software Development / Web Development Pricing Guides (2026)
- index.dev — Freelance Developer Rates by Country (2025–2026)
- Stack Overflow Developer Survey (2025)
- Fiverr, OuterBox, Blacksmith, thewebfactory — website cost guides (2025–2026)
- ptolemay, designrevision, vrinsofts, waqarhabib — SaaS/MVP cost guides (2025–2026)
- cubix, kellton, droidsonroids, creolestudios, zazz — mobile app cost guides (2025–2026)
- Codica, developers.dev — marketplace cost guides (2025–2026)
- acquaintsoft, saigontechnology, aleaitsolutions — fintech/healthcare cost guides (2025–2026)
- softteco, appinventiv — AI/ML cost guides (2026)
- freelancermap, nation1099, SoloPricing, LegalClarity — rush-fee conventions (2025–2026)
- scaleupally, growlio, codknox — UAE/Dubai software cost guides (2025)

---

## Applied to the estimator (what shipped)

The estimate is computed as **base × size × design × domain (+ flat add-ons) × timeline**, then converted per region. Because *size* is a separate multiplier, the config's **`base` range is the SMALL-size range** — the size tiers (small ×1, medium ×1.6, large ×2.6, enterprise ×4) carry the growth up to the researched "complex" figures. So the base ranges below are lower than the research's full small→complex spread by design.

**Base (USD, small size):** Website `$2,000–5,000` · Web app/SaaS `$9,000–22,000` · Mobile `$12,000–30,000` · Custom software `$15,000–40,000` · UI/UX design `$3,000–9,000`.
Sanity check: a *medium custom* web app = `$21.6k–52.8k`; an *enterprise premium fintech* software = up to `~$383k` — both sit inside the researched ranges.

**Design:** template `0.65` · custom `1.0` · premium `1.45`.
**Rush:** `1.5×`.
**Domain:** general `1.0` · ecommerce `1.4` · saas `1.5` · marketplace `1.8` · fintech `1.65` · healthcare `1.45` · education `1.2` · social `1.4` · ai `1.7`.
**Region** = *(US-relative factor) × (USD→local FX)*, so the number shows in local currency at the local market level:
IN `29` (0.35×84) · EU `0.74` (0.80×0.92) · GB `0.67` (0.85×0.79) · AE `2.75` (0.75×3.67) · AU `1.44` (0.95×1.52) · CA `1.23` (0.90×1.37).

All values live in `lib/estimatorPricing.ts` (`DEFAULT_PRICING`) and are editable in **Admin → Cost Estimator**. They are indicative defaults, not quotes.
