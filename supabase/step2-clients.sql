-- CSM Academy — Étape 2 : portefeuille de 5 clients fictifs
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run

-- 1. Table des clients. Données de démo, partagées (pas de user_id) :
-- tout le monde connecté peut les LIRE, personne ne peut les modifier
-- depuis le frontend (pas de policy insert/update/delete).
-- Le Health Score global n'est volontairement PAS stocké ici : il est
-- calculé côté app à partir des 6 sous-scores ci-dessous, comme demandé
-- ("Health Score calculé sur 6 critères", pas une valeur figée).
create table public.clients (
  id text primary key,
  name text not null,
  sector text not null,
  segment text not null,
  arr integer not null,
  status text not null,                  -- 'healthy' | 'watch' | 'at_risk' | 'critical'
  nps integer not null,
  adoption_pct integer not null,
  renewal_date date not null,
  last_contact_date date,
  is_champion boolean not null default false,
  expansion_signal boolean not null default false,
  open_support_tickets integer not null default 0,
  context_note text,
  -- Les 6 sous-scores du Health Score (0-100 chacun) :
  health_usage integer not null,
  health_engagement integer not null,
  health_support integer not null,
  health_satisfaction integer not null,
  health_relationship integer not null,
  health_goals integer not null
);

alter table public.clients enable row level security;

create policy "Utilisateurs connectés peuvent voir les clients"
  on public.clients for select
  using (auth.role() = 'authenticated');

-- 2. Timeline : interactions fictives (seedées, user_id NULL = visible de
-- tous) + notes personnelles ajoutées par toi (user_id = ton compte,
-- visibles seulement par toi).
create table public.client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references public.clients(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,                    -- 'call' | 'email' | 'qbr' | 'support' | 'note'
  content text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.client_notes enable row level security;

create policy "Voir les interactions publiques ou ses propres notes"
  on public.client_notes for select
  using (user_id is null or auth.uid() = user_id);

create policy "Ajouter seulement ses propres notes"
  on public.client_notes for insert
  with check (auth.uid() = user_id);

-- 3. Les 5 clients fictifs.
insert into public.clients (
  id, name, sector, segment, arr, status, nps, adoption_pct, renewal_date,
  last_contact_date, is_champion, expansion_signal, open_support_tickets, context_note,
  health_usage, health_engagement, health_support, health_satisfaction, health_relationship, health_goals
) values
  ('nexflow', 'Nexflow', 'SaaS B2B', 'Mid-Market', 48000, 'healthy', 9, 87,
    current_date + interval '204 days', current_date - interval '5 days',
    true, true, 0, 'Champion actif, forte croissance d''usage.',
    87, 80, 88, 90, 85, 72),

  ('databridge', 'Databridge', 'Data Analytics', 'Enterprise', 120000, 'at_risk', 4, 38,
    current_date + interval '38 days', current_date - interval '47 days',
    false, false, 3, '3 tickets support ouverts, dernier contact il y a 47 jours.',
    38, 45, 40, 40, 55, 50),

  ('clikup', 'Clikup', 'Productivity', 'SMB', 18000, 'watch', 7, 62,
    current_date + interval '54 days', current_date - interval '12 days',
    false, false, 1, 'Adoption en progression mais équipe sous-formée.',
    62, 60, 80, 70, 65, 65),

  ('frontlabs', 'Frontlabs', 'DevTools', 'Startup', 8400, 'healthy', 10, 94,
    current_date + interval '160 days', current_date - interval '3 days',
    false, true, 0, 'Croissance rapide, signal d''expansion fort.',
    94, 90, 92, 95, 88, 90),

  ('medicore', 'Medicore', 'HealthTech', 'Mid-Market', 36000, 'critical', 2, 21,
    current_date + interval '18 days', current_date - interval '60 days',
    false, false, 2, 'CEO injoignable depuis 2 mois, évalue des alternatives.',
    21, 25, 35, 25, 20, 30);

-- 4. Quelques interactions fictives dans la timeline de chaque client
-- (user_id NULL = historique, visible de tous).
insert into public.client_notes (client_id, user_id, type, content, occurred_at) values
  ('nexflow', null, 'qbr', 'QBR trimestriel : satisfaction élevée, discussion sur l''expansion vers l''équipe Marketing.', now() - interval '20 days'),
  ('nexflow', null, 'call', 'Point mensuel avec le champion produit, usage en hausse.', now() - interval '5 days'),

  ('databridge', null, 'support', 'Ticket ouvert : lenteur sur les exports de données.', now() - interval '10 days'),
  ('databridge', null, 'email', 'Relance envoyée sans réponse pour planifier un point.', now() - interval '30 days'),
  ('databridge', null, 'support', 'Ticket ouvert : erreur de synchronisation API.', now() - interval '47 days'),

  ('clikup', null, 'call', 'Onboarding équipe : plusieurs utilisateurs encore peu à l''aise avec l''outil.', now() - interval '25 days'),
  ('clikup', null, 'email', 'Envoi de ressources de formation complémentaires.', now() - interval '12 days'),

  ('frontlabs', null, 'call', 'Discussion sur un besoin d''un plan supérieur pour plus d''utilisateurs.', now() - interval '15 days'),
  ('frontlabs', null, 'qbr', 'QBR : croissance de l''équipe, très satisfaits du produit.', now() - interval '3 days'),

  ('medicore', null, 'email', 'Email de relance envoyé au CEO, sans réponse.', now() - interval '30 days'),
  ('medicore', null, 'call', 'Tentative d''appel non aboutie.', now() - interval '60 days');
