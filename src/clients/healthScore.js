// Le Health Score n'est JAMAIS une valeur codée en dur sur un client :
// il est recalculé à chaque affichage à partir de 6 sous-scores (0-100),
// pondérés comme demandé. Si tu changes un sous-score plus tard (ou les
// pondérations elles-mêmes), le score global suit automatiquement.

export const HEALTH_WEIGHTS = {
  usage: 0.25,
  engagement: 0.2,
  support: 0.15,
  satisfaction: 0.15,
  relationship: 0.1,
  goals: 0.15,
};

export function calculateHealthScore(client) {
  const w = HEALTH_WEIGHTS;
  const raw =
    client.health_usage * w.usage +
    client.health_engagement * w.engagement +
    client.health_support * w.support +
    client.health_satisfaction * w.satisfaction +
    client.health_relationship * w.relationship +
    client.health_goals * w.goals;
  return Math.round(raw);
}

/**
 * >80 vert, >60 bleu, >40 orange, en dessous rouge.
 */
export function healthScoreColor(score) {
  if (score > 80) return "green";
  if (score > 60) return "blue";
  if (score > 40) return "orange";
  return "red";
}

export function statusBadgeColor(status) {
  return { healthy: "green", watch: "blue", at_risk: "orange", critical: "red" }[status] || "blue";
}

export function statusLabel(status) {
  return (
    { healthy: "Healthy", watch: "Watch", at_risk: "At Risk", critical: "Critical" }[status] ||
    status
  );
}

export function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
