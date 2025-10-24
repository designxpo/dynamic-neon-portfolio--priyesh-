# Dynamic Neon Portfolio

A modern, responsive portfolio website built with React, TypeScript, and Vite. Features a dynamic neon theme, admin panel for content management, and contact form with MongoDB backend.

## Features

- 🎨 Dynamic neon theme with dark mode
- 📱 Fully responsive design
- 🔧 Admin panel for content management
- 📧 Contact form with MongoDB storage
- 🎯 Project showcase with detailed pages
- 💼 Experience and education timeline
- 🏆 Skills and testimonials section
- 📝 Blog posts management

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations

### Backend
- Node.js with Express
- MongoDB with Mongoose
- CORS for cross-origin requests

### Database
- MongoDB Atlas (cloud) or local MongoDB

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dynamic-neon-portfolio
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

4. **Configure MongoDB**
   - Create a MongoDB Atlas account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a new cluster and database
   - Get your connection string
   - Create a `.env` file in the `backend` directory:
     ```
     MONGODB_URI=your_mongodb_connection_string
     PORT=5000
     ```

5. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

6. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```

Alternatively, start both frontend and backend together from the project root:
```bash
npm run dev:all
```

### New: Run unified Next.js app (frontend + API in one)

We've added a Next.js app under `next/` that serves both the UI and API routes together. This is the recommended path going forward.

1. Configure database for Next (copy and edit env):
   ```bash
   cp next/.env.example next/.env.local
   # edit next/.env.local to set MONGODB_URI
   ```

2. Run the Next.js dev server:
   ```bash
   npm run dev:next
   ```

3. Test:
   - Frontend: http://localhost:3001/
   - API (Next): http://localhost:3001/api/health
   - Contacts API (Next): http://localhost:3001/api/contacts

Notes:
- During migration we import existing components into Next (experimental.externalDir). Tailwind is configured to scan the root components.
- The current Vite app continues to work. You can migrate sections incrementally, then retire the Vite + Express setup later.

### Next.js (Unified frontend + API in one app)

This repo now also includes a Next.js app in `next/` that combines the frontend and backend API via Route Handlers.

- Health endpoint: `http://localhost:3001/api/health`
- Contacts API: `http://localhost:3001/api/contacts`

Run the Next.js app:
```bash
npm run dev:next
```

Configure database for Next.js (copy `next/.env.example` to `next/.env.local`):
```
MONGODB_URI=your_mongodb_atlas_connection_string
```
If unset, API routes requiring DB will fail until you provide the URI.

7. **Access the application**
   - Frontend: http://localhost:3000 (Vite dev server is configured to run on port 3000)
   - Backend API: http://localhost:5000
   - Admin panel: http://localhost:3000/#/admin

## Configuration (env)

Copy `.env.example` to `.env` and adjust as needed:

```
VITE_API_BASE_URL=
GEMINI_API_KEY=
```

- Leave `VITE_API_BASE_URL` empty during local development to use the Vite dev proxy (configured in `vite.config.ts`).
- In production, set `VITE_API_BASE_URL` to the public URL of your backend API (for example, `https://api.yourdomain.com`).
- If you serve the frontend and backend from the same origin (reverse proxy), you may keep it empty as long as `/api/*` routes are proxied to the backend.

### Next.js env (client)

For the unified Next app under `next/`, you can optionally set a public API base for the browser via `NEXT_PUBLIC_API_BASE_URL` in `next/.env.local`. If omitted, the app will use relative `/api` paths against the same origin.

## API Endpoints

### Contact Form
- `POST /api/contacts` - Submit contact form
- `GET /api/contacts` - Get all submissions (admin only)

### Health Check
- `GET /api/health` - Server health status

For Next.js app, use port 3001 by default: `GET http://localhost:3001/api/health`.

## Admin Panel

Access the admin panel at `/#/admin` with the default password `admin`.

Features:
- Edit all portfolio sections
- Manage projects, experiences, skills
- View contact form submissions
- Update settings

## Project Structure

```
├── backend/                 # Backend API server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── server.js           # Express server
│   └── package.json
├── components/             # React components
│   ├── admin/             # Admin panel components
│   └── ...                # Other components
├── data/                  # Mock data
├── lib/                   # Utilities and API functions
├── public/                # Static assets
└── types.ts               # TypeScript type definitions
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend Scripts

- `npm run dev` - Start with nodemon (development)
- `npm start` - Start production server

## Deployment

### Frontend
Build the frontend and deploy to any static hosting service:
```bash
npm run build
```

### Backend
Deploy the backend to services like Heroku, Railway, or Vercel.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
