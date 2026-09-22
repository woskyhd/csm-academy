import { XP_VALUES } from "../xp/constants.js";
import { grantXPRemote } from "../xp/xpRemote.js";

const XP_BY_DIFFICULTY = {
  easy: XP_VALUES.quizEasy,
  medium: XP_VALUES.quizMedium,
  hard: XP_VALUES.quizHard,
};

/**
 * Monte un quiz dans `container` à partir d'une liste de questions.
 * `onXpChange(totalXp)` est appelé à chaque fois que l'XP change en base,
 * pour que l'UI parente (badge XP dans le header) se mette à jour.
 */
export function mountQuiz(container, { levelId, userId, questions, onXpChange }) {
  let index = 0;
  let selectedAnswer = null;
  let validated = false;
  let correctCount = 0;
  // attemptId identifie cette session de quiz. Combiné à l'id de question,
  // ça donne un eventId unique par tentative — voir xp/xpRemote.js pour
  // l'idempotence réelle (contrainte unique côté base de données).
  const attemptId = Date.now();

  render();

  function currentQuestion() {
    return questions[index];
  }

  function render() {
    if (index >= questions.length) {
      renderEndScreen();
      return;
    }
    const q = currentQuestion();
    container.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-meta">
          <span>Question ${index + 1} / ${questions.length}</span>
          <span>${q.skill} · +${XP_BY_DIFFICULTY[q.difficulty]} XP</span>
        </div>
        <div class="quiz-question">${escapeHtml(q.question)}</div>
        <div class="quiz-answers" id="answers"></div>
        <button class="btn btn-primary" id="validate-btn" disabled>Valider</button>
        <div id="feedback-zone"></div>
      </div>
    `;

    const answersEl = container.querySelector("#answers");
    q.answers.forEach((answerText, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answer-btn";
      btn.textContent = answerText;
      btn.dataset.index = String(i);
      btn.addEventListener("click", () => selectAnswer(i));
      answersEl.appendChild(btn);
    });

    container.querySelector("#validate-btn").addEventListener("click", validateAnswer);
  }

  function selectAnswer(i) {
    if (validated) return; // on ne change plus la réponse après validation
    selectedAnswer = i;
    container.querySelectorAll(".answer-btn").forEach((btn) => {
      btn.classList.toggle("selected", Number(btn.dataset.index) === i);
    });
    container.querySelector("#validate-btn").disabled = false;
  }

  async function validateAnswer() {
    if (validated || selectedAnswer === null) return;
    validated = true;

    const q = currentQuestion();
    const isCorrect = selectedAnswer === q.correctIndex;
    if (isCorrect) correctCount++;

    // Verrouille les boutons de réponse et affiche correct/incorrect visuellement
    container.querySelectorAll(".answer-btn").forEach((btn) => {
      const i = Number(btn.dataset.index);
      btn.disabled = true;
      if (i === q.correctIndex) btn.classList.add("correct");
      else if (i === selectedAnswer) btn.classList.add("incorrect");
    });
    const validateBtn = container.querySelector("#validate-btn");
    validateBtn.disabled = true;
    validateBtn.textContent = "Enregistrement...";

    let xpOutcome = null;
    if (isCorrect) {
      const eventId = `quiz_${levelId}_${q.id}_attempt_${attemptId}`;
      const amount = XP_BY_DIFFICULTY[q.difficulty];
      const result = await grantXPRemote({
        userId,
        eventId,
        amount,
        reason: `Quiz ${levelId} — ${q.id}`,
        source: "quiz",
      });
      xpOutcome = result;
      if (result.error) {
        // On ne fait pas comme si tout allait bien : l'utilisateur doit
        // savoir que l'XP n'a peut-être pas été sauvegardée.
        console.error("Erreur d'enregistrement XP :", result.error);
      } else if (result.totalXp !== null) {
        onXpChange?.(result.totalXp);
      }
    }

    renderFeedback(isCorrect, q, xpOutcome);
  }

  function renderFeedback(isCorrect, q, xpOutcome) {
    const zone = container.querySelector("#feedback-zone");

    let xpLine = "";
    if (isCorrect) {
      if (xpOutcome?.error) {
        xpLine = `<div class="feedback-label" style="color:var(--red);">⚠️ XP non enregistrée (problème réseau) — réessaie plus tard.</div>`;
      } else {
        xpLine = `<div class="feedback-label">+${XP_BY_DIFFICULTY[q.difficulty]} XP — enregistrée</div>`;
      }
    }

    zone.innerHTML = `
      <div class="feedback ${isCorrect ? "correct" : "incorrect"}">
        <div class="feedback-title">${isCorrect ? "Correct !" : "Pas tout à fait."}</div>
        <div class="feedback-body">${escapeHtml(q.explanation)}</div>
        ${
          !isCorrect
            ? `<div class="feedback-label">Erreur fréquente</div><div class="feedback-body">${escapeHtml(q.commonMistake)}</div>`
            : ""
        }
        ${xpLine}
      </div>
      <button class="btn btn-primary" id="next-btn">
        ${index + 1 < questions.length ? "Question suivante" : "Voir le résultat"}
      </button>
    `;
    zone.querySelector("#next-btn").addEventListener("click", goToNext);
  }

  function goToNext() {
    index++;
    selectedAnswer = null;
    validated = false;
    render();
  }

  function renderEndScreen() {
    container.innerHTML = `
      <div class="quiz-card end-card">
        <div>Quiz terminé</div>
        <div class="score">${correctCount} / ${questions.length}</div>
        <div style="color: var(--text-muted); font-size: 13px;">bonnes réponses</div>
      </div>
    `;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
