# Compact portfolio and content studio — proposed design

Date: 16 October 2026 (Asia/Riyadh).
Status: owner approved the visual direction and all interface work; cloud foundation explicitly selected as Supabase + Cloudinary + Vercel on16 October2026.
Visual candidate: output/compact-studio-candidate/candidate.png (SVG source alongside it).
Recoverable checkpoint: output/checkpoints/design-intelligence-before-2026-10-15-232702.zip —888 verified files; the filename uses UTC.

## Owner intent and success

Make the existing portfolio noticeably smaller and calmer across phone, tablet in both orientations, laptop and large desktop. Preserve authentic facts, five semantic editions, existing typography, eleven coded projects, five interface locales and privacy rules. Fix the mobile engineering narrative, oversized/inconsistent career rows, excessive hero gaps, distant Skills feedback and interrupted project gallery. Replace the disliked Experience accordion/boxed-logo composition. Add public development media and authored posts, managed through a simple password-protected dashboard.

The supplied visual board demonstrates hierarchy/placement, not final interface copy or published posts. All new public content starts empty. Existing process illustrations and the owner workspace photograph appear only as clearly labelled design examples.

## Current evidence

React19 / TypeScript / Vite, GSAP and native routing. No existing CMS, administration, API or persistent media store. Node24.18 is installed. Current Home/About mobile hero is601px; About has a large unused lower region. Home career rows are116/152/116/116px at1440px and213/271/241/241px at390px. Home method image-changing timeline is enabled only by a wide media condition, and phone CSS lays all three figures beside each other above the chapters. Mobile Skills displays32 two-column tiles before the project inspector. The custom gallery has separate decode, selection, previous-image and GSAP/Flip owners.

## Shared visual rules

- Keep active semantic palettes and their persistent smoke, typography and approved assets; no new visual identity.
- Use a1240–1320px main measure, with narrow reading columns inside. Larger screens gain outer breathing room instead of enormous type.
- Scale main desktop text to18–20px, phone16–18px; section headings roughly28–38px desktop/24–30px phone. Arabic follows its existing font/line-height needs.
- Common desktop heroes aim around420–500px; phone heroes follow their content around430–500px with no forced empty lower block.320px, longer locales and enlarged text may grow naturally instead of clipping.
- Visually smaller controls:36–40px typical surface,44px effective touch hit area, compact inline arrow, consistent padding/radius. Never trade usability for tiny hit targets.
- Section padding follows24/32/40/48px tiers. Avoid blanket CSS scale/zoom and shrinking entire pages.
- Maintain visible focus, text contrast, native vertical scrolling, RTL, reduced-motion/static states, clean interruption and observer/timeline teardown.

## Home/About and added common heroes

Phone Home order: software/hardware/product eyebrow at top, centered small portrait, compact roles, centered full-width name, centered short description and two small adjacent actions. About uses the same compact portrait rhythm and removes its excessive blank height. Keep the existing live shared portrait/canvas across Home and About.

Skills and Contact gain the same smoke-backed hero family, with relevant authentic toolkit/channel artwork. Experience uses the same family with authentic unboxed company marks/workspace image and simple captions beneath. Desktop retains balanced text/visual columns; phone centers the hierarchy. Existing detail-hero composition remains protected while its gallery/body are revised.

## Home engineering narrative

Use one sticky small image beside three concise chapters on phones, matching the existing desktop's image progression. Phone hides secondary paragraph descriptions and board chrome; chapter names and tags remain. Native sticky positioning handles following the section; a single owned GSAP sequence changes the three sources as chapters pass. Avoid scroll pinning, duplicate images or three static phone thumbnails. The image remains within the method section, clears the fixed header and leaves space above the footer rule. Reduced motion still changes the readable selected chapter image without decorative movement.

## Home career preview

Four equal-height compact rows at each breakpoint. Remove the separate large index column; the order marker is a small inline label or decorative detail. Logo, company, role and dates align on a stable grid. Constrain full company and role wrapping through sufficient width and a shared row minimum, never truncate essential facts. Phone uses a consistent two-line company/role structure with date metadata below. Actual records and logos remain canonical.

## Experience replacement

Replace company-opening accordions and extra-role accordions with an always-readable compact timeline. Company/date headings and every original role, point, employment/location/mode remain available without opening one section after another. Use restrained rules, light companion role panels where useful, clearly separated Terminal roles, education/strengths/downloads in compact secondary columns.

Hero marks float directly on the smoke without framed tiles, card backgrounds or card copy. Use authentic proportion-preserving transparent brand artwork where available; retain the workspace image as a genuine photograph. Bounded GSAP staging/entrances and subtle pointer depth convey motion. No autoplay, scroll hijack or new ScrollTrigger. On phones, a small row/grid of marks supports the title without dominating the viewport.

## Skills replacement on phones

Replace the tall tile inventory with compact category chips and tool chips/rows. Selecting a tool reveals its real project links immediately within the current tool group, close to the selected tool. No offscreen inspector at the bottom, long-distance icon flight or forced scroll to another panel. Keyboard focus stays with the selected control; the result has a contextual status. Desktop may retain a smaller adjacent inspector and meaningful interactions. Keep all32 tools/five categories/four capability descriptions and source-backed skill/project matching.

## Project gallery

Adopt stable Embla Carousel8.6 React integration, the foundation used by shadcn Carousel, rather than importing an entire component framework. One owner controls slide position and selection. Use touch drag with native vertical-scroll/pinch preservation, previous/next buttons, thumbnails and keyboard/RTL. Predecode the initial/neighbor image, reserve slide geometry and avoid waiting to reconstruct the complete gallery for each click. Keep fullscreen dialog, accessible focus return, approved-media filtering and caption accuracy. Rapid input, resize, Back, locale and reduced-motion interruptions must settle correctly.

References inspected:
- https://www.embla-carousel.com/docs/v8/get-started/react
- https://www.embla-carousel.com/docs/v8/api/options
- https://ui.shadcn.com/docs/components/carousel

## Public pages

1. Gallery (/preview/<locale>/gallery/): development photos/videos in a compact responsive media grid; filters by media type/optional project; accessible lightbox with native video controls, poster and pause-on-close. Captions/title/date/alt are authored, not invented. No automatic video playback.
2. Journal (/preview/<locale>/journal/): professional media-first post cards with authentic author, authored caption, optional original LinkedIn/Instagram URL and authored date. One image/video per post initially; later extensible. Preserve line breaks, handle long captions with an accessible expansion control, no fake likes/comments/social metrics.
3. Admin (/preview/<locale>/admin/): direct administrative route; not a third public editorial page. Existing six main navigation links remain easy to use; Gallery/Journal are grouped in a compact Studio menu when needed.

Public authored captions are displayed as entered. Five interface locales do not fabricate automatic translations or claim automatic social-network synchronization.

## Approved cloud persistence (supersedes the earlier local assumption)

Supabase stores media metadata, authored posts/gallery entries and project-image overrides. Cloudinary stores and delivers image/video files. A same-origin Vercel Node Function owns admin sessions, database writes and signed Cloudinary upload intents. Files upload directly from browser to Cloudinary; they do not pass through Vercel's function request body.

The owner will create accounts later. Prepare SQL migrations, environment templates, server/client interfaces and setup instructions without creating accounts or deploying. Missing keys produce explicit setup/read-only states; no fake successful upload/save or local-storage substitute for cloud content.

Single-admin password8080 remains the requested default on the server. A separately supplied session secret is required. Supabase secret/legacy service key and Cloudinary secret stay server-only. Use the existing V2 checkout and verified889-file checkpoint ending233934 for implementation.

## Admin scope and data model

Single administrator, password8080 as explicitly requested. Password verification happens on the server; use a hashed value, HttpOnly same-site session cookie, logout/expiry, modest failed-login throttling, same-origin mutation checks and safe upload validation. No usernames/roles/MFA/account-registration system.

Three sections:
- Project media: select an existing coded project; add/replace/delete/reorder its images and choose a cover. Existing project titles/text/narratives are read-only. Deleting an image never deletes project copy or the original repository asset.
- Posts: create/edit/delete drafts, choose image/video, caption/date/original URL, preview and publish/unpublish.
- Gallery: upload photo/video, caption/alt/optional title/project association, order and publish/unpublish.

Core records:
- UploadedMedia(id, storageKey, kind, mime, width, height, size, posterKey?, createdAt).
- ProjectMedia(projectId, mediaId/source, caption?, alt?, sortOrder, isCover). Existing canonical media is a safe fallback until an override is explicitly saved.
- Post(id, caption, mediaId, authoredAt, originalUrl?, state, sortOrder).
- GalleryEntry(id, mediaId, title?, caption?, alt, projectId?, authoredAt, state, sortOrder).
- Server session records; secrets/passwords never included in public responses.

Project media overrides must reach the public cover/gallery consumers through one small shared media layer without changing canonical project prose. Preserve protected raw-source filtering. Uploaded content is published only by an explicit admin action; demo posts are never seeded.

Images: JPEG/PNG/WebP initially; videos: MP4/WebM. Clearly show format/size errors, upload progress, saved/unsaved state, failed-save retry and destructive confirmation. Keep staged media from disappearing on a failed form submit. Reordering offers buttons as an alternative to dragging. Avoid rich HTML execution in captions and arbitrary URL/filepath access.

## Implementation sequence (proposed execution plan)

1. Verify checkpoint and establish compact semantic sizes/motion/media contracts from this proposal.
2. Add focused regression probes for phone method progression, career row parity, near-selection Skills feedback, gallery interruption and durable/authenticated content writes.
3. Introduce compact shared hero/controls/layout rules; update Home/About, Skills and Contact openings with stable shared portrait/smoke ownership.
4. Implement phone method sticky board and consistent Home career rows; verify English/Arabic at320/390/768/1024/1440 before broadening.
5. Replace Experience disclosures and framed-logo hero with compact visible timeline; compare every approved source string across five locales.
6. Implement compact Skills inventory and immediate phone evidence; retain desktop keyboard/focus/reduced-motion behavior.
7. Replace custom case gallery with Embla, preserving privacy, fullscreen, keyboard, Back and captions; test all eleven cases.
8. Implement Supabase/Cloudinary/Vercel API/session/upload foundation and same-origin Vite integration; meaningful server tests mock provider boundaries and never use real accounts.
9. Add shared media reads/project-media overrides with safe canonical fallback; no authored project copy moves into the database.
10. Add Gallery/Journal public routes, empty/error/loading states and media viewer; add localized navigation/labels.
11. Implement Admin login and three editors with upload, preview, order, publish and delete flows.
12. Test save/read/edit/reorder/unpublish/delete/logout/auth failures with provider mocks, including direct video-upload contracts. Live cloud persistence remains pending real accounts and keys.
13. Run typecheck, unit/content/build checks; actual Chromium visual/interaction matrices in all five locales, English/Arabic across phone/tablet both orientations/laptop/desktop, five editions, focus/reduced motion/rapid inputs/history.
14. Correct actual findings, do a final read-only review and update MASTER/HANDOFF/verification with exact evidence and remaining environment limits.

Execute in the existing V2 checkout, preserving unrelated dirty work. No V1 writes, reset/clean/commit/push/merge/deployment. Independent task owners may be used only after this shared design/data contract is approved; shared router/styles/media integration and final live QA have one owner.

## Definition of done

- Visibly compact responsive layout; no long empty About hero or tiny unreadable text.
- Phone method has all three changing images and sticky behavior within the section.
- Four Home career rows share the appropriate responsive height without large numeric gutters.
- Experience's complete original content is readable without opening company/role accordions.
- Phone Skills feedback appears immediately beside the current selection.
- Smooth swipe/button/thumbnail gallery with no stale decode or clipped restored image.
- Gallery/Journal/Admin interfaces and tested cloud CRUD contracts operate together; explicit setup states remain until real accounts/keys and the migration are supplied. Do not claim live provider verification before that.
- No fabricated posts/metrics/claims, privacy regression, lost five-locale routes, hidden header or broken portrait continuity.
- Actual verification evidence recorded; physical devices/other browsers are not claimed as tested without evidence.
