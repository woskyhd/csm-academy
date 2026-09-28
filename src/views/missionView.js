import { getMission } from "../missions/constants.js";
import { mountMission1 } from "../missions/mission1.js";
import { mountMission2 } from "../missions/mission2.js";
import { mountMission3 } from "../missions/mission3.js";

const MOUNTERS = {
  mission_1_connais_portefeuille: mountMission1,
  mission_2_sauve_medicore: mountMission2,
  mission_3_expanse_frontlabs: mountMission3,
};

export async function mountMissionView(container, { missionId, userId, level, onBack, onXpChange }) {
  container.innerHTML = `<div class="card"><div class="placeholder-note">Chargement...</div></div>`;

  const mission = getMission(missionId);
  const mounter = MOUNTERS[missionId];

  if (!mission || !mounter) {
    container.innerHTML = `
      <button class="btn" id="back-btn" style="background:var(--surface); color:var(--text); margin-top:0; margin-bottom:12px;">← Retour</button>
      <div class="card"><div class="placeholder-note">Mission introuvable.</div></div>
    `;
    container.querySelector("#back-btn").addEventListener("click", onBack);
    return;
  }

  return mounter(container, { mission, userId, level, onBack, onXpChange });
}
