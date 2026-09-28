// Toast notifications pour les gains XP — demandé explicitement dans le
// prompt CSM Simulator ("Toast notifications pour les gains XP"). Pas de
// dépendance : un petit élément flottant au-dessus de la tab bar,
// empilable si plusieurs XP tombent d'affilée.

let container = null;

function ensureContainer() {
  if (container && document.body.contains(container)) return container;
  container = document.createElement("div");
  container.id = "toast-container";
  container.style.cssText = `
    position: fixed;
    left: 50%;
    bottom: calc(78px + env(safe-area-inset-bottom, 0px));
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: 8px;
    pointer-events: none;
    width: 100%;
    max-width: 380px;
    padding: 0 16px;
  `;
  document.body.appendChild(container);
  return container;
}

export function showToast(message) {
  const root = ensureContainer();
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = `
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 10px 16px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  `;
  root.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => toast.remove(), 250);
  }, 2200);
}

export function showXpToast(amount) {
  showToast(`+${amount} XP`);
}
