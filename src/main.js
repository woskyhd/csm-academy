import { mountAuthScreen } from "./auth/authScreen.js";
import { getSession, onAuthChange, signOut } from "./auth/auth.js";
import { getProfile } from "./xp/xpRemote.js";
import { getLevelProgress } from "./xp/constants.js";
import { mountTabBar } from "./nav/tabBar.js";
import { mountDashboard } from "./dashboard/dashboard.js";
import { mountClientsView } from "./views/clientsView.js";
import { mountClientDetailView } from "./views/clientDetailView.js";
import { mountTasksView } from "./views/tasksView.js";
import { mountLearnView } from "./views/learnView.js";

const app = document.getElementById("app");

let currentXp = 0;
let currentUserId = null;
let activeTab = "home";
let selectedClientId = null;

async function boot() {
  const session = await getSession();
  await render(session);
  onAuthChange((session) => render(session));
}

async function render(session) {
  if (!session) {
    app.innerHTML = `
      <header><div class="header-top"><h1>CSM Academy</h1></div></header>
      <main><div id="auth-root"></div></main>
    `;
    mountAuthScreen(document.getElementById("auth-root"));
    return;
  }

  currentUserId = session.user.id;
  const profile = await getProfile(currentUserId);
  currentXp = profile?.xp ?? 0;

  app.innerHTML = `
    <header id="app-header"></header>
    <main><div id="view-root"></div></main>
    <div id="tab-bar-root"></div>
  `;

  renderHeader();
  renderTabBar();
  renderActiveView();
}

function renderHeader() {
  const { title, xpIntoLevel, xpNeededForNext } = getLevelProgress(currentXp);
  const pct = xpNeededForNext ? Math.min(100, Math.round((xpIntoLevel / xpNeededForNext) * 100)) : 100;

  document.getElementById("app-header").innerHTML = `
    <div class="header-top">
      <h1>CSM Academy</h1>
      <button id="signout-btn">Déconnexion</button>
    </div>
    <div class="xp-bar-row">
      <span class="level-title">${title}</span>
      <span>${currentXp} XP${xpNeededForNext ? ` · ${xpNeededForNext - xpIntoLevel} XP avant le niveau suivant` : " · niveau max"}</span>
    </div>
    <div class="xp-track"><div class="xp-fill" style="width:${pct}%;"></div></div>
  `;

  document.getElementById("signout-btn").addEventListener("click", () => signOut());
}

function renderTabBar() {
  mountTabBar(document.getElementById("tab-bar-root"), {
    activeTab,
    onTabChange: (tab) => {
      activeTab = tab;
      if (tab !== "clients") selectedClientId = null; // repart sur la liste si on revient plus tard
      renderTabBar(); // remet à jour l'état visuel actif
      renderActiveView();
    },
  });
}

function renderActiveView() {
  const viewRoot = document.getElementById("view-root");
  const { level } = getLevelProgress(currentXp);

  if (activeTab === "home") {
    mountDashboard(viewRoot, {
      onOpenClient: (id) => {
        selectedClientId = id;
        activeTab = "clients";
        renderTabBar();
        renderActiveView();
      },
    });
  } else if (activeTab === "clients") {
    if (selectedClientId) {
      mountClientDetailView(viewRoot, {
        clientId: selectedClientId,
        userId: currentUserId,
        onBack: () => {
          selectedClientId = null;
          renderActiveView();
        },
        onXpChange: (totalXp) => {
          currentXp = totalXp;
          renderHeader();
        },
      });
    } else {
      mountClientsView(viewRoot, {
        onOpenClient: (id) => {
          selectedClientId = id;
          renderActiveView();
        },
      });
    }
  } else if (activeTab === "tasks") {
    mountTasksView(viewRoot, { level });
  } else if (activeTab === "learn") {
    mountLearnView(viewRoot, {
      userId: currentUserId,
      onXpChange: (totalXp) => {
        currentXp = totalXp;
        renderHeader(); // la barre XP en haut se met à jour immédiatement
      },
    });
  }
}

boot();
