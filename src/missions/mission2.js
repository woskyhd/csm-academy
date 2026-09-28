import { getMissionProgress, markMissionCompleted } from "./missionsApi.js";
import { listNotes } from "../clients/clientsApi.js";
import { listTasks } from "../tasks/tasksApi.js";
import { grantXPRemote } from "../xp/xpRemote.js";
import { showXpToast } from "../ui/toast.js";

const CLIENT_ID = "medicore";

export async function mountMission2(container, { mission, userId, level, onBack, onXpChange }) {
  if (level < mission.levelRequired) {
    renderLocked(container, mission, onBack);
    return;
  }

  let tasks, notes, progress;
  try {
    [tasks, notes, progress] = await Promise.all([
      listTasks(userId),
      listNotes(CLIENT_ID),
      getMissionProgress(userId, mission.id),
    ]);
  } catch (err) {
    container.innerHTML = `<div class="card"><div class="placeholder-note">Erreur de chargement : ${escapeHtml(err.message)}</div></div>`;
    return;
  }

  await render();

  async function render() {
    const req1Done = tasks.some((t) => t.client_id === CLIENT_ID && t.type === "call");
    const req2Done = notes.some((n) => n.client_id === CLIENT_ID && n.type === "note" && n.user_id === userId);
    const req3Done = notes.some((n) => n.client_id === CLIENT_ID && n.type === "status_update" && n.user_id === userId);
    const allDone = req1Done && req2Done && req3Done;
    let completed = progress?.status === "completed";

    if (allDone && !completed) {
      try {
        const xpResult = await grantXPRemote({
          userId,
          eventId: `mission_${mission.id}`,
          amount: mission.xpReward,
          reason: `Mission accomplie — ${mission.title}`,
          source: "mission",
        });
        if (xpResult.error) throw new Error(xpResult.error);
        await markMissionCompleted(userId, mission.id);
        progress = { ...(progress || {}), status: "completed" };
        completed = true;
        if (xpResult.totalXp !== null) {
          onXpChange?.(xpResult.totalXp);
          showXpToast(mission.xpReward);
        }
      } catch (err) {
        // XP non enregistrée : on retentera au prochain affichage.
      }
    }

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

        <div style="padding:10px 0; border-bottom:1px solid var(--border);">
          <div style="font-size:13px;">${req1Done ? "✅" : "⬜"} Planifier un appel de rescue</div>
          ${
            !req1Done
              ? `<div class="placeholder-note" style="margin-top:6px;">Va dans l'onglet Tasks et crée une tâche de type « Appel » pour Medicore.</div>`
              : ""
          }
        </div>

        <div style="padding:10px 0; border-bottom:1px solid var(--border);">
          <div style="font-size:13px;">${req2Done ? "✅" : "⬜"} Rédiger un plan d'action</div>
          ${
            !req2Done
              ? `<div class="placeholder-note" style="margin-top:6px;">Va sur la fiche Medicore (onglet Clients) et ajoute une note de type « Note » décrivant ton plan.</div>`
              : ""
          }
        </div>

        <div style="padding:10px 0;">
          <div style="font-size:13px;">${req3Done ? "✅" : "⬜"} Mettre à jour le statut</div>
          ${
            !req3Done
              ? `<div class="placeholder-note" style="margin-top:6px;">Sur la fiche Medicore, ajoute une note de type « Mise à jour statut » décrivant où en est le compte après ton action.</div>`
              : ""
          }
        </div>
      </div>
    `;

    container.querySelector("#back-btn").addEventListener("click", onBack);
  }
}

function renderLocked(container, mission, onBack) {
  container.innerHTML = `
    <button class="btn" id="back-btn" style="background:var(--surface); color:var(--text); margin-top:0; margin-bottom:12px;">← Retour</button>
    <div class="card">
      <div class="card-title">🔒 ${escapeHtml(mission.title)}</div>
      <div class="placeholder-note">Se débloque au Niveau ${mission.levelRequired}.</div>
    </div>
  `;
  container.querySelector("#back-btn").addEventListener("click", onBack);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
