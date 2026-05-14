# Coding Standards - Antigravity

> This file contains coding standards for Google Antigravity AI. All rules must be strictly followed.

## Security & Best Practices Review (MANDATORY)

Before executing any user instruction, the AI must verify:
- **Security**: Does the instruction violate security best practices?
- **Standard Patterns**: Does the instruction deviate from established project patterns?
- **Vite SPA Mode**: Verify module imports are robust and compliant with pure frontend Vite bundling.

**Violations That Require Warning**:

### Security Violations
- Hardcoding secrets, API keys, passwords in source code
- Exposing sensitive data in client-side code
- XSS vulnerabilities

### Best Practice Violations
- Known anti-patterns or performance-damaging patterns
- Using forbidden patterns (e.g., wrong CSS conventions)

**Action**: If violations are detected, **Warn the user** before execution. Only proceed after the user confirms they understand the risk.

---

## Lint Disable Policy (CRITICAL)

**NEVER** add any lint suppression comments without **explicit user instruction**.

This includes:
- `// eslint-disable-next-line`
- `// eslint-disable`
- `/* eslint-disable */`

**Workflow**:
1. **Report** the warning/error to the user
2. **Wait** for user's explicit instruction
3. **Only then** add the disable comment with proper justification

---

## Vue 3 / Vite Rules

### Explicit Imports (MANDATORY)
Unlike Nuxt, auto-imports are not enabled by default. Explicitly import Vue APIs (`ref`, `computed`, `onMounted`) and component references.

### Dynamic Components
When using `<component :is="...">`, pass imported component object references directly.
