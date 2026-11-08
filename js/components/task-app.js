import "./task-list.js";
import "./task-form-modal.js";
import "./import-modal.js";

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
  </style>

  <div class="app">
    <header class="header">
      <h1 class="title">Bandeja de entrada</h1>

      <!-- Buscador, filtro y botones van aquí (punto 3.4) -->
      <div class="toolbar"></div>
    </header>

    <task-list></task-list>
  </div>

  <task-form-modal></task-form-modal>
  <import-modal></import-modal>
`;

class TaskApp extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));

    const root = this.shadowRoot;
    this.toolbar = root.querySelector(".toolbar");
    this.list = root.querySelector("task-list");
    this.formModal = root.querySelector("task-form-modal");
    this.importModal = root.querySelector("import-modal");
  }
}

if (!customElements.get("task-app")) {
  customElements.define("task-app", TaskApp);
}
