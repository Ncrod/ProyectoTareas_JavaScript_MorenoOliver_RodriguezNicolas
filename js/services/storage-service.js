const STORAGE_KEY = "tasks";

export function getTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
