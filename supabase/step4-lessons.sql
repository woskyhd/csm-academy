-- CSM Academy — Étape 4 : leçons pédagogiques
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run
-- (après step3-missions.sql, qui doit déjà être en place)

-- Progression des leçons par utilisateur. Le contenu des leçons
-- (concept, exemple, erreur fréquente, quiz) vit dans le code
-- (src/lessons/constants.js), pas en base — seule la progression
-- (terminée ou non) est persistée, comme pour les missions.
create table public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  status text not null default 'in_progress',   -- 'in_progress' | 'completed'
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

create policy "Voir sa propre progression de leçon"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "Créer sa propre progression de leçon"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Mettre à jour sa propre progression de leçon"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
