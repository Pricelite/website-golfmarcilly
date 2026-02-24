alter table initiation_session_slots
  alter column capacity set default 12;

update initiation_session_slots
set capacity = 12
where capacity <> 12;

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
