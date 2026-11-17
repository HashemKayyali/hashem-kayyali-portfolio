-- Portfolio analytics. Privacy: no IP, no user agent, no raw referrer URL is stored.
-- Access model: RLS on, no policies, no table grants. Only two SECURITY DEFINER functions are callable by anon.

create table public.analytics_events (
  id          uuid primary key,                       -- client-generated: idempotency key
  ts          timestamptz not null default now(),     -- server clock only
  day         date not null,                          -- Asia/Amman calendar day
  visitor_id  text not null check (visitor_id ~ '^[a-f0-9-]{36}$'),
  session_id  text not null check (session_id ~ '^[a-f0-9-]{36}$'),
  path        text not null check (path ~ '^/[A-Za-z0-9/_.~%-]{0,199}$'),
  project     text check (project ~ '^[a-z0-9-]{1,60}$'),
  source      text not null check (char_length(source) between 1 and 60),
  country     text check (country ~ '^[A-Z]{2}$'),
  device      text not null check (device in ('desktop','mobile','tablet')),
  lang        text not null check (lang ~ '^[a-z]{2,3}$')
);
create index analytics_events_day_idx on public.analytics_events (day);
create index analytics_events_visitor_ts_idx on public.analytics_events (visitor_id, ts desc);
create index analytics_events_ts_idx on public.analytics_events (ts desc);

alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from anon, authenticated, public;

create or replace function public.track_event(
  p_id uuid, p_visitor text, p_session text, p_path text, p_project text,
  p_source text, p_country text, p_device text, p_lang text
) returns boolean
language plpgsql security definer set search_path = '' as $$
declare inserted int;
begin
  -- abuse controls: per visitor and global, evaluated on server time
  if (select count(*) from public.analytics_events where visitor_id = p_visitor and ts > now() - interval '1 minute') >= 40 then return false; end if;
  if (select count(*) from public.analytics_events where ts > now() - interval '1 minute') >= 1500 then return false; end if;
  insert into public.analytics_events (id, day, visitor_id, session_id, path, project, source, country, device, lang)
  values (p_id, (now() at time zone 'Asia/Amman')::date, p_visitor, p_session, p_path, nullif(p_project,''),
          p_source, nullif(p_country,''), p_device, p_lang)
  on conflict (id) do nothing;
  get diagnostics inserted = row_count;
  -- retention without cron: ~1% of writes prune rows older than 400 days
  if random() < 0.01 then delete from public.analytics_events where ts < now() - interval '400 days'; end if;
  return inserted = 1;
end $$;

create or replace function public.insights_summary(p_from date, p_to date)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  today date := (now() at time zone 'Asia/Amman')::date;
  wk date := date_trunc('week', now() at time zone 'Asia/Amman')::date;
  mo date := date_trunc('month', now() at time zone 'Asia/Amman')::date;
  f date := greatest(p_from, today - 400);
  t date := least(p_to, today);
  single boolean := (p_from = p_to);
  r jsonb;
begin
  if p_from > p_to then raise exception 'invalid range'; end if;
  if p_to - p_from > 366 then raise exception 'range too large'; end if;
  select jsonb_build_object(
    'generated_at', now(),
    'timezone', 'Asia/Amman',
    'today', (select jsonb_build_object('visitors', count(distinct visitor_id), 'sessions', count(distinct session_id), 'views', count(*)) from public.analytics_events where day = today),
    'week',  (select jsonb_build_object('visitors', count(distinct visitor_id)) from public.analytics_events where day >= wk),
    'month', (select jsonb_build_object('visitors', count(distinct visitor_id)) from public.analytics_events where day >= mo),
    'range', (select jsonb_build_object('visitors', count(distinct visitor_id), 'sessions', count(distinct session_id), 'views', count(*)) from public.analytics_events where day between f and t),
    'series', coalesce((select jsonb_agg(x order by x->>'k') from (
        select jsonb_build_object('k', case when single then lpad(extract(hour from ts at time zone 'Asia/Amman')::text,2,'0') else day::text end,
               'visitors', count(distinct visitor_id), 'sessions', count(distinct session_id), 'views', count(*)) x
        from public.analytics_events where day between f and t
        group by case when single then lpad(extract(hour from ts at time zone 'Asia/Amman')::text,2,'0') else day::text end) s), '[]'::jsonb),
    'pages',     coalesce((select jsonb_agg(jsonb_build_object('k', path, 'n', n)) from (select path, count(*) n from public.analytics_events where day between f and t group by path order by n desc limit 10) q), '[]'::jsonb),
    'projects',  coalesce((select jsonb_agg(jsonb_build_object('k', project, 'n', n)) from (select project, count(*) n from public.analytics_events where day between f and t and project is not null group by project order by n desc limit 10) q), '[]'::jsonb),
    'sources',   coalesce((select jsonb_agg(jsonb_build_object('k', source, 'n', n)) from (select source, count(distinct session_id) n from public.analytics_events where day between f and t group by source order by n desc limit 10) q), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(jsonb_build_object('k', country, 'n', n)) from (select country, count(distinct visitor_id) n from public.analytics_events where day between f and t and country is not null group by country order by n desc limit 10) q), '[]'::jsonb),
    'devices',   coalesce((select jsonb_agg(jsonb_build_object('k', device, 'n', n)) from (select device, count(distinct visitor_id) n from public.analytics_events where day between f and t group by device order by n desc) q), '[]'::jsonb),
    'langs',     coalesce((select jsonb_agg(jsonb_build_object('k', lang, 'n', n)) from (select lang, count(distinct visitor_id) n from public.analytics_events where day between f and t group by lang order by n desc limit 10) q), '[]'::jsonb),
    'usage', jsonb_build_object('rows', (select count(*) from public.analytics_events), 'db_bytes', pg_database_size(current_database()))
  ) into r;
  return r;
end $$;

revoke all on function public.track_event(uuid,text,text,text,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.insights_summary(date,date) from public, anon, authenticated;
grant execute on function public.track_event(uuid,text,text,text,text,text,text,text,text) to anon;
grant execute on function public.insights_summary(date,date) to anon;
