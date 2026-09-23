import { mountQuiz } from "../quiz/quiz.js";
import { level1Questions } from "../quiz/data/level1-questions.js";

// Pour l'instant, Learn n'héberge que le quiz Niveau 1 déjà construit.
// À l'étape 4, il sera réorganisé en vraies leçons (concept + exemple +
// erreur fréquente + mini-quiz), avec ce même moteur de quiz réutilisé
// pour la partie mini-quiz de chaque leçon.
export function mountLearnView(container, { userId, onXpChange }) {
  container.innerHTML = `
    <div class="card">
      <div class="card-title">Quiz — Niveau 1</div>
      <div class="placeholder-note" style="margin-bottom:12px;">
        Les vraies leçons (concept, exemple, erreur fréquente) arrivent à
        l'étape 4. En attendant, voici le quiz déjà fonctionnel.
      </div>
    </div>
    <div id="learn-quiz-root"></div>
  `;

  mountQuiz(document.getElementById("learn-quiz-root"), {
    levelId: "level1",
    userId,
    questions: level1Questions,
    onXpChange,
  });
}
