-- Golf Staging possédait déjà le schéma analytics avant l'intégration GitHub.
-- Cette migration ne recrée ni ne modifie les tables historiques.
do $$
begin
  if to_regclass('public.site_analytics_page_views') is null
    or to_regclass('public.site_analytics_logins') is null
    or to_regclass('public.site_analytics_maintenance') is null then
    raise exception 'Le schéma analytics attendu est absent de Golf Staging';
  end if;
end;
$$;
