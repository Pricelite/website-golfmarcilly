-- Shared rate limiting and durable contact fallback. Apply before deploying the matching code.
begin;

create table if not exists public.public_rate_limits (
  key text primary key,
  count integer not null check (count >= 0),
  reset_at timestamptz not null
);
create index if not exists public_rate_limits_reset_idx on public.public_rate_limits(reset_at);
alter table public.public_rate_limits enable row level security;
revoke all on public.public_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.public_rate_limits to service_role;

create or replace function public.consume_public_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns table(allowed boolean, retry_after_seconds integer)
language plpgsql security definer set search_path = public
as $$
declare current_count integer; current_reset timestamptz;
begin
  if length(p_key) <> 64 or p_limit < 1 or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate limit input';
  end if;
  if random() < 0.01 then
    delete from public.public_rate_limits where reset_at < now() - interval '1 day';
  end if;
  insert into public.public_rate_limits as bucket(key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update set
    count = case when bucket.reset_at <= now() then 1 else least(bucket.count + 1, p_limit + 1) end,
    reset_at = case when bucket.reset_at <= now() then now() + make_interval(secs => p_window_seconds) else bucket.reset_at end
  returning count, reset_at into current_count, current_reset;
  return query select current_count <= p_limit,
    case when current_count <= p_limit then 0 else greatest(1, ceil(extract(epoch from current_reset - now()))::integer) end;
end;
$$;
revoke all on function public.consume_public_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_public_rate_limit(text, integer, integer) to service_role;

create table if not exists public.contact_fallback_queue (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  lock_token uuid,
  locked_until timestamptz,
  last_attempt_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contact_fallback_queue_work_idx on public.contact_fallback_queue(status, created_at);
alter table public.contact_fallback_queue enable row level security;
revoke all on public.contact_fallback_queue from public, anon, authenticated;
grant select, insert, update, delete on public.contact_fallback_queue to service_role;

create or replace function public.claim_contact_fallback(p_max_items integer)
returns setof public.contact_fallback_queue
language plpgsql security definer set search_path = public
as $$
begin
  if p_max_items < 1 or p_max_items > 100 then raise exception 'Invalid batch size'; end if;
  update public.contact_fallback_queue set status = 'failed', lock_token = null,
    locked_until = null, updated_at = now()
  where status = 'processing' and locked_until < now() and attempts >= 5;
  return query
  with picked as (
    select id from public.contact_fallback_queue
    where status = 'pending' or (status = 'processing' and locked_until < now())
    order by created_at, id
    limit p_max_items for update skip locked
  )
  update public.contact_fallback_queue q set status = 'processing',
    lock_token = gen_random_uuid(), locked_until = now() + interval '10 minutes',
    attempts = q.attempts + 1, last_attempt_at = now(), updated_at = now()
  from picked where q.id = picked.id returning q.*;
end;
$$;
revoke all on function public.claim_contact_fallback(integer) from public, anon, authenticated;
grant execute on function public.claim_contact_fallback(integer) to service_role;

create table if not exists public.contact_fallback_alert_state (
  id integer primary key check (id = 1),
  last_alert_at timestamptz not null
);
alter table public.contact_fallback_alert_state enable row level security;
revoke all on public.contact_fallback_alert_state from public, anon, authenticated;
grant select, insert, update on public.contact_fallback_alert_state to service_role;

notify pgrst, 'reload schema';
commit;
