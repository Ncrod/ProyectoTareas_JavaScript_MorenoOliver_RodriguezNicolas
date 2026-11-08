const STORAGE_KEY = "tasks";

// Una tarea válida es un objeto con id y title de tipo texto
function isValidTask(task) {
  return (
    typeof task === "object" &&
    task !== null &&
    typeof task.id === "string" &&
    typeof task.title === "string"
  );
}

export function getTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw === null) {
      return [];
    }

    const parsed = JSON.parse(raw);

    // Si la lista trae elementos dañados, se descartan en vez de romper la app
    return Array.isArray(parsed) ? parsed.filter(isValidTask) : [];
  } catch (error) {
    console.error("No se pudieron leer las tareas guardadas:", error);
    return [];
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error("No se pudieron guardar las tareas:", error);
    return false;
  }
}