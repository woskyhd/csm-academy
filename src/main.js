import { mountQuiz } from "./quiz/quiz.js";
import { level1Questions } from "./quiz/data/level1-questions.js";
import { mountAuthScreen } from "./auth/authScreen.js";
import { getSession, onAuthChange, signOut } from "./auth/auth.js";
import { getProfile } from "./xp/xpRemote.js";

const app = document.getElementById("app");

async function boot() {
  const session = await getSession();
  render(session);

  // Réagit à toute connexion/déconnexion (y compris un refresh de token
  // en arrière-plan) sans avoir à recharger la page.
  onAuthChange((session) => render(session));
}

async function render(session) {
  if (!session) {
    app.innerHTML = `
      <header><h1>CSM Academy</h1></header>
      <main><div id="auth-root"></div></main>
    `;
    mountAuthScreen(document.getElementById("auth-root"));
    return;
  }

  const profile = await getProfile(session.user.id);
  const currentXp = profile?.xp ?? 0;

  app.innerHTML = `
    <header>
      <h1>CSM Academy</h1>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="xp-badge" id="xp-badge">${currentXp} XP</span>
        <button id="signout-btn" style="background:none; border:none; color:rgba(255,255,255,0.6); font-size:12px; cursor:pointer;">Déconnexion</button>
      </div>
    </header>
    <main>
      <div id="quiz-root"></div>
    </main>
  `;

  document.getElementById("signout-btn").addEventListener("click", () => signOut());

  const xpBadge = document.getElementById("xp-badge");
  mountQuiz(document.getElementById("quiz-root"), {
    levelId: "level1",
    userId: session.user.id,
    questions: level1Questions,
    onXpChange: (totalXp) => {
      xpBadge.textContent = `${totalXp} XP`;
    },
  });
}

boot();
