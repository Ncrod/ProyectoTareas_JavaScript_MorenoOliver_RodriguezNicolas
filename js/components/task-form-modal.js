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
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--color-border);
    }

    .header h2 {
      margin: 0;
      font-size: var(--font-size-lg);
    }

    .close {
      display: grid;
      place-items: center;
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
      padding: var(--space-4) var(--space-6);
    }

    .field {
      display: grid;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    .field label {
      font-size: var(--font-size-sm);
      font-weight: 500;
    }

    .required {
      color: var(--color-danger);
    }

    input[type="text"],
    input[type="date"] {
      width: 100%;
      height: 42px;
      padding: 9px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-button);
      background: var(--color-surface-raised);
      color: var(--color-text);
      font: inherit;
      font-size: var(--font-size-button);
      color-scheme: dark;
    }

    input:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 1px;
    }

    input[readonly] {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .check {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--font-size-button);
      cursor: pointer;
    }

    input[type="checkbox"] {
      flex: none;
      width: 18px;
      height: 18px;
      margin: 0;
      accent-color: var(--color-success);
    }

    .footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--color-border);
    }

    .btn {
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

    .btn.primary {
      background: var(--color-primary);
      color: var(--color-on-primary);
    }
  </style>

  <dialog aria-labelledby="modal-title">
    <header class="header">
      <h2 id="modal-title">Nueva tarea</h2>
      <button class="close" type="button" aria-label="Cerrar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
    </header>

    <form class="body" novalidate>
      <div class="field">
        <label for="task-title">Título <span class="required" aria-hidden="true">*</span></label>
        <input id="task-title" name="title" type="text" maxlength="120" required autocomplete="off" placeholder="¿Qué hay que hacer?">
      </div>

      <div class="field">
        <label for="task-date">Fecha de registro</label>
        <input id="task-date" name="createdAt" type="date">
      </div>

      <label class="check">
        <input id="task-completed" name="completed" type="checkbox">
        <span>Completada</span>
      </label>
    </form>

    <footer class="footer">
      <button class="btn cancel" type="button">Cancelar</button>
      <button class="btn primary save" type="button">Guardar</button>
    </footer>
  </dialog>
`;

class TaskFormModal extends HTMLElement {
  // Tarea que se está editando. null = modo crear
  #task = null;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));

    const root = this.shadowRoot;
    this.dialog = root.querySelector("dialog");
    this.titleEl = root.querySelector("#modal-title");
    this.form = root.querySelector("form");
    this.titleInput = root.querySelector("#task-title");
    this.dateInput = root.querySelector("#task-date");
    this.completedInput = root.querySelector("#task-completed");
    this.saveButton = root.querySelector(".save");
  }

  get isEditing() {
    return this.#task !== null;
  }

  // open()            -> modo crear
  // open({ task })    -> modo editar
  open({ task = null } = {}) {
    if (this.dialog.open) {
      return;
    }

    this.#task = task;
    this.form.reset();

    if (task) {
      this.titleEl.textContent = "Editar tarea";
      this.titleInput.value = task.title;
      this.completedInput.checked = Boolean(task.completed);
    } else {
      this.titleEl.textContent = "Nueva tarea";
    }

    this.dialog.showModal();
    this.titleInput.focus();
  }

  close() {
    this.dialog.close();
  }
}

if (!customElements.get("task-form-modal")) {
  customElements.define("task-form-modal", TaskFormModal);
}
