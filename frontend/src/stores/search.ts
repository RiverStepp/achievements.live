import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { SearchParams, SearchFilters, SearchResult, Game, PlatformId } from '@/types/domain'

export const useSearchStore = defineStore('search', () => {
  // Search state
  const query = ref('')
  const filters = ref<SearchFilters>({
    platforms: [],
    genres: [],
    tags: [],
    rarityMin: undefined,
    rarityMax: undefined,
    completionMin: undefined,
    completionMax: undefined,
    playtimeMin: undefined,
    playtimeMax: undefined
  })
  
  const sort = ref<SearchParams['sort']>('relevance')
  const page = ref(1)
  const limit = ref(20)
  
  // Results state
  const results = ref<Game[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const hasMore = computed(() => page.value * limit.value < total.value)
  
  // Filter options state (populated from API)
  const availableGenres = ref<string[]>([])
  const availableTags = ref<string[]>([])
  const trendingTags = ref<string[]>([])
  
  // Search history
  const searchHistory = ref<string[]>([])
  const maxHistoryItems = 10
  
  // Suggestions
  const suggestions = ref<string[]>([])
  const showSuggestions = ref(false)
  
  // Active filters count
  const activeFiltersCount = computed(() => {
    let count = 0
    
    if (filters.value.platforms.length > 0) count++
    if (filters.value.genres.length > 0) count++
    if (filters.value.tags.length > 0) count++
    if (filters.value.rarityMin !== undefined || filters.value.rarityMax !== undefined) count++
    if (filters.value.completionMin !== undefined || filters.value.completionMax !== undefined) count++
    if (filters.value.playtimeMin !== undefined || filters.value.playtimeMax !== undefined) count++
    
    return count
  })
  
  // Search parameters object
  const searchParams = computed<SearchParams>(() => ({
    query: query.value,
    filters: filters.value,
    sort: sort.value,
    page: page.value,
    limit: limit.value
  }))
  
  // Search functions
  function setQuery(newQuery: string) {
    query.value = newQuery
    page.value = 1 // Reset to first page when query changes
  }
  
  function setSort(newSort: SearchParams['sort']) {
    sort.value = newSort
    page.value = 1 // Reset to first page when sort changes
  }
  
  function setPage(newPage: number) {
    page.value = newPage
  }
  
  function nextPage() {
    if (hasMore.value) {
      page.value++
    }
  }
  
  function previousPage() {
    if (page.value > 1) {
      page.value--
    }
  }
  
  // Filter functions
  function setPlatforms(platforms: PlatformId[]) {
    filters.value.platforms = platforms
    page.value = 1
  }
  
  function togglePlatform(platform: PlatformId) {
    const index = filters.value.platforms.indexOf(platform)
    if (index > -1) {
      filters.value.platforms.splice(index, 1)
    } else {
      filters.value.platforms.push(platform)
    }
    page.value = 1
  }
  
  function setGenres(genres: string[]) {
    filters.value.genres = genres
    page.value = 1
  }
  
  function toggleGenre(genre: string) {
    const index = filters.value.genres.indexOf(genre)
    if (index > -1) {
      filters.value.genres.splice(index, 1)
    } else {
      filters.value.genres.push(genre)
    }
    page.value = 1
  }
  
  function setTags(tags: string[]) {
    filters.value.tags = tags
    page.value = 1
  }
  
  function toggleTag(tag: string) {
    const index = filters.value.tags.indexOf(tag)
    if (index > -1) {
      filters.value.tags.splice(index, 1)
    } else {
      filters.value.tags.push(tag)
    }
    page.value = 1
  }
  
  function setRarityRange(min?: number, max?: number) {
    filters.value.rarityMin = min
    filters.value.rarityMax = max
    page.value = 1
  }
  
  function setCompletionRange(min?: number, max?: number) {
    filters.value.completionMin = min
    filters.value.completionMax = max
    page.value = 1
  }
  
  function setPlaytimeRange(min?: number, max?: number) {
    filters.value.playtimeMin = min
    filters.value.playtimeMax = max
    page.value = 1
  }
  
  function clearFilters() {
    filters.value = {
      platforms: [],
      genres: [],
      tags: [],
      rarityMin: undefined,
      rarityMax: undefined,
      completionMin: undefined,
      completionMax: undefined,
      playtimeMin: undefined,
      playtimeMax: undefined
    }
    page.value = 1
  }
  
  function clearFilter(filterType: keyof SearchFilters) {
    switch (filterType) {
      case 'platforms':
        filters.value.platforms = []
        break
      case 'genres':
        filters.value.genres = []
        break
      case 'tags':
        filters.value.tags = []
        break
      case 'rarityMin':
      case 'rarityMax':
        filters.value.rarityMin = undefined
        filters.value.rarityMax = undefined
        break
      case 'completionMin':
      case 'completionMax':
        filters.value.completionMin = undefined
        filters.value.completionMax = undefined
        break
      case 'playtimeMin':
      case 'playtimeMax':
        filters.value.playtimeMin = undefined
        filters.value.playtimeMax = undefined
        break
    }
    page.value = 1
  }
  
  // Results functions
  function setResults(newResults: SearchResult<Game>) {
    results.value = newResults.data
    total.value = newResults.total
    error.value = null
  }
  
  function appendResults(newResults: SearchResult<Game>) {
    results.value.push(...newResults.data)
    total.value = newResults.total
    error.value = null
  }
  
  function setLoading(loading: boolean) {
    isLoading.value = loading
  }
  
  function setError(newError: Error) {
    error.value = newError
    isLoading.value = false
  }
  
  function clearResults() {
    results.value = []
    total.value = 0
    error.value = null
  }
  
  // History functions
  function addToHistory(searchQuery: string) {
    if (!searchQuery.trim() || searchHistory.value.includes(searchQuery)) {
      return
    }
    
    searchHistory.value.unshift(searchQuery)
    
    if (searchHistory.value.length > maxHistoryItems) {
      searchHistory.value = searchHistory.value.slice(0, maxHistoryItems)
    }
    
    saveSearchHistory()
  }
  
  function removeFromHistory(searchQuery: string) {
    const index = searchHistory.value.indexOf(searchQuery)
    if (index > -1) {
      searchHistory.value.splice(index, 1)
      saveSearchHistory()
    }
  }
  
  function clearHistory() {
    searchHistory.value = []
    saveSearchHistory()
  }
  
  // Suggestions functions
  function setSuggestions(newSuggestions: string[]) {
    suggestions.value = newSuggestions
  }
  
  function setShowSuggestions(show: boolean) {
    showSuggestions.value = show
  }
  
  // Filter options functions
  function setAvailableGenres(genres: string[]) {
    availableGenres.value = genres
  }
  
  function setAvailableTags(tags: string[]) {
    availableTags.value = tags
  }
  
  function setTrendingTags(tags: string[]) {
    trendingTags.value = tags
  }
  
  // Persistence functions
  function saveSearchHistory() {
    localStorage.setItem('achievement-tracker-search-history', JSON.stringify(searchHistory.value))
  }
  
  function loadSearchHistory() {
    const saved = localStorage.getItem('achievement-tracker-search-history')
    if (saved) {
      try {
        searchHistory.value = JSON.parse(saved)
      } catch (e) {
        console.warn('Failed to parse search history:', e)
      }
    }
  }
  
  // Query parameter sync
  function fromQueryParams(params: URLSearchParams) {
    const q = params.get('q')
    if (q) query.value = q
    
    const sortParam = params.get('sort') as SearchParams['sort']
    if (sortParam && ['relevance', 'popularity', 'rarity', 'completion', 'alphabetical'].includes(sortParam)) {
      sort.value = sortParam
    }
    
    const pageParam = params.get('page')
    if (pageParam) {
      const pageNum = parseInt(pageParam, 10)
      if (!isNaN(pageNum) && pageNum > 0) {
        page.value = pageNum
      }
    }
    
    // Filters
    const platforms = params.get('platforms')?.split(',').filter(Boolean) as PlatformId[]
    if (platforms?.length) {
      filters.value.platforms = platforms
    }
    
    const genres = params.get('genres')?.split(',').filter(Boolean)
    if (genres?.length) {
      filters.value.genres = genres
    }
    
    const tags = params.get('tags')?.split(',').filter(Boolean)
    if (tags?.length) {
      filters.value.tags = tags
    }
    
    // Ranges
    const rarityMin = params.get('rarity_min')
    if (rarityMin) filters.value.rarityMin = parseInt(rarityMin, 10)
    
    const rarityMax = params.get('rarity_max')
    if (rarityMax) filters.value.rarityMax = parseInt(rarityMax, 10)
    
    const completionMin = params.get('completion_min')
    if (completionMin) filters.value.completionMin = parseInt(completionMin, 10)
    
    const completionMax = params.get('completion_max')
    if (completionMax) filters.value.completionMax = parseInt(completionMax, 10)
    
    const playtimeMin = params.get('playtime_min')
    if (playtimeMin) filters.value.playtimeMin = parseInt(playtimeMin, 10)
    
    const playtimeMax = params.get('playtime_max')
    if (playtimeMax) filters.value.playtimeMax = parseInt(playtimeMax, 10)
  }
  
  function toQueryParams(): URLSearchParams {
    const params = new URLSearchParams()
    
    if (query.value) params.set('q', query.value)
    if (sort.value !== 'relevance') params.set('sort', sort.value)
    if (page.value > 1) params.set('page', page.value.toString())
    
    if (filters.value.platforms.length) {
      params.set('platforms', filters.value.platforms.join(','))
    }
    
    if (filters.value.genres.length) {
      params.set('genres', filters.value.genres.join(','))
    }
    
    if (filters.value.tags.length) {
      params.set('tags', filters.value.tags.join(','))
    }
    
    if (filters.value.rarityMin !== undefined) {
      params.set('rarity_min', filters.value.rarityMin.toString())
    }
    
    if (filters.value.rarityMax !== undefined) {
      params.set('rarity_max', filters.value.rarityMax.toString())
    }
    
    if (filters.value.completionMin !== undefined) {
      params.set('completion_min', filters.value.completionMin.toString())
    }
    
    if (filters.value.completionMax !== undefined) {
      params.set('completion_max', filters.value.completionMax.toString())
    }
    
    if (filters.value.playtimeMin !== undefined) {
      params.set('playtime_min', filters.value.playtimeMin.toString())
    }
    
    if (filters.value.playtimeMax !== undefined) {
      params.set('playtime_max', filters.value.playtimeMax.toString())
    }
    
    return params
  }
  
  // Initialize
  function init() {
    loadSearchHistory()
  }
  
  return {
    // State
    query,
    filters,
    sort,
    page,
    limit,
    results,
    total,
    isLoading,
    error,
    hasMore,
    activeFiltersCount,
    searchParams,
    searchHistory,
    suggestions,
    showSuggestions,
    availableGenres,
    availableTags,
    trendingTags,
    
    // Search
    setQuery,
    setSort,
    setPage,
    nextPage,
    previousPage,
    
    // Filters
    setPlatforms,
    togglePlatform,
    setGenres,
    toggleGenre,
    setTags,
    toggleTag,
    setRarityRange,
    setCompletionRange,
    setPlaytimeRange,
    clearFilters,
    clearFilter,
    
    // Results
    setResults,
    appendResults,
    setLoading,
    setError,
    clearResults,
    
    // History
    addToHistory,
    removeFromHistory,
    clearHistory,
    
    // Suggestions
    setSuggestions,
    setShowSuggestions,
    
    // Filter options
    setAvailableGenres,
    setAvailableTags,
    setTrendingTags,
    
    // Query params
    fromQueryParams,
    toQueryParams,
    
    // Init
    init
  }
})
