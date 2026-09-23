import { supabase } from "../lib/supabaseClient.js";

export async function listClients() {
  const { data, error } = await supabase.from("clients").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function getClient(id) {
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function listNotes(clientId) {
  const { data, error } = await supabase
    .from("client_notes")
    .select("*")
    .eq("client_id", clientId)
    .order("occurred_at", { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Ajoute une note personnelle. `noteId` est généré par l'appelant
 * (crypto.randomUUID()) AVANT l'appel réseau, pour qu'un retry (même
 * requête renvoyée deux fois) réutilise le même id plutôt que d'en
 * créer une deuxième — même logique d'idempotence que pour l'XP.
 */
export async function addNote({ noteId, clientId, userId, type, content }) {
  const { error } = await supabase.from("client_notes").insert({
    id: noteId,
    client_id: clientId,
    user_id: userId,
    type,
    content,
  });
  // 23505 = contrainte unique déjà là (id déjà inséré) : pas une vraie
  // erreur, juste un retry qui retombe sur la même note.
  if (error && error.code !== "23505") throw error;
}
