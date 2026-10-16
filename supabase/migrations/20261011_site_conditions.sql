-- État quotidien des parcours et services affiché sur la page d'accueil.
-- Aucun état initial n'est présumé : sans saisie du personnel, le site affiche « À confirmer ».
begin;
create table if not exists public.site_conditions (
  id text primary key,
  status text not null,
  reason text,
  updated_at timestamptz not null default now(),
  constraint site_conditions_id_check check (id in (
    'grand-parcours-aller', 'grand-parcours-retour',
    'parcours-decouverte-9-trous',
    'pitch-and-putt', 'kaleke', 'practice', 'restaurant', 'voiturettes', 'chariots'
  )),
  constraint site_conditions_status_check check (status in ('open', 'closed', 'unknown')),
  constraint site_conditions_reason_check check (
    (reason is null or char_length(reason) <= 240) and
    (status <> 'closed' or nullif(btrim(reason), '') is not null)
  )
);

alter table public.site_conditions enable row level security;
revoke all on table public.site_conditions from public, anon, authenticated;
grant select, insert, update on table public.site_conditions to service_role;
notify pgrst, 'reload schema';
commit;
