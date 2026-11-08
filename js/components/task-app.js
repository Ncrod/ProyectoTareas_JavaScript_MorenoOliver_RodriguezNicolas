import "./task-list.js";
import "./task-form-modal.js";
import "./import-modal.js";
import { getTasks } from "../services/storage-service.js";
import { addImportedTasks, addTask, clearAll, deleteTask, toggleTask, updateTask } from "../services/task-service.js";

const template = document.createElement("template");

template.innerHTML = `
  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    :host {
      display: block;
    }

    .app {
      display: flex;
      flex-direction: column;
      gap: 65px;
    }

    .header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-4);
    }

    .title {
      margin: 0;
      font-size: var(--font-size-title);
      font-weight: 600;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }

    .search {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      width: 360px;
      max-width: 100%;
      height: 42px;
      padding: 9px 12px;
      border-radius: 80px;
      background: var(--color-surface-raised);
    }

    .search img,
    .btn img {
      flex: none;
      width: 18px;
      height: 18px;
    }

    .search input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      color: var(--color-text);
      font: inherit;
      font-size: var(--font-size-button);
    }

    .search input::placeholder {
      color: var(--color-text-muted);
    }

    .search:focus-within {
      outline: 2px solid var(--color-primary);
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      height: 42px;
      padding: 9px 12px;
      border: none;
      border-radius: var(--radius-button);
      background: var(--color-control);
      color: var(--color-text);
      font: inherit;
      font-size: var(--font-size-button);
      cursor: pointer;
    }

    .btn:hover {
      filter: brightness(1.2);
    }

    .btn:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    .btn.primary {
      background: var(--color-primary);
      color: var(--color-on-primary);
    }
  </style>

  <div class="app">
    <header class="header">
      <h1 class="title">Bandeja de entrada</h1>

      <div class="toolbar">
        <label class="search">
          <img src="public/search.svg" alt="">
          <input class="search-input" type="search" placeholder="Buscar tareas" aria-label="Buscar tareas" autocomplete="off">
        </label>

        <button class="btn primary add" type="button">
          <img src="public/anadir.svg" alt="">
          Añadir tarea
        </button>

        <button class="btn primary import" type="button">
          <img src="public/import.svg" alt="">
          Importar tarea
        </button>

        <button class="btn filter" type="button" aria-label="Filtrar tareas" aria-haspopup="true" aria-expanded="false">
          <img src="public/filtro.svg" alt="">
        </button>

        <button class="btn clear" type="button">
          <img src="public/papelera.svg" alt="">
          Vaciar
        </button>
      </div>
    </header>

    <task-list></task-list>
  </div>

  <task-form-modal></task-form-modal>
  <import-modal></import-modal>
`;

class TaskApp extends HTMLElement {
  // Lista completa de tareas (viene del localStorage)
  #tasks = [];

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));

    const root = this.shadowRoot;
    this.toolbar = root.querySelector(".toolbar");
    this.searchInput = root.querySelector(".search-input");
    this.addButton = root.querySelector(".add");
    this.importButton = root.querySelector(".import");
    this.filterButton = root.querySelector(".filter");
    this.clearButton = root.querySelector(".clear");

    this.addButton.addEventListener("click", () => this.formModal.open());
    this.formModal.addEventListener("task-save", (event) => this.#onTaskSave(event));

    this.importButton.addEventListener("click", () => this.importModal.open());
    this.clearButton.addEventListener("click", () => this.#onClear());
    this.importModal.addEventListener("tasks-import", (event) => this.#onTasksImport(event));

    // Eventos que salen de cada <task-item> (burbujean hasta la lista)
    this.list.addEventListener("task-toggle", (event) => this.#onTaskToggle(event));
    this.list.addEventListener("task-edit", (event) => this.#onTaskEdit(event));
    this.list.addEventListener("task-delete", (event) => this.#onTaskDelete(event));
    this.list = root.querySelector("task-list");
    this.formModal = root.querySelector("task-form-modal");
    this.importModal = root.querySelector("import-modal");
  }

  connectedCallback() {
    this.#loadTasks();
  }

  // Lee las tareas guardadas y vuelve a dibujar
  #loadTasks() {
    this.#tasks = getTasks();
    this.#render();
  }

  // Opción "Actualizar" de una tarea: abre el formulario con sus datos
  #onTaskEdit(event) {
    const task = this.#tasks.find((item) => item.id === event.detail.id);

    if (task) {
      this.formModal.open({ task });
    }
  }

  // Opción "Eliminar" de una tarea (la confirmación se agrega en el punto 4.1)
  #onTaskDelete(event) {
    deleteTask(event.detail.id);
    this.#loadTasks();
  }

  // Botón "Vaciar" (la confirmación se agrega en el punto 4.2)
  #onClear() {
    clearAll();
    this.#loadTasks();
  }

  // Tareas elegidas en el modal de importar (los repetidos se descartan solos)
  #onTasksImport(event) {
    addImportedTasks(event.detail.tasks);
    this.#loadTasks();
  }

  // Guardar desde el formulario: con id actualiza, sin id crea
  #onTaskSave(event) {
    const { id, title, createdAt, completed } = event.detail;

    if (id) {
      updateTask(id, { title, completed });
    } else {
      addTask({ title, createdAt, completed });
    }

    this.#loadTasks();
  }

  // Clic en el círculo de una tarea: cambia pendiente <-> terminada
  #onTaskToggle(event) {
    toggleTask(event.detail.id);
    this.#loadTasks();
  }

  // Dibuja la pantalla con el estado actual
  #render() {
    this.list.tasks = this.#tasks;
  }
}

if (!customElements.get("task-app")) {
  customElements.define("task-app", TaskApp);
}
