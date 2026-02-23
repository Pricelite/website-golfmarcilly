create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'initiation_meal_option'
  ) then
    create type initiation_meal_option as enum ('WITH_MEAL', 'WITHOUT_MEAL');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'initiation_reservation_status'
  ) then
    create type initiation_reservation_status as enum (
      'PENDING',
      'PAID',
      'CANCELED',
      'EXPIRED',
      'FAILED'
    );
  end if;
end $$;

create table if not exists initiation_session_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time not null,
  end_time time not null,
  capacity integer not null default 15 check (capacity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (date, start_time, end_time)
);

create table if not exists initiation_reservations (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references initiation_session_slots(id) on delete restrict,
  full_name text not null,
  email text not null,
  phone text not null,
  participants_count integer not null check (participants_count > 0),
  meal_option initiation_meal_option not null,
  price_per_person_cents integer not null check (price_per_person_cents > 0),
  total_price_cents integer not null check (total_price_cents > 0),
  status initiation_reservation_status not null default 'PENDING',
  sumup_checkout_id text,
  sumup_transaction_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists initiation_reservations_slot_status_idx
  on initiation_reservations (slot_id, status, expires_at);

create index if not exists initiation_reservations_checkout_idx
  on initiation_reservations (sumup_checkout_id);

create index if not exists initiation_session_slots_date_idx
  on initiation_session_slots (date, start_time);

create or replace function set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists initiation_session_slots_updated_at on initiation_session_slots;
create trigger initiation_session_slots_updated_at
before update on initiation_session_slots
for each row execute function set_updated_at_timestamp();

drop trigger if exists initiation_reservations_updated_at on initiation_reservations;
create trigger initiation_reservations_updated_at
before update on initiation_reservations
for each row execute function set_updated_at_timestamp();

create or replace function create_initiation_reservation(
  p_date date,
  p_start_time time,
  p_end_time time,
  p_full_name text,
  p_email text,
  p_phone text,
  p_participants_count integer,
  p_meal_option initiation_meal_option,
  p_price_per_person_cents integer,
  p_total_price_cents integer,
  p_expires_at timestamptz
)
returns initiation_reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot initiation_session_slots;
  v_reserved integer;
  v_reservation initiation_reservations;
begin
  insert into initiation_session_slots (
    date,
    start_time,
    end_time,
    capacity
  )
  values (
    p_date,
    p_start_time,
    p_end_time,
    15
  )
  on conflict (date, start_time, end_time)
  do update set updated_at = now()
  returning * into v_slot;

  update initiation_reservations
  set status = 'EXPIRED'
  where status = 'PENDING'
    and expires_at <= now();

  select coalesce(sum(participants_count), 0)
  into v_reserved
  from initiation_reservations
  where slot_id = v_slot.id
    and (
      status = 'PAID'
      or (status = 'PENDING' and expires_at > now())
    );

  if v_reserved + p_participants_count > v_slot.capacity then
    raise exception 'CAPACITY_EXCEEDED' using errcode = 'P0001';
  end if;

  insert into initiation_reservations (
    slot_id,
    full_name,
    email,
    phone,
    participants_count,
    meal_option,
    price_per_person_cents,
    total_price_cents,
    status,
    expires_at
  )
  values (
    v_slot.id,
    p_full_name,
    p_email,
    p_phone,
    p_participants_count,
    p_meal_option,
    p_price_per_person_cents,
    p_total_price_cents,
    'PENDING',
    p_expires_at
  )
  returning * into v_reservation;

  return v_reservation;
end;
$$;

alter table initiation_session_slots enable row level security;
alter table initiation_reservations enable row level security;

