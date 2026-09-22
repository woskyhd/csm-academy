// Questions du Niveau 1 — CSM Junior.
// Objectif pédagogique : comprendre ce qu'est le rôle d'un CSM.

export const level1Questions = [
  {
    id: "l1_q1",
    question: "Quelle est la principale différence entre un Customer Success Manager (CSM) et un Account Manager classique ?",
    answers: [
      "Le CSM se concentre sur la vente de nouvelles fonctionnalités",
      "Le CSM aide le client à atteindre ses objectifs business avec le produit",
      "Le CSM gère uniquement les tickets de support technique",
      "Le CSM ne parle jamais directement au client",
    ],
    correctIndex: 1,
    explanation:
      "Le CSM est responsable du succès du client avec le produit, pas seulement de la relation commerciale. Il s'assure que le client atteint la valeur qu'il est venu chercher.",
    commonMistake:
      "Confondre CSM et support : le support résout des problèmes ponctuels, le CSM pilote la réussite du client dans la durée.",
    difficulty: "easy",
    skill: "Fondamentaux CSM",
  },
  {
    id: "l1_q2",
    question: "Pourquoi le Customer Success est-il particulièrement important dans un modèle SaaS ?",
    answers: [
      "Parce que les clients paient une seule fois",
      "Parce que le revenu dépend du renouvellement récurrent du client",
      "Parce que les clients n'ont jamais de problèmes",
      "Parce que le produit ne change jamais après la vente",
    ],
    correctIndex: 1,
    explanation:
      "En SaaS, le revenu se gagne dans la durée (abonnement). Un client qui ne voit pas de valeur ne renouvelle pas, donc le succès du client est directement lié au revenu de l'entreprise.",
    commonMistake:
      "Penser que la vente initiale suffit : en SaaS, la vente n'est que le début de la relation.",
    difficulty: "easy",
    skill: "Fondamentaux CSM",
  },
  {
    id: "l1_q3",
    question:
      "Un client te dit : « On utilise votre outil, mais honnêtement je ne sais pas trop ce qu'on est censé en tirer. » Quelle est la meilleure première réaction ?",
    answers: [
      "Lui envoyer la documentation technique complète",
      "Chercher à comprendre ses objectifs business réels avant de parler fonctionnalités",
      "Lui proposer immédiatement une montée en gamme",
      "Transférer la demande au support",
    ],
    correctIndex: 1,
    explanation:
      "Avant de parler produit, un CSM cherche à comprendre POURQUOI le client a acheté : quel objectif business il essaie d'atteindre. C'est la base de tout Success Plan.",
    commonMistake:
      "Sauter directement à des solutions techniques sans avoir compris le besoin business sous-jacent.",
    difficulty: "medium",
    skill: "Comprendre ses clients",
  },
  {
    id: "l1_q4",
    question: "Que doit contenir au minimum une fiche client bien tenue, dès le Niveau 1 ?",
    answers: [
      "Uniquement le nom de l'entreprise et un numéro de téléphone",
      "Informations générales, contacts, notes et une timeline des échanges",
      "Le code source du produit",
      "Rien, tout doit rester dans la tête du CSM",
    ],
    correctIndex: 1,
    explanation:
      "Une fiche client de base regroupe les infos générales, les contacts clés, les notes et une timeline des interactions — c'est la fondation pour tout ce qui vient après (health score, risques, renouvellement...).",
    commonMistake:
      "Ne rien documenter et se fier uniquement à sa mémoire — ça ne passe pas à l'échelle dès qu'on gère plusieurs clients.",
    difficulty: "easy",
    skill: "Fondamentaux CSM",
  },
  {
    id: "l1_q5",
    question:
      "Un client stratégique ne répond plus depuis 3 semaines, alors qu'il répondait vite avant. Qu'est-ce que ça t'apprend en tant que CSM Junior ?",
    answers: [
      "Rien, c'est normal, certains clients sont juste occupés",
      "C'est potentiellement un signal d'alerte à noter et suivre",
      "Il faut arrêter immédiatement de le contacter",
      "Il faut automatiquement lui proposer une réduction",
    ],
    correctIndex: 1,
    explanation:
      "Un changement de comportement (silence inhabituel) est souvent un signal faible à surveiller. Ce n'est pas encore une crise, mais un bon CSM le note et ajuste son suivi.",
    commonMistake:
      "Ignorer les signaux faibles jusqu'à ce qu'ils deviennent des problèmes ouverts — c'est exactement ce que le Risk Management (Niveau 4) t'apprendra à structurer.",
    difficulty: "medium",
    skill: "Comprendre ses clients",
  },
];
