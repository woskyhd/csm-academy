import { getMissionProgress, markMissionCompleted, markQuizPassed } from "./missionsApi.js";
import { listNotes, addNote } from "../clients/clientsApi.js";
import { grantXPRemote } from "../xp/xpRemote.js";

const CLIENT_ID = "frontlabs";

const QUIZ = {
  question: "Pourquoi Frontlabs est-il un bon candidat pour une proposition d'expansion ?",
  options: [
    "Parce que son ARR est le plus élevé du portefeuille",
    "Parce qu'il combine une adoption très forte (94%), un NPS parfait, et un signal d'expansion déjà détecté",
    "Parce qu'il est en statut Critical et a besoin d'aide",
  ],
  correctIndex: 1,
  feedbackCorrect:
    "Exactement : forte adoption + signal d'expansion + satisfaction élevée sont les indicateurs classiques d'une opportunité d'upsell — pas la taille du compte.",
  feedbackIncorrect:
    "Pas tout à fait — regarde les données de Frontlabs : ARR modeste, mais adoption à 94%, NPS à 10, et signal d'expansion déjà détecté. Ce sont ces indicateurs qui comptent pour repérer une opportunité d'upsell.",
};

export async function mountMission3(container, { mission, userId, level, onBack, onXpChange }) {
  if (level < mission.levelRequired) {
    renderLocked(container, mission, onBack);
    return;
  }

  let notes, progress;
  try {
    [notes, progress] = await Promise.all([listNotes(CLIENT_ID), getMissionProgress(userId, mission.id)]);
  } catch (err) {
    container.innerHTML = `<div class="card"><div class="placeholder-note">Erreur de chargement : ${escapeHtml(err.message)}</div></div>`;
    return;
  }

  let selectedAnswer = null;
  let quizValidated = progress?.quiz_passed === true;

  await render();

  async function render() {
    const req1Done = progress?.quiz_passed === true;
    const req2Done = notes.some((n) => n.client_id === CLIENT_ID && n.type === "proposal" && n.user_id === userId);
    const allDone = req1Done && req2Done;
    let completed = progress?.status === "completed";

    if (allDone && !completed) {
      try {
        const xpResult = await grantXPRemote({
          userId,
          eventId: `mission_${mission.id}`,
          amount: mission.xpReward,
          reason: `Mission accomplie — ${mission.title}`,
          source: "mission",
        });
        if (xpResult.error) throw new Error(xpResult.error);
        await markMissionCompleted(userId, mission.id);
        progress = { ...(progress || {}), status: "completed" };
        completed = true;
        if (xpResult.totalXp !== null) onXpChange?.(xpResult.totalXp);
      } catch (err) {
        // XP non enregistrée : on retentera au prochain affichage.
      }
    }

    container.innerHTML = `
      <button class="btn" id="back-btn" style="background:var(--surface); color:var(--text); margin-top:0; margin-bottom:12px;">← Retour</button>

      <div class="card">
        <div class="card-title">${escapeHtml(mission.title)}</div>
        <div class="placeholder-note">${escapeHtml(mission.description)}</div>
        ${
          completed
            ? `<div class="badge green" style="margin-top:10px;">Mission accomplie — +${mission.xpReward} XP</div>`
            : `<div style="font-size:12px; color:var(--text-muted); margin-top:10px;">Récompense : ${mission.xpReward} XP</div>`
        }
      </div>

      <div class="card">
        <div class="card-title">${req1Done ? "✅" : "⬜"} Identifier l'opportunité</div>
        ${
          req1Done
            ? `<div class="placeholder-note">${escapeHtml(QUIZ.feedbackCorrect)}</div>`
            : `
              <div class="quiz-question" style="margin-bottom:10px;">${escapeHtml(QUIZ.question)}</div>
              <div id="quiz-answers" style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;"></div>
              <button class="btn btn-primary" id="quiz-validate-btn" disabled>Valider</button>
              <div id="quiz-feedback"></div>
            `
        }
      </div>

      <div class="card">
        <div class="card-title">${req2Done ? "✅" : "⬜"} Rédiger la proposition d'expansion et l'enregistrer</div>
        ${
          req2Done
            ? `<div class="placeholder-note">Proposition enregistrée dans la timeline de Frontlabs.</div>`
            : `
              <textarea id="proposal-content" class="answer-btn" style="min-height:90px; cursor:text; resize:vertical;" placeholder="Décris la proposition d'expansion pour Frontlabs (nouveau plan, sièges supplémentaires, etc.)"></textarea>
              <button class="btn btn-primary" id="save-proposal-btn">Enregistrer la proposition</button>
              <div id="proposal-message" style="font-size:12px; color:var(--text-muted); margin-top:8px;"></div>
            `
        }
      </div>
    `;

    container.querySelector("#back-btn").addEventListener("click", onBack);

    if (!req1Done) {
      const answersEl = container.querySelector("#quiz-answers");
      QUIZ.options.forEach((text, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "answer-btn";
        btn.textContent = text;
        btn.dataset.index = String(i);
        btn.addEventListener("click", () => {
          if (quizValidated) return;
          selectedAnswer = i;
          answersEl.querySelectorAll(".answer-btn").forEach((b) => b.classList.toggle("selected", Number(b.dataset.index) === i));
          container.querySelector("#quiz-validate-btn").disabled = false;
        });
        answersEl.appendChild(btn);
      });

      container.querySelector("#quiz-validate-btn").addEventListener("click", async () => {
        if (selectedAnswer === null || quizValidated) return;
        quizValidated = true;
        const isCorrect = selectedAnswer === QUIZ.correctIndex;

        answersEl.querySelectorAll(".answer-btn").forEach((btn) => {
          const i = Number(btn.dataset.index);
          btn.disabled = true;
          if (i === QUIZ.correctIndex) btn.classList.add("correct");
          else if (i === selectedAnswer) btn.classList.add("incorrect");
        });
        container.querySelector("#quiz-validate-btn").disabled = true;

        const feedbackEl = container.querySelector("#quiz-feedback");
        feedbackEl.innerHTML = `
          <div class="feedback ${isCorrect ? "correct" : "incorrect"}">
            <div class="feedback-title">${isCorrect ? "Correct !" : "Pas tout à fait."}</div>
            <div class="feedback-body">${escapeHtml(isCorrect ? QUIZ.feedbackCorrect : QUIZ.feedbackIncorrect)}</div>
          </div>
          ${!isCorrect ? `<button class="btn btn-primary" id="quiz-retry-btn">Réessayer</button>` : ""}
        `;

        if (isCorrect) {
          try {
            await markQuizPassed(userId, mission.id);
            progress = { ...(progress || {}), quiz_passed: true };
          } catch (err) {
            // si l'enregistrement échoue, on retentera au prochain affichage
          }
          await render();
        } else {
          feedbackEl.querySelector("#quiz-retry-btn").addEventListener("click", () => {
            selectedAnswer = null;
            quizValidated = false;
            render();
          });
        }
      });
    }

    if (!req2Done) {
      container.querySelector("#save-proposal-btn").addEventListener("click", async () => {
        const content = container.querySelector("#proposal-content").value.trim();
        const messageEl = container.querySelector("#proposal-message");
        const btn = container.querySelector("#save-proposal-btn");

        if (!content) {
          messageEl.textContent = "Écris quelque chose avant d'enregistrer.";
          return;
        }

        btn.disabled = true;
        messageEl.textContent = "Enregistrement...";

        const noteId = crypto.randomUUID();
        try {
          await addNote({ noteId, clientId: CLIENT_ID, userId, type: "proposal", content });
          notes = await listNotes(CLIENT_ID);
          await render();
        } catch (err) {
          btn.disabled = false;
          messageEl.textContent = `Erreur : ${err.message}`;
        }
      });
    }
  }
}

function renderLocked(container, mission, onBack) {
  container.innerHTML = `
    <button class="btn" id="back-btn" style="background:var(--surface); color:var(--text); margin-top:0; margin-bottom:12px;">← Retour</button>
    <div class="card">
      <div class="card-title">🔒 ${escapeHtml(mission.title)}</div>
      <div class="placeholder-note">Se débloque au Niveau ${mission.levelRequired}.</div>
    </div>
  `;
  container.querySelector("#back-btn").addEventListener("click", onBack);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
