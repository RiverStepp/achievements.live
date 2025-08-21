import type { ApiGame, ApiAchievement, ApiSearchResult } from '@/types/api'
import type { Game, Achievement, SearchResult, PlatformId } from '@/types/domain'

// Map API game data to domain model
export function mapApiGameToGame(apiGame: ApiGame, platforms: PlatformId[] = []): Game {
  return {
    id: apiGame.id,
    title: apiGame.name,
    subtitle: apiGame.short_description,
    headerImage: apiGame.header_image,
    capsuleImage: apiGame.capsule_image,
    backgroundImage: apiGame.background,
    platforms: platforms.length > 0 ? platforms : ['steam'], // Default to Steam if not specified
    genres: apiGame.genres?.map(g => g.description) || [],
    releaseDate: apiGame.release_date?.date,
    developer: apiGame.developers?.[0],
    publisher: apiGame.publishers?.[0],
    rating: apiGame.metacritic?.score ? apiGame.metacritic.score / 20 : undefined, // Convert 0-100 to 0-5
    price: apiGame.price_overview?.final_formatted || 'N/A',
    tags: apiGame.categories?.map(c => c.description) || [],
    totalAchievements: 0, // Will be updated when achievements are loaded
    completionRate: 0,
    unlockedCount: 0
  }
}

// Map API achievement data to domain model
export function mapApiAchievementToAchievement(apiAchievement: ApiAchievement, gameId: string): Achievement {
  return {
    id: `${gameId}_${apiAchievement.name.toLowerCase().replace(/\s+/g, '_')}`,
    gameId,
    name: apiAchievement.displayName || apiAchievement.name,
    description: apiAchievement.description,
    icon: apiAchievement.icon,
    rarity: Math.random() * 100, // Mock rarity since API doesn't provide this
    unlocked: Math.random() < 0.3, // Mock unlock status (30% chance)
    unlockedAt: Math.random() < 0.3 ? new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    points: calculateAchievementPoints(apiAchievement.name, apiAchievement.description)
  }
}

// Calculate achievement points based on name and description
function calculateAchievementPoints(name: string, description?: string): number {
  const text = (name + ' ' + (description || '')).toLowerCase()
  
  // Epic achievements (rare, difficult)
  if (text.includes('legend') || text.includes('master') || text.includes('complete') || 
      text.includes('perfect') || text.includes('all') || text.includes('100%')) {
    return Math.floor(Math.random() * 50) + 50 // 50-100 points
  }
  
  // Rare achievements
  if (text.includes('defeat') || text.includes('kill') || text.includes('win') || 
      text.includes('collect') || text.includes('find')) {
    return Math.floor(Math.random() * 30) + 20 // 20-50 points
  }
  
  // Common achievements
  return Math.floor(Math.random() * 15) + 5 // 5-20 points
}

// Map API search result to domain model
export function mapApiSearchResultToSearchResult<T>(apiResult: ApiSearchResult<T>): SearchResult<T> {
  return {
    data: apiResult.data,
    total: apiResult.total,
    page: apiResult.page,
    limit: apiResult.limit,
    hasMore: apiResult.hasMore
  }
}

// Generate mock achievement stats based on game data
export function generateMockAchievementStats(game: Game, achievements: Achievement[]) {
  const totalAchievements = achievements.length
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const completionRate = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0
  
  // Estimate completion time based on genre and complexity
  let estimatedHours = 20 // Base estimate
  
  if (game.genres.includes('RPG')) estimatedHours += 50
  if (game.genres.includes('Open World')) estimatedHours += 30
  if (game.genres.includes('Strategy')) estimatedHours += 25
  if (game.genres.includes('Simulation')) estimatedHours += 40
  if (game.genres.includes('Multiplayer')) estimatedHours += 100
  
  // Adjust based on total achievements
  estimatedHours += totalAchievements * 0.5
  
  return {
    totalAchievements,
    unlockedCount,
    completionRate,
    completionEstimateHours: Math.round(estimatedHours)
  }
}

// Generate mock rarity based on achievement characteristics
export function generateMockRarity(achievement: Achievement): number {
  const name = achievement.name.toLowerCase()
  const description = (achievement.description || '').toLowerCase()
  
  // Very rare achievements (< 5%)
  if (name.includes('legend') || name.includes('perfect') || 
      description.includes('hardest') || description.includes('all')) {
    return Math.random() * 4 + 0.5 // 0.5% - 4.5%
  }
  
  // Rare achievements (5% - 20%)
  if (name.includes('master') || name.includes('complete') || 
      description.includes('defeat') || description.includes('collect all')) {
    return Math.random() * 15 + 5 // 5% - 20%
  }
  
  // Uncommon achievements (20% - 50%)
  if (name.includes('expert') || name.includes('advanced') || 
      description.includes('win') || description.includes('reach')) {
    return Math.random() * 30 + 20 // 20% - 50%
  }
  
  // Common achievements (50% - 90%)
  return Math.random() * 40 + 50 // 50% - 90%
}

// Format achievement rarity for display
export function formatRarity(rarity: number): string {
  if (rarity < 1) return `${rarity.toFixed(1)}% - Legendary`
  if (rarity < 5) return `${rarity.toFixed(1)}% - Epic`
  if (rarity < 20) return `${rarity.toFixed(1)}% - Rare`
  if (rarity < 50) return `${rarity.toFixed(1)}% - Uncommon`
  return `${rarity.toFixed(1)}% - Common`
}

// Format completion percentage for display
export function formatCompletionRate(rate: number): string {
  if (rate === 100) return '100% Perfect!'
  if (rate >= 90) return `${rate}% Nearly Perfect`
  if (rate >= 75) return `${rate}% Excellent`
  if (rate >= 50) return `${rate}% Good Progress`
  if (rate >= 25) return `${rate}% Getting Started`
  return `${rate}% Just Beginning`
}

// Format playtime for display
export function formatPlaytime(hours: number): string {
  if (hours < 1) return '< 1 hour'
  if (hours < 24) return `${Math.round(hours)} hours`
  
  const days = Math.floor(hours / 24)
  const remainingHours = Math.round(hours % 24)
  
  if (days < 7) {
    return remainingHours > 0 
      ? `${days}d ${remainingHours}h`
      : `${days} days`
  }
  
  const weeks = Math.floor(days / 7)
  const remainingDays = days % 7
  
  return remainingDays > 0
    ? `${weeks}w ${remainingDays}d`
    : `${weeks} weeks`
}

// Format currency prices
export function formatPrice(price: string | undefined): string {
  if (!price || price === 'Free' || price === 'N/A') return price || 'N/A'
  
  // Handle Steam's price format
  if (price.includes('$')) return price
  
  return `$${price}`
}

// Generate SEO-friendly slug from game title
export function generateGameSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}
