-- Catalogue éditable des conditions du golf. Les lignes historiques conservent leurs états.
begin;
alter table public.site_conditions drop constraint if exists site_conditions_id_check;
alter table public.site_conditions
  add column if not exists label text,
  add column if not exists item_group text,
  add column if not exists href text,
  add column if not exists position integer,
  add column if not exists state_label text;
alter table public.site_conditions
  add constraint site_conditions_label_check check (label is null or char_length(label) between 1 and 100),
  add constraint site_conditions_group_check check (item_group is null or item_group in ('courses', 'services')),
  add constraint site_conditions_href_check check (href is null or (char_length(href) <= 200 and href ~ '^/([a-z0-9-]+(/[a-z0-9-]+)*)?$')),
  add constraint site_conditions_state_label_check check (state_label is null or char_length(state_label) between 1 and 60);
create table public.site_condition_states (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(id) <= 60),
  label text not null check (char_length(label) between 1 and 60),
  status text not null check (status in ('open', 'closed', 'unknown'))
);
alter table public.site_condition_states enable row level security;
revoke all on table public.site_condition_states from public, anon, authenticated;
grant select, insert on table public.site_condition_states to service_role;
notify pgrst, 'reload schema';
commit;
