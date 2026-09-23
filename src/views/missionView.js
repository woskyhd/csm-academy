import { getMission } from "../missions/constants.js";
import {
  getViewedClientIds,
  getUserNotesCount,
  getMissionProgress,
  submitRiskAnswer,
  markMissionCompleted,
} from "../missions/missionsApi.js";
import { evaluateMission1 } from "../missions/progress.js";
import { listClients } from "../clients/clientsApi.js";
import { grantXPRemote } from "../xp/xpRemote.js";

export async function mountMissionView(container, { missionId, userId, onBack, onXpChange }) {
  const mission = getMission(missionId);
  container.innerHTML = `<div class="card"><div class="placeholder-note">Chargement...</div></div>`;

  if (!mission || !mission.playable) {
    container.innerHTML = `
      <button class="btn" id="back-btn" style="background:var(--surface); color:var(--text); margin-top:0; margin-bottom:12px;">← Retour</button>
      <div class="card"><div class="placeholder-note">Cette mission n'est pas encore jouable.</div></div>
    `;
    container.querySelector("#back-btn").addEventListener("click", onBack);
    return;
  }

  let clients, viewedIds, notesCount, progress;
  try {
    [clients, viewedIds, notesCount, progress] = await Promise.all([
      listClients(),
      getViewedClientIds(userId),
      getUserNotesCount(userId),
      getMissionProgress(userId, missionId),
    ]);
  } catch (err) {
    container.innerHTML = `<div class="card"><div class="placeholder-note">Erreur de chargement : ${escapeHtml(err.message)}</div></div>`;
    return;
  }

  await render();

  async function render() {
    const evalResult = evaluateMission1(clients, viewedIds, notesCount, progress);

    // Tous les objectifs sont remplis mais la mission n'est pas encore
    // marquée terminée en base : on accorde l'XP maintenant. grantXPRemote
    // est idempotent (eventId unique par mission/utilisateur), donc même
    // si cet écran est rechargé plusieurs fois, l'XP n'est jamais donnée
    // deux fois.
    if (evalResult.allDone && !evalResult.completed) {
      try {
        const xpResult = await grantXPRemote({
          userId,
          eventId: `mission_${missionId}`,
          amount: mission.xpReward,
          reason: `Mission accomplie — ${mission.title}`,
          source: "mission",
        });
        // grantXPRemote ne lève pas d'exception sur erreur (elle est
        // renvoyée dans .error) : si l'octroi a réellement échoué, on ne
        // doit surtout pas marquer la mission comme terminée quand même.
        if (xpResult.error) throw new Error(xpResult.error);
        await markMissionCompleted(userId, missionId);
        progress = { ...(progress || {}), status: "completed" };
        evalResult.completed = true;
        if (xpResult.totalXp !== null) onXpChange?.(xpResult.totalXp);
      } catch (err) {
        // Si l'octroi échoue (réseau, etc.), on ne marque rien : au
        // prochain affichage de cet écran, on retentera automatiquement.
      }
    }

    const { viewedCount, totalClients, req1Done, req2Done, req3Done, riskiest, wrongAnswer, completed } = evalResult;

    container.innerHTML = `
      <button class="btn" id="back-btn" style="background:var(--surface); color:var(--text); margin-top:0; margin-bottom:12px;">← Retour</button>

      <div class="card">
        <div class="card-title">${escapeHtml(mission.title)}</div>
        <div class="placeholder-note">${escapeHtml(mission.description)}</div>
        ${
          completed
            ? `<div class="badge green" style="margin-top:10px;">Mission accomplie — +${mission.xpReward} XP</div>`
            : `<div style="font-size:12px; color:var(--text-muted); margin-top:10px;">Récompense : ${mission.xpReward} XP</div>`
        }
      </div>

      <div class="card">
        <div class="card-title">Objectifs</div>

        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border);">
          <span style="font-size:13px;">${req1Done ? "✅" : "⬜"} Consulter les 5 fiches clients</span>
          <span style="font-size:12px; color:var(--text-muted);">${viewedCount}/${totalClients}</span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border);">
          <span style="font-size:13px;">${req2Done ? "✅" : "⬜"} Ajouter une note sur au moins 1 client</span>
          <span style="font-size:12px; color:var(--text-muted);">${notesCount} note${notesCount > 1 ? "s" : ""}</span>
        </div>

        <div style="padding-top:10px;">
          <div style="font-size:13px; margin-bottom:8px;">${req3Done ? "✅" : "⬜"} Identifier le client le plus à risque</div>
          ${
            req3Done
              ? `<div class="placeholder-note">Bonne réponse : ${escapeHtml(riskiest.name)}.</div>`
              : `
                <div style="display:flex; flex-direction:column; gap:6px;">
                  ${clients
                    .map(
                      (c) =>
                        `<button class="answer-btn risk-choice" data-client-id="${c.id}" style="cursor:pointer;">${escapeHtml(c.name)}</button>`
                    )
                    .join("")}
                </div>
                ${
                  wrongAnswer
                    ? `<div class="placeholder-note" style="margin-top:8px; color:var(--red);">Pas encore — regarde les Health Scores de plus près et réessaie.</div>`
                    : ""
                }
              `
          }
        </div>
      </div>

      ${!req1Done ? `<div class="card"><div class="placeholder-note">Astuce : va sur l'onglet Clients et ouvre les fiches une par une.</div></div>` : ""}
    `;

    container.querySelector("#back-btn").addEventListener("click", onBack);
    container.querySelectorAll(".risk-choice").forEach((btn) => {
      btn.addEventListener("click", async () => {
        container.querySelectorAll(".risk-choice").forEach((b) => (b.disabled = true));
        try {
          await submitRiskAnswer({ userId, missionId, clientId: btn.dataset.clientId });
          progress = { ...(progress || {}), risk_client_id: btn.dataset.clientId };
          await render();
        } catch (err) {
          container.querySelectorAll(".risk-choice").forEach((b) => (b.disabled = false));
        }
      });
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
