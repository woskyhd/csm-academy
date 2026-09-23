export function mountTasksView(container, { level }) {
  if (level < 2) {
    container.innerHTML = `
      <div class="card">
        <div class="card-title">🔒 Tasks</div>
        <div class="placeholder-note">
          Se débloque au Niveau 2 (CSM Confirmé, 500 XP). Continue à répondre
          aux quiz dans l'onglet Learn pour progresser.
        </div>
      </div>
    `;
    return;
  }
  container.innerHTML = `
    <div class="card">
      <div class="card-title">Tasks</div>
      <div class="placeholder-note">
        Niveau débloqué — la création de tâches par client arrive à l'étape 5
        de la construction.
      </div>
    </div>
  `;
}
