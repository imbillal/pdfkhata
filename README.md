# PDFKhata

Free PDF, image and Bangla document tools that run entirely in the browser.
Live at https://pdfkhata.billal.dev, in English (`/en/`) and Bangla (`/bn/`).

- 40 tools: organize/edit/convert PDFs, Bangla OCR, Bijoy ⇄ Unicode, image, data and utilities
- No backend: files never leave the visitor's device
- Static Next.js export (`output: "export"`), deployed on Vercel

## Develop

```bash
npm install
npm run dev          # http://localhost:3000 → redirects to /en/ or /bn/
npm run type-check
npm run lint
node --experimental-strip-types --test scripts/bijoy.test.mts   # Bijoy converter tests
```

## Build

```bash
npm run build        # static site in out/ (prebuild copies the pdf.js worker into public/vendor)
npx serve out        # preview the production build
```

## Share images

Open Graph images live in `public/og/<lang>/<slug>.jpg` and are committed.
Regenerate them after changing tool names or blurbs:

```bash
npm run build && npm run og && npm run build
```

`npm run og` renders `/og-card/<lang>/<slug>/` in Chromium (Playwright) so Bangla text is shaped correctly.
If Chromium is missing: `npx playwright install chromium`.

## Deploy (Vercel)

1. Import the GitHub repo in Vercel. The framework is detected as Next.js; `vercel.json` sets the build command, and Vercel serves the static export automatically.
2. Add the domain `pdfkhata.billal.dev` in Project → Settings → Domains, and point a `CNAME` for `pdfkhata` at `cname.vercel-dns.com`.
3. `/` redirects by `Accept-Language` (Bangla → `/bn/`, everyone else → `/en/`), configured in `vercel.json`.

The site URL used for canonical links, the sitemap and share images is in `src/lib/site.ts`.

## Adding a tool

1. Add it to `src/tools/registry.ts` (bilingual name/blurb, category, accepted file kinds).
2. Create `src/tools/impl/<slug>.tsx` (default export, `"use client"`, every string via `useT()`).
3. Add it to `src/tools/loaders.tsx` and pick an icon in `src/tools/icons.tsx`.
4. Write its SEO copy in `src/tools/content/`.
5. Regenerate share images.
