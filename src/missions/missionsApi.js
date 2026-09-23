import { supabase } from "../lib/supabaseClient.js";

// Enregistre qu'un client a été consulté. Idempotent : primary key
// (user_id, client_id) côté base, donc revoir 10 fois la même fiche ne
// crée qu'une seule ligne. Non-bloquant à l'appel (voir clientDetailView).
export async function logClientView(userId, clientId) {
  const { error } = await supabase
    .from("client_views")
    .upsert({ user_id: userId, client_id: clientId }, { onConflict: "user_id,client_id", ignoreDuplicates: true });
  if (error) throw error;
}

export async function getViewedClientIds(userId) {
  const { data, error } = await supabase.from("client_views").select("client_id").eq("user_id", userId);
  if (error) throw error;
  return data.map((row) => row.client_id);
}

export async function getUserNotesCount(userId) {
  const { count, error } = await supabase
    .from("client_notes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count ?? 0;
}

export async function getMissionProgress(userId, missionId) {
  const { data, error } = await supabase
    .from("mission_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .maybeSingle();
  if (error) throw error;
  return data; // null si la mission n'a jamais été commencée
}

// N'écrase QUE risk_client_id : si la mission est déjà 'completed' par
// ailleurs, cet appel ne touche pas au statut ni à completed_at.
export async function submitRiskAnswer({ userId, missionId, clientId }) {
  const { error } = await supabase
    .from("mission_progress")
    .upsert(
      { user_id: userId, mission_id: missionId, risk_client_id: clientId, updated_at: new Date().toISOString() },
      { onConflict: "user_id,mission_id" }
    );
  if (error) throw error;
}

// N'écrase QUE status/completed_at — même logique de mise à jour partielle.
export async function markMissionCompleted(userId, missionId) {
  const { error } = await supabase
    .from("mission_progress")
    .upsert(
      {
        user_id: userId,
        mission_id: missionId,
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,mission_id" }
    );
  if (error) throw error;
}
