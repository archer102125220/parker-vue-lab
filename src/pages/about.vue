<script setup lang="ts">
import DefaultLayout from '@src/layouts/default.vue';
</script>

<template>
  <DefaultLayout>
    <div class="about_page">
      <!-- Hero Section -->
      <section class="about_page-hero">
        <div class="about_page-hero-background">
          <div class="about_page-hero-background-overlay" />
        </div>
        <div class="about_page-hero-content">
          <h1 class="about_page-hero-content-title">關於 Parker Vue Lab</h1>
          <p class="about_page-hero-content-subtitle">專為 SPA 測試打造的實驗沙盒</p>
          <p class="about_page-hero-content-description">
            本專案是從 Parker Nuxt Lab 獨立出來，專注於純客戶端渲染 (SPA) 與排除複雜打包環境的測試專案。
          </p>
        </div>
      </section>

      <!-- Project Overview -->
      <section class="about_page-section about_page-overview">
        <div class="about_page-section-container">
          <h2 class="about_page-section-title">專案介紹</h2>
          <div class="about_page-overview-content">
            <p class="about_page-overview-content-text">
              一個以 Vue 3 (Vite) 為核心的 SPA 實驗型專案。此專案相比 Nuxt 專案，是更加特化於 SPA 測試用的環境。
            </p>
            <p class="about_page-overview-content-text">
              主要目的是為了排除 Nuxt 針對打包轉譯（SSR / Nitro 等）所做的設定，避免這些設定導致部分第三方套件無法正常 build 的狀況。它作為一個純粹的 Vue 沙盒，用於快速驗證功能與排查套件相容性問題。
            </p>
            <p class="about_page-overview-content-text">
              這個測試環境確保任何 build 或 runtime 問題都能被隔離在單純的 Vue/Vite 生態系中，不受 Nuxt 的自動引入、Nitro 引擎或 SSR 建置步驟干擾。如果一個套件在這裡可以正常運作但在 parker-nuxt-lab 失敗，那麼問題很可能與 Nuxt 特定的建置過程有關。
            </p>
          </div>
        </div>
      </section>

      <!-- Tech Stack -->
      <section class="about_page-section about_page-tech_stack">
        <div class="about_page-section-container">
          <h2 class="about_page-section-title">技術選型</h2>
          <div class="about_page-tech_stack-grid">
            <div class="tech_stack-card">
              <h3 class="tech_stack-card-title">前端核心</h3>
              <ul class="tech_stack-card-list">
                <li class="tech_stack-card-list-item">Vue 3.5+</li>
                <li class="tech_stack-card-list-item">Vite</li>
                <li class="tech_stack-card-list-item">TypeScript</li>
                <li class="tech_stack-card-list-item">SCSS</li>
              </ul>
            </div>
            <div class="tech_stack-card">
              <h3 class="tech_stack-card-title">UI & 狀態管理</h3>
              <ul class="tech_stack-card-list">
                <li class="tech_stack-card-list-item">Vuetify 3</li>
                <li class="tech_stack-card-list-item">Pinia</li>
                <li class="tech_stack-card-list-item">Vue Router</li>
              </ul>
            </div>
            <div class="tech_stack-card">
              <h3 class="tech_stack-card-title">測試 & 工具</h3>
              <ul class="tech_stack-card-list">
                <li class="tech_stack-card-list-item">Vitest</li>
                <li class="tech_stack-card-list-item">Playwright</li>
                <li class="tech_stack-card-list-item">ESLint</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Module Federation -->
      <section class="about_page-section about_page-federation">
        <div class="about_page-section-container">
          <h2 class="about_page-section-title">模組聯邦 (Module Federation)</h2>
          <div class="about_page-overview-content">
            <p class="about_page-overview-content-text">
              此專案透過 <code>@originjs/vite-plugin-federation</code> 輸出聯邦模組（如 DocEditor, SheetEditor 等等），作為微前端組件供其他專案引用。
            </p>
            <p class="about_page-overview-content-text">
              為了克服多進入點型別匯出的痛點，專案內建了客製化的 Vite 插件。在打包時自動於 <code>dist/types/</code> 產出 <code>parker-vue-lab-federation.d.ts</code> 統一入口型別檔，並且完美保留原始的型別目錄結構。
            </p>
            <p class="about_page-overview-content-text">
              引用端專案只需在全域型別聲明加入一條 <code>&lt;/// reference types="..." /&gt;</code>，TypeScript 即可自動沿著原始目錄結構解析所有匯出模組的型別，完全不需要在 tsconfig.json 中設定複雜的 paths 映射！
            </p>
          </div>
        </div>
      </section>
    </div>
  </DefaultLayout>
</template>

<style lang="scss" scoped>
.about_page {
  // Display & Box Model
  min-height: 100vh;
  // Visual
  background: var(--color-bg-primary, #ffffff);
}

.about_page-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  padding: 80px 24px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 40px;

  &-background {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    width: 100%;
    height: 100%;

    &-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        135deg,
        rgba(78, 205, 196, 0.9) 0%,
        rgba(68, 160, 141, 0.9) 100%
      );
    }
  }

  &-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 900px;
    text-align: center;

    &-title {
      margin-bottom: 24px;
      font-size: 56px;
      font-weight: 800;
      line-height: 1.1;
      color: #ffffff;
      letter-spacing: -0.02em;

      @media (max-width: 768px) {
        font-size: 42px;
      }
    }

    &-subtitle {
      margin-bottom: 16px;
      font-size: 24px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.95);

      @media (max-width: 768px) {
        font-size: 20px;
      }
    }

    &-description {
      max-width: 600px;
      font-size: 18px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.85);

      @media (max-width: 768px) {
        font-size: 16px;
      }
    }
  }
}

.about_page-section {
  padding: 80px 24px;

  &-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &-title {
    margin-bottom: 48px;
    font-size: 42px;
    font-weight: 700;
    text-align: center;
    color: var(--color-text-primary, #1a1a1a);

    @media (max-width: 768px) {
      font-size: 32px;
    }
  }
}

.about_page-overview {
  background: var(--color-bg-secondary, #f8f9fa);
  border-radius: 12px;

  &-content {
    max-width: 800px;
    margin: 0 auto;

    &-text {
      margin-bottom: 24px;
      font-size: 18px;
      line-height: 1.8;
      color: var(--color-text-secondary, #4a5568);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.about_page-tech_stack {
  &-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
  }
}

.tech_stack-card {
  padding: 32px 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  &-title {
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: 600;
    color: #44a08d;
  }

  &-list {
    padding-left: 0;
    list-style: none;

    &-item {
      padding: 8px 0;
      padding-left: 24px;
      position: relative;
      font-size: 16px;
      line-height: 1.6;
      color: var(--color-text-secondary, #6c757d);

      &::before {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        content: '▸';
        color: #4ecdc4;
        font-size: 14px;
      }
    }
  }
}
</style>
