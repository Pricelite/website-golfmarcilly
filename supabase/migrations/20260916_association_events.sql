-- Create and seed once. Re-running never restores deleted competitions.
begin;
do $migration$
begin
  if to_regclass('public.association_events') is null then
    create table public.association_events (
      id text primary key check (id ~ '^[a-zA-Z0-9-]{1,80}$'),
      title text not null check (char_length(btrim(title)) between 1 and 160),
      start_date date not null check (start_date between date '1900-01-01' and date '2199-12-31'),
      end_date date check (end_date >= start_date and end_date <= date '2199-12-31'),
      start_time time check (start_time < time '24:00:00'),
      note text check (char_length(note) <= 2000),
      status text check (status in ('private', 'provisional')),
      created_at timestamptz not null default now()
    );
    insert into public.association_events (id, title, start_date, end_date, start_time, note, status)
    select id, title, "start"::date, "end"::date, "time"::time, note, status
    from jsonb_to_recordset($seed$[
  {
    "start": "2026-03-15",
    "title": "Coupe SweetSpot",
    "note": "Scramble à 2",
    "id": "2026-03-15-0"
  },
  {
    "start": "2026-03-22",
    "title": "Coupe de Classement",
    "id": "2026-03-22-1"
  },
  {
    "start": "2026-03-28",
    "title": "Coupe de Classement Pitch & Putt",
    "id": "2026-03-28-2"
  },
  {
    "start": "2026-03-29",
    "title": "Coupe de Classement",
    "id": "2026-03-29-3"
  },
  {
    "start": "2026-03-31",
    "title": "Coupe de Printemps 1",
    "note": "Ringer score",
    "id": "2026-03-31-4"
  },
  {
    "start": "2026-04-02",
    "title": "Coupe de Classement",
    "id": "2026-04-02-5"
  },
  {
    "start": "2026-04-04",
    "title": "Coupe de Classement Pitch & Putt",
    "id": "2026-04-04-6"
  },
  {
    "start": "2026-04-05",
    "title": "Coupe de Classement",
    "id": "2026-04-05-7"
  },
  {
    "start": "2026-04-07",
    "title": "Coupe de Printemps 2",
    "note": "Ringer score",
    "id": "2026-04-07-8"
  },
  {
    "start": "2026-04-09",
    "title": "Coupe de Classement",
    "id": "2026-04-09-9"
  },
  {
    "start": "2026-04-10",
    "title": "After Work",
    "time": "16:00",
    "note": "9 trous + brasero, à partir de 16 h.",
    "id": "2026-04-10-10"
  },
  {
    "start": "2026-04-11",
    "title": "Coupe de Classement Pitch & Putt",
    "id": "2026-04-11-11"
  },
  {
    "start": "2026-04-12",
    "title": "Coupe Citya",
    "id": "2026-04-12-12"
  },
  {
    "start": "2026-04-14",
    "title": "Coupe de Printemps 3",
    "note": "Ringer score",
    "id": "2026-04-14-13"
  },
  {
    "start": "2026-04-16",
    "title": "Coupe de Classement",
    "id": "2026-04-16-14"
  },
  {
    "start": "2026-04-18",
    "title": "Coupe de Classement Pitch & Putt",
    "id": "2026-04-18-15"
  },
  {
    "start": "2026-04-19",
    "title": "Coupe de Classement",
    "id": "2026-04-19-16"
  },
  {
    "start": "2026-04-21",
    "title": "Coupe de Printemps 4",
    "note": "Ringer score",
    "id": "2026-04-21-17"
  },
  {
    "start": "2026-04-23",
    "title": "Coupe Amical Séniors",
    "id": "2026-04-23-18"
  },
  {
    "start": "2026-04-24",
    "title": "After Work",
    "time": "16:00",
    "note": "9 trous + brasero, à partir de 16 h.",
    "id": "2026-04-24-19"
  },
  {
    "start": "2026-04-25",
    "title": "Coupe de Classement Pitch & Putt",
    "id": "2026-04-25-20"
  },
  {
    "start": "2026-04-26",
    "title": "Coupe Rothary",
    "id": "2026-04-26-21"
  },
  {
    "start": "2026-04-28",
    "title": "Coupe de Printemps 5",
    "note": "Ringer score",
    "id": "2026-04-28-22"
  },
  {
    "start": "2026-05-02",
    "end": "2026-05-03",
    "title": "Grand Prix Marcilly",
    "id": "2026-05-02-23"
  },
  {
    "start": "2026-05-07",
    "title": "Coupe de Classement",
    "id": "2026-05-07-24"
  },
  {
    "start": "2026-05-10",
    "title": "Coupe de Classement",
    "id": "2026-05-10-25"
  },
  {
    "start": "2026-05-14",
    "title": "Coupe Eden Park",
    "id": "2026-05-14-26"
  },
  {
    "start": "2026-05-17",
    "title": "Coupe de Classement",
    "id": "2026-05-17-27"
  },
  {
    "start": "2026-05-23",
    "end": "2026-05-24",
    "title": "Trophée SAFTI – ACE TRANS",
    "id": "2026-05-23-28"
  },
  {
    "start": "2026-05-31",
    "title": "Coupe Menuiserie GODEL et RENOV’ CENTRE",
    "id": "2026-05-31-29"
  },
  {
    "start": "2026-06-04",
    "title": "Compétition Amicale Séniors",
    "id": "2026-06-04-30"
  },
  {
    "start": "2026-06-06",
    "title": "Coupe WAGC",
    "id": "2026-06-06-31"
  },
  {
    "start": "2026-06-07",
    "title": "Coupe TLM",
    "id": "2026-06-07-32"
  },
  {
    "start": "2026-06-11",
    "title": "Coupe de Classement",
    "id": "2026-06-11-33"
  },
  {
    "start": "2026-06-14",
    "title": "Coupe Maserati",
    "id": "2026-06-14-34"
  },
  {
    "start": "2026-06-16",
    "title": "Pro Am de Marcilly",
    "id": "2026-06-16-35"
  },
  {
    "start": "2026-06-18",
    "title": "Coupe de Classement",
    "id": "2026-06-18-36"
  },
  {
    "start": "2026-06-20",
    "title": "Coupe KIA",
    "id": "2026-06-20-37"
  },
  {
    "start": "2026-06-21",
    "title": "Coupe de Classement",
    "id": "2026-06-21-38"
  },
  {
    "start": "2026-06-24",
    "title": "Compétition golf entreprise",
    "id": "2026-06-24-39"
  },
  {
    "start": "2026-06-25",
    "title": "Coupe de Classement",
    "id": "2026-06-25-40"
  },
  {
    "start": "2026-06-28",
    "title": "Coupe Crit",
    "id": "2026-06-28-41"
  },
  {
    "start": "2026-07-04",
    "title": "Compétition Golf entreprise",
    "id": "2026-07-04-42"
  },
  {
    "start": "2026-09-11",
    "title": "AVC Sécurité",
    "status": "private",
    "id": "2026-09-11-43"
  },
  {
    "start": "2026-09-12",
    "end": "2026-09-13",
    "title": "Championnat du Club",
    "id": "2026-09-12-44"
  },
  {
    "start": "2026-09-18",
    "end": "2026-09-20",
    "title": "Grand Prix Jeunes Marcilly",
    "id": "2026-09-18-45"
  },
  {
    "start": "2026-09-26",
    "title": "Coupe Chic",
    "id": "2026-09-26-46"
  },
  {
    "start": "2026-10-03",
    "title": "Compétition Golf Entreprise",
    "id": "2026-10-03-47"
  },
  {
    "start": "2026-10-04",
    "title": "Coupe Octobre Rose",
    "id": "2026-10-04-48"
  },
  {
    "start": "2026-10-11",
    "title": "Coupe Equip Jardin",
    "id": "2026-10-11-49"
  },
  {
    "start": "2026-10-15",
    "title": "Compétition Amicale Séniors",
    "id": "2026-10-15-50"
  },
  {
    "start": "2026-10-18",
    "title": "Coupe Soditra",
    "status": "provisional",
    "note": "Épreuve indiquée en option dans le programme.",
    "id": "2026-10-18-51"
  },
  {
    "start": "2026-11-08",
    "title": "Bregent / Bergerie",
    "id": "2026-11-08-52"
  },
  {
    "start": "2026-11-22",
    "title": "Coupe Beaujolais",
    "id": "2026-11-22-53"
  }
]$seed$::jsonb)
    as seed(id text, title text, "start" text, "end" text, "time" text, note text, status text);
  end if;
end;
$migration$;
create index if not exists association_events_start_date_idx on public.association_events(start_date, id);
alter table public.association_events enable row level security;
-- Only the server service role can access the table. No public write policy.
revoke all on table public.association_events from public, anon, authenticated;
grant select, insert, update, delete on table public.association_events to service_role;
notify pgrst, 'reload schema';
commit;
