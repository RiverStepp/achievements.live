<template>
  <div class="tag-pills" :class="{ 'is-interactive': interactive }">
    <button
      v-for="(tag, index) in displayTags"
      :key="tag"
      class="tag-pill"
      :class="[
        `size-${size}`,
        `variant-${variant}`,
        { 
          selected: selectedTags.includes(tag),
          removable: removable && interactive
        }
      ]"
      :disabled="!interactive"
      @click="handleTagClick(tag)"
      :aria-pressed="interactive ? selectedTags.includes(tag) : undefined"
      :title="getTagTooltip(tag)"
    >
      <span class="tag-text">{{ tag }}</span>
      
      <svg 
        v-if="removable && interactive && selectedTags.includes(tag)"
        class="remove-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        @click.stop="removeTag(tag)"
      >
        <path d="M18 6 6 18M6 6l12 12"/>
      </svg>
    </button>
    
    <button
      v-if="hasMore && showMore"
      class="tag-pill more-button"
      :class="[`size-${size}`, `variant-${variant}`]"
      @click="expanded = !expanded"
      :aria-label="expanded ? 'Show fewer tags' : `Show ${hiddenCount} more tags`"
    >
      <span v-if="!expanded" class="tag-text">+{{ hiddenCount }}</span>
      <span v-else class="tag-text">Show less</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  tags: string[]
  selectedTags?: string[]
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'primary' | 'secondary' | 'outline'
  interactive?: boolean
  removable?: boolean
  maxDisplay?: number
  showMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedTags: () => [],
  size: 'medium',
  variant: 'default',
  interactive: false,
  removable: false,
  maxDisplay: undefined,
  showMore: true
})

const emit = defineEmits<{
  'tag-click': [tag: string]
  'tag-remove': [tag: string]
  'tags-change': [tags: string[]]
}>()

const expanded = ref(false)

const hasMore = computed(() => {
  return props.maxDisplay !== undefined && props.tags.length > props.maxDisplay
})

const hiddenCount = computed(() => {
  if (!hasMore.value) return 0
  return props.tags.length - props.maxDisplay!
})

const displayTags = computed(() => {
  if (!hasMore.value || expanded.value) {
    return props.tags
  }
  return props.tags.slice(0, props.maxDisplay)
})

const getTagTooltip = (tag: string) => {
  if (!props.interactive) return undefined
  
  const isSelected = props.selectedTags.includes(tag)
  if (props.removable && isSelected) {
    return `Remove ${tag} filter`
  } else if (props.interactive) {
    return isSelected ? `Remove ${tag} filter` : `Filter by ${tag}`
  }
  
  return undefined
}

const handleTagClick = (tag: string) => {
  if (!props.interactive) return
  
  emit('tag-click', tag)
  
  const newSelectedTags = [...props.selectedTags]
  const index = newSelectedTags.indexOf(tag)
  
  if (index > -1) {
    newSelectedTags.splice(index, 1)
  } else {
    newSelectedTags.push(tag)
  }
  
  emit('tags-change', newSelectedTags)
}

const removeTag = (tag: string) => {
  emit('tag-remove', tag)
  
  const newSelectedTags = props.selectedTags.filter(t => t !== tag)
  emit('tags-change', newSelectedTags)
}
</script>

<style lang="less" scoped>
.tag-pills {
  display: flex;
  flex-wrap: wrap;
  gap: @space-2;
  align-items: center;
  
  &.is-interactive .tag-pill {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: @shadow-sm;
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: @space-1;
  border-radius: @radius-full;
  font-weight: @font-weight-medium;
  text-transform: capitalize;
  transition: all @transition-base @ease-out;
  border: 1px solid transparent;
  white-space: nowrap;
  
  &:disabled {
    cursor: default;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
  
  // Size variants
  &.size-small {
    padding: @space-1 @space-2;
    font-size: @font-size-xs;
    
    .remove-icon {
      width: 12px;
      height: 12px;
    }
    
    &.removable {
      padding-right: @space-1;
    }
  }
  
  &.size-medium {
    padding: @space-2 @space-3;
    font-size: @font-size-sm;
    
    .remove-icon {
      width: 14px;
      height: 14px;
    }
    
    &.removable {
      padding-right: @space-2;
    }
  }
  
  &.size-large {
    padding: @space-3 @space-4;
    font-size: @font-size-base;
    
    .remove-icon {
      width: 16px;
      height: 16px;
    }
    
    &.removable {
      padding-right: @space-3;
    }
  }
  
  // Color variants
  &.variant-default {
    background: fade(@color-panel-2, 60%);
    color: @color-text-dim;
    border-color: @color-border;
    
    &.selected {
      background: fade(@color-accent, 20%);
      color: @color-accent;
      border-color: @color-accent;
    }
    
    &:hover:not(:disabled) {
      background: fade(@color-panel-2, 80%);
      color: @color-text;
    }
  }
  
  &.variant-primary {
    background: fade(@color-accent, 15%);
    color: @color-accent;
    border-color: fade(@color-accent, 30%);
    
    &.selected {
      background: @color-accent;
      color: @color-bg;
      border-color: @color-accent;
    }
    
    &:hover:not(:disabled) {
      background: fade(@color-accent, 25%);
    }
  }
  
  &.variant-secondary {
    background: fade(@color-accent-2, 15%);
    color: @color-accent-2;
    border-color: fade(@color-accent-2, 30%);
    
    &.selected {
      background: @color-accent-2;
      color: @color-bg;
      border-color: @color-accent-2;
    }
    
    &:hover:not(:disabled) {
      background: fade(@color-accent-2, 25%);
    }
  }
  
  &.variant-outline {
    background: transparent;
    color: @color-text-dim;
    border-color: @color-border;
    
    &.selected {
      background: transparent;
      color: @color-accent;
      border-color: @color-accent;
    }
    
    &:hover:not(:disabled) {
      color: @color-text;
      border-color: @color-text-dim;
    }
  }
}

.tag-text {
              overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.remove-icon {
  flex-shrink: 0;
  stroke-width: 2;
  opacity: 0.7;
  transition: opacity @transition-base @ease-out;
  
  &:hover {
    opacity: 1;
  }
}

.more-button {
  font-style: italic;
  opacity: 0.8;
  
  &:hover:not(:disabled) {
    opacity: 1;
  }
  
  .tag-text {
    font-weight: @font-weight-normal;
  }
}

// High contrast theme
.theme-contrast & {
  .tag-pill {
    &.variant-default {
      background: fade(@color-contrast-panel, 60%);
      border-color: @color-contrast-border;
      
      &.selected {
        background: fade(@color-contrast-accent, 25%);
        color: @color-contrast-accent;
        border-color: @color-contrast-accent;
      }
    }
    
    &.variant-primary {
      background: fade(@color-contrast-accent, 20%);
      color: @color-contrast-accent;
      border-color: @color-contrast-accent;
      
      &.selected {
        background: @color-contrast-accent;
        color: @color-contrast-bg;
      }
    }
    
    &.variant-outline {
      border-color: @color-contrast-border;
      
      &.selected {
        color: @color-contrast-accent;
        border-color: @color-contrast-accent;
      }
    }
  }
}
</style>
