// Barre d'onglets en bas de l'écran. Simple composant sans framework :
// il reçoit l'onglet actif et une fonction à appeler au clic.

const TABS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "clients", label: "Clients", icon: "👥" },
  { id: "tasks", label: "Tasks", icon: "✅" },
  { id: "learn", label: "Learn", icon: "🎓" },
];

/**
 * @param {HTMLElement} container
 * @param {{ activeTab: string, onTabChange: (tabId: string) => void }} opts
 */
export function mountTabBar(container, { activeTab, onTabChange }) {
  container.innerHTML = `
    <nav class="tab-bar">
      ${TABS.map(
        (tab) => `
        <button
          type="button"
          class="tab-btn ${tab.id === activeTab ? "active" : ""}"
          data-tab="${tab.id}"
        >
          <span class="tab-icon">${tab.icon}</span>
          <span>${tab.label}</span>
        </button>
      `
      ).join("")}
    </nav>
  `;

  container.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => onTabChange(btn.dataset.tab));
  });
}
