export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type AsyncReturnType<T extends (...args: any) => any> = T extends (...args: any) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
  ? U
  : any

export interface PaginatedParams {
  page?: number
  limit?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T = any> {
  data: T | null
  loading: boolean
  error: Error | null
}

export type Density = 'compact' | 'comfortable' | 'spacious'

export type ViewMode = 'grid' | 'list'
