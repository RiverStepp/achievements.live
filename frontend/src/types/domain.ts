export type PlatformId = 'steam' | 'xbox' | 'playstation' | 'gog' | 'epic' | 'nintendo'

export interface Platform {
  id: PlatformId
  name: string
  colorHex: string // badge accent
  icon: string     // path or icon name
}

export interface Achievement {
  id: string
  gameId: string
  name: string
  description?: string
  icon?: string
  rarity: number // 0..100 (lower is rarer)
  unlocked: boolean
  unlockedAt?: string
  points?: number
}

export interface Game {
  id: string           // appId for Steam, etc.
  title: string
  subtitle?: string
  headerImage?: string
  capsuleImage?: string
  backgroundImage?: string
  platforms: PlatformId[]
  genres: string[]
  releaseDate?: string
  developer?: string
  publisher?: string
  averagePlaytimeHours?: number
  completionEstimateHours?: number
  completionRate?: number // %
  totalAchievements: number
  unlockedCount?: number
  rating?: number // 0..5
  price?: string
  tags?: string[]
}

export interface User {
  id: string
  displayName: string
  avatar?: string
  country?: string
  bio?: string
  platformIds: PlatformId[]
  totals: {
    gamesTracked: number
    achievementsUnlocked: number
    completionRate: number
    hoursPlayed: number
  }
}

export interface SearchFilters {
  platforms: PlatformId[]
  genres: string[]
  tags: string[]
  rarityMin?: number
  rarityMax?: number
  completionMin?: number
  completionMax?: number
  playtimeMin?: number
  playtimeMax?: number
}

export interface SearchParams {
  query: string
  filters: SearchFilters
  sort: 'relevance' | 'popularity' | 'rarity' | 'completion' | 'alphabetical'
  page: number
  limit: number
}

export interface SearchResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface Collection {
  id: string
  name: string
  description?: string
  gameIds: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export type Theme = 'dark' | 'contrast'

export interface Toast {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  duration?: number
}
