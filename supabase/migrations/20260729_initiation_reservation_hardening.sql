create unique index if not exists initiation_reservations_checkout_unique_idx
  on initiation_reservations (sumup_checkout_id)
  where sumup_checkout_id is not null;

create unique index if not exists initiation_reservations_transaction_unique_idx
  on initiation_reservations (sumup_transaction_id)
  where sumup_transaction_id is not null;

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
    12
  )
  on conflict (date, start_time, end_time)
  do update set updated_at = now()
  returning * into v_slot;

  select *
  into v_slot
  from initiation_session_slots
  where id = v_slot.id
  for update;

  update initiation_reservations
  set status = 'EXPIRED'
  where status = 'PENDING'
    and expires_at <= now();

  select *
  into v_reservation
  from initiation_reservations
  where slot_id = v_slot.id
    and lower(email) = lower(p_email)
    and phone = p_phone
    and participants_count = p_participants_count
    and meal_option = p_meal_option
    and status = 'PENDING'
    and expires_at > now()
  order by created_at desc
  limit 1;

  if found then
    return v_reservation;
  end if;

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
