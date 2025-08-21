import { ref, computed } from 'vue'
import type { AsyncState, LoadingState } from '@/types/util'

/**
 * Composable for managing async API calls with loading states
 */
export function useApi<T = any>() {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  const state = computed<LoadingState>(() => {
    if (loading.value) return 'loading'
    if (error.value) return 'error'
    if (data.value !== null) return 'success'
    return 'idle'
  })
  
  const asyncState = computed<AsyncState<T>>(() => ({
    data: data.value,
    loading: loading.value,
    error: error.value
  }))
  
  async function execute<TResult = T>(
    apiCall: () => Promise<TResult>,
    onSuccess?: (result: TResult) => void,
    onError?: (error: Error) => void
  ): Promise<TResult | null> {
    try {
      loading.value = true
      error.value = null
      
      const result = await apiCall()
      data.value = result as unknown as T
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (err) {
      const apiError = err instanceof Error ? err : new Error('Unknown error occurred')
      error.value = apiError
      
      if (onError) {
        onError(apiError)
      } else {
        console.error('API call failed:', apiError)
      }
      
      return null
    } finally {
      loading.value = false
    }
  }
  
  function reset() {
    data.value = null
    loading.value = false
    error.value = null
  }
  
  function setData(newData: T | null) {
    data.value = newData
    error.value = null
  }
  
  function setError(newError: Error) {
    error.value = newError
    loading.value = false
  }
  
  function setLoading(isLoading: boolean) {
    loading.value = isLoading
    if (isLoading) {
      error.value = null
    }
  }
  
  return {
    data: data as any, // Type assertion for better DX
    loading,
    error,
    state,
    asyncState,
    execute,
    reset,
    setData,
    setError,
    setLoading
  }
}

/**
 * Composable for managing multiple related API calls
 */
export function useApiGroup() {
  const states = ref<Record<string, AsyncState<any>>>({})
  
  function getState<T>(key: string): AsyncState<T> {
    return states.value[key] || { data: null, loading: false, error: null }
  }
  
  function setState<T>(key: string, state: Partial<AsyncState<T>>) {
    states.value[key] = {
      ...getState(key),
      ...state
    }
  }
  
  function setLoading(key: string, loading: boolean) {
    setState(key, { loading, error: loading ? null : getState(key).error })
  }
  
  function setData<T>(key: string, data: T) {
    setState(key, { data, error: null })
  }
  
  function setError(key: string, error: Error) {
    setState(key, { error, loading: false })
  }
  
  async function execute<T>(
    key: string,
    apiCall: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ): Promise<T | null> {
    try {
      setLoading(key, true)
      
      const result = await apiCall()
      setData(key, result)
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (err) {
      const apiError = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(key, apiError)
      
      if (onError) {
        onError(apiError)
      }
      
      return null
    }
  }
  
  function reset(key?: string) {
    if (key) {
      delete states.value[key]
    } else {
      states.value = {}
    }
  }
  
  const isAnyLoading = computed(() => {
    return Object.values(states.value).some(state => state.loading)
  })
  
  const hasAnyError = computed(() => {
    return Object.values(states.value).some(state => state.error)
  })
  
  const allErrors = computed(() => {
    return Object.values(states.value)
      .map(state => state.error)
      .filter(Boolean) as Error[]
  })
  
  return {
    states,
    getState,
    setState,
    setLoading,
    setData,
    setError,
    execute,
    reset,
    isAnyLoading,
    hasAnyError,
    allErrors
  }
}

/**
 * Composable for caching API responses
 */
export function useApiCache<T = any>(ttl: number = 5 * 60 * 1000) { // Default 5 minutes
  const cache = ref<Map<string, { data: T; timestamp: number }>>(new Map())
  
  function set(key: string, data: T) {
    cache.value.set(key, {
      data,
      timestamp: Date.now()
    })
  }
  
  function get(key: string): T | null {
    const cached = cache.value.get(key)
    if (!cached) return null
    
    const isExpired = Date.now() - cached.timestamp > ttl
    if (isExpired) {
      cache.value.delete(key)
      return null
    }
    
    return cached.data
  }
  
  function has(key: string): boolean {
    const cached = cache.value.get(key)
    if (!cached) return false
    
    const isExpired = Date.now() - cached.timestamp > ttl
    if (isExpired) {
      cache.value.delete(key)
      return false
    }
    
    return true
  }
  
  function remove(key: string) {
    cache.value.delete(key)
  }
  
  function clear() {
    cache.value.clear()
  }
  
  function cleanup() {
    const now = Date.now()
    for (const [key, value] of cache.value.entries()) {
      if (now - value.timestamp > ttl) {
        cache.value.delete(key)
      }
    }
  }
  
  // Auto cleanup every minute
  setInterval(cleanup, 60 * 1000)
  
  return {
    set,
    get,
    has,
    remove,
    clear,
    cleanup
  }
}
