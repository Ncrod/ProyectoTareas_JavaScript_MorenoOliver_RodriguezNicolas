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

    if (!cleanTitle) {
      return null;
    }

    updated.title = cleanTitle;
  }

  if ("completed" in changes) {
    updated.completed = Boolean(changes.completed);
  }

  tasks[index] = updated;
  saveTasks(tasks);
  return updated;
}

export function deleteTask(id) {
  const tasks = getTasks();
  const remaining = tasks.filter((task) => task.id !== id);

  if (remaining.length === tasks.length) {
    return false;
  }

  saveTasks(remaining);
  return true;
}

export function toggleTask(id) {
  const tasks = getTasks();
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return null;
  }

  task.completed = !task.completed;
  saveTasks(tasks);
  return task;
}

export function completeAll() {
  const tasks = getTasks().map((task) => ({ ...task, completed: true }));

  saveTasks(tasks);
  return tasks;
}

export function clearAll() {
  saveTasks([]);
  return [];
}

export function addImportedTasks(importedTasks) {
  if (!Array.isArray(importedTasks)) {
    return [];
  }

  const current = getTasks();
  const knownTitles = new Set(
    current.filter((task) => task.imported).map((task) => normalizeTitle(task.title))
  );
  const toAdd = [];

  for (const task of importedTasks) {
    if (typeof task?.title !== "string") {
      continue;
    }

    const key = normalizeTitle(task.title);

    if (knownTitles.has(key)) {
      continue;
    }

    knownTitles.add(key);
    toAdd.push({ ...task, imported: true });
  }
