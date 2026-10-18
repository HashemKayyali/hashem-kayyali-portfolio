# Cloud Studio setup — revised 18 October 2026

The portfolio includes Gallery, Journal and an admin publishing desk prepared for Supabase (data), Cloudinary (media) and Vercel (hosting, already live). **No Supabase project or Cloudinary resources exist yet.** Blank environment values produce empty public collections and a read-only admin setup screen; nothing is ever simulated as saved.

Engineering readiness, findings and test evidence: [`docs/engineering/PRE-INTEGRATION-READINESS.md`](../engineering/PRE-INTEGRATION-READINESS.md).

## What the desk controls

- Project image selections: order, captions, alternative text and cover. Project facts and case-study prose stay in code. Disabling a selection restores the built-in images.
- Journal entries: one image or video, caption, date, optional original LinkedIn/Instagram URL, draft/published state and order.
- Gallery entries: image or video, title, caption, alternative text, project, date, publication state and order.
- Shared media library: signed uploads with progress and cancellation, alternative-text editing. Media still in use cannot be deleted. **Deleting a website record keeps the Cloudinary original, which stays reachable by its URL**: see "Privacy" below.

## Admin security model (no default password)

| Setting | Purpose |
| --- | --- |
| `ADMIN_PASSWORD_HASH` | scrypt hash of the admin password. Created locally with `npm run studio:password`, which refuses weak passwords. The plaintext password is never stored. A plaintext `ADMIN_PASSWORD` variable is refused (admin stays disabled while it exists). |
| `ADMIN_SESSION_SECRET` | 32+ varied characters. Signs session cookies and upload receipts. Rotating it signs out every session. |
| `ADMIN_TOTP_SECRET` | Authenticator (TOTP) secret. **Required in production** (`VERCEL_ENV=production`); optional locally. Codes cannot be reused. |
| Database | Required for admin: sessions (revocable logout, "sign out everywhere") and sign-in throttling are stored in Supabase so they work across every Vercel instance. |

Throttling: 5 failed sign-ins per client in 15 minutes, or 30 across all clients, lock sign-in for 15 minutes (a correct password is refused while locked). Client IPs are stored only as keyed hashes. If you lock yourself out, wait 15 minutes, or run `delete from public.studio_auth_attempts;` in the Supabase SQL editor.

Recovery: if the password or authenticator is lost, generate new values with `npm run studio:password -- --session --totp`, replace them in Vercel and redeploy. That also signs out all existing sessions.

## Connect, in this order

1. **Generate admin credentials locally:** `npm run studio:password -- --session --totp`. Add the TOTP secret to an authenticator app. Keep the printed values out of chat, email and the repository.
2. **Supabase.** Create the project (region close to Vercel's). In the SQL editor run, in order:
   1. `supabase/migrations/202610160001_studio.sql`
   2. `supabase/migrations/202610180001_studio_admin_security.sql`

   Then verify in the SQL editor:
   - `select relname, relrowsecurity from pg_class where relname like 'studio_%' and relkind='r';` should list 8 tables, all `true`.
   - `select has_table_privilege('anon','public.studio_posts','select');` should return `false`.
   - `select proname, prosecdef from pg_proc where proname like 'studio_%';` should list 9 functions, all `false`.

   The same checks run locally against PostgreSQL 17 with `npm install --no-save @electric-sql/pglite@0.3 && node supabase/tests/migration-contract.mjs` (73 checks, including both rollbacks).
3. **Cloudinary.** Create a product environment. Under Settings → Security, keep "Strict transformations" off (the site requests `f_auto,q_auto,w_…` derivatives). No unsigned upload preset is needed. Optional: set an account-level upload limit at or below 20 MB for images and 200 MB for video.
4. **Local trial** (`.env.local`, never committed): `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (`sb_secret_…`), `CLOUDINARY_*`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, optionally `ADMIN_TOTP_SECRET`. Run `npm run dev`, open `/en/admin/`, and follow the acceptance checklist below.
5. **Vercel.** Add the same server-only variables to the **Production** environment (plus `ADMIN_TOTP_SECRET`). Never prefix them with `VITE_`. Redeploy, then repeat the acceptance checklist on `https://hashemkayyali.com/en/admin/`.

## Acceptance checklist (real accounts)

- [ ] Status shows Database, Media storage and Admin session available; the missing list is empty.
- [ ] A wrong password and a wrong code are refused; 5 failures lock sign-in; sign-in works after the lock.
- [ ] Sign in, then "Sign out": the old session no longer works. "Sign out everywhere" ends a second browser's session.
- [ ] Upload a JPEG, PNG and WebP with alternative text, then an MP4. Each appears in the library with the right size and format.
- [ ] Upload a file over the limit (or rename an SVG): it is refused and removed from Cloudinary (check Media Library).
- [ ] Create a Journal draft: it is not visible on `/en/journal/`. Publish it: it appears within about a minute (edge cache) and immediately for the signed-in admin.
- [ ] Reorder, unpublish and delete entries; deleting media still in use is refused.
- [ ] Set a project image selection with a cover, check the Projects page and case study, then disable it to restore the built-in images.
- [ ] `GET /api/studio?action=public` returns only published content and no secret values.

## Runtime boundaries

`/api/studio?action=…` runs the same Web Request/Response handler in Vite (local) and as a Vercel function. JSON metadata is limited to 64 KB. Accepted media: JPEG/PNG/WebP up to 20 MB, MP4/WebM up to 200 MB; SVG is excluded. The browser never receives Supabase or Cloudinary secrets. Public content is cached at Vercel's edge for 60 seconds (stale-while-revalidate 5 minutes). Studio images are delivered as `f_auto,q_auto` width-limited derivatives with `srcset`.

## Privacy

Uploaded media uses Cloudinary's public `upload` delivery type: anyone with a URL can open it, even after the website record is deleted. Do not upload private screenshots, customer data or unredacted documents. If removal must be guaranteed, delete the asset in Cloudinary as well.

## Rollback

`supabase/rollback/202610180001_studio_admin_security.down.sql` removes only the admin security state, so admin fails closed. `supabase/rollback/202610160001_studio.down.sql` is **destructive** (it deletes every Studio record): export first. Code rollback: redeploy the previous Vercel deployment or revert the commit.
