-- A claim reserves work; count an attempt only when its email is about to be sent.
-- Apply with the queue worker stopped. A prior interrupted claim may have counted
-- one attempt for a message that was never reached by the old sequential worker.
begin;

update public.contact_fallback_queue
set status = 'pending', attempts = greatest(attempts - 1, 0),
  lock_token = null, locked_until = null, updated_at = now()
where status = 'processing';

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
    updated_at = now()
  from picked where q.id = picked.id returning q.*;
end;
$$;
revoke all on function public.claim_contact_fallback(integer) from public, anon, authenticated;
grant execute on function public.claim_contact_fallback(integer) to service_role;

create or replace function public.begin_contact_fallback_attempt(p_id uuid, p_lock_token uuid)
returns integer
language plpgsql security definer set search_path = public
as $$
declare current_attempts integer;
begin
  update public.contact_fallback_queue
  set attempts = attempts + 1, last_attempt_at = now(), updated_at = now()
  where id = p_id and lock_token = p_lock_token and status = 'processing'
    and locked_until > now() and attempts < 5
  returning attempts into current_attempts;
  if current_attempts is null then raise exception 'Fallback queue claim expired or exhausted'; end if;
  return current_attempts;
end;
$$;
revoke all on function public.begin_contact_fallback_attempt(uuid, uuid) from public, anon, authenticated;
grant execute on function public.begin_contact_fallback_attempt(uuid, uuid) to service_role;

notify pgrst, 'reload schema';
commit;
