// Écran Home. Pour l'instant (étape 1 : structure), seules les sections
// XP/niveau affichent de vraies données — le reste attend les clients
// (étape 2) et les missions (étape 3) pour avoir quelque chose à montrer.
// Volontairement AUCUNE fausse donnée : une section sans données réelles
// dit clairement qu'elle arrive plus tard, plutôt que d'inventer un
// exemple qui aurait l'air réel.

export function mountDashboard(container, { profileName }) {
  container.innerHTML = `
    <div class="card">
      <div class="card-title">Bonjour${profileName ? " " + escapeHtml(profileName) : ""}</div>
      <div class="placeholder-note">
        Bienvenue sur CSM Academy. Le dashboard complet (mission du jour,
        priorités, clients à risque) arrive avec le portefeuille clients —
        étape suivante.
      </div>
    </div>

    <div class="card">
      <div class="card-title">Mission du jour</div>
      <div class="placeholder-note">Pas encore de mission disponible — arrive à l'étape 3.</div>
    </div>

    <div class="card">
      <div class="card-title">3 priorités</div>
      <div class="placeholder-note">Nécessite le portefeuille clients — étape 2.</div>
    </div>

    <div class="card">
      <div class="card-title">Activité récente</div>
      <div class="placeholder-note">Rien pour l'instant.</div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
