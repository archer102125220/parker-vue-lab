# Claude Coding Standards - Pure Vue 3 Project

> This file defines high-level coding standards for Claude in this pure Vue 3 project.

## Core Directives
- **Security & Patterns**: Enforce secure module imports without unnecessary server wrappers. Keep pure frontend Vite bundles clean.
- **Explicit APIs**: Explicitly import Vue composition APIs (`ref`, `computed`, `onMounted`) and components.
- **Type Checking**: Strictly follow initialization-based value validations. Avoid loose truthy/falsy checks.
- **No Text Refactoring Scripts**: Absolutely forbidden to run text processing commands like `sed` or `awk` to replace code strings.
