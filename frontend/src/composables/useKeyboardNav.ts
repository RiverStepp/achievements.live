import { ref, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * Composable for keyboard navigation
 */
export function useKeyboardNav(
  options: {
    selector?: string
    focusableSelector?: string
    loop?: boolean
    orientation?: 'horizontal' | 'vertical' | 'both'
    disabled?: () => boolean
  } = {}
) {
  const {
    selector = '[data-keyboard-nav]',
    focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    loop = true,
    orientation = 'both',
    disabled = () => false
  } = options
  
  const currentIndex = ref(-1)
  const items = ref<HTMLElement[]>([])
  
  const updateItems = () => {
    const container = document.querySelector(selector) as HTMLElement
    if (!container) {
      items.value = []
      return
    }
    
    const focusableElements = container.querySelectorAll(focusableSelector)
    items.value = Array.from(focusableElements) as HTMLElement[]
  }
  
  const focusItem = (index: number) => {
    if (index < 0 || index >= items.value.length) return
    
    currentIndex.value = index
    const item = items.value[index]
    if (item) {
      item.focus()
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }
  
  const findCurrentIndex = () => {
    const activeElement = document.activeElement as HTMLElement
    const index = items.value.findIndex(item => item === activeElement)
    currentIndex.value = index
    return index
  }
  
  const moveNext = () => {
    updateItems()
    const current = findCurrentIndex()
    let next = current + 1
    
    if (next >= items.value.length) {
      next = loop ? 0 : items.value.length - 1
    }
    
    focusItem(next)
  }
  
  const movePrevious = () => {
    updateItems()
    const current = findCurrentIndex()
    let prev = current - 1
    
    if (prev < 0) {
      prev = loop ? items.value.length - 1 : 0
    }
    
    focusItem(prev)
  }
  
  const moveFirst = () => {
    updateItems()
    focusItem(0)
  }
  
  const moveLast = () => {
    updateItems()
    focusItem(items.value.length - 1)
  }
  
  const handleKeydown = (event: KeyboardEvent) => {
    if (disabled()) return
    
    const { key, ctrlKey, metaKey, shiftKey } = event
    const modifierPressed = ctrlKey || metaKey || shiftKey
    
    // Don't handle if modifier keys are pressed (except for specific combinations)
    if (modifierPressed && !['Home', 'End'].includes(key)) return
    
    let handled = false
    
    switch (key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          moveNext()
          handled = true
        }
        break
        
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          movePrevious()
          handled = true
        }
        break
        
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          moveNext()
          handled = true
        }
        break
        
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          movePrevious()
          handled = true
        }
        break
        
      case 'Home':
        moveFirst()
        handled = true
        break
        
      case 'End':
        moveLast()
        handled = true
        break
    }
    
    if (handled) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
  
  const init = () => {
    updateItems()
    document.addEventListener('keydown', handleKeydown)
  }
  
  const destroy = () => {
    document.removeEventListener('keydown', handleKeydown)
  }
  
  onMounted(init)
  onUnmounted(destroy)
  
  return {
    currentIndex,
    items,
    updateItems,
    focusItem,
    moveNext,
    movePrevious,
    moveFirst,
    moveLast,
    findCurrentIndex
  }
}

/**
 * Composable for grid keyboard navigation
 */
export function useGridKeyboardNav(
  options: {
    selector?: string
    itemSelector?: string
    columns?: number
    loop?: boolean
    disabled?: () => boolean
  } = {}
) {
  const {
    selector = '[data-grid-nav]',
    itemSelector = '[data-grid-item]',
    columns = 4,
    loop = false,
    disabled = () => false
  } = options
  
  const currentRow = ref(0)
  const currentCol = ref(0)
  const items = ref<HTMLElement[][]>([])
  
  const updateItems = () => {
    const container = document.querySelector(selector) as HTMLElement
    if (!container) {
      items.value = []
      return
    }
    
    const allItems = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[]
    const grid: HTMLElement[][] = []
    
    for (let i = 0; i < allItems.length; i += columns) {
      grid.push(allItems.slice(i, i + columns))
    }
    
    items.value = grid
  }
  
  const focusItem = (row: number, col: number) => {
    if (row < 0 || row >= items.value.length) return
    if (col < 0 || col >= items.value[row].length) return
    
    currentRow.value = row
    currentCol.value = col
    
    const item = items.value[row][col]
    if (item) {
      item.focus()
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }
  
  const findCurrentPosition = () => {
    const activeElement = document.activeElement as HTMLElement
    
    for (let row = 0; row < items.value.length; row++) {
      for (let col = 0; col < items.value[row].length; col++) {
        if (items.value[row][col] === activeElement) {
          currentRow.value = row
          currentCol.value = col
          return { row, col }
        }
      }
    }
    
    return { row: 0, col: 0 }
  }
  
  const moveUp = () => {
    updateItems()
    findCurrentPosition()
    
    let newRow = currentRow.value - 1
    let newCol = currentCol.value
    
    if (newRow < 0) {
      if (loop) {
        newRow = items.value.length - 1
        // Find the last item in the column, accounting for irregular grids
        while (newRow >= 0 && !items.value[newRow][newCol]) {
          newRow--
        }
      } else {
        newRow = 0
      }
    }
    
    focusItem(newRow, newCol)
  }
  
  const moveDown = () => {
    updateItems()
    findCurrentPosition()
    
    let newRow = currentRow.value + 1
    let newCol = currentCol.value
    
    if (newRow >= items.value.length || !items.value[newRow][newCol]) {
      if (loop) {
        newRow = 0
      } else {
        newRow = currentRow.value
      }
    }
    
    focusItem(newRow, newCol)
  }
  
  const moveLeft = () => {
    updateItems()
    findCurrentPosition()
    
    let newRow = currentRow.value
    let newCol = currentCol.value - 1
    
    if (newCol < 0) {
      if (loop) {
        newRow = newRow - 1
        if (newRow < 0) {
          newRow = items.value.length - 1
        }
        newCol = items.value[newRow] ? items.value[newRow].length - 1 : 0
      } else {
        newCol = 0
      }
    }
    
    focusItem(newRow, newCol)
  }
  
  const moveRight = () => {
    updateItems()
    findCurrentPosition()
    
    let newRow = currentRow.value
    let newCol = currentCol.value + 1
    
    if (newCol >= items.value[newRow].length) {
      if (loop) {
        newRow = newRow + 1
        if (newRow >= items.value.length) {
          newRow = 0
        }
        newCol = 0
      } else {
        newCol = items.value[newRow].length - 1
      }
    }
    
    focusItem(newRow, newCol)
  }
  
  const handleKeydown = (event: KeyboardEvent) => {
    if (disabled()) return
    
    const { key } = event
    let handled = false
    
    switch (key) {
      case 'ArrowUp':
        moveUp()
        handled = true
        break
        
      case 'ArrowDown':
        moveDown()
        handled = true
        break
        
      case 'ArrowLeft':
        moveLeft()
        handled = true
        break
        
      case 'ArrowRight':
        moveRight()
        handled = true
        break
        
      case 'Home':
        focusItem(0, 0)
        handled = true
        break
        
      case 'End':
        const lastRow = items.value.length - 1
        const lastCol = items.value[lastRow] ? items.value[lastRow].length - 1 : 0
        focusItem(lastRow, lastCol)
        handled = true
        break
    }
    
    if (handled) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
  
  const init = () => {
    updateItems()
    document.addEventListener('keydown', handleKeydown)
  }
  
  const destroy = () => {
    document.removeEventListener('keydown', handleKeydown)
  }
  
  onMounted(init)
  onUnmounted(destroy)
  
  return {
    currentRow,
    currentCol,
    items,
    updateItems,
    focusItem,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    findCurrentPosition
  }
}

/**
 * Composable for focus trap (useful for modals)
 */
export function useFocusTrap(
  containerRef: { value: HTMLElement | null },
  options: {
    immediate?: boolean
    restoreFocus?: boolean
  } = {}
) {
  const { immediate = true, restoreFocus = true } = options
  
  let previouslyFocused: HTMLElement | null = null
  let isActive = ref(false)
  
  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef.value) return []
    
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    return Array.from(containerRef.value.querySelectorAll(selector)) as HTMLElement[]
  }
  
  const handleTabKey = (event: KeyboardEvent) => {
    if (!isActive.value || event.key !== 'Tab') return
    
    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus()
        event.preventDefault()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus()
        event.preventDefault()
      }
    }
  }
  
  const activate = () => {
    if (isActive.value) return
    
    if (restoreFocus) {
      previouslyFocused = document.activeElement as HTMLElement
    }
    
    isActive.value = true
    document.addEventListener('keydown', handleTabKey)
    
    // Focus first element
    nextTick(() => {
      const focusableElements = getFocusableElements()
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    })
  }
  
  const deactivate = () => {
    if (!isActive.value) return
    
    isActive.value = false
    document.removeEventListener('keydown', handleTabKey)
    
    if (restoreFocus && previouslyFocused) {
      previouslyFocused.focus()
      previouslyFocused = null
    }
  }
  
  if (immediate) {
    onMounted(activate)
  }
  
  onUnmounted(deactivate)
  
  return {
    isActive,
    activate,
    deactivate
  }
}
