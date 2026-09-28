-- CSM Academy — Étape 9 : écran d'onboarding
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run

-- Un seul booléen sur le profil : suffit à savoir si l'onboarding a déjà
-- été vu, cross-device (pas de localStorage), comme le reste de l'app.
-- La policy "Un utilisateur modifie son propre profil" existe déjà
-- depuis la Phase 3 — pas besoin d'en recréer une.
alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;
