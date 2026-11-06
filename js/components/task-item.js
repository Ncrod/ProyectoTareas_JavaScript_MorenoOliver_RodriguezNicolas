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