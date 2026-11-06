const STORAGE_KEY = "tasks";

export function getTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw === null) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("No se pudieron leer las tareas guardadas:", error);
    return [];
  }
}

export function saveTasks(tasks) {
    try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;