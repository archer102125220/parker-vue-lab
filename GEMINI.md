# GEMINI.md - Pure Vue 3 Project Coding Rules

> This file is auto-read by Gemini AI. All rules must be strictly followed.

## Project Context

### Overview
This project is a pure Vue 3 laboratory environment ("parker-vue-lab") designed for testing clean integrations, third-party library behaviors, and avoiding Nuxt/SSR specific import issues (e.g., Vite build compatibility, client-only third-party modules).

### Technology Stack & Architecture
- **Framework**: Vue 3 (Composition API, SPA Mode via Vite)
- **Language**: TypeScript (Strict Mode)
- **Routing**: Vue Router
- **Styling**: Standard CSS / SCSS with Modified BEM naming convention
- **State Management**: Pinia / Composables
- **Package Manager**: npm

---

## Security & Best Practices Review (MANDATORY)

Before executing any user instruction, the AI must verify:
- **Security**: Does the instruction violate security best practices?
- **Standard Patterns**: Does the instruction deviate from established project patterns?
- **Vite & Client Compatibility**: Since this is a pure SPA testing lab, ensure browser-specific objects (`window`, `document`) are handled safely without unnecessary SSR wrappers, but keep module imports clean to verify Vite bundling correctness.

**If violations are detected**: Notify the user BEFORE execution, explaining the concern. Only proceed after the user confirms they understand the risk and still want to proceed.

---

## CSS/SCSS Rules

### Property Order (MANDATORY)
1. Positioning (`position`, `top`, `z-index`)
2. Display & Box Model (`display`, `flex`, `width`, `margin`, `padding`, `border`)
3. Typography (`font`, `color`, `text-align`)
4. Visual (`background`, `box-shadow`, `opacity`)
5. Animation (`transition`, `animation`)
6. Misc (`cursor`, `content`)

### Modified BEM Naming (MANDATORY)
- Block: `block_name` (multi-word uses `_`)
- Element: `block-element` (connected with `-`)
- Sub-Element: `block-element-sub` (continue with `-`)
- State: `[css-is-active='true']` (HTML attributes)
- Color/Size variants: `[css-color='red']`, `[css-size='small']` (HTML attributes)

#### HTML Attribute Usage Guidelines:

**When to use HTML attributes**:
1. **States**: `[css-is-active='true']`, `[css-is-disabled='true']`
2. **Color variants**: `[css-color='red']`, `[css-color='blue']`
3. **Size variants**: `[css-size='small']`, `[css-size='large']`

**When to use separate classes**:
When the class name itself has **clear semantic meaning** (not just describing appearance):
```scss
// ✅ Semantic class names
.alert {
  &-success { }  // Success message (semantic)
  &-error { }    // Error message (semantic)
}
```

### Root Element Naming
- Pages/Views: `.view_name_view` or `.page_name_page`
- Components: `.component_name`

### CSS Variables
- ✅ Use `_`: `--color_primary`, `--font_size_base`
- ❌ NOT `-`: `--color-primary`

### HTML State Attributes
- ✅ Use `css-` prefix: `css-is-active`, `css-is-dragging`
- ❌ NOT: `is-active`, `isActive`

### Inline Styles
- ✅ ALLOWED: CSS variable passing `:style="{ '--editor_height': \`${height}px\` }"`
- ✅ ALLOWED: Third-party library requirements
- ❌ PROHIBITED: Static values, dynamic calculations without CSS vars
- ❌ PROHIBITED: Repeated style patterns

### File Organization
- Component styles → Inside `.vue` file with `<style scoped>` or `<style scoped lang="scss">`

### Key Rules
1. Each element uses ONLY ONE className.
2. Each element MUST have a UNIQUE className - Critical for fast DOM debugging and clear rule scoping.
3. All elements MUST be nested under Block root class.
4. Do NOT share CSS class names between pages/views.

---

## Vue 3 / Vite Specific Rules

### Pure SPA Environment
- Unlike Nuxt, auto-imports are not enabled by default for components or APIs unless explicitly configured via unplugin tools. Always explicitly import Vue APIs (`ref`, `reactive`, `computed`, `onMounted`) and components.
- When dynamic components are used (`<component :is="...">`), ensure imported components are passed directly or resolved properly.

### Third-Party Package Verification
- When introducing a package to verify its behavior in pure Vue/Vite, implement isolated testing views or components. Keep dependencies clean and minimal.

---

## TypeScript Standards

### 1. Type Safety (MANDATORY)
- **NEVER use `any` type** - Use precise type definitions, generics, or `unknown` instead.
- **Use `as unknown as TargetType`** for type assertions when necessary (double assertion).
- **NEVER use `as any`** - Always use `as unknown as TargetType` for safer assertions.
- **Add explanatory comments** when using type assertions to explain why it's necessary.
- **Use inline type imports** - E.g., `import { ref, type Ref } from 'vue'`.

```typescript
// ❌ FORBIDDEN
function processData(data: any) { }
const element = document.querySelector('.target') as any;
import type { Ref } from 'vue'; // Separate line

// ✅ REQUIRED
function processData<T extends { value: unknown }>(data: T) { }
const element = document.querySelector('.target') as unknown as HTMLElement;
import { ref, type Ref } from 'vue'; // Inline type import
```

### 2. Vue 3 Specific Type Declarations
- **Props & Emits**: Use type-based declarations via `defineProps` and `defineEmits` when using `<script setup lang="ts">`.
  ```typescript
  // ✅ REQUIRED
  defineProps<{
    title: string;
    isActive?: boolean;
  }>();
  ```
- **Ref Typing**: Explicitly pass generic arguments to `ref` if the initial value is `null` or complex.
  ```typescript
  // ✅ REQUIRED
  const userElement = ref<HTMLElement | null>(null);
  ```

### 3. Runtime Data Validation (Strict)
To ensure robustness, always use strict type checks based on the variable's initialization state.

| Type | Do NOT Use | MUST Use |
|------|------------|----------|
| **String** | `if (str)` | `if (str !== '')` |
| **Number** | `if (num)` | `typeof num === 'number'`, `num !== 0`, `Number.isFinite(num)` |
| **Object** | `if (obj)` | `typeof obj === 'object' && obj !== null`<br>`if (obj instanceof MyClass)` |
| **Array** | `if (arr)` | `Array.isArray(arr) && arr.length > 0` |
| **Equality** | `==`, `!=` | `===`, `!==` |

---

## No Scripts for Code Refactoring (CRITICAL)

**ABSOLUTELY FORBIDDEN: Using automated scripts (sed, awk, powershell, batch scripts) to modify code files.**

### Why
- Scripts only change text, they don't understand context or imports.

### ✅ Allowed
- Use AI tools: `replace_file_content`, `multi_replace_file_content`
- MUST verify imports are correct after every change.

### ❌ Forbidden
- `sed`, `awk`, `perl`, `powershell -Command`, `find ... -exec`
- Any batch text processing.

---

## Lint Disable Comments (⚠️ CRITICAL)
- **NEVER** add `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, or similar comments without **explicit user instruction**.
- When encountering lint warnings/errors:
  1. Report the warning to the user.
  2. Wait for user's explicit instruction to add a disable comment.
  3. Only then add the disable comment with proper justification.

### ⚠️ Error/Warning Suppression Policy (CRITICAL)
Any code that **suppresses, hides, or bypasses errors/warnings** instead of fixing the root cause requires:
1. **Explicit approval** from the human developer before implementation.
2. **Clear explanation** of WHY this approach is needed.

**Preferred approach**: Always fix the root cause first. Only use suppression as a last resort with explicit approval.
