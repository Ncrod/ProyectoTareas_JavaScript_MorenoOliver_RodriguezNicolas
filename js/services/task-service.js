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

export function updateTask(id, changes = {}) {
  const tasks = getTasks();
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1 || tasks[index].imported) {
    return null;
  }

  const updated = { ...tasks[index] };

  if ("title" in changes) {
    const cleanTitle = String(changes.title).trim();