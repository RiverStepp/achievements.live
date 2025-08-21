import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Game, Achievement, Platform } from '@/types/domain'

interface GameCache {
  [gameId: string]: {
    game: Game
    achievements: Achievement[]
    loadedAt: number
  }
}

export const useGamesStore = defineStore('games', () => {
  // Cache state
  const gameCache = ref<GameCache>({})
  const platforms = ref<Platform[]>([])
  
  // Loading states
  const loadingGames = ref<Set<string>>(new Set())
  const loadingAchievements = ref<Set<string>>(new Set())
  
  // Featured content
  const featuredGames = ref<Game[]>([])
  const popularGames = ref<Game[]>([])
  const rareFindGames = ref<Game[]>([])
  const quickCompletionGames = ref<Game[]>([])
  
  // Trending data
  const trendingTags = ref<string[]>([])
  const allGenres = ref<string[]>([])
  const allTags = ref<string[]>([])
  
  // Cache configuration
  const cacheExpiry = 5 * 60 * 1000 // 5 minutes
  
  // Computed properties
  const cachedGames = computed(() => {
    return Object.values(gameCache.value).map(entry => entry.game)
  })
  
  const totalCachedGames = computed(() => {
    return Object.keys(gameCache.value).length
  })
  
  // Game functions
  function getGame(gameId: string): Game | null {
    const cached = gameCache.value[gameId]
    if (cached && Date.now() - cached.loadedAt < cacheExpiry) {
      return cached.game
    }
    return null
  }
  
  function setGame(game: Game) {
    if (!gameCache.value[game.id]) {
      gameCache.value[game.id] = {
        game,
        achievements: [],
        loadedAt: Date.now()
      }
    } else {
      gameCache.value[game.id].game = game
      gameCache.value[game.id].loadedAt = Date.now()
    }
  }
  
  function updateGame(gameId: string, updates: Partial<Game>) {
    const cached = gameCache.value[gameId]
    if (cached) {
      cached.game = { ...cached.game, ...updates }
      cached.loadedAt = Date.now()
    }
  }
  
  function isGameLoading(gameId: string): boolean {
    return loadingGames.value.has(gameId)
  }
  
  function setGameLoading(gameId: string, loading: boolean) {
    if (loading) {
      loadingGames.value.add(gameId)
    } else {
      loadingGames.value.delete(gameId)
    }
  }
  
  // Achievement functions
  function getAchievements(gameId: string): Achievement[] | null {
    const cached = gameCache.value[gameId]
    if (cached && cached.achievements.length > 0 && Date.now() - cached.loadedAt < cacheExpiry) {
      return cached.achievements
    }
    return null
  }
  
  function setAchievements(gameId: string, achievements: Achievement[]) {
    if (!gameCache.value[gameId]) {
      // This shouldn't happen, but create a placeholder
      gameCache.value[gameId] = {
        game: { id: gameId } as Game,
        achievements: [],
        loadedAt: Date.now()
      }
    }
    
    gameCache.value[gameId].achievements = achievements
    gameCache.value[gameId].loadedAt = Date.now()
    
    // Update game stats if we have the game
    const game = gameCache.value[gameId].game
    if (game.title) { // Check if we have a real game object
      const unlockedCount = achievements.filter(a => a.unlocked).length
      const completionRate = game.totalAchievements > 0 
        ? Math.round((unlockedCount / game.totalAchievements) * 100)
        : 0
      
      updateGame(gameId, {
        unlockedCount,
        completionRate
      })
    }
  }
  
  function updateAchievement(gameId: string, achievementId: string, updates: Partial<Achievement>) {
    const cached = gameCache.value[gameId]
    if (cached) {
      const achievement = cached.achievements.find(a => a.id === achievementId)
      if (achievement) {
        Object.assign(achievement, updates)
        
        // If unlocked status changed, update game stats
        if ('unlocked' in updates) {
          const unlockedCount = cached.achievements.filter(a => a.unlocked).length
          const game = cached.game
          if (game.totalAchievements > 0) {
            const completionRate = Math.round((unlockedCount / game.totalAchievements) * 100)
            updateGame(gameId, { unlockedCount, completionRate })
          }
        }
      }
    }
  }
  
  function toggleAchievement(gameId: string, achievementId: string) {
    const cached = gameCache.value[gameId]
    if (cached) {
      const achievement = cached.achievements.find(a => a.id === achievementId)
      if (achievement) {
        const newUnlocked = !achievement.unlocked
        updateAchievement(gameId, achievementId, {
          unlocked: newUnlocked,
          unlockedAt: newUnlocked ? new Date().toISOString() : undefined
        })
      }
    }
  }
  
  function isAchievementsLoading(gameId: string): boolean {
    return loadingAchievements.value.has(gameId)
  }
  
  function setAchievementsLoading(gameId: string, loading: boolean) {
    if (loading) {
      loadingAchievements.value.add(gameId)
    } else {
      loadingAchievements.value.delete(gameId)
    }
  }
  
  // Platform functions
  function setPlatforms(newPlatforms: Platform[]) {
    platforms.value = newPlatforms
  }
  
  function getPlatform(platformId: string): Platform | undefined {
    return platforms.value.find(p => p.id === platformId)
  }
  
  // Featured content functions
  function setFeaturedGames(games: Game[]) {
    featuredGames.value = games
  }
  
  function setPopularGames(games: Game[]) {
    popularGames.value = games
  }
  
  function setRareFindGames(games: Game[]) {
    rareFindGames.value = games
  }
  
  function setQuickCompletionGames(games: Game[]) {
    quickCompletionGames.value = games
  }
  
  // Trending data functions
  function setTrendingTags(tags: string[]) {
    trendingTags.value = tags
  }
  
  function setAllGenres(genres: string[]) {
    allGenres.value = genres
  }
  
  function setAllTags(tags: string[]) {
    allTags.value = tags
  }
  
  // Cache management
  function clearCache() {
    gameCache.value = {}
    loadingGames.value.clear()
    loadingAchievements.value.clear()
  }
  
  function removeFromCache(gameId: string) {
    delete gameCache.value[gameId]
    loadingGames.value.delete(gameId)
    loadingAchievements.value.delete(gameId)
  }
  
  function cleanExpiredCache() {
    const now = Date.now()
    Object.keys(gameCache.value).forEach(gameId => {
      const cached = gameCache.value[gameId]
      if (now - cached.loadedAt > cacheExpiry) {
        delete gameCache.value[gameId]
      }
    })
  }
  
  function preloadGames(games: Game[]) {
    games.forEach(game => {
      if (!gameCache.value[game.id]) {
        setGame(game)
      }
    })
  }
  
  // Statistics
  function getGameStats(gameId: string) {
    const cached = gameCache.value[gameId]
    if (!cached) return null
    
    const achievements = cached.achievements
    const totalAchievements = achievements.length
    const unlockedAchievements = achievements.filter(a => a.unlocked).length
    const completionRate = totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0
    
    // Rarity breakdown
    const commonAchievements = achievements.filter(a => a.rarity >= 50).length
    const uncommonAchievements = achievements.filter(a => a.rarity >= 20 && a.rarity < 50).length
    const rareAchievements = achievements.filter(a => a.rarity >= 5 && a.rarity < 20).length
    const epicAchievements = achievements.filter(a => a.rarity < 5).length
    
    const unlockedByRarity = {
      common: achievements.filter(a => a.unlocked && a.rarity >= 50).length,
      uncommon: achievements.filter(a => a.unlocked && a.rarity >= 20 && a.rarity < 50).length,
      rare: achievements.filter(a => a.unlocked && a.rarity >= 5 && a.rarity < 20).length,
      epic: achievements.filter(a => a.unlocked && a.rarity < 5).length
    }
    
    // Points calculation
    const totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), 0)
    const earnedPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + (a.points || 0), 0)
    
    return {
      totalAchievements,
      unlockedAchievements,
      completionRate,
      rarity: {
        common: commonAchievements,
        uncommon: uncommonAchievements,
        rare: rareAchievements,
        epic: epicAchievements
      },
      unlockedByRarity,
      points: {
        total: totalPoints,
        earned: earnedPoints
      }
    }
  }
  
  // Search within cached games
  function searchCachedGames(query: string): Game[] {
    if (!query.trim()) return []
    
    const searchTerm = query.toLowerCase()
    return cachedGames.value.filter(game => 
      game.title.toLowerCase().includes(searchTerm) ||
      game.developer?.toLowerCase().includes(searchTerm) ||
      game.publisher?.toLowerCase().includes(searchTerm) ||
      game.genres.some(genre => genre.toLowerCase().includes(searchTerm)) ||
      game.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }
  
  // Initialize
  function init() {
    // Clean expired cache on startup
    cleanExpiredCache()
    
    // Set up periodic cache cleaning
    setInterval(cleanExpiredCache, cacheExpiry)
  }
  
  return {
    // State
    gameCache,
    platforms,
    loadingGames,
    loadingAchievements,
    featuredGames,
    popularGames,
    rareFindGames,
    quickCompletionGames,
    trendingTags,
    allGenres,
    allTags,
    
    // Computed
    cachedGames,
    totalCachedGames,
    
    // Games
    getGame,
    setGame,
    updateGame,
    isGameLoading,
    setGameLoading,
    
    // Achievements
    getAchievements,
    setAchievements,
    updateAchievement,
    toggleAchievement,
    isAchievementsLoading,
    setAchievementsLoading,
    
    // Platforms
    setPlatforms,
    getPlatform,
    
    // Featured content
    setFeaturedGames,
    setPopularGames,
    setRareFindGames,
    setQuickCompletionGames,
    
    // Trending data
    setTrendingTags,
    setAllGenres,
    setAllTags,
    
    // Cache management
    clearCache,
    removeFromCache,
    cleanExpiredCache,
    preloadGames,
    
    // Statistics
    getGameStats,
    
    // Search
    searchCachedGames,
    
    // Init
    init
  }
})
