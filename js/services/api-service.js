import { generateId } from "../utils/id-generator.js";

const API_URL = "https://jsonplaceholder.typicode.com/todos";
const MAX_TODOS = 25;

export async function fetchTodos() {
  let response;

  try {
    response = await fetch(`${API_URL}?_limit=${MAX_TODOS}`);
  } catch (error) {
    throw new Error("No se pudo conectar con el servidor. Revisa tu conexión a internet.");
  }