-- Apply after 202610160001_studio.sql. Admin security state shared by every Vercel instance:
-- distributed sign-in throttling, revocable server-side sessions and TOTP replay protection.
-- Also adds indexes for foreign keys that are checked on every media delete. No data is seeded.
begin;

create table if not exists public.studio_auth_attempts (
 key text primary key check(key='global' or key ~ '^ip:[a-f0-9]{40}$'),
 failures integer not null default 0 check(failures>=0),
 window_started_at timestamptz not null default now(),
 locked_until timestamptz
);
create table if not exists public.studio_admin_sessions (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 revoked_at timestamptz,
 check(expires_at>created_at and expires_at<=created_at+interval '9 hours')
);
create index if not exists studio_admin_sessions_active on public.studio_admin_sessions(expires_at) where revoked_at is null;
create table if not exists public.studio_admin_state (
 id boolean primary key default true check(id),
 totp_last_step bigint
);

-- Foreign-key indexes (delete restriction checks and joins).
create index if not exists studio_posts_media on public.studio_posts(media_id);
create index if not exists studio_gallery_media on public.studio_gallery(media_id);
create index if not exists studio_project_media_media on public.studio_project_media(media_id);
create index if not exists studio_media_created on public.studio_media(created_at desc,id);

-- Seconds until any of the keys unlocks; 0 means sign-in may be attempted.
create or replace function public.studio_auth_gate(p_keys text[])
returns integer language sql stable security invoker set search_path='' as $$
 select coalesce(max(ceil(extract(epoch from (a.locked_until-now()))))::integer,0)
 from public.studio_auth_attempts a where a.key=any(p_keys) and a.locked_until>now();
$$;

-- One failed attempt per key within a 15-minute window: 5 per client, 30 globally, then a 15-minute lock.
create or replace function public.studio_auth_record_failure(p_keys text[])
returns integer language plpgsql security invoker set search_path='' as $$
declare k text; current_failures integer; max_failures integer; locked integer:=0;
begin
 if p_keys is null or cardinality(p_keys) not between 1 and 4 then raise exception 'Invalid throttle keys' using errcode='22023'; end if;
 foreach k in array p_keys loop
  insert into public.studio_auth_attempts as a(key,failures,window_started_at) values(k,1,now())
  on conflict(key) do update set
   failures=case when a.window_started_at<now()-interval '15 minutes' then 1 else a.failures+1 end,
   window_started_at=case when a.window_started_at<now()-interval '15 minutes' then now() else a.window_started_at end
  returning failures into current_failures;
  -- (A CASE inside an IF condition would end the condition at its first THEN.)
  max_failures:=case when k='global' then 30 else 5 end;
  if current_failures>=max_failures then
   update public.studio_auth_attempts set locked_until=now()+interval '15 minutes' where key=k;
   locked:=900;
  end if;
 end loop;
 return locked;
end;
$$;

create or replace function public.studio_auth_reset(p_key text)
returns void language sql security invoker set search_path='' as $$
 delete from public.studio_auth_attempts where key=p_key and key<>'global';
$$;

-- Accepts a TOTP time step only if it is newer than every step used before (no code replay).
create or replace function public.studio_auth_consume_totp(p_step bigint)
returns boolean language plpgsql security invoker set search_path='' as $$
declare accepted boolean;
begin
 if p_step is null or p_step<1 then return false; end if;
 insert into public.studio_admin_state as s(id,totp_last_step) values(true,p_step)
 on conflict(id) do update set totp_last_step=excluded.totp_last_step
  where s.totp_last_step is null or s.totp_last_step<excluded.totp_last_step
 returning true into accepted;
 return coalesce(accepted,false);
end;
$$;

-- Housekeeping after a successful sign-in: expired sessions and stale throttle rows.
create or replace function public.studio_auth_prune()
returns void language sql security invoker set search_path='' as $$
 delete from public.studio_admin_sessions where expires_at<now()-interval '7 days';
 delete from public.studio_auth_attempts where window_started_at<now()-interval '1 day' and (locked_until is null or locked_until<now());
$$;

alter table public.studio_auth_attempts enable row level security;
alter table public.studio_admin_sessions enable row level security;
alter table public.studio_admin_state enable row level security;
revoke all on public.studio_auth_attempts,public.studio_admin_sessions,public.studio_admin_state from anon,authenticated;
grant select,insert,update,delete on public.studio_auth_attempts,public.studio_admin_sessions,public.studio_admin_state to service_role;
revoke all on function public.studio_auth_gate(text[]),public.studio_auth_record_failure(text[]),public.studio_auth_reset(text),public.studio_auth_consume_totp(bigint),public.studio_auth_prune() from public,anon,authenticated;
grant execute on function public.studio_auth_gate(text[]),public.studio_auth_record_failure(text[]),public.studio_auth_reset(text),public.studio_auth_consume_totp(bigint),public.studio_auth_prune() to service_role;
commit;
