-- Rattrapage pour les bases provisionnées sans les tables opérationnelles.
-- Ne rejoue aucun import de compétitions et ne crée aucun marqueur d'import fictif.
-- Les migrations historiques conservent leurs rôles pour les installations neuves.
begin;

create table if not exists public.restaurant_daily_menus (
  menu_date date primary key,
  starters jsonb not null check (jsonb_typeof(starters) = 'array' and jsonb_array_length(starters) between 1 and 12),
  mains jsonb not null check (jsonb_typeof(mains) = 'array' and jsonb_array_length(mains) between 1 and 12),
  desserts jsonb not null check (jsonb_typeof(desserts) = 'array' and jsonb_array_length(desserts) between 1 and 12),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_conditions (
  id text primary key,
  status text not null,
  reason text,
  updated_at timestamptz not null default now(),
  constraint site_conditions_id_check check (id in (
    'grand-parcours-aller', 'grand-parcours-retour', 'parcours-decouverte-9-trous',
    'pitch-and-putt', 'kaleke', 'practice', 'restaurant', 'voiturettes', 'chariots'
  )),
  constraint site_conditions_status_check check (status in ('open', 'closed', 'unknown')),
  constraint site_conditions_reason_check check (
    (reason is null or char_length(reason) <= 240) and
    (status <> 'closed' or nullif(btrim(reason), '') is not null)
  )
);

create table if not exists public.association_event_imports (
  import_key text primary key,
  imported_at timestamptz not null default now()
);

alter table public.restaurant_daily_menus enable row level security;
alter table public.site_conditions enable row level security;
alter table public.association_event_imports enable row level security;

revoke all on table public.restaurant_daily_menus, public.site_conditions, public.association_event_imports from public, anon, authenticated;
grant select, insert, update, delete on table public.restaurant_daily_menus to service_role;
grant select, insert, update on table public.site_conditions to service_role;
grant select, insert on table public.association_event_imports to service_role;

notify pgrst, 'reload schema';
commit;
