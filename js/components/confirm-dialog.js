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

    dialog {
      width: min(420px, calc(100vw - 2rem));
      padding: var(--space-6);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
    }

    dialog::backdrop {
      background: var(--color-overlay, rgba(0, 0, 0, 0.65));
    }

    h2 {
      margin: 0 0 var(--space-2);
      font-size: var(--font-size-lg);
    }

    p {
      margin: 0 0 var(--space-6);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      overflow-wrap: anywhere;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
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

    .btn:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    .btn.danger {
      background: var(--color-danger);
      color: var(--color-on-primary);
    }
  </style>

  <dialog aria-labelledby="confirm-title" aria-describedby="confirm-message">
    <h2 id="confirm-title"></h2>
    <p id="confirm-message"></p>

    <div class="actions">
      <button class="btn cancel" type="button">Cancelar</button>
      <button class="btn danger accept" type="button"></button>
    </div>
  </dialog>
`;

class ConfirmDialog extends HTMLElement {
  #resolve = null;
  #accepted = false;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));

    const root = this.shadowRoot;
    this.dialog = root.querySelector("dialog");
    this.titleEl = root.querySelector("#confirm-title");
    this.messageEl = root.querySelector("#confirm-message");
    this.cancelButton = root.querySelector(".cancel");
    this.acceptButton = root.querySelector(".accept");

    this.cancelButton.addEventListener("click", () => this.dialog.close());
    this.acceptButton.addEventListener("click", () => {
      this.#accepted = true;
      this.dialog.close();
    });

    // Clic en el fondo cierra sin aceptar
    this.dialog.addEventListener("click", (event) => {
      if (event.target === this.dialog) {
        this.dialog.close();
      }
    });

    // Cierra de cualquier forma (botones, Esc o fondo): se entrega la respuesta
    this.dialog.addEventListener("close", () => {
      this.#resolve?.(this.#accepted);
      this.#resolve = null;
    });
  }

  // Uso: const ok = await confirmDialog.open({ title, message, confirmText });
  // Devuelve true si el usuario acepta y false si cancela
  open({ title, message, confirmText = "Confirmar" }) {
    this.titleEl.textContent = title;
    this.messageEl.textContent = message;
    this.acceptButton.textContent = confirmText;
    this.#accepted = false;

    this.dialog.showModal();
    this.cancelButton.focus();

    return new Promise((resolve) => {
      this.#resolve = resolve;
    });
  }
}

if (!customElements.get("confirm-dialog")) {
  customElements.define("confirm-dialog", ConfirmDialog);
}
