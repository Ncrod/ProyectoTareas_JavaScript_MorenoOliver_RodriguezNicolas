const template = document.createElement("template");

template.innerHTML = `
  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    :host {
      --modal-padding: var(--space-4);
    }

    @media (min-width: 480px) {
      :host {
        --modal-padding: var(--space-6);
      }
    }

    button {
      font: inherit;
      color: inherit;
      cursor: pointer;
    }

    button:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    [hidden] {
      display: none !important;
    }

    dialog {
      width: min(560px, calc(100vw - 2rem));
      max-height: min(80vh, 640px);
      padding: 0;
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
    }

    dialog[open] {
      display: flex;
      flex-direction: column;
    }

    dialog::backdrop {
      background: var(--color-overlay, rgba(0, 0, 0, 0.65));
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      padding: var(--space-4) var(--modal-padding);
      border-bottom: 1px solid var(--color-border);
    }

    .header h2 {
      margin: 0;
      font-size: var(--font-size-lg);
    }

    .close {
      display: grid;
      place-items: center;
      flex: none;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--color-text-muted);
    }

    .close:hover {
      background: var(--color-surface-raised);
      color: var(--color-text);
    }

    .body {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: var(--space-4) var(--modal-padding);
    }

    .task-title {
      margin: 0 0 var(--space-3);
      font-size: var(--font-size-lg);
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .badge {
      padding: 0 var(--space-2);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
    }

    .badge.done {
      color: var(--color-success);
      border-color: var(--color-success-border);
    }

    .label {
      margin: 0 0 var(--space-2);
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--color-text-muted);
    }

    .description {
      margin: 0;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      line-height: 1.5;
    }

    .description.empty {
      color: var(--color-text-muted);
      font-style: italic;
    }

    .footer {
      display: flex;
      justify-content: flex-end;
      padding: var(--space-4) var(--modal-padding);
      border-top: 1px solid var(--color-border);
    }

    .btn {
      width: 100%;
      height: 42px;
      padding: 9px 12px;
      border: none;
      border-radius: var(--radius-button);
      background: var(--color-control);
      color: var(--color-text);
      font-size: var(--font-size-button);
    }

    .btn:hover {
      filter: brightness(1.2);
    }

    @media (min-width: 480px) {
      .btn {
        width: auto;
      }
    }
  </style>

  <dialog aria-labelledby="detail-heading">
    <header class="header">
      <h2 id="detail-heading">Detalle de la tarea</h2>
      <button class="close" type="button" aria-label="Cerrar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
    </header>

    <div class="body">
      <h3 class="task-title"></h3>

      <div class="meta">
        <time class="date"></time>
        <span class="badge status"></span>
        <span class="badge imported" hidden>Importada</span>
      </div>

      <p class="label">Descripción</p>
      <p class="description"></p>
    </div>

    <footer class="footer">
      <button class="btn close-btn" type="button">Cerrar</button>
    </footer>
  </dialog>
`;

function formatDate(isoString) {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

class TaskDetailModal extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));

    const root = this.shadowRoot;
    this.dialog = root.querySelector("dialog");
    this.titleEl = root.querySelector(".task-title");
    this.dateEl = root.querySelector(".date");
    this.statusEl = root.querySelector(".status");
    this.importedEl = root.querySelector(".imported");
    this.descriptionEl = root.querySelector(".description");

    root.querySelector(".close").addEventListener("click", () => this.close());
    root.querySelector(".close-btn").addEventListener("click", () => this.close());

    // Clic en el fondo (el <dialog> no tiene padding) cierra el popup
    this.dialog.addEventListener("click", (event) => {
      if (event.target === this.dialog) {
        this.close();
      }
    });

    // Esc ya cierra el <dialog> por defecto (showModal)
  }

  // open({ task }) muestra la información de la tarea (solo lectura)
  open({ task } = {}) {
    if (!task || this.dialog.open) {
      return;
    }

    const completed = Boolean(task.completed);
    const description = typeof task.description === "string" ? task.description.trim() : "";

    this.titleEl.textContent = task.title;
    this.dateEl.textContent = formatDate(task.createdAt);
    this.dateEl.setAttribute("datetime", task.createdAt);

    this.statusEl.textContent = completed ? "Terminada" : "Pendiente";
    this.statusEl.classList.toggle("done", completed);
    this.importedEl.hidden = !task.imported;

    this.descriptionEl.textContent = description || "Sin descripción";
    this.descriptionEl.classList.toggle("empty", description === "");

    this.dialog.showModal();
  }

  close() {
    this.dialog.close();
  }
}

if (!customElements.get("task-detail-modal")) {
  customElements.define("task-detail-modal", TaskDetailModal);
}
