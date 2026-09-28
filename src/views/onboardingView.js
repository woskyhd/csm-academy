import { markOnboardingCompleted } from "../xp/xpRemote.js";

const SLIDES = [
  {
    title: "Bienvenue sur CSM Academy",
    body: "Apprends le métier de Customer Success Manager en gérant un vrai portefeuille de clients fictifs, sous forme de jeu.",
  },
  {
    title: "Progresse en XP",
    body: "Quiz, leçons, missions et tâches accomplies te font gagner de l'XP et monter en niveau : CSM Junior → CSM Confirmé → CSM Senior → Head of CS. Chaque niveau débloque de nouvelles fonctionnalités.",
  },
  {
    title: "Ton portefeuille",
    body: "5 clients fictifs, chacun avec un Health Score calculé sur 6 critères, une timeline d'interactions, et des recommandations personnalisées : « What should I do next? ».",
  },
  {
    title: "Missions & tâches",
    body: "Des missions te guident pas à pas (ex : sauver un client à risque). À partir du Niveau 2, crée et suis de vraies tâches par client.",
  },
];

export function mountOnboardingView(container, { userId, onComplete }) {
  let index = 0;

  render();

  function render() {
    const slide = SLIDES[index];
    const isLast = index === SLIDES.length - 1;

    container.innerHTML = `
      <div style="min-height:100vh; display:flex; flex-direction:column; justify-content:space-between; padding:24px 20px calc(24px + env(safe-area-inset-bottom, 0px));">
        <div style="text-align:right;">
          ${
            !isLast
              ? `<button id="skip-btn" style="background:none; border:none; color:var(--text-muted); font-size:13px; cursor:pointer;">Passer</button>`
              : ""
          }
        </div>

        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
          <div style="font-size:22px; font-weight:700; margin-bottom:16px;">${escapeHtml(slide.title)}</div>
          <div style="font-size:15px; color:var(--text-muted); line-height:1.6; max-width:320px;">${escapeHtml(slide.body)}</div>
        </div>

        <div>
          <div style="display:flex; justify-content:center; gap:6px; margin-bottom:20px;">
            ${SLIDES.map((_, i) => `<div style="width:${i === index ? 20 : 6}px; height:6px; border-radius:3px; background:${i === index ? "var(--blue)" : "var(--border)"}; transition: width 0.2s ease;"></div>`).join("")}
          </div>
          <button class="btn btn-primary" id="next-btn">${isLast ? "Commencer" : "Suivant"}</button>
        </div>
      </div>
    `;

    if (!isLast) {
      container.querySelector("#skip-btn").addEventListener("click", finish);
    }
    container.querySelector("#next-btn").addEventListener("click", () => {
      if (isLast) {
        finish();
      } else {
        index++;
        render();
      }
    });
  }

  async function finish() {
    const btn = container.querySelector("#next-btn");
    if (btn) btn.disabled = true;
    try {
      await markOnboardingCompleted(userId);
    } catch (err) {
      // Non-bloquant : même si l'écriture échoue, on ne coince pas
      // l'utilisateur sur l'onboarding — au pire il le reverra une fois
      // de plus à la prochaine connexion.
    }
    onComplete?.();
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
