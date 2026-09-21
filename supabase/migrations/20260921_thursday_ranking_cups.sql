-- Add Thursday ranking cups only on days without an existing competition.
insert into public.association_events (id, title, start_date)
select 'coupe-classement-' || to_char(day, 'YYYY-MM-DD'),
       'Coupe de Classement', day::date
from generate_series(timestamp '2026-09-24', timestamp '2026-10-29', interval '7 days') as dates(day)
where not exists (
  select 1 from public.association_events existing
  where day::date between existing.start_date and coalesce(existing.end_date, existing.start_date)
)
on conflict (id) do nothing;
