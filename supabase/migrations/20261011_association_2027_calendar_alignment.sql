-- Align the owner's 2027 programme and import editable calendar markers.
-- Apply after 20261009_association_events_2027.sql and 20261010_association_2027_open_slots.sql.
-- Conditional corrections leave entries changed in admin untouched. The marker prevents re-import on rerun.
begin;

alter table public.association_events
  add column if not exists category text not null default 'competition';
alter table public.association_events
  add column if not exists zone text not null default 'all';
alter table public.association_events
  drop constraint if exists association_events_category_check;
alter table public.association_events
  add constraint association_events_category_check
  check (category in ('competition', 'open_slot', 'holiday', 'vacation', 'celebration'));
alter table public.association_events
  drop constraint if exists association_events_zone_check;
alter table public.association_events
  add constraint association_events_zone_check
  check (zone in ('all', 'A', 'B', 'C'));

do $align$
begin
  insert into public.association_event_imports (import_key)
  values ('agenda-2027-owner-corrections-and-context')
  on conflict do nothing;
  if found then
    update public.association_events
    set status = 'confirmed'
    where id = 'agenda-2027-source-6' and title = 'Goltechnic'
      and start_date = date '2027-03-21' and status = 'provisional';

    delete from public.association_events
    where id = 'agenda-2027-source-8' and title = 'Goltechnic'
      and start_date = date '2027-03-28' and status = 'provisional';

    update public.association_events
    set title = 'Coupe CITYA', status = 'provisional', category = 'competition'
    where id = 'agenda-2027-source-12' and title = 'Créneau à définir'
      and start_date = date '2027-04-11' and status = 'unconfirmed';

    update public.association_events
    set status = null
    where status = 'confirmed' and (
      (id = 'agenda-2027-source-63' and start_date = date '2027-09-25'
        and title = 'Ligue circuit inter départemental') or
      (id = 'agenda-2027-source-68' and start_date = date '2027-10-03'
        and title = 'Coupe Octobre Rose') or
      (id = 'agenda-2027-source-76' and start_date = date '2027-11-07'
        and title = 'Bregent / Bergerie') or
      (id = 'agenda-2027-source-77' and start_date = date '2027-11-21'
        and title = 'Coupe Beaujolais')
    );

    update public.association_events
    set category = 'open_slot'
    where id like 'agenda-2027-source-%' and title = 'Créneau à définir'
      and category = 'competition';

    insert into public.association_events (id, title, start_date, end_date, category, zone)
    select source.id, source.title, source.start_date, source.end_date,
           source.category, source.zone
    from jsonb_to_recordset($context$
[
  {
    "id": "agenda-2027-cal-74",
    "start_date": "2027-01-01",
    "title": "Jour de l’An",
    "category": "holiday",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-75",
    "start_date": "2027-03-29",
    "title": "Lundi de Pâques",
    "category": "holiday",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-76",
    "start_date": "2027-05-01",
    "title": "Fête du Travail",
    "category": "holiday",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-77",
    "start_date": "2027-05-06",
    "title": "Ascension",
    "category": "holiday",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-78",
    "start_date": "2027-05-08",
    "title": "Victoire 1945",
    "category": "holiday",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-79",
    "start_date": "2027-05-17",
    "title": "Lundi de Pentecôte",
    "category": "holiday",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-80",
    "start_date": "2027-07-14",
    "title": "Fête nationale",
    "category": "holiday",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-81",
    "start_date": "2027-08-15",
    "title": "Assomption",
    "category": "holiday",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-82",
    "start_date": "2027-11-01",
    "title": "Toussaint",
    "category": "holiday",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-83",
    "start_date": "2027-11-11",
    "title": "Armistice 1918",
    "category": "holiday",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-84",
    "start_date": "2027-12-25",
    "title": "Noël",
    "category": "holiday",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-85",
    "start_date": "2027-01-06",
    "title": "Épiphanie",
    "category": "celebration",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-86",
    "start_date": "2027-02-02",
    "title": "Chandeleur",
    "category": "celebration",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-87",
    "start_date": "2027-02-09",
    "title": "Mardi gras",
    "category": "celebration",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-88",
    "start_date": "2027-02-14",
    "title": "Saint-Valentin",
    "category": "celebration",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-89",
    "start_date": "2027-03-28",
    "title": "Pâques",
    "category": "celebration",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-90",
    "start_date": "2027-05-16",
    "title": "Pentecôte",
    "category": "celebration",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-91",
    "start_date": "2027-05-30",
    "title": "Fête des mères",
    "category": "celebration",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-92",
    "start_date": "2027-06-20",
    "title": "Fête des pères",
    "category": "celebration",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-93",
    "start_date": "2027-06-21",
    "title": "Fête de la musique",
    "category": "celebration",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-94",
    "start_date": "2027-10-31",
    "title": "Halloween",
    "category": "celebration",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-95",
    "start_date": "2027-02-13",
    "title": "Vacances d’hiver · A",
    "category": "vacation",
    "zone": "A",
    "end_date": "2027-02-28"
  },
  {
    "id": "agenda-2027-cal-96",
    "start_date": "2027-04-10",
    "title": "Vacances de printemps · A",
    "category": "vacation",
    "zone": "A",
    "end_date": "2027-04-25"
  },
  {
    "id": "agenda-2027-cal-97",
    "start_date": "2027-02-20",
    "title": "Vacances d’hiver · B",
    "category": "vacation",
    "zone": "B",
    "end_date": "2027-03-07"
  },
  {
    "id": "agenda-2027-cal-98",
    "start_date": "2027-04-17",
    "title": "Vacances de printemps · B",
    "category": "vacation",
    "zone": "B",
    "end_date": "2027-05-02"
  },
  {
    "id": "agenda-2027-cal-99",
    "start_date": "2027-02-06",
    "title": "Vacances d’hiver · C",
    "category": "vacation",
    "zone": "C",
    "end_date": "2027-02-21"
  },
  {
    "id": "agenda-2027-cal-100",
    "start_date": "2027-04-03",
    "title": "Vacances de printemps · C",
    "category": "vacation",
    "zone": "C",
    "end_date": "2027-04-18"
  },
  {
    "id": "agenda-2027-cal-101",
    "start_date": "2027-01-01",
    "title": "Vacances de Noël (suite)",
    "category": "vacation",
    "zone": "all",
    "end_date": "2027-01-03"
  },
  {
    "id": "agenda-2027-cal-102",
    "start_date": "2027-07-03",
    "title": "Vacances d’été",
    "category": "vacation",
    "zone": "all",
    "end_date": "2027-09-01"
  },
  {
    "id": "agenda-2027-cal-103",
    "start_date": "2027-10-23",
    "title": "Vacances de la Toussaint",
    "category": "vacation",
    "zone": "all",
    "end_date": "2027-11-07"
  },
  {
    "id": "agenda-2027-cal-104",
    "start_date": "2027-12-18",
    "title": "Vacances de Noël",
    "category": "vacation",
    "zone": "all",
    "end_date": "2028-01-02"
  },
  {
    "id": "agenda-2027-cal-105",
    "start_date": "2027-05-07",
    "title": "Pont scolaire de l’Ascension",
    "category": "vacation",
    "zone": "all"
  },
  {
    "id": "agenda-2027-cal-106",
    "start_date": "2027-09-02",
    "title": "Rentrée scolaire",
    "category": "celebration",
    "zone": "all"
  }
]
$context$::jsonb)
      as source(id text, title text, start_date date, end_date date,
                category text, zone text)
    where not exists (
      select 1 from public.association_events existing
      where existing.start_date = source.start_date and existing.title = source.title
    )
    on conflict (id) do nothing;
  end if;
end;
$align$;
notify pgrst, 'reload schema';
commit;
