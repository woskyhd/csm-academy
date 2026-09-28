// Définitions des missions. Le contenu (titre, objectifs) vient du
// prompt CSM Simulator — rien n'est inventé ici. Les récompenses XP des
// Missions 2 et 3 n'étaient pas précisées dans ce prompt (seule la
// Mission 1 donnait "150 XP") : 200 XP chacune est un choix raisonnable,
// cohérent avec le reste de l'économie XP de l'app.

import { XP_VALUES } from "../xp/constants.js";

export const MISSIONS = [
  {
    id: "mission_1_connais_portefeuille",
    title: "Connais ton portefeuille",
    levelRequired: 1,
    xpReward: XP_VALUES.missionConnaisPortefeuille,
    description:
      "Familiarise-toi avec les 5 clients de ton portefeuille : consulte chaque fiche, ajoute une note, et repère lequel est le plus à risque.",
  },
  {
    id: "mission_2_sauve_medicore",
    title: "Sauve Medicore",
    levelRequired: 2,
    xpReward: XP_VALUES.missionSauveMedicore,
    description:
      "Planifie un appel de rescue, rédige un plan d'action, et mets à jour le statut de Medicore.",
  },
  {
    id: "mission_3_expanse_frontlabs",
    title: "Expanse Frontlabs",
    levelRequired: 2,
    xpReward: XP_VALUES.missionExpanseFrontlabs,
    description:
      "Identifie l'opportunité d'upsell chez Frontlabs, puis rédige une proposition d'expansion et enregistre-la.",
  },
];

export function getMission(missionId) {
  return MISSIONS.find((m) => m.id === missionId) || null;
}
