import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import global styles
import '@/styles/utilities.less'

// Create Vue app
const app = createApp(App)

// Install Pinia for state management
const pinia = createPinia()
app.use(pinia)

// Install Vue Router
app.use(router)

// Global error handler
app.config.errorHandler = (error, instance, info) => {
  console.error('Vue error:', error, info)
  
  // In production, report to error tracking service
  if (import.meta.env.PROD) {
    // Report to error tracking service like Sentry
    console.log('Would report Vue error in production:', { error, info })
  }
}

// Global warning handler (development only)
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('Vue warning:', msg, trace)
  }
}

// Performance measurement
if (import.meta.env.DEV) {
  app.config.performance = true
}

// Mount the app
app.mount('#app')

// Service worker registration (if needed)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// Theme preference detection
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
if (!localStorage.getItem('achievement-tracker-theme')) {
  const defaultTheme = prefersDark.matches ? 'dark' : 'dark' // Default to dark theme
  localStorage.setItem('achievement-tracker-theme', defaultTheme)
}

// Reduced motion detection
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
if (prefersReducedMotion.matches) {
  document.documentElement.style.setProperty('--animation-duration', '0.01ms')
}

// High contrast detection
const prefersHighContrast = window.matchMedia('(prefers-contrast: high)')
if (prefersHighContrast.matches && !localStorage.getItem('achievement-tracker-theme')) {
  localStorage.setItem('achievement-tracker-theme', 'contrast')
}

// PWA install prompt handling
let deferredPrompt: any = null

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault()
  // Stash the event so it can be triggered later
  deferredPrompt = e
  
  // Show custom install button or banner
  console.log('PWA install prompt available')
})

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed')
  deferredPrompt = null
})

// Keyboard accessibility enhancements
document.addEventListener('keydown', (e) => {
  // Tab key navigation enhancements
  if (e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing')
  }
})

document.addEventListener('mousedown', () => {
  document.body.classList.remove('user-is-tabbing')
})

// Viewport height fix for mobile browsers
const setViewportHeight = () => {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

setViewportHeight()
window.addEventListener('resize', setViewportHeight)
window.addEventListener('orientationchange', setViewportHeight)

// Console welcome message (development)
if (import.meta.env.DEV) {
  console.log(
    '%c🏆 Achievement Tracker',
    'color: #66c0f4; font-size: 24px; font-weight: bold;'
  )
  console.log(
    '%cWelcome to Achievement Tracker! Track your gaming progress across all platforms.',
    'color: #a9b7c6; font-size: 14px;'
  )
  console.log(
    '%cKeyboard shortcuts:\n• / - Focus search\n• Ctrl/Cmd + K - Focus search\n• ? - Show help',
    'color: #8f98a0; font-size: 12px; font-family: monospace;'
  )
}

// Global types for better TypeScript support
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export default app
