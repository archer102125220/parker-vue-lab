# JavaScript/TypeScript Strict Standards (MANDATORY)

In this project, use strict type checks based on the variable's initialization state. Avoid loose truthy/falsy checks.

## 1. Type Safety (MANDATORY)
- **NEVER use `any` type** - Use precise type definitions, generics, or `unknown` instead.
- **Use `as unknown as TargetType`** for type assertions when necessary (double assertion).
- **NEVER use `as any`** - Always use `as unknown as TargetType` for safer assertions.
- **Add explanatory comments** when using type assertions to explain why it's necessary.
- **Use inline type imports** - E.g., `import { ref, type Ref } from 'vue'`.

## 2. Runtime Data Validation

### 1. String Validation
- **Do NOT** use: `if (str)` or `if (!str)`
- **MUST use**: `if (str !== '')` (Check against initialized empty string)

### 2. Number Validation
- **Do NOT** use: `if (num)`
- **MUST use**: 
  - `if (typeof num === 'number')`
  - `if (num !== 0)` (if 0 is invalid)
  - `if (Number.isFinite(num))`

### 3. Object Validation
- **Do NOT** use: `if (obj)`
- **MUST use**: `if (typeof obj === 'object' && obj !== null)`
- **Strict Class Check**: `if (obj instanceof MyClass)` (when validating specific class instances)

### 4. Array Validation
- **Do NOT** use: `if (arr)`
- **MUST use**: `if (Array.isArray(arr) && arr.length > 0)`

### 5. Strict Equality
- **ALWAYS** use `===` and `!==`.
- **NEVER** use `==` or `!=`.
