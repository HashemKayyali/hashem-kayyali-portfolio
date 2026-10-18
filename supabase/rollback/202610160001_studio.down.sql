-- Rollback for 202610160001_studio.sql. DESTRUCTIVE: deletes every Studio record (posts, gallery,
-- project overrides and the media registry). Cloudinary originals are not touched. Export first:
--   select * from public.studio_media; (and the other four tables)
-- Roll back 202610180001 first.
begin;
drop function if exists public.studio_move_item(text,uuid,text);
drop function if exists public.studio_reorder_items(text,uuid[]);
drop function if exists public.studio_replace_project_media(text,boolean,jsonb);
drop table if exists public.studio_project_media;
drop table if exists public.studio_project_overrides;
drop table if exists public.studio_gallery;
drop table if exists public.studio_posts;
drop function if exists public.studio_touch_updated_at();
drop table if exists public.studio_media;
commit;
