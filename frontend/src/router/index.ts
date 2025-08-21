import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Lazy load page components
const HomePage = () => import('@/pages/HomePage.vue')
const SearchResultsPage = () => import('@/pages/SearchResultsPage.vue')
const GamePage = () => import('@/pages/GamePage.vue')
const UserProfilePage = () => import('@/pages/UserProfilePage.vue')
const CollectionsPage = () => import('@/pages/CollectionsPage.vue')
const ComparePage = () => import('@/pages/ComparePage.vue')
const PlatformsPage = () => import('@/pages/PlatformsPage.vue')
const NotFoundPage = () => import('@/pages/NotFoundPage.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: 'Achievement Tracker - Cross-Platform Gaming Progress',
      description: 'Track your gaming achievements across Steam, Xbox, PlayStation, and more platforms.'
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchResultsPage,
    meta: {
      title: 'Browse Games - Achievement Tracker',
      description: 'Search and filter games across all supported platforms.'
    }
  },
  {
    path: '/game/:id',
    name: 'Game',
    component: GamePage,
    props: true,
    meta: {
      title: 'Game Details - Achievement Tracker',
      description: 'View detailed game information and achievement progress.'
    }
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: UserProfilePage,
    props: true,
    meta: {
      title: 'User Profile - Achievement Tracker',
      description: 'View user profile and gaming statistics.'
    }
  },
  {
    path: '/collections',
    name: 'Collections',
    component: CollectionsPage,
    meta: {
      title: 'My Collections - Achievement Tracker',
      description: 'Manage your game collections and curated lists.',
      requiresAuth: true
    }
  },
  {
    path: '/compare',
    name: 'Compare',
    component: ComparePage,
    meta: {
      title: 'Compare Progress - Achievement Tracker',
      description: 'Compare achievement progress between users.'
    }
  },
  {
    path: '/platforms',
    name: 'Platforms',
    component: PlatformsPage,
    meta: {
      title: 'Supported Platforms - Achievement Tracker',
      description: 'View all supported gaming platforms and their statistics.'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage,
    meta: {
      title: 'Page Not Found - Achievement Tracker',
      description: 'The page you are looking for does not exist.'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Handle scroll behavior for better UX
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else if (to.name !== from.name) {
      return { top: 0, behavior: 'smooth' }
    }
    return false
  }
})

// Global navigation guards
router.beforeEach((to, from, next) => {
  // Set document title
  const baseTitle = 'Achievement Tracker'
  const routeTitle = to.meta?.title as string
  
  if (routeTitle && routeTitle !== baseTitle) {
    document.title = routeTitle
  } else {
    document.title = baseTitle
  }
  
  // Set meta description
  const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement
  if (metaDescription && to.meta?.description) {
    metaDescription.content = to.meta.description as string
  }
  
  // Handle authentication requirements
  if (to.meta?.requiresAuth) {
    // In a real app, check authentication status
    // For now, we'll allow access since we have mock auth
    console.log('Route requires authentication:', to.path)
  }
  
  next()
})

router.afterEach((to, from) => {
  // Track page views for analytics
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: to.fullPath
    })
  }
  
  // Announce route changes for screen readers
  const routeAnnouncement = document.getElementById('route-announcement')
  if (routeAnnouncement) {
    const title = (to.meta?.title as string) || 'Page loaded'
    routeAnnouncement.textContent = title
  }
})

// Handle router errors
router.onError((error) => {
  console.error('Router error:', error)
  
  // In production, you might want to report this to an error tracking service
  if (import.meta.env.PROD) {
    // Report to error tracking service
    console.log('Would report router error in production:', error)
  }
})

export default router
