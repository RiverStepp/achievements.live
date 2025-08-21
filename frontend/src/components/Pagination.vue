<template>
  <nav class="pagination" role="navigation" aria-label="Pagination">
    <button
      class="pagination__button pagination__button--prev"
      :disabled="currentPage <= 1"
      @click="goToPage(currentPage - 1)"
      aria-label="Go to previous page"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
      Previous
    </button>
    
    <div class="pagination__pages">
      <button
        v-for="page in visiblePages"
        :key="page"
        class="pagination__page"
        :class="{ 'pagination__page--current': page === currentPage }"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
    </div>
    
    <button
      class="pagination__button pagination__button--next"
      :disabled="currentPage >= totalPages"
      @click="goToPage(currentPage + 1)"
      aria-label="Go to next page"
    >
      Next
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  hasNext?: boolean
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  hasNext: true,
  maxVisible: 7
})

const emit = defineEmits<{
  'page-change': [page: number]
}>()

const visiblePages = computed(() => {
  const { currentPage, totalPages, maxVisible } = props
  const pages: number[] = []
  
  if (totalPages <= maxVisible) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Calculate range around current page
    const half = Math.floor(maxVisible / 2)
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }
  
  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>

<style lang="less" scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: @space-2;
  justify-content: center;
  
  &__button {
    .m-button-secondary();
    display: flex;
    align-items: center;
    gap: @space-2;
    
    .icon {
      width: 16px;
      height: 16px;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  &__pages {
    display: flex;
    gap: @space-1;
    margin: 0 @space-2;
  }
  
  &__page {
    .m-button-ghost();
    min-width: 40px;
    padding: @space-2 @space-3;
    
    &--current {
      background: @color-accent;
      color: @color-bg;
      
      &:hover {
        background: @color-accent-hover;
      }
    }
  }
}

@media (max-width: @screen-sm) {
  .pagination {
    &__button {
      font-size: @font-size-sm;
      padding: @space-2;
      
      span {
        display: none;
      }
    }
    
    &__pages {
      margin: 0 @space-1;
    }
    
    &__page {
      min-width: 36px;
      padding: @space-2;
      font-size: @font-size-sm;
    }
  }
}
</style>
