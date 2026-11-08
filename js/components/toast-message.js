const template = document.createElement("template");

template.innerHTML = `
  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    :host {
      position: fixed;
      right: var(--space-4);
      bottom: var(--space-4);
      left: var(--space-4);
      z-index: var(--z-modal);
      display: flex;
      justify-content: center;
      pointer-events: none;
    }

    .toasts {
      display: grid;
      gap: var(--space-2);
      width: min(420px, 100%);
    }

    .toast {
      padding: var(--space-3) var(--space-4);
      color: var(--color-text);
      background: var(--color-surface-raised);
      border: 1px solid var(--color-success-border);
      border-radius: var(--radius-row);
      font-size: var(--font-size-sm);
      overflow-wrap: anywhere;
    }

    .toast.error {
      border-color: var(--color-danger);
    }
  </style>

  <div class="toasts" role="status" aria-live="polite"></div>
`;

const DURATION = 3000;

class ToastMessage extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));

    this.container = this.shadowRoot.querySelector(".toasts");
  }

  // Uso: toast.show("Tarea creada")  o  toast.show("Algo falló", "error")
  show(message, type = "success") {
    const toast = document.createElement("p");

    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.margin = "0";

    this.container.append(toast);

    setTimeout(() => toast.remove(), DURATION);
  }
}

if (!customElements.get("toast-message")) {
  customElements.define("toast-message", ToastMessage);
}
