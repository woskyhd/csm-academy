// Toutes les valeurs XP et paliers de niveaux sont centralisés ici.
// Rien de codé en dur ailleurs dans l'app : si tu veux rééquilibrer
// le jeu plus tard, c'est ce fichier (et lui seul) qu'il faut changer.

export const XP_VALUES = {
  quizEasy: 10,
  quizMedium: 20,
  quizHard: 40,
  mission: 100,
  simulation: 150,
  expertChallenge: 300,
  clientNote: 20,
};

// Palier XP nécessaire pour ATTEINDRE ce niveau (pas juste le franchir),
// et le titre affiché à ce niveau.
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "CSM Junior" },
  { level: 2, xp: 500, title: "CSM Confirmé" },
  { level: 3, xp: 1200, title: "CSM Senior" },
  { level: 4, xp: 2500, title: "Head of CS" },
];

/**
 * Calcule le niveau atteint pour un total d'XP donné.
 */
export function getLevelForXP(totalXp) {
  let current = LEVEL_THRESHOLDS[0];
  for (const tier of LEVEL_THRESHOLDS) {
    if (totalXp >= tier.xp) current = tier;
  }
  return current.level;
}

/**
 * Renvoie { current, next, xpIntoLevel, xpNeededForNext } pour afficher
 * une barre de progression "vers le niveau suivant".
 */
export function getLevelProgress(totalXp) {
  const levelIndex = LEVEL_THRESHOLDS.findIndex(
    (t, i) =>
      totalXp >= t.xp &&
      (i === LEVEL_THRESHOLDS.length - 1 || totalXp < LEVEL_THRESHOLDS[i + 1].xp)
  );
  const current = LEVEL_THRESHOLDS[levelIndex];
  const next = LEVEL_THRESHOLDS[levelIndex + 1] || null;
  return {
    level: current.level,
    title: current.title,
    xpIntoLevel: totalXp - current.xp,
    xpNeededForNext: next ? next.xp - current.xp : null,
    next,
  };
}
