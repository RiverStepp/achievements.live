<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          Track Your Gaming Achievements<br>
          <span class="hero-subtitle">Across All Platforms</span>
        </h1>
        
        <p class="hero-description">
          The ultimate achievement tracker for Steam, Xbox, PlayStation, GOG, Epic Games, and Nintendo Switch. 
          Monitor your progress, discover rare achievements, and compare your gaming milestones with friends.
        </p>
        
        <div class="hero-search">
          <SearchBar 
            placeholder="Search for games, achievements, or developers..."
            :auto-focus="false"
          />
        </div>
        
        <div class="hero-stats" v-if="statsLoaded">
          <div class="stat-item">
            <div class="stat-value">{{ formatNumber(totalGames) }}</div>
            <div class="stat-label">Games Tracked</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatNumber(totalAchievements) }}</div>
            <div class="stat-label">Achievements</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ activePlatforms }}</div>
            <div class="stat-label">Platforms</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Filters -->
    <section class="quick-filters-section">
      <h2 class="section-title">Browse by Platform</h2>
      <div class="platform-grid">
        <router-link
          v-for="platform in platforms"
          :key="platform.id"
          :to="`/search?platforms=${platform.id}`"
          class="platform-card"
          :style="{ '--platform-color': platform.colorHex }"
        >
          <div class="platform-icon">
            <!-- Platform icon would go here -->
            <div class="icon-placeholder" :style="{ background: platform.colorHex }">
              {{ platform.name.charAt(0) }}
            </div>
          </div>
          <div class="platform-info">
            <h3 class="platform-name">{{ platform.name }}</h3>
            <p class="platform-stats">{{ getPlatformGameCount(platform.id) }} games</p>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Featured Content -->
    <section class="featured-section">
      <h2 class="section-title">Featured Games</h2>
      <div v-if="featuredGames.length > 0" class="game-grid">
        <GameCard
          v-for="game in featuredGames.slice(0, 6)"
          :key="game.id"
          :game="game"
          :density="appStore.density"
        />
      </div>
      <div v-else class="loading-grid">
        <SkeletonCard v-for="i in 6" :key="i" />
      </div>
    </section>

    <!-- Popular Games -->
    <section class="popular-section">
      <h2 class="section-title">Popular This Week</h2>
      <div v-if="popularGames.length > 0" class="game-grid">
        <GameCard
          v-for="game in popularGames.slice(0, 8)"
          :key="game.id"
          :game="game"
          :density="appStore.density"
        />
      </div>
      <div v-else class="loading-grid">
        <SkeletonCard v-for="i in 8" :key="i" />
      </div>
    </section>

    <!-- Trending Tags -->
    <section class="trending-section">
      <h2 class="section-title">Trending Tags</h2>
      <div v-if="trendingTags.length > 0" class="trending-tags">
        <TagPills
          :tags="trendingTags.slice(0, 20)"
          variant="primary"
          size="medium"
          :interactive="true"
          @tag-click="handleTagClick"
        />
      </div>
      <div v-else class="loading-tags">
        <div v-for="i in 10" :key="i" class="tag-skeleton"></div>
      </div>
    </section>

    <!-- Recent Activity (if authenticated) -->
    <section v-if="userStore.isAuthenticated && recentlyViewed.length > 0" class="recent-section">
      <div class="section-header">
        <h2 class="section-title">Continue Playing</h2>
        <router-link to="/collections" class="section-link">View All</router-link>
      </div>
      <div class="game-grid">
        <GameCard
          v-for="gameId in recentlyViewed.slice(0, 4)"
          :key="gameId"
          :game="getGameById(gameId)"
          :density="appStore.density"
          v-if="getGameById(gameId)"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useGamesStore } from '@/stores/games'
import { getFeatured, getTrendingTags } from '@/services/api'
import SearchBar from '@/components/SearchBar.vue'
import GameCard from '@/components/GameCard.vue'
import TagPills from '@/components/TagPills.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const gamesStore = useGamesStore()

const featuredGames = ref(gamesStore.featuredGames)
const popularGames = ref(gamesStore.popularGames)
const trendingTags = ref(gamesStore.trendingTags)
const statsLoaded = ref(false)

const platforms = computed(() => gamesStore.platforms)
const recentlyViewed = computed(() => userStore.recentlyViewed)

// Mock stats for hero section
const totalGames = computed(() => 50000)
const totalAchievements = computed(() => 2500000)
const activePlatforms = computed(() => platforms.value.length)

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`
  }
  return num.toString()
}

const getPlatformGameCount = (platformId: string) => {
  // Mock game count per platform
  const counts: Record<string, number> = {
    steam: 15000,
    xbox: 8500,
    playstation: 6200,
    gog: 3100,
    epic: 2800,
    nintendo: 4500
  }
  return formatNumber(counts[platformId] || 1000)
}

const getGameById = (gameId: string) => {
  return gamesStore.getGame(gameId)
}

const handleTagClick = (tag: string) => {
  router.push(`/search?tags=${encodeURIComponent(tag)}`)
}

onMounted(async () => {
  try {
    // Load featured content
    const featured = await getFeatured()
    featuredGames.value = featured.featured
    popularGames.value = featured.popular
    
    gamesStore.setFeaturedGames(featured.featured)
    gamesStore.setPopularGames(featured.popular)
    gamesStore.setRareFindGames(featured.rareFindGames)
    gamesStore.setQuickCompletionGames(featured.quickCompletions)
    
    // Load trending tags
    const tags = await getTrendingTags()
    trendingTags.value = tags
    gamesStore.setTrendingTags(tags)
    
    statsLoaded.value = true
  } catch (error) {
    console.error('Failed to load home page data:', error)
    appStore.showError('Failed to load data', 'Could not load the latest game information')
  }
})
</script>

<style lang="less" scoped>
.home-page {
  max-width: none;
  margin: 0 -@space-4 0;
  
  @media (min-width: @screen-lg) {
    margin: 0 -@space-6 0;
  }
}

.hero-section {
  background: linear-gradient(135deg, @color-panel 0%, @color-panel-2 100%);
  padding: @space-12 @space-4 @space-16;
  text-align: center;
  border-bottom: 1px solid @color-border;
  
  @media (min-width: @screen-lg) {
    padding: @space-16 @space-6 @space-20;
  }
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: @font-size-3xl;
  font-weight: @font-weight-bold;
  color: @color-text;
  line-height: @line-height-tight;
  margin: 0 0 @space-6;
  
  @media (min-width: @screen-md) {
    font-size: @font-size-4xl;
  }
}

.hero-subtitle {
  background: linear-gradient(135deg, @color-accent, @color-accent-2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: @font-size-lg;
  color: @color-text-dim;
  line-height: @line-height-relaxed;
  margin: 0 0 @space-8;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-search {
  max-width: 500px;
  margin: 0 auto @space-8;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: @space-8;
  
  @media (max-width: @screen-sm) {
    gap: @space-4;
  }
}

.stat-item {
  text-align: center;
  
  .stat-value {
    font-size: @font-size-2xl;
    font-weight: @font-weight-bold;
    color: @color-accent;
    line-height: 1;
    margin-bottom: @space-1;
    
    @media (min-width: @screen-md) {
      font-size: @font-size-3xl;
    }
  }
  
  .stat-label {
    font-size: @font-size-sm;
    color: @color-text-dim;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.section-title {
  font-size: @font-size-2xl;
  font-weight: @font-weight-semibold;
  color: @color-text;
  margin: 0 0 @space-6;
  text-align: center;
  
  @media (min-width: @screen-md) {
    text-align: left;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: @space-6;
  
  .section-link {
    color: @color-accent;
    text-decoration: none;
    font-weight: @font-weight-medium;
    transition: color @transition-base @ease-out;
    
    &:hover {
      color: @color-accent-hover;
    }
  }
}

.quick-filters-section,
.featured-section,
.popular-section,
.trending-section,
.recent-section {
  padding: @space-12 @space-4;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (min-width: @screen-lg) {
    padding: @space-16 @space-6;
  }
}

.platform-grid {
  display: grid;
  gap: @space-4;
  grid-template-columns: repeat(2, 1fr);
  
  @media (min-width: @screen-sm) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: @screen-lg) {
    grid-template-columns: repeat(6, 1fr);
  }
}

.platform-card {
  .m-card-hover();
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: @space-6;
  text-decoration: none;
  text-align: center;
  transition: all @transition-base @ease-out;
  
  &:hover {
    border-color: var(--platform-color);
    box-shadow: 0 0 0 1px var(--platform-color), @shadow-xl;
  }
}

.platform-icon {
  margin-bottom: @space-4;
  
  .icon-placeholder {
    width: 48px;
    height: 48px;
    border-radius: @radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: @font-size-xl;
    font-weight: @font-weight-bold;
    color: white;
  }
}

.platform-info {
  .platform-name {
    font-size: @font-size-base;
    font-weight: @font-weight-semibold;
    color: @color-text;
    margin: 0 0 @space-1;
  }
  
  .platform-stats {
    font-size: @font-size-sm;
    color: @color-text-dim;
    margin: 0;
  }
}

.game-grid {
  /*.grid-game-cards();*/
}

.loading-grid {
  /*.grid-game-cards();*/
}

.trending-tags {
  display: flex;
  justify-content: center;
  
  @media (min-width: @screen-md) {
    justify-content: flex-start;
  }
}

.loading-tags {
  display: flex;
  flex-wrap: wrap;
  gap: @space-2;
  justify-content: center;
  
  @media (min-width: @screen-md) {
    justify-content: flex-start;
  }
}

.tag-skeleton {
  height: 32px;
  width: 80px;
  background: linear-gradient(90deg, @color-panel-2 25%, @color-panel-3 50%, @color-panel-2 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: @radius-full;
  
  &:nth-child(even) {
    width: 100px;
  }
  
  &:nth-child(3n) {
    width: 60px;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

// High contrast theme
.theme-contrast & {
  .hero-section {
    background: linear-gradient(135deg, @color-contrast-panel 0%, fade(@color-contrast-panel, 80%) 100%);
    border-bottom-color: @color-contrast-border;
  }
  
  .hero-subtitle {
    background: @color-contrast-accent;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .stat-value {
    color: @color-contrast-accent;
  }
  
  .platform-card {
    background: @color-contrast-panel;
    border-color: @color-contrast-border;
  }
  
  .tag-skeleton {
    background: linear-gradient(90deg, @color-contrast-panel 25%, fade(@color-contrast-panel, 50%) 50%, @color-contrast-panel 75%);
    background-size: 200% 100%;
  }
}
</style>
