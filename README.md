# Parker Vue Lab

[繁體中文說明](./README.zh-TW.md)

An experimental Vue 3 (Vite) Single Page Application (SPA) project. 
This project is specifically tailored for SPA testing. It was primarily created to exclude Nuxt's SSR and build transpilation configurations, which can sometimes cause third-party packages to fail to build correctly. It serves as a pure Vue sandbox to quickly validate features and isolate package compatibility issues.

- **Framework**: Vue 3.5+ (Vite)
- **UI**: Vuetify 3
- **State**: Pinia
- **Routing**: Vue Router
- **Testing**: Vitest + Playwright

## Key Purpose

This lab environment ensures that any build or runtime issues are isolated to the Vue/Vite ecosystem without interference from Nuxt's auto-imports, Nitro engine, or SSR build steps. If a package works here but fails in `parker-nuxt-lab`, the issue is likely related to Nuxt's specific build process.

## Key Directories

- `src/views/` or `src/pages/`: Example pages
- `src/components/`: Vue components
- `src/assets/`: Styles and static assets
- `src/store/`: Pinia stores

## Requirements

- Node.js 18+ (LTS recommended)
- Yarn 1.22+ (project default)

## Install

```bash
yarn install
```

## Development

```bash
yarn dev
```

## Build & Preview

Build:

```bash
yarn build
```

Local preview:

```bash
yarn preview
```

## 🤖 AI Agent Rules

This project includes configuration files for AI code assistants to ensure consistent code style:

- **[GEMINI.md](./GEMINI.md)** - Rules for [Gemini Code Assist / Gemini CLI](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md#example-context-file-content-eg-geminimd) (Google)
- **[.agent/rules/](./.agent/rules/)** - Rules for [Antigravity](https://codelabs.developers.google.com/getting-started-google-antigravity?hl=en#8) (Google)
- **[CLAUDE.md](./CLAUDE.md)** - Rules for [Claude Code](http://platform.claude.com/docs/en/agent-sdk/modifying-system-prompts#methods-of-modification) (Anthropic)
- **[.cursor/rules/](./.cursor/rules/)** - Rules for [Cursor IDE](https://docs.cursor.com/context/rules)

## 🎨 CSS Development Standards

### CSS Property Order Convention

The project follows mainstream CSS property ordering standards to ensure code consistency and maintainability:

1. **Positioning** (position, top, left, z-index...)
2. **Display & Box Model** (display, flex, width, margin, padding, border...)
3. **Typography** (font, color, text-align...)
4. **Visual** (background, box-shadow, opacity...)
5. **Animation** (transition, animation...)
6. **Misc** (cursor, content...)

**Example**:
```scss
.example {
  // Positioning
  position: relative;
  top: 0;
  z-index: 10;

  // Display & Box Model
  display: flex;
  width: 100%;
  padding: 20px;
  border: 1px solid #ccc;

  // Typography
  font-size: 16px;
  color: #333;

  // Visual
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  // Animation
  transition: all 0.3s;

  // Misc
  cursor: pointer;
}
```

> 💡 **Note**: In actual development, to keep code concise, you typically don't need to add comments before each property category. Comments are only recommended in complex styles to improve readability.

### CSS Naming Convention

The project adopts a **Modified BEM Naming Convention**, cleverly sacrificing standard BEM's visual symbols (`__`) for better double-click selection efficiency in development tools, while maintaining CSS specificity and state management semantic integrity through SCSS concatenation and HTML attributes.

#### Naming Structure

- **Block**: Single name, e.g., `.countdown`
- **Element**: Single hyphen `-` connecting Block and Element, e.g., `.countdown-down_enter`, `.countdown-up_leave`
- **Sub-Element**: Single hyphen `-` connecting parent and child elements, with underscores `_` separating semantic words within names, e.g.:
  - `.countdown-down_enter-down_enter_up`
  - `.image_upload-preview-img`
- **State Modifiers**: Managed via HTML attribute selectors, e.g., `[css-is-anime-start='true']`, `[css-is-active='true']`
- **Color/Size Variants**: Use HTML attributes, e.g., `[css-color='red']`, `[css-size='small']`

#### HTML Attribute Usage Guidelines

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

#### Root Element Naming Convention

To quickly identify problematic elements in browser dev tools, the project uses the following root element naming convention:

- **Page Root Elements**: Use `[page_name]_page` format
  - Examples: `.hooks_test_page`, `.socket_io_page`, `.web_rtc_page`
- **Component Root Elements**: Use `[component_name]` format
  - Examples: `.scroll_fetch`, `.image_upload`, `.countdown`

#### Advantages

1. ✅ **Double-click Selection** - No `__` interruption, complete class name selection
2. ✅ **SCSS Nesting** - Maintains semantic hierarchy through `&-element`
3. ✅ **Semantic Clarity** - Underscores separate multiple semantic words
4. ✅ **State Management** - Uses HTML attributes instead of modifier classes, reducing class count
5. ✅ **Maintainability** - Preserves good readability and maintainability

**Important Rule**:
> 📌 **All elements belonging to a page must be nested under the page root class**, making the hierarchy clear in the code.

```scss
// ✅ Correct: All elements nested under hooks_test_page
.hooks_test_page {
  @extend %test_page;
  
  &-description { }      // .hooks_test_page-description
  &-grid { }             // .hooks_test_page-grid
  &-section {            // .hooks_test_page-section
    &-title { }          // .hooks_test_page-section-title
    &-description { }    // .hooks_test_page-section-description
  }
}

// ❌ Wrong: Can't tell which page description and grid belong to
.hooks_test_page { }
.description { }
.grid { }
```

### SCSS Placeholders Style Reuse

The project uses **SCSS Placeholders (`%name`)** to achieve style reuse, reducing code duplication and improving maintainability.

#### Why Use Placeholders?

1. ✅ **Reduce Duplication** - Multiple selectors can inherit the same styles
2. ✅ **Improve Maintainability** - Modify once, affect all inheriting locations
3. ✅ **Better Organization** - Centralize shared styles
4. ✅ **Responsive Support** - Placeholders can use mixins

#### Usage Examples

**Defining Placeholders**:
```scss
// Define at the top of component or page <style> block
%data_block {
  padding: 40px;
  text-align: center;
  border-radius: 8px;
  font-size: 16px;
}
```

**Using Placeholders**:
```scss
.index_page {
  &-list_section {
    &-loading {
      @extend %data_block;     // Inherit shared styles
      background-color: #e3f2fd;
      color: #1976d2;
    }
  }
}
```

#### Placeholders vs Mixins

**When to Use Placeholders**:
- ✅ Multiple selectors need exactly the same styles
- ✅ Styles don't need parameters (static styles)
- ✅ Want to reduce CSS output size (selectors are merged)

**When to Use Mixins**:
- ✅ Need parameterized styles
- ✅ Need customization based on usage
- ✅ Need conditional logic in styles

### CSS File Organization

The project adopts a **Hybrid Style Organization** strategy, combining centralized global tool management with component-specific styles placed nearby:

#### Directory Structure

```
parker-vue-lab/
├── src/
│   ├── assets/
│   │   └── styles/           # Global style tools (centralized)
│   │       ├── global.scss   # Global styles
│   │       ├── mixin.scss    # Mixins (reusable style functions)
│   │       ├── variable.scss # Variable definitions
│   │       ├── animation.scss # Animation utilities
│   │
│   ├── components/            # Component-specific styles (co-located)
│   │   ├── Button.vue
│   │   │   └── <style scoped> # Component styles
│   │
│   └── views/                 # Page-specific styles (co-located)
        └── index.vue
            └── <style scoped> # Page styles
```

#### Style Placement Principles

1. **Global Tools** → `src/assets/styles/` directory
2. **Component Styles** → Within component file
3. **Page Styles** → Within `views/` or `pages/` directory

## 🛠️ Vue Development Standards

### Dynamic Components

When using components inside a dynamic `<component :is="...">`, ensure they are properly registered or resolved, especially if they are auto-imported or globally registered. 

## Testing (Vitest + Playwright)

The project uses **Vitest** for unit/integration tests and **Playwright** for E2E tests.

### Testing Philosophy

> 💡 **The goal of testing is to catch bugs, not to achieve coverage metrics.**

The project follows "behavior-driven testing" principles:

**✅ Worth Testing**:
- Pure functions (utilities, validation logic)
- Observable component behavior

**❌ Not Worth Unit Testing**:
- Props existence checks
- CSS styles
- Features requiring browser APIs (use E2E instead)

### Test Commands

```bash
# Unit tests
yarn test:unit

# E2E tests
yarn test:e2e
```

## References

- Vue 3 Docs: <https://vuejs.org/guide/introduction.html>
- Vite: <https://vitejs.dev/>
