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