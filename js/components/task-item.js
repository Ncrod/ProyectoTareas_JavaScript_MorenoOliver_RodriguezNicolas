const template = document.createElement("template");

template.innerHTML = `
  <style>
  
      *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    button {
      font: inherit;
      color: inherit;
      cursor: pointer;
    }

    button:focus-visible,
    input:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    :host {
      display: block;
      position: relative;
    }

    :host([menu-open]) {
      z-index: var(--z-dropdown);
    }

    [hidden] {
      display: none !important;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 61px;
      padding: 10px 20px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-row);
      transition: border-color var(--transition);
    }

    .row.completed {
      border-color: var(--color-success-border);
    }

    .toggle {
      flex: none;
      width: 19px;
      height: 19px;
      padding: 0;
      border: 1.5px solid var(--color-text-muted);
      border-radius: var(--radius-full);
      background: transparent;
      transition: background var(--transition), border-color var(--transition);
    }

    .row.completed .toggle {
      background: var(--color-success);
      border-color: var(--color-success);
    }

    .content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      column-gap: var(--space-3);
      row-gap: var(--space-1);
      align-self: stretch;
      cursor: pointer;
    }

    .content:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    .title {
      font-size: var(--font-size-task);
      font-weight: 500;
      overflow-wrap: anywhere;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .badge {
      padding: 0 var(--space-2);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
    }

     .menu-wrapper {
      position: relative;
      flex: none;
    }

    .menu-button {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--color-text-muted);
    }

    .menu-button:hover {
      background: var(--color-surface-raised);
      color: var(--color-text);
    }

    .menu {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      min-width: 190px;
      padding: 8px;
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-row);
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 18px;
      border: none;
      border-radius: 12px;
      background: transparent;
      text-align: left;
      font-size: var(--font-size-task);
      font-weight: 500;
    }

    .menu-item:hover,
    .menu-item:focus-visible {
      background: var(--color-control);
    }

    .menu-item img,
    .menu-item svg {
      flex: none;
      width: 18px;
      height: 18px;
    }
      </style>

  <div class="row">
    <button class="toggle" type="button" role="checkbox" aria-checked="false"></button>

    <div class="content" role="button" tabindex="0">
      <span class="title"></span>
      <span class="meta">
        <time class="date"></time>
        <span class="badge" hidden>Importada</span>
      </span>
    </div>

    <div class="menu-wrapper">
      <button class="menu-button" type="button" aria-haspopup="menu" aria-expanded="false">
        <img src="public/options.svg" width="24" height="24" alt="">
      </button>
      <div class="menu" role="menu" hidden>
        <button class="menu-item edit" type="button" role="menuitem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
          Actualizar
        </button>
        <button class="menu-item delete" type="button" role="menuitem">
          <img src="public/papelera.svg" width="18" height="18" alt="">
          Eliminar
        </button>
      </div>
    </div>
  </div>
`;

function formatDate(isoString) {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

class TaskItem extends HTMLElement {
  #task = null;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));

    const root = this.shadowRoot;
    this.row = root.querySelector(".row");
    this.toggleButton = root.querySelector(".toggle");
    this.contentEl = root.querySelector(".content");
    this.titleEl = root.querySelector(".title");
    this.dateEl = root.querySelector(".date");
    this.badge = root.querySelector(".badge");
    this.menuButton = root.querySelector(".menu-button");
    this.menu = root.querySelector(".menu");
    this.editButton = root.querySelector(".edit");
    this.deleteButton = root.querySelector(".delete");

    this.toggleButton.addEventListener("click", () => this.#emit("task-toggle"));
    // Clic (o Enter / Espacio) sobre el título y la fecha abre el detalle
    this.contentEl.addEventListener("click", () => this.#emit("task-view"));
    this.contentEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.#emit("task-view");
      }
    });
    this.menuButton.addEventListener("click", () => this.#toggleMenu());
    // Al elegir una opción el menú se oculta: el foco pasa al botón de tres puntos
    // para que, al cerrar el modal, el teclado siga en esta tarea
    this.editButton.addEventListener("click", () => {
      this.#closeMenu();
      this.menuButton.focus();
      this.#emit("task-edit");
    });
    this.deleteButton.addEventListener("click", () => {
      this.#closeMenu();
      this.menuButton.focus();
      this.#emit("task-delete");
    });

    this.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !this.menu.hidden) {
        this.#closeMenu();
        this.menuButton.focus();
      }
    });
  }

  connectedCallback() {
    document.addEventListener("click", this.#onDocumentClick);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.#onDocumentClick);
  }

  get task() {
    return this.#task;
  }

  set task(value) {
    this.#task = value;
    this.#render();
  }

  #render() {
    const task = this.#task;

    this.#closeMenu();
    this.hidden = !task;

    if (!task) {
      return;
    }

    const completed = Boolean(task.completed);

    this.titleEl.textContent = task.title;
    this.dateEl.textContent = formatDate(task.createdAt);
    this.dateEl.setAttribute("datetime", task.createdAt);
    this.badge.hidden = !task.imported;
    this.editButton.hidden = Boolean(task.imported);

    this.row.classList.toggle("completed", completed);
    this.toggleButton.setAttribute("aria-checked", String(completed));
    this.toggleButton.setAttribute(
      "aria-label",
      completed
        ? `Marcar como pendiente: ${task.title}`
        : `Marcar como terminada: ${task.title}`
    );
    this.contentEl.setAttribute("aria-label", `Ver detalle de la tarea: ${task.title}`);
    this.menuButton.setAttribute("aria-label", `Opciones de la tarea: ${task.title}`);
  }

  #emit(eventName) {
    if (!this.#task) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: { id: this.#task.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  #toggleMenu() {
    if (this.menu.hidden) {
      this.menu.hidden = false;
      this.menuButton.setAttribute("aria-expanded", "true");
      this.setAttribute("menu-open", "");

      // El foco pasa a la primera opción visible (editar está oculto en las importadas)
      this.menu.querySelector(".menu-item:not([hidden])")?.focus();
    } else {
      this.#closeMenu();
    }
  }

  #closeMenu() {
    this.menu.hidden = true;
    this.menuButton.setAttribute("aria-expanded", "false");
    this.removeAttribute("menu-open");
  }

  #onDocumentClick = (event) => {
    if (!event.composedPath().includes(this)) {
      this.#closeMenu();
    }
  };
}

if (!customElements.get("task-item")) {
  customElements.define("task-item", TaskItem);
}