// Une leçon débloquée par une mission ne l'est que si cette mission est
// réellement marquée 'completed' en base — jamais déduit autrement.
// Une leçon débloquée par un niveau utilise le niveau réel dérivé de l'XP
// en base (getLevelProgress), jamais une valeur déclarée par l'app.
export function isLessonUnlocked(lesson, missionProgressById, level) {
  if (lesson.unlock.type === "start") return true;
  if (lesson.unlock.type === "mission") {
    return missionProgressById[lesson.unlock.missionId]?.status === "completed";
  }
  if (lesson.unlock.type === "level") {
    return level >= lesson.unlock.level;
  }
  return false;
}
