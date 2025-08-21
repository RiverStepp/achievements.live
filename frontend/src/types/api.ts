import type { Game, Achievement, User, Platform, SearchResult, SearchParams } from './domain'

export interface ApiGame {
  id: string
  name: string
  short_description?: string
  header_image?: string
  capsule_image?: string
  background?: string
  platforms: {
    windows?: boolean
    mac?: boolean
    linux?: boolean
  }
  genres?: Array<{ description: string }>
  release_date?: {
    date?: string
  }
  developers?: string[]
  publishers?: string[]
  metacritic?: {
    score?: number
  }
  price_overview?: {
    final_formatted?: string
  }
  categories?: Array<{ description: string }>
}

export interface ApiAchievement {
  name: string
  path: string
  description?: string
  displayName: string
  hidden?: number
  icon?: string
  icongray?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export type SearchGamesParams = Omit<SearchParams, 'filters'> & {
  platforms?: string
  genres?: string
  tags?: string
  rarity_min?: number
  rarity_max?: number
  completion_min?: number
  completion_max?: number
  playtime_min?: number
  playtime_max?: number
}

export interface ApiSearchResult<T> extends SearchResult<T> {
  filters?: {
    platforms: string[]
    genres: string[]
    tags: string[]
  }
}
