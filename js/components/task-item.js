const template = document.createElement("template");

template.innerHTML = `
  <style>
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
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      transition: border-color var(--transition);
    }

    .row.completed {
      border-color: var(--color-success-border);
    }

    .toggle {
      flex: none;
      width: 18px;
      height: 18px;
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
    }

    .title {
      font-size: var(--font-size-sm);
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
      width: 32px;
      height: 32px;
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
      top: calc(100% + var(--space-1));
      min-width: 140px;
      padding: var(--space-1);
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }

    .menu-item {
      display: block;
      width: 100%;
      padding: var(--space-2) var(--space-3);
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      text-align: left;
      font-size: var(--font-size-sm);
    }

    .menu-item:hover {
      background: var(--color-surface);
    }

    .menu-item.danger {
      color: var(--color-danger);
    }
      </style>

  <div class="row">
    <button class="toggle" type="button" role="checkbox" aria-checked="false"></button>

    <div class="content">
      <span class="title"></span>
      <span class="meta">
        <time class="date"></time>
        <span class="badge" hidden>Importada</span>
      </span>
    </div>

    <div class="menu-wrapper">
      <button class="menu-button" type="button" aria-haspopup="true" aria-expanded="false">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="3" cy="8" r="1.3" />
          <circle cx="8" cy="8" r="1.3" />
          <circle cx="13" cy="8" r="1.3" />
        </svg>
      </button>
      <div class="menu" hidden>
        <button class="menu-item edit" type="button">Editar</button>
        <button class="menu-item danger delete" type="button">Eliminar</button>
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
