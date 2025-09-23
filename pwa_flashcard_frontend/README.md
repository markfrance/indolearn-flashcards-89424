# IndoLearn Flashcards — PWA Frontend

Progressive Web App built with Next.js (App Router) following the Ocean Professional classic theme.

## Configuration

Copy `.env.example` to `.env.local` and set the backend base URL:

```
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

The frontend expects an Express backend exposing the endpoints found in `../backend/interfaces/openapi.json`.

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

- Authentication (login/register/logout)
- Dashboard with progress KPIs
- Review with intelligent multiple-choice and spaced repetition prompts (Easy/Good/Hard)
- Browse words with category and type filters
- Statistics dashboard (category accuracy and activity heatmap)
- Settings/profile

## Theming

Uses the "Ocean Professional" palette with subtle shadows, clear sectioning, and minimalist classic styling. See `src/app/globals.css`.
