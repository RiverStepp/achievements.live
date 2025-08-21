<template>
  <div class="search-results-page">
    <div class="page-header">
      <h1 class="page-title">Browse Games</h1>
      <p class="page-description">
        Discover games across all platforms and track your achievement progress.
      </p>
    </div>

    <!-- Search and Filters -->
    <div class="search-controls">
      <div class="search-bar-container">
        <SearchBar placeholder="Search games, developers, genres..." />
      </div>
      
      <div class="filters-container">
        <div class="filter-group">
          <label class="filter-label">Platforms</label>
          <TagPills
            :tags="availablePlatforms"
            :selected-tags="selectedPlatforms"
            variant="outline"
            :interactive="true"
            @tags-change="handlePlatformsChange"
          />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Sort by</label>
          <select v-model="selectedSort" class="sort-select">
            <option value="relevance">Relevance</option>
            <option value="popularity">Popularity</option>
            <option value="alphabetical">A-Z</option>
            <option value="completion">Completion Rate</option>
            <option value="rarity">Rarity</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="results-section">
      <div class="results-header">
        <p class="results-count" v-if="!searchStore.isLoading">
          {{ searchStore.total > 0 ? `${searchStore.total} games found` : 'No games found' }}
        </p>
        <div class="view-controls">
          <button
            class="view-toggle"
            :class="{ active: appStore.viewMode === 'grid' }"
            @click="appStore.setViewMode('grid')"
            aria-label="Grid view"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button
            class="view-toggle"
            :class="{ active: appStore.viewMode === 'list' }"
            @click="appStore.setViewMode('list')"
            aria-label="List view"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Game Results -->
      <div v-if="searchStore.isLoading" class="loading-grid">
        <SkeletonCard v-for="i in 12" :key="i" :density="appStore.density" />
      </div>
      
      <div 
        v-else-if="searchStore.results.length > 0"
        class="game-grid"
        :class="{ 'list-view': appStore.viewMode === 'list' }"
      >
        <GameCard
          v-for="game in searchStore.results"
          :key="game.id"
          :game="game"
          :density="appStore.density"
        />
      </div>
      
      <EmptyState
        v-else
        title="No games found"
        description="Try adjusting your search terms or filters to find more games."
        icon="search"
      >
        <template #actions>
          <button class="btn-primary" @click="clearFilters">Clear Filters</button>
          <router-link to="/" class="btn-secondary">Browse Featured</router-link>
        </template>
      </EmptyState>

      <!-- Pagination -->
      <div v-if="searchStore.results.length > 0 && searchStore.total > searchStore.limit" class="pagination-container">
        <Pagination
          :current-page="searchStore.page"
          :total-pages="Math.ceil(searchStore.total / searchStore.limit)"
          :has-next="searchStore.hasMore"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useSearchStore } from '@/stores/search'
import { useGamesStore } from '@/stores/games'
import { searchGames } from '@/services/api'
import SearchBar from '@/components/SearchBar.vue'
import TagPills from '@/components/TagPills.vue'
import GameCard from '@/components/GameCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import Pagination from '@/components/Pagination.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const searchStore = useSearchStore()
const gamesStore = useGamesStore()

const selectedSort = ref(searchStore.sort)
const selectedPlatforms = ref<string[]>([...searchStore.filters.platforms])

const availablePlatforms = computed(() => 
  gamesStore.platforms.map(p => p.name)
)

// Sync URL params with search state
watch(() => route.query, (newQuery) => {
  searchStore.fromQueryParams(new URLSearchParams(newQuery as Record<string, string>))
  selectedSort.value = searchStore.sort
  selectedPlatforms.value = [...searchStore.filters.platforms]
  performSearch()
}, { immediate: true })

// Watch for search parameter changes
watch([
  () => searchStore.searchParams,
  selectedSort,
  selectedPlatforms
], () => {
  updateFilters()
  performSearch()
})

const updateFilters = () => {
  searchStore.setSort(selectedSort.value)
  searchStore.setPlatforms(selectedPlatforms.value as any)
  
  // Update URL
  const queryParams = searchStore.toQueryParams()
  router.replace({ query: Object.fromEntries(queryParams) })
}

const performSearch = async () => {
  try {
    searchStore.setLoading(true)
    const results = await searchGames(searchStore.searchParams)
    searchStore.setResults(results)
    
    // Preload games into cache
    gamesStore.preloadGames(results.data)
  } catch (error) {
    console.error('Search failed:', error)
    appStore.showError('Search failed', 'Could not search for games. Please try again.')
    searchStore.setError(error as Error)
  }
}

const handlePlatformsChange = (platforms: string[]) => {
  selectedPlatforms.value = platforms
}

const handlePageChange = (page: number) => {
  searchStore.setPage(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearFilters = () => {
  searchStore.clearFilters()
  selectedSort.value = 'relevance'
  selectedPlatforms.value = []
  router.replace({ query: {} })
}

onMounted(() => {
  // Load initial data if needed
  if (gamesStore.platforms.length === 0) {
    import('@/services/api').then(({ getPlatforms }) => {
      getPlatforms().then(platforms => {
        gamesStore.setPlatforms(platforms)
      })
    })
  }
})
</script>

<style lang="less" scoped>
.search-results-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: @space-8;
  
  .page-title {
    font-size: @font-size-3xl;
    font-weight: @font-weight-bold;
    color: @color-text;
    margin: 0 0 @space-4;
  }
  
  .page-description {
    font-size: @font-size-lg;
    color: @color-text-dim;
    margin: 0;
    max-width: 600px;
    margin: 0 auto;
  }
}

.search-controls {
  .m-card();
  padding: @space-6;
  margin-bottom: @space-8;
  
  .search-bar-container {
    margin-bottom: @space-6;
  }
  
  .filters-container {
    display: flex;
    flex-direction: column;
    gap: @space-4;
    
    @media (min-width: @screen-lg) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: @space-2;
    
    @media (min-width: @screen-md) {
      flex-direction: row;
      align-items: center;
    }
  }
  
  .filter-label {
    font-weight: @font-weight-medium;
    color: @color-text;
    font-size: @font-size-sm;
    white-space: nowrap;
    
    @media (min-width: @screen-md) {
      margin-right: @space-3;
    }
  }
  
  .sort-select {
    .m-input();
    width: auto;
    min-width: 150px;
  }
}

.results-section {
  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: @space-6;
    
    @media (max-width: @screen-sm) {
      flex-direction: column;
      gap: @space-4;
      align-items: flex-start;
    }
  }
  
  .results-count {
    color: @color-text-dim;
    font-size: @font-size-sm;
    margin: 0;
  }
  
  .view-controls {
    display: flex;
    gap: @space-1;
    
    .view-toggle {
      .m-button-ghost();
      padding: @space-2;
      
      &.active {
        background: fade(@color-accent, 15%);
        color: @color-accent;
      }
      
      .icon {
        width: 18px;
        height: 18px;
      }
    }
  }
}

.game-grid {
  /*.grid-game-cards();*/
  
  &.list-view {
    grid-template-columns: 1fr;
    max-width: 800px;
  }
}

.loading-grid {
  /*.grid-game-cards();*/
}

.pagination-container {
  margin-top: @space-8;
  display: flex;
  justify-content: center;
}

.btn-primary {
  /*.m-button-primary();*/
}

.btn-secondary {
  /*.m-button-secondary();*/
  text-decoration: none;
}

// High contrast theme
.theme-contrast & {
  .search-controls {
    background: @color-contrast-panel;
    border-color: @color-contrast-border;
  }
}
</style>
