import { generateId } from "../utils/id-generator.js";
import { getTasks, saveTasks } from "./storage-service.js";

function normalizeTitle(title) {
  return title.trim().toLowerCase();
}

export function addTask({ title, completed = false, createdAt } = {}) {
  const cleanTitle = typeof title === "string" ? title.trim() : "";