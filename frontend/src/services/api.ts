import type { 
  SearchParams, 
  SearchResult, 
  Game, 
  Achievement, 
  User, 
  Platform 
} from '@/types/domain'

// Import mock data
import gamesData from '@/data/games.json'
import achievementsData from '@/data/achievements.json'
import usersData from '@/data/users.json'
import platformsData from '@/data/platforms.json'

// Simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API service with realistic delays and error simulation
export class MockApiService {
  private games: Game[] = gamesData as Game[]
  private achievements: Achievement[] = achievementsData as Achievement[]
  private users: User[] = usersData as User[]
  private platforms: Platform[] = platformsData as Platform[]
  
  // Error simulation (5% chance of error for testing)
  private shouldSimulateError(): boolean {
    return Math.random() < 0.05
  }
  
  private simulateNetworkDelay(): Promise<void> {
    const delayMs = Math.random() * 800 + 200 // 200-1000ms
    return delay(delayMs)
  }
  
  // Search games with filters and pagination
  async searchGames(params: SearchParams): Promise<SearchResult<Game>> {
    await this.simulateNetworkDelay()
    
    if (this.shouldSimulateError()) {
      throw new Error('Network error: Failed to fetch search results')
    }
    
    let filteredGames = [...this.games]
    
    // Apply text search
    if (params.query.trim()) {
      const query = params.query.toLowerCase()
      filteredGames = filteredGames.filter(game =>
        game.title.toLowerCase().includes(query) ||
        game.developer?.toLowerCase().includes(query) ||
        game.publisher?.toLowerCase().includes(query) ||
        game.genres.some(genre => genre.toLowerCase().includes(query)) ||
        game.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    // Apply platform filter
    if (params.filters.platforms.length > 0) {
      filteredGames = filteredGames.filter(game =>
        params.filters.platforms.some(platform => game.platforms.includes(platform))
      )
    }
    
    // Apply genre filter
    if (params.filters.genres.length > 0) {
      filteredGames = filteredGames.filter(game =>
        params.filters.genres.some(genre => game.genres.includes(genre))
      )
    }
    
    // Apply tag filter
    if (params.filters.tags.length > 0) {
      filteredGames = filteredGames.filter(game =>
        params.filters.tags.some(tag => game.tags?.includes(tag))
      )
    }
    
    // Apply completion rate filter
    if (params.filters.completionMin !== undefined || params.filters.completionMax !== undefined) {
      filteredGames = filteredGames.filter(game => {
        const rate = game.completionRate || 0
        const min = params.filters.completionMin || 0
        const max = params.filters.completionMax || 100
        return rate >= min && rate <= max
      })
    }
    
    // Apply playtime filter
    if (params.filters.playtimeMin !== undefined || params.filters.playtimeMax !== undefined) {
      filteredGames = filteredGames.filter(game => {
        const hours = game.averagePlaytimeHours || 0
        const min = params.filters.playtimeMin || 0
        const max = params.filters.playtimeMax || 1000
        return hours >= min && hours <= max
      })
    }
    
    // Apply sorting
    switch (params.sort) {
      case 'alphabetical':
        filteredGames.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'popularity':
        filteredGames.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'completion':
        filteredGames.sort((a, b) => (b.completionRate || 0) - (a.completionRate || 0))
        break
      case 'rarity':
        // Sort by average achievement rarity (lower = rarer)
        filteredGames.sort((a, b) => {
          const aRarity = this.getAverageAchievementRarity(a.id)
          const bRarity = this.getAverageAchievementRarity(b.id)
          return aRarity - bRarity
        })
        break
      case 'relevance':
      default:
        // Keep original order for relevance (or randomize slightly)
        if (params.query.trim()) {
          // Boost exact title matches
          filteredGames.sort((a, b) => {
            const aExact = a.title.toLowerCase() === params.query.toLowerCase() ? 1 : 0
            const bExact = b.title.toLowerCase() === params.query.toLowerCase() ? 1 : 0
            return bExact - aExact
          })
        }
        break
    }
    
    // Apply pagination
    const total = filteredGames.length
    const startIndex = (params.page - 1) * params.limit
    const endIndex = startIndex + params.limit
    const paginatedGames = filteredGames.slice(startIndex, endIndex)
    
    return {
      data: paginatedGames,
      total,
      page: params.page,
      limit: params.limit,
      hasMore: endIndex < total
    }
  }
  
  // Get game by ID
  async getGameById(id: string): Promise<Game | null> {
    await this.simulateNetworkDelay()
    
    if (this.shouldSimulateError()) {
      throw new Error(`Network error: Failed to fetch game ${id}`)
    }
    
    const game = this.games.find(g => g.id === id)
    return game || null
  }
  
  // Get achievements for a game
  async getAchievementsForGame(gameId: string): Promise<Achievement[]> {
    await this.simulateNetworkDelay()
    
    if (this.shouldSimulateError()) {
      throw new Error(`Network error: Failed to fetch achievements for game ${gameId}`)
    }
    
    const gameAchievements = this.achievements.filter(a => a.gameId === gameId)
    
    // Generate additional mock achievements if needed
    if (gameAchievements.length < 5) {
      const game = this.games.find(g => g.id === gameId)
      if (game) {
        gameAchievements.push(...this.generateMockAchievements(gameId, game.title))
      }
    }
    
    return gameAchievements
  }
  
  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    await this.simulateNetworkDelay()
    
    if (this.shouldSimulateError()) {
      throw new Error(`Network error: Failed to fetch user ${id}`)
    }
    
    const user = this.users.find(u => u.id === id)
    return user || null
  }
  
  // Get featured games
  async getFeatured(): Promise<{
    featured: Game[]
    popular: Game[]
    rareFindGames: Game[]
    quickCompletions: Game[]
  }> {
    await this.simulateNetworkDelay()
    
    if (this.shouldSimulateError()) {
      throw new Error('Network error: Failed to fetch featured content')
    }
    
    // Featured games (high-rated recent releases)
    const featured = this.games
      .filter(g => g.rating && g.rating >= 4.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6)
    
    // Popular games (by playtime and rating)
    const popular = this.games
      .sort((a, b) => (b.averagePlaytimeHours || 0) - (a.averagePlaytimeHours || 0))
      .slice(0, 8)
    
    // Rare find games (low completion rate, high quality)
    const rareFindGames = this.games
      .filter(g => (g.completionRate || 0) < 20 && (g.rating || 0) >= 4.0)
      .slice(0, 6)
    
    // Quick completions (short completion time, high completion rate)
    const quickCompletions = this.games
      .filter(g => (g.completionEstimateHours || 0) < 30 && (g.completionRate || 0) > 50)
      .slice(0, 6)
    
    return {
      featured,
      popular,
      rareFindGames,
      quickCompletions
    }
  }
  
  // Get trending tags
  async getTrendingTags(): Promise<string[]> {
    await this.simulateNetworkDelay()
    
    // Simulate trending tags based on popular games
    const allTags = this.games.flatMap(g => g.tags || [])
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag]) => tag)
  }
  
  // Get all platforms
  async getPlatforms(): Promise<Platform[]> {
    await this.simulateNetworkDelay()
    return [...this.platforms]
  }
  
  // Get all available genres
  async getGenres(): Promise<string[]> {
    await this.simulateNetworkDelay()
    
    const allGenres = this.games.flatMap(g => g.genres)
    return [...new Set(allGenres)].sort()
  }
  
  // Get search suggestions
  async getSearchSuggestions(query: string): Promise<string[]> {
    await delay(150) // Faster response for suggestions
    
    if (!query.trim()) return []
    
    const suggestions = new Set<string>()
    const searchTerm = query.toLowerCase()
    
    // Add game titles
    this.games.forEach(game => {
      if (game.title.toLowerCase().includes(searchTerm)) {
        suggestions.add(game.title)
      }
      
      // Add developers/publishers
      if (game.developer?.toLowerCase().includes(searchTerm)) {
        suggestions.add(game.developer)
      }
      if (game.publisher?.toLowerCase().includes(searchTerm)) {
        suggestions.add(game.publisher)
      }
      
      // Add genres and tags
      game.genres.forEach(genre => {
        if (genre.toLowerCase().includes(searchTerm)) {
          suggestions.add(genre)
        }
      })
      
      game.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(searchTerm)) {
          suggestions.add(tag)
        }
      })
    })
    
    return Array.from(suggestions).slice(0, 8)
  }
  
  // Helper method to get average achievement rarity for a game
  private getAverageAchievementRarity(gameId: string): number {
    const gameAchievements = this.achievements.filter(a => a.gameId === gameId)
    if (gameAchievements.length === 0) return 50 // Default middle rarity
    
    const totalRarity = gameAchievements.reduce((sum, a) => sum + a.rarity, 0)
    return totalRarity / gameAchievements.length
  }
  
  // Generate mock achievements for games that don't have enough
  private generateMockAchievements(gameId: string, gameTitle: string): Achievement[] {
    const mockAchievements: Achievement[] = [
      {
        id: `${gameId}_first_play`,
        gameId,
        name: 'First Steps',
        description: `Started playing ${gameTitle}.`,
        rarity: 85.2,
        unlocked: true,
        unlockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        points: 10
      },
      {
        id: `${gameId}_halfway`,
        gameId,
        name: 'Halfway There',
        description: `Reached the midpoint of ${gameTitle}.`,
        rarity: 45.8,
        unlocked: Math.random() < 0.5,
        unlockedAt: Math.random() < 0.5 ? new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        points: 25
      },
      {
        id: `${gameId}_complete`,
        gameId,
        name: 'Champion',
        description: `Completed ${gameTitle}.`,
        rarity: 23.1,
        unlocked: Math.random() < 0.3,
        unlockedAt: Math.random() < 0.3 ? new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        points: 50
      },
      {
        id: `${gameId}_perfectionist`,
        gameId,
        name: 'Perfectionist',
        description: `Achieved 100% completion in ${gameTitle}.`,
        rarity: 3.7,
        unlocked: Math.random() < 0.1,
        unlockedAt: Math.random() < 0.1 ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        points: 100
      }
    ]
    
    return mockAchievements
  }
}

// Export singleton instance
export const apiService = new MockApiService()

// Convenience functions that match the expected API interface
export const searchGames = (params: SearchParams) => apiService.searchGames(params)
export const getGameById = (id: string) => apiService.getGameById(id)
export const getAchievementsForGame = (gameId: string) => apiService.getAchievementsForGame(gameId)
export const getUserById = (id: string) => apiService.getUserById(id)
export const getFeatured = () => apiService.getFeatured()
export const getTrendingTags = () => apiService.getTrendingTags()
export const getPlatforms = () => apiService.getPlatforms()
export const getGenres = () => apiService.getGenres()
export const getSearchSuggestions = (query: string) => apiService.getSearchSuggestions(query)
