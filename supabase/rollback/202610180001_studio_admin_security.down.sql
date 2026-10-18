-- Rollback for 202610180001_studio_admin_security.sql. Removes admin security state only
-- (sign-in throttle, sessions, TOTP replay); content tables are untouched. Admin sign-in fails
-- closed until the migration is re-applied.
begin;
drop function if exists public.studio_auth_prune();
drop function if exists public.studio_auth_consume_totp(bigint);
drop function if exists public.studio_auth_reset(text);
drop function if exists public.studio_auth_record_failure(text[]);
drop function if exists public.studio_auth_gate(text[]);
drop table if exists public.studio_admin_state;
drop table if exists public.studio_admin_sessions;
drop table if exists public.studio_auth_attempts;
drop index if exists public.studio_posts_media;
drop index if exists public.studio_gallery_media;
drop index if exists public.studio_project_media_media;
drop index if exists public.studio_media_created;
commit;
