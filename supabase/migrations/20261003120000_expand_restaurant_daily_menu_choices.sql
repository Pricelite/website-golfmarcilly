begin;

alter table public.restaurant_daily_menus
  drop constraint if exists restaurant_daily_menus_starters_check,
  drop constraint if exists restaurant_daily_menus_mains_check,
  drop constraint if exists restaurant_daily_menus_desserts_check;

alter table public.restaurant_daily_menus
  add constraint restaurant_daily_menus_starters_check
    check (jsonb_typeof(starters) = 'array' and jsonb_array_length(starters) between 1 and 12),
  add constraint restaurant_daily_menus_mains_check
    check (jsonb_typeof(mains) = 'array' and jsonb_array_length(mains) between 1 and 12),
  add constraint restaurant_daily_menus_desserts_check
    check (jsonb_typeof(desserts) = 'array' and jsonb_array_length(desserts) between 1 and 12);

insert into public.restaurant_daily_menus (menu_date, starters, mains, desserts, updated_at)
values (
  date '2026-10-03',
  '[{"name":"Terrine maison","price":"8 €"},{"name":"Croustillant de reblochon façon tartiflette","price":"8 €"},{"name":"Saucisson brioché","price":"9 €"}]'::jsonb,
  '[{"name":"Jambon grillé","price":"12 €"},{"name":"Burger de la Bergerie","price":"17 €"},{"name":"Cuisse de canard confite, sauce au poivre vert","price":"17 €"},{"name":"Pavé de mahi-mahi, sauce aux fruits de mer safranée","price":"19 €"},{"name":"Souris d’agneau confite et son jus","price":"21 €"},{"name":"Faux-filet, sauce échalote","price":"23 €"},{"name":"Entrecôte","price":"25 €"}]'::jsonb,
  '[{"name":"Île flottante","price":"7 €"},{"name":"Tarte fine aux mirabelles","price":"7,50 €"},{"name":"Profiterole de la Bergerie","price":"8 €"},{"name":"Omelette norvégienne","price":"9 €"}]'::jsonb,
  now()
)
on conflict (menu_date) do update set
  starters = excluded.starters,
  mains = excluded.mains,
  desserts = excluded.desserts,
  updated_at = excluded.updated_at;

commit;
