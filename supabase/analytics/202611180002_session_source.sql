-- A session keeps the source of its first event, so "Traffic Sources" counts each session once.
create or replace function public.track_event(
  p_id uuid, p_visitor text, p_session text, p_path text, p_project text,
  p_source text, p_country text, p_device text, p_lang text
) returns boolean
language plpgsql security definer set search_path = '' as $$
declare inserted int; src text;
begin
  if (select count(*) from public.analytics_events where visitor_id = p_visitor and ts > now() - interval '1 minute') >= 40 then return false; end if;
  if (select count(*) from public.analytics_events where ts > now() - interval '1 minute') >= 1500 then return false; end if;
  select source into src from public.analytics_events where session_id = p_session order by ts limit 1;
  insert into public.analytics_events (id, day, visitor_id, session_id, path, project, source, country, device, lang)
  values (p_id, (now() at time zone 'Asia/Amman')::date, p_visitor, p_session, p_path, nullif(p_project,''),
          coalesce(src, p_source), nullif(p_country,''), p_device, p_lang)
  on conflict (id) do nothing;
  get diagnostics inserted = row_count;
  if random() < 0.01 then delete from public.analytics_events where ts < now() - interval '400 days'; end if;
  return inserted = 1;
end $$;
