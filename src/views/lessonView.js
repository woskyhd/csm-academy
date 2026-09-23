import { getLesson } from "../lessons/constants.js";
import { getLessonProgress, markLessonCompleted } from "../lessons/lessonsApi.js";
import { grantXPRemote } from "../xp/xpRemote.js";

// Une leçon = concept + exemple concret + erreur fréquente, puis un
// mini-quiz qu'il faut réussir (avec retries illimités) pour valider la
// leçon. L'XP n'est accordée qu'une fois toutes les questions passées
// correctement, de façon idempotente comme le reste de l'app.
export async function mountLessonView(container, { lessonId, userId, onBack, onXpChange }) {
  const lesson = getLesson(lessonId);
  container.innerHTML = `<div class="card"><div class="placeholder-note">Chargement...</div></div>`;

  if (!lesson) {
    container.innerHTML = `
      <button class="btn" id="back-btn" style="background:var(--surface); color:var(--text); margin-top:0; margin-bottom:12px;">← Retour</button>
      <div class="card"><div class="placeholder-note">Leçon introuvable.</div></div>
    `;
    container.querySelector("#back-btn").addEventListener("click", onBack);
    return;
  }

  let progress;
  try {
    progress = await getLessonProgress(userId, lessonId);
  } catch (err) {
    container.innerHTML = `<div class="card"><div class="placeholder-note">Erreur de chargement : ${escapeHtml(err.message)}</div></div>`;
    return;
  }

  let quizIndex = 0;
  let selectedAnswer = null;
  let validated = false;
  const alreadyCompleted = progress?.status === "completed";

  renderIntro();

  function renderIntro() {
    container.innerHTML = `
      <button class="btn" id="back-btn" style="background:var(--surface); color:var(--text); margin-top:0; margin-bottom:12px;">← Retour</button>

      <div class="card">
        <div class="card-title">${escapeHtml(lesson.title)}</div>
        ${
          alreadyCompleted
            ? `<div class="badge green" style="margin-bottom:10px;">Leçon terminée — +${lesson.xpReward} XP</div>`
            : `<div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">Récompense : ${lesson.xpReward} XP</div>`
        }
        <div class="placeholder-note" style="margin-bottom:10px;"><strong style="color:var(--text);">Concept — </strong>${escapeHtml(lesson.concept)}</div>
        <div class="placeholder-note" style="margin-bottom:10px;"><strong style="color:var(--text);">Exemple concret — </strong>${escapeHtml(lesson.example)}</div>
        <div class="placeholder-note"><strong style="color:var(--text);">Erreur fréquente — </strong>${escapeHtml(lesson.commonMistake)}</div>
      </div>

      <div class="card">
        <div class="card-title">Mini-quiz</div>
        <div id="lesson-quiz-root"></div>
      </div>
    `;
    container.querySelector("#back-btn").addEventListener("click", onBack);
    renderQuiz();
  }

  function renderQuiz() {
    const root = container.querySelector("#lesson-quiz-root");

    if (quizIndex >= lesson.quiz.length) {
      renderQuizDone(root);
      return;
    }

    const q = lesson.quiz[quizIndex];
    root.innerHTML = `
      <div class="quiz-meta" style="margin-bottom:8px;"><span>Question ${quizIndex + 1} / ${lesson.quiz.length}</span></div>
      <div class="quiz-question">${escapeHtml(q.question)}</div>
      <div class="quiz-answers" id="lesson-answers"></div>
      <button class="btn btn-primary" id="lesson-validate-btn" disabled>Valider</button>
      <div id="lesson-feedback-zone"></div>
    `;

    const answersEl = root.querySelector("#lesson-answers");
    q.options.forEach((text, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answer-btn";
      btn.textContent = text;
      btn.dataset.index = String(i);
      btn.addEventListener("click", () => selectAnswer(i, root));
      answersEl.appendChild(btn);
    });

    root.querySelector("#lesson-validate-btn").addEventListener("click", () => validateAnswer(root, q));
  }

  function selectAnswer(i, root) {
    if (validated) return;
    selectedAnswer = i;
    root.querySelectorAll(".answer-btn").forEach((btn) => {
      btn.classList.toggle("selected", Number(btn.dataset.index) === i);
    });
    root.querySelector("#lesson-validate-btn").disabled = false;
  }

  async function validateAnswer(root, q) {
    if (validated || selectedAnswer === null) return;
    validated = true;
    const isCorrect = selectedAnswer === q.correctIndex;

    root.querySelectorAll(".answer-btn").forEach((btn) => {
      const i = Number(btn.dataset.index);
      btn.disabled = true;
      if (i === q.correctIndex) btn.classList.add("correct");
      else if (i === selectedAnswer) btn.classList.add("incorrect");
    });
    root.querySelector("#lesson-validate-btn").disabled = true;

    const zone = root.querySelector("#lesson-feedback-zone");
    zone.innerHTML = `
      <div class="feedback ${isCorrect ? "correct" : "incorrect"}">
        <div class="feedback-title">${isCorrect ? "Correct !" : "Pas tout à fait."}</div>
        <div class="feedback-body">${escapeHtml(q.explanation)}</div>
      </div>
      <button class="btn btn-primary" id="lesson-next-btn">${isCorrect ? "Continuer" : "Réessayer"}</button>
    `;
    zone.querySelector("#lesson-next-btn").addEventListener("click", () => {
      if (isCorrect) quizIndex++;
      selectedAnswer = null;
      validated = false;
      renderQuiz();
    });
  }

  async function renderQuizDone(root) {
    root.innerHTML = `<div class="placeholder-note">Quiz terminé — les ${lesson.quiz.length} question(s) ont été validées.</div>`;

    if (alreadyCompleted) return;

    try {
      const xpResult = await grantXPRemote({
        userId,
        eventId: `lesson_${lessonId}`,
        amount: lesson.xpReward,
        reason: `Leçon terminée — ${lesson.title}`,
        source: "lesson",
      });
      if (xpResult.error) throw new Error(xpResult.error);
      await markLessonCompleted(userId, lessonId);
      if (xpResult.totalXp !== null) onXpChange?.(xpResult.totalXp);
      root.innerHTML += `<div class="badge green" style="margin-top:10px;">+${lesson.xpReward} XP</div>`;
    } catch (err) {
      root.innerHTML += `<div class="placeholder-note" style="color:var(--red); margin-top:10px;">XP non enregistrée (problème réseau) — recharge la page pour réessayer.</div>`;
    }
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
