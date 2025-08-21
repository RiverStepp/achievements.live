<template>
  <div class="skeleton-card" :class="{ compact: density === 'compact' }">
    <div class="skeleton-image"></div>
    <div class="skeleton-content">
      <div class="skeleton-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-rating"></div>
      </div>
      <div class="skeleton-meta"></div>
      <div class="skeleton-stats">
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
      </div>
      <div class="skeleton-tags">
        <div class="skeleton-tag"></div>
        <div class="skeleton-tag"></div>
      </div>
      <div class="skeleton-price"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  density?: 'compact' | 'comfortable' | 'spacious'
}

withDefaults(defineProps<Props>(), {
  density: 'comfortable'
})
</script>

<style lang="less" scoped>
.skeleton-card {
  .m-card();
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  &.compact {
    .skeleton-content {
      padding: @space-3;
    }
  }
}

.skeleton-image {
  aspect-ratio: 460 / 215;
  background: linear-gradient(90deg, @color-panel-2 25%, @color-panel-3 50%, @color-panel-2 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.skeleton-content {
  padding: @space-4;
  display: flex;
  flex-direction: column;
  gap: @space-3;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: @space-2;
}

.skeleton-title {
  flex: 1;
  height: 24px;
  background: linear-gradient(90deg, @color-panel-2 25%, @color-panel-3 50%, @color-panel-2 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: @radius-sm;
}

.skeleton-rating {
  width: 60px;
  height: 16px;
  background: linear-gradient(90deg, @color-panel-2 25%, @color-panel-3 50%, @color-panel-2 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: @radius-sm;
}

.skeleton-meta {
  width: 70%;
  height: 14px;
  background: linear-gradient(90deg, @color-panel-2 25%, @color-panel-3 50%, @color-panel-2 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: @radius-sm;
}

.skeleton-stats {
  display: flex;
  gap: @space-3;
}

.skeleton-stat {
  width: 60px;
  height: 20px;
  background: linear-gradient(90deg, @color-panel-2 25%, @color-panel-3 50%, @color-panel-2 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: @radius-sm;
  
  &:first-child {
    width: 80px;
  }
  
  &:last-child {
    width: 50px;
  }
}

.skeleton-tags {
  display: flex;
  gap: @space-2;
}

.skeleton-tag {
  width: 60px;
  height: 24px;
  background: linear-gradient(90deg, @color-panel-2 25%, @color-panel-3 50%, @color-panel-2 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: @radius-full;
  
  &:last-child {
    width: 80px;
  }
}

.skeleton-price {
  width: 40%;
  height: 16px;
  background: linear-gradient(90deg, @color-panel-2 25%, @color-panel-3 50%, @color-panel-2 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: @radius-sm;
  margin-top: @space-2;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

// High contrast theme
.theme-contrast & {
  .skeleton-image,
  .skeleton-title,
  .skeleton-rating,
  .skeleton-meta,
  .skeleton-stat,
  .skeleton-tag,
  .skeleton-price {
    background: linear-gradient(90deg, @color-contrast-panel 25%, fade(@color-contrast-panel, 50%) 50%, @color-contrast-panel 75%);
    background-size: 200% 100%;
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .skeleton-image,
  .skeleton-title,
  .skeleton-rating,
  .skeleton-meta,
  .skeleton-stat,
  .skeleton-tag,
  .skeleton-price {
    animation: none;
    background: @color-panel-2;
  }
  
  .theme-contrast & {
    .skeleton-image,
    .skeleton-title,
    .skeleton-rating,
    .skeleton-meta,
    .skeleton-stat,
    .skeleton-tag,
    .skeleton-price {
      background: @color-contrast-panel;
    }
  }
}
</style>
