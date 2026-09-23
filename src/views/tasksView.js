import { listClients } from "../clients/clientsApi.js";
import { listTasks, createTask, completeTask } from "../tasks/tasksApi.js";
import { TASK_TYPE_LABELS, PRIORITY_LABELS, PRIORITY_COLORS, PRIORITY_ORDER } from "../tasks/constants.js";
import { grantXPRemote } from "../xp/xpRemote.js";
import { XP_VALUES } from "../xp/constants.js";

export async function mountTasksView(container, { level, userId, onXpChange }) {
  if (level < 2) {
    container.innerHTML = `
      <div class="card">
        <div class="card-title">🔒 Tasks</div>
        <div class="placeholder-note">
          Se débloque au Niveau 2 (CSM Confirmé, 500 XP). Continue à répondre
          aux quiz et aux leçons dans l'onglet Learn pour progresser.
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `<div class="card"><div class="placeholder-note">Chargement...</div></div>`;

  let clients, tasks;
  try {
    [clients, tasks] = await Promise.all([listClients(), listTasks(userId)]);
  } catch (err) {
    container.innerHTML = `<div class="card"><div class="placeholder-note">Erreur de chargement : ${escapeHtml(err.message)}</div></div>`;
    return;
  }

  const clientsById = Object.fromEntries(clients.map((c) => [c.id, c]));
  const today = new Date().toISOString().slice(0, 10);

  render();

  function render() {
    const pending = tasks
      .filter((t) => t.status === "pending")
      .sort((a, b) => a.due_date.localeCompare(b.due_date) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    const done = tasks
      .filter((t) => t.status === "done")
      .sort((a, b) => (b.completed_at || "").localeCompare(a.completed_at || ""));

    container.innerHTML = `
      <div class="card">
        <div class="card-title">Nouvelle tâche</div>
        <form id="task-form">
          <select id="task-client" class="answer-btn" style="margin-bottom:8px; cursor:pointer;">
            ${clients.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("")}
          </select>
          <select id="task-type" class="answer-btn" style="margin-bottom:8px; cursor:pointer;">
            ${Object.entries(TASK_TYPE_LABELS)
              .map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`)
              .join("")}
          </select>
          <input id="task-title" class="answer-btn" style="margin-bottom:8px; cursor:text;" type="text" placeholder="Titre de la tâche (ex : appel de suivi)" />
          <input id="task-due" class="answer-btn" style="margin-bottom:8px; cursor:text;" type="date" value="${today}" />
          <select id="task-priority" class="answer-btn" style="margin-bottom:8px; cursor:pointer;">
            <option value="high">Priorité haute</option>
            <option value="medium" selected>Priorité moyenne</option>
            <option value="low">Priorité basse</option>
          </select>
          <button type="submit" class="btn btn-primary">Créer la tâche</button>
          <div id="task-form-message" style="font-size:12px; color:var(--text-muted); margin-top:8px;"></div>
        </form>
      </div>

      <div class="card">
        <div class="card-title">Tâches en cours (${pending.length})</div>
        ${
          pending.length
            ? pending.map((t) => renderTaskRow(t)).join("")
            : `<div class="placeholder-note">Aucune tâche en cours.</div>`
        }
      </div>

      <div class="card">
        <div class="card-title">Tâches terminées (${done.length})</div>
        ${
          done.length
            ? done
                .map(
                  (t) => `
                <div style="padding:8px 0; border-bottom:1px solid var(--border); font-size:13px; color:var(--text-muted);">
                  ✅ ${escapeHtml(clientsById[t.client_id]?.name || t.client_id)} · ${escapeHtml(TASK_TYPE_LABELS[t.type] || t.type)} — ${escapeHtml(t.title)}
                </div>
              `
                )
                .join("")
            : `<div class="placeholder-note">Rien pour l'instant.</div>`
        }
      </div>
    `;

    function renderTaskRow(t) {
      const overdue = t.due_date < today;
      const client = clientsById[t.client_id];
      return `
        <div class="task-row" data-task-id="${t.id}" style="padding:10px 0; border-bottom:1px solid var(--border);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
            <div>
              <div style="font-weight:500;">${escapeHtml(client?.name || t.client_id)} · ${escapeHtml(TASK_TYPE_LABELS[t.type] || t.type)}</div>
              <div style="font-size:13px; color:var(--text-muted); margin-top:2px;">${escapeHtml(t.title)}</div>
            </div>
            <span class="badge ${PRIORITY_COLORS[t.priority]}">${PRIORITY_LABELS[t.priority] || t.priority}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <span style="font-size:12px; color:${overdue ? "var(--red)" : "var(--text-muted)"};">
              ${overdue ? "⚠ En retard — " : "Échéance : "}${new Date(t.due_date).toLocaleDateString("fr-FR")}
            </span>
            <button class="btn btn-primary complete-btn" data-task-id="${t.id}" style="margin-top:0; padding:6px 12px; font-size:12px;">
              Marquer comme fait (+${XP_VALUES.taskComplete} XP)
            </button>
          </div>
        </div>
      `;
    }

    container.querySelector("#task-form").addEventListener("submit", handleCreateTask);
    container.querySelectorAll(".complete-btn").forEach((btn) => {
      btn.addEventListener("click", () => handleCompleteTask(btn.dataset.taskId, btn));
    });
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    const clientId = container.querySelector("#task-client").value;
    const type = container.querySelector("#task-type").value;
    const title = container.querySelector("#task-title").value.trim();
    const dueDate = container.querySelector("#task-due").value;
    const priority = container.querySelector("#task-priority").value;
    const messageEl = container.querySelector("#task-form-message");
    const submitBtn = container.querySelector("#task-form button[type=submit]");

    if (!title || !dueDate) {
      messageEl.textContent = "Renseigne au moins un titre et une échéance.";
      return;
    }

    submitBtn.disabled = true;
    messageEl.textContent = "Création...";

    // taskId généré ici, avant l'appel réseau : un retry réutilise le même
    // id, donc pas de tâche en double.
    const taskId = crypto.randomUUID();

    try {
      await createTask({ taskId, userId, clientId, type, title, dueDate, priority });
      tasks = await listTasks(userId);
      render();
    } catch (err) {
      submitBtn.disabled = false;
      messageEl.textContent = `Erreur : ${err.message}`;
    }
  }

  async function handleCompleteTask(taskId, btn) {
    btn.disabled = true;
    btn.textContent = "Enregistrement...";

    try {
      await completeTask(taskId);
      const xpResult = await grantXPRemote({
        userId,
        eventId: `task_${taskId}`,
        amount: XP_VALUES.taskComplete,
        reason: "Tâche terminée",
        source: "task",
      });
      if (xpResult.error) throw new Error(xpResult.error);
      if (xpResult.totalXp !== null) onXpChange?.(xpResult.totalXp);

      tasks = await listTasks(userId);
      render();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = "Réessayer";
    }
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
