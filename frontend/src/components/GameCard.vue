<template>
  <article class="game-card" :class="{ compact: density === 'compact' }">
    <div class="game-card__image-container">
      <img
        v-if="game.capsuleImage"
        :src="game.capsuleImage"
        :alt="`${game.title} cover art`"
        class="game-image"
        loading="lazy"
        @error="handleImageError"
      />
      <div v-else class="image-placeholder">
        <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
      </div>
      
      <!-- Overlay Actions -->
      <div class="game-card__overlay">
        <div class="overlay-actions">
          <button
            class="action-button favorite-button"
            :class="{ active: userStore.isFavorite(game.id) }"
            @click.stop="toggleFavorite"
            :aria-label="userStore.isFavorite(game.id) ? 'Remove from favorites' : 'Add to favorites'"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          
          <button
            class="action-button details-button"
            @click.stop="viewDetails"
            :aria-label="`View details for ${game.title}`"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          
          <div class="dropdown" v-if="userStore.isAuthenticated">
            <button
              class="action-button dropdown-button"
              @click.stop="showDropdown = !showDropdown"
              :aria-label="'More actions'"
              :aria-expanded="showDropdown"
            >
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="5" r="1"/>
                <circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
            
            <div v-if="showDropdown" class="dropdown-menu">
              <button class="dropdown-item" @click="addToCollection">
                Add to Collection
              </button>
              <button class="dropdown-item" @click="shareGame">
                Share Game
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Platform Badges -->
      <div class="platform-badges">
        <PlatformBadge
          v-for="platformId in game.platforms.slice(0, 3)"
          :key="platformId"
          :platform-id="platformId"
          size="small"
        />
        <span v-if="game.platforms.length > 3" class="platform-more">
          +{{ game.platforms.length - 3 }}
        </span>
      </div>
      
      <!-- Completion Badge -->
      <div v-if="game.completionRate !== undefined" class="completion-badge">
        <ProgressRing
          :value="game.completionRate"
          :size="28"
          :stroke-width="3"
          class="completion-ring"
        />
        <span class="completion-text">{{ game.completionRate }}%</span>
      </div>
    </div>
    
    <div class="game-card__content">
      <div class="game-card__header">
        <h3 class="game-title">
          <router-link 
            :to="`/game/${game.id}`"
            class="title-link"
            @click="trackGameView"
          >
            {{ game.title }}
          </router-link>
        </h3>
        
        <div v-if="game.rating" class="game-rating">
          <div class="rating-stars">
            <svg
              v-for="star in 5"
              :key="star"
              class="star"
              :class="{ filled: star <= Math.round(game.rating) }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          </div>
          <span class="rating-value">{{ game.rating.toFixed(1) }}</span>
        </div>
      </div>
      
      <div v-if="game.developer || game.publisher" class="game-meta">
        <span class="developer">{{ game.developer || game.publisher }}</span>
        <span v-if="game.releaseDate" class="release-date">
          {{ formatReleaseDate(game.releaseDate) }}
        </span>
      </div>
      
      <div class="game-stats">
        <StatChip
          icon="trophy"
          :value="game.totalAchievements"
          label="achievements"
          variant="default"
        />
        
        <StatChip
          v-if="game.unlockedCount !== undefined"
          icon="unlock"
          :value="game.unlockedCount"
          :label="`unlocked`"
          variant="success"
        />
        
        <StatChip
          v-if="game.completionEstimateHours"
          icon="clock"
          :value="`${game.completionEstimateHours}h`"
          label="to complete"
          variant="info"
        />
      </div>
      
      <div v-if="game.genres.length > 0" class="game-genres">
        <TagPills
          :tags="game.genres.slice(0, 3)"
          size="small"
          variant="secondary"
          :max-display="3"
        />
      </div>
      
      <div v-if="game.price" class="game-price">
        <span class="price-label">Price:</span>
        <span class="price-value" :class="{ free: game.price === 'Free' }">
          {{ game.price }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import type { Game } from '@/types/domain'
import PlatformBadge from './PlatformBadge.vue'
import ProgressRing from './ProgressRing.vue'
import StatChip from './StatChip.vue'
import TagPills from './TagPills.vue'

interface Props {
  game: Game
  density?: 'compact' | 'comfortable' | 'spacious'
}

const props = withDefaults(defineProps<Props>(), {
  density: 'comfortable'
})

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const showDropdown = ref(false)

const formatReleaseDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.getFullYear().toString()
  } catch {
    return dateString
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const toggleFavorite = () => {
  if (!userStore.isAuthenticated) {
    appStore.showInfo('Sign in required', 'Please sign in to add games to your favorites')
    return
  }
  
  userStore.toggleFavorite(props.game.id)
  
  if (userStore.isFavorite(props.game.id)) {
    appStore.showSuccess('Added to favorites', `${props.game.title} has been added to your favorites`)
  } else {
    appStore.showInfo('Removed from favorites', `${props.game.title} has been removed from your favorites`)
  }
}

const viewDetails = () => {
  trackGameView()
  router.push(`/game/${props.game.id}`)
}

const trackGameView = () => {
  userStore.addToRecentlyViewed(props.game.id)
}

const addToCollection = () => {
  showDropdown.value = false
  // TODO: Open collection selection modal
  appStore.showInfo('Coming soon', 'Collection management is coming soon!')
}

const shareGame = () => {
  showDropdown.value = false
  
  if (navigator.share) {
    navigator.share({
      title: props.game.title,
      text: `Check out ${props.game.title} on Achievement Tracker`,
      url: `${window.location.origin}/game/${props.game.id}`
    }).catch(console.error)
  } else {
    // Fallback: copy to clipboard
    const url = `${window.location.origin}/game/${props.game.id}`
    navigator.clipboard.writeText(url).then(() => {
      appStore.showSuccess('Link copied', 'Game link has been copied to your clipboard')
    }).catch(() => {
      appStore.showError('Failed to copy', 'Could not copy game link to clipboard')
    })
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const dropdown = event.target as HTMLElement
  if (!dropdown.closest('.dropdown')) {
    showDropdown.value = false
  }
}

// TODO: Add click outside listener in onMounted/onUnmounted
</script>

<style lang="less" scoped>
.game-card {
  .m-card-hover();
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: all @transition-base @ease-out;
  
  &.compact {
    .game-card__content {
      padding: @space-3;
    }
    
    .game-title {
      font-size: @font-size-base;
    }
    
    .game-stats {
      gap: @space-2;
    }
  }
  
  &:hover {
    .game-card__overlay {
      opacity: 1;
    }
    
    .game-image {
      transform: scale(1.05);
    }
  }
}

.game-card__image-container {
  position: relative;
  aspect-ratio: 460 / 215; // Steam capsule ratio
  overflow: hidden;
  background: @color-panel-2;
}

.game-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform @transition-slow @ease-out;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, @color-panel-2, @color-panel-3);
  color: @color-text-dim;
  
  .placeholder-icon {
    width: 48px;
    height: 48px;
  }
}

.game-card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  opacity: 0;
  transition: opacity @transition-base @ease-out;
  
  .overlay-actions {
    position: absolute;
    bottom: @space-3;
    left: @space-3;
    display: flex;
    gap: @space-2;
  }
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: fade(@color-panel, 90%);
  border: 1px solid @color-border;
  border-radius: @radius-md;
  color: @color-text;
  cursor: pointer;
  transition: all @transition-base @ease-out;
  backdrop-filter: blur(8px);
  
  .icon {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    background: @color-accent;
    border-color: @color-accent;
    color: @color-bg;
    transform: translateY(-1px);
  }
  
  &.active {
    background: @color-accent;
    border-color: @color-accent;
    color: @color-bg;
    
    .icon {
      fill: currentColor;
    }
  }
}

.dropdown {
  position: relative;
  
  .dropdown-menu {
    position: absolute;
    bottom: 100%;
    left: 0;
    margin-bottom: @space-2;
    min-width: 160px;
    .m-card();
    z-index: @z-dropdown;
    
    .dropdown-item {
      display: block;
      width: 100%;
      padding: @space-2 @space-3;
      background: none;
      border: none;
      color: @color-text;
      text-align: left;
      font-size: @font-size-sm;
      cursor: pointer;
      transition: all @transition-base @ease-out;
      
      &:hover {
        background: fade(@color-accent, 10%);
        color: @color-accent;
      }
      
      &:first-child {
        border-radius: @radius-xl @radius-xl 0 0;
      }
      
      &:last-child {
        border-radius: 0 0 @radius-xl @radius-xl;
      }
    }
  }
}

.platform-badges {
  position: absolute;
  top: @space-2;
  right: @space-2;
  display: flex;
  gap: @space-1;
  align-items: center;
  
  .platform-more {
    font-size: @font-size-xs;
    color: @color-text;
    background: fade(@color-panel, 90%);
    padding: @space-1 @space-2;
    border-radius: @radius-sm;
    backdrop-filter: blur(8px);
  }
}

.completion-badge {
  position: absolute;
  top: @space-2;
  left: @space-2;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .completion-ring {
    position: absolute;
  }
  
  .completion-text {
    font-size: @font-size-xs;
    font-weight: @font-weight-semibold;
    color: @color-text;
  }
}

.game-card__content {
  padding: @space-4;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: @space-3;
}

.game-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: @space-2;
}

.game-title {
  margin: 0;
  font-size: @font-size-lg;
  font-weight: @font-weight-semibold;
  line-height: @line-height-tight;
  flex: 1;
  
  .title-link {
    color: @color-text;
    text-decoration: none;
    transition: color @transition-base @ease-out;
    display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
    
    &:hover {
      color: @color-accent;
    }
  }
}

.game-rating {
  display: flex;
  align-items: center;
  gap: @space-2;
  flex-shrink: 0;
  
  .rating-stars {
    display: flex;
    gap: 1px;
    
    .star {
      width: 12px;
      height: 12px;
      color: @color-text-dim;
      
      &.filled {
        color: @color-accent-2;
        fill: currentColor;
      }
    }
  }
  
  .rating-value {
    font-size: @font-size-sm;
    font-weight: @font-weight-medium;
    color: @color-text-dim;
  }
}

.game-meta {
  display: flex;
  align-items: center;
  gap: @space-2;
  font-size: @font-size-sm;
  color: @color-text-dim;
  
  .developer {
            overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .release-date {
    &::before {
      content: '•';
      margin-right: @space-2;
    }
  }
}

.game-stats {
  display: flex;
  gap: @space-3;
  flex-wrap: wrap;
}

.game-genres {
  flex: 1;
}

.game-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: @space-2;
  border-top: 1px solid @color-border;
  font-size: @font-size-sm;
  
  .price-label {
    color: @color-text-dim;
  }
  
  .price-value {
    font-weight: @font-weight-semibold;
    color: @color-text;
    
    &.free {
      color: @color-accent-2;
    }
  }
}

// High contrast theme
.theme-contrast & {
  .game-card {
    background: @color-contrast-panel;
    border-color: @color-contrast-border;
  }
  
  .action-button {
    background: fade(@color-contrast-panel, 90%);
    border-color: @color-contrast-border;
    
    &:hover {
      background: @color-contrast-accent;
      border-color: @color-contrast-accent;
    }
  }
  
  .dropdown-menu {
    background: @color-contrast-panel;
    border-color: @color-contrast-border;
  }
  
  .game-price {
    border-top-color: @color-contrast-border;
  }
}
</style>
