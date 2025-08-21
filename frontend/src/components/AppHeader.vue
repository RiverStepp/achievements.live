<template>
  <header class="app-header" :class="{ 'sidebar-open': appStore.sidebarOpen }">
    <div class="app-header__container">
      <!-- Logo and Title -->
      <div class="app-header__brand">
        <button
          class="app-header__menu-toggle md:hidden"
          @click="appStore.toggleSidebar"
          aria-label="Toggle navigation menu"
        >
          <span class="menu-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        
        <router-link to="/" class="app-header__logo">
          <!--<img src="/logo.svg" alt="Achievement Tracker" class="logo-image" />-->
          <span class="logo-text">Achievement Tracker</span>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="app-header__nav" role="navigation">
        <ul class="nav-list">
          <li>
            <router-link 
              to="/" 
              class="nav-link"
              :class="{ active: $route.name === 'Home' }"
            >
              Home
            </router-link>
          </li>
          <li>
            <router-link 
              to="/search" 
              class="nav-link"
              :class="{ active: $route.name === 'Search' }"
            >
              Browse
            </router-link>
          </li>
          <li>
            <router-link 
              to="/platforms" 
              class="nav-link"
              :class="{ active: $route.name === 'Platforms' }"
            >
              Platforms
            </router-link>
          </li>
          <li v-if="userStore.isAuthenticated">
            <router-link 
              to="/collections" 
              class="nav-link"
              :class="{ active: $route.name === 'Collections' }"
            >
              Collections
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Search Bar (Compact) -->
      <div class="app-header__search">
        <SearchBar compact />
      </div>

      <!-- Actions -->
      <div class="app-header__actions">
        <!-- Theme Toggle -->
        <button
          class="action-button theme-toggle"
          @click="appStore.toggleTheme"
          :aria-label="`Switch to ${appStore.theme === 'dark' ? 'high contrast' : 'dark'} theme`"
          :title="`Switch to ${appStore.theme === 'dark' ? 'high contrast' : 'dark'} theme`"
        >
          <svg v-if="appStore.theme === 'dark'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>

        <!-- User Menu -->
        <div class="user-menu" v-if="userStore.isAuthenticated">
          <button
            class="action-button user-button"
            @click="toggleUserMenu"
            :aria-expanded="showUserMenu"
            aria-haspopup="true"
          >
            <UserAvatar 
              :user="userStore.currentUser!" 
              :size="32"
              class="user-avatar"
            />
            <span class="sr-only">User menu</span>
          </button>
          
          <div v-if="showUserMenu" class="user-dropdown" @click="closeUserMenu">
            <div class="dropdown-header">
              <UserAvatar :user="userStore.currentUser!" :size="40" />
              <div class="user-info">
                <div class="user-name">{{ userStore.currentUser!.displayName }}</div>
                <div class="user-stats text-dim">
                  {{ userStore.currentUser!.totals.gamesTracked }} games tracked
                </div>
              </div>
            </div>
            
            <hr class="dropdown-divider" />
            
            <router-link 
              :to="`/user/${userStore.currentUser!.id}`" 
              class="dropdown-item"
            >
              View Profile
            </router-link>
            <router-link to="/collections" class="dropdown-item">
              My Collections
            </router-link>
            <button class="dropdown-item" @click="handleSignOut">
              Sign Out
            </button>
          </div>
        </div>

        <!-- Sign In Button -->
        <button 
          v-else
          class="sign-in-button"
          @click="handleSignIn"
        >
          Sign In
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Overlay -->
    <div 
      v-if="appStore.sidebarOpen"
      class="mobile-overlay"
      @click="appStore.closeSidebar"
    ></div>

    <!-- Mobile Navigation -->
    <nav 
      v-if="appStore.sidebarOpen"
      class="mobile-nav"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div class="mobile-nav__header">
        <h2 class="mobile-nav__title">Navigation</h2>
        <button
          class="mobile-nav__close"
          @click="appStore.closeSidebar"
          aria-label="Close navigation menu"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <ul class="mobile-nav__list">
        <li>
          <router-link to="/" class="mobile-nav__link" @click="appStore.closeSidebar">
            Home
          </router-link>
        </li>
        <li>
          <router-link to="/search" class="mobile-nav__link" @click="appStore.closeSidebar">
            Browse Games
          </router-link>
        </li>
        <li>
          <router-link to="/platforms" class="mobile-nav__link" @click="appStore.closeSidebar">
            Platforms
          </router-link>
        </li>
        <li v-if="userStore.isAuthenticated">
          <router-link to="/collections" class="mobile-nav__link" @click="appStore.closeSidebar">
            My Collections
          </router-link>
        </li>
        <li v-if="userStore.isAuthenticated">
          <router-link 
            :to="`/user/${userStore.currentUser!.id}`" 
            class="mobile-nav__link" 
            @click="appStore.closeSidebar"
          >
            My Profile
          </router-link>
        </li>
        <li v-if="!userStore.isAuthenticated">
          <button class="mobile-nav__link" @click="handleSignIn">
            Sign In
          </button>
        </li>
        <li v-else>
          <button class="mobile-nav__link" @click="handleSignOut">
            Sign Out
          </button>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import SearchBar from './SearchBar.vue'
import UserAvatar from './UserAvatar.vue'

const appStore = useAppStore()
const userStore = useUserStore()

const showUserMenu = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const handleSignIn = () => {
  // Mock sign in - in a real app this would open a modal or redirect
  const mockUser = {
    displayName: 'Demo User',
    avatar: '/images/avatars/demo.jpg',
    country: 'US',
    bio: 'Achievement hunter and gamer',
    platformIds: ['steam', 'xbox'] as const,
    totals: {
      gamesTracked: 42,
      achievementsUnlocked: 1337,
      completionRate: 85.2,
      hoursPlayed: 2048
    }
  }
  
  userStore.signIn(mockUser)
  appStore.showSuccess('Welcome back!', 'Successfully signed in')
  closeUserMenu()
  appStore.closeSidebar()
}

const handleSignOut = () => {
  userStore.signOut()
  appStore.showInfo('Signed out', 'You have been signed out successfully')
  closeUserMenu()
  appStore.closeSidebar()
}

// Handle keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Close user menu on Escape
  if (event.key === 'Escape' && showUserMenu.value) {
    closeUserMenu()
  }
  
  // Focus search on '/' key
  if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
    const searchInput = document.querySelector('.search-bar input') as HTMLInputElement
    if (searchInput && document.activeElement !== searchInput) {
      event.preventDefault()
      searchInput.focus()
    }
  }
}

// Close user menu when clicking outside
const handleClickOutside = (event: Event) => {
  const userMenu = document.querySelector('.user-menu')
  if (userMenu && !userMenu.contains(event.target as Node)) {
    closeUserMenu()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="less" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: @z-sticky;
  background: fade(@color-panel, 95%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid @color-border;
  
  &__container {
    display: flex;
    align-items: center;
    gap: @space-4;
    max-width: 1400px;
    margin: 0 auto;
    padding: @space-3 @space-4;
    
    @media (min-width: @screen-lg) {
      padding: @space-4 @space-6;
    }
  }
  
  &__brand {
    display: flex;
    align-items: center;
    gap: @space-3;
    flex-shrink: 0;
  }
  
  &__menu-toggle {
    .m-button-ghost();
    padding: @space-2;
    
    .menu-icon {
      display: flex;
      flex-direction: column;
      gap: 3px;
      width: 18px;
      
      span {
        height: 2px;
        background: currentColor;
        border-radius: 1px;
        transition: all @transition-base @ease-out;
      }
    }
    
    &:hover .menu-icon span {
      background: @color-accent;
    }
  }
  
  &__logo {
    display: flex;
    align-items: center;
    gap: @space-3;
    text-decoration: none;
    color: @color-text;
    font-weight: @font-weight-semibold;
    font-size: @font-size-lg;
    transition: color @transition-base @ease-out;
    
    &:hover {
      color: @color-accent;
    }
    
    .logo-image {
      width: 32px;
      height: 32px;
    }
    
    .logo-text {
      @media (max-width: @screen-sm) {
        display: none;
      }
    }
  }
  
  &__nav {
    flex: 1;
    
    @media (max-width: @screen-md) {
      display: none;
    }
    
    .nav-list {
      display: flex;
      gap: @space-2;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .nav-link {
      .m-button-ghost();
      color: @color-text-dim;
      text-decoration: none;
      
      &:hover {
        color: @color-text;
        background: fade(@color-accent, 10%);
      }
      
      &.active {
        color: @color-accent;
        background: fade(@color-accent, 15%);
      }
    }
  }
  
  &__search {
    flex: 1;
    max-width: 400px;
    
    @media (max-width: @screen-md) {
      display: none;
    }
  }
  
  &__actions {
    display: flex;
    align-items: center;
    gap: @space-2;
    flex-shrink: 0;
  }
}

.action-button {
  .m-button-ghost();
  padding: @space-2;
  
  .icon {
    width: 20px;
    height: 20px;
  }
}

.theme-toggle {
  .icon {
    transition: transform @transition-base @ease-out;
  }
  
  &:hover .icon {
    transform: rotate(15deg);
  }
}

.user-menu {
  position: relative;
}

.user-button {
  padding: @space-1;
  border-radius: @radius-full;
  
  .user-avatar {
    border: 2px solid transparent;
    transition: border-color @transition-base @ease-out;
  }
  
  &:hover .user-avatar {
    border-color: @color-accent;
  }
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 240px;
  margin-top: @space-2;
  .m-card();
  z-index: @z-dropdown;
  
  .dropdown-header {
    display: flex;
    align-items: center;
    gap: @space-3;
    padding: @space-4;
    
    .user-info {
      flex: 1;
      min-width: 0;
      
      .user-name {
        font-weight: @font-weight-medium;
        overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
      }
      
      .user-stats {
        font-size: @font-size-sm;
        overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
      }
    }
  }
  
  .dropdown-divider {
    margin: 0;
    border: none;
    border-top: 1px solid @color-border;
  }
  
  .dropdown-item {
    display: block;
    width: 100%;
    padding: @space-3 @space-4;
    color: @color-text;
    text-decoration: none;
    background: none;
    border: none;
    text-align: left;
    font-size: @font-size-sm;
    cursor: pointer;
    transition: all @transition-base @ease-out;
    
    &:hover {
      background: fade(@color-accent, 10%);
      color: @color-accent;
    }
    
    &:first-of-type {
      border-radius: 0;
    }
    
    &:last-of-type {
      border-radius: 0 0 @radius-xl @radius-xl;
    }
  }
}

.sign-in-button {
  .m-button-primary();
  font-size: @font-size-sm;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: @z-modal-backdrop;
  
  @media (min-width: @screen-md) {
    display: none;
  }
}

.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: @color-panel;
  border-right: 1px solid @color-border;
  z-index: @z-modal;
  transform: translateX(0);
  animation: slideInLeft @transition-base @ease-out;
  
  @media (min-width: @screen-md) {
    display: none;
  }
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: @space-4;
    border-bottom: 1px solid @color-border;
  }
  
  &__title {
    font-size: @font-size-lg;
    font-weight: @font-weight-semibold;
    margin: 0;
  }
  
  &__close {
    .m-button-ghost();
    padding: @space-2;
    
    .icon {
      width: 20px;
      height: 20px;
    }
  }
  
  &__list {
    list-style: none;
    margin: 0;
    padding: @space-4 0;
  }
  
  &__link {
    display: block;
    width: 100%;
    padding: @space-3 @space-4;
    color: @color-text;
    text-decoration: none;
    background: none;
    border: none;
    text-align: left;
    font-size: @font-size-base;
    cursor: pointer;
    transition: all @transition-base @ease-out;
    
    &:hover {
      background: fade(@color-accent, 10%);
      color: @color-accent;
    }
    
    &.router-link-active {
      background: fade(@color-accent, 15%);
      color: @color-accent;
      border-right: 3px solid @color-accent;
    }
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

// High contrast theme adjustments
.theme-contrast & {
  .app-header {
    background: @color-contrast-panel;
    border-bottom-color: @color-contrast-border;
  }
  
  .action-button,
  .nav-link {
    &:hover {
      background: fade(@color-contrast-accent, 20%);
    }
  }
  
  .user-dropdown,
  .mobile-nav {
    background: @color-contrast-panel;
    border-color: @color-contrast-border;
  }
}
</style>
