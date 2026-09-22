# CSM Academy

Application personnelle pour apprendre le Customer Success Management (CSM) en format ludique, façon jeu vidéo — deux progressions parallèles : CSM Junior → CSM Expert, et développeur débutant → avancé.

## État actuel

🚧 Tout début de projet. Ce qui existe aujourd'hui :
- Un quiz fonctionnel (Niveau 1 — CSM Junior), 5 questions
- Un système d'XP centralisé et idempotent, **mais encore en mémoire uniquement** (pas encore persisté en base — voir section 8 ci-dessous)

Ce qui n'existe pas encore : authentification, base de données, missions, career mode complet, portefeuille clients, PWA, déploiement Netlify.

## 1. Présentation

Voir la vision complète dans le prompt maître du projet (progression CSM en 10 niveaux, progression développeur en parallèle, modes Learn/Practice/Apply).

## 2. Stack technique

- Frontend : JavaScript vanilla (pas de framework UI), modules ES, bundlé avec [Vite](https://vitejs.dev/)
- Backend / DB / Auth : Supabase (à venir — Phase 3/4)
- Hébergement : Netlify (à venir — Phase 6)

Pourquoi pas de framework (React, Vue...) : le projet était jusqu'ici un seul fichier HTML. Vite + JS vanilla modulaire donne déjà une vraie séparation des responsabilités (UI / logique métier XP) sans ajouter de complexité inutile. On pourra introduire un framework plus tard si la complexité du career mode le justifie — pas avant.

## 3. Architecture

```
src/
  main.js              → point d'entrée, monte le quiz
  style.css             → styles (mobile-first)
  quiz/
    quiz.js              → logique + rendu du quiz (UI)
    data/
      level1-questions.js → banque de questions Niveau 1
  xp/
    constants.js         → TOUTES les valeurs XP et paliers de niveaux (source unique de vérité)
    xpStore.js            → attribution d'XP idempotente (actuellement en mémoire)
```

## 4. Installation locale

```bash
npm install
npm run dev
```

## 5. Variables d'environnement

Aucune pour l'instant. Les clés Supabase (URL + clé publique "anon") arriveront en Phase 3, dans un fichier `.env` (jamais commité — voir `.gitignore`).

## 6. Base de données

Pas encore connectée. Schéma prévu au démarrage (minimal, pas les 15 tables de la vision finale d'un coup) :
- `users`
- `xp_transactions`

## 7. Authentification

Pas encore implémentée. Prévue via Supabase Auth (email + mot de passe) — remplacera tout mécanisme de mot de passe côté client.

## 8. Système XP

Toutes les valeurs sont centralisées dans `src/xp/constants.js`. L'attribution est idempotente : chaque gain d'XP est identifié par un `eventId` unique (ex: `quiz_level1_l1_q1_attempt_<id>`), donc rejouer le même événement ne double jamais l'XP.

⚠️ **Important** : pour l'instant l'XP vit uniquement dans une variable JS en mémoire. Elle disparaît au rechargement de la page. Ce n'est PAS encore la persistance exigée par le projet — c'est l'objet de la Phase 3 (connexion Supabase).

## 9. Système Quiz

Un quiz = une liste de questions avec `question`, `answers`, `correctIndex`, `explanation`, `commonMistake`, `difficulty`, `skill`. Le flux suit exactement : sélection → validation → feedback → XP → question suivante.

## 10. PWA

Pas encore fait (Phase 7).

## 11. Déploiement Netlify

Pas encore fait (Phase 6). Un `netlify.toml` minimal est déjà en place (build `npm run build`, publish `dist`, redirect SPA) pour ne pas avoir à y revenir plus tard.

## 12. Développement avec Claude

Ce projet est développé avec Claude comme copilote technique et pédagogique. Voir le prompt maître pour la philosophie complète (audit avant modification, pas de fausse certitude, "À FAIRE PAR MOI" / "FAIT DANS LE CODE", construction progressive).

## 13. Tests

Pour l'instant : vérification manuelle + un test automatisé (Playwright) du flux de clic/sélection du quiz, pour garantir qu'aucune réponse ne reste "non cliquable".

## 14. Dépannage

À compléter au fil des bugs rencontrés.
