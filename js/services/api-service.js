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

  if (!response.ok) {
    throw new Error(`El servidor respondió con un error (código ${response.status}).`);
  }

  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error("La respuesta del servidor no tiene un formato válido.");
  }

  if (!Array.isArray(data)) {
    throw new Error("La respuesta del servidor no tiene un formato válido.");
  }