<script setup lang="ts">
import { RouterLink } from 'vue-router';
import HomeLayout from '@src/layouts/home.vue';
</script>

<template>
  <HomeLayout>
    <div class="not_found_page">
      <div class="not_found_page-content">
        <h1 class="not_found_page-title">404</h1>
        <p class="not_found_page-subtitle">找不到頁面 / Page Not Found</p>
        <p class="not_found_page-description">抱歉，您要尋找的頁面不存在。</p>
        
        <RouterLink class="not_found_page-button" to="/">
          回首頁 / Go Home
        </RouterLink>
      </div>
    </div>
  </HomeLayout>
</template>

<style lang="scss" scoped>
.not_found_page {
  /* Display & Box Model */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 80vh;

  /* Typography */
  text-align: center;
  
  &-content {
    /* Display & Box Model */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
  }

  &-title {
    /* Display & Box Model */
    margin: 0;
    
    /* Typography */
    font-size: 6rem;
    font-weight: bold;
    color: #ff5252;
    line-height: 1;
  }

  &-subtitle {
    /* Display & Box Model */
    margin: 1rem 0 0.5rem;
    
    /* Typography */
    font-size: 2rem;
    font-weight: 600;
    color: #333;
  }

  &-description {
    /* Display & Box Model */
    margin-bottom: 2rem;
    
    /* Typography */
    font-size: 1.1rem;
    color: #666;
  }

  &-button {
    /* Display & Box Model */
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    
    /* Typography */
    font-size: 1rem;
    font-weight: 500;
    color: #fff;
    text-decoration: none;
    
    /* Visual */
    background-color: #1976d2;
    
    /* Animation */
    transition: background-color 0.2s ease, opacity 0.2s ease;
    
    &:hover {
      /* Visual */
      background-color: #1565c0;
      opacity: 0.9;
    }
  }
}
</style>
