# IndoLearn Flashcards — PWA Frontend

Progressive Web App built with Next.js (App Router) following the Ocean Professional classic theme.

## Configuration (Supabase-only)

This app connects directly to Supabase for authentication and data. Create `.env.local` from `.env.example` and set:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- NEXT_PUBLIC_SITE_URL is used for auth email redirect. In production, set it to your deployed site origin.

No local Express or Postgres server is required. The prior backend and database directories are decommissioned.

See the Supabase setup guide in `assets/supabase.md` at the repository root for table schema and RLS notes.

## Development

- Install dependencies: `npm install`
- Run the dev server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm start`

Open http://localhost:3000

## PWA

This app includes:
- `public/manifest.webmanifest`
- `public/sw.js` (service worker)
- `public/offline.html` fallback

After visiting the site, you can install it via the browser "Install app" prompt or the PWA install menu.

Note: Add app icons in `public/icons/` as PNG files:
- `/icons/icon-192.png`
- `/icons/icon-512.png`
- `/icons/maskable-512.png`

## Features

- Authentication (login/register/logout) via Supabase Auth
- Dashboard with progress KPIs
- Review with intelligent multiple-choice
- Browse words with category and type filters
- Statistics dashboard (category accuracy and activity heatmap from client logs)
- Settings/profile (display name stored in Supabase user metadata)

## Theming

Uses the "Ocean Professional" palette with subtle shadows, clear sectioning, and minimalist classic styling. See `src/app/globals.css`.
