import { supabase } from "../lib/supabaseClient.js";

export async function getLessonProgress(userId, lessonId) {
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (error) throw error;
  return data; // null si jamais commencée
}

export async function getAllLessonProgress(userId) {
  const { data, error } = await supabase.from("lesson_progress").select("lesson_id, status").eq("user_id", userId);
  if (error) throw error;
  return data;
}

// N'écrase QUE status/completed_at, comme markMissionCompleted.
export async function markLessonCompleted(userId, lessonId) {
  const { error } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );
  if (error) throw error;
}
