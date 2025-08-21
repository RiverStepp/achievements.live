<template>
  <div id="app" :class="themeClass">
    <!-- Skip to content link for accessibility -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <!-- Route announcement for screen readers -->
    <div id="route-announcement" class="sr-only" aria-live="polite"></div>
    
    <!-- App Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <main id="main-content" class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition
          :name="getTransitionName(route)"
          mode="out-in"
          appear
        >
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    
    <!-- App Footer -->
    <AppFooter />
    
    <!-- Toast Notifications -->
    <div class="toast-container">
      <Toast
        v-for="toast in appStore.toasts"
        :key="toast.id"
        v-bind="toast"
        @close="appStore.removeToast(toast.id)"
      />
    </div>
    
    <!-- Global Modals -->
    <div class="modal-container">
      <Modal
        v-for="modal in appStore.modals"
        :key="modal.id"
        :open="true"
        @close="appStore.closeModal(modal.id)"
      >
        <component :is="modal.component" v-bind="modal.props" />
      </Modal>
    </div>
    
    <!-- Global Loading Overlay -->
    <div v-if="appStore.isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner">
          <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        </div>
        <p v-if="appStore.loadingMessage" class="loading-message">
          {{ appStore.loadingMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useGamesStore } from '@/stores/games'
import { useSearchStore } from '@/stores/search'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import Toast from '@/components/Toast.vue'
import Modal from '@/components/Modal.vue'

const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()
const gamesStore = useGamesStore()
const searchStore = useSearchStore()

const themeClass = computed(() => `theme-${appStore.theme}`)

const getTransitionName = (currentRoute: any) => {
  // Disable transitions if user prefers reduced motion
  if (appStore.reducedMotion) return ''
  
  // Simple fade transition for most routes
  return 'fade'
}

// Initialize app
onMounted(async () => {
  // Initialize stores
  appStore.initTheme()
  appStore.initPreferences()
  userStore.initUser()
  searchStore.init()
  gamesStore.init()
  
  // Load initial data
  try {
    const { getPlatforms } = await import('@/services/api')
    const platforms = await getPlatforms()
    gamesStore.setPlatforms(platforms)
  } catch (error) {
    console.error('Failed to load platforms:', error)
  }
  
  // Set up global error handling
  window.addEventListener('error', handleGlobalError)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  
  // Set up keyboard shortcuts
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('error', handleGlobalError)
  window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  document.removeEventListener('keydown', handleGlobalKeydown)
})

const handleGlobalError = (event: ErrorEvent) => {
  console.error('Global error:', event.error)
  appStore.showError(
    'Something went wrong',
    'An unexpected error occurred. Please try refreshing the page.'
  )
}

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Unhandled promise rejection:', event.reason)
  appStore.showError(
    'Network error',
    'There was a problem connecting to our servers. Please try again.'
  )
}

const handleGlobalKeydown = (event: KeyboardEvent) => {
  // Global keyboard shortcuts
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'k':
        // Focus search (Ctrl/Cmd + K)
        event.preventDefault()
        const searchInput = document.querySelector('.search-bar input') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
        break
        
      case ',':
        // Open preferences/settings (Ctrl/Cmd + ,)
        event.preventDefault()
        appStore.showInfo('Settings', 'Settings panel coming soon!')
        break
    }
  }
  
  // Escape key handling
  if (event.key === 'Escape') {
    // Close modals first
    if (appStore.modals.length > 0) {
      appStore.closeModal()
      return
    }
    
    // Close sidebar
    if (appStore.sidebarOpen) {
      appStore.closeSidebar()
      return
    }
  }
  
  // Help shortcut (?)
  if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
    const activeElement = document.activeElement
    if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
      event.preventDefault()
      showKeyboardShortcuts()
    }
  }
}

const showKeyboardShortcuts = () => {
  appStore.showInfo(
    'Keyboard Shortcuts',
    `/ - Focus search
Ctrl/Cmd + K - Focus search  
Ctrl/Cmd + , - Settings
Esc - Close dialogs/sidebar
? - Show this help`
  )
}
</script>

<style lang="less">
// Global styles
* {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 0;
  font-family: @font-family-base;
  background: @color-bg;
  color: @color-text;
  min-height: 100vh;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// Skip link for accessibility
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: @color-accent;
  color: @color-bg;
  padding: 8px;
  border-radius: @radius-md;
  text-decoration: none;
  font-weight: @font-weight-medium;
  z-index: @z-tooltip;
  transition: top @transition-base @ease-out;
  
  &:focus {
    top: 6px;
  }
}

// Main content area
.main-content {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: @space-4 @space-4 @space-8;
  
  @media (min-width: @screen-lg) {
    padding: @space-6 @space-6 @space-12;
  }
}

// Toast container
.toast-container {
  position: fixed;
  top: @space-4;
  right: @space-4;
  z-index: @z-toast;
  display: flex;
  flex-direction: column;
  gap: @space-2;
  max-width: 400px;
  width: 100%;
  
  @media (max-width: @screen-sm) {
    left: @space-4;
    right: @space-4;
    max-width: none;
  }
}

// Modal container
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: @z-modal;
  pointer-events: none;
  
  > * {
    pointer-events: auto;
  }
}

// Global loading overlay
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: fade(@color-bg, 80%);
  backdrop-filter: blur(4px);
  z-index: @z-modal;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: @space-4;
    padding: @space-6;
    .m-card();
    text-align: center;
  }
  
  .loading-spinner {
    color: @color-accent;
    
    svg {
      width: 32px;
      height: 32px;
    }
  }
  
  .loading-message {
    margin: 0;
    color: @color-text-dim;
    font-size: @font-size-sm;
  }
}

// Page transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity @transition-base @ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all @transition-base @ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

// High contrast theme
.theme-contrast {
  body {
    background: @color-contrast-bg;
    color: @color-contrast-text;
  }
  
  .loading-overlay {
    background: fade(@color-contrast-bg, 80%);
  }
  
  .loading-content {
    background: @color-contrast-panel;
    border-color: @color-contrast-border;
  }
  
  .loading-spinner {
    color: @color-contrast-accent;
  }
}

// Focus management
:focus {
  outline: 2px solid @color-accent;
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid @color-accent;
  outline-offset: 2px;
}

// Selection styling
::selection {
  background: fade(@color-accent, 30%);
  color: @color-text;
}

::-moz-selection {
  background: fade(@color-accent, 30%);
  color: @color-text;
}

// Scrollbar styling
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: @color-panel-3;
}

::-webkit-scrollbar-thumb {
  background: @color-border;
  border-radius: 4px;
  
  &:hover {
    background: @color-border-light;
  }
}

// Print styles
@media print {
  .skip-link,
  .toast-container,
  .modal-container,
  .loading-overlay {
    display: none !important;
  }
  
  body {
    background: white !important;
    color: black !important;
  }
}
</style>
