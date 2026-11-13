-- Étend les comptes personnels existants aux rubriques du back-office.
begin;

alter table public.restaurant_staff_accounts
  add column if not exists sections text[] not null default array['restaurant']::text[];

alter table public.restaurant_staff_accounts
  drop constraint if exists restaurant_staff_accounts_role_check;
alter table public.restaurant_staff_accounts
  add constraint restaurant_staff_accounts_role_check
  check (role in ('restaurant_admin', 'staff'));

alter table public.restaurant_staff_accounts
  drop constraint if exists restaurant_staff_sections_valid;
alter table public.restaurant_staff_accounts
  add constraint restaurant_staff_sections_valid
  check (
    cardinality(sections) between 1 and 8
    and sections <@ array['restaurant', 'competitions', 'site_conditions', 'publicites',
                          'statistiques', 'archives', 'pages', 'media']::text[]
  );

-- L'accès historique au restaurant reste inchangé pour les comptes déjà activés.
update public.restaurant_staff_accounts
set sections = array['restaurant']::text[]
where sections is null or cardinality(sections) = 0;

notify pgrst, 'reload schema';
commit;
