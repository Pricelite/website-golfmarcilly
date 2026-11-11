-- Comptes personnels du restaurant. Une seule entité est gérée aujourd'hui : La Bergerie.
begin;

create table if not exists public.restaurant_staff_accounts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text,
  role text not null default 'restaurant_admin' check (role = 'restaurant_admin'),
  restaurant_id text not null default 'la-bergerie' check (restaurant_id = 'la-bergerie'),
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurant_staff_email_normalized check (email = lower(trim(email)) and length(email) <= 254),
  constraint restaurant_staff_name_length check (length(trim(name)) between 1 and 100)
);

create table if not exists public.restaurant_staff_invites (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  account_id uuid not null references public.restaurant_staff_accounts(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create unique index if not exists restaurant_staff_invites_account_idx on public.restaurant_staff_invites(account_id);

create table if not exists public.restaurant_staff_sessions (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  account_id uuid not null references public.restaurant_staff_accounts(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists restaurant_staff_sessions_account_idx on public.restaurant_staff_sessions(account_id);
create index if not exists restaurant_staff_sessions_expiry_idx on public.restaurant_staff_sessions(expires_at);

alter table public.restaurant_staff_accounts enable row level security;
alter table public.restaurant_staff_invites enable row level security;
alter table public.restaurant_staff_sessions enable row level security;
revoke all on public.restaurant_staff_accounts, public.restaurant_staff_invites, public.restaurant_staff_sessions from public, anon, authenticated;
grant select, insert, update, delete on public.restaurant_staff_accounts, public.restaurant_staff_invites, public.restaurant_staff_sessions to service_role;

create or replace function public.activate_restaurant_staff(p_token_hash text, p_password_hash text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_account_id uuid;
begin
  delete from public.restaurant_staff_invites
  where token_hash = p_token_hash and expires_at > now()
  returning account_id into v_account_id;
  if v_account_id is null then return false; end if;
  update public.restaurant_staff_accounts
    set password_hash = p_password_hash, active = true, updated_at = now()
    where id = v_account_id;
  delete from public.restaurant_staff_sessions where account_id = v_account_id;
  return true;
end $$;
revoke all on function public.activate_restaurant_staff(text, text) from public, anon, authenticated;
grant execute on function public.activate_restaurant_staff(text, text) to service_role;

create or replace function public.revoke_restaurant_staff(p_account_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.restaurant_staff_accounts set active = false, updated_at = now() where id = p_account_id;
  if not found then return false; end if;
  delete from public.restaurant_staff_sessions where account_id = p_account_id;
  delete from public.restaurant_staff_invites where account_id = p_account_id;
  return true;
end $$;
revoke all on function public.revoke_restaurant_staff(uuid) from public, anon, authenticated;
grant execute on function public.revoke_restaurant_staff(uuid) to service_role;

notify pgrst, 'reload schema';
commit;
