<template>
  <div class="compare-page">
    <!-- Page Header -->
    <section class="page-header">
      <div class="header-content">
        <div class="header-main">
          <h1>Compare Achievements</h1>
          <p>Compare achievement progress and stats between different users</p>
        </div>
        
        <div class="header-actions">
          <button class="action-btn" @click="showUserSelector = true">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            Add User
          </button>
        </div>
      </div>
    </section>
    
    <!-- Comparison Content -->
    <div class="compare-content">
      <div v-if="!userStore.isAuthenticated" class="auth-required">
        <div class="auth-card">
          <svg class="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            <path d="M3 12h6m12 0h-6"/>
          </svg>
          <h2>Sign In Required</h2>
          <p>You need to sign in to compare achievement progress with other users.</p>
          <button class="btn-primary" @click="userStore.signIn()">Sign In</button>
        </div>
      </div>
      
      <div v-else-if="selectedUsers.length === 0" class="empty-state">
        <div class="empty-card">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"/>
            <path d="M21 11h-4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"/>
            <path d="M7 21V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12"/>
          </svg>
          <h2>No Users to Compare</h2>
          <p>Add users to start comparing achievement progress and statistics.</p>
          <button class="btn-primary" @click="showUserSelector = true">Add Users</button>
        </div>
      </div>
      
      <div v-else class="comparison-view">
        <!-- User Headers -->
        <div class="users-header">
          <div 
            v-for="user in selectedUsers"
            :key="user.id"
            class="user-header"
          >
            <div class="user-profile">
              <UserAvatar :user="user" :size="64" :border="true" />
              <div class="user-info">
                <h3>{{ user.displayName }}</h3>
                <p v-if="user.country">{{ getCountryName(user.country) }}</p>
              </div>
              <button 
                class="remove-user-btn"
                @click="removeUser(user)"
                :aria-label="`Remove ${user.displayName}`"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Stats Comparison -->
        <section class="stats-comparison">
          <h2>Overall Statistics</h2>
          <div class="stats-grid">
            <div class="stat-row">
              <div class="stat-label">Games Tracked</div>
              <div 
                v-for="user in selectedUsers"
                :key="`${user.id}-games`"
                class="stat-value"
              >
                {{ user.totals.gamesTracked.toLocaleString() }}
              </div>
            </div>
            
            <div class="stat-row">
              <div class="stat-label">Achievements Unlocked</div>
              <div 
                v-for="user in selectedUsers"
                :key="`${user.id}-achievements`"
                class="stat-value"
              >
                {{ user.totals.achievementsUnlocked.toLocaleString() }}
              </div>
            </div>
            
            <div class="stat-row">
              <div class="stat-label">Completion Rate</div>
              <div 
                v-for="user in selectedUsers"
                :key="`${user.id}-completion`"
                class="stat-value"
              >
                <div class="completion-stat">
                  <ProgressRing 
                    :value="user.totals.completionRate" 
                    :size="32" 
                    :stroke-width="3"
                    color="#66c0f4"
                    :show-label="false"
                  />
                  <span>{{ user.totals.completionRate.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
            
            <div class="stat-row">
              <div class="stat-label">Hours Played</div>
              <div 
                v-for="user in selectedUsers"
                :key="`${user.id}-hours`"
                class="stat-value"
              >
                {{ user.totals.hoursPlayed.toLocaleString() }}
              </div>
            </div>
          </div>
        </section>
        
        <!-- Game Comparison -->
        <section class="games-comparison">
          <div class="section-header">
            <h2>Game Progress Comparison</h2>
            <div class="game-filters">
              <button 
                class="filter-btn"
                :class="{ active: gameFilter === 'all' }"
                @click="gameFilter = 'all'"
              >
                All Games
              </button>
              <button 
                class="filter-btn"
                :class="{ active: gameFilter === 'common' }"
                @click="gameFilter = 'common'"
              >
                Common Games
              </button>
              <button 
                class="filter-btn"
                :class="{ active: gameFilter === 'completed' }"
                @click="gameFilter = 'completed'"
              >
                Completed by Anyone
              </button>
            </div>
          </div>
          
          <div class="games-comparison-list">
            <div 
              v-for="game in filteredGames"
              :key="game.id"
              class="game-comparison-row"
            >
              <div class="game-info">
                <img 
                  v-if="game.capsuleImage"
                  :src="game.capsuleImage"
                  :alt="game.title"
                  class="game-image"
                  @error="handleImageError"
                />
                <div v-else class="game-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                </div>
                
                <div class="game-details">
                  <h4>{{ game.title }}</h4>
                  <p>{{ game.totalAchievements }} achievements</p>
                </div>
              </div>
              
              <div class="user-progress">
                <div 
                  v-for="user in selectedUsers"
                  :key="`${user.id}-${game.id}`"
                  class="progress-cell"
                >
                  <div class="progress-bar">
                    <div 
                      class="progress-fill"
                      :style="{ width: `${getGameProgress(game)}%` }"
                    />
                  </div>
                  <div class="progress-text">
                    {{ game.unlockedCount || 0 }}/{{ game.totalAchievements }}
                    <span class="progress-percentage">({{ getGameProgress(game) }}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Achievement Highlights -->
        <section class="achievement-highlights">
          <h2>Rare Achievement Comparison</h2>
          <div class="highlights-grid">
            <div 
              v-for="achievement in rareAchievements"
              :key="achievement.id"
              class="achievement-highlight"
            >
              <div class="achievement-info">
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
                  <p class="rarity">{{ achievement.rarity.toFixed(1) }}% rarity</p>
                </div>
              </div>
              
              <div class="user-status">
                <div 
                  v-for="user in selectedUsers"
                  :key="`${user.id}-${achievement.id}`"
                  class="status-indicator"
                  :class="{ unlocked: achievement.unlocked }"
                >
                  <svg v-if="achievement.unlocked" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    
    <!-- User Selector Modal -->
    <Modal 
      v-if="showUserSelector"
      title="Add Users to Compare"
      @close="showUserSelector = false"
    >
      <div class="user-selector">
        <div class="search-section">
          <input
            v-model="userSearch"
            type="text"
            class="search-input"
            placeholder="Search for users..."
          />
        </div>
        
        <div class="users-list">
          <div 
            v-for="user in availableUsers"
            :key="user.id"
            class="user-item"
            @click="addUser(user)"
          >
            <UserAvatar :user="user" :size="40" />
            <div class="user-info">
              <h4>{{ user.displayName }}</h4>
              <p>{{ user.totals.achievementsUnlocked.toLocaleString() }} achievements</p>
            </div>
            <button class="add-btn">Add</button>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import type { User, Game, Achievement } from '@/types/domain'
import UserAvatar from '@/components/UserAvatar.vue'
import ProgressRing from '@/components/ProgressRing.vue'
import Modal from '@/components/Modal.vue'

// Import mock data
import usersData from '@/data/users.json'
import gamesData from '@/data/games.json'
import achievementsData from '@/data/achievements.json'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const selectedUsers = ref<User[]>([])
const showUserSelector = ref(false)
const userSearch = ref('')
const gameFilter = ref<'all' | 'common' | 'completed'>('all')

const availableUsers = computed(() => {
  const search = userSearch.value.toLowerCase()
  return usersData
    .filter(user => 
      !selectedUsers.value.some(selected => selected.id === user.id) &&
      user.displayName.toLowerCase().includes(search)
    )
    .slice(0, 10) // Limit results for performance
})

const filteredGames = computed(() => {
  switch (gameFilter.value) {
    case 'common':
      // Games that all selected users have
      return gamesData.filter(game => 
        selectedUsers.value.every(user => 
          // Simplified logic - in real app would check user's game library
          game.unlockedCount !== undefined && game.unlockedCount > 0
        )
      )
    case 'completed':
      // Games completed by at least one user
      return gamesData.filter(game => 
        game.unlockedCount === game.totalAchievements
      )
    default:
      return gamesData.slice(0, 20) // Limit for demo
  }
})

const rareAchievements = computed(() => {
  return achievementsData
    .filter(achievement => achievement.rarity < 10)
    .slice(0, 10)
})

const loadInitialUsers = () => {
  // Check for users in URL query params
  const usersParam = route.query.users as string
  if (usersParam) {
    const userIds = usersParam.split(',')
    const users = userIds
      .map(id => usersData.find(u => u.id === id))
      .filter(Boolean) as User[]
    
    selectedUsers.value = users
  }
  
  // If signed in and no users selected, add current user
  if (selectedUsers.value.length === 0 && userStore.currentUser) {
    const currentUser = usersData.find(u => u.id === userStore.currentUser?.id)
    if (currentUser) {
      selectedUsers.value.push(currentUser)
    }
  }
}

const addUser = (user: User) => {
  if (selectedUsers.value.length >= 4) {
    appStore.showWarning('Limit reached', 'You can compare up to 4 users at once')
    return
  }
  
  selectedUsers.value.push(user)
  showUserSelector.value = false
  updateUrl()
}

const removeUser = (user: User) => {
  const index = selectedUsers.value.findIndex(u => u.id === user.id)
  if (index !== -1) {
    selectedUsers.value.splice(index, 1)
    updateUrl()
  }
}

const updateUrl = () => {
  if (selectedUsers.value.length > 0) {
    const userIds = selectedUsers.value.map(u => u.id).join(',')
    router.replace({ 
      path: '/compare', 
      query: { users: userIds }
    })
  } else {
    router.replace({ path: '/compare' })
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

const getGameProgress = (game: Game) => {
  if (game.totalAchievements === 0) return 0
  return Math.round(((game.unlockedCount || 0) / game.totalAchievements) * 100)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const handleAchievementIconError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(() => {
  loadInitialUsers()
})
</script>

<style lang="less" scoped>
.compare-page {
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, @color-panel 0%, @color-panel-2 100%);
  border-bottom: 1px solid @color-border;
  
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
  
  .header-main {
    flex: 1;
    
    h1 {
      font-size: @font-size-3xl;
      font-weight: @font-weight-bold;
      color: @color-text;
      margin: 0 0 @space-2 0;
      line-height: @line-height-tight;
    }
    
    p {
      font-size: @font-size-lg;
      color: @color-text-dim;
      margin: 0;
      line-height: @line-height-normal;
    }
  }
  
  .header-actions {
    display: flex;
    gap: @space-3;
  }
}

.action-btn {
  .m-button-primary();
  
  .icon {
    width: 18px;
    height: 18px;
  }
}

.compare-content {
  padding: @space-8;
}

.auth-required, .empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.auth-card, .empty-card {
  .m-card();
  padding: @space-8;
  text-align: center;
  max-width: 400px;
  
  .auth-icon, .empty-icon {
    width: 64px;
    height: 64px;
    color: @color-text-dim;
    margin: 0 auto @space-4 auto;
  }
  
  h2 {
    font-size: @font-size-xl;
    font-weight: @font-weight-semibold;
    color: @color-text;
    margin: 0 0 @space-3 0;
  }
  
  p {
    color: @color-text-dim;
    margin: 0 0 @space-6 0;
    line-height: @line-height-normal;
  }
}

.btn-primary {
  .m-button-primary();
}

.comparison-view {
  max-width: 1200px;
  margin: 0 auto;
}

.users-header {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: @space-4;
  margin-bottom: @space-8;
  
  .user-header {
    .m-card();
    padding: @space-4;
    position: relative;
    
    .user-profile {
      display: flex;
      align-items: center;
      gap: @space-3;
      
      .user-info {
        flex: 1;
        
        h3 {
          font-size: @font-size-lg;
          font-weight: @font-weight-semibold;
          color: @color-text;
          margin: 0 0 @space-1 0;
        }
        
        p {
          font-size: @font-size-sm;
          color: @color-text-dim;
          margin: 0;
        }
      }
      
      .remove-user-btn {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: @color-text-dim;
        cursor: pointer;
        border-radius: @radius-sm;
        transition: all @transition-base @ease-out;
        
        svg {
          width: 16px;
          height: 16px;
        }
        
        &:hover {
          background: @color-error;
          color: @color-bg;
        }
      }
    }
  }
}

.stats-comparison, .games-comparison, .achievement-highlights {
  margin-bottom: @space-8;
  
  h2 {
    font-size: @font-size-2xl;
    font-weight: @font-weight-bold;
    color: @color-text;
    margin: 0 0 @space-6 0;
  }
}

.stats-grid {
  .m-card();
  overflow: hidden;
  
  .stat-row {
    display: grid;
    grid-template-columns: 200px repeat(auto-fit, minmax(120px, 1fr));
    gap: @space-4;
    padding: @space-4;
    align-items: center;
    border-bottom: 1px solid @color-border;
    
    &:last-child {
      border-bottom: none;
    }
    
    .stat-label {
      font-weight: @font-weight-semibold;
      color: @color-text;
    }
    
    .stat-value {
      text-align: center;
      font-size: @font-size-lg;
      font-weight: @font-weight-semibold;
      color: @color-accent;
      
      .completion-stat {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: @space-2;
      }
    }
  }
}

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
  
  .game-filters {
    display: flex;
    gap: @space-2;
    
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

.games-comparison-list {
  .m-card();
  overflow: hidden;
  
  .game-comparison-row {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: @space-4;
    padding: @space-4;
    border-bottom: 1px solid @color-border;
    align-items: center;
    
    @media (max-width: @screen-md) {
      grid-template-columns: 1fr;
      gap: @space-3;
    }
    
    &:last-child {
      border-bottom: none;
    }
    
    .game-info {
      display: flex;
      align-items: center;
      gap: @space-3;
      
      .game-image {
        width: 60px;
        height: 28px;
        object-fit: cover;
        border-radius: @radius-sm;
      }
      
      .game-placeholder {
        width: 60px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: @color-panel-2;
        border-radius: @radius-sm;
        color: @color-text-dim;
        
        svg {
          width: 16px;
          height: 16px;
        }
      }
      
      .game-details {
        h4 {
          font-size: @font-size-base;
          font-weight: @font-weight-semibold;
          color: @color-text;
          margin: 0 0 @space-1 0;
        }
        
        p {
          font-size: @font-size-sm;
          color: @color-text-dim;
          margin: 0;
        }
      }
    }
    
    .user-progress {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: @space-3;
      
      .progress-cell {
        .progress-bar {
          height: 8px;
          background: @color-panel-3;
          border-radius: @radius-sm;
          overflow: hidden;
          margin-bottom: @space-2;
          
          .progress-fill {
            height: 100%;
            background: @color-accent;
            transition: width @transition-slow @ease-out;
          }
        }
        
        .progress-text {
          font-size: @font-size-sm;
          color: @color-text;
          text-align: center;
          
          .progress-percentage {
            color: @color-text-dim;
          }
        }
      }
    }
  }
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: @space-4;
  
  .achievement-highlight {
    .m-card();
    padding: @space-4;
    
    .achievement-info {
      display: flex;
      gap: @space-3;
      margin-bottom: @space-3;
      
      .achievement-icon {
        width: 48px;
        height: 48px;
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
            width: 24px;
            height: 24px;
          }
        }
      }
      
      .achievement-details {
        flex: 1;
        
        h4 {
          font-size: @font-size-base;
          font-weight: @font-weight-semibold;
          color: @color-text;
          margin: 0 0 @space-1 0;
        }
        
        .game-title {
          font-size: @font-size-sm;
          color: @color-text-dim;
          margin: 0 0 @space-1 0;
        }
        
        .rarity {
          font-size: @font-size-xs;
          color: @color-accent;
          font-weight: @font-weight-medium;
          margin: 0;
        }
      }
    }
    
    .user-status {
      display: flex;
      justify-content: space-around;
      gap: @space-2;
      
      .status-indicator {
        width: 32px;
        height: 32px;
        border-radius: @radius-full;
        display: flex;
        align-items: center;
        justify-content: center;
        background: @color-panel-2;
        color: @color-text-dim;
        
        svg {
          width: 16px;
          height: 16px;
        }
        
        &.unlocked {
          background: @color-success;
          color: @color-bg;
        }
      }
    }
  }
}

.user-selector {
  .search-section {
    margin-bottom: @space-4;
    
    .search-input {
      .m-input();
    }
  }
  
  .users-list {
    max-height: 400px;
    overflow-y: auto;
    
    .user-item {
      display: flex;
      align-items: center;
      gap: @space-3;
      padding: @space-3;
      border-radius: @radius-md;
      cursor: pointer;
      transition: all @transition-base @ease-out;
      
      &:hover {
        background: fade(@color-accent, 5%);
      }
      
      .user-info {
        flex: 1;
        
        h4 {
          font-size: @font-size-base;
          font-weight: @font-weight-semibold;
          color: @color-text;
          margin: 0 0 @space-1 0;
        }
        
        p {
          font-size: @font-size-sm;
          color: @color-text-dim;
          margin: 0;
        }
      }
      
      .add-btn {
        .m-button-secondary();
        padding: @space-2 @space-3;
        font-size: @font-size-sm;
      }
    }
  }
}
</style>
