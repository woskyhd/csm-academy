// Une leçon débloquée par une mission ne l'est que si cette mission est
// réellement marquée 'completed' en base — jamais déduit autrement.
export function isLessonUnlocked(lesson, missionProgressById) {
  if (lesson.unlock.type === "start") return true;
  if (lesson.unlock.type === "mission") {
    return missionProgressById[lesson.unlock.missionId]?.status === "completed";
  }
  return false;
}
