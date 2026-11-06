import { generateId } from "../utils/id-generator.js";
import { getTasks, saveTasks } from "./storage-service.js";

function normalizeTitle(title) {
  return title.trim().toLowerCase();
}