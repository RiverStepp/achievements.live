import { ref, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute, type LocationQueryValue } from 'vue-router'

/**
 * Composable for syncing state with URL query parameters
 */
export function useQueryParams<T extends Record<string, any>>(
  defaultValues: T,
  options: {
    syncOnMount?: boolean
    replace?: boolean
    serialize?: (value: any) => string
    deserialize?: (value: string) => any
  } = {}
) {
  const {
    syncOnMount = true,
    replace = false,
    serialize = (value: any) => String(value),
    deserialize = (value: string) => value
  } = options
  
  const router = useRouter()
  const route = useRoute()
  
  // Initialize state from query params or defaults
  const state = ref<T>({ ...defaultValues })
  
  // Convert query params to state
  const fromQuery = (query: Record<string, LocationQueryValue | LocationQueryValue[]>): Partial<T> => {
    const result: Partial<T> = {}
    
    for (const [key, value] of Object.entries(query)) {
      if (key in defaultValues && value !== null && value !== undefined) {
        try {
          if (Array.isArray(value)) {
            // Handle array values
            result[key as keyof T] = value.map(v => v ? deserialize(v) : null).filter(Boolean) as any
          } else if (value) {
            result[key as keyof T] = deserialize(value) as any
          }
        } catch (error) {
          console.warn(`Failed to deserialize query param ${key}:`, error)
        }
      }
    }
    
    return result
  }
  
  // Convert state to query params
  const toQuery = (state: T): Record<string, string | string[]> => {
    const result: Record<string, string | string[]> = {}
    
    for (const [key, value] of Object.entries(state)) {
      if (value !== null && value !== undefined && value !== defaultValues[key]) {
        try {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              result[key] = value.map(v => serialize(v))
            }
          } else {
            result[key] = serialize(value)
          }
        } catch (error) {
          console.warn(`Failed to serialize state ${key}:`, error)
        }
      }
    }
    
    return result
  }
  
  // Update state from current query params
  const updateFromQuery = () => {
    const queryState = fromQuery(route.query)
    state.value = { ...defaultValues, ...queryState }
  }
  
  // Update query params from current state
  const updateQuery = async (newState: T) => {
    const query = toQuery(newState)
    
    // Only update if query actually changed
    const currentQuery = toQuery(state.value)
    if (JSON.stringify(query) !== JSON.stringify(currentQuery)) {
      await router[replace ? 'replace' : 'push']({
        query: {
          ...route.query,
          ...query
        }
      })
    }
  }
  
  // Reactive query object
  const query = computed(() => toQuery(state.value))
  
  // Watch for state changes and update URL
  watch(
    () => state.value,
    async (newState) => {
      await nextTick()
      await updateQuery(newState)
    },
    { deep: true }
  )
  
  // Watch for route changes and update state
  watch(
    () => route.query,
    () => {
      updateFromQuery()
    },
    { deep: true }
  )
  
  // Initialize from query params on mount
  if (syncOnMount) {
    updateFromQuery()
  }
  
  // Helper methods
  const setParam = <K extends keyof T>(key: K, value: T[K]) => {
    state.value[key] = value
  }
  
  const getParam = <K extends keyof T>(key: K): T[K] => {
    return state.value[key]
  }
  
  const resetParam = <K extends keyof T>(key: K) => {
    state.value[key] = defaultValues[key]
  }
  
  const resetAll = () => {
    state.value = { ...defaultValues }
  }
  
  const hasParam = <K extends keyof T>(key: K): boolean => {
    const value = state.value[key]
    const defaultValue = defaultValues[key]
    return value !== defaultValue && value !== null && value !== undefined
  }
  
  return {
    state,
    query,
    setParam,
    getParam,
    resetParam,
    resetAll,
    hasParam,
    updateFromQuery,
    updateQuery
  }
}

/**
 * Composable for a single query parameter
 */
export function useQueryParam<T>(
  key: string,
  defaultValue: T,
  options: {
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
    replace?: boolean
  } = {}
) {
  const {
    serialize = (value: T) => String(value),
    deserialize = (value: string) => value as T,
    replace = false
  } = options
  
  const router = useRouter()
  const route = useRoute()
  
  const param = computed({
    get(): T {
      const queryValue = route.query[key]
      if (queryValue && !Array.isArray(queryValue)) {
        try {
          return deserialize(queryValue)
        } catch {
          return defaultValue
        }
      }
      return defaultValue
    },
    
    set(value: T) {
      const query = { ...route.query }
      
      if (value === defaultValue || value === null || value === undefined) {
        delete query[key]
      } else {
        query[key] = serialize(value)
      }
      
      router[replace ? 'replace' : 'push']({ query })
    }
  })
  
  return param
}

/**
 * Specialized composables for common query param types
 */
export function useStringQueryParam(key: string, defaultValue = '') {
  return useQueryParam(key, defaultValue, {
    serialize: (value: string) => value,
    deserialize: (value: string) => value
  })
}

export function useNumberQueryParam(key: string, defaultValue = 0) {
  return useQueryParam(key, defaultValue, {
    serialize: (value: number) => String(value),
    deserialize: (value: string) => {
      const num = Number(value)
      return isNaN(num) ? defaultValue : num
    }
  })
}

export function useBooleanQueryParam(key: string, defaultValue = false) {
  return useQueryParam(key, defaultValue, {
    serialize: (value: boolean) => value ? 'true' : 'false',
    deserialize: (value: string) => value === 'true'
  })
}

export function useArrayQueryParam<T>(
  key: string,
  defaultValue: T[] = [],
  options: {
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
  } = {}
) {
  const {
    serialize = (value: T) => String(value),
    deserialize = (value: string) => value as T
  } = options
  
  const router = useRouter()
  const route = useRoute()
  
  const param = computed({
    get(): T[] {
      const queryValue = route.query[key]
      if (queryValue) {
        try {
          const values = Array.isArray(queryValue) ? queryValue : [queryValue]
          return values.map(v => deserialize(v)).filter(v => v !== null && v !== undefined)
        } catch {
          return defaultValue
        }
      }
      return defaultValue
    },
    
    set(value: T[]) {
      const query = { ...route.query }
      
      if (!value || value.length === 0) {
        delete query[key]
      } else {
        query[key] = value.map(serialize)
      }
      
      router.push({ query })
    }
  })
  
  return param
}

/**
 * Helper for working with search/filter query params
 */
export function useSearchQueryParams() {
  return useQueryParams({
    q: '',
    page: 1,
    limit: 20,
    sort: 'relevance',
    platforms: [] as string[],
    genres: [] as string[],
    tags: [] as string[]
  }, {
    serialize: (value: any) => {
      if (Array.isArray(value)) {
        return value.join(',')
      }
      return String(value)
    },
    deserialize: (value: string) => {
      // Try to parse as number first
      const num = Number(value)
      if (!isNaN(num)) return num
      
      // Check if it's a comma-separated list
      if (value.includes(',')) {
        return value.split(',').map(s => s.trim()).filter(Boolean)
      }
      
      return value
    }
  })
}
