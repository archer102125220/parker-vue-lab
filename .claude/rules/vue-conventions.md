# Claude Vue 3 Conventions

## Explicit Imports vs Auto-Imports (MANDATORY)
In pure Vue 3 SPA projects using Vite, components and APIs are not auto-imported by default. You **MUST** explicitly import all necessary Vue Composition APIs and external components.

## Generic Props and Emits Declarations
Always leverage pure TypeScript generic syntax for defining component interfaces via `defineProps` and `defineEmits`.

## Dynamic Components Reference Passing
Supply the direct reference of components when bound via `<component :is="...">`.
