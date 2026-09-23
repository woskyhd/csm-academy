import { calculateHealthScore, daysUntil } from "./healthScore.js";

/**
 * Génère 3-4 actions prioritaires basées UNIQUEMENT sur les vraies
 * données du client (jamais de recommandation aléatoire ou inventée —
 * chaque action cite la donnée exacte qui la déclenche).
 */
export function getWhatShouldIDoNext(client, notes = []) {
  const actions = [];
  const score = calculateHealthScore(client);
  const renewalDays = daysUntil(client.renewal_date);
  const lastContactDays = client.last_contact_date ? daysUntil(client.last_contact_date) * -1 : null;

  if (score < 40) {
    actions.push({
      title: "Planifier un appel de sauvetage",
      why: `Health Score critique (${score}/100) — situation à traiter en priorité absolue.`,
    });
  } else if (score < 60) {
    actions.push({
      title: "Comprendre les causes de la baisse du Health Score",
      why: `Health Score en zone orange (${score}/100) — creuser les 6 critères avant que ça se dégrade.`,
    });
  }

  if (client.adoption_pct < 50) {
    actions.push({
      title: "Organiser une session de formation produit",
      why: `Adoption faible (${client.adoption_pct}%) — l'équipe n'exploite probablement pas la valeur du produit.`,
    });
  }

  if (renewalDays <= 30 && renewalDays >= 0) {
    actions.push({
      title: "Préparer une revue de valeur avant le renouvellement",
      why: `Renouvellement dans ${renewalDays} jours — trop proche pour ne pas avoir de plan.`,
    });
  } else if (renewalDays <= 90 && renewalDays >= 0) {
    actions.push({
      title: "Commencer à préparer le renouvellement",
      why: `Renouvellement dans ${renewalDays} jours — encore du temps, mais à anticiper.`,
    });
  }

  if (client.nps <= 4) {
    actions.push({
      title: "Comprendre l'insatisfaction directement avec le client",
      why: `NPS très bas (${client.nps}/10) — signal fort de risque de churn.`,
    });
  }

  if (lastContactDays !== null && lastContactDays > 30) {
    actions.push({
      title: "Reprendre contact",
      why: `Dernier contact il y a ${lastContactDays} jours — trop long pour un compte actif.`,
    });
  }

  if (client.expansion_signal) {
    actions.push({
      title: "Explorer l'opportunité d'expansion",
      why: `Signal d'expansion détecté (${client.is_champion ? "champion actif, " : ""}usage à ${client.adoption_pct}%) — moment propice pour une proposition.`,
    });
  }

  if (client.open_support_tickets > 0) {
    actions.push({
      title: "Faire le point sur les tickets support ouverts",
      why: `${client.open_support_tickets} ticket(s) support ouvert(s) — impact direct sur la satisfaction.`,
    });
  }

  // Si tout va bien : pas d'action urgente, mais toujours un minimum.
  if (actions.length === 0) {
    actions.push({
      title: "Maintenir le rythme de contact actuel",
      why: `Aucun signal d'alerte détecté — Health Score sain (${score}/100).`,
    });
  }

  return actions.slice(0, 4);
}
