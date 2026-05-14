---
applyTo: "**/*.{ts,vue,js}"
---

# TypeScript Rules

## Core Rules
- **NEVER use `any`** - use generics, `unknown`, or precise types.
- Use `as unknown as TargetType` for assertions, NEVER `as any`.
- Use **inline type imports**: `import { ref, type Ref } from 'vue'`.

## Runtime Data Validation (Strict)
- **String**: Use `if (str !== '')` instead of `if (str)`
- **Number**: Use `typeof num === 'number'` or `Number.isFinite(num)` instead of `if (num)`
- **Object**: Use `typeof obj === 'object' && obj !== null` instead of `if (obj)`
- **Class**: Use `if (obj instanceof MyClass)` for specific instances
- **Array**: Use `Array.isArray(arr) && arr.length > 0` instead of `if (arr)`
- **Equality**: ALWAYS use `===` and `!==`

## Lint Disable Comments (⚠️ CRITICAL)
- **NEVER** add `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, or similar comments without **explicit user instruction**.
- When encountering lint warnings/errors:
  1. Report the warning to the user.
  2. Wait for user's explicit instruction to add a disable comment.
  3. Only then add the disable comment with proper justification.
- This applies to ALL lint suppression mechanisms.
