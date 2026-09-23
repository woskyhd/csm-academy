import { calculateHealthScore } from "../clients/healthScore.js";

// Le client le plus à risque = le Health Score le plus bas, recalculé
// à partir des vraies données — jamais une valeur fixée à l'avance.
export function getRiskiestClient(clients) {
  return [...clients].sort((a, b) => calculateHealthScore(a) - calculateHealthScore(b))[0];
}

// Évalue les 3 objectifs de la Mission 1 à partir de données réelles
// (vues enregistrées en base, notes en base, réponse enregistrée) —
// jamais d'état déclaratif côté app qui pourrait mentir sur la progression.
export function evaluateMission1(clients, viewedClientIds, notesCount, progress) {
  const viewedCount = new Set(viewedClientIds).size;
  const req1Done = viewedCount >= clients.length;
  const req2Done = notesCount >= 1;
  const riskiest = getRiskiestClient(clients);
  const req3Done = progress?.risk_client_id === riskiest.id;

  return {
    viewedCount,
    totalClients: clients.length,
    req1Done,
    req2Done,
    req3Done,
    riskiest,
    wrongAnswer: progress?.risk_client_id && progress.risk_client_id !== riskiest.id,
    allDone: req1Done && req2Done && req3Done,
    completed: progress?.status === "completed",
  };
}
