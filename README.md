# HireDesk — Frontend (Client)

A modern, responsive applicant tracking system and job portal user interface built with React 18, Vite, TypeScript, and Tailwind CSS.

---

## Tech Stack

- **Framework:** React 18 (SPA)
- **Tooling & Bundler:** Vite 7
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 3 with PostCSS and Autoprefixer
- **Routing:** React Router DOM 7
- **Server State Management:** TanStack React Query v5
- **Icons & UI:** Custom modern UI components with glassmorphism and clean design system

---

## Folder Structure

```
frontend/
├── public/              # Static public assets & SPA redirect configuration
│   └── _redirects       # SPA 200 rewrite rule for Netlify / Cloudflare Pages
├── src/
│   ├── components/      # Reusable UI components (Navbar, JobCard, ProtectedRoute, ui.tsx)
│   ├── context/         # React Contexts (AuthContext for session & credentials)
│   ├── hooks/           # Custom React hooks (useAuth, useDebounce)
│   ├── lib/             # API client, token handling, and formatting helpers
│   ├── pages/           # Application views (Home, Jobs, JobDetail, Dashboards, etc.)
│   ├── App.tsx          # Router layout & route definitions
│   ├── index.css        # Tailwind directives and utility classes
│   ├── main.tsx         # Application entry point with QueryClientProvider
│   └── types.ts         # TypeScript shared interfaces and domain models
├── .env.example         # Template for environment variables
├── .gitignore           # Ignored files for version control
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind theme & design tokens
├── tsconfig.json        # TypeScript configuration
├── vercel.json          # SPA rewrite configuration for Vercel
└── vite.config.ts       # Vite configuration with dev server proxy
```

---

## Getting Started

### Prerequisites

- **Node.js:** `>= 20.0.0`
- **npm:** `>= 10.0.0`

### 1. Installation

Navigate into the `frontend` directory and install dependencies:

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL for backend API requests | `/api` |

- **In local development:** Leaving `VITE_API_URL=/api` allows the built-in Vite dev proxy in `vite.config.ts` to automatically route `/api/*` calls to `http://localhost:4000/api` without CORS or cookie issues.
- **In production:** Set `VITE_API_URL` to your deployed backend API URL (e.g., `https://your-backend.onrender.com/api`).

### 3. Run Development Server

```bash
npm run dev
```

The frontend will run at: **`http://localhost:5173`**

### 4. Build for Production

```bash
npm run build
```

This compiles TypeScript and builds an optimized, minified production bundle in `dist/`.

To test the production build locally:

```bash
npm run preview
```

---

## Deployment Guide

The frontend compiles to static HTML, CSS, and JS files (`dist/`), making it simple to deploy to any modern hosting provider:

### Deploying to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. In Vercel, click **Add New Project** and import the repository.
3. Configure the project:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend-api-url.com/api`
5. Click **Deploy**.
*(Note: `vercel.json` is already included to handle SPA routing smoothly).*

### Deploying to Netlify

1. In Netlify, click **Add new site** -> **Import an existing project**.
2. Select your repository.
3. Configure build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
4. Under **Environment Variables**, set:
   - `VITE_API_URL`: `https://your-backend-api-url.com/api`
5. Click **Deploy Site**.
*(Note: `public/_redirects` is already included to handle client-side route rewrites).*

### Deploying to Render (Static Site)

1. Create a **New Static Site** on Render.
2. Connect your Git repository.
3. Set the following:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
5. Under **Redirects/Rewrites**, add:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`
