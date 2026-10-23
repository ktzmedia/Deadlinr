# deadlinr – Student deadline PWA

React + TypeScript + Vite + Tailwind v4 + vite-plugin-pwa. Data lives in localStorage.

## Run locally
    npm install
    npm run dev          # http://localhost:5173

## Build
    npm run build        # output in dist/
    npm run preview      # test the built PWA (service worker only runs in build)

## Deploy to Cloudflare Pages
Push to GitHub, then Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
Build command: `npm run build`   Output directory: `dist`   (no env vars needed)
Or: `npm run build && npx wrangler pages deploy dist`

## Files
- src/lib.ts – types, storage, date maths, theme/install hooks
- src/components/Landing.tsx – marketing page + install guide
- src/components/Tracker.tsx – the app (hero, list, add/edit sheet)
- src/index.css – colour tokens (light/dark) and animations
- vite.config.ts – PWA manifest and service worker
- scripts/make-icons.py – regenerates placeholder icons in public/
