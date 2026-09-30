-- Carte du jour datée, modifiable uniquement par le serveur avec la clé de service.
begin;

create table if not exists public.restaurant_daily_menus (
  menu_date date primary key,
  starters jsonb not null check (jsonb_typeof(starters) = 'array' and jsonb_array_length(starters) = 3),
  mains jsonb not null check (jsonb_typeof(mains) = 'array' and jsonb_array_length(mains) = 3),
  desserts jsonb not null check (jsonb_typeof(desserts) = 'array' and jsonb_array_length(desserts) = 3),
  updated_at timestamptz not null default now()
);

alter table public.restaurant_daily_menus enable row level security;
revoke all on public.restaurant_daily_menus from public, anon, authenticated;
grant select, insert, update, delete on public.restaurant_daily_menus to service_role;

notify pgrst, 'reload schema';
commit;
