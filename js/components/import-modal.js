import { fetchTodos } from "../services/api-service.js";

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
      border-radius: var(--radius-lg);
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

    .state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-8) 0;
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      text-align: center;
    }

    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-text);
      border-radius: var(--radius-full);
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .error-message {
      margin: 0;
      color: var(--color-danger);
    }

    .select-all,
    .todos label {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      cursor: pointer;
    }

    .select-all {
      margin-bottom: var(--space-3);
      background: var(--color-surface-raised);
    }

    .todos label:hover {
      background: var(--color-surface-raised);
    }

    .todos {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    input[type="checkbox"] {
      flex: none;
      width: 16px;
      height: 16px;
      margin: 0;
      accent-color: var(--color-success);
    }

    .todos span {
      overflow-wrap: anywhere;
    }

    .footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--color-border);
    }

    .counter {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }

    .actions {
      display: flex;
      gap: var(--space-2);
    }

    .btn {
      padding: var(--space-2) var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface-raised);
      font-size: var(--font-size-sm);
    }

    .btn:hover {
      border-color: var(--color-text-muted);
    }

    .btn.primary {
      border-color: var(--color-primary);
      background: var(--color-primary);
      color: var(--color-on-primary);
    }

    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  </style>

  <dialog aria-labelledby="modal-title">
    <header class="header">
      <h2 id="modal-title">Importar tareas</h2>
      <button class="close" type="button" aria-label="Cerrar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
    </header>

    <div class="body">
      <div class="state loading" role="status" hidden>
        <span class="spinner" aria-hidden="true"></span>
        <span>Cargando tareas...</span>
      </div>

      <div class="state error" role="alert" hidden>
        <p class="error-message"></p>
        <button class="btn retry" type="button">Reintentar</button>
      </div>

      <div class="content" hidden>
        <label class="select-all">
          <input class="select-all-input" type="checkbox">
          <span>Seleccionar todo</span>
        </label>
        <ul class="todos"></ul>
      </div>
    </div>

    <footer class="footer">
      <span class="counter" aria-live="polite"></span>
      <div class="actions">
        <button class="btn cancel" type="button">Cancelar</button>
        <button class="btn primary import" type="button" disabled>Importar seleccionadas</button>
      </div>
    </footer>
  </dialog>
`;