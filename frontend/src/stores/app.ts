import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Theme, Toast } from '@/types/domain'

export const useAppStore = defineStore('app', () => {
  // Theme state
  const theme = ref<Theme>('dark')
  const isHighContrast = computed(() => theme.value === 'contrast')
  
  // Toast state
  const toasts = ref<Toast[]>([])
  let toastIdCounter = 0
  
  // Modal state
  const modals = ref<{ id: string; component: string; props?: any }[]>([])
  
  // Loading state
  const isLoading = ref(false)
  const loadingMessage = ref('')
  
  // Navigation state
  const sidebarOpen = ref(false)
  
  // Preferences
  const density = ref<'compact' | 'comfortable' | 'spacious'>('comfortable')
  const viewMode = ref<'grid' | 'list'>('grid')
  const reducedMotion = ref(false)
  
  // Theme functions
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('achievement-tracker-theme', newTheme)
    updateThemeClass()
  }
  
  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'contrast' : 'dark')
  }
  
  function updateThemeClass() {
    document.documentElement.className = `theme-${theme.value}`
  }
  
  function initTheme() {
    const savedTheme = localStorage.getItem('achievement-tracker-theme') as Theme
    if (savedTheme && ['dark', 'contrast'].includes(savedTheme)) {
      theme.value = savedTheme
    }
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = mediaQuery.matches
    mediaQuery.addEventListener('change', (e) => {
      reducedMotion.value = e.matches
    })
    
    updateThemeClass()
  }
  
  // Toast functions
  function addToast(toast: Omit<Toast, 'id'>) {
    const id = `toast-${++toastIdCounter}`
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }
    
    toasts.value.push(newToast)
    
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
    
    return id
  }
  
  function removeToast(id: string) {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  function clearToasts() {
    toasts.value = []
  }
  
  // Toast convenience methods
  function showSuccess(title: string, message?: string) {
    return addToast({ type: 'success', title, message })
  }
  
  function showError(title: string, message?: string) {
    return addToast({ type: 'error', title, message, duration: 0 }) // Don't auto-dismiss errors
  }
  
  function showInfo(title: string, message?: string) {
    return addToast({ type: 'info', title, message })
  }
  
  function showWarning(title: string, message?: string) {
    return addToast({ type: 'warning', title, message })
  }
  
  // Modal functions
  function openModal(component: string, props?: any) {
    const id = `modal-${Date.now()}`
    modals.value.push({ id, component, props })
    return id
  }
  
  function closeModal(id?: string) {
    if (id) {
      const index = modals.value.findIndex(modal => modal.id === id)
      if (index > -1) {
        modals.value.splice(index, 1)
      }
    } else {
      // Close the most recent modal
      modals.value.pop()
    }
  }
  
  function closeAllModals() {
    modals.value = []
  }
  
  // Loading functions
  function setLoading(loading: boolean, message = '') {
    isLoading.value = loading
    loadingMessage.value = message
  }
  
  // Navigation functions
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }
  
  function closeSidebar() {
    sidebarOpen.value = false
  }
  
  // Preference functions
  function setDensity(newDensity: typeof density.value) {
    density.value = newDensity
    localStorage.setItem('achievement-tracker-density', newDensity)
  }
  
  function setViewMode(newViewMode: typeof viewMode.value) {
    viewMode.value = newViewMode
    localStorage.setItem('achievement-tracker-view-mode', newViewMode)
  }
  
  function initPreferences() {
    const savedDensity = localStorage.getItem('achievement-tracker-density') as typeof density.value
    if (savedDensity && ['compact', 'comfortable', 'spacious'].includes(savedDensity)) {
      density.value = savedDensity
    }
    
    const savedViewMode = localStorage.getItem('achievement-tracker-view-mode') as typeof viewMode.value
    if (savedViewMode && ['grid', 'list'].includes(savedViewMode)) {
      viewMode.value = savedViewMode
    }
  }
  
  return {
    // State
    theme,
    isHighContrast,
    toasts,
    modals,
    isLoading,
    loadingMessage,
    sidebarOpen,
    density,
    viewMode,
    reducedMotion,
    
    // Theme
    setTheme,
    toggleTheme,
    initTheme,
    
    // Toasts
    addToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    
    // Modals
    openModal,
    closeModal,
    closeAllModals,
    
    // Loading
    setLoading,
    
    // Navigation
    toggleSidebar,
    closeSidebar,
    
    // Preferences
    setDensity,
    setViewMode,
    initPreferences
  }
})
