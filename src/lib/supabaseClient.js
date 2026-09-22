import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Erreur volontairement bruyante : mieux vaut planter tout de suite
  // et comprendre pourquoi, que d'avoir un plantage silencieux plus loin.
  throw new Error(
    "Configuration Supabase manquante. Vérifie que .env.local contient VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(url, anonKey);
