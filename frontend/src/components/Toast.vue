<template>
  <div 
    class="toast"
    :class="[
      `toast--${type}`,
      { 'toast--dismissible': dismissible }
    ]"
    role="alert"
    :aria-live="type === 'error' ? 'assertive' : 'polite'"
    :aria-atomic="true"
  >
    <div class="toast__icon">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path :d="iconPath"/>
      </svg>
    </div>
    
    <div class="toast__content">
      <div class="toast__title">{{ title }}</div>
      <div v-if="message" class="toast__message">{{ message }}</div>
    </div>
    
    <button
      v-if="dismissible"
      class="toast__close"
      @click="handleClose"
      :aria-label="'Close notification'"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M18 6 6 18M6 6l12 12"/>
      </svg>
    </button>
    
    <!-- Progress bar for auto-dismiss -->
    <div 
      v-if="duration > 0"
      class="toast__progress"
      :style="{ animationDuration: `${duration}ms` }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { Toast as ToastType } from '@/types/domain'

interface Props extends Omit<ToastType, 'id'> {
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: true,
  duration: 5000
})

const emit = defineEmits<{
  close: []
}>()

// Icon paths for different toast types
const iconPaths: Record<ToastType['type'], string> = {
  info: 'M12 16v-4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
}

const iconPath = computed(() => iconPaths[props.type])

let timeoutId: ReturnType<typeof setTimeout>

const handleClose = () => {
  emit('close')
}

// Auto-dismiss timer
onMounted(() => {
  if (props.duration > 0) {
    timeoutId = setTimeout(() => {
      handleClose()
    }, props.duration)
  }
})

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})

// Pause auto-dismiss on hover
const handleMouseEnter = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
}

const handleMouseLeave = () => {
  if (props.duration > 0) {
    timeoutId = setTimeout(() => {
      handleClose()
    }, 1000) // Shorter timeout after hover
  }
}
</script>

<style lang="less" scoped>
.toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: @space-3;
  padding: @space-4;
  .m-card();
  min-width: 300px;
  max-width: 500px;
  animation: slideInRight @transition-base @ease-out;
  overflow: hidden;
  
  @media (max-width: @screen-sm) {
    min-width: 0;
    max-width: none;
  }
  
  &:hover {
    transform: none; // Override card hover effect
  }
  
  // Toast type variants
  &--info {
    border-left: 4px solid @color-info;
    
    .toast__icon {
      color: @color-info;
    }
  }
  
  &--success {
    border-left: 4px solid @color-success;
    
    .toast__icon {
      color: @color-success;
    }
  }
  
  &--warning {
    border-left: 4px solid @color-warning;
    
    .toast__icon {
      color: @color-warning;
    }
  }
  
  &--error {
    border-left: 4px solid @color-error;
    
    .toast__icon {
      color: @color-error;
    }
  }
  
  &--dismissible {
    padding-right: @space-12; // Make room for close button
  }
}

.toast__icon {
  flex-shrink: 0;
  margin-top: 2px; // Align with title baseline
  
  .icon {
    width: 20px;
    height: 20px;
    stroke-width: 2;
  }
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__title {
  font-weight: @font-weight-semibold;
  color: @color-text;
  font-size: @font-size-sm;
  line-height: @line-height-tight;
  margin-bottom: @space-1;
}

.toast__message {
  color: @color-text-dim;
  font-size: @font-size-sm;
  line-height: @line-height-normal;
  word-wrap: break-word;
}

.toast__close {
  position: absolute;
  top: @space-3;
  right: @space-3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: @color-text-dim;
  cursor: pointer;
  border-radius: @radius-sm;
  transition: all @transition-base @ease-out;
  
  .icon {
    width: 16px;
    height: 16px;
    stroke-width: 2;
  }
  
  &:hover {
    background: fade(@color-text-dim, 10%);
    color: @color-text;
  }
  
  &:focus-visible {
    .m-focus();
  }
}

.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: currentColor;
  animation: progressBar linear;
  transform-origin: left;
  opacity: 0.3;
}

// Animations
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes progressBar {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

// High contrast theme
.theme-contrast & {
  .toast {
    background: @color-contrast-panel;
    border-color: @color-contrast-border;
    
    &--info {
      border-left-color: @color-contrast-accent;
      
      .toast__icon {
        color: @color-contrast-accent;
      }
    }
    
    &--success {
      border-left-color: @color-success;
    }
    
    &--warning {
      border-left-color: @color-warning;
    }
    
    &--error {
      border-left-color: @color-error;
    }
  }
  
  .toast__title {
    color: @color-contrast-text;
  }
  
  .toast__message {
    color: fade(@color-contrast-text, 80%);
  }
  
  .toast__close {
    color: fade(@color-contrast-text, 70%);
    
    &:hover {
      background: fade(@color-contrast-text, 10%);
      color: @color-contrast-text;
    }
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .toast {
    animation: fadeIn @transition-fast @ease-out;
  }
  
  .toast__progress {
    animation: none;
    display: none;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}

// Touch device adjustments
@media (hover: none) {
  .toast__close {
    width: 32px;
    height: 32px;
    
    .icon {
      width: 18px;
      height: 18px;
    }
  }
}
</style>
