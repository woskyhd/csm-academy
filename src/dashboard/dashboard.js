// Écran Home. La carte "Mission du jour" affiche la première mission des 3
// pas encore terminée (verrouillée si le niveau n'est pas encore atteint).
// "3 priorités" et le bandeau critique restent basés sur les vraies
// données clients. L'activité récente multi-source reste un placeholder
// honnête tant qu'il n'y a rien de réel à afficher.

import { listClients } from "../clients/clientsApi.js";
import { getTopPriorities, getCriticalClients } from "../clients/priorities.js";
import { healthScoreColor, statusBadgeColor, statusLabel } from "../clients/healthScore.js";
import { getViewedClientIds, getUserNotesCount, getMissionsOverview } from "../missions/missionsApi.js";
import { evaluateMission1 } from "../missions/progress.js";

export async function mountDashboard(container, { profileName, userId, level, onOpenClient, onOpenMission }) {
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

  // "Mission du jour" = la première mission des 3 pas encore terminée.
  let nextMission = null; // { mission, locked, eval1 }
  let allMissionsDone = false;
  if (!loadError && userId) {
    try {
      const overview = await getMissionsOverview(userId);
      const nextEntry = overview.find((e) => e.progress?.status !== "completed");
      if (!nextEntry) {
        allMissionsDone = true;
      } else {
        const locked = level < nextEntry.mission.levelRequired;
        let eval1 = null;
        // Seule la Mission 1 réutilise les données déjà chargées ici
        // (clients) pour afficher une vraie fraction d'objectifs ; les
        // Missions 2/3 ont leur propre détail dans leur écran dédié.
        if (!locked && nextEntry.mission.id === "mission_1_connais_portefeuille") {
          const [viewedIds, notesCount] = await Promise.all([getViewedClientIds(userId), getUserNotesCount(userId)]);
          eval1 = evaluateMission1(clients, viewedIds, notesCount, nextEntry.progress);
        }
        nextMission = { mission: nextEntry.mission, locked, eval1 };
      }
    } catch {
      nextMission = null; // affichage dégradé ci-dessous, pas d'erreur bloquante
    }
  }

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

    <div class="card mission-card" ${nextMission || allMissionsDone ? "" : 'style="cursor:default;"'}>
      <div class="card-title">Mission du jour</div>
      ${
        allMissionsDone
          ? `<div class="placeholder-note">🎉 Toutes les missions sont terminées.</div>`
          : nextMission
            ? `
              <div style="font-weight:500; margin-bottom:4px;">${nextMission.locked ? "🔒 " : ""}${escapeHtml(nextMission.mission.title)}</div>
              ${
                nextMission.locked
                  ? `<div style="font-size:12px; color:var(--text-muted);">Se débloque au Niveau ${nextMission.mission.levelRequired}.</div>`
                  : nextMission.eval1
                    ? `
                      <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">
                        ${[nextMission.eval1.req1Done, nextMission.eval1.req2Done, nextMission.eval1.req3Done].filter(Boolean).length}/3 objectifs complétés
                      </div>
                      <div class="xp-track" style="height:6px;"><div class="xp-fill" style="width:${
                        (([nextMission.eval1.req1Done, nextMission.eval1.req2Done, nextMission.eval1.req3Done].filter(Boolean).length / 3) * 100).toFixed(0)
                      }%;"></div></div>
                    `
                    : `<div style="font-size:12px; color:var(--text-muted);">En cours — récompense : ${nextMission.mission.xpReward} XP</div>`
              }
            `
            : `<div class="placeholder-note">${loadError ? "Portefeuille indisponible." : "Chargement de la mission..."}</div>`
      }
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

  if (onOpenMission && nextMission) {
    container.querySelector(".mission-card").style.cursor = "pointer";
    container.querySelector(".mission-card").addEventListener("click", () => onOpenMission(nextMission.mission.id));
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
