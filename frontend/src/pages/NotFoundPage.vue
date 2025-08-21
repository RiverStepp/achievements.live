<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">Page Not Found</h1>
      <p class="error-description">
        The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
      </p>
      
      <div class="error-actions">
        <router-link to="/" class="btn-primary">Go Home</router-link>
        <button @click="goBack" class="btn-secondary">Go Back</button>
      </div>
      
      <div class="search-suggestion">
        <p>Or search for games:</p>
        <SearchBar placeholder="Search for games..." />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SearchBar from '@/components/SearchBar.vue'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style lang="less" scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: @space-8;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  
  .error-code {
    font-size: 6rem;
    font-weight: @font-weight-bold;
    color: @color-accent;
    line-height: 1;
    margin-bottom: @space-4;
    
    @media (max-width: @screen-sm) {
      font-size: 4rem;
    }
  }
  
  .error-title {
    font-size: @font-size-2xl;
    font-weight: @font-weight-semibold;
    color: @color-text;
    margin: 0 0 @space-4;
  }
  
  .error-description {
    font-size: @font-size-base;
    color: @color-text-dim;
    line-height: @line-height-relaxed;
    margin: 0 0 @space-8;
  }
  
  .error-actions {
    display: flex;
    gap: @space-3;
    justify-content: center;
    margin-bottom: @space-8;
    
    @media (max-width: @screen-sm) {
      flex-direction: column;
      align-items: center;
    }
  }
  
  .search-suggestion {
    p {
      color: @color-text-dim;
      margin: 0 0 @space-4;
      font-size: @font-size-sm;
    }
  }
}

.btn-primary {
  .m-button-primary();
  text-decoration: none;
}

.btn-secondary {
  .m-button-secondary();
}
</style>
