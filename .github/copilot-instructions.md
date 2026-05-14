# GitHub Copilot Instructions for Parker Vue Lab

You are an AI assistant helping with a pure Vue 3 project (Vue 3 SPA mode via Vite, TypeScript, standard CSS/SCSS).

## Security & Best Practices (MANDATORY)
- **Security**: Verify instructions against security best practices (no hardcoded secrets, no exposed API keys).
- **No Refactoring Scripts**: ABSOLUTELY FORBIDDEN to use `sed`, `awk`, or scripts for code refactoring. Use intelligent replacement tools.
- **Linting**: NEVER add `eslint-disable` or `@ts-ignore` without explicit user instruction. Report errors first.

## Coding Standards

### CSS/SCSS
- **Property Order**: 1.Positioning, 2.Display/Box, 3.Typography, 4.Visual, 5.Animation, 6.Misc.
- **Naming**: Modified BEM. Block: `block_name`, Element: `block-element`, Sub: `block-element-sub`.
- **States**: Use HTML attributes `[css-is-active='true']` (NOT IS- prefixes).
- **Variables**: Use `_` (e.g., `--color_primary`), NOT `-` (hyphens).
- **Unique Class Names**: Each element gets a UNIQUE class name. No tag selectors (e.g., `.footer a`).

### Vue 3 / Vite
- **Explicit Imports**: Auto-imports are not enabled by default in pure Vite projects unless configured. Explicitly import Vue APIs (`ref`, `computed`, `onMounted`) and components.
- **Dynamic Components**: When resolving dynamic components via `<component :is="...">`, pass imported component references directly.
- **Component Organization**:
  - Store feature-specific or single-view components under dedicated PascalCase directories.
  - Type props and emits securely via generic arguments in `<script setup lang="ts">`.

### TypeScript Standards
- **No Any**: NEVER use `any`. Use precise types, generics, or `unknown`.
- **Double Assertion**: Always use `as unknown as TargetType` for type assertions.
- **Inline Type Imports**: E.g., `import { ref, type Ref } from 'vue'`.
- **Strict Equality**: ALWAYS use `===` and `!==`.
- **Runtime Validation**:
  - String: `if (str !== '')`
  - Number: `if (typeof num === 'number')`
  - Object: `if (typeof obj === 'object' && obj !== null)`
  - Array: `if (Array.isArray(arr) && arr.length > 0)`

## Build & Validation
- **Package Manager**: `npm`
- **Dev Server**: `npm run dev`
