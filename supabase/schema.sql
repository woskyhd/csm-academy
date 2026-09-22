-- CSM Academy — schéma minimal (Phase 3)
-- À exécuter dans Supabase : Table Editor → SQL Editor → New query → coller → Run
--
-- Ce schéma ne couvre QUE ce qui est nécessaire à l'XP persistante.
-- Les autres tables (clients, missions, badges...) viendront plus tard,
-- une par une, quand la fonctionnalité correspondante sera construite.

-- 1. Profil utilisateur, lié au compte d'authentification Supabase.
-- (Supabase gère déjà une table interne auth.users pour l'auth ;
--  celle-ci ajoute les données propres à l'app : xp, level.)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  xp integer not null default 0,
  level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Journal des gains d'XP. Append-only : on n'update ni ne supprime
-- jamais une ligne, on ne fait qu'en ajouter. C'est ce qui permet de
-- reconstituer l'historique complet plus tard (section 8 du prompt maître).
create table public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  amount integer not null,
  reason text,
  source text,
  created_at timestamptz not null default now(),
  -- LA ligne la plus importante du fichier : cette contrainte unique
  -- empêche la base d'accepter deux fois le même event_id pour un même
  -- utilisateur, même en cas de double-clic, requête renvoyée deux fois,
  -- ou deux onglets ouverts en même temps. C'est le vrai garde-fou anti
  -- double-XP (rule 9 du prompt maître) — plus fiable qu'une simple
  -- vérification côté app, qui a une fenêtre de course possible.
  unique (user_id, event_id)
);

-- 3. Quand une transaction XP est insérée, on met à jour le total sur
-- le profil (et on recalcule le niveau — logique simplifiée ici, les
-- vrais paliers restent dans src/xp/constants.js côté app pour l'instant).
create or replace function public.handle_new_xp_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set xp = xp + new.amount,
      updated_at = now()
  where id = new.user_id;
  return new;
end;
$$;

create trigger on_xp_transaction_created
  after insert on public.xp_transactions
  for each row execute function public.handle_new_xp_transaction();

-- 4. Quand un nouveau compte est créé (inscription), on crée
-- automatiquement sa ligne de profil avec 0 XP.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Row Level Security : chaque utilisateur ne voit / ne modifie QUE
-- ses propres données. Sans ça, n'importe quel utilisateur authentifié
-- pourrait lire ou écrire les données de n'importe qui d'autre.
alter table public.profiles enable row level security;
alter table public.xp_transactions enable row level security;

create policy "Un utilisateur voit son propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Un utilisateur modifie son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Un utilisateur voit ses propres transactions XP"
  on public.xp_transactions for select
  using (auth.uid() = user_id);

create policy "Un utilisateur ne peut créer que ses propres transactions XP"
  on public.xp_transactions for insert
  with check (auth.uid() = user_id);

-- Volontairement AUCUNE policy update/delete sur xp_transactions :
-- personne, pas même l'utilisateur connecté, ne peut modifier ou
-- supprimer une transaction XP existante depuis le frontend. C'est ce
-- qui empêche de trafiquer son propre XP depuis la console du
-- navigateur (rule 27 du prompt maître).
