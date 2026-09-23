import { calculateHealthScore, daysUntil } from "./healthScore.js";

// Construit les "3 priorités du jour" à partir des VRAIES données clients
// (jamais rien d'inventé) : un client peut apparaître pour plusieurs
// raisons, on ne garde que la plus urgente pour lui, puis on trie tout
// le portefeuille par urgence et on prend le top 3.
export function getTopPriorities(clients, limit = 3) {
  const scored = clients.map((client) => {
    const score = calculateHealthScore(client);
    const renewalDays = daysUntil(client.renewal_date);

    // urgency : plus petit = plus urgent. On combine health score et
    // proximité du renouvellement pour classer le portefeuille entier.
    let urgency = score; // 0-100, un score bas est déjà urgent
    let reason = `Health Score ${score}/100`;

    if (client.status === "critical" || score < 40) {
      urgency = score - 100; // priorité absolue
      reason = `Health Score critique (${score}/100)`;
    } else if (renewalDays >= 0 && renewalDays <= 30) {
      urgency = Math.min(urgency, renewalDays - 50);
      reason = `Renouvellement dans ${renewalDays} jours`;
    } else if (client.nps <= 4) {
      urgency = Math.min(urgency, score - 30);
      reason = `NPS bas (${client.nps}/10)`;
    } else if (client.open_support_tickets > 0) {
      urgency = Math.min(urgency, score - 10);
      reason = `${client.open_support_tickets} ticket(s) support ouvert(s)`;
    }

    return { client, score, renewalDays, urgency, reason };
  });

  scored.sort((a, b) => a.urgency - b.urgency);
  return scored.slice(0, limit);
}

// Clients à afficher dans le bandeau "critique" du dashboard.
export function getCriticalClients(clients) {
  return clients.filter((c) => c.status === "critical" || calculateHealthScore(c) < 40);
}
