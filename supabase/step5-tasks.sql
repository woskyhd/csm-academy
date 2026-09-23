-- CSM Academy — Étape 5 : tâches par client (Niveau 2)
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run
-- (après step2/3/4, qui doivent déjà être en place)

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null references public.clients(id) on delete cascade,
  type text not null,                 -- 'call' | 'email' | 'qbr' | 'business_review'
  title text not null,
  due_date date not null,
  priority text not null,             -- 'high' | 'medium' | 'low'
  status text not null default 'pending',  -- 'pending' | 'done'
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.tasks enable row level security;

create policy "Voir ses propres tâches"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Créer ses propres tâches"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Modifier ses propres tâches"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
