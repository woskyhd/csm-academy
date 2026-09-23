// Définitions des missions. Le contenu (titre, objectifs, récompenses)
// vient du prompt CSM Simulator — rien n'est inventé ici.
//
// Seule la Mission 1 est jouable pour l'instant : ses 3 objectifs sont
// vérifiables avec ce qui existe déjà (fiches clients, notes). Les
// Missions 2 et 3 demandent "planifier un appel", "mettre à jour un
// statut" — des actions qui appartiennent au système de tâches, pas
// encore construit (Étape 5). Elles sont donc affichées mais verrouillées,
// plutôt que d'être bricolées avec un mécanisme approximatif maintenant.

export const MISSIONS = [
  {
    id: "mission_1_connais_portefeuille",
    title: "Connais ton portefeuille",
    levelRequired: 1,
    xpReward: 150,
    description:
      "Familiarise-toi avec les 5 clients de ton portefeuille : consulte chaque fiche, ajoute une note, et repère lequel est le plus à risque.",
    playable: true,
  },
  {
    id: "mission_2_sauve_medicore",
    title: "Sauve Medicore",
    levelRequired: 2,
    xpReward: null,
    description:
      "Planifie un appel de rescue, rédige un plan d'action, et mets à jour le statut de Medicore.",
    playable: false,
    lockedNote: "Arrive avec le système de tâches — Étape 5.",
  },
  {
    id: "mission_3_expanse_frontlabs",
    title: "Expanse Frontlabs",
    levelRequired: 2,
    xpReward: null,
    description:
      "Identifie l'opportunité d'upsell chez Frontlabs, prépare une proposition, et enregistre-la.",
    playable: false,
    lockedNote: "Arrive avec le système de tâches — Étape 5.",
  },
];

export function getMission(missionId) {
  return MISSIONS.find((m) => m.id === missionId) || null;
}
