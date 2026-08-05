# Hashem Kayyali Portfolio

A customized burgundy-and-white portfolio based on the uploaded React/Vite template.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS through the CDN configuration in `index.html`
- Framer Motion
- Lucide React

The website has no database, backend, authentication, CMS, or environment variables.

## Run locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

You may also use pnpm:

```bash
pnpm install
pnpm dev
```

## Production build

```bash
npm run build
npm run preview
```

## Edit personal information

Update:

```text
data/profile.ts
```

This file contains:

- Name and professional title
- Contact links
- Skills
- Professional-focus timeline
- All project content
- Capabilities/services

## Replace the profile photo

Replace this file while keeping the same filename:

```text
public/images/hashem-profile.webp
```

Recommended ratio: `4:5`.

## Replace project images

Every project has a dedicated folder under:

```text
public/projects/
```

Each folder contains:

```text
cover.webp
screenshot-01.webp
screenshot-02.webp
screenshot-03.webp
screenshot-04.webp
```

Replace the placeholders using the same filenames. No code change is required.

See [docs/MEDIA-GUIDE.md](docs/MEDIA-GUIDE.md) for the complete folder list.

## Resume

The Download Resume buttons use:

```text
public/resume/hashem-kayyali-resume.pdf
```

The portfolio now includes both an ATS-friendly PDF and an editable Word version. Replace either file using the same filename whenever an update is needed.

## Live projects

- Eventies: https://www.eventiesjo.com/
- Glitzz Lab: https://www.glitzzlab.com/

Other projects are marked as private-source projects.

## Deploy to Vercel

1. Upload the repository to GitHub.
2. Import it in Vercel.
3. Framework preset: `Vite`.
4. Build command: `npm run build`.
5. Output directory: `dist`.

No environment variables are required.

## Responsive scaling update

The layout keeps the same burgundy-and-white visual design while scaling more naturally across screen sizes:

- Desktop sidebar: enabled from `1280px` and reduced to a compact width.
- Tablet and smaller laptops: use the slide-out navigation so the content keeps its full width.
- Hero typography, image, spacing, and buttons use responsive sizing.
- Project grids adapt from one to two to three columns based on available width.
- Content panels and project modals use smaller padding on compact screens.
- Additional height-aware scaling prevents the first screen from feeling zoomed-in on short laptop displays.

Recommended checks:

- 1920 × 1080
- 1600 × 900
- 1366 × 768
- 1024 × 768
- 768 × 1024
- 390 × 844
