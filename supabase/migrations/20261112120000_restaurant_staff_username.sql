-- Les comptes restaurant peuvent utiliser un identifiant personnel sans adresse e-mail.
begin;

alter table public.restaurant_staff_accounts
  add column if not exists username text;
alter table public.restaurant_staff_accounts
  alter column email drop not null;

create unique index if not exists restaurant_staff_username_idx
  on public.restaurant_staff_accounts (username);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'restaurant_staff_username_format') then
    alter table public.restaurant_staff_accounts
      add constraint restaurant_staff_username_format
      check (username is null or (username = lower(trim(username)) and username ~ '^[a-z][a-z0-9._-]{2,49}$'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'restaurant_staff_identifier_required') then
    alter table public.restaurant_staff_accounts
      add constraint restaurant_staff_identifier_required check (email is not null or username is not null);
  end if;
end $$;

notify pgrst, 'reload schema';
commit;
