import "./task-list.js";
import "./task-form-modal.js";
import "./import-modal.js";
import "./confirm-dialog.js";
import "./toast-message.js";
import { getTasks } from "../services/storage-service.js";
import { addImportedTasks, addTask, clearAll, deleteTask, toggleTask, updateTask } from "../services/task-service.js";

// <task-app> no dibuja nada: el HTML está en index.html y los estilos en css/app.css.
// Este componente solo conecta los botones y los eventos con los servicios.

// Pasa a minúsculas y quita las tildes: "Camión" -> "camion"
function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

class TaskApp extends HTMLElement {
  // Lista completa de tareas (viene del localStorage)
  #tasks = [];

  // Filtro por estado: "all" | "pending" | "completed"
  #filter = "all";

  // Texto del buscador
  #search = "";

  // Para conectar los eventos una sola vez
  #ready = false;

  connectedCallback() {
    if (!this.#ready) {
      this.#setup();
      this.#ready = true;
    }

    document.addEventListener("click", this.#onDocumentClick);
    this.#loadTasks();
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.#onDocumentClick);
  }

  // Busca los elementos que están en index.html y conecta sus eventos
  #setup() {
    this.summary = this.querySelector(".summary");
    this.searchInput = this.querySelector(".search-input");
    this.addButton = this.querySelector(".add");
    this.importButton = this.querySelector(".import");
    this.filterButton = this.querySelector(".filter");
    this.filterMenu = this.querySelector(".filter-menu");
    this.filterOptions = this.querySelectorAll(".filter-option");
    this.clearButton = this.querySelector(".clear");
    this.list = this.querySelector("task-list");
    this.formModal = this.querySelector("task-form-modal");
    this.importModal = this.querySelector("import-modal");
    this.confirmDialog = this.querySelector("confirm-dialog");
    this.toast = this.querySelector("toast-message");

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
  }

  // Lee las tareas guardadas y vuelve a dibujar
  #loadTasks() {
    this.#tasks = getTasks();
    this.#render();
  }

  // ---------- Popup del filtro ----------

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

      // El foco pasa a la opción activa
      this.filterMenu.querySelector('[aria-checked="true"]').focus();
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
    this.filterButton.focus();
    this.#render();
  }

  // ---------- Acciones sobre las tareas ----------

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
      if (deleteTask(task.id)) {
        this.toast.show("Tarea eliminada");
      } else {
        this.#showSaveError();
      }

      this.#loadTasks();
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
      if (clearAll() === null) {
        this.#showSaveError();
      } else {
        this.toast.show("Lista vaciada");
      }

      this.#loadTasks();
    }
  }

  // Tareas elegidas en el modal de importar (los repetidos se descartan solos)
  #onTasksImport(event) {
    const added = addImportedTasks(event.detail.tasks);

    this.#loadTasks();

    if (added === null) {
      this.#showSaveError();
    } else if (added.length === 0) {
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
      const updated = updateTask(id, { title, completed });

      if (updated) {
        this.toast.show("Tarea actualizada");
      } else {
        this.#showSaveError();
      }
    } else {
      const created = addTask({ title, createdAt, completed });

      if (created) {
        this.toast.show("Tarea creada");
      } else {
        this.#showSaveError();
      }
    }

    this.#loadTasks();
  }

  // Clic en el círculo de una tarea: cambia pendiente <-> terminada
  #onTaskToggle(event) {
    if (!toggleTask(event.detail.id)) {
      this.#showSaveError();
    }

    this.#loadTasks();
  }

  // Aviso cuando el navegador no deja guardar (almacenamiento lleno o desactivado)
  #showSaveError() {
    this.toast.show(
      "No se pudo guardar. Revisa que el navegador permita guardar datos y tenga espacio.",
      "error"
    );
  }

  // ---------- Dibujar la pantalla ----------

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

    const text = `${totalText} · ${doneText}`;

    // Solo se actualiza si cambió, para que el lector de pantalla no repita el aviso
    if (this.summary.textContent !== text) {
      this.summary.textContent = text;
    }
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
