-- Confirm the Thursday 2027 Coupe de Classement dates requested by the owner.
-- Apply after the 2027 calendar import; leave renamed or edited events untouched.
begin;

update public.association_events
set status = 'confirmed'
where id like 'agenda-2027-source-%'
  and title = 'Coupe de Classement'
  and start_date between date '2027-03-18' and date '2027-10-28'
  and extract(isodow from start_date) = 4
  and status = 'unconfirmed';

commit;
