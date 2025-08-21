<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path :d="iconPath"/>
      </svg>
    </div>
    
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    
    <div v-if="$slots.actions" class="empty-state__actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  description?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'search'
})

const iconPaths: Record<string, string> = {
  search: 'M11 2a9 9 0 106.32 15.49l4.58 4.58a1 1 0 001.4-1.42l-4.58-4.58A9 9 0 0011 2z',
  empty: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z'
}

const iconPath = computed(() => iconPaths[props.icon] || iconPaths.search)
</script>

<style lang="less" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: @space-12 @space-4;
  
  &__icon {
    margin-bottom: @space-6;
    color: @color-text-dim;
    
    .icon {
      width: 64px;
      height: 64px;
      stroke-width: 1;
    }
  }
  
  &__title {
    font-size: @font-size-xl;
    font-weight: @font-weight-semibold;
    color: @color-text;
    margin: 0 0 @space-3;
  }
  
  &__description {
    font-size: @font-size-base;
    color: @color-text-dim;
    line-height: @line-height-relaxed;
    max-width: 400px;
    margin: 0 0 @space-6;
  }
  
  &__actions {
    display: flex;
    gap: @space-3;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
