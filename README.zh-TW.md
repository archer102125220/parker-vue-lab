# Parker Vue Lab

[English README](./README.md)

一個以 Vue 3 (Vite) 為核心的 SPA 實驗型專案。
此專案相比 Nuxt 專案，是更加特化於 SPA 測試用的環境。主要目的是為了排除 Nuxt 針對打包轉譯（SSR / Nitro 等）所做的設定，避免這些設定導致部分第三方套件無法正常 build 的狀況。它作為一個純粹的 Vue 沙盒，用於快速驗證功能與排查套件相容性問題。

- **框架**: Vue 3.5+ (Vite)
- **UI**: Vuetify 3（視配置而定）
- **狀態管理**: Pinia
- **路由**: Vue Router
- **測試**: Vitest + Playwright（若有配置）

## 主要目的

這個測試環境確保任何 build 或 runtime 問題都能被隔離在單純的 Vue/Vite 生態系中，不受 Nuxt 的自動引入、Nitro 引擎或 SSR 建置步驟干擾。如果一個套件在這裡可以正常運作但在 `parker-nuxt-lab` 失敗，那麼問題很可能與 Nuxt 特定的建置過程有關。

## 目錄重點

- `src/views/` 或 `src/pages/`: 範例頁面
- `src/components/`: Vue 共用組件
- `src/assets/`: 樣式與靜態資源
- `src/store/`: Pinia 狀態管理

## 環境需求

- Node.js 18+（建議 LTS）
- Yarn 1.22+（專案預設）

## 安裝依賴

```bash
yarn install
```

## 開發模式

```bash
yarn dev
```

## 打包與預覽

建置：

```bash
yarn build
```

本機預覽：

```bash
yarn preview
```

## 🤖 AI Agent 規則

本專案包含 AI Agent（Claude、Cursor 等）的程式碼規則，以確保一致的程式碼生成：

- **[GEMINI.md](./GEMINI.md)** - [Gemini Code Assist / Gemini CLI](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md#example-context-file-content-eg-geminimd)（[中文文件 - 非官方](https://gemini-cli.gh.miniasp.com/cli/configuration.html#context-%E6%AA%94%E6%A1%88%E5%85%A7%E5%AE%B9%E7%AF%84%E4%BE%8B-%E4%BE%8B%E5%A6%82-gemini-md)） - Gemini Code Assist / Gemini CLI 規則
- **[.agent/rules/](./.agent/rules/)** - [Antigravity](https://codelabs.developers.google.com/getting-started-google-antigravity?hl=zh-tw#8)（Google）規則
- **[CLAUDE.md](./CLAUDE.md)** - [Claude Code](http://platform.claude.com/docs/en/agent-sdk/modifying-system-prompts#methods-of-modification) - 了解 Claude Code 如何使用 CLAUDE.md 作為專案專屬指令
- **[.cursor/rules/](./.cursor/rules/)** - [Cursor IDE](https://docs.cursor.com/context/rules) - Cursor IDE 規則設定官方指南

## 🎨 CSS 開發規範

### CSS 屬性順序規範

專案遵循主流 CSS 屬性排序標準，以確保代碼一致性與可維護性：

1. **Positioning** (position, top, left, z-index...)
2. **Display & Box Model** (display, flex, width, margin, padding, border...)
3. **Typography** (font, color, text-align...)
4. **Visual** (background, box-shadow, opacity...)
5. **Animation** (transition, animation...)
6. **Misc** (cursor, content...)

**範例**：
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

> 💡 **注意**：在實際開發中，為了保持代碼簡潔，通常不需要在每個屬性分類前加上註解。只有在複雜的樣式中才建議使用註解來提高可讀性。

### CSS 命名規範

專案採用**改良式 BEM 命名法**，巧妙地犧牲了標準 BEM 的視覺符號（`__`），以換取更高的開發工具雙擊選取效率，並透過 SCSS 拼接和 HTML 屬性來確保其 CSS 權重和狀態管理的語義完整性。

#### 命名結構

- **Block（區塊）**：使用單一名稱，如 `.countdown`
- **Element（元素）**：使用單個連字符 `-` 連接 Block 與 Element，如 `.countdown-down_enter`、`.countdown-up_leave`
- **Sub-Element（子元素）**：使用單個連字符 `-` 連接父元素與子元素，元素名稱內部使用底線 `_` 分隔語義單詞，如：
  - `.countdown-down_enter-down_enter_up`
  - `.image_upload-preview-img`
- **狀態修飾**：透過 HTML 屬性選擇器管理狀態，如 `[css-is-anime-start='true']`、`[css-is-active='true']`
- **顏色/大小變體**：使用 HTML 屬性，如 `[css-color='red']`、`[css-size='small']`

#### HTML 屬性使用規範

**何時使用 HTML 屬性**：
1. **狀態**: `[css-is-active='true']`, `[css-is-disabled='true']`
2. **顏色變體**: `[css-color='red']`, `[css-color='blue']`
3. **大小變體**: `[css-size='small']`, `[css-size='large']`

**何時使用獨立 class**：
當 class name 本身具有**明確語義**時（不只描述外觀）：
```scss
// ✅ 語義化的 class name
.alert {
  &-success { }  // 成功提示（語義明確）
  &-error { }    // 錯誤提示（語義明確）
}
```

#### 根元素命名規範

為了在瀏覽器開發工具中快速定位問題元素，專案採用以下根元素命名規範：

- **頁面根元素**：使用 `[頁面名稱]_page` 格式
  - 例如：`.hooks_test_page`、`.socket_io_page`、`.web_rtc_page`
- **組件根元素**：使用 `[組件名]` 格式
  - 例如：`.scroll_fetch`、`.image_upload`、`.countdown`

#### 優勢

1. ✅ **雙擊選取** - 無 `__` 中斷，可完整選取類別名稱
2. ✅ **SCSS 巢狀** - 透過 `&-element` 維持語義層級關係
3. ✅ **語義清晰** - 使用底線分隔多個語義單詞
4. ✅ **狀態管理** - 使用 HTML 屬性而非 modifier 類別來管理狀態，減少類別數量
5. ✅ **可維護性** - 保持良好的可讀性與維護性

**重要規則**：
> 📌 **所有屬於頁面的元素都必須嵌套在頁面根類別下**，使代碼中的層級關係清晰明確。

```scss
// ✅ 正確：所有元素都嵌套在 hooks_test_page 下
.hooks_test_page {
  @extend %test_page;
  
  &-description { }      // .hooks_test_page-description
  &-grid { }             // .hooks_test_page-grid
  &-section {            // .hooks_test_page-section
    &-title { }          // .hooks_test_page-section-title
    &-description { }    // .hooks_test_page-section-description
  }
}

// ❌ 錯誤：無法判斷 description 和 grid 屬於哪個頁面
.hooks_test_page { }
.description { }
.grid { }
```

### SCSS Placeholders 樣式複用

專案使用 **SCSS Placeholders（`%name`）** 來實現樣式複用，減少重複代碼並提高可維護性。

#### 為什麼使用 Placeholders？

1. ✅ **減少重複** - 多個選擇器可以繼承相同的樣式
2. ✅ **提高可維護性** - 修改一處即可影響所有繼承的地方
3. ✅ **更好的組織** - 將共用樣式集中管理
4. ✅ **支援響應式** - Placeholders 內可以使用 mixins

#### Placeholders vs Mixins

**使用 Placeholders 的時機**：
- ✅ 多個選擇器需要完全相同的樣式
- ✅ 樣式不需要參數（靜態樣式）
- ✅ 想要減少 CSS 輸出大小（選擇器會被合併）

**使用 Mixins 的時機**：
- ✅ 需要參數化的樣式
- ✅ 需要根據使用情況客製化
- ✅ 需要在樣式中使用條件邏輯

### CSS 檔案組織規範

專案採用**混合式樣式組織**策略，結合全域工具集中管理與組件樣式就近放置的優勢：

#### 目錄結構

```
parker-vue-lab/
├── src/
│   ├── assets/
│   │   └── styles/           # 全域樣式工具（集中管理）
│   │       ├── global.scss   # 全域樣式
│   │       ├── mixin.scss    # Mixins（可重用的樣式函數）
│   │       ├── variable.scss # 變數定義
│   │       ├── animation.scss # 動畫工具
│   │
│   ├── components/            # 組件特定樣式（就近放置）
│   │   ├── Button.vue
│   │   │   └── <style scoped> # 組件樣式
│   │
│   └── views/                 # 頁面特定樣式（就近放置）
        └── index.vue
            └── <style scoped> # 頁面樣式
```

#### 樣式放置原則

1. **全域工具** → `src/assets/styles/` 目錄
2. **組件樣式** → 組件檔案內
3. **頁面樣式** → `src/views/` 或 `src/pages/` 目錄內

## 🛠️ Vue 開發規範

### 動態組件與自動導入組件

在動態 `<component :is="...">` 中使用組件時，確保組件已正確註冊或引用，特別是當沒有 Nuxt 自動引入功能時，必須在 `<script setup>` 內確保正確導入。

## 測試（Vitest + Playwright）

專案採用 **Vitest** 進行單元/整合測試，**Playwright** 進行 E2E 測試。

### 測試哲學

> 💡 **測試的目的是捕獲 bug，而非達到覆蓋率指標。**

專案遵循「行為導向測試」原則：

**✅ 值得測試**：
- 純函數（工具函數、驗證邏輯）
- 組件的可觀察行為

**❌ 不值得單元測試**：
- Props 是否存在
- CSS 樣式
- 需要瀏覽器 API 的功能（改用 E2E）

### 測試指令

```bash
# 單元測試
yarn test:unit

# E2E 測試
yarn test:e2e
```

## 參考連結

- Vue 3 文件：<https://vuejs.org/guide/introduction.html>
- Vite：<https://vitejs.dev/>
