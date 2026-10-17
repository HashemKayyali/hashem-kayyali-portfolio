# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: recruiters and technical hiring managers evaluating Hashem Kayyali for R&D Product Engineer and Software Engineer roles (confirmed by owner, 17 October 2026). They scan quickly, often on a phone, often in English or Arabic, and need to judge breadth, depth, ownership and credibility from real work within minutes.

Secondary: anyone following up on the work shown (product or technical conversations), reached through Contact. Not the primary target.

## Product Purpose

A personal portfolio that proves Hashem builds complete, working products across software and connected hardware. Success means a hiring reader understands the role he fits, sees authentic evidence for it, and takes the next step: opens a case study, downloads the resume, or makes contact by email or WhatsApp.

## Positioning

End-to-end product ownership from software to hardware (confirmed by owner). One engineer carries a product from requirements and system design through implementation, deployment and improvement, across web, mobile, desktop, embedded/IoT and hardware–software integration, backed by real R&D builds rather than tutorials. Every future change should protect this breadth-plus-ownership claim and its evidence.

## Operating Context

- Readers arrive from applications, LinkedIn or a shared link and land on Home (`/preview/<locale>/`); typical paths are Home → Projects → case study, Experience, Skills, Resume PDF, Contact.
- Case studies follow Problem → Product Decision → Technical Solution → Stakeholder Value → Result.
- Five locales: English, Arabic (RTL), German, French, Spanish. English and Arabic are the main review languages.
- The owner manages Gallery and Journal entries and project images/order/cover/alt text through `/preview/<locale>/admin/`. Project prose stays in code.

## Capabilities and Constraints

- React 19 / TypeScript / Vite app in `preview/`; root `App.tsx` and `sections/` are legacy.
- Eleven coded projects: Eventies, Glitzz Lab, Umniah YouthConnect, The Terminal NFC, Bike Tower, Basket Beats, VR Cycling, Bike-Land Smart Cycling Trainer, Financial Operations & Accounting System, Outreach Automation Platform, Traffic Flow Analytics Studio.
- Experience covers Eventies (Technical Lead, co-founder), Independent R&D / Software Engineering, The Terminal VR and Umniah, with all roles visible without disclosures.
- Gallery and Journal are supplementary professional evidence for the same hiring audience (confirmed by owner), not a personal or off-topic space.
- Studio backend (Supabase data, Cloudinary media, Vercel hosting) is built but not connected: no live accounts, secrets or deployment yet. Empty and read-only states are intentional until then.
- Only two projects have public live URLs; the rest are private source and must say so honestly.
- Open: production domain, deployment date and search indexing (currently noindex).

## Brand Commitments

- Name: Hashem Kayyali. Title line: "R&D Product Engineer | Software Engineer | Embedded Systems, IoT & Hardware–Software Integration". Based in Amman, Jordan.
- Voice: plain, factual, practical ("Practical products across software and connected systems."). No hype, no invented claims.
- The owner-approved identity, typography, five palette editions, smoke atmosphere, shared portrait and established motion are binding; see `design-system/hashem-portfolio-v2/MASTER.md` and `docs/design/PROJECT-HANDOFF.md`.

## Evidence on Hand

- Eleven case studies with authentic, privacy-redacted project media (`public/projects/`, `public/v2-media/`).
- Authentic company logos and the owner's R&D workspace photo (`public/experience/`).
- Resume PDF: `public/resume/hashem-kayyali-resume.pdf`.
- Portrait and factual copy in five languages (`content/master.json`, `content/locales/`).
- Absent and must not be fabricated: testimonials, client names beyond the listed employers/projects, metrics, results, certifications or deployment claims not already in the content.

## Product Principles

1. Evidence over assertion: every claim points to a real project, role or artifact.
2. Breadth is the story, depth is the proof: show the span from software to hardware, then let each case prove one slice of it.
3. Respect the hiring reader's time: the role, the evidence and the next step stay reachable within seconds on any screen.
4. Privacy is non-negotiable: redactions, private source and customer data stay protected.
5. Equal quality in every locale, including full RTL Arabic.

## Accessibility & Inclusion

Established project standard: keyboard operability, visible focus, reduced-motion alternatives, readable contrast across all five palette editions, correct RTL behaviour, and no horizontal overflow at 320, 390, 1440 and 1920 px. No formal certification is claimed.
