<template>
  <div 
    class="stat-chip"
    :class="[
      `variant-${variant}`,
      `size-${size}`,
      { interactive }
    ]"
    :title="tooltip"
    @click="handleClick"
  >
    <div class="stat-chip__icon" v-if="icon || $slots.icon">
      <slot name="icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path :d="iconPath"/>
        </svg>
      </slot>
    </div>
    
    <div class="stat-chip__content">
      <span class="stat-chip__value">{{ formattedValue }}</span>
      <span v-if="label" class="stat-chip__label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon?: string
  value: string | number
  label?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  interactive?: boolean
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'medium',
  interactive: false
})

const emit = defineEmits<{
  click: []
}>()

// Icon paths for common icons
const iconPaths: Record<string, string> = {
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M12 3v6m0 0l4-2m-4 2L8 7m0 8v6m8-6v6m-4-3a4 4 0 1 1-8 0',
  unlock: 'M7 11V7a5 5 0 0 1 10 0v4m-5 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-7-8h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z',
  lock: 'M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a7 7 0 0 0-14 0v2',
  clock: 'M12 6v6l4 2m8-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0z',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3-13a4 4 0 11-6 0 4 4 0 016 0z',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  gamepad: 'M18.5 8a4.5 4.5 0 01-9 0M7 10v4m6-4v4m-3-2h6M5.5 8a4.5 4.5 0 109 0m-4.5 4a4 4 0 01-8 0'
}

const iconPath = computed(() => {
  return props.icon ? iconPaths[props.icon] || iconPaths.star : iconPaths.star
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    // Format large numbers
    if (props.value >= 1000000) {
      return `${(props.value / 1000000).toFixed(1)}M`
    } else if (props.value >= 1000) {
      return `${(props.value / 1000).toFixed(1)}K`
    }
    return props.value.toString()
  }
  return props.value
})

const tooltip = computed(() => {
  if (props.tooltip) return props.tooltip
  
  if (typeof props.value === 'number' && props.value >= 1000) {
    return `${props.value.toLocaleString()}${props.label ? ` ${props.label}` : ''}`
  }
  
  return undefined
})

const handleClick = () => {
  if (props.interactive) {
    emit('click')
  }
}
</script>

<style lang="less" scoped>
.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: @space-2;
  border-radius: @radius-md;
  font-weight: @font-weight-medium;
  transition: all @transition-base @ease-out;
  border: 1px solid transparent;
  
  &.interactive {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: @shadow-sm;
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  // Size variants
  &.size-small {
    padding: @space-1 @space-2;
    font-size: @font-size-xs;
    
    .stat-chip__icon .icon {
      width: 12px;
      height: 12px;
    }
  }
  
  &.size-medium {
    padding: @space-2 @space-3;
    font-size: @font-size-sm;
    
    .stat-chip__icon .icon {
      width: 14px;
      height: 14px;
    }
  }
  
  &.size-large {
    padding: @space-3 @space-4;
    font-size: @font-size-base;
    
    .stat-chip__icon .icon {
      width: 16px;
      height: 16px;
    }
  }
  
  // Color variants
  &.variant-default {
    background: fade(@color-panel-2, 80%);
    color: @color-text;
    border-color: @color-border;
    
    .stat-chip__icon {
      color: @color-text-dim;
    }
  }
  
  &.variant-success {
    background: fade(@color-success, 15%);
    color: @color-success;
    border-color: fade(@color-success, 30%);
    
    .stat-chip__icon {
      color: @color-success;
    }
  }
  
  &.variant-warning {
    background: fade(@color-warning, 15%);
    color: @color-warning;
    border-color: fade(@color-warning, 30%);
    
    .stat-chip__icon {
      color: @color-warning;
    }
  }
  
  &.variant-error {
    background: fade(@color-error, 15%);
    color: @color-error;
    border-color: fade(@color-error, 30%);
    
    .stat-chip__icon {
      color: @color-error;
    }
  }
  
  &.variant-info {
    background: fade(@color-info, 15%);
    color: @color-info;
    border-color: fade(@color-info, 30%);
    
    .stat-chip__icon {
      color: @color-info;
    }
  }
  
  &.variant-secondary {
    background: fade(@color-text-dim, 15%);
    color: @color-text-dim;
    border-color: fade(@color-text-dim, 30%);
    
    .stat-chip__icon {
      color: @color-text-dim;
    }
  }
}

.stat-chip__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  .icon {
    stroke-width: 2;
  }
}

.stat-chip__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.stat-chip__value {
  font-weight: @font-weight-semibold;
}

.stat-chip__label {
  font-size: 0.85em;
  opacity: 0.8;
  font-weight: @font-weight-normal;
}

// High contrast theme
.theme-contrast & {
  &.variant-default {
    background: fade(@color-contrast-panel, 80%);
    border-color: @color-contrast-border;
  }
  
  &.variant-success {
    background: fade(@color-success, 25%);
    border-color: @color-success;
  }
  
  &.variant-warning {
    background: fade(@color-warning, 25%);
    border-color: @color-warning;
  }
  
  &.variant-error {
    background: fade(@color-error, 25%);
    border-color: @color-error;
  }
  
  &.variant-info {
    background: fade(@color-contrast-accent, 25%);
    color: @color-contrast-accent;
    border-color: @color-contrast-accent;
    
    .stat-chip__icon {
      color: @color-contrast-accent;
    }
  }
}
</style>
