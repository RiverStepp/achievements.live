<template>
  <div class="search-bar" :class="{ compact, focused, 'has-suggestions': showSuggestions }">
    <div class="search-input-container">
      <div class="search-icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
      </div>
      
      <input
        ref="searchInput"
        v-model="localQuery"
        type="text"
        class="search-input"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @input="handleInput"
        autocomplete="off"
        spellcheck="false"
      />
      
      <button
        v-if="localQuery || searchStore.query"
        class="clear-button"
        @click="clearSearch"
        :aria-label="'Clear search'"
        type="button"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
      
      <div v-if="isLoading" class="loading-indicator">
        <svg class="icon animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
      </div>
    </div>
    
    <!-- Search Suggestions -->
    <div 
      v-if="showSuggestions && (suggestions.length > 0 || searchStore.searchHistory.length > 0)"
      class="search-suggestions"
      role="listbox"
      :aria-label="'Search suggestions'"
    >
      <!-- Current Suggestions -->
      <div v-if="suggestions.length > 0" class="suggestion-group">
        <div class="suggestion-header">Suggestions</div>
        <button
          v-for="(suggestion, index) in suggestions"
          :key="`suggestion-${index}`"
          class="suggestion-item"
          :class="{ highlighted: highlightedIndex === index }"
          @click="selectSuggestion(suggestion)"
          @mouseenter="highlightedIndex = index"
          role="option"
          :aria-selected="highlightedIndex === index"
        >
          <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <span class="suggestion-text">{{ suggestion }}</span>
        </button>
      </div>
      
      <!-- Search History -->
      <div v-if="searchStore.searchHistory.length > 0 && !localQuery" class="suggestion-group">
        <div class="suggestion-header">
          Recent Searches
          <button 
            class="clear-history-button"
            @click="searchStore.clearHistory"
            :aria-label="'Clear search history'"
          >
            Clear
          </button>
        </div>
        <button
          v-for="(historyItem, index) in searchStore.searchHistory.slice(0, 5)"
          :key="`history-${index}`"
          class="suggestion-item"
          :class="{ highlighted: highlightedIndex === suggestions.length + index }"
          @click="selectSuggestion(historyItem)"
          @mouseenter="highlightedIndex = suggestions.length + index"
          role="option"
          :aria-selected="highlightedIndex === suggestions.length + index"
        >
          <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          <span class="suggestion-text">{{ historyItem }}</span>
          <button
            class="remove-history-button"
            @click.stop="searchStore.removeFromHistory(historyItem)"
            :aria-label="`Remove '${historyItem}' from history`"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import { useDebounce } from '@/composables/useDebounce'
import { getSearchSuggestions } from '@/services/api'

interface Props {
  compact?: boolean
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  placeholder: 'Search games, developers, genres...',
  disabled: false,
  autoFocus: false
})

const router = useRouter()
const searchStore = useSearchStore()

const searchInput = ref<HTMLInputElement>()
const localQuery = ref('')
const focused = ref(false)
const suggestions = ref<string[]>([])
const isLoading = ref(false)
const highlightedIndex = ref(-1)

// Debounce the search query for API calls
const debouncedQuery = useDebounce(localQuery, 300)

const showSuggestions = computed(() => {
  return focused.value && !props.disabled
})

const totalSuggestions = computed(() => {
  return suggestions.value.length + (localQuery.value ? 0 : searchStore.searchHistory.length)
})

// Watch for debounced query changes to fetch suggestions
watch(debouncedQuery, async (newQuery) => {
  if (!newQuery.trim() || !focused.value) {
    suggestions.value = []
    isLoading.value = false
    return
  }
  
  try {
    isLoading.value = true
    suggestions.value = await getSearchSuggestions(newQuery)
  } catch (error) {
    console.error('Failed to fetch suggestions:', error)
    suggestions.value = []
  } finally {
    isLoading.value = false
  }
})

// Initialize from store
watch(() => searchStore.query, (newQuery) => {
  if (newQuery !== localQuery.value) {
    localQuery.value = newQuery
  }
}, { immediate: true })

const handleFocus = () => {
  focused.value = true
  highlightedIndex.value = -1
}

const handleBlur = () => {
  // Delay hiding suggestions to allow for clicks
  setTimeout(() => {
    focused.value = false
    suggestions.value = []
  }, 150)
}

const handleInput = () => {
  highlightedIndex.value = -1
}

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0) {
        // Select highlighted suggestion
        const allSuggestions = [
          ...suggestions.value,
          ...(localQuery.value ? [] : searchStore.searchHistory.slice(0, 5))
        ]
        const selectedSuggestion = allSuggestions[highlightedIndex.value]
        if (selectedSuggestion) {
          selectSuggestion(selectedSuggestion)
        }
      } else {
        // Perform search with current query
        performSearch()
      }
      break
      
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, totalSuggestions.value - 1)
      break
      
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      break
      
    case 'Escape':
      event.preventDefault()
      if (showSuggestions.value) {
        focused.value = false
        searchInput.value?.blur()
      } else {
        clearSearch()
      }
      break
      
    case 'Tab':
      // Allow normal tab behavior
      focused.value = false
      break
  }
}

const selectSuggestion = (suggestion: string) => {
  localQuery.value = suggestion
  searchStore.setQuery(suggestion)
  focused.value = false
  searchInput.value?.blur()
  performSearch()
}

const performSearch = () => {
  const query = localQuery.value.trim()
  if (!query) return
  
  // Add to search history
  searchStore.addToHistory(query)
  
  // Update store
  searchStore.setQuery(query)
  
  // Navigate to search page if not already there
  if (router.currentRoute.value.name !== 'Search') {
    router.push('/search')
  }
}

const clearSearch = () => {
  localQuery.value = ''
  searchStore.setQuery('')
  suggestions.value = []
  highlightedIndex.value = -1
  searchInput.value?.focus()
}

// Global keyboard shortcut to focus search
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
    const activeElement = document.activeElement
    if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
      event.preventDefault()
      searchInput.value?.focus()
    }
  }
}

onMounted(() => {
  if (props.autoFocus) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
  
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style lang="less" scoped>
.search-bar {
  position: relative;
  width: 100%;
  
  &.compact {
    max-width: 400px;
  }
  
  &.focused .search-input-container {
    border-color: @color-accent;
    box-shadow: 0 0 0 2px fade(@color-accent, 20%);
  }
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
  .m-input();
  padding: 0;
  
  &:hover {
    border-color: @color-border-light;
  }
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 @space-3;
  color: @color-text-dim;
  flex-shrink: 0;
  
  .icon {
    width: 18px;
    height: 18px;
  }
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: @color-text;
  font-size: @font-size-base;
  padding: @space-3 @space-2;
  min-width: 0;
  
  &::placeholder {
    color: @color-text-muted;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.clear-button,
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 @space-3;
  flex-shrink: 0;
}

.clear-button {
  background: none;
  border: none;
  color: @color-text-dim;
  cursor: pointer;
  transition: color @transition-base @ease-out;
  
  &:hover {
    color: @color-text;
  }
  
  .icon {
    width: 16px;
    height: 16px;
  }
}

.loading-indicator {
  color: @color-accent;
  
  .icon {
    width: 16px;
    height: 16px;
  }
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: @space-1;
  .m-card();
  max-height: 400px;
  overflow-y: auto;
  z-index: @z-dropdown;
}

.suggestion-group {
  &:not(:last-child) {
    border-bottom: 1px solid @color-border;
  }
}

.suggestion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: @space-2 @space-4;
  font-size: @font-size-xs;
  font-weight: @font-weight-medium;
  color: @color-text-dim;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: fade(@color-panel-2, 50%);
  border-bottom: 1px solid @color-border;
}

.clear-history-button {
  background: none;
  border: none;
  color: @color-text-dim;
  font-size: @font-size-xs;
  cursor: pointer;
  transition: color @transition-base @ease-out;
  
  &:hover {
    color: @color-accent;
  }
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: @space-3;
  width: 100%;
  padding: @space-3 @space-4;
  background: none;
  border: none;
  color: @color-text;
  text-align: left;
  cursor: pointer;
  transition: all @transition-base @ease-out;
  
  &:hover,
  &.highlighted {
    background: fade(@color-accent, 10%);
    color: @color-accent;
  }
  
  .suggestion-icon {
    width: 16px;
    height: 16px;
    color: @color-text-dim;
    flex-shrink: 0;
  }
  
    .suggestion-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    }

  
  .remove-history-button {
    background: none;
    border: none;
    color: @color-text-dim;
    padding: @space-1;
    margin: -@space-1;
    cursor: pointer;
    opacity: 0;
    transition: all @transition-base @ease-out;
    
    .icon {
      width: 14px;
      height: 14px;
    }
    
    &:hover {
      color: @color-error;
    }
  }
  
  &:hover .remove-history-button {
    opacity: 1;
  }
}

// Compact variant
.search-bar.compact {
  .search-input {
    font-size: @font-size-sm;
    padding: @space-2;
  }
  
  .search-icon,
  .clear-button,
  .loading-indicator {
    padding: 0 @space-2;
  }
}

// High contrast theme
.theme-contrast & {
  .search-suggestions {
    background: @color-contrast-panel;
    border-color: @color-contrast-border;
  }
  
  .suggestion-header {
    background: fade(@color-contrast-panel, 80%);
    border-bottom-color: @color-contrast-border;
  }
  
  .suggestion-group:not(:last-child) {
    border-bottom-color: @color-contrast-border;
  }
}
</style>
