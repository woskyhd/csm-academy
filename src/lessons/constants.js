// Contenu des leçons pédagogiques. Chaque leçon suit la structure
// demandée : concept expliqué simplement, exemple concret basé sur un
// des 5 clients fictifs du portefeuille, erreur fréquente à éviter, et
// un mini-quiz avec feedback. Récompense : 50 à 75 XP selon la leçon.
//
// Déblocage : 1 leçon dès le départ, 2 de plus débloquées en terminant
// la Mission 1 (comme précisé dans le prompt d'origine : "150 XP +
// déverrouillage de 2 leçons").

export const LESSONS = [
  {
    id: "lesson_portefeuille_csm",
    title: "Qu'est-ce qu'un portefeuille CSM ?",
    xpReward: 50,
    unlock: { type: "start" },
    concept:
      "Un portefeuille CSM, c'est l'ensemble des comptes clients dont tu es responsable après la vente. Chaque client a un profil différent : secteur, taille (segment), montant du contrat (ARR), et niveau de santé (Health Score). Le rôle du CSM n'est pas de traiter tous les clients de la même façon, mais de répartir son attention selon la valeur et le risque de chaque compte.",
    example:
      "Regarde ton portefeuille : Databridge (Enterprise, 120 000 € ARR, statut At Risk) et Clikup (SMB, 18 000 € ARR, statut Watch) demandent tous les deux de l'attention. Mais Databridge représente presque 7 fois plus de revenu et est en zone plus rouge — c'est lui qu'un CSM traiterait en priorité, sans pour autant abandonner Clikup.",
    commonMistake:
      "L'erreur classique : consacrer le même temps à chaque client par habitude ou par ordre alphabétique, au lieu de prioriser par ARR × risque. Un compte à 8 400 € en pleine forme (Frontlabs) n'a pas besoin du même niveau d'attention immédiate qu'un compte à 120 000 € qui part en vrille (Databridge).",
    quiz: [
      {
        question:
          "Entre Databridge (Enterprise, 120K€ ARR, At Risk) et Frontlabs (Startup, 8 400€ ARR, Healthy), lequel demande une attention prioritaire cette semaine ?",
        options: [
          "Databridge — ARR élevé combiné à un risque élevé",
          "Frontlabs — c'est le plus petit compte, donc le plus rapide à traiter",
          "Les deux à parts égales, l'ordre n'a pas d'importance",
        ],
        correctIndex: 0,
        explanation:
          "Un ARR élevé combiné à un risque élevé, c'est le signal de priorité numéro un dans un portefeuille.",
      },
      {
        question: "Qu'est-ce qui définit le mieux un « portefeuille CSM » ?",
        options: [
          "Une liste de prospects à convertir en clients",
          "L'ensemble des comptes déjà clients, à faire grandir et à retenir",
          "Un tableau de bord marketing",
        ],
        correctIndex: 1,
        explanation:
          "Le portefeuille, ce sont les clients déjà signés : le CSM intervient après la vente, sur la rétention et la croissance de ces comptes.",
      },
    ],
  },
  {
    id: "lesson_health_score",
    title: "Le Health Score",
    xpReward: 60,
    unlock: { type: "mission", missionId: "mission_1_connais_portefeuille" },
    concept:
      "Le Health Score est une note de 0 à 100 qui résume la santé d'un compte client. Plutôt qu'un seul chiffre comme le NPS, il combine plusieurs critères pondérés : Usage produit (25%), Engagement (20%), Support (15%), Satisfaction/NPS (15%), Relation (10%), Atteinte des objectifs (15%). L'idée : un client peut avoir un bon NPS mais un usage en chute — le score composite capture ce que la satisfaction seule ne voit pas.",
    example:
      "Prends Medicore : Usage 21, Engagement 25, Support 35, Satisfaction 25, Relation 20, Objectifs 30. Tout est bas — le score pondéré tombe autour de 26/100, en zone rouge. Compare à Nexflow : Usage 87, Engagement 80, Support 88, Satisfaction 90, Relation 85, Objectifs 72 → un score autour de 82/100, en zone verte. Le Health Score rend ces deux situations immédiatement comparables, même si les deux comptes n'ont rien à voir en taille ou en secteur.",
    commonMistake:
      "L'erreur fréquente : se fier uniquement au NPS ou à une impression générale (« le client a l'air content ») plutôt qu'au score composite. Un client peut répondre poliment à une enquête NPS tout en utilisant de moins en moins le produit — exactement le genre de signal qu'un critère Usage à 21/100 révèle immédiatement, mais que le NPS seul ne capture pas.",
    quiz: [
      {
        question:
          "Pourquoi le Health Score combine-t-il plusieurs critères plutôt que de se baser sur un seul indicateur comme le NPS ?",
        options: [
          "Parce que c'est plus compliqué, donc plus crédible",
          "Parce qu'un seul indicateur peut cacher des signaux importants (ex : usage en baisse malgré un bon NPS)",
          "Parce que le NPS n'est jamais fiable",
        ],
        correctIndex: 1,
        explanation:
          "Chaque critère capture un angle différent de la relation client ; un indicateur unique peut masquer un problème que les autres révèlent.",
      },
      {
        question:
          "Un client a Usage=90, Engagement=85, mais Support=20 (beaucoup de tickets non résolus). Que peux-tu en conclure ?",
        options: [
          "Le client va sûrement bien, l'usage est excellent",
          "Il y a un vrai risque caché : l'usage est fort mais l'expérience support dégrade la relation",
          "Le Health Score ne sert à rien dans ce cas",
        ],
        correctIndex: 1,
        explanation:
          "Un bon usage ne compense pas un mauvais support : le score composite garde ce signal visible au lieu de le diluer.",
      },
    ],
  },
  {
    id: "lesson_churn",
    title: "Comprendre le Churn",
    xpReward: 75,
    unlock: { type: "mission", missionId: "mission_1_connais_portefeuille" },
    concept:
      "Le churn, c'est la perte d'un client : il ne renouvelle pas, ou réduit fortement son contrat. On distingue le churn logo (le client part complètement) du churn revenue (il reste mais dépense moins), et surtout les signaux avancés — visibles des mois avant la décision — des signaux tardifs, comme la décision de non-renouvellement elle-même, qu'on découvre souvent trop tard pour agir.",
    example:
      "Medicore coche presque toutes les cases des signaux avancés de churn : NPS à 2/10, adoption à 21%, CEO injoignable depuis 2 mois, renouvellement dans seulement 18 jours. Chacun de ces signaux, pris isolément il y a plusieurs semaines, aurait dû déclencher une alerte — attendre le jour du renouvellement pour agir est déjà trop tard.",
    commonMistake:
      "L'erreur classique : ne s'occuper du risque de churn qu'à l'approche de la date de renouvellement, au lieu de réagir dès les premiers signaux avancés (baisse d'usage, silence du sponsor, tickets support qui s'accumulent). Une fois que le client a commencé à évaluer des alternatives, comme Medicore, la marge de manœuvre est déjà très réduite.",
    quiz: [
      {
        question:
          "Lequel de ces éléments est un signal AVANCÉ (leading) de churn plutôt qu'une conséquence tardive ?",
        options: [
          "Le client annonce officiellement qu'il ne renouvelle pas",
          "L'adoption produit chute et le sponsor ne répond plus aux emails",
          "Le contrat arrive à échéance",
        ],
        correctIndex: 1,
        explanation:
          "La chute d'adoption et le silence du sponsor apparaissent bien avant la décision finale — ce sont eux qu'il faut surveiller.",
      },
      {
        question:
          "Pourquoi est-il risqué d'attendre la date de renouvellement pour agir sur un compte comme Medicore ?",
        options: [
          "Ce n'est pas risqué, c'est le bon moment pour convaincre le client",
          "Parce qu'à ce stade, les signaux avancés montrent que la décision est souvent déjà prise ou très avancée",
          "Parce que les renouvellements sont automatiques",
        ],
        correctIndex: 1,
        explanation:
          "Quand les signaux avancés s'accumulent depuis des semaines, la décision du client est déjà largement engagée au moment du renouvellement.",
      },
    ],
  },
];

// Leçons futures, pas encore construites — juste affichées comme à venir.
export const LOCKED_FUTURE_LESSONS = ["L'art du QBR", "Détecter l'expansion", "Gérer une escalade"];

export function getLesson(lessonId) {
  return LESSONS.find((l) => l.id === lessonId) || null;
}
