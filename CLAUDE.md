# Portfolio V2 — start here

Final independent workspace: `C:/Users/hashe/Desktop/portfolio-v2`. Continue development here. Read `AGENTS.md`, `docs/CONSOLIDATION.md`, `design-system/hashem-portfolio-v2/MASTER.md` and `docs/design/PROJECT-HANDOFF.md`. Earlier `site` and `site-v2-light-burgundy` folders are historical references; do not edit them.

## Run and verify

Node24 is the verified local runtime. Dependencies are installed here; on another machine run `npm ci`.

```sh
npm run dev
```

Open `http://127.0.0.1:5176/` (redirects to `/en/`) or `/ar/`. Public URLs are `/<locale>/...`; the former `/preview/<locale>/...` URLs permanently redirect (see `vercel.json`). `npm run build` generates `dist-light-preview`; `npm run preview` serves it at4176. `npm run check` runs TypeScript, all current tests and content validation. The `*:light` commands remain compatible aliases.

## Active architecture

- Themes: Sterling (`metal`) is the default. `preview/theme-cycle.ts` moves to the next edition every 30s (paused for reduced motion, hidden tabs, scrolling, open menus/dialogs and transitions) until the visitor picks one in the menu, which is stored under `portfolio-v2-theme-choice`. Favicons, app icons and the social card (`/og-image-sterling.png`) use the Sterling HK Monogram Tile.
- React19, TypeScript and Vite. Active entry: `preview/main.tsx`. Shell/router: `preview/LightPortfolio.tsx`; route model: `preview/routes.ts`.
- Root `App.tsx`, `sections/`, `index.tsx` and `vite.config.ts` are historical and only run through explicitly named `*:legacy` scripts. When the owner refers to the current website, work in `preview/`.
- Eleven coded projects, five locales and five semantic themes. Preserve factual content, authentic company/R&D assets, existing typography, redactions and approved smoke/portrait behavior. Shared Home/About portrait stays mounted. Existing case hero composition is protected.
- Compact Home phone story has three changing sticky images. Experience exposes all six roles without disclosures. Skills has compact chips with immediately adjacent phone evidence. Case galleries use Embla8.6; GSAP owns established page and interaction choreography. The compact redesign added no ScrollTrigger.
- Gallery, Journal and Admin: `/<locale>/gallery/`, `/journal/`, `/admin/`. Five-locale labels: `preview/studio-copy.ts`.
- Studio foundation: Supabase data, Cloudinary media, Vercel hosting. No live accounts, secrets or deployment yet. Empty public/read-only admin states are intentional. Read `docs/design/CLOUD-STUDIO-SETUP.md`, `.env.example`, `studio/contracts.ts`, `server/studio/` and `supabase/migrations/` before connecting services. Admin has no default password: it needs `ADMIN_PASSWORD_HASH` (scrypt, from `npm run studio:password`), a strong `ADMIN_SESSION_SECRET`, the database (sessions and sign-in throttling) and, in production, `ADMIN_TOTP_SECRET`; otherwise it fails closed. Never put provider secrets in `VITE_` variables.
- Admin edits project images/order/cover/alt only; project prose stays in code. Journal/Gallery manage their own media/captions/publication. Website record deletion retains Cloudinary originals.

## Git and continuation

This folder has its own `.git` directory, one local branch `main` and no linked worktrees. Historical branch commits remain in the consolidated ancestry. Ignored `archive/` preserves verified sources and other worktree drafts; it is not website code/media. No remote is configured until the owner chooses one. Do not automatically restore old designs from historical commits.

Make scoped edits and verify actual browser behavior as appropriate: EN/AR320/390/1440/1920, tablet orientations, keyboard, reduced motion, Back and privacy. Local design skills are copied in `.agents/skills/`. Do not claim physical-device or live-provider verification from local tests.
