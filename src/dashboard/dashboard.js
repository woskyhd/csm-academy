// Écran Home. Étape 2 : "3 priorités" et le bandeau clients critiques
// utilisent maintenant les vraies données du portefeuille clients.
// La mission du jour (étape 3) et l'activité récente multi-source restent
// des placeholders honnêtes tant qu'il n'y a rien de réel à afficher.

import { listClients } from "../clients/clientsApi.js";
import { getTopPriorities, getCriticalClients } from "../clients/priorities.js";
import { healthScoreColor, statusBadgeColor, statusLabel } from "../clients/healthScore.js";

export async function mountDashboard(container, { profileName, onOpenClient }) {
  container.innerHTML = `
    <div class="card">
      <div class="card-title">Bonjour${profileName ? " " + escapeHtml(profileName) : ""}</div>
      <div class="placeholder-note">Chargement du portefeuille...</div>
    </div>
  `;

  let clients = [];
  let loadError = null;
  try {
    clients = await listClients();
  } catch (err) {
    loadError = err.message;
  }

  const critical = loadError ? [] : getCriticalClients(clients);
  const priorities = loadError ? [] : getTopPriorities(clients, 3);

  container.innerHTML = `
    <div class="card">
      <div class="card-title">Bonjour${profileName ? " " + escapeHtml(profileName) : ""}</div>
      <div class="placeholder-note">Bienvenue sur CSM Academy.</div>
    </div>

    ${
      loadError
        ? `<div class="card"><div class="placeholder-note">Impossible de charger le portefeuille : ${escapeHtml(loadError)}</div></div>`
        : ""
    }

    ${
      critical.length
        ? `
      <div class="card" style="border-color: var(--red);">
        <div class="card-title" style="color: var(--red);">⚠ ${critical.length} client${critical.length > 1 ? "s" : ""} critique${critical.length > 1 ? "s" : ""}</div>
        ${critical
          .map(
            (c) => `
            <div class="priority-item" data-client-id="${c.id}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:6px 0;">
              <span>${escapeHtml(c.name)}</span>
              <span class="badge ${statusBadgeColor(c.status)}">${statusLabel(c.status)}</span>
            </div>
          `
          )
          .join("")}
      </div>
      `
        : ""
    }

    <div class="card">
      <div class="card-title">Mission du jour</div>
      <div class="placeholder-note">Pas encore de mission disponible — arrive à l'étape 3.</div>
    </div>

    <div class="card">
      <div class="card-title">3 priorités</div>
      ${
        priorities.length
          ? priorities
              .map(
                ({ client, score, reason }) => `
              <div class="priority-item" data-client-id="${client.id}" style="cursor:pointer; padding:8px 0; border-bottom:1px solid var(--border);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-weight:500;">${escapeHtml(client.name)}</span>
                  <span style="font-size:12px; color:var(--${healthScoreColor(score)});">${score}/100</span>
                </div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${escapeHtml(reason)}</div>
              </div>
            `
              )
              .join("")
          : `<div class="placeholder-note">${loadError ? "Portefeuille indisponible." : "Aucune priorité détectée — tout va bien."}</div>`
      }
    </div>

    <div class="card">
      <div class="card-title">Activité récente</div>
      <div class="placeholder-note">Rien pour l'instant.</div>
    </div>
  `;

  if (onOpenClient) {
    container.querySelectorAll(".priority-item").forEach((el) => {
      el.addEventListener("click", () => onOpenClient(el.dataset.clientId));
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
