-- Import the unassigned 2027 dates supplied by the owner after 20261009_association_events_2027.sql.
-- Keep the 2026 reference names and private planning notes out of the public calendar.
-- The import marker prevents a rerun from restoring placeholders later edited or deleted in admin.
begin;
do $import$
begin
  insert into public.association_event_imports (import_key)
  values ('agenda-2027-open-slots')
  on conflict do nothing;
  if found then
    insert into public.association_events (id, title, start_date, status)
    select source.id, source.title, source.start_date, source.status
    from jsonb_to_recordset($agenda$
[
  {
    "id": "agenda-2027-source-4",
    "title": "Créneau à définir",
    "start_date": "2027-03-14",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-10",
    "title": "Créneau à définir",
    "start_date": "2027-04-04",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-12",
    "title": "Créneau à définir",
    "start_date": "2027-04-11",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-14",
    "title": "Créneau à définir",
    "start_date": "2027-04-18",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-16",
    "title": "Créneau à définir",
    "start_date": "2027-04-25",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-21",
    "title": "Créneau à définir",
    "start_date": "2027-05-09",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-23",
    "title": "Créneau à définir",
    "start_date": "2027-05-16",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-25",
    "title": "Créneau à définir",
    "start_date": "2027-05-22",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-26",
    "title": "Créneau à définir",
    "start_date": "2027-05-23",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-28",
    "title": "Créneau à définir",
    "start_date": "2027-05-30",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-30",
    "title": "Créneau à définir",
    "start_date": "2027-06-05",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-33",
    "title": "Créneau à définir",
    "start_date": "2027-06-13",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-34",
    "title": "Créneau à définir",
    "start_date": "2027-06-15",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-36",
    "title": "Créneau à définir",
    "start_date": "2027-06-19",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-37",
    "title": "Créneau à définir",
    "start_date": "2027-06-20",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-38",
    "title": "Créneau à définir",
    "start_date": "2027-06-23",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-40",
    "title": "Créneau à définir",
    "start_date": "2027-06-27",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-42",
    "title": "Créneau à définir",
    "start_date": "2027-07-03",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-56",
    "title": "Créneau à définir",
    "start_date": "2027-09-10",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-57",
    "title": "Créneau à définir",
    "start_date": "2027-09-11",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-58",
    "title": "Créneau à définir",
    "start_date": "2027-09-12",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-64",
    "title": "Créneau à définir",
    "start_date": "2027-09-26",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-65",
    "title": "Créneau à définir",
    "start_date": "2027-09-28",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-67",
    "title": "Créneau à définir",
    "start_date": "2027-10-02",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-70",
    "title": "Créneau à définir",
    "start_date": "2027-10-10",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-72",
    "title": "Créneau à définir",
    "start_date": "2027-10-17",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-74",
    "title": "Créneau à définir",
    "start_date": "2027-10-24",
    "status": "unconfirmed"
  }
]
$agenda$::jsonb)
      as source(id text, title text, start_date date, status text)
    where not exists (
      select 1 from public.association_events existing
      where existing.start_date = source.start_date
    )
    on conflict (id) do nothing;
  end if;
end;
$import$;
commit;