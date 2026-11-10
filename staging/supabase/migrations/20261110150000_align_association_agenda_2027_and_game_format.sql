-- Align the 2027 calendar with the owner's Agenda_competitions_2027.html.
-- Replace only events starting in 2027; 2026 rows remain untouched.
-- A one-time marker prevents later admin edits from being overwritten on rerun.
begin;

alter table public.association_events add column if not exists game_format text;
alter table public.association_events add column if not exists game_format_detail text;
alter table public.association_events drop constraint if exists association_events_game_format_check;
alter table public.association_events add constraint association_events_game_format_check
  check (game_format is null or game_format in ('score_max', 'scramble_2', 'scramble_4', 'other'));
alter table public.association_events drop constraint if exists association_events_game_format_detail_check;
alter table public.association_events add constraint association_events_game_format_detail_check
  check (game_format_detail is null or char_length(game_format_detail) <= 160);

do $sync$
begin
  insert into public.association_event_imports (import_key)
  values ('agenda-2027-owner-html-20261110') on conflict do nothing;
  if found then
    create temporary table agenda_2027_source on commit drop as
    select source.id, source.title, source.start_date, source.end_date, source.note,
           source.status, source.category, source.zone, source.game_format
    from jsonb_to_recordset($agenda$[
  {
    "id": "agenda-2027-source-4",
    "title": "Créneau à définir",
    "start_date": "2027-03-14",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe SweetSpot",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-5",
    "title": "Coupe de Classement",
    "start_date": "2027-03-18",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-6",
    "title": "Goltechnic",
    "start_date": "2027-03-21",
    "end_date": null,
    "note": "otpion attente",
    "status": "provisional",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-7",
    "title": "Coupe de Classement",
    "start_date": "2027-03-25",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-8",
    "title": "Goltechnic",
    "start_date": "2027-03-28",
    "end_date": null,
    "note": "otpion attente",
    "status": "provisional",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-9",
    "title": "Coupe de Classement",
    "start_date": "2027-04-01",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-10",
    "title": "Créneau à définir",
    "start_date": "2027-04-04",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe de Classement",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-11",
    "title": "Coupe de Classement",
    "start_date": "2027-04-08",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-12",
    "title": "Créneau à définir",
    "start_date": "2027-04-11",
    "end_date": null,
    "note": "mail le 05/10/2026\nRéférence 2026 (non reconduite automatiquement) : Coupe Citya",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-13",
    "title": "Coupe de Classement",
    "start_date": "2027-04-15",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-14",
    "title": "Créneau à définir",
    "start_date": "2027-04-18",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe de Classement",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-15",
    "title": "Coupe de Classement",
    "start_date": "2027-04-22",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-16",
    "title": "Créneau à définir",
    "start_date": "2027-04-25",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe Rothary",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-17",
    "title": "Coupe de Classement",
    "start_date": "2027-04-29",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-18",
    "title": "Grand Prix Marcilly",
    "start_date": "2027-05-01",
    "end_date": null,
    "note": "option",
    "status": "provisional",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-19",
    "title": "Grand Prix Marcilly",
    "start_date": "2027-05-02",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-20",
    "title": "Coupe de Classement",
    "start_date": "2027-05-06",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-21",
    "title": "Créneau à définir",
    "start_date": "2027-05-09",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe de Classement",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-22",
    "title": "Coupe de Classement",
    "start_date": "2027-05-13",
    "end_date": null,
    "note": "mail le 05/10/2026",
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-23",
    "title": "Créneau à définir",
    "start_date": "2027-05-16",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe de Classement",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-24",
    "title": "Coupe de Classement",
    "start_date": "2027-05-20",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-25",
    "title": "Créneau à définir",
    "start_date": "2027-05-22",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Trophée SAFTI - ACE TRANS",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-26",
    "title": "Créneau à définir",
    "start_date": "2027-05-23",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Trophée SAFTI - ACE TRANS",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-27",
    "title": "Coupe de Classement",
    "start_date": "2027-05-27",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-28",
    "title": "Créneau à définir",
    "start_date": "2027-05-30",
    "end_date": null,
    "note": "mail le 05/10/2026\nRéférence 2026 (non reconduite automatiquement) : Coupe Menuiserie GODEL et RENOV' CENTRE",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-29",
    "title": "Coupe de Classement",
    "start_date": "2027-06-03",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-30",
    "title": "Créneau à définir",
    "start_date": "2027-06-05",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe WAGC",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-31",
    "title": "Coupe TLM",
    "start_date": "2027-06-06",
    "end_date": null,
    "note": "option",
    "status": "provisional",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-32",
    "title": "Coupe de Classement",
    "start_date": "2027-06-10",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-33",
    "title": "Créneau à définir",
    "start_date": "2027-06-13",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe Maserati",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-34",
    "title": "Créneau à définir",
    "start_date": "2027-06-15",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Pro Am de Marcilly",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-35",
    "title": "Coupe de Classement",
    "start_date": "2027-06-17",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-36",
    "title": "Créneau à définir",
    "start_date": "2027-06-19",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe KIA",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-37",
    "title": "Créneau à définir",
    "start_date": "2027-06-20",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe de Classement",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-38",
    "title": "Créneau à définir",
    "start_date": "2027-06-23",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Compétition Golf Entreprise",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-39",
    "title": "Coupe de Classement",
    "start_date": "2027-06-24",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-40",
    "title": "Créneau à définir",
    "start_date": "2027-06-27",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe Crit",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-41",
    "title": "Coupe de Classement",
    "start_date": "2027-07-01",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-42",
    "title": "Créneau à définir",
    "start_date": "2027-07-03",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Compétition Golf Entreprise",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-43",
    "title": "Coupe TLM",
    "start_date": "2027-07-04",
    "end_date": null,
    "note": "option",
    "status": "provisional",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-44",
    "title": "Coupe de Classement",
    "start_date": "2027-07-08",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-45",
    "title": "Coupe de Classement",
    "start_date": "2027-07-15",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-46",
    "title": "Coupe de Classement",
    "start_date": "2027-07-22",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-47",
    "title": "Coupe de Classement",
    "start_date": "2027-07-29",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-48",
    "title": "Coupe de Classement",
    "start_date": "2027-08-05",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-49",
    "title": "Coupe de Classement",
    "start_date": "2027-08-12",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-50",
    "title": "Coupe de Classement",
    "start_date": "2027-08-19",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-51",
    "title": "Coupe de Classement",
    "start_date": "2027-08-26",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-52",
    "title": "Coupe de Classement",
    "start_date": "2027-09-02",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-53",
    "title": "Trophée Seniors",
    "start_date": "2027-09-05",
    "end_date": null,
    "note": "option",
    "status": "provisional",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-54",
    "title": "Trophée Seniors",
    "start_date": "2027-09-06",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-55",
    "title": "Coupe de Classement",
    "start_date": "2027-09-09",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-56",
    "title": "Créneau à définir",
    "start_date": "2027-09-10",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : AVC Sécurité",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-57",
    "title": "Créneau à définir",
    "start_date": "2027-09-11",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Championnat du Club Golf Plus",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-58",
    "title": "Créneau à définir",
    "start_date": "2027-09-12",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Championnat du Club Golf Plus",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-59",
    "title": "Coupe de Classement",
    "start_date": "2027-09-16",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-60",
    "title": "Grand Prix Jeunes Marcilly",
    "start_date": "2027-09-18",
    "end_date": null,
    "note": "option",
    "status": "provisional",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-61",
    "title": "Grand Prix Jeunes Marcilly",
    "start_date": "2027-09-19",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-62",
    "title": "Coupe de Classement",
    "start_date": "2027-09-23",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-63",
    "title": "Ligue circuit inter départemental",
    "start_date": "2027-09-25",
    "end_date": null,
    "note": null,
    "status": "confirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-64",
    "title": "Créneau à définir",
    "start_date": "2027-09-26",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe de Classement",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-65",
    "title": "Créneau à définir",
    "start_date": "2027-09-28",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Nana's Cup",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-66",
    "title": "Coupe de Classement",
    "start_date": "2027-09-30",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-67",
    "title": "Créneau à définir",
    "start_date": "2027-10-02",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Compétition Golf Entreprise",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-68",
    "title": "Coupe Octobre Rose",
    "start_date": "2027-10-03",
    "end_date": null,
    "note": "scramble a 2",
    "status": "confirmed",
    "category": "competition",
    "zone": "all",
    "game_format": "scramble_2"
  },
  {
    "id": "agenda-2027-source-69",
    "title": "Coupe de Classement",
    "start_date": "2027-10-07",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-70",
    "title": "Créneau à définir",
    "start_date": "2027-10-10",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe Equip Jardin",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-71",
    "title": "Coupe de Classement",
    "start_date": "2027-10-14",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-72",
    "title": "Créneau à définir",
    "start_date": "2027-10-17",
    "end_date": null,
    "note": "Référence 2026 (non reconduite automatiquement) : Coupe Soditra/Sodilloc",
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-73",
    "title": "Coupe de Classement",
    "start_date": "2027-10-21",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-74",
    "title": "Créneau à définir",
    "start_date": "2027-10-24",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "open_slot",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-75",
    "title": "Coupe de Classement",
    "start_date": "2027-10-28",
    "end_date": null,
    "note": null,
    "status": "unconfirmed",
    "category": "competition",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-source-76",
    "title": "Bregent / Bergerie",
    "start_date": "2027-11-07",
    "end_date": null,
    "note": "scramble a 4",
    "status": "confirmed",
    "category": "competition",
    "zone": "all",
    "game_format": "scramble_4"
  },
  {
    "id": "agenda-2027-source-77",
    "title": "Coupe Beaujolais",
    "start_date": "2027-11-21",
    "end_date": null,
    "note": "scramble a 2",
    "status": "confirmed",
    "category": "competition",
    "zone": "all",
    "game_format": "scramble_2"
  },
  {
    "id": "agenda-2027-cal-74",
    "title": "Jour de l’An",
    "start_date": "2027-01-01",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "holiday",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-75",
    "title": "Lundi de Pâques",
    "start_date": "2027-03-29",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "holiday",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-76",
    "title": "Fête du Travail",
    "start_date": "2027-05-01",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "holiday",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-77",
    "title": "Ascension",
    "start_date": "2027-05-06",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "holiday",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-78",
    "title": "Victoire 1945",
    "start_date": "2027-05-08",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "holiday",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-79",
    "title": "Lundi de Pentecôte",
    "start_date": "2027-05-17",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "holiday",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-80",
    "title": "Fête nationale",
    "start_date": "2027-07-14",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "holiday",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-81",
    "title": "Assomption",
    "start_date": "2027-08-15",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "holiday",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-82",
    "title": "Toussaint",
    "start_date": "2027-11-01",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "holiday",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-83",
    "title": "Armistice 1918",
    "start_date": "2027-11-11",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "holiday",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-84",
    "title": "Noël",
    "start_date": "2027-12-25",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "holiday",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-85",
    "title": "Épiphanie",
    "start_date": "2027-01-06",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "celebration",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-86",
    "title": "Chandeleur",
    "start_date": "2027-02-02",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "celebration",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-87",
    "title": "Mardi gras",
    "start_date": "2027-02-09",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "celebration",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-88",
    "title": "Saint-Valentin",
    "start_date": "2027-02-14",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "celebration",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-89",
    "title": "Pâques",
    "start_date": "2027-03-28",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "celebration",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-90",
    "title": "Pentecôte",
    "start_date": "2027-05-16",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "celebration",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-91",
    "title": "Fête des mères",
    "start_date": "2027-05-30",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "celebration",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-92",
    "title": "Fête des pères",
    "start_date": "2027-06-20",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "celebration",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-93",
    "title": "Fête de la musique",
    "start_date": "2027-06-21",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "celebration",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-94",
    "title": "Halloween",
    "start_date": "2027-10-31",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "celebration",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-95",
    "title": "Vacances d’hiver · A",
    "start_date": "2027-02-13",
    "end_date": "2027-02-28",
    "note": null,
    "status": null,
    "category": "vacation",
    "zone": "A",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-96",
    "title": "Vacances de printemps · A",
    "start_date": "2027-04-10",
    "end_date": "2027-04-25",
    "note": null,
    "status": null,
    "category": "vacation",
    "zone": "A",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-97",
    "title": "Vacances d’hiver · B",
    "start_date": "2027-02-20",
    "end_date": "2027-03-07",
    "note": null,
    "status": null,
    "category": "vacation",
    "zone": "B",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-98",
    "title": "Vacances de printemps · B",
    "start_date": "2027-04-17",
    "end_date": "2027-05-02",
    "note": null,
    "status": null,
    "category": "vacation",
    "zone": "B",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-99",
    "title": "Vacances d’hiver · C",
    "start_date": "2027-02-06",
    "end_date": "2027-02-21",
    "note": null,
    "status": null,
    "category": "vacation",
    "zone": "C",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-100",
    "title": "Vacances de printemps · C",
    "start_date": "2027-04-03",
    "end_date": "2027-04-18",
    "note": null,
    "status": null,
    "category": "vacation",
    "zone": "C",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-101",
    "title": "Vacances de Noël (suite)",
    "start_date": "2027-01-01",
    "end_date": "2027-01-03",
    "note": null,
    "status": null,
    "category": "vacation",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-102",
    "title": "Vacances d’été",
    "start_date": "2027-07-03",
    "end_date": "2027-09-01",
    "note": null,
    "status": null,
    "category": "vacation",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-103",
    "title": "Vacances de la Toussaint",
    "start_date": "2027-10-23",
    "end_date": "2027-11-07",
    "note": null,
    "status": null,
    "category": "vacation",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-104",
    "title": "Vacances de Noël",
    "start_date": "2027-12-18",
    "end_date": "2028-01-02",
    "note": null,
    "status": null,
    "category": "vacation",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-105",
    "title": "Pont scolaire de l’Ascension",
    "start_date": "2027-05-07",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "vacation",
    "zone": "all",
    "game_format": null
  },
  {
    "id": "agenda-2027-cal-106",
    "title": "Rentrée scolaire",
    "start_date": "2027-09-02",
    "end_date": null,
    "note": null,
    "status": null,
    "category": "celebration",
    "zone": "all",
    "game_format": null
  }
]$agenda$::jsonb) as source(
      id text, title text, start_date date, end_date date, note text,
      status text, category text, zone text, game_format text
    );

    insert into public.association_events
      (id, title, start_date, end_date, note, status, category, zone, game_format)
    select source.id, source.title, source.start_date, source.end_date, source.note,
           source.status, source.category, source.zone, source.game_format
    from agenda_2027_source source
    on conflict (id) do update set
      title = excluded.title, start_date = excluded.start_date, end_date = excluded.end_date,
      start_time = null, note = excluded.note, status = excluded.status, category = excluded.category,
      zone = excluded.zone, game_format = excluded.game_format, game_format_detail = null
    where public.association_events.start_date >= date '2027-01-01'
      and public.association_events.start_date < date '2028-01-01';

    delete from public.association_events existing
    where existing.start_date >= date '2027-01-01'
      and existing.start_date < date '2028-01-01'
      and not exists (
        select 1 from agenda_2027_source source where source.id = existing.id
      );
  end if;
end $sync$;

commit;
