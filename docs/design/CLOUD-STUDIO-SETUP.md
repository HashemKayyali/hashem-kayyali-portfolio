# Cloud Studio setup —16 October2026

The approved React/Vite portfolio now includes Gallery, Journal and an admin publishing desk. The implementation is prepared for Supabase, Cloudinary and Vercel. No accounts, provider resources or deployment were created during implementation. Blank environment values deliberately produce empty public collections and a read-only setup preview; there is no simulated persistent save.

## What the desk controls

- Project image selections, their order, captions, alternative text and cover. Project facts and case-study prose remain authored in code. Disable the saved selection to restore approved built-in images.
- Journal entries: one image or video, caption, authored date, optional original LinkedIn/Instagram URL, draft/publication state and order.
- Gallery entries: image/video, optional title, caption, alternative text, project association, authored date, publication state and order.
- Shared media library: signed uploads, progress/cancellation and alternative-text editing. Removing a website record does **not** delete the Cloudinary original. Media still in use cannot be deleted from the library.

## Connect later

1. Create a Supabase project. Run `supabase/migrations/202610160001_studio.sql` in its SQL editor. It creates five RLS-enabled tables and three scoped RPCs. There are no sample posts or fabricated media records. The migration requires Supabase's existing `anon`, `authenticated` and `service_role` roles.
2. Copy `.env.example` to `.env.local`. Set `SUPABASE_URL` and the server-only `SUPABASE_SECRET_KEY` (`sb_secret_…`). The legacy `SUPABASE_SERVICE_ROLE_KEY` is supported as a fallback. Neither belongs in browser code or a `VITE_` variable.
3. Create a Cloudinary product environment. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. No unsigned upload preset is required. The server signs unique upload IDs; the browser sends file bytes directly to Cloudinary. The server verifies the signed receipt and authoritative resource metadata before registering the media.
4. Keep `ADMIN_PASSWORD=8080` as requested. Set a separate random `ADMIN_SESSION_SECRET` of at least32 characters. For example, run `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` locally and copy the result into the secret variable. Restart the development server after editing environment values.
5. Run `npm run dev:light`. Open `/preview/en/admin/` or `/preview/ar/admin/`. Check the three connection indicators, sign in, upload an image with a description, create a draft, then publish and verify the public page. Repeat with a video. Verify editing, reordering, unpublishing, deleting and restoring a project's built-in image selection.
6. When the owner creates Vercel, import this V2 repository and set the same **server-only** environment variables in the intended deployment environment. `vercel.json` selects `npm run build:light`, `dist-light-preview` and `api/studio.ts`. Set optional `VITE_SITE_URL` to the public HTTPS origin for generated metadata. No deployment has been performed here.

## Runtime boundaries

`/api/studio?action=…` uses the same Web Request/Response handler in Vite's local middleware and the Vercel Node function. JSON metadata is limited to64KB. Accepted media: JPEG/PNG/WebP up to20MB, MP4/WebM up to200MB, subject to the Cloudinary account's own limits. SVG is intentionally excluded. The browser never receives Supabase or Cloudinary secret keys.

Admin sessions use signed, expiring HttpOnly/SameSite cookies (Secure over HTTPS), same-origin mutation checks and basic in-process login throttling. This is a simple single-owner desk, not a multi-user identity service; throttling is not distributed across Vercel instances. Logout clears the browser cookie. Changing the password or session secret invalidates prior signed sessions. Do not store private screenshots or customer data in the public media library.

Public reads include only published posts/gallery and enabled project selections. Public collections currently return the first200 entries in their saved order; the admin library paginates all records. Provider errors remain visible and preserve drafts. The site retains its existing noindex review policy: hosting configuration alone does not approve search-engine launch.

## Account-dependent verification still required

The local tests exercise auth, validation, provider requests, receipt verification and error paths with controlled providers. The UI was checked locally with empty/configuration states and controlled API fixtures. The SQL migration, real Supabase permissions/RPC execution, actual Cloudinary upload/video playback and Vercel routing/runtime must be verified against the owner's accounts after connection. A successful local build does not prove those external services are configured.

Primary references: [Supabase API keys](https://supabase.com/docs/guides/api/api-keys), [Cloudinary signed uploads](https://cloudinary.com/documentation/upload_images#generating_authentication_signatures), [Vercel Node runtime](https://vercel.com/docs/functions/runtimes/node-js), [Embla React](https://www.embla-carousel.com/docs/v8/get-started/react).
