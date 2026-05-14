---
applyTo: "**/*.{scss,css,vue}"
---

# SCSS/CSS Standards

## Property Order (MANDATORY)
1. Positioning (`position`, `top`, `z-index`)
2. Display & Box Model (`display`, `flex`, `width`, `margin`, `padding`, `border`)
3. Typography (`font`, `color`, `text-align`)
4. Visual (`background`, `box-shadow`, `opacity`)
5. Animation (`transition`, `animation`)
6. Misc (`cursor`, `content`)

## Modified BEM Naming (MANDATORY)
- Block: `block_name` (multi-word uses `_`)
- Element: `block-element` (connected with `-`)
- Sub-Element: `block-element-sub` (continue with `-`)
- State: `[css-is-active='true']` (HTML attributes)
- Color/Size variants: `[css-color='red']`, `[css-size='small']` (HTML attributes)

## Key Rules
1. Each element uses ONLY ONE className.
2. Each element MUST have a UNIQUE className.
3. All elements MUST be nested under Block root class.
4. Do NOT share CSS class names between views/pages.
