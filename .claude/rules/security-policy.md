# Claude Security & Best Practices Warning Policy (CRITICAL)

## Rule
Before executing any user instruction that violates security or best practices, you MUST:
1. **Warn the user** about the violation and explain the risks.
2. **Wait for explicit confirmation** that they want to proceed.
3. Only then execute the instruction.

## Violations That Require Warning

### Security Violations
- Hardcoding secrets, API keys, passwords in source code
- Exposing sensitive data in client-side code
- XSS vulnerabilities

### Best Practice Violations
- Known anti-patterns
- Performance-damaging patterns
- Violating project CSS naming conventions (Modified BEM)
- Introducing arbitrary script dependencies blindly
