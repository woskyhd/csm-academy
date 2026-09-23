import { listClients } from "../clients/clientsApi.js";
import { calculateHealthScore, healthScoreColor, statusBadgeColor, statusLabel, daysUntil } from "../clients/healthScore.js";

export async function mountClientsView(container, { onOpenClient }) {
  container.innerHTML = `<div class="card"><div class="placeholder-note">Chargement...</div></div>`;

  let clients;
  try {
    clients = await listClients();
  } catch (err) {
    container.innerHTML = `<div class="card"><div class="placeholder-note">Impossible de charger les clients : ${escapeHtml(err.message)}</div></div>`;
    return;
  }

  container.innerHTML = clients
    .map((client) => {
      const score = calculateHealthScore(client);
      const color = healthScoreColor(score);
      const days = daysUntil(client.renewal_date);
      return `
        <div class="card client-card" data-client-id="${client.id}" style="cursor:pointer;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div>
              <div style="font-size:15px; font-weight:600;">${escapeHtml(client.name)}</div>
              <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(client.sector)} · ${escapeHtml(client.segment)}</div>
            </div>
            <span class="badge ${statusBadgeColor(client.status)}">${statusLabel(client.status)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--text-muted); margin-bottom:6px;">
            <span>ARR ${client.arr.toLocaleString("fr-FR")} €</span>
            <span>Renouvellement ${days}j</span>
          </div>
          <div class="xp-track"><div class="xp-fill" style="width:${score}%; background:var(--${color});"></div></div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Health Score ${score}/100</div>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll(".client-card").forEach((card) => {
    card.addEventListener("click", () => onOpenClient(card.dataset.clientId));
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
