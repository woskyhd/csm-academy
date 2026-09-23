import { mountQuiz } from "../quiz/quiz.js";
import { level1Questions } from "../quiz/data/level1-questions.js";
import { LESSONS, LOCKED_FUTURE_LESSONS } from "../lessons/constants.js";
import { getAllLessonProgress } from "../lessons/lessonsApi.js";
import { isLessonUnlocked } from "../lessons/unlock.js";
import { getMissionProgress } from "../missions/missionsApi.js";

// Hub des leçons : liste des leçons (débloquées/verrouillées selon les
// missions terminées), plus le quiz Niveau 1 déjà fonctionnel en dessous
// (indépendant du système de leçons).
export async function mountLearnView(container, { userId, onXpChange, onOpenLesson }) {
  container.innerHTML = `<div class="card"><div class="placeholder-note">Chargement...</div></div>`;

  const missionIdsNeeded = [...new Set(LESSONS.filter((l) => l.unlock.type === "mission").map((l) => l.unlock.missionId))];

  let lessonProgressList = [];
  const missionProgressById = {};
  let loadError = null;
  try {
    const [progressList, ...missionProgresses] = await Promise.all([
      getAllLessonProgress(userId),
      ...missionIdsNeeded.map((id) => getMissionProgress(userId, id)),
    ]);
    lessonProgressList = progressList;
    missionIdsNeeded.forEach((id, i) => (missionProgressById[id] = missionProgresses[i]));
  } catch (err) {
    loadError = err.message;
  }

  const progressByLessonId = Object.fromEntries(lessonProgressList.map((p) => [p.lesson_id, p]));

  container.innerHTML = `
    <div class="card">
      <div class="card-title">Leçons</div>
      ${
        loadError
          ? `<div class="placeholder-note">Impossible de charger les leçons : ${escapeHtml(loadError)}</div>`
          : ""
      }
      ${LESSONS.map((lesson) => {
        const unlocked = !loadError && isLessonUnlocked(lesson, missionProgressById);
        const completed = progressByLessonId[lesson.id]?.status === "completed";
        return `
          <div class="lesson-item ${unlocked ? "" : "locked"}" data-lesson-id="${lesson.id}" style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border); ${unlocked ? "cursor:pointer;" : "opacity:0.5;"}">
            <div>
              <div style="font-weight:500;">${completed ? "✅ " : unlocked ? "" : "🔒 "}${escapeHtml(lesson.title)}</div>
              <div style="font-size:12px; color:var(--text-muted);">${
                unlocked ? `${lesson.xpReward} XP` : "Se débloque en terminant la mission « Connais ton portefeuille »"
              }</div>
            </div>
          </div>
        `;
      }).join("")}
      ${LOCKED_FUTURE_LESSONS.map(
        (title) => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border); opacity:0.4;">
            <div style="font-weight:500;">🔒 ${escapeHtml(title)}</div>
            <div style="font-size:12px; color:var(--text-muted);">Bientôt</div>
          </div>
        `
      ).join("")}
    </div>

    <div class="card">
      <div class="card-title">Quiz — Niveau 1</div>
      <div class="placeholder-note" style="margin-bottom:12px;">Entraîne-toi avec le quiz Niveau 1, indépendant des leçons ci-dessus.</div>
      <div id="learn-quiz-root"></div>
    </div>
  `;

  if (!loadError) {
    container.querySelectorAll(".lesson-item:not(.locked)").forEach((el) => {
      el.addEventListener("click", () => onOpenLesson?.(el.dataset.lessonId));
    });
  }

  mountQuiz(document.getElementById("learn-quiz-root"), {
    levelId: "level1",
    userId,
    questions: level1Questions,
    onXpChange,
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
