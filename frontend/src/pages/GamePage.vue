<template>
  <div class="game-page">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading game details...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <h1>Game Not Found</h1>
      <p>{{ error }}</p>
      <router-link to="/" class="btn-primary">Back to Home</router-link>
    </div>
    
    <div v-else-if="game" class="game-content">
      <!-- Hero Section -->
      <section class="game-hero" :style="heroStyles">
        <div class="hero-overlay">
          <div class="hero-content">
            <div class="game-header">
              <div class="game-title-section">
                <h1 class="game-title">{{ game.title }}</h1>
                <p v-if="game.subtitle" class="game-subtitle">{{ game.subtitle }}</p>
                
                <div class="game-meta">
                  <div class="meta-item">
                    <span class="meta-label">Developer:</span>
                    <span class="meta-value">{{ game.developer }}</span>
                  </div>
                  <div v-if="game.publisher !== game.developer" class="meta-item">
                    <span class="meta-label">Publisher:</span>
                    <span class="meta-value">{{ game.publisher }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Released:</span>
                    <span class="meta-value">{{ formatDate(game.releaseDate) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Price:</span>
                    <span class="meta-value" :class="{ free: game.price === 'Free' }">
                      {{ game.price }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="game-actions">
                <button 
                  class="action-btn favorite-btn"
                  :class="{ active: userStore.isFavorite(game.id) }"
                  @click="toggleFavorite"
                >
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {{ userStore.isFavorite(game.id) ? 'Remove from Favorites' : 'Add to Favorites' }}
                </button>
                
                <button class="action-btn share-btn" @click="shareGame">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Share Game
                </button>
              </div>
            </div>
            
            <!-- Game Stats -->
            <div class="game-stats-overview">
              <div class="stat-card">
                <ProgressRing 
                  :value="completionPercentage" 
                  :size="80" 
                  :stroke-width="4"
                  color="#66c0f4"
                />
                <div class="stat-details">
                  <h3>Completion</h3>
                  <p>{{ game.unlockedCount || 0 }}/{{ game.totalAchievements }} achievements</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-value">{{ game.rating?.toFixed(1) || 'N/A' }}</div>
                <div class="stat-details">
                  <h3>Rating</h3>
                  <div class="rating-stars">
                    <svg
                      v-for="star in 5"
                      :key="star"
                      class="star"
                      :class="{ filled: star <= Math.round(game.rating || 0) }"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-value">{{ game.completionEstimateHours || 'N/A' }}h</div>
                <div class="stat-details">
                  <h3>Completion Time</h3>
                  <p>Estimated to complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Main Content -->
      <div class="game-main">
        <!-- Platforms and Tags -->
        <section class="game-info-section">
          <div class="platforms-section">
            <h3>Available Platforms</h3>
            <div class="platforms-list">
              <PlatformBadge
                v-for="platformId in game.platforms"
                :key="platformId"
                :platform-id="platformId"
                size="medium"
              />
            </div>
          </div>
          
          <div class="tags-section">
            <h3>Genres & Tags</h3>
            <TagPills
              :tags="[...game.genres, ...(game.tags || [])]"
              variant="secondary"
              :max-display="20"
            />
          </div>
        </section>
        
        <!-- Achievements Section -->
        <section class="achievements-section">
          <div class="achievements-header">
            <h2>Achievements</h2>
            <div class="achievements-filters">
              <button 
                class="filter-btn"
                :class="{ active: achievementFilter === 'all' }"
                @click="achievementFilter = 'all'"
              >
                All ({{ achievements.length }})
              </button>
              <button 
                class="filter-btn"
                :class="{ active: achievementFilter === 'unlocked' }"
                @click="achievementFilter = 'unlocked'"
              >
                Unlocked ({{ unlockedAchievements.length }})
              </button>
              <button 
                class="filter-btn"
                :class="{ active: achievementFilter === 'locked' }"
                @click="achievementFilter = 'locked'"
              >
                Locked ({{ lockedAchievements.length }})
              </button>
              <button 
                class="filter-btn"
                :class="{ active: achievementFilter === 'rare' }"
                @click="achievementFilter = 'rare'"
              >
                Rare ({{ rareAchievements.length }})
              </button>
            </div>
          </div>
          
          <div class="achievements-grid">
            <div 
              v-for="achievement in filteredAchievements"
              :key="achievement.id"
              class="achievement-card"
              :class="{ unlocked: achievement.unlocked }"
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
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>
              
              <div class="achievement-content">
                <h4 class="achievement-name">{{ achievement.name }}</h4>
                <p class="achievement-description">{{ achievement.description }}</p>
                
                <div class="achievement-meta">
                  <div class="achievement-rarity">
                    <span class="rarity-percentage">{{ achievement.rarity.toFixed(1) }}%</span>
                    <span class="rarity-label">{{ getRarityLabel(achievement.rarity) }}</span>
                  </div>
                  
                  <div v-if="achievement.points" class="achievement-points">
                    {{ achievement.points }} points
                  </div>
                  
                  <div v-if="achievement.unlocked && achievement.unlockedAt" class="unlock-date">
                    Unlocked {{ formatRelativeDate(achievement.unlockedAt) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="filteredAchievements.length === 0" class="no-achievements">
            <p>No achievements found for the selected filter.</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import type { Game, Achievement } from '@/types/domain'
import PlatformBadge from '@/components/PlatformBadge.vue'
import ProgressRing from '@/components/ProgressRing.vue'
import TagPills from '@/components/TagPills.vue'

// Import mock data
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
const game = ref<Game | null>(null)
const achievements = ref<Achievement[]>([])
const achievementFilter = ref<'all' | 'unlocked' | 'locked' | 'rare'>('all')

const heroStyles = computed(() => {
  if (!game.value?.backgroundImage) return {}
  
  return {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url(${game.value.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})

const completionPercentage = computed(() => {
  if (!game.value) return 0
  return Math.round(((game.value.unlockedCount || 0) / game.value.totalAchievements) * 100)
})

const unlockedAchievements = computed(() => 
  achievements.value.filter(a => a.unlocked)
)

const lockedAchievements = computed(() => 
  achievements.value.filter(a => !a.unlocked)
)

const rareAchievements = computed(() => 
  achievements.value.filter(a => a.rarity < 10)
)

const filteredAchievements = computed(() => {
  switch (achievementFilter.value) {
    case 'unlocked':
      return unlockedAchievements.value
    case 'locked':
      return lockedAchievements.value
    case 'rare':
      return rareAchievements.value
    default:
      return achievements.value
  }
})

const loadGameData = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Find game in mock data
    const foundGame = gamesData.find(g => g.id === props.id)
    if (!foundGame) {
      error.value = 'Game not found'
      return
    }
    
    game.value = foundGame
    
    // Find achievements for this game
    achievements.value = achievementsData.filter(a => a.gameId === props.id)
    
    // Track game view
    userStore.addToRecentlyViewed(props.id)
    
  } catch (err) {
    console.error('Error loading game data:', err)
    error.value = 'Failed to load game data'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
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

const toggleFavorite = () => {
  if (!userStore.isAuthenticated) {
    appStore.showInfo('Sign in required', 'Please sign in to add games to your favorites')
    return
  }
  
  if (!game.value) return
  
  userStore.toggleFavorite(game.value.id)
  
  if (userStore.isFavorite(game.value.id)) {
    appStore.showSuccess('Added to favorites', `${game.value.title} has been added to your favorites`)
  } else {
    appStore.showInfo('Removed from favorites', `${game.value.title} has been removed from your favorites`)
  }
}

const shareGame = () => {
  if (!game.value) return
  
  if (navigator.share) {
    navigator.share({
      title: game.value.title,
      text: `Check out ${game.value.title} on Achievement Tracker`,
      url: `${window.location.origin}/game/${game.value.id}`
    }).catch(console.error)
  } else {
    const url = `${window.location.origin}/game/${game.value.id}`
    navigator.clipboard.writeText(url).then(() => {
      appStore.showSuccess('Link copied', 'Game link has been copied to your clipboard')
    }).catch(() => {
      appStore.showError('Failed to copy', 'Could not copy game link to clipboard')
    })
  }
}

const handleAchievementIconError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(() => {
  loadGameData()
})
</script>

<style lang="less" scoped>
.game-page {
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

.game-hero {
  position: relative;
  min-height: 60vh;
  display: flex;
  align-items: flex-end;
  
  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(18, 21, 28, 0.2) 0%,
      rgba(18, 21, 28, 0.8) 70%,
      rgba(18, 21, 28, 0.95) 100%
    );
  }
  
  .hero-content {
    position: relative;
    width: 100%;
    padding: @space-8;
    z-index: 1;
  }
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: @space-8;
  margin-bottom: @space-8;
  
  @media (max-width: @screen-lg) {
    flex-direction: column;
    gap: @space-6;
  }
}

.game-title-section {
  flex: 1;
  
  .game-title {
    font-size: @font-size-4xl;
    font-weight: @font-weight-bold;
    color: @color-text;
    margin: 0 0 @space-2 0;
    line-height: @line-height-tight;
    
    @media (max-width: @screen-md) {
      font-size: @font-size-3xl;
    }
  }
  
  .game-subtitle {
    font-size: @font-size-lg;
    color: @color-text-dim;
    margin: 0 0 @space-6 0;
    line-height: @line-height-normal;
  }
}

.game-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: @space-3;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: @space-2;
    
    .meta-label {
      color: @color-text-dim;
      font-size: @font-size-sm;
      min-width: 80px;
    }
    
    .meta-value {
      color: @color-text;
      font-weight: @font-weight-medium;
      
      &.free {
        color: @color-accent-2;
      }
    }
  }
}

.game-actions {
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
  
  &.favorite-btn.active {
    .m-button-primary();
    
    .icon {
      fill: currentColor;
    }
  }
}

.game-stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: @space-6;
  
  .stat-card {
    display: flex;
    align-items: center;
    gap: @space-4;
    padding: @space-4;
    background: fade(@color-panel, 80%);
    border: 1px solid @color-border;
    border-radius: @radius-xl;
    backdrop-filter: blur(10px);
    
    .stat-value {
      font-size: @font-size-3xl;
      font-weight: @font-weight-bold;
      color: @color-accent;
      line-height: 1;
    }
    
    .stat-details {
      h3 {
        font-size: @font-size-sm;
        font-weight: @font-weight-semibold;
        color: @color-text;
        margin: 0 0 @space-1 0;
      }
      
      p {
        font-size: @font-size-xs;
        color: @color-text-dim;
        margin: 0;
      }
    }
    
    .rating-stars {
      display: flex;
      gap: 2px;
      margin-top: @space-1;
      
      .star {
        width: 14px;
        height: 14px;
        color: @color-text-dim;
        
        &.filled {
          color: @color-accent-2;
          fill: currentColor;
        }
      }
    }
  }
}

.game-main {
  padding: @space-8;
}

.game-info-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: @space-8;
  margin-bottom: @space-12;
  
  @media (max-width: @screen-lg) {
    grid-template-columns: 1fr;
    gap: @space-6;
  }
  
  h3 {
    font-size: @font-size-lg;
    font-weight: @font-weight-semibold;
    color: @color-text;
    margin: 0 0 @space-4 0;
  }
}

.platforms-section {
  .platforms-list {
    display: flex;
    flex-wrap: wrap;
    gap: @space-3;
  }
}

.achievements-section {
  .achievements-header {
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
  
  .achievements-filters {
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

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: @space-4;
}

.achievement-card {
  .m-card();
  padding: @space-4;
  display: flex;
  gap: @space-3;
  transition: all @transition-base @ease-out;
  opacity: 0.6;
  
  &.unlocked {
    opacity: 1;
    border-color: fade(@color-accent-2, 30%);
    background: linear-gradient(
      180deg, 
      fade(@color-panel, 98%), 
      fade(@color-accent-2, 5%)
    );
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: @shadow-xl;
  }
}

.achievement-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: @radius-md;
  overflow: hidden;
  background: @color-panel-2;
  display: flex;
  align-items: center;
  justify-content: center;
  
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

.achievement-content {
  flex: 1;
  min-width: 0;
  
  .achievement-name {
    font-size: @font-size-base;
    font-weight: @font-weight-semibold;
    color: @color-text;
    margin: 0 0 @space-2 0;
    line-height: @line-height-tight;
  }
  
  .achievement-description {
    font-size: @font-size-sm;
    color: @color-text-dim;
    margin: 0 0 @space-3 0;
    line-height: @line-height-normal;
  }
  
  .achievement-meta {
    display: flex;
    flex-wrap: wrap;
    gap: @space-3;
    align-items: center;
    font-size: @font-size-xs;
    
    .achievement-rarity {
      display: flex;
      align-items: center;
      gap: @space-1;
      
      .rarity-percentage {
        color: @color-accent;
        font-weight: @font-weight-semibold;
      }
      
      .rarity-label {
        color: @color-text-dim;
      }
    }
    
    .achievement-points {
      color: @color-accent-2;
      font-weight: @font-weight-medium;
    }
    
    .unlock-date {
      color: @color-text-muted;
    }
  }
}

.no-achievements {
  text-align: center;
  padding: @space-12;
  color: @color-text-dim;
}
</style>
