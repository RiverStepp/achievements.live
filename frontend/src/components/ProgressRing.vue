<template>
  <div 
    class="progress-ring"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="progressbar"
    :aria-valuenow="value"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-label="ariaLabel"
  >
    <svg
      class="progress-ring__svg"
      :width="size"
      :height="size"
      viewBox="0 0 100 100"
    >
      <!-- Background circle -->
      <circle
        class="progress-ring__background"
        cx="50"
        cy="50"
        :r="radius"
        :stroke-width="strokeWidth"
        fill="transparent"
      />
      
      <!-- Progress circle -->
      <circle
        class="progress-ring__progress"
        cx="50"
        cy="50"
        :r="radius"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        :style="progressStyles"
        fill="transparent"
      />
    </svg>
    
    <!-- Center content -->
    <div v-if="showLabel" class="progress-ring__label">
      <slot>
        <span class="progress-value">{{ displayValue }}</span>
        <span v-if="unit" class="progress-unit">{{ unit }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  unit?: string
  color?: string
  backgroundColor?: string
  animated?: boolean
  ariaLabel?: string
  precision?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 60,
  strokeWidth: 4,
  showLabel: true,
  unit: '%',
  color: '#66c0f4',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  animated: true,
  precision: 0
})

const radius = computed(() => {
  return 50 - props.strokeWidth / 2
})

const circumference = computed(() => {
  return 2 * Math.PI * radius.value
})

const normalizedValue = computed(() => {
  return Math.min(100, Math.max(0, props.value))
})

const offset = computed(() => {
  const progress = normalizedValue.value / 100
  return circumference.value * (1 - progress)
})

const displayValue = computed(() => {
  if (props.precision > 0) {
    return normalizedValue.value.toFixed(props.precision)
  }
  return Math.round(normalizedValue.value)
})

const progressStyles = computed(() => {
  const styles: Record<string, string> = {
    stroke: props.color,
    strokeDasharray: `${circumference.value}`,
    strokeDashoffset: `${offset.value}`
  }
  
  if (props.animated) {
    styles.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
  }
  
  return styles
})

const computedAriaLabel = computed(() => {
  return props.ariaLabel || `Progress: ${displayValue.value}${props.unit || ''}`
})
</script>

<style lang="less" scoped>
.progress-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &__svg {
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
  }
  
  &__background {
    stroke: v-bind('props.backgroundColor');
    opacity: 0.3;
  }
  
  &__progress {
    stroke-linecap: round;
    stroke-linejoin: round;
    
    @media (prefers-reduced-motion: reduce) {
      transition: none !important;
    }
  }
  
  &__label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-weight: @font-weight-semibold;
    line-height: 1;
    pointer-events: none;
  }
}

.progress-value {
  font-size: 0.35em;
  color: @color-text;
}

.progress-unit {
  font-size: 0.25em;
  color: @color-text-dim;
  margin-top: 1px;
}

// Size-specific font adjustments
.progress-ring[style*="width: 24px"] {
  .progress-value {
    font-size: 8px;
  }
  
  .progress-unit {
    font-size: 6px;
  }
}

.progress-ring[style*="width: 32px"] {
  .progress-value {
    font-size: 10px;
  }
  
  .progress-unit {
    font-size: 7px;
  }
}

.progress-ring[style*="width: 40px"] {
  .progress-value {
    font-size: 12px;
  }
  
  .progress-unit {
    font-size: 8px;
  }
}

.progress-ring[style*="width: 48px"] {
  .progress-value {
    font-size: 14px;
  }
  
  .progress-unit {
    font-size: 9px;
  }
}

.progress-ring[style*="width: 60px"] {
  .progress-value {
    font-size: 16px;
  }
  
  .progress-unit {
    font-size: 10px;
  }
}

.progress-ring[style*="width: 80px"] {
  .progress-value {
    font-size: 20px;
  }
  
  .progress-unit {
    font-size: 12px;
  }
}

.progress-ring[style*="width: 100px"] {
  .progress-value {
    font-size: 24px;
  }
  
  .progress-unit {
    font-size: 14px;
  }
}

// High contrast theme
.theme-contrast & {
  .progress-value {
    color: @color-contrast-text;
  }
  
  .progress-unit {
    color: fade(@color-contrast-text, 70%);
  }
}
</style>
