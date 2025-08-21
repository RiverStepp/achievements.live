<template>
  <div 
    class="user-avatar"
    :class="[
      `size-${size}`,
      { 'has-border': border, 'is-online': showOnline && user }
    ]"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img
      v-if="user?.avatar"
      :src="user.avatar"
      :alt="`${user.displayName}'s avatar`"
      class="avatar-image"
      @error="handleImageError"
    />
    <div v-else class="avatar-placeholder">
      <span class="avatar-initials">
        {{ initials }}
      </span>
    </div>
    
    <div v-if="showOnline && user" class="online-indicator" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types/domain'

interface Props {
  user: User | null
  size?: number
  border?: boolean
  showOnline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  border: false,
  showOnline: false
})

const initials = computed(() => {
  if (!props.user?.displayName) return '?'
  
  const names = props.user.displayName.trim().split(' ')
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase()
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
})

const handleImageError = (event: Event) => {
  // Hide broken image and show placeholder
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>

<style lang="less" scoped>
.user-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: @radius-full;
  overflow: hidden;
  background: linear-gradient(135deg, @color-accent, @color-accent-2);
  flex-shrink: 0;
  
  &.has-border {
    border: 2px solid @color-border;
  }
  
  &.is-online::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 25%;
    height: 25%;
    background: @color-success;
    border: 2px solid @color-panel;
    border-radius: @radius-full;
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform @transition-base @ease-out;
  
  .user-avatar:hover & {
    transform: scale(1.05);
  }
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, @color-accent, @color-accent-2);
  color: @color-bg;
}

.avatar-initials {
  font-weight: @font-weight-semibold;
  font-size: 0.6em;
  line-height: 1;
  text-transform: uppercase;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  background: @color-success;
  border: 2px solid @color-panel;
  border-radius: @radius-full;
  box-shadow: @shadow-sm;
}

// Size variations
.size-24 .avatar-initials { font-size: 10px; }
.size-32 .avatar-initials { font-size: 12px; }
.size-40 .avatar-initials { font-size: 14px; }
.size-48 .avatar-initials { font-size: 16px; }
.size-56 .avatar-initials { font-size: 18px; }
.size-64 .avatar-initials { font-size: 20px; }
.size-80 .avatar-initials { font-size: 24px; }

// High contrast theme
.theme-contrast & {
  &.has-border {
    border-color: @color-contrast-border;
  }
  
  .online-indicator {
    border-color: @color-contrast-panel;
  }
}
</style>
