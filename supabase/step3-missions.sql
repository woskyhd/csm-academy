-- CSM Academy — Étape 3 : missions
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run
-- (après step2-clients.sql, qui doit déjà être en place)

-- 1. Suivi des fiches clients consultées par utilisateur.
-- Sert à vérifier objectivement l'objectif "consulter les 5 fiches
-- clients" de la Mission 1, sans jamais faire confiance à un simple
-- état côté app (rechargeable/trichable) : la preuve vit en base.
create table public.client_views (
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null references public.clients(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, client_id)
);

alter table public.client_views enable row level security;

create policy "Voir ses propres vues"
  on public.client_views for select
  using (auth.uid() = user_id);

create policy "Enregistrer ses propres vues"
  on public.client_views for insert
  with check (auth.uid() = user_id);

-- 2. Progression des missions par utilisateur. Une ligne par mission
-- commencée. Le statut ne passe à 'completed' que lorsque TOUS les
-- objectifs réels sont vérifiés côté app (jamais juste déclaré) ;
-- l'XP de récompense est accordée via xp_transactions (idempotent,
-- même mécanisme que le reste de l'app), pas stockée ici.
create table public.mission_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null,
  status text not null default 'in_progress',   -- 'in_progress' | 'completed'
  risk_client_id text references public.clients(id),  -- réponse donnée à "quel client est le plus à risque ?"
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, mission_id)
);

alter table public.mission_progress enable row level security;

create policy "Voir sa propre progression de mission"
  on public.mission_progress for select
  using (auth.uid() = user_id);

create policy "Créer sa propre progression de mission"
  on public.mission_progress for insert
  with check (auth.uid() = user_id);

create policy "Mettre à jour sa propre progression de mission"
  on public.mission_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
