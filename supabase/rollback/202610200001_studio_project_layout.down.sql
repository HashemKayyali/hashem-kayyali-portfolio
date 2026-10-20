-- Rollback for 202610200001_studio_project_layout.sql. Removes the saved order/visibility of bundled
-- originals and the hidden flag of uploads; project uploads themselves stay in studio_project_media.
-- Projects saved with the new editor then read as legacy overrides (uploads only). Export first:
--   select * from public.studio_project_builtin_media;
begin;
drop function if exists public.studio_save_project_layout(text,jsonb);
drop table if exists public.studio_project_builtin_media;
alter table public.studio_project_media drop column if exists hidden;
commit;
