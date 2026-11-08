import "./task-list.js";
import "./task-form-modal.js";
import "./import-modal.js";
import "./confirm-dialog.js";
import "./toast-message.js";
import { getTasks } from "../services/storage-service.js";
import { addImportedTasks, addTask, clearAll, deleteTask, toggleTask, updateTask } from "../services/task-service.js";

// Pasa a minúsculas y quita las tildes: "Camión" -> "camion"
function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

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

    [hidden] {
      display: none !important;
    }

    .app {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .header {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .title {
      margin: 0;
      font-size: var(--font-size-title);
      font-weight: 600;
    }

    .summary {
      margin: var(--space-1) 0 0;
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
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
      width: 100%;
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

    .filter-wrapper {
      position: relative;
    }

    .filter-menu {
      position: absolute;
      left: 0;
      top: calc(100% + 8px);
      z-index: var(--z-dropdown);
      min-width: 190px;
      padding: 8px;
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-row);
    }

    .filter-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      padding: 12px 18px;
      border: none;
      border-radius: 12px;
      background: transparent;
      color: var(--color-text);
      font: inherit;
      font-size: var(--font-size-task);
      font-weight: 500;
      text-align: left;
      cursor: pointer;
    }

    .filter-option:hover,
    .filter-option:focus-visible {
      background: var(--color-control);
    }

    .filter-option[aria-checked="true"]::after {
      content: "✓";
      color: var(--color-success);
    }

    /* Escritorio: título a la izquierda y barra de acciones en fila a la derecha */
    @media (min-width: 768px) {
      .app {
        gap: 65px;
      }

      .header {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
      }

      .search {
        width: 360px;
      }

      .filter-menu {
        right: 0;
        left: auto;
      }
    }
  </style>

  <div class="app">
    <header class="header">
      <div>
        <h1 class="title">Bandeja de entrada</h1>
        <p class="summary"></p>
      </div>

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

        <div class="filter-wrapper">
          <button class="btn filter" type="button" aria-label="Filtrar tareas" aria-haspopup="menu" aria-expanded="false">
            <img src="public/filtro.svg" alt="">
          </button>

          <div class="filter-menu" role="menu" aria-label="Filtrar por estado" hidden>
            <button class="filter-option" type="button" role="menuitemradio" aria-checked="true" data-filter="all">Todas</button>
            <button class="filter-option" type="button" role="menuitemradio" aria-checked="false" data-filter="pending">Pendientes</button>
            <button class="filter-option" type="button" role="menuitemradio" aria-checked="false" data-filter="completed">Completadas</button>
          </div>
        </div>

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
  <confirm-dialog></confirm-dialog>
  <toast-message></toast-message>
`;

class TaskApp extends HTMLElement {
  // Lista completa de tareas (viene del localStorage)
  #tasks = [];

  // Filtro por estado: "all" | "pending" | "completed"
  #filter = "all";

  // Texto del buscador
  #search = "";

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));

    const root = this.shadowRoot;
    this.toolbar = root.querySelector(".toolbar");
    this.summary = root.querySelector(".summary");
    this.searchInput = root.querySelector(".search-input");
    this.addButton = root.querySelector(".add");
    this.importButton = root.querySelector(".import");
    this.filterButton = root.querySelector(".filter");
    this.filterMenu = root.querySelector(".filter-menu");
    this.filterOptions = root.querySelectorAll(".filter-option");
    this.clearButton = root.querySelector(".clear");

    this.addButton.addEventListener("click", () => this.formModal.open());
    this.formModal.addEventListener("task-save", (event) => this.#onTaskSave(event));

    this.searchInput.addEventListener("input", () => {
      this.#search = this.searchInput.value;
      this.#render();
    });

    this.filterButton.addEventListener("click", () => this.#toggleFilterMenu());
    this.filterOptions.forEach((option) => {
      option.addEventListener("click", () => this.#setFilter(option.dataset.filter));
    });
    this.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !this.filterMenu.hidden) {
        this.#closeFilterMenu();
        this.filterButton.focus();
      }
    });

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
    this.confirmDialog = root.querySelector("confirm-dialog");
    this.toast = root.querySelector("toast-message");
  }

  connectedCallback() {
    document.addEventListener("click", this.#onDocumentClick);
    this.#loadTasks();
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.#onDocumentClick);
  }

  // Cierra el popup del filtro al hacer clic fuera de él
  #onDocumentClick = (event) => {
    const path = event.composedPath();

    if (!path.includes(this.filterMenu) && !path.includes(this.filterButton)) {
      this.#closeFilterMenu();
    }
  };

  #toggleFilterMenu() {
    if (this.filterMenu.hidden) {
      this.filterMenu.hidden = false;
      this.filterButton.setAttribute("aria-expanded", "true");
    } else {
      this.#closeFilterMenu();
    }
  }

  #closeFilterMenu() {
    this.filterMenu.hidden = true;
    this.filterButton.setAttribute("aria-expanded", "false");
  }

  // Elige un filtro, marca la opción activa y cierra el popup
  #setFilter(filter) {
    this.#filter = filter;

    this.filterOptions.forEach((option) => {
      option.setAttribute("aria-checked", String(option.dataset.filter === filter));
    });

    this.#closeFilterMenu();
    this.#render();
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

  // Opción "Eliminar" de una tarea: pide confirmación antes de borrar
  async #onTaskDelete(event) {
    const task = this.#tasks.find((item) => item.id === event.detail.id);

    if (!task) {
      return;
    }

    const accepted = await this.confirmDialog.open({
      title: "Eliminar tarea",
      message: `¿Quieres eliminar "${task.title}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
    });

    if (accepted) {
      deleteTask(task.id);
      this.#loadTasks();
      this.toast.show("Tarea eliminada");
    }
  }

  // Botón "Vaciar": pide confirmación antes de borrar todo
  async #onClear() {
    const total = this.#tasks.length;

    // Si no hay tareas no hay nada que vaciar
    if (total === 0) {
      return;
    }

    const accepted = await this.confirmDialog.open({
      title: "Vaciar lista",
      message: `Se ${total === 1 ? "eliminará 1 tarea" : `eliminarán ${total} tareas`} de la lista. Esta acción no se puede deshacer.`,
      confirmText: "Vaciar",
    });

    if (accepted) {
      clearAll();
      this.#loadTasks();
      this.toast.show("Lista vaciada");
    }
  }

  // Tareas elegidas en el modal de importar (los repetidos se descartan solos)
  #onTasksImport(event) {
    const added = addImportedTasks(event.detail.tasks);

    this.#loadTasks();

    if (added.length === 0) {
      this.toast.show("Esas tareas ya estaban importadas");
    } else {
      const text = added.length === 1 ? "1 tarea importada" : `${added.length} tareas importadas`;
      this.toast.show(text);
    }
  }

  // Guardar desde el formulario: con id actualiza, sin id crea
  #onTaskSave(event) {
    const { id, title, createdAt, completed } = event.detail;

    if (id) {
      updateTask(id, { title, completed });
      this.toast.show("Tarea actualizada");
    } else {
      addTask({ title, createdAt, completed });
      this.toast.show("Tarea creada");
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
    const visible = this.#getVisibleTasks();

    // "Sin resultados" solo si hay tareas pero el filtro o la búsqueda las ocultan todas
    const hasFilters = this.#filter !== "all" || this.#search.trim() !== "";

    this.list.filtered = hasFilters && this.#tasks.length > 0;
    this.list.tasks = visible;

    this.#renderSummary();
  }

  // Resumen con el total de tareas (sin importar el filtro): "5 tareas · 2 completadas"
  #renderSummary() {
    const total = this.#tasks.length;
    const done = this.#tasks.filter((task) => task.completed).length;

    const totalText = total === 1 ? "1 tarea" : `${total} tareas`;
    const doneText = done === 1 ? "1 completada" : `${done} completadas`;

    this.summary.textContent = `${totalText} · ${doneText}`;
  }

  // Aplica el filtro por estado y después la búsqueda
  #getVisibleTasks() {
    let tasks = this.#tasks;

    if (this.#filter === "pending") {
      tasks = tasks.filter((task) => !task.completed);
    } else if (this.#filter === "completed") {
      tasks = tasks.filter((task) => task.completed);
    }

    const text = normalize(this.#search.trim());

    if (text !== "") {
      tasks = tasks.filter((task) => normalize(task.title).includes(text));
    }

    return tasks;
  }
}

if (!customElements.get("task-app")) {
  customElements.define("task-app", TaskApp);
}
