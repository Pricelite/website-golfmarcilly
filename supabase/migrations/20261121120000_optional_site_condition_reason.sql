-- Le motif d'une fermeture ou d'un autre état est facultatif.
-- Les motifs déjà enregistrés sont conservés.
begin;
alter table public.site_conditions drop constraint if exists site_conditions_reason_check;
alter table public.site_conditions
  add constraint site_conditions_reason_check check (reason is null or char_length(reason) <= 240);
commit;
