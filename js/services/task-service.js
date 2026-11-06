import { generateId } from "../utils/id-generator.js";
import { getTasks, saveTasks } from "./storage-service.js";

function normalizeTitle(title) {
  return title.trim().toLowerCase();
}

export function addTask({ title, completed = false, createdAt } = {}) {
  const cleanTitle = typeof title === "string" ? title.trim() : "";

  if (!cleanTitle) {
    return null;
  }

  const task = {
    id: generateId(),
    title: cleanTitle,
    createdAt: createdAt ?? new Date().toISOString(),
    completed: Boolean(completed),
    imported: false,
  };

  saveTasks([...getTasks(), task]);
  return task;
}