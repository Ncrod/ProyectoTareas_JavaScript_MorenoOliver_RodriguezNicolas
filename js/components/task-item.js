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