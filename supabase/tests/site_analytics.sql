-- À exécuter sur staging après la migration. Toutes les données de test sont annulées.
begin;

insert into public.site_analytics_page_views (event_id, day, visitor_id, visit_id, path) values
  ('10000000-0000-4000-8000-000000000001', '2001-01-01', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '/restaurant'),
  ('10000000-0000-4000-8000-000000000002', '2001-01-01', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '/'),
  ('10000000-0000-4000-8000-000000000003', '2001-01-01', '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '/restaurant'),
  ('10000000-0000-4000-8000-000000000004', '2000-12-31', '20000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', '/tarifs');
insert into public.site_analytics_page_views (event_id, day, visitor_id, visit_id, path)
values ('10000000-0000-4000-8000-000000000001', '2001-01-01', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '/restaurant')
on conflict (event_id) do nothing;

insert into public.site_analytics_logins (id, day, account_id, source) values
  ('40000000-0000-4000-8000-000000000001', '2001-01-01', 'test-account', 'named_account'),
  ('40000000-0000-4000-8000-000000000002', '2001-01-01', 'test-account', 'named_account'),
  ('40000000-0000-4000-8000-000000000003', '2001-01-01', null, 'shared_admin');

do $$
declare report jsonb;
begin
  report := public.site_analytics_report('2001-01-01', '2001-01-01');
  if report #>> '{current,views}' <> '3' or report #>> '{current,visitors}' <> '2'
    or report #>> '{current,visits}' <> '2' or report #>> '{current,logins}' <> '3'
    or report #>> '{current,accounts}' <> '1' or report #>> '{previous,views}' <> '1' then
    raise exception 'Incorrect analytics totals: %', report;
  end if;
  if report #>> '{pages,0,path}' <> '/restaurant' or report #>> '{pages,0,visitors}' <> '2'
    or report #>> '{sections,0,section}' <> 'restaurant' or report #>> '{sections,0,visitors}' <> '2' then
    raise exception 'Incorrect page or section ranking: %', report;
  end if;
  if has_table_privilege('anon', 'public.site_analytics_page_views', 'SELECT')
    or has_table_privilege('authenticated', 'public.site_analytics_logins', 'SELECT')
    or has_function_privilege('anon', 'public.site_analytics_report(date,date)', 'EXECUTE') then
    raise exception 'Analytics grants are too broad';
  end if;
end $$;

rollback;
