import { supabase } from "../lib/supabaseClient.js";

export async function listTasks(userId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });
  if (error) throw error;
  return data;
}

// taskId généré par l'appelant (crypto.randomUUID()) AVANT l'appel réseau —
// même logique d'idempotence qu'ailleurs dans l'app (notes, XP) : un retry
// réutilise le même id plutôt que de créer une deuxième tâche.
export async function createTask({ taskId, userId, clientId, type, title, dueDate, priority }) {
  const { error } = await supabase.from("tasks").insert({
    id: taskId,
    user_id: userId,
    client_id: clientId,
    type,
    title,
    due_date: dueDate,
    priority,
  });
  if (error && error.code !== "23505") throw error;
}

// Le filtre .eq("status", "pending") empêche un double-appel (double-clic,
// retry réseau) d'écraser completed_at une deuxième fois : idempotent au
// niveau de la base, pas seulement de l'app.
export async function completeTask(taskId) {
  const { error } = await supabase
    .from("tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", taskId)
    .eq("status", "pending");
  if (error) throw error;
}
