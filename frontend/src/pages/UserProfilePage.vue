<template>
  <div class="user-profile-page">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading user profile...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <h1>User Not Found</h1>
      <p>{{ error }}</p>
      <router-link to="/" class="btn-primary">Back to Home</router-link>
    </div>
    
    <div v-else-if="user" class="profile-content">
      <!-- Profile Header -->
      <section class="profile-header">
        <div class="header-background">
          <div class="header-content">
            <div class="profile-main">
              <UserAvatar 
                :user="user" 
                :size="120" 
                :border="true"
                class="profile-avatar"
              />
              
              <div class="profile-info">
                <h1 class="username">{{ user.displayName }}</h1>
                <div class="user-meta">
                  <div v-if="user.country" class="meta-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{{ getCountryName(user.country) }}</span>
                  </div>
                  
                  <div class="meta-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="m16 10-4 4-4-4"/>
                    </svg>
                    <span>Member since {{ memberSince }}</span>
                  </div>
                </div>
                
                <p v-if="user.bio" class="user-bio">{{ user.bio }}</p>
                
                <div class="platform-badges">
                  <PlatformBadge
                    v-for="platformId in user.platformIds"
                    :key="platformId"
                    :platform-id="platformId"
                    size="small"
                  />
                </div>
              </div>
            </div>
            
            <div class="profile-actions">
              <button class="action-btn share-btn" @click="shareProfile">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Share Profile
              </button>
              
              <button v-if="!isOwnProfile" class="action-btn compare-btn" @click="compareWithUser">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"/>
                  <path d="M21 11h-4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"/>
                  <path d="M7 21V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12"/>
                </svg>
                Compare
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Stats Overview -->
      <section class="stats-overview">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon games-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>Games Tracked</h3>
              <p class="stat-value">{{ user.totals.gamesTracked.toLocaleString() }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon achievements-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>Achievements</h3>
              <p class="stat-value">{{ user.totals.achievementsUnlocked.toLocaleString() }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon completion-icon">
              <ProgressRing 
                :value="user.totals.completionRate" 
                :size="48" 
                :stroke-width="4"
                color="#66c0f4"
                :show-label="false"
              />
            </div>
            <div class="stat-content">
              <h3>Completion Rate</h3>
              <p class="stat-value">{{ user.totals.completionRate.toFixed(1) }}%</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon time-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>Hours Played</h3>
              <p class="stat-value">{{ user.totals.hoursPlayed.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Main Content -->
      <div class="profile-main-content">
        <div class="content-sidebar">
          <!-- Recent Achievements -->
          <section class="recent-achievements">
            <h2>Recent Achievements</h2>
            <div class="achievements-list">
              <div 
                v-for="achievement in recentAchievements"
                :key="achievement.id"
                class="achievement-item"
                @click="viewGame(achievement.gameId)"
              >
                <div class="achievement-icon">
                  <img 
                    v-if="achievement.icon"
                    :src="achievement.icon"
                    :alt="achievement.name"
                    @error="handleAchievementIconError"
                  />
                  <div v-else class="icon-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="8" r="7"/>
                      <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
                    </svg>
                  </div>
                </div>
                
                <div class="achievement-details">
                  <h4>{{ achievement.name }}</h4>
                  <p class="game-title">{{ getGameTitle(achievement.gameId) }}</p>
                  <p class="unlock-date">{{ formatRelativeDate(achievement.unlockedAt!) }}</p>
                </div>
                
                <div class="achievement-rarity">
                  {{ achievement.rarity.toFixed(1) }}%
                </div>
              </div>
            </div>
            
            <div v-if="recentAchievements.length === 0" class="empty-state">
              <p>No recent achievements</p>
            </div>
          </section>
          
          <!-- Achievement Showcase -->
          <section class="achievement-showcase">
            <h2>Rare Achievements</h2>
            <div class="showcase-grid">
              <div 
                v-for="achievement in rareAchievements"
                :key="achievement.id"
                class="showcase-item"
                @click="viewGame(achievement.gameId)"
              >
                <div class="showcase-icon">
                  <img 
                    v-if="achievement.icon"
                    :src="achievement.icon"
                    :alt="achievement.name"
                    @error="handleAchievementIconError"
                  />
                  <div v-else class="icon-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="8" r="7"/>
                      <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
                    </svg>
                  </div>
                </div>
                
                <div class="showcase-content">
                  <h4>{{ achievement.name }}</h4>
                  <p class="rarity-badge">{{ getRarityLabel(achievement.rarity) }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <div class="content-main">
          <!-- Game Library -->
          <section class="game-library">
            <div class="section-header">
              <h2>Game Library</h2>
              <div class="library-filters">
                <button 
                  class="filter-btn"
                  :class="{ active: gameFilter === 'all' }"
                  @click="gameFilter = 'all'"
                >
                  All Games
                </button>
                <button 
                  class="filter-btn"
                  :class="{ active: gameFilter === 'completed' }"
                  @click="gameFilter = 'completed'"
                >
                  Completed
                </button>
                <button 
                  class="filter-btn"
                  :class="{ active: gameFilter === 'in-progress' }"
                  @click="gameFilter = 'in-progress'"
                >
                  In Progress
                </button>
                <button 
                  class="filter-btn"
                  :class="{ active: gameFilter === 'favorites' }"
                  @click="gameFilter = 'favorites'"
                >
                  Favorites
                </button>
              </div>
            </div>
            
            <div class="games-grid">
              <GameCard
                v-for="game in filteredGames"
                :key="game.id"
                :game="game"
                density="compact"
              />
            </div>
            
            <div v-if="filteredGames.length === 0" class="empty-state">
              <p>No games found for the selected filter.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import type { User, Game, Achievement } from '@/types/domain'
import UserAvatar from '@/components/UserAvatar.vue'
import PlatformBadge from '@/components/PlatformBadge.vue'
import ProgressRing from '@/components/ProgressRing.vue'
import GameCard from '@/components/GameCard.vue'

// Import mock data
import usersData from '@/data/users.json'
import gamesData from '@/data/games.json'
import achievementsData from '@/data/achievements.json'

interface Props {
  id: string
}

const props = defineProps<Props>()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const loading = ref(true)
const error = ref<string | null>(null)
const user = ref<User | null>(null)
const gameFilter = ref<'all' | 'completed' | 'in-progress' | 'favorites'>('all')

const isOwnProfile = computed(() => {
  return userStore.currentUser?.id === props.id
})

const memberSince = computed(() => {
  // Mock calculation - in real app would come from user data
  return '2020'
})

const recentAchievements = computed(() => {
  if (!user.value) return []
  
  return achievementsData
    .filter(a => a.unlocked && a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 5)
})

const rareAchievements = computed(() => {
  if (!user.value) return []
  
  return achievementsData
    .filter(a => a.unlocked && a.rarity < 10)
    .sort((a, b) => a.rarity - b.rarity)
    .slice(0, 6)
})

const userGames = computed(() => {
  // In a real app, this would be filtered by user's library
  // For demo purposes, showing all games with mock completion data
  return gamesData.map(game => ({
    ...game,
    isCompleted: (game.unlockedCount || 0) === game.totalAchievements,
    isFavorite: userStore.isFavorite(game.id)
  }))
})

const filteredGames = computed(() => {
  switch (gameFilter.value) {
    case 'completed':
      return userGames.value.filter(g => g.isCompleted)
    case 'in-progress':
      return userGames.value.filter(g => (g.unlockedCount || 0) > 0 && !g.isCompleted)
    case 'favorites':
      return userGames.value.filter(g => g.isFavorite)
    default:
      return userGames.value
  }
})

const loadUserData = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Special case: if viewing own profile and no mock user exists, create one
    if (isOwnProfile.value && !usersData.find(u => u.id === props.id)) {
      // Create a mock profile for the current user
      const mockProfile: User = {
        id: props.id,
        displayName: userStore.currentUser?.displayName || 'Demo User',
        avatar: '/images/avatars/user1.jpg',
        country: 'US',
        bio: 'Achievement hunter and gaming enthusiast. Love exploring new games and collecting rare achievements!',
        platformIds: ['steam', 'xbox', 'playstation'],
        totals: {
          gamesTracked: 156,
          achievementsUnlocked: 2847,
          completionRate: 73.8,
          hoursPlayed: 8943
        }
      }
      user.value = mockProfile
      return
    }
    
    // Find user in mock data
    const foundUser = usersData.find(u => u.id === props.id)
    if (!foundUser) {
      error.value = 'User not found'
      return
    }
    
    user.value = foundUser
    
  } catch (err) {
    console.error('Error loading user data:', err)
    error.value = 'Failed to load user data'
  } finally {
    loading.value = false
  }
}

const getCountryName = (countryCode: string) => {
  const countries: Record<string, string> = {
    'US': 'United States',
    'UK': 'United Kingdom', 
    'CA': 'Canada',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan'
  }
  return countries[countryCode] || countryCode
}

const getGameTitle = (gameId: string) => {
  const game = gamesData.find(g => g.id === gameId)
  return game?.title || 'Unknown Game'
}

const formatRelativeDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'today'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  } catch {
    return dateString
  }
}

const getRarityLabel = (rarity: number) => {
  if (rarity < 1) return 'Ultra Rare'
  if (rarity < 5) return 'Very Rare'
  if (rarity < 15) return 'Rare'
  if (rarity < 40) return 'Uncommon'
  return 'Common'
}

const shareProfile = () => {
  if (!user.value) return
  
  if (navigator.share) {
    navigator.share({
      title: `${user.value.displayName}'s Profile`,
      text: `Check out ${user.value.displayName}'s achievement progress on Achievement Tracker`,
      url: `${window.location.origin}/user/${user.value.id}`
    }).catch(console.error)
  } else {
    const url = `${window.location.origin}/user/${user.value.id}`
    navigator.clipboard.writeText(url).then(() => {
      appStore.showSuccess('Link copied', 'Profile link has been copied to your clipboard')
    }).catch(() => {
      appStore.showError('Failed to copy', 'Could not copy profile link to clipboard')
    })
  }
}

const compareWithUser = () => {
  if (!user.value || !userStore.currentUser) {
    appStore.showInfo('Sign in required', 'Please sign in to compare profiles')
    return
  }
  
  router.push(`/compare?users=${userStore.currentUser.id},${user.value.id}`)
}

const viewGame = (gameId: string) => {
  router.push(`/game/${gameId}`)
}

const handleAchievementIconError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(() => {
  loadUserData()
})
</script>

<style lang="less" scoped>
.user-profile-page {
  min-height: 100vh;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid @color-border;
    border-top-color: @color-accent;
    border-radius: @radius-full;
    animation: spin 1s linear infinite;
    margin-bottom: @space-4;
  }
  
  h1 {
    color: @color-text;
    margin-bottom: @space-4;
  }
  
  p {
    color: @color-text-dim;
    margin-bottom: @space-6;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-primary {
  .m-button-primary();
  text-decoration: none;
}

.profile-header {
  .header-background {
    background: linear-gradient(135deg, @color-panel 0%, @color-panel-2 100%);
    border-bottom: 1px solid @color-border;
  }
  
  .header-content {
    padding: @space-8;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: @space-8;
    
    @media (max-width: @screen-lg) {
      flex-direction: column;
      gap: @space-6;
    }
  }
}

.profile-main {
  display: flex;
  gap: @space-6;
  align-items: flex-start;
  
  @media (max-width: @screen-md) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

.profile-avatar {
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
  
  .username {
    font-size: @font-size-3xl;
    font-weight: @font-weight-bold;
    color: @color-text;
    margin: 0 0 @space-3 0;
    line-height: @line-height-tight;
  }
  
  .user-meta {
    display: flex;
    gap: @space-4;
    margin-bottom: @space-4;
    
    @media (max-width: @screen-sm) {
      flex-direction: column;
      gap: @space-2;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: @space-2;
      color: @color-text-dim;
      font-size: @font-size-sm;
      
      .icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
    }
  }
  
  .user-bio {
    color: @color-text-dim;
    margin: 0 0 @space-4 0;
    line-height: @line-height-normal;
    max-width: 500px;
  }
  
  .platform-badges {
    display: flex;
    gap: @space-2;
    flex-wrap: wrap;
  }
}

.profile-actions {
  display: flex;
  gap: @space-3;
  
  @media (max-width: @screen-lg) {
    width: 100%;
    justify-content: flex-start;
  }
  
  @media (max-width: @screen-sm) {
    flex-direction: column;
  }
}

.action-btn {
  .m-button-secondary();
  white-space: nowrap;
  
  .icon {
    width: 18px;
    height: 18px;
  }
}

.stats-overview {
  padding: @space-8;
  border-bottom: 1px solid @color-border;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: @space-6;
  }
}

.stat-card {
  .m-card();
  padding: @space-4;
  display: flex;
  align-items: center;
  gap: @space-4;
  transition: all @transition-base @ease-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: @shadow-xl;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: @radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    svg {
      width: 24px;
      height: 24px;
    }
    
    &.games-icon {
      background: fade(@color-accent, 15%);
      color: @color-accent;
    }
    
    &.achievements-icon {
      background: fade(@color-accent-2, 15%);
      color: @color-accent-2;
    }
    
    &.completion-icon {
      background: fade(@color-accent, 10%);
    }
    
    &.time-icon {
      background: fade(@color-warning, 15%);
      color: @color-warning;
    }
  }
  
  .stat-content {
    flex: 1;
    
    h3 {
      font-size: @font-size-sm;
      font-weight: @font-weight-semibold;
      color: @color-text-dim;
      margin: 0 0 @space-1 0;
    }
    
    .stat-value {
      font-size: @font-size-2xl;
      font-weight: @font-weight-bold;
      color: @color-text;
      margin: 0;
      line-height: 1;
    }
  }
}

.profile-main-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: @space-8;
  padding: @space-8;
  
  @media (max-width: @screen-lg) {
    grid-template-columns: 1fr;
    gap: @space-6;
  }
}

.content-sidebar {
  display: flex;
  flex-direction: column;
  gap: @space-8;
}

.recent-achievements, .achievement-showcase {
  h2 {
    font-size: @font-size-xl;
    font-weight: @font-weight-bold;
    color: @color-text;
    margin: 0 0 @space-4 0;
  }
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: @space-3;
}

.achievement-item {
  .m-card();
  padding: @space-3;
  display: flex;
  gap: @space-3;
  align-items: center;
  cursor: pointer;
  transition: all @transition-base @ease-out;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: @shadow-md;
  }
  
  .achievement-icon {
    width: 40px;
    height: 40px;
    border-radius: @radius-md;
    overflow: hidden;
    background: @color-panel-2;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .icon-placeholder {
      color: @color-text-dim;
      
      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
  
  .achievement-details {
    flex: 1;
    min-width: 0;
    
    h4 {
      font-size: @font-size-sm;
      font-weight: @font-weight-semibold;
      color: @color-text;
      margin: 0 0 @space-1 0;
      line-height: @line-height-tight;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .game-title {
      font-size: @font-size-xs;
      color: @color-text-dim;
      margin: 0 0 @space-1 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .unlock-date {
      font-size: @font-size-xs;
      color: @color-text-muted;
      margin: 0;
    }
  }
  
  .achievement-rarity {
    font-size: @font-size-xs;
    font-weight: @font-weight-semibold;
    color: @color-accent;
    flex-shrink: 0;
  }
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: @space-3;
}

.showcase-item {
  .m-card();
  padding: @space-3;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all @transition-base @ease-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: @shadow-md;
  }
  
  .showcase-icon {
    width: 48px;
    height: 48px;
    border-radius: @radius-md;
    overflow: hidden;
    background: @color-panel-2;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: @space-2;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .icon-placeholder {
      color: @color-text-dim;
      
      svg {
        width: 24px;
        height: 24px;
      }
    }
  }
  
  .showcase-content {
    h4 {
      font-size: @font-size-xs;
      font-weight: @font-weight-semibold;
      color: @color-text;
      margin: 0 0 @space-1 0;
      line-height: @line-height-tight;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    
    .rarity-badge {
      font-size: @font-size-xs;
      color: @color-accent-2;
      font-weight: @font-weight-medium;
      margin: 0;
    }
  }
}

.game-library {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: @space-6;
    
    @media (max-width: @screen-md) {
      flex-direction: column;
      align-items: flex-start;
      gap: @space-4;
    }
    
    h2 {
      font-size: @font-size-2xl;
      font-weight: @font-weight-bold;
      color: @color-text;
      margin: 0;
    }
  }
  
  .library-filters {
    display: flex;
    gap: @space-2;
    
    @media (max-width: @screen-sm) {
      flex-wrap: wrap;
    }
    
    .filter-btn {
      .m-button-ghost();
      padding: @space-2 @space-3;
      font-size: @font-size-sm;
      
      &.active {
        background: @color-accent;
        color: @color-bg;
      }
    }
  }
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: @space-4;
}

.empty-state {
  text-align: center;
  padding: @space-12;
  color: @color-text-dim;
  
  p {
    margin: 0;
  }
}
</style>
