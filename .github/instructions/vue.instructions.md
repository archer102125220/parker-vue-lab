---
applyTo: "**/*.vue"
---

# Vue 3 Instructions

## Explicit Composition API Imports
In pure Vite-based Vue 3 projects, do not assume auto-imports. Explicitly import all used APIs (`ref`, `computed`, `onMounted`) and sub-components.

## Props and Emits
Always use generic type syntax to securely declare interfaces in `<script setup lang="ts">`:
```typescript
defineProps<{
  title: string;
  isActive?: boolean;
}>();
```

## Dynamic Components Reference Passing
When leveraging dynamic components `<component :is="...">`, supply the direct component reference.
