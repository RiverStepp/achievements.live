import { ref, watch, type Ref } from 'vue'

/**
 * Debounce a reactive value
 */
export function useDebounce<T>(source: Ref<T>, delay: number = 300): Ref<T> {
  const debounced = ref<T>(source.value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout>
  
  watch(source, (newValue) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      debounced.value = newValue
    }, delay)
  }, { immediate: true })
  
  return debounced
}

/**
 * Debounce a function call
 */
export function useDebouncedFunction<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): T {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }) as T
}

/**
 * Debounce a ref with immediate execution option
 */
export function useAdvancedDebounce<T>(
  source: Ref<T>,
  delay: number = 300,
  options: {
    immediate?: boolean
    maxWait?: number
  } = {}
): {
  debounced: Ref<T>
  flush: () => void
  cancel: () => void
  pending: Ref<boolean>
} {
  const { immediate = false, maxWait } = options
  
  const debounced = ref<T>(source.value) as Ref<T>
  const pending = ref(false)
  
  let timeoutId: ReturnType<typeof setTimeout>
  let maxTimeoutId: ReturnType<typeof setTimeout>
  
  const updateValue = () => {
    debounced.value = source.value
    pending.value = false
    clearTimeout(timeoutId)
    if (maxWait) clearTimeout(maxTimeoutId)
  }
  
  const cancel = () => {
    pending.value = false
    clearTimeout(timeoutId)
    if (maxWait) clearTimeout(maxTimeoutId)
  }
  
  const flush = () => {
    if (pending.value) {
      updateValue()
    }
  }
  
  watch(source, (newValue) => {
    if (immediate && !pending.value) {
      debounced.value = newValue
      return
    }
    
    pending.value = true
    clearTimeout(timeoutId)
    
    timeoutId = setTimeout(updateValue, delay)
    
    // Max wait implementation
    if (maxWait && !maxTimeoutId) {
      maxTimeoutId = setTimeout(updateValue, maxWait)
    }
  }, { immediate: true })
  
  return {
    debounced,
    flush,
    cancel,
    pending
  }
}

/**
 * Throttle a function call
 */
export function useThrottledFunction<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): T {
  let lastExecution = 0
  let timeoutId: ReturnType<typeof setTimeout>
  
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastExecution = now - lastExecution
    
    if (timeSinceLastExecution >= delay) {
      lastExecution = now
      fn(...args)
    } else {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        lastExecution = Date.now()
        fn(...args)
      }, delay - timeSinceLastExecution)
    }
  }) as T
}

/**
 * Debounce with different delays for different conditions
 */
export function useConditionalDebounce<T>(
  source: Ref<T>,
  getDelay: (value: T) => number,
  defaultDelay: number = 300
): Ref<T> {
  const debounced = ref<T>(source.value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout>
  
  watch(source, (newValue) => {
    clearTimeout(timeoutId)
    const delay = getDelay(newValue) || defaultDelay
    
    timeoutId = setTimeout(() => {
      debounced.value = newValue
    }, delay)
  }, { immediate: true })
  
  return debounced
}

/**
 * Debounce with loading state
 */
export function useDebounceWithLoading<T>(
  source: Ref<T>,
  delay: number = 300
): {
  debounced: Ref<T>
  pending: Ref<boolean>
  cancel: () => void
} {
  const debounced = ref<T>(source.value) as Ref<T>
  const pending = ref(false)
  let timeoutId: ReturnType<typeof setTimeout>
  
  const cancel = () => {
    clearTimeout(timeoutId)
    pending.value = false
  }
  
  watch(source, (newValue) => {
    cancel()
    pending.value = true
    
    timeoutId = setTimeout(() => {
      debounced.value = newValue
      pending.value = false
    }, delay)
  }, { immediate: true })
  
  return {
    debounced,
    pending,
    cancel
  }
}
