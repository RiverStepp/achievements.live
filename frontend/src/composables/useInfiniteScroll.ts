import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Composable for infinite scroll functionality
 */
export function useInfiniteScroll(
  callback: () => Promise<void> | void,
  options: {
    threshold?: number
    target?: Ref<HTMLElement | null> | HTMLElement | null
    disabled?: Ref<boolean>
    immediate?: boolean
  } = {}
) {
  const {
    threshold = 200,
    target,
    disabled = ref(false),
    immediate = true
  } = options
  
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  
  let targetElement: HTMLElement | null = null
  let observer: IntersectionObserver | null = null
  
  const canLoad = computed(() => !disabled.value && !isLoading.value)
  
  const execute = async () => {
    if (!canLoad.value) return
    
    try {
      isLoading.value = true
      error.value = null
      await callback()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
    } finally {
      isLoading.value = false
    }
  }
  
  const setupScrollListener = () => {
    const element = target
      ? (typeof target === 'object' && 'value' in target ? target.value : target)
      : window
    
    if (!element) return
    
    const handleScroll = () => {
      if (!canLoad.value) return
      
      let shouldLoad = false
      
      if (element === window) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight
        const clientHeight = window.innerHeight
        
        shouldLoad = scrollTop + clientHeight >= scrollHeight - threshold
      } else {
        const el = element as HTMLElement
        shouldLoad = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold
      }
      
      if (shouldLoad) {
        execute()
      }
    }
    
    element.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      element.removeEventListener('scroll', handleScroll)
    }
  }
  
  const setupIntersectionObserver = () => {
    if (!('IntersectionObserver' in window)) {
      // Fallback to scroll listener
      return setupScrollListener()
    }
    
    const sentinel = document.createElement('div')
    sentinel.style.height = '1px'
    sentinel.style.position = 'absolute'
    sentinel.style.bottom = `${threshold}px`
    sentinel.style.width = '100%'
    sentinel.style.pointerEvents = 'none'
    
    const targetEl = target
      ? (typeof target === 'object' && 'value' in target ? target.value : target)
      : document.body
    
    if (!targetEl) return
    
    targetEl.appendChild(sentinel)
    
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && canLoad.value) {
          execute()
        }
      },
      {
        root: target ? targetEl : null,
        rootMargin: `${threshold}px`,
        threshold: 0
      }
    )
    
    observer.observe(sentinel)
    
    return () => {
      if (observer) {
        observer.disconnect()
        observer = null
      }
      if (sentinel.parentNode) {
        sentinel.parentNode.removeChild(sentinel)
      }
    }
  }
  
  let cleanup: (() => void) | undefined
  
  const start = () => {
    stop()
    cleanup = setupIntersectionObserver() || setupScrollListener()
  }
  
  const stop = () => {
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }
  }
  
  onMounted(() => {
    if (immediate) {
      start()
    }
  })
  
  onUnmounted(() => {
    stop()
  })
  
  return {
    isLoading,
    error,
    canLoad,
    execute,
    start,
    stop
  }
}

/**
 * Composable for virtual scrolling with infinite loading
 */
export function useVirtualInfiniteScroll<T>(
  items: Ref<T[]>,
  loadMore: () => Promise<void>,
  options: {
    itemHeight?: number
    containerHeight?: number
    buffer?: number
    threshold?: number
  } = {}
) {
  const {
    itemHeight = 100,
    containerHeight = 400,
    buffer = 5,
    threshold = 200
  } = options
  
  const scrollTop = ref(0)
  const isLoading = ref(false)
  
  const visibleItemsCount = Math.ceil(containerHeight / itemHeight) + buffer * 2
  
  const startIndex = computed(() => {
    const index = Math.floor(scrollTop.value / itemHeight) - buffer
    return Math.max(0, index)
  })
  
  const endIndex = computed(() => {
    const index = startIndex.value + visibleItemsCount
    return Math.min(items.value.length, index)
  })
  
  const visibleItems = computed(() => {
    return items.value.slice(startIndex.value, endIndex.value).map((item, index) => ({
      item,
      index: startIndex.value + index,
      top: (startIndex.value + index) * itemHeight
    }))
  })
  
  const totalHeight = computed(() => items.value.length * itemHeight)
  
  const offsetY = computed(() => startIndex.value * itemHeight)
  
  const { execute: executeLoadMore } = useInfiniteScroll(loadMore, {
    threshold,
    immediate: false
  })
  
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
    
    // Check if we need to load more
    const scrollBottom = target.scrollTop + target.clientHeight
    const shouldLoadMore = scrollBottom >= target.scrollHeight - threshold
    
    if (shouldLoadMore && !isLoading.value) {
      executeLoadMore()
    }
  }
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    scrollTop,
    startIndex,
    endIndex,
    isLoading
  }
}

/**
 * Composable for pull-to-refresh functionality
 */
export function usePullToRefresh(
  callback: () => Promise<void>,
  options: {
    threshold?: number
    target?: Ref<HTMLElement | null>
    disabled?: Ref<boolean>
  } = {}
) {
  const {
    threshold = 60,
    target,
    disabled = ref(false)
  } = options
  
  const isRefreshing = ref(false)
  const pullDistance = ref(0)
  const canRefresh = ref(false)
  
  let startY = 0
  let currentY = 0
  let isDragging = false
  
  const execute = async () => {
    if (disabled.value || isRefreshing.value) return
    
    try {
      isRefreshing.value = true
      await callback()
    } finally {
      isRefreshing.value = false
      pullDistance.value = 0
      canRefresh.value = false
    }
  }
  
  const handleTouchStart = (e: TouchEvent) => {
    if (disabled.value) return
    
    const targetEl = target?.value || document.documentElement
    if (targetEl.scrollTop > 0) return
    
    startY = e.touches[0].clientY
    isDragging = true
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || disabled.value) return
    
    currentY = e.touches[0].clientY
    const deltaY = currentY - startY
    
    if (deltaY > 0) {
      e.preventDefault()
      pullDistance.value = Math.min(deltaY * 0.5, threshold * 1.5)
      canRefresh.value = pullDistance.value >= threshold
    }
  }
  
  const handleTouchEnd = () => {
    if (!isDragging || disabled.value) return
    
    isDragging = false
    
    if (canRefresh.value) {
      execute()
    } else {
      pullDistance.value = 0
      canRefresh.value = false
    }
  }
  
  const setupListeners = () => {
    const targetEl = target?.value || document
    
    targetEl.addEventListener('touchstart', handleTouchStart, { passive: false })
    targetEl.addEventListener('touchmove', handleTouchMove, { passive: false })
    targetEl.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      targetEl.removeEventListener('touchstart', handleTouchStart)
      targetEl.removeEventListener('touchmove', handleTouchMove)
      targetEl.removeEventListener('touchend', handleTouchEnd)
    }
  }
  
  onMounted(() => {
    const cleanup = setupListeners()
    onUnmounted(cleanup)
  })
  
  return {
    isRefreshing,
    pullDistance,
    canRefresh,
    execute
  }
}
