begin;

create table if not exists public.site_analytics_page_views (
  event_id uuid primary key,
  occurred_at timestamptz not null default now(),
  day date not null default (timezone('Europe/Paris', now())::date),
  visitor_id uuid not null,
  visit_id uuid not null,
  path text not null check (length(path) between 1 and 300 and left(path, 1) = '/')
);
create index if not exists site_analytics_views_day_idx on public.site_analytics_page_views (day, path);
create index if not exists site_analytics_views_visitor_idx on public.site_analytics_page_views (day, visitor_id);
create index if not exists site_analytics_views_visit_idx on public.site_analytics_page_views (day, visit_id);

create table if not exists public.site_analytics_logins (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  day date not null default (timezone('Europe/Paris', now())::date),
  account_id text,
  source text not null check (source in ('shared_admin', 'named_account'))
);
create index if not exists site_analytics_logins_day_idx on public.site_analytics_logins (day, account_id);

create table if not exists public.site_analytics_maintenance (
  id boolean primary key default true check (id),
  last_cleanup timestamptz not null default '-infinity'::timestamptz
);
insert into public.site_analytics_maintenance (id) values (true) on conflict do nothing;

alter table public.site_analytics_page_views enable row level security;
alter table public.site_analytics_logins enable row level security;
alter table public.site_analytics_maintenance enable row level security;
revoke all on public.site_analytics_page_views, public.site_analytics_logins, public.site_analytics_maintenance from public, anon, authenticated;
grant select, insert, delete on public.site_analytics_page_views, public.site_analytics_logins to service_role;
grant select, update on public.site_analytics_maintenance to service_role;

create or replace function public.site_analytics_cleanup(retention_days integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  if retention_days < 30 or retention_days > 730 then raise exception 'Invalid retention'; end if;
  if exists (select 1 from site_analytics_maintenance where id = true and last_cleanup < now() - interval '1 day') then
    update site_analytics_maintenance set last_cleanup = now() where id = true and last_cleanup < now() - interval '1 day';
    if found then
      delete from site_analytics_page_views where occurred_at < now() - make_interval(days => retention_days);
      delete from site_analytics_logins where occurred_at < now() - make_interval(days => retention_days);
    end if;
  end if;
end $$;
revoke all on function public.site_analytics_cleanup(integer) from public, anon, authenticated;
grant execute on function public.site_analytics_cleanup(integer) to service_role;

create or replace function public.site_analytics_report(start_day date, end_day date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare result jsonb;
begin
  if start_day is null or end_day is null or end_day < start_day or end_day - start_day > 365 then
    raise exception 'Invalid date range';
  end if;
  with bounds as (
    select start_day as a, end_day as b, start_day - (end_day - start_day + 1) as prior_a, start_day - 1 as prior_b
  ), metrics as (
    select
      (select count(distinct visitor_id) from site_analytics_page_views v, bounds where v.day between a and b) as visitors,
      (select count(distinct visit_id) from site_analytics_page_views v, bounds where v.day between a and b) as visits,
      (select count(*) from site_analytics_page_views v, bounds where v.day between a and b) as views,
      (select count(distinct visitor_id) from site_analytics_page_views v, bounds where v.day between prior_a and prior_b) as prior_visitors,
      (select count(distinct visit_id) from site_analytics_page_views v, bounds where v.day between prior_a and prior_b) as prior_visits,
      (select count(*) from site_analytics_page_views v, bounds where v.day between prior_a and prior_b) as prior_views,
      (select count(*) from site_analytics_logins l, bounds where l.day between a and b) as logins,
      (select count(distinct account_id) from site_analytics_logins l, bounds where l.day between a and b and account_id is not null) as accounts,
      (select count(*) from site_analytics_logins l, bounds where l.day between prior_a and prior_b) as prior_logins,
      (select count(distinct account_id) from site_analytics_logins l, bounds where l.day between prior_a and prior_b and account_id is not null) as prior_accounts
  ), series as (
    select d::date as day,
      (select count(distinct visitor_id) from site_analytics_page_views where day = d::date) as visitors,
      (select count(distinct visit_id) from site_analytics_page_views where day = d::date) as visits,
      (select count(*) from site_analytics_page_views where day = d::date) as views
    from generate_series(start_day, end_day, interval '1 day') d
  ), pages as (
    select path, count(*) as views, count(distinct visitor_id) as visitors
    from site_analytics_page_views where day between start_day and end_day
    group by path order by views desc, visitors desc, path limit 100
  ), sections as (
    select case when path = '/' then 'Accueil' else split_part(trim(leading '/' from path), '/', 1) end as section,
      count(*) as views, count(distinct visitor_id) as visitors
    from site_analytics_page_views where day between start_day and end_day
    group by 1 order by views desc, visitors desc, section limit 100
  )
  select jsonb_build_object(
    'current', (select to_jsonb(metrics) - 'prior_visitors' - 'prior_visits' - 'prior_views' - 'prior_logins' - 'prior_accounts' from metrics),
    'previous', (select jsonb_build_object('visitors',prior_visitors,'visits',prior_visits,'views',prior_views,'logins',prior_logins,'accounts',prior_accounts) from metrics),
    'series', coalesce((select jsonb_agg(to_jsonb(series) order by day) from series), '[]'::jsonb),
    'pages', coalesce((select jsonb_agg(to_jsonb(pages) order by views desc, visitors desc, path) from pages), '[]'::jsonb),
    'sections', coalesce((select jsonb_agg(to_jsonb(sections) order by views desc, visitors desc, section) from sections), '[]'::jsonb),
    'since', (select min(day) from site_analytics_page_views)
  ) into result;
  return result;
end $$;
revoke all on function public.site_analytics_report(date, date) from public, anon, authenticated;
grant execute on function public.site_analytics_report(date, date) to service_role;

notify pgrst, 'reload schema';
commit;
