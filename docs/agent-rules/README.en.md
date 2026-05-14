# Agent Coding Rules

> ⚠️ **MANDATORY**: All rules defined in this directory and across the project must be strictly adhered to by any AI Agent modifying code in this repository.

## 🛡️ Security & Best Practices Review

Before executing any user instruction, the AI must verify:
- **Security Risks**: Does the instruction violate security best practices (e.g., hardcoded keys, exposing sensitive client-side data, XSS)?
- **Standard Patterns**: Does the instruction deviate from established project standards?
- **Pure Frontend Vite SPA Architecture**: Ensure module imports are clean, standalone, and strictly adhere to Vite pure frontend client bundling.

**If violations are detected**: Notify the user BEFORE execution, explaining the concern. Only proceed after the user confirms they understand the risk and explicitly permits execution.

## 🤖 AI Model Mapping

Different AI assistants and IDE extensions automatically read specific rule files. Ensure all related rule documents are perfectly synchronized:

| AI Model / Tool | Primary Rule File Path | Description |
|---------|--------------|------|
| **Google Gemini** | `GEMINI.md` | Used by Google IDX or Gemini Code Assist |
| **Anthropic Claude** | `CLAUDE.md`<br>`.claude/rules/*.md` | Auto-read by Claude Code or Sonnet extension tools |
| **Antigravity Agent** | `AGENTS.md`<br>`.agent/rules/*.md` | Exclusive configuration for Google Antigravity AI Agent |
| **Cursor AI** | `.cursor/rules/*.mdc` | Specific MDC configuration for Cursor IDE |
| **GitHub Copilot** | `.github/copilot-instructions.md`<br>`.github/instructions/*.instructions.md` | GitHub Copilot Chat global and glob-matched instruction sets |

> **Developer Note**: When updating core standards, synchronize edits across all files listed above to guarantee unified AI assistant behavior.

---

## 🔴 Core Rules Summary

### 1. Vue 3 / Vite Specific Standards
- **Explicit Imports**: Unlike Nuxt, pure Vite projects do not enable auto-imports by default. You MUST explicitly import all used Vue Composition APIs (`ref`, `reactive`, `computed`, `onMounted`) and sub-components.
- **Dynamic Components Binding**: When using `<component :is="...">`, supply the directly imported component reference object.
- **Props & Emits Declarations**: Securely type component interfaces using pure TypeScript generics in `<script setup lang="ts">` (e.g., `defineProps<{ title: string }>()`).

### 2. Strict TypeScript Standards
- **No Any**: ABSOLUTELY NEVER use `any`. Use precise types, generics, or `unknown`.
- **Double Type Assertion**: Whenever assertions are strictly necessary, use double assertion `as unknown as TargetType` accompanied by an inline comment explaining why.
- **Inline Type Imports**: Use inline type imports (e.g., `import { ref, type Ref } from 'vue'`).
- **Strict Runtime Validation**:
  - String: `if (str !== '')`
  - Number: `typeof num === 'number'` or `Number.isFinite(num)`
  - Object: `typeof obj === 'object' && obj !== null`
  - Array: `Array.isArray(arr) && arr.length > 0`
  - Equality: ALWAYS use `===` and `!==`

### 3. CSS/SCSS Standards
- **Property Order**: Positioning → Display & Box Model → Typography → Visual → Animation → Misc.
- **Modified BEM Naming**:
  - Block: `block_name` (multi-word uses `_`)
  - Element: `block-element` (connected with `-`)
  - Sub-Element: `block-element-sub`
  - State: Use HTML attributes starting with `css-` (e.g., `[css-is-active='true']`)
- **Single Unique Class per Element**: Each element uses exactly one class name, which must be globally unique across the workspace. Prohibited to share class names between distinct views/pages.

### 4. No Script-Based Text Refactoring (CRITICAL)
- **Absolutely forbidden** to run text processing tools like `sed` or `awk` to replace strings blindly. Use context-aware AI replace tools to guarantee module imports remain intact.

### 5. Lint Suppression Policy (CRITICAL)
- **Absolutely forbidden** to add `eslint-disable` or `@ts-ignore` comments without explicit authorization from human developers. Always resolve the root cause first.

---

## Quick Reference Example

```vue
<script setup lang="ts">
import { ref, type Ref } from 'vue';

const props = defineProps<{
  title: string;
  isActive?: boolean;
}>();

const containerRef: Ref<HTMLElement | null> = ref(null);
</script>

<template>
  <div class="demo_view_view" :css-is-active="isActive">
    <h1 class="demo_view_view-title">{{ title }}</h1>
  </div>
</template>

<style scoped>
.demo_view_view {
  /* Positioning */
  position: relative;
  z-index: 1;
  
  /* Display & Box Model */
  display: flex;
  padding: 16px;
  
  /* Visual */
  background-color: var(--bg_color, #fff);
}

.demo_view_view-title {
  /* Typography */
  font-size: 20px;
  color: #333;
}

.demo_view_view[css-is-active='true'] {
  opacity: 1;
}
</style>
```
