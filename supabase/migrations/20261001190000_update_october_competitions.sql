begin;

insert into public.association_events (id, title, start_date, end_date, start_time, note, status)
values
  ('2026-10-10-triangulaire-jeunes', 'Triangulaire Jeunes', date '2026-10-10', null, null, null, null),
  ('2026-10-15-50', 'Finale Amicale Séniors', date '2026-10-15', null, null, null, null),
  ('2026-10-17-competition-chic', 'Compétition Chic', date '2026-10-17', null, null, null, null),
  ('2026-10-18-51', 'Coupe de Classement', date '2026-10-18', null, null, null, null),
  ('2026-10-25-coupe-classement', 'Coupe de Classement', date '2026-10-25', null, null, null, null)
on conflict (id) do update set
  title = excluded.title,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  start_time = excluded.start_time,
  note = excluded.note,
  status = excluded.status;

commit;
