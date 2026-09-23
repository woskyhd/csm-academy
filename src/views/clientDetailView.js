import { getClient, listNotes, addNote } from "../clients/clientsApi.js";
import { logClientView } from "../missions/missionsApi.js";
import { grantXPRemote } from "../xp/xpRemote.js";
import { XP_VALUES } from "../xp/constants.js";
import {
  calculateHealthScore,
  healthScoreColor,
  statusBadgeColor,
  statusLabel,
  daysUntil,
  HEALTH_WEIGHTS,
} from "../clients/healthScore.js";
import { getWhatShouldIDoNext } from "../clients/whatNext.js";

const HEALTH_LABELS = {
  usage: "Product Usage",
  engagement: "Engagement",
  support: "Support",
  satisfaction: "Satisfaction (NPS)",
  relationship: "Relationship",
  goals: "Goal Achievement",
};

const NOTE_TYPE_LABELS = { call: "Appel", email: "Email", qbr: "QBR", support: "Support", note: "Note" };

export async function mountClientDetailView(container, { clientId, userId, onBack, onXpChange }) {
  container.innerHTML = `<div class="card"><div class="placeholder-note">Chargement...</div></div>`;

  let client, notes;
  try {
    [client, notes] = await Promise.all([getClient(clientId), listNotes(clientId)]);
  } catch (err) {
    container.innerHTML = `<div class="card"><div class="placeholder-note">Erreur de chargement : ${escapeHtml(err.message)}</div></div>`;
    return;
  }

  // Enregistre la consultation de cette fiche (sert à la Mission 1).
  // Non-bloquant : un échec ici ne doit jamais empêcher de voir la fiche.
  logClientView(userId, clientId).catch(() => {});

  render();

  function render() {
    const score = calculateHealthScore(client);
    const color = healthScoreColor(score);
    const days = daysUntil(client.renewal_date);
    const actions = getWhatShouldIDoNext(client, notes);

    container.innerHTML = `
      <button class="btn" id="back-btn" style="background:var(--surface); color:var(--text); margin-top:0; margin-bottom:12px;">← Retour</button>

      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-size:18px; font-weight:600;">${escapeHtml(client.name)}</div>
            <div style="font-size:13px; color:var(--text-muted);">${escapeHtml(client.sector)} · ${escapeHtml(client.segment)}</div>
          </div>
          <span class="badge ${statusBadgeColor(client.status)}">${statusLabel(client.status)}</span>
        </div>
        <div style="margin-top:12px; font-size:13px; color:var(--text-muted); line-height:1.8;">
          <div>ARR : <strong style="color:var(--text);">${client.arr.toLocaleString("fr-FR")} €</strong></div>
          <div>NPS : <strong style="color:var(--text);">${client.nps}/10</strong></div>
          <div>Adoption : <strong style="color:var(--text);">${client.adoption_pct}%</strong></div>
          <div>Renouvellement : <strong style="color:var(--text);">${days} jours</strong></div>
          ${client.open_support_tickets > 0 ? `<div>Tickets support ouverts : <strong style="color:var(--orange);">${client.open_support_tickets}</strong></div>` : ""}
        </div>
        ${client.context_note ? `<div class="placeholder-note" style="margin-top:10px;">${escapeHtml(client.context_note)}</div>` : ""}
      </div>

      <div class="card">
        <div class="card-title">Health Score : ${score}/100</div>
        <div class="xp-track" style="height:8px; margin-bottom:14px;"><div class="xp-fill" style="width:${score}%; background:var(--${color});"></div></div>
        ${Object.keys(HEALTH_LABELS)
          .map((key) => {
            const val = client[`health_${key}`];
            return `
              <div style="margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:3px;">
                  <span>${HEALTH_LABELS[key]} (${Math.round(HEALTH_WEIGHTS[key] * 100)}%)</span>
                  <span>${val}/100</span>
                </div>
                <div class="xp-track"><div class="xp-fill" style="width:${val}%;"></div></div>
              </div>
            `;
          })
          .join("")}
      </div>

      <div class="card">
        <div class="card-title">What should I do next?</div>
        ${actions
          .map(
            (a) => `
              <div style="margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid var(--border);">
                <div style="font-size:14px; font-weight:500;">${escapeHtml(a.title)}</div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${escapeHtml(a.why)}</div>
              </div>
            `
          )
          .join("")}
      </div>

      <div class="card">
        <div class="card-title">Ajouter une note (+${XP_VALUES.clientNote} XP)</div>
        <select id="note-type" class="answer-btn" style="margin-bottom:8px; cursor:pointer;">
          <option value="note">Note</option>
          <option value="call">Appel</option>
          <option value="email">Email</option>
          <option value="qbr">QBR</option>
          <option value="support">Support</option>
        </select>
        <textarea id="note-content" class="answer-btn" style="min-height:70px; cursor:text; resize:vertical;" placeholder="Résumé de l'échange ou observation..."></textarea>
        <button class="btn btn-primary" id="add-note-btn">Enregistrer la note</button>
        <div id="note-message" style="font-size:12px; color:var(--text-muted); margin-top:8px;"></div>
      </div>

      <div class="card">
        <div class="card-title">Timeline</div>
        ${
          notes.length
            ? notes
                .map(
                  (n) => `
                  <div style="margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid var(--border);">
                    <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted);">
                      <span style="font-weight:600; color:var(--text);">${NOTE_TYPE_LABELS[n.type] || n.type}</span>
                      <span>${new Date(n.occurred_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div style="font-size:13px; margin-top:2px;">${escapeHtml(n.content)}</div>
                  </div>
                `
                )
                .join("")
            : `<div class="placeholder-note">Aucune interaction enregistrée.</div>`
        }
      </div>
    `;

    container.querySelector("#back-btn").addEventListener("click", onBack);
    container.querySelector("#add-note-btn").addEventListener("click", handleAddNote);
  }

  async function handleAddNote() {
    const type = container.querySelector("#note-type").value;
    const content = container.querySelector("#note-content").value.trim();
    const messageEl = container.querySelector("#note-message");
    const btn = container.querySelector("#add-note-btn");

    if (!content) {
      messageEl.textContent = "Écris quelque chose avant d'enregistrer.";
      return;
    }

    btn.disabled = true;
    messageEl.textContent = "Enregistrement...";

    // noteId généré ici, avant l'appel réseau : un retry réutilise le
    // même id, donc pas de note en double ni de double XP.
    const noteId = crypto.randomUUID();

    try {
      await addNote({ noteId, clientId, userId, type, content });
      const xpResult = await grantXPRemote({
        userId,
        eventId: `note_${noteId}`,
        amount: XP_VALUES.clientNote,
        reason: `Note ajoutée — ${client.name}`,
        source: "client_note",
      });
      if (xpResult.totalXp !== null) onXpChange?.(xpResult.totalXp);

      notes = await listNotes(clientId);
      render();
    } catch (err) {
      btn.disabled = false;
      messageEl.textContent = `Erreur : ${err.message}`;
    }
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
