# API Reference

Base URL (dev): http://localhost:3011

Notes
- JSON everywhere: send Content-Type: application/json for POST/PUT.
- Auth: No server-side auth is enforced by these routes. The Admin UI uses a simple client-side password check (default: "admin"). For production, add proper authentication.
- Database dependency: Admin and Contacts APIs require MongoDB (MONGODB_URI). When absent/unreachable, some routes return 503. The Admin UI in this project falls back to localStorage client-side, but the API itself does not persist offline.

## Health

GET /api/health
- 200 { status: "OK", message: "Next.js server is running" }

## Contacts

Collection of contact form submissions.

POST /api/contacts
- Body
  {
    "name": "Priyesh Mishra",
    "email": "priyesh@example.com",
    "contactNumber": "+91 8368872108",
    "message": "Hello!"
  }
- Responses
  - 201 { message: "Contact form submitted successfully", contact: { ...savedDoc } }
  - 400 { error: "All fields are required" }
  - 500 { error: "Internal server error" }

GET /api/contacts
- Responses
  - 200 [ { ...contact }, ... ] (sorted by submittedAt desc)
  - 500 { error: "Internal server error" } (e.g., DB down)

## Admin: Content by key

Dynamic endpoint to read/write individual content sections.

Allowed keys
- hero, services, projects, experiences, educations, skills, testimonials, contact, blogs, seo, adminPassword

GET /api/admin/[key]
- Params
  - key: one of the allowed keys
- Responses
  - 200: The stored value (type depends on key; see Schemas below). Null if missing.
  - 400 { error: "Invalid key" }
  - 503 { error: "Database not configured" } (when MONGODB_URI is not set)

PUT /api/admin/[key]
- Params
  - key: one of the allowed keys
- Body
  - Full replacement payload for that key (see Schemas below)
- Responses
  - 200 { ok: true }
  - 400 { error: "Invalid key" }
  - 503 { error: "Database not configured" }

### Schemas (types overview)

These are summarized from `next/types.ts`:

- hero: HeroData
  {
    "name": "Your Name",
    "title": "Role",
    "shortBio": "...",
    "profileImage": { "url": "...", "alternativeText": "..." },
    "ctaButtonText": "Contact Me",
    "ctaButtonLink": "/contact",
    "stats": [ { "id": "1", "label": "Projects", "value": "24+" } ]
  }

- services: Service[]
  [
    { "id": "s1", "title": "Design", "description": "...", "icon": "Paintbrush", "order": 1 }
  ]

- projects: Project[]
  [
    {
      "id": "p1",
      "title": "Awesome App",
      "category": "Web",
      "descriptionShort": "...",
      "descriptionLong": "...",
      "coverImage": { "url": "..." },
      "featured": true,
      "technologies": ["Next.js", "Tailwind"],
      "liveUrl": "https://...",
      "sourceUrl": "https://..."
    }
  ]

- experiences: Experience[]
  [ { "id": "e1", "positionTitle": "Dev", "companyName": "Acme", "startYear": "2022", "endYear": "2024", "description": "..." } ]

- educations: Education[]
  [ { "id": "ed1", "courseTitle": "B.Sc.", "instituteName": "Uni", "startYear": "2018", "endYear": "2022", "description": "..." } ]

- skills: Skill[]
  [ { "id": "sk1", "skillName": "React", "icon": "react", "image": { "url": "..." } } ]

- testimonials: Testimonial[]
  [ { "id": "t1", "clientName": "Jane", "roleCompany": "CEO, Co.", "quote": "Great!", "avatar": { "url": "..." } } ]

- contact: ContactData
  {
    "heading": "Get in touch",
    "description": "...",
    "email": "you@example.com",
    "phone": "+1 555 0100",
    "socialLinks": [ { "id": "gh", "platform": "GitHub", "url": "https://github.com/you", "icon": "Github" } ]
  }

- blogs: Blog[]
  [ { "id": "b1", "title": "Post", "content": "...", "author": "You", "publishedAt": "2024-01-01T00:00:00.000Z", "url": "https://...", "thumbnail": { "url": "..." }, "excerpt": "..." } ]

- seo: SEOConfig (map of section -> SeoMeta)
  {
    "home": { "metaTitle": "Home | Site", "metaKeywords": "portfolio,web", "metaDescription": "..." },
    "hero": { "metaTitle": "...", "metaKeywords": "...", "metaDescription": "..." }
  }

- adminPassword: string
  "admin"

## Admin: Config snapshot

Snapshot and batch updates of the entire SiteConfig content (excluding internal fields like _id, __v, timestamps, baseline).

GET /api/admin/config
- Responses
  - 200 { hero, services, projects, experiences, educations, skills, testimonials, contact, blogs, seo, adminPassword? }

PUT /api/admin/config?mode=replace|merge|setBaseline|reset
- Query param
  - mode: replace (default), merge, setBaseline, reset
- Body (JSON)
  - For replace/merge: partial or full object of the snapshot fields
  - For setBaseline/reset: body is ignored
- Responses
  - 200 { ok: true, mode, source? }
  - 400 { error: "Unsupported mode" }

Modes explained
- replace: Replace all snapshot fields with the payload values (missing keys may be set undefined/null depending on model defaults).
- merge: Shallow-merge payload into the current content snapshot.
- setBaseline: Save current content as a baseline for later resets.
- reset: Restore from saved baseline if available; otherwise, fall back to model defaults.

## Status codes
- 200 OK — success
- 201 Created — new resource created
- 400 Bad Request — validation/unsupported input
- 500 Internal Server Error — unexpected exception (e.g., DB error)
- 503 Service Unavailable — database not configured

## Examples

Submit a contact
curl -X POST http://localhost:3011/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "contactNumber": "+1 555 0100",
    "message": "Hello!"
  }'

Get hero content
curl http://localhost:3011/api/admin/hero

Update hero content
curl -X PUT http://localhost:3011/api/admin/hero \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priyesh",
    "title": "Full Stack Developer",
    "shortBio": "...",
    "profileImage": { "url": "/images/profile.jpg" },
    "ctaButtonText": "Hire Me",
    "ctaButtonLink": "/contact",
    "stats": [ { "id": "1", "label": "Projects", "value": "24+" } ]
  }'

Replace config
curl -X PUT "http://localhost:3011/api/admin/config?mode=replace" \
  -H "Content-Type: application/json" \
  -d '{ "services": [ { "id": "s1", "title": "Design", "description": "...", "icon": "Paintbrush", "order": 1 } ] }'

## Offline behavior (client)
- When the server returns 503 on admin endpoints (DB not configured), the Admin UI in this repo switches to an offline mode and reads/writes content to localStorage. This is a client-only convenience for development; server routes do not store data offline.

## Chat (LLM)

POST /api/chat

Use an LLM to answer user questions about the portfolio based on the site content. The route builds a concise profile context from the database (or mock fallback) and queries the configured LLM provider.

- Body
  {
    "question": "What projects have you worked on?"
  }
- Responses
  - 200 { "answer": "..." }
  - 400 { "error": "Missing question" }
  - 503 { "error": "LLM not configured" }
  - 500 { "error": "Chat failed" }

Provider configuration (env in next/.env.local)
- OpenAI
  - OPENAI_API_KEY=sk-...
  - OPENAI_MODEL=gpt-4o-mini (default)

- Azure OpenAI
  - AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com
  - AZURE_OPENAI_API_KEY=...
  - AZURE_OPENAI_DEPLOYMENT=<your-deployment-name>
  - AZURE_OPENAI_API_VERSION=2024-02-15-preview (default)

- Google Gemini
  - GEMINI_API_KEY=AIza... (or GOOGLE_API_KEY=...)
  - GEMINI_MODEL=gemini-1.5-flash (default)
  Notes
  - This project uses the REST API endpoint: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
  - We pass portfolio context as part of the user content, temperature=0.4 for concise, credible answers.
