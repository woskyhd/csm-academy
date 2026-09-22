import { supabase } from "../lib/supabaseClient.js";

// Code d'erreur Postgres pour "violation de contrainte unique".
// C'est exactement la contrainte unique(user_id, event_id) du schéma :
// si elle se déclenche, ça veut dire que cet événement XP a déjà été
// traité — ce n'est donc pas une vraie erreur, c'est l'idempotence qui
// fonctionne comme prévu.
const UNIQUE_VIOLATION = "23505";

/**
 * Tente d'attribuer de l'XP pour un événement donné, en base.
 * Idempotent au niveau de la base de données elle-même (pas juste de l'app) :
 * même en cas de double-clic, de requête réseau renvoyée deux fois, ou de
 * deux onglets ouverts en même temps, un même eventId ne peut être inséré
 * qu'une seule fois.
 *
 * @returns {Promise<{granted: boolean, totalXp: number|null, error: string|null}>}
 */
export async function grantXPRemote({ userId, eventId, amount, reason, source }) {
  const { error: insertError } = await supabase.from("xp_transactions").insert({
    user_id: userId,
    event_id: eventId,
    amount,
    reason,
    source,
  });

  if (insertError && insertError.code !== UNIQUE_VIOLATION) {
    return { granted: false, totalXp: null, error: insertError.message };
  }

  const granted = !insertError; // false si on a bloqué sur la contrainte unique

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("xp")
    .eq("id", userId)
    .single();

  if (profileError) {
    return { granted, totalXp: null, error: profileError.message };
  }

  return { granted, totalXp: profile.xp, error: null };
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("xp, level, name, email")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}
