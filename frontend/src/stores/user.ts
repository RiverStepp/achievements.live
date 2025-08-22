import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Collection, PlatformId } from '@/types/domain'

export const useUserStore = defineStore('user', () => {
  // User state
  const currentUser = ref<User | null>(null)
  const isAuthenticated = computed(() => currentUser.value !== null)
  
  // Collections state
  const collections = ref<Collection[]>([])
  const favorites = ref<string[]>([]) // Game IDs
  
  // Recently viewed
  const recentlyViewed = ref<string[]>([]) // Game IDs, most recent first
  const maxRecentItems = 20
  
  // User preferences
  const defaultPlatforms = ref<PlatformId[]>(['steam'])
  const showHiddenAchievements = ref(false)
  const autoTrackGames = ref(true)
  
  // Auth functions (mock implementation)
  function signIn(userData?: Omit<User, 'id'>) {
    const user: User = userData ? {
      id: `user-${Date.now()}`,
      ...userData
    } : {
      id: `user-demo-${Date.now()}`,
      displayName: 'Demo User',
      avatar: '/images/avatars/user1.jpg',
      country: 'US',
      bio: 'Achievement hunter and gaming enthusiast!',
      platformIds: ['steam', 'xbox'],
      totals: {
        gamesTracked: 156,
        achievementsUnlocked: 2847,
        completionRate: 73.8,
        hoursPlayed: 8943
      }
    }
    currentUser.value = user
    localStorage.setItem('achievement-tracker-user', JSON.stringify(user))
    return user
  }
  
  function signOut() {
    currentUser.value = null
    localStorage.removeItem('achievement-tracker-user')
    clearUserData()
  }
  
  function updateProfile(updates: Partial<User>) {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...updates }
      localStorage.setItem('achievement-tracker-user', JSON.stringify(currentUser.value))
    }
  }
  
  function clearUserData() {
    collections.value = []
    favorites.value = []
    recentlyViewed.value = []
  }
  
  // Collections functions
  function createCollection(name: string, description?: string, gameIds: string[] = []) {
    const collection: Collection = {
      id: `collection-${Date.now()}`,
      name,
      description,
      gameIds,
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    collections.value.push(collection)
    saveCollections()
    return collection
  }
  
  function updateCollection(id: string, updates: Partial<Omit<Collection, 'id' | 'createdAt'>>) {
    const collection = collections.value.find(c => c.id === id)
    if (collection) {
      Object.assign(collection, updates, { updatedAt: new Date().toISOString() })
      saveCollections()
    }
  }
  
  function deleteCollection(id: string) {
    const index = collections.value.findIndex(c => c.id === id)
    if (index > -1) {
      collections.value.splice(index, 1)
      saveCollections()
    }
  }
  
  function addGameToCollection(collectionId: string, gameId: string) {
    const collection = collections.value.find(c => c.id === collectionId)
    if (collection && !collection.gameIds.includes(gameId)) {
      collection.gameIds.push(gameId)
      collection.updatedAt = new Date().toISOString()
      saveCollections()
    }
  }
  
  function removeGameFromCollection(collectionId: string, gameId: string) {
    const collection = collections.value.find(c => c.id === collectionId)
    if (collection) {
      const index = collection.gameIds.indexOf(gameId)
      if (index > -1) {
        collection.gameIds.splice(index, 1)
        collection.updatedAt = new Date().toISOString()
        saveCollections()
      }
    }
  }
  
  function reorderCollectionGames(collectionId: string, fromIndex: number, toIndex: number) {
    const collection = collections.value.find(c => c.id === collectionId)
    if (collection) {
      const [removed] = collection.gameIds.splice(fromIndex, 1)
      collection.gameIds.splice(toIndex, 0, removed)
      collection.updatedAt = new Date().toISOString()
      saveCollections()
    }
  }
  
  // Favorites functions
  function addFavorite(gameId: string) {
    if (!favorites.value.includes(gameId)) {
      favorites.value.push(gameId)
      saveFavorites()
    }
  }
  
  function removeFavorite(gameId: string) {
    const index = favorites.value.indexOf(gameId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
    }
  }
  
  function toggleFavorite(gameId: string) {
    if (favorites.value.includes(gameId)) {
      removeFavorite(gameId)
    } else {
      addFavorite(gameId)
    }
  }
  
  function isFavorite(gameId: string) {
    return favorites.value.includes(gameId)
  }
  
  // Recently viewed functions
  function addToRecentlyViewed(gameId: string) {
    // Remove if already exists
    const existingIndex = recentlyViewed.value.indexOf(gameId)
    if (existingIndex > -1) {
      recentlyViewed.value.splice(existingIndex, 1)
    }
    
    // Add to beginning
    recentlyViewed.value.unshift(gameId)
    
    // Trim to max items
    if (recentlyViewed.value.length > maxRecentItems) {
      recentlyViewed.value = recentlyViewed.value.slice(0, maxRecentItems)
    }
    
    saveRecentlyViewed()
  }
  
  function clearRecentlyViewed() {
    recentlyViewed.value = []
    saveRecentlyViewed()
  }
  
  // Platform preferences
  function setDefaultPlatforms(platforms: PlatformId[]) {
    defaultPlatforms.value = platforms
    localStorage.setItem('achievement-tracker-default-platforms', JSON.stringify(platforms))
  }
  
  function addDefaultPlatform(platform: PlatformId) {
    if (!defaultPlatforms.value.includes(platform)) {
      defaultPlatforms.value.push(platform)
      localStorage.setItem('achievement-tracker-default-platforms', JSON.stringify(defaultPlatforms.value))
    }
  }
  
  function removeDefaultPlatform(platform: PlatformId) {
    const index = defaultPlatforms.value.indexOf(platform)
    if (index > -1) {
      defaultPlatforms.value.splice(index, 1)
      localStorage.setItem('achievement-tracker-default-platforms', JSON.stringify(defaultPlatforms.value))
    }
  }
  
  // Achievement preferences
  function setShowHiddenAchievements(show: boolean) {
    showHiddenAchievements.value = show
    localStorage.setItem('achievement-tracker-show-hidden', show.toString())
  }
  
  function setAutoTrackGames(autoTrack: boolean) {
    autoTrackGames.value = autoTrack
    localStorage.setItem('achievement-tracker-auto-track', autoTrack.toString())
  }
  
  // Persistence helpers
  function saveCollections() {
    localStorage.setItem('achievement-tracker-collections', JSON.stringify(collections.value))
  }
  
  function saveFavorites() {
    localStorage.setItem('achievement-tracker-favorites', JSON.stringify(favorites.value))
  }
  
  function saveRecentlyViewed() {
    localStorage.setItem('achievement-tracker-recent', JSON.stringify(recentlyViewed.value))
  }
  
  // Initialize from localStorage
  function initUser() {
    // Load user
    const savedUser = localStorage.getItem('achievement-tracker-user')
    if (savedUser) {
      try {
        currentUser.value = JSON.parse(savedUser)
      } catch (e) {
        console.warn('Failed to parse saved user data:', e)
      }
    }
    
    // Load collections
    const savedCollections = localStorage.getItem('achievement-tracker-collections')
    if (savedCollections) {
      try {
        collections.value = JSON.parse(savedCollections)
      } catch (e) {
        console.warn('Failed to parse saved collections:', e)
      }
    }
    
    // Load favorites
    const savedFavorites = localStorage.getItem('achievement-tracker-favorites')
    if (savedFavorites) {
      try {
        favorites.value = JSON.parse(savedFavorites)
      } catch (e) {
        console.warn('Failed to parse saved favorites:', e)
      }
    }
    
    // Load recently viewed
    const savedRecent = localStorage.getItem('achievement-tracker-recent')
    if (savedRecent) {
      try {
        recentlyViewed.value = JSON.parse(savedRecent)
      } catch (e) {
        console.warn('Failed to parse saved recent items:', e)
      }
    }
    
    // Load platform preferences
    const savedPlatforms = localStorage.getItem('achievement-tracker-default-platforms')
    if (savedPlatforms) {
      try {
        defaultPlatforms.value = JSON.parse(savedPlatforms)
      } catch (e) {
        console.warn('Failed to parse saved platforms:', e)
      }
    }
    
    // Load achievement preferences
    const savedShowHidden = localStorage.getItem('achievement-tracker-show-hidden')
    if (savedShowHidden) {
      showHiddenAchievements.value = savedShowHidden === 'true'
    }
    
    const savedAutoTrack = localStorage.getItem('achievement-tracker-auto-track')
    if (savedAutoTrack) {
      autoTrackGames.value = savedAutoTrack === 'true'
    }
  }
  
  return {
    // State
    currentUser,
    isAuthenticated,
    collections,
    favorites,
    recentlyViewed,
    defaultPlatforms,
    showHiddenAchievements,
    autoTrackGames,
    
    // Auth
    signIn,
    signOut,
    updateProfile,
    
    // Collections
    createCollection,
    updateCollection,
    deleteCollection,
    addGameToCollection,
    removeGameFromCollection,
    reorderCollectionGames,
    
    // Favorites
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    
    // Recently viewed
    addToRecentlyViewed,
    clearRecentlyViewed,
    
    // Preferences
    setDefaultPlatforms,
    addDefaultPlatform,
    removeDefaultPlatform,
    setShowHiddenAchievements,
    setAutoTrackGames,
    
    // Init
    initUser
  }
})
