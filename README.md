# Gestor de Tareas

Proyecto del módulo de JavaScript de Campusland, hecho en pareja por **Oliver Moreno** y **Nicolás Rodríguez**.

## Descripción

Aplicación web para gestionar una lista de tareas, hecha solo con **HTML, CSS y JavaScript** (sin librerías ni frameworks). Las tareas se guardan en el navegador, así que siguen ahí después de recargar la página.

### Qué se puede hacer

- **Crear** tareas con título, fecha y estado.
- **Actualizar** y **eliminar** tareas (eliminar pide confirmación).
- **Completar** una tarea con el círculo que tiene a la izquierda.
- **Importar** tareas de ejemplo desde una API pública (`jsonplaceholder.typicode.com`). Las importadas llevan la etiqueta "Importada" y no se pueden editar.
- **Filtrar** por estado: Todas, Pendientes o Completadas.
- **Buscar** por título en tiempo real, sin distinguir mayúsculas ni tildes.
- **Vaciar** toda la lista (pide confirmación).
- Ver un **resumen** con el total de tareas y cuántas están completadas.
- Usar la app en **móvil y escritorio**, y con **teclado** y lector de pantalla.

### Tecnologías

- HTML5, CSS3 y JavaScript (módulos ES).
- **Web Components** con Shadow DOM para las partes de la interfaz.
- `localStorage` para guardar las tareas.
- `fetch` para consumir la API.

### Diseño

La interfaz sigue el diseño hecho en Figma:
[Proyecto-JS en Figma](https://www.figma.com/design/BNPuYavlbDE0bI7jmxf3wM/Proyecto-JS?node-id=3-3&m=dev)
