<template>
  <footer class="app-footer">
    <div class="app-footer__container">
      <div class="footer-content">
        <!-- Brand Section -->
        <div class="footer-section footer-brand">
          <div class="brand-logo">
            <!--<img src="/logo.svg" alt="Achievement Tracker" class="logo-image" />-->
            <span class="brand-name">Achievement Tracker</span>
          </div>
          <p class="brand-description">
            Track your gaming achievements across multiple platforms. 
            Steam, Xbox, PlayStation, and more - all in one place.
          </p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Follow us on Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" class="social-link" aria-label="Join our Discord">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.222 0c1.406 0 2.54 1.137 2.607 2.475V24l-2.677-2.273-1.47-1.338-1.604-1.398.67 2.205H3.71c-1.402 0-2.54-1.065-2.54-2.476V2.48C1.17 1.142 2.31.003 3.715.003h16.5L20.222 0zm-6.118 5.683h-.03l-.202.2c2.073.6 3.076 1.537 3.076 1.537-1.336-.668-2.54-1.002-3.744-1.137-.87-.135-1.74-.064-2.475 0h-.2c-.47 0-1.47.2-2.81.735-.467.203-.735.336-.735.336s1.002-1.002 3.21-1.537l-.135-.135s-1.672-.064-3.477 1.27c0 0-1.805 3.144-1.805 7.02 0 0 1 1.74 3.743 1.806 0 0 .4-.533.805-1.002-1.54-.4-2.14-1.270-2.14-1.270s.134.066.335.2h.06c.03 0 .044.015.06.03v.006c.016.016.03.03.06.03.33.136.66.27.93.4.466.202 1.065.403 1.8.536.93.135 1.996.2 3.21 0 .6-.135 1.2-.267 1.8-.535.39-.2.87-.4 1.397-.737 0 0-.6.87-2.205 1.305.33.466.795 1 .795 1 2.744-.06 3.81-1.8 3.87-1.726 0-3.87-1.815-7.02-1.815-7.02-1.635-1.214-3.165-1.26-3.435-1.26l.056-.02z"/>
              </svg>
            </a>
            <a href="#" class="social-link" aria-label="Star us on GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
        
        <!-- Platform Links -->
        <div class="footer-section">
          <h3 class="section-title">Platforms</h3>
          <ul class="footer-links">
            <li><router-link to="/platforms" class="footer-link">All Platforms</router-link></li>
            <li><a href="#" class="footer-link">Steam Integration</a></li>
            <li><a href="#" class="footer-link">Xbox Live</a></li>
            <li><a href="#" class="footer-link">PlayStation Network</a></li>
            <li><a href="#" class="footer-link">Epic Games Store</a></li>
            <li><a href="#" class="footer-link">GOG Galaxy</a></li>
          </ul>
        </div>
        
        <!-- Features -->
        <div class="footer-section">
          <h3 class="section-title">Features</h3>
          <ul class="footer-links">
            <li><router-link to="/search" class="footer-link">Game Browser</router-link></li>
            <li><router-link to="/collections" class="footer-link">Collections</router-link></li>
            <li><router-link to="/compare" class="footer-link">Progress Compare</router-link></li>
            <li><a href="#" class="footer-link">Achievement Guides</a></li>
            <li><a href="#" class="footer-link">Statistics</a></li>
            <li><a href="#" class="footer-link">Export Data</a></li>
          </ul>
        </div>
        
        <!-- Support -->
        <div class="footer-section">
          <h3 class="section-title">Support</h3>
          <ul class="footer-links">
            <li><a href="#" class="footer-link">Help Center</a></li>
            <li><a href="#" class="footer-link">Contact Us</a></li>
            <li><a href="#" class="footer-link">Bug Reports</a></li>
            <li><a href="#" class="footer-link">Feature Requests</a></li>
            <li><a href="#" class="footer-link">API Documentation</a></li>
            <li><a href="#" class="footer-link">Status Page</a></li>
          </ul>
        </div>
      </div>
      
      <!-- Platform Badges -->
      <div class="platform-badges-section">
        <div class="platform-badges">
          <PlatformBadge
            v-for="platform in platforms"
            :key="platform.id"
            :platform-id="platform.id"
            size="medium"
            variant="outlined"
          />
        </div>
      </div>
      
      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="footer-bottom__content">
          <div class="copyright">
            <p>&copy; {{ currentYear }} Achievement Tracker. All rights reserved.</p>
            <p class="disclaimer">
              Game data provided by SteamHunters, MetaGamerScore, Exophase, and other platforms.
            </p>
          </div>
          
          <div class="legal-links">
            <a href="#" class="legal-link">Privacy Policy</a>
            <span class="separator">•</span>
            <a href="#" class="legal-link">Terms of Service</a>
            <span class="separator">•</span>
            <a href="#" class="legal-link">Cookie Policy</a>
            <span class="separator">•</span>
            <button class="legal-link theme-toggle" @click="appStore.toggleTheme">
              {{ appStore.theme === 'dark' ? 'High Contrast' : 'Dark Theme' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useGamesStore } from '@/stores/games'
import PlatformBadge from './PlatformBadge.vue'

const appStore = useAppStore()
const gamesStore = useGamesStore()

const currentYear = computed(() => new Date().getFullYear())

const platforms = computed(() => gamesStore.platforms)

onMounted(async () => {
  // Load platforms if not already loaded
  if (platforms.value.length === 0) {
    try {
      const { getPlatforms } = await import('@/services/api')
      const platformData = await getPlatforms()
      gamesStore.setPlatforms(platformData)
    } catch (error) {
      console.error('Failed to load platforms for footer:', error)
    }
  }
})
</script>

<style lang="less" scoped>
.app-footer {
  background: @color-panel-3;
  border-top: 1px solid @color-border;
  margin-top: auto;
  
  &__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: @space-8 @space-4 @space-4;
    
    @media (min-width: @screen-lg) {
      padding: @space-12 @space-6 @space-6;
    }
  }
}

.footer-content {
  display: grid;
  gap: @space-8;
  margin-bottom: @space-8;
  
  @media (min-width: @screen-sm) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: @screen-md) {
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: @space-4;
}

.footer-brand {
  .brand-logo {
    display: flex;
    align-items: center;
    gap: @space-3;
    margin-bottom: @space-3;
    
    .logo-image {
      width: 32px;
      height: 32px;
    }
    
    .brand-name {
      font-size: @font-size-lg;
      font-weight: @font-weight-semibold;
      color: @color-text;
    }
  }
  
  .brand-description {
    color: @color-text-dim;
    font-size: @font-size-sm;
    line-height: @line-height-relaxed;
    margin: 0 0 @space-4;
  }
  
  .social-links {
    display: flex;
    gap: @space-3;
    
    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: fade(@color-panel, 60%);
      border: 1px solid @color-border;
      border-radius: @radius-md;
      color: @color-text-dim;
      text-decoration: none;
      transition: all @transition-base @ease-out;
      
      svg {
        width: 20px;
        height: 20px;
      }
      
      &:hover {
        background: @color-accent;
        border-color: @color-accent;
        color: @color-bg;
        transform: translateY(-2px);
      }
    }
  }
}

.section-title {
  font-size: @font-size-base;
  font-weight: @font-weight-semibold;
  color: @color-text;
  margin: 0 0 @space-3;
}

.footer-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: @space-2;
  
  .footer-link {
    color: @color-text-dim;
    text-decoration: none;
    font-size: @font-size-sm;
    transition: color @transition-base @ease-out;
    
    &:hover {
      color: @color-accent;
    }
  }
}

.platform-badges-section {
  padding: @space-6 0;
  border-top: 1px solid @color-border;
  border-bottom: 1px solid @color-border;
  
  .platform-badges {
    display: flex;
    flex-wrap: wrap;
    gap: @space-3;
    justify-content: center;
    
    @media (min-width: @screen-md) {
      justify-content: flex-start;
    }
  }
}

.footer-bottom {
  padding-top: @space-6;
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: @space-4;
    
    @media (min-width: @screen-md) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
}

.copyright {
  color: @color-text-dim;
  font-size: @font-size-sm;
  
  p {
    margin: 0 0 @space-1;
  }
  
  .disclaimer {
    font-size: @font-size-xs;
    opacity: 0.8;
  }
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: @space-2;
  font-size: @font-size-sm;
  
  .legal-link {
    color: @color-text-dim;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    font-size: inherit;
    font-family: inherit;
    transition: color @transition-base @ease-out;
    
    &:hover {
      color: @color-accent;
    }
  }
  
  .separator {
    color: @color-text-muted;
    margin: 0 @space-1;
  }
  
  .theme-toggle {
    &:hover {
      color: @color-accent;
    }
  }
}

// High contrast theme
.theme-contrast & {
  .app-footer {
    background: @color-contrast-panel;
    border-top-color: @color-contrast-border;
  }
  
  .platform-badges-section {
    border-top-color: @color-contrast-border;
    border-bottom-color: @color-contrast-border;
  }
  
  .social-link {
    background: fade(@color-contrast-panel, 60%);
    border-color: @color-contrast-border;
    
    &:hover {
      background: @color-contrast-accent;
      border-color: @color-contrast-accent;
      color: @color-contrast-bg;
    }
  }
}

// Dark mode specific adjustments
@media (max-width: @screen-sm) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .footer-brand .social-links {
    justify-content: center;
  }
  
  .legal-links {
    justify-content: center;
  }
}
</style>
