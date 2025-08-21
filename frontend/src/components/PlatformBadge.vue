<template>
  <span 
    class="platform-badge"
    :class="[
      `size-${size}`,
      `variant-${variant}`
    ]"
    :style="platformStyles"
    :title="platformName"
  >
    <svg v-if="platformIcon" class="platform-icon" viewBox="0 0 24 24" fill="currentColor">
      <path :d="platformIcon"/>
    </svg>
    <span v-else class="platform-text">{{ platformAbbr }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGamesStore } from '@/stores/games'
import type { PlatformId } from '@/types/domain'

interface Props {
  platformId: PlatformId
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'outlined' | 'minimal'
  showText?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'default',
  showText: false
})

const gamesStore = useGamesStore()

const platform = computed(() => {
  return gamesStore.getPlatform(props.platformId)
})

const platformName = computed(() => {
  return platform.value?.name || props.platformId
})

const platformStyles = computed(() => {
  if (!platform.value?.colorHex) return {}
  
  const color = platform.value.colorHex
  
  switch (props.variant) {
    case 'outlined':
      return {
        borderColor: color,
        color: color,
        backgroundColor: 'transparent'
      }
    case 'minimal':
      return {
        color: color,
        backgroundColor: 'transparent'
      }
    default:
      return {
        backgroundColor: color,
        color: '#ffffff'
      }
  }
})

// Platform icon paths (simplified versions)
const platformIcons: Record<PlatformId, string> = {
  steam: 'M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.5 20.88 6.315 25.18 11.979 25.18c6.649 0 12.021-5.373 12.021-12.021C23.999 5.372 18.628.001 11.979.001zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.22.005-1.759s-.753-.93-1.383-1.191c-.629-.263-1.177-.134-1.639.007l1.562.650c.956.4 1.407 1.425 1.004 2.381-.397.957-1.421 1.403-2.377 1.004-.955-.398-1.406-1.421-1.005-2.377z',
  xbox: 'M4.102 21.033C6.211 22.881 8.977 24 12 24c3.026 0 5.789-1.119 7.902-2.967a1.5 1.5 0 0 0-.31-2.52c-1.708-.73-3.505-1.235-5.359-1.488a9.75 9.75 0 0 1-4.464 0c-1.854.253-3.651.759-5.359 1.488a1.5 1.5 0 0 0-.31 2.52zM12 16.5c-1.34 0-2.612-.315-3.729-.863C6.704 14.854 5.5 13.513 5.5 12c0-1.513 1.204-2.854 2.771-3.637C9.388 7.815 10.66 7.5 12 7.5s2.612.315 3.729.863C17.296 9.146 18.5 10.487 18.5 12c0 1.513-1.204 2.854-2.771 3.637C14.612 16.185 13.34 16.5 12 16.5z',
  playstation: 'M7.5 14.5V9.438c0-.618.335-1.188.877-1.482l4.946-2.68c.542-.293 1.208-.293 1.75 0l4.946 2.68c.542.294.877.864.877 1.482v5.124c0 .618-.335 1.188-.877 1.482l-4.946 2.68c-.542.293-1.208.293-1.75 0l-4.946-2.68c-.542-.294-.877-.864-.877-1.482z',
  gog: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  epic: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  nintendo: 'M8 3a5 5 0 1 0 0 10V3zM16 3v10a5 5 0 1 0 0-10z'
}

const platformAbbreviations: Record<PlatformId, string> = {
  steam: 'ST',
  xbox: 'XB',
  playstation: 'PS',
  gog: 'GOG',
  epic: 'EP',
  nintendo: 'NS'
}

const platformIcon = computed(() => {
  return platformIcons[props.platformId]
})

const platformAbbr = computed(() => {
  return platformAbbreviations[props.platformId] || props.platformId.toUpperCase()
})
</script>

<style lang="less" scoped>
.platform-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: @radius-sm;
  font-weight: @font-weight-medium;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: all @transition-base @ease-out;
  border: 1px solid transparent;
  
  &.size-small {
    padding: @space-1 @space-2;
    font-size: @font-size-xs;
    line-height: 1;
    
    .platform-icon {
      width: 12px;
      height: 12px;
    }
  }
  
  &.size-medium {
    padding: @space-2 @space-3;
    font-size: @font-size-sm;
    line-height: 1;
    
    .platform-icon {
      width: 16px;
      height: 16px;
    }
  }
  
  &.size-large {
    padding: @space-3 @space-4;
    font-size: @font-size-base;
    line-height: 1;
    
    .platform-icon {
      width: 20px;
      height: 20px;
    }
  }
  
  &.variant-outlined {
    background: transparent !important;
    border-width: 1px;
    border-style: solid;
  }
  
  &.variant-minimal {
    background: transparent !important;
    border: none;
    padding: @space-1;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: @shadow-sm;
  }
}

.platform-icon {
  flex-shrink: 0;
}

.platform-text {
  font-size: inherit;
  font-weight: inherit;
}

// Default platform colors (fallback)
.platform-badge {
  &[data-platform="steam"] {
    background-color: #1b2838;
  }
  
  &[data-platform="xbox"] {
    background-color: #107c10;
  }
  
  &[data-platform="playstation"] {
    background-color: #003087;
  }
  
  &[data-platform="gog"] {
    background-color: #7c2d92;
  }
  
  &[data-platform="epic"] {
    background-color: #2d69ae;
  }
  
  &[data-platform="nintendo"] {
    background-color: #e60012;
  }
}
</style>
