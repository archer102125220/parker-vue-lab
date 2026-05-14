# Agent 程式碼規範 (Agent Coding Rules)

> ⚠️ **強制規範**：此目錄及專案內定義的所有 AI 開發規範文件必須被嚴格遵守。
> 
> 任何 AI Agent 在修改此專案的程式碼時，必須先閱讀並遵循這些規範。

## 🛡️ 資安與最佳實踐審查 (Security & Best Practices Review)

執行任何使用者指示前，AI 必須檢查：
- **資安風險**：該指示是否違反資安最佳實踐（如硬編碼密鑰、暴露敏感資訊、XSS 等）？
- **標準模式**：該指示是否偏離專案既有的標準處理模式？
- **純前端 Vite SPA 架構相容性**：確認模組導入乾淨獨立，符合純前端 Vite 編譯與打包原則。

**若偵測到違規**：在執行前先通知使用者並說明疑慮。只有在使用者確認理解風險並仍想繼續的情況下才可執行。

## 🤖 AI 模型對應表 (AI Model Mapping)

不同的 AI 助手與擴充套件會自動讀取對應的規則文件，請確保相關文件保持同步：

| AI 模型 / 工具 | 主要規則文件路徑 | 說明 |
|---------|--------------|------|
| **Google Gemini** | `GEMINI.md` | 使用 Google IDX 或 Gemini Code Assist 時以此為準 |
| **Anthropic Claude** | `CLAUDE.md`<br>`.claude/rules/*.md` | 使用 Sonnet 或 Claude Code 等擴充套件時自動讀取 |
| **Antigravity Agent** | `AGENTS.md`<br>`.agent/rules/*.md` | Google Antigravity AI Agent 系統專用 |
| **Cursor AI** | `.cursor/rules/*.mdc` | Cursor IDE 專用的 MDC 規則檔 |
| **GitHub Copilot** | `.github/copilot-instructions.md`<br>`.github/instructions/*.instructions.md` | GitHub Copilot Chat 全域與 Glob 配對專用指令 |

> **開發者注意**：當更新核心規範時，請同步更新上述所有配置檔案，確保不同 AI 工具行為一致。

---

## 🔴 核心規則摘要

### 1. Vue 3 / Vite 專屬規範
- **顯式導入 (Explicit Imports)**：與 Nuxt 不同，純 Vite 專案未預設啟用自動導入 (auto-import)。必須顯式引用所有 Vue 內建 Composition API（如 `ref`, `reactive`, `computed`, `onMounted`）與外部組件。
- **動態組件處理**：使用 `<component :is="...">` 時，傳遞的必須是直接 import 或 resolve 的組件物件參考。
- **Props 與 Emits 宣告**：在 `<script setup lang="ts">` 中一律採用純 TypeScript 泛型語法定義介面（如 `defineProps<{ title: string }>()`）。

### 2. TypeScript 嚴格標準
- **全面禁止 `any`**：強制使用精確型別、泛型或 `unknown` 取代。
- **雙重型別斷言**：進行斷言時必須採用 `as unknown as TargetType`，並附帶註解說明必要性。
- **行內型別引用**：推行同行引入型別（如 `import { ref, type Ref } from 'vue'`）。
- **嚴格執行期驗證**：
  - 字串: `if (str !== '')`
  - 數值: `typeof num === 'number'` 或 `Number.isFinite(num)`
  - 物件: `typeof obj === 'object' && obj !== null`
  - 陣列: `Array.isArray(arr) && arr.length > 0`
  - 比較: 絕對使用 `===` 與 `!==`

### 3. CSS/SCSS 規範
- **屬性宣告順序**：Positioning → Display & Box Model → Typography → Visual → Animation → Misc。
- **Modified BEM 命名法**：
  - Block: `block_name` (多詞用 `_`)
  - Element: `block-element` (用 `-` 連接)
  - Sub-Element: `block-element-sub`
  - State: 統一使用以 `css-` 開頭的 HTML 屬性（如 `[css-is-active='true']`）
- **單一且唯一 Class 原則**：每個 DOM 元素僅能使用一個 class，且名稱必須全域唯一，便於 DevTools 快速定位與避免樣式污染。禁止跨視圖/頁面共用 class 名稱。

### 4. 禁止自動化腳本盲目重構 (CRITICAL)
- **絕對禁止**使用 `sed`、`awk` 等純文字腳本進行程式碼替換，避免因缺乏上下文感知導致 import 遺漏或破壞語法結構。所有重構必須透過具備智慧感知能力的 AI 工具執行。

### 5. Lint 抑制政策 (CRITICAL)
- 未經人類開發者明確指示，**絕對禁止**添加 `eslint-disable`、`@ts-ignore` 等任何抑制警告/錯誤的註解。優先修復根本問題。

---

## 快速參考範例

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
