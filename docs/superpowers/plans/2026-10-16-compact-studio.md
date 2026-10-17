# Compact portfolio and cloud studio implementation plan

> Required execution skills: superpowers:dispatching-parallel-agents for disjoint page owners; superpowers:subagent-driven-development for task review and final integration. Owner has approved the visual candidate and all changes. Do not request another design approval.

Goal: deliver the compact approved portfolio plus prepared Supabase/Cloudinary/Vercel content studio without accounts or deployment.
Spec: docs/design/COMPACT-STUDIO-PROPOSAL.md.
Stack: existing React19/TS/Vite/GSAP; stable Embla8.6 for the gallery; native server fetch/crypto for provider interfaces. No Next.js migration.
Checkpoint: output/checkpoints/design-intelligence-before-2026-10-15-233934.zip,889 verified files.

Shared design: five existing semantic palettes/fonts/authentic assets;1240–1320px content measure; roughly16–18px phone body,18–20px desktop; visibly36–40px controls with44px effective touch areas; content-driven compact heroes, no clipping/zoom scaling; no fabricated claims/posts. No new ScrollTrigger. V1 read-only; no commit/reset/clean/push/merge/deployment.

## File ownership and interfaces

TaskA/Home owner: EngineeringHome/HomeStory and owned motion/CSS; AboutDossier opening only; SharedHeroPortrait/AppAtmosphere; new CompactHero.tsx and compact-layout.css. CompactHero signature: React.FC<{eyebrow:string;title:string;description?:string;visual?:React.ReactNode;actions?:React.ReactNode;className?:string;children?:React.ReactNode}>; DOM .compact-hero > .compact-hero-copy and .compact-hero-visual. No main landmark inside it. Owner imports its CSS in its module. Compact-layout CSS is imported LAST by root. Expose .compact-hero geometry so atmosphere measures it. Shared Home/About photo node stays mounted. Do not touch router/client/server.

TaskB/Profile owner: ExperienceJourney.tsx/css/motion and SkillsWorkbench.tsx/css/motion only. Consume CompactHero. Always-visible Experience roles and unboxed marks; compact Skills with immediately adjacent phone evidence. Preserve all source strings/tool matching. No live browser use while root operates it.

TaskC/Studio UI owner: new preview/studio-client.ts,studio-copy.ts,StudioProvider.tsx,StudioPages.tsx,StudioAdmin.tsx,studio.css. Consume studio/contracts.ts and CompactHero. Export StudioGallery({route,navigate}),StudioJournal({route,navigate}),StudioAdmin({route,navigate}),StudioProvider and useStudioContent(). Root owns route/navbar integration. Empty/error/setup/read-only states honest; no mocked published posts persisted. Status/admin GET may be absent during implementation; handle errors.

Root: server/studio/*, api/studio.ts, supabase/migrations/*, .env.example/docs, Vite dev bridge, gallery Embla replacement and integration files routes/PageShell/main/LightPortfolio/metadata/prerender/media override consumers. Only root owns live browser/final global build.

Shared DTOs/actions: studio/contracts.ts. Endpoint /api/studio?action=... with actions status,session,public,items,reorder,project-media,upload-sign,upload-register. Session GET/POST/DELETE; items GET/POST/PATCH/DELETE using resource posts|gallery|media and id; project-media GET/PUT with project_id; reorder POST {resource,id,direction:'up'|'down'} (legacy bulk IDs remain supported); signed file upload goes directly to supplied Cloudinary URL then upload-register POST verifies receipt/provider metadata.

## Tasks and proof

- [x]1. Root: write failing API/auth/upload/validation tests; implement contracts, configuration, sessions, Supabase adapter/migration, Cloudinary signing and same-origin API. Missing config writes503, public empty/configuredfalse; unknown tables/input rejected; secrets never returned.
- [x]2. Home owner: compact responsive rhythm, centered phone heroes, phone sticky three-image narrative, equal compact career rows. Verify focused geometry at320/390/768/1024/1440 en/ar; preserve copy/theme/shared portrait.
- [x]3. Profile owner: always-visible factual career timeline and compact Skills with near-selection results. Verify source retention and keyboard/reduced/rapid interaction.
- [x]4. Studio owner: five-locale Gallery/Journal/Admin UI plus typed client/provider, direct upload progress, CRUD/order/publish/delete, setup preview when absent config. No false success.
- [x]5. Root: Embla case gallery with decoded neighbors, keyboard/RTL/fullscreen/history; retain approved hero composition and privacy.
- [x]6. Integrate routes/menu/metadata/provider/canonical image fallbacks and Skills/Contact heroes; task reviews then address findings.
- [x]7. Actual UI matrices, palette/focus/mobile landscape, route/image/history, API missing-config and mocked provider flows; typecheck/unit/content/build; independent read-only final review, documentation and residual account-dependent checks.

Review focus: resize/Back/locale teardown; mobile result proximity; sticky board exit bounds; equal career rows with long locales; uploading video bypasses function body; unauthenticated/cross-origin writes fail; forged provider receipts/URLs rejected; drafts never public; project override updates atomic; absent accounts never fake persistence.

Ruling: independent page files may proceed in parallel after the now-approved shared visual/data contract. No shared Git worktree creation is needed; preserve the running user's checkout with verified checkpoint. No account creation or external writes are part of this execution.
