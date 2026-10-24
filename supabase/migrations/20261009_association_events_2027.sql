-- 2027 programme supplied by the site owner. Apply after the initial association_events migration.
-- The import marker prevents a rerun from restoring competitions later removed in admin.
begin;
alter table public.association_events drop constraint if exists association_events_status_check;
alter table public.association_events add constraint association_events_status_check
  check (status in ('private', 'provisional', 'unconfirmed', 'confirmed'));
create table if not exists public.association_event_imports (
  import_key text primary key,
  imported_at timestamptz not null default now()
);
alter table public.association_event_imports enable row level security;
revoke all on table public.association_event_imports from public, anon, authenticated;
grant select, insert on table public.association_event_imports to service_role;
do $import$
begin
  insert into public.association_event_imports (import_key)
  values ('agenda-2027-owner-file')
  on conflict do nothing;
  if found then
    insert into public.association_events (id, title, start_date, end_date, note, status)
    select source.id, source.title, source.start_date, source.end_date, source.note, source.status
    from jsonb_to_recordset($agenda$[
  {
    "id": "agenda-2027-source-5",
    "start_date": "2027-03-18",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-6",
    "start_date": "2027-03-21",
    "title": "Goltechnic",
    "status": "provisional"
  },
  {
    "id": "agenda-2027-source-7",
    "start_date": "2027-03-25",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-8",
    "start_date": "2027-03-28",
    "title": "Goltechnic",
    "status": "provisional"
  },
  {
    "id": "agenda-2027-source-9",
    "start_date": "2027-04-01",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-11",
    "start_date": "2027-04-08",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-13",
    "start_date": "2027-04-15",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-15",
    "start_date": "2027-04-22",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-17",
    "start_date": "2027-04-29",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-18",
    "start_date": "2027-05-01",
    "title": "Grand Prix Marcilly",
    "status": "provisional"
  },
  {
    "id": "agenda-2027-source-19",
    "start_date": "2027-05-02",
    "title": "Grand Prix Marcilly",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-20",
    "start_date": "2027-05-06",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-22",
    "start_date": "2027-05-13",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-24",
    "start_date": "2027-05-20",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-27",
    "start_date": "2027-05-27",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-29",
    "start_date": "2027-06-03",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-31",
    "start_date": "2027-06-06",
    "title": "Coupe TLM",
    "status": "provisional"
  },
  {
    "id": "agenda-2027-source-32",
    "start_date": "2027-06-10",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-35",
    "start_date": "2027-06-17",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-39",
    "start_date": "2027-06-24",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-41",
    "start_date": "2027-07-01",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-43",
    "start_date": "2027-07-04",
    "title": "Coupe TLM",
    "status": "provisional"
  },
  {
    "id": "agenda-2027-source-44",
    "start_date": "2027-07-08",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-45",
    "start_date": "2027-07-15",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-46",
    "start_date": "2027-07-22",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-47",
    "start_date": "2027-07-29",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-48",
    "start_date": "2027-08-05",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-49",
    "start_date": "2027-08-12",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-50",
    "start_date": "2027-08-19",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-51",
    "start_date": "2027-08-26",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-52",
    "start_date": "2027-09-02",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-53",
    "start_date": "2027-09-05",
    "title": "Trophée Seniors",
    "status": "provisional"
  },
  {
    "id": "agenda-2027-source-54",
    "start_date": "2027-09-06",
    "title": "Trophée Seniors",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-55",
    "start_date": "2027-09-09",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-59",
    "start_date": "2027-09-16",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-60",
    "start_date": "2027-09-18",
    "title": "Grand Prix Jeunes Marcilly",
    "status": "provisional"
  },
  {
    "id": "agenda-2027-source-61",
    "start_date": "2027-09-19",
    "title": "Grand Prix Jeunes Marcilly",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-62",
    "start_date": "2027-09-23",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-63",
    "start_date": "2027-09-25",
    "title": "Ligue circuit inter départemental",
    "status": "confirmed"
  },
  {
    "id": "agenda-2027-source-66",
    "start_date": "2027-09-30",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-68",
    "start_date": "2027-10-03",
    "title": "Coupe Octobre Rose",
    "status": "confirmed",
    "note": "scramble à 2"
  },
  {
    "id": "agenda-2027-source-69",
    "start_date": "2027-10-07",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-71",
    "start_date": "2027-10-14",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-73",
    "start_date": "2027-10-21",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-75",
    "start_date": "2027-10-28",
    "title": "Coupe de Classement",
    "status": "unconfirmed"
  },
  {
    "id": "agenda-2027-source-76",
    "start_date": "2027-11-07",
    "title": "Bregent / Bergerie",
    "status": "confirmed",
    "note": "scramble à 4"
  },
  {
    "id": "agenda-2027-source-77",
    "start_date": "2027-11-21",
    "title": "Coupe Beaujolais",
    "status": "confirmed",
    "note": "scramble à 2"
  }
]
$agenda$::jsonb) as source(id text, title text, start_date date, end_date date, note text, status text)
    where not exists (
      select 1 from public.association_events existing
      where existing.start_date = source.start_date and existing.title = source.title
    )
    on conflict (id) do nothing;
  end if;
end;
$import$;
notify pgrst, 'reload schema';
commit;