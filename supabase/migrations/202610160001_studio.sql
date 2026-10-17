-- Apply once in Supabase SQL Editor. No seed posts, gallery entries or credentials.
begin;
create table if not exists public.studio_media (
 id uuid primary key default gen_random_uuid(),
 public_id text not null unique check(public_id ~ '^portfolio/studio/[a-f0-9-]{36}$'),
 kind text not null check(kind in ('image','video')),
 url text not null check(url like 'https://res.cloudinary.com/%'),
 poster_url text,
 width integer not null check(width between 1 and 32768),
 height integer not null check(height between 1 and 32768),
 bytes bigint not null check(bytes>0 and bytes<=209715200),
 format text not null check(format in ('jpg','jpeg','png','webp','mp4','webm')),
 alt text not null default '' check(length(alt)<=2000),
 created_at timestamptz not null default now()
);
create table if not exists public.studio_posts (
 id uuid primary key default gen_random_uuid(),
 media_id uuid not null references public.studio_media(id) on delete restrict,
 caption text not null check(length(caption) between 1 and 10000),
 authored_at timestamptz not null default now(),
 source_url text check(source_url is null or source_url ~ '^https://([a-zA-Z0-9-]+\.)*(linkedin\.com|instagram\.com)/'),
 published boolean not null default false,
 sort_order integer not null default 0 check(sort_order between 0 and 1000000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.studio_gallery (
 id uuid primary key default gen_random_uuid(),
 media_id uuid not null references public.studio_media(id) on delete restrict,
 title text not null default '' check(length(title)<=300),
 caption text not null default '' check(length(caption)<=10000),
 alt text not null default '' check(length(alt)<=2000),
 project_id text check(project_id is null or project_id in ('eventies','bike-tower','basket-beats','terminal-nfc','glitzz-lab','vr-cycling','bike-land-trainer','umniah-youthconnect','financial-operations','outreach-automation','traffic-flow-analytics')),
 authored_at timestamptz not null default now(),
 published boolean not null default false,
 sort_order integer not null default 0 check(sort_order between 0 and 1000000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.studio_project_overrides (
 project_id text primary key check(project_id in ('eventies','bike-tower','basket-beats','terminal-nfc','glitzz-lab','vr-cycling','bike-land-trainer','umniah-youthconnect','financial-operations','outreach-automation','traffic-flow-analytics')),
 enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
create table if not exists public.studio_project_media (
 project_id text not null references public.studio_project_overrides(project_id) on delete cascade,
 media_id uuid not null references public.studio_media(id) on delete restrict,
 caption text not null default '' check(length(caption)<=2000),
 alt text not null default '' check(length(alt)<=2000),
 is_cover boolean not null default false,
 sort_order integer not null check(sort_order between 0 and 100),
 primary key(project_id,media_id)
);
create unique index if not exists studio_one_project_cover on public.studio_project_media(project_id) where is_cover;
create index if not exists studio_posts_published on public.studio_posts(published,sort_order,authored_at);
create index if not exists studio_gallery_published on public.studio_gallery(published,sort_order,authored_at);
create or replace function public.studio_touch_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now();return new;end;
$$;
drop trigger if exists studio_posts_updated on public.studio_posts;
create trigger studio_posts_updated before update on public.studio_posts for each row execute function public.studio_touch_updated_at();
drop trigger if exists studio_gallery_updated on public.studio_gallery;
create trigger studio_gallery_updated before update on public.studio_gallery for each row execute function public.studio_touch_updated_at();

-- One transaction replaces the image override: no partial delete/save window.
create or replace function public.studio_replace_project_media(p_project_id text,p_enabled boolean,p_items jsonb)
returns void language plpgsql security invoker set search_path='' as $$
declare total integer; valid integer;
begin
 if p_project_id is null or p_project_id not in ('eventies','bike-tower','basket-beats','terminal-nfc','glitzz-lab','vr-cycling','bike-land-trainer','umniah-youthconnect','financial-operations','outreach-automation','traffic-flow-analytics')
  or p_enabled is null or p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)>100 then
  raise exception 'Invalid project media' using errcode='22023';
 end if;
 total=jsonb_array_length(p_items);
 select count(*) into valid from jsonb_to_recordset(p_items) as x(media_id uuid,alt text,is_cover boolean)
 join public.studio_media m on m.id=x.media_id and m.kind='image'
 where x.is_cover is not null and (not p_enabled or length(trim(coalesce(nullif(x.alt,''),m.alt)))>0);
 if valid<>total or (select count(distinct x.media_id) from jsonb_to_recordset(p_items) as x(media_id uuid))<>total
  or (select count(*) from jsonb_to_recordset(p_items) as x(is_cover boolean) where x.is_cover)>1 then
  raise exception 'Choose unique accessible uploaded project images' using errcode='22023';
 end if;
 insert into public.studio_project_overrides(project_id,enabled,updated_at) values(p_project_id,p_enabled,now())
 on conflict(project_id) do update set enabled=excluded.enabled,updated_at=now();
 delete from public.studio_project_media where project_id=p_project_id;
 insert into public.studio_project_media(project_id,media_id,caption,alt,is_cover,sort_order)
 select p_project_id,(entry.value->>'media_id')::uuid,coalesce(entry.value->>'caption',''),coalesce(entry.value->>'alt',''),(entry.value->>'is_cover')::boolean,entry.ordinality-1
 from jsonb_array_elements(p_items) with ordinality as entry(value,ordinality);
end;
$$;
create or replace function public.studio_reorder_items(p_resource text,p_ids uuid[])
returns void language plpgsql security invoker set search_path='' as $$
declare target text;total integer;
begin
 if p_resource is null or p_resource not in ('posts','gallery') or p_ids is null or cardinality(p_ids) not between 1 and 200
  or (select count(distinct id) from unnest(p_ids) as id)<>cardinality(p_ids) then
  raise exception 'Invalid display order' using errcode='22023';
 end if;
 target=case when p_resource='posts' then 'studio_posts' else 'studio_gallery' end;
 execute format('select count(*) from public.%I where id=any($1)',target) into total using p_ids;
 if total<>cardinality(p_ids) then raise exception 'Missing ordered item' using errcode='22023';end if;
 execute format('update public.%I t set sort_order=s.position-1 from unnest($1) with ordinality s(id,position) where t.id=s.id',target) using p_ids;
end;
$$;

-- Adjacent moves normalize the real complete order atomically, even beyond200records.
create or replace function public.studio_move_item(p_resource text,p_id uuid,p_direction text)
returns void language plpgsql security invoker set search_path='' as $$
declare target text;ids uuid[];position integer;neighbor integer;swap uuid;
begin
 if p_resource is null or p_resource not in ('posts','gallery') or p_direction is null or p_direction not in ('up','down') or p_id is null then
  raise exception 'Invalid display move' using errcode='22023';
 end if;
 target=case when p_resource='posts' then 'studio_posts' else 'studio_gallery' end;
 perform pg_advisory_xact_lock(hashtext('studio-order:'||target));
 execute format('select array_agg(id order by sort_order,authored_at desc,id) from public.%I',target) into ids;
 position=array_position(ids,p_id);
 if position is null then raise exception 'Missing ordered item' using errcode='22023';end if;
 neighbor=position+case when p_direction='up' then -1 else 1 end;
 if neighbor between 1 and cardinality(ids) then swap=ids[position];ids[position]=ids[neighbor];ids[neighbor]=swap;end if;
 execute format('update public.%I t set sort_order=s.position-1 from unnest($1) with ordinality s(id,position) where t.id=s.id',target) using ids;
end;
$$;

-- Browser roles cannot access these tables directly; the authenticated Node API
-- uses a server-only secret key and explicitly filters public reads.
alter table public.studio_media enable row level security;
alter table public.studio_posts enable row level security;
alter table public.studio_gallery enable row level security;
alter table public.studio_project_overrides enable row level security;
alter table public.studio_project_media enable row level security;
revoke all on public.studio_media,public.studio_posts,public.studio_gallery,public.studio_project_overrides,public.studio_project_media from anon,authenticated;
grant select,insert,update,delete on public.studio_media,public.studio_posts,public.studio_gallery,public.studio_project_overrides,public.studio_project_media to service_role;
revoke all on function public.studio_replace_project_media(text,boolean,jsonb),public.studio_reorder_items(text,uuid[]),public.studio_move_item(text,uuid,text) from public,anon,authenticated;
grant execute on function public.studio_replace_project_media(text,boolean,jsonb),public.studio_reorder_items(text,uuid[]),public.studio_move_item(text,uuid,text) to service_role;
commit;
