import "./task-item.js";

const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    [hidden] {
      display: none !important;
    }

    .list {
      display: grid;
      gap: var(--space-2);
    }

    .empty {
      padding: var(--space-8) var(--space-4);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      text-align: center;
    }
  </style>

  <div class="list" role="list"></div>
  <p class="empty" hidden></p>
`;

class TaskList extends HTMLElement {
  #tasks = [];
  #filtered = false;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));

    this.listEl = this.shadowRoot.querySelector(".list");
    this.emptyEl = this.shadowRoot.querySelector(".empty");

    this.#render();
  }