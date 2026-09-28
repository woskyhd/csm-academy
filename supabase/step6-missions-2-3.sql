-- CSM Academy — Étape 6 : Missions 2 et 3 jouables
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run
-- (après step2 à step5, qui doivent déjà être en place)

-- Colonne générique pour les missions dont un objectif est une question à
-- choix multiples (ex : Mission 3 — identifier l'opportunité d'upsell),
-- plutôt qu'une colonne spécifique par mission.
alter table public.mission_progress
  add column if not exists quiz_passed boolean not null default false;
