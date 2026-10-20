-- Additive: a managed project gallery keeps the bundled originals and adds Studio uploads.
-- Nothing is dropped or rewritten. Existing overrides (no original rows) keep their legacy meaning
-- until the owner next saves that project. Apply once in Supabase SQL Editor; safe to re-run.
begin;
alter table public.studio_project_media add column if not exists hidden boolean not null default false;
create table if not exists public.studio_project_builtin_media (
 project_id text not null references public.studio_project_overrides(project_id) on delete cascade,
 source text not null check(source ~ '^/(covers|projects)/[a-z0-9-]+(/[a-z0-9-]+)?\.webp$'),
 caption text not null default '' check(length(caption)<=2000),
 alt text not null default '' check(length(alt)<=2000),
 is_cover boolean not null default false,
 hidden boolean not null default false check(not(hidden and is_cover)),
 sort_order integer not null check(sort_order between 0 and 100),
 primary key(project_id,source)
);
create unique index if not exists studio_one_builtin_cover on public.studio_project_builtin_media(project_id) where is_cover;

-- One transaction saves the whole ordered gallery (originals and uploads share one order).
-- The API also checks each original against the project's coded media list.
create or replace function public.studio_save_project_layout(p_project_id text,p_items jsonb)
returns void language plpgsql security invoker set search_path='' as $$
declare total integer;
begin
 if p_project_id is null or p_project_id not in ('eventies','bike-tower','basket-beats','terminal-nfc','glitzz-lab','vr-cycling','bike-land-trainer','umniah-youthconnect','financial-operations','outreach-automation','traffic-flow-analytics')
  or p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 100 then
  raise exception 'Invalid project layout' using errcode='22023';
 end if;
 total=jsonb_array_length(p_items);
 if exists(select 1 from jsonb_array_elements(p_items) e where jsonb_typeof(e)<>'object' or (e ? 'source')=(e ? 'media_id')
   or coalesce(jsonb_typeof(e->'is_cover'),'')<>'boolean' or coalesce(jsonb_typeof(e->'hidden'),'')<>'boolean'
   or ((e->>'is_cover')::boolean and (e->>'hidden')::boolean))
  or (select count(*) from jsonb_array_elements(p_items) e where (e->>'is_cover')::boolean)>1
  or not exists(select 1 from jsonb_array_elements(p_items) e where not (e->>'hidden')::boolean)
  or (select count(distinct coalesce('b:'||(e->>'source'),'m:'||(e->>'media_id'))) from jsonb_array_elements(p_items) e)<>total then
  raise exception 'Choose one visible cover and unique project images' using errcode='22023';
 end if;
 -- Uploads must be registered images; visible ones need alternative text.
 if (select count(*) from jsonb_array_elements(p_items) e join public.studio_media m on m.id=(e->>'media_id')::uuid and m.kind='image'
     where (e->>'hidden')::boolean or length(trim(coalesce(nullif(e->>'alt',''),m.alt)))>0)
  <>(select count(*) from jsonb_array_elements(p_items) e where e ? 'media_id') then
  raise exception 'Choose uploaded images with alternative text' using errcode='22023';
 end if;
 insert into public.studio_project_overrides(project_id,enabled,updated_at) values(p_project_id,true,now())
 on conflict(project_id) do update set enabled=true,updated_at=now();
 delete from public.studio_project_media where project_id=p_project_id;
 delete from public.studio_project_builtin_media where project_id=p_project_id;
 insert into public.studio_project_media(project_id,media_id,caption,alt,is_cover,hidden,sort_order)
 select p_project_id,(e.value->>'media_id')::uuid,coalesce(e.value->>'caption',''),coalesce(e.value->>'alt',''),(e.value->>'is_cover')::boolean,(e.value->>'hidden')::boolean,e.ordinality-1
 from jsonb_array_elements(p_items) with ordinality as e(value,ordinality) where e.value ? 'media_id';
 insert into public.studio_project_builtin_media(project_id,source,caption,alt,is_cover,hidden,sort_order)
 select p_project_id,e.value->>'source',coalesce(e.value->>'caption',''),coalesce(e.value->>'alt',''),(e.value->>'is_cover')::boolean,(e.value->>'hidden')::boolean,e.ordinality-1
 from jsonb_array_elements(p_items) with ordinality as e(value,ordinality) where e.value ? 'source';
end;
$$;

alter table public.studio_project_builtin_media enable row level security;
revoke all on public.studio_project_builtin_media from anon,authenticated;
grant select,insert,update,delete on public.studio_project_builtin_media to service_role;
revoke all on function public.studio_save_project_layout(text,jsonb) from public,anon,authenticated;
grant execute on function public.studio_save_project_layout(text,jsonb) to service_role;
commit;
