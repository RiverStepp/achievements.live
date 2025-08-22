<template>
  <div class="collections-page">
    <!-- Page Header -->
    <section class="page-header">
      <div class="header-content">
        <div class="header-main">
          <h1>Game Collections</h1>
          <p>Organize your games into custom collections and track your progress</p>
        </div>
        
        <div class="header-actions">
          <button class="action-btn create-btn" @click="showCreateModal = true">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Collection
          </button>
        </div>
      </div>
    </section>
    
    <!-- Collections Content -->
    <div class="collections-content">
      <div v-if="!userStore.isAuthenticated" class="auth-required">
        <div class="auth-card">
          <svg class="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            <path d="M3 12h6m12 0h-6"/>
          </svg>
          <h2>Sign In Required</h2>
          <p>You need to sign in to create and manage game collections.</p>
          <button class="btn-primary" @click="userStore.signIn()">Sign In</button>
        </div>
      </div>
      
      <div v-else-if="collections.length === 0" class="empty-state">
        <div class="empty-card">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <path d="M9 14h6"/>
          </svg>
          <h2>No Collections Yet</h2>
          <p>Create your first collection to organize your games by genre, completion status, or any way you like.</p>
          <button class="btn-primary" @click="showCreateModal = true">Create Your First Collection</button>
        </div>
      </div>
      
      <div v-else class="collections-grid">
        <div 
          v-for="collection in collections"
          :key="collection.id"
          class="collection-card"
          @click="viewCollection(collection)"
        >
          <div class="collection-preview">
            <div class="preview-games">
              <div 
                v-for="game in getCollectionPreviewGames(collection)"
                :key="game.id"
                class="preview-game"
              >
                <img 
                  v-if="game.capsuleImage"
                  :src="game.capsuleImage"
                  :alt="game.title"
                  @error="handleImageError"
                />
                <div v-else class="game-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                </div>
              </div>
              
              <div v-if="collection.gameIds.length > 4" class="preview-more">
                +{{ collection.gameIds.length - 4 }}
              </div>
            </div>
          </div>
          
          <div class="collection-content">
            <div class="collection-header">
              <h3 class="collection-name">{{ collection.name }}</h3>
              <div class="collection-meta">
                <span class="game-count">{{ collection.gameIds.length }} games</span>
                <span v-if="!collection.isPublic" class="privacy-badge">Private</span>
              </div>
            </div>
            
            <p v-if="collection.description" class="collection-description">
              {{ collection.description }}
            </p>
            
            <div class="collection-stats">
              <div class="stat-item">
                <span class="stat-label">Completed:</span>
                <span class="stat-value">{{ getCompletedGamesCount(collection) }}/{{ collection.gameIds.length }}</span>
              </div>
              
              <div class="stat-item">
                <span class="stat-label">Progress:</span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${getCollectionProgress(collection)}%` }"
                  />
                </div>
                <span class="stat-value">{{ getCollectionProgress(collection) }}%</span>
              </div>
            </div>
            
            <div class="collection-actions">
              <button 
                class="action-btn edit-btn"
                @click.stop="editCollection(collection)"
              >
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
              
              <button 
                class="action-btn delete-btn"
                @click.stop="deleteCollection(collection)"
              >
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Collection Modal -->
    <Modal 
      v-if="showCreateModal || editingCollection"
      :title="editingCollection ? 'Edit Collection' : 'Create Collection'"
      @close="closeModal"
    >
      <form @submit.prevent="saveCollection" class="collection-form">
        <div class="form-group">
          <label for="collection-name">Collection Name</label>
          <input
            id="collection-name"
            v-model="collectionForm.name"
            type="text"
            class="form-input"
            placeholder="Enter collection name"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="collection-description">Description (Optional)</label>
          <textarea
            id="collection-description"
            v-model="collectionForm.description"
            class="form-textarea"
            placeholder="Describe your collection"
            rows="3"
          />
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="collectionForm.isPublic"
              type="checkbox"
              class="form-checkbox"
            />
            <span class="checkbox-text">Make collection public</span>
            <span class="checkbox-description">Other users can view this collection</span>
          </label>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
          <button type="submit" class="btn-primary">
            {{ editingCollection ? 'Update Collection' : 'Create Collection' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import type { Collection, Game } from '@/types/domain'
import Modal from '@/components/Modal.vue'

// Import mock data
import gamesData from '@/data/games.json'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const showCreateModal = ref(false)
const editingCollection = ref<Collection | null>(null)
const collections = ref<Collection[]>([])

const collectionForm = ref({
  name: '',
  description: '',
  isPublic: false
})

// Mock collections data
const mockCollections: Collection[] = [
  {
    id: 'collection-1',
    name: 'RPG Masterpieces',
    description: 'The greatest role-playing games of all time',
    gameIds: ['1245620', '1086940', '1091500'],
    isPublic: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'collection-2', 
    name: 'Indie Gems',
    description: 'Hidden indie games worth playing',
    gameIds: ['892970', '1623730', '431960', '105600'],
    isPublic: false,
    createdAt: '2024-02-01T12:00:00Z',
    updatedAt: '2024-02-10T16:45:00Z'
  },
  {
    id: 'collection-3',
    name: 'Completed 100%',
    description: 'Games I have fully completed',
    gameIds: ['1426210', '431960'],
    isPublic: true,
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: '2024-03-01T11:20:00Z'
  },
  {
    id: 'collection-4',
    name: 'Competitive Games',
    description: 'Games for competitive multiplayer',
    gameIds: ['570', '730'],
    isPublic: false,
    createdAt: '2024-03-01T15:30:00Z',
    updatedAt: '2024-03-05T18:15:00Z'
  }
]

const loadCollections = () => {
  if (userStore.isAuthenticated) {
    // In a real app, this would fetch from API
    collections.value = mockCollections
  } else {
    collections.value = []
  }
}

const getCollectionPreviewGames = (collection: Collection) => {
  return collection.gameIds
    .slice(0, 4)
    .map(id => gamesData.find(g => g.id === id))
    .filter(Boolean) as Game[]
}

const getCompletedGamesCount = (collection: Collection) => {
  return collection.gameIds.reduce((count, gameId) => {
    const game = gamesData.find(g => g.id === gameId)
    if (game && (game.unlockedCount || 0) === game.totalAchievements) {
      return count + 1
    }
    return count
  }, 0)
}

const getCollectionProgress = (collection: Collection) => {
  if (collection.gameIds.length === 0) return 0
  
  const totalAchievements = collection.gameIds.reduce((sum, gameId) => {
    const game = gamesData.find(g => g.id === gameId)
    return sum + (game?.totalAchievements || 0)
  }, 0)
  
  const unlockedAchievements = collection.gameIds.reduce((sum, gameId) => {
    const game = gamesData.find(g => g.id === gameId)
    return sum + (game?.unlockedCount || 0)
  }, 0)
  
  return Math.round((unlockedAchievements / totalAchievements) * 100) || 0
}

const viewCollection = (collection: Collection) => {
  // In a real app, this would navigate to a detailed collection view
  appStore.showInfo('Collection View', `Viewing collection: ${collection.name}`)
}

const editCollection = (collection: Collection) => {
  editingCollection.value = collection
  collectionForm.value = {
    name: collection.name,
    description: collection.description || '',
    isPublic: collection.isPublic
  }
}

const deleteCollection = (collection: Collection) => {
  if (confirm(`Are you sure you want to delete "${collection.name}"?`)) {
    const index = collections.value.findIndex(c => c.id === collection.id)
    if (index !== -1) {
      collections.value.splice(index, 1)
      appStore.showSuccess('Collection deleted', `"${collection.name}" has been deleted`)
    }
  }
}

const saveCollection = () => {
  if (!collectionForm.value.name.trim()) {
    appStore.showError('Invalid input', 'Collection name is required')
    return
  }
  
  if (editingCollection.value) {
    // Update existing collection
    const index = collections.value.findIndex(c => c.id === editingCollection.value!.id)
    if (index !== -1) {
      collections.value[index] = {
        ...collections.value[index],
        name: collectionForm.value.name.trim(),
        description: collectionForm.value.description.trim(),
        isPublic: collectionForm.value.isPublic,
        updatedAt: new Date().toISOString()
      }
      appStore.showSuccess('Collection updated', `"${collectionForm.value.name}" has been updated`)
    }
  } else {
    // Create new collection
    const newCollection: Collection = {
      id: `collection-${Date.now()}`,
      name: collectionForm.value.name.trim(),
      description: collectionForm.value.description.trim(),
      gameIds: [],
      isPublic: collectionForm.value.isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    collections.value.unshift(newCollection)
    appStore.showSuccess('Collection created', `"${collectionForm.value.name}" has been created`)
  }
  
  closeModal()
}

const closeModal = () => {
  showCreateModal.value = false
  editingCollection.value = null
  collectionForm.value = {
    name: '',
    description: '',
    isPublic: false
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

onMounted(() => {
  loadCollections()
})
</script>

<style lang="less" scoped>
.collections-page {
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
  .m-button-secondary();
  
  .icon {
    width: 18px;
    height: 18px;
  }
  
  &.create-btn {
    .m-button-primary();
  }
  
  &.edit-btn {
    padding: @space-2 @space-3;
    font-size: @font-size-sm;
  }
  
  &.delete-btn {
    padding: @space-2 @space-3;
    font-size: @font-size-sm;
    color: @color-error;
    border-color: @color-error;
    
    &:hover {
      background: @color-error;
      color: @color-bg;
    }
  }
}

.collections-content {
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

.btn-secondary {
  .m-button-secondary();
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: @space-6;
}

.collection-card {
  .m-card-hover();
  overflow: hidden;
  cursor: pointer;
}

.collection-preview {
  height: 120px;
  background: @color-panel-2;
  position: relative;
  overflow: hidden;
  
  .preview-games {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    height: 100%;
    
    .preview-game {
      position: relative;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform @transition-base @ease-out;
      }
      
      .game-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: @color-panel-3;
        color: @color-text-dim;
        
        svg {
          width: 24px;
          height: 24px;
        }
      }
    }
    
    .preview-more {
      position: absolute;
      bottom: 0;
      right: 0;
      background: fade(@color-bg, 80%);
      color: @color-text;
      padding: @space-1 @space-2;
      font-size: @font-size-xs;
      font-weight: @font-weight-semibold;
      backdrop-filter: blur(4px);
    }
  }
}

.collection-content {
  padding: @space-4;
  
  .collection-header {
    margin-bottom: @space-3;
    
    .collection-name {
      font-size: @font-size-lg;
      font-weight: @font-weight-semibold;
      color: @color-text;
      margin: 0 0 @space-2 0;
      line-height: @line-height-tight;
    }
    
    .collection-meta {
      display: flex;
      align-items: center;
      gap: @space-3;
      
      .game-count {
        font-size: @font-size-sm;
        color: @color-text-dim;
      }
      
      .privacy-badge {
        font-size: @font-size-xs;
        color: @color-warning;
        background: fade(@color-warning, 10%);
        padding: @space-1 @space-2;
        border-radius: @radius-sm;
        font-weight: @font-weight-medium;
      }
    }
  }
  
  .collection-description {
    color: @color-text-dim;
    font-size: @font-size-sm;
    margin: 0 0 @space-4 0;
    line-height: @line-height-normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  
  .collection-stats {
    margin-bottom: @space-4;
    
    .stat-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: @space-2;
      font-size: @font-size-sm;
      
      .stat-label {
        color: @color-text-dim;
      }
      
      .stat-value {
        color: @color-text;
        font-weight: @font-weight-medium;
      }
      
      .progress-bar {
        flex: 1;
        height: 6px;
        background: @color-panel-3;
        border-radius: @radius-sm;
        margin: 0 @space-3;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: @color-accent;
          transition: width @transition-slow @ease-out;
        }
      }
    }
  }
  
  .collection-actions {
    display: flex;
    gap: @space-2;
    padding-top: @space-3;
    border-top: 1px solid @color-border;
  }
}

.collection-form {
  .form-group {
    margin-bottom: @space-4;
    
    label {
      display: block;
      font-size: @font-size-sm;
      font-weight: @font-weight-medium;
      color: @color-text;
      margin-bottom: @space-2;
    }
    
    .form-input, .form-textarea {
      .m-input();
    }
    
    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }
    
    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: @space-3;
      cursor: pointer;
      
      .form-checkbox {
        margin-top: 2px;
        accent-color: @color-accent;
      }
      
      .checkbox-text {
        font-weight: @font-weight-medium;
        color: @color-text;
      }
      
      .checkbox-description {
        display: block;
        font-size: @font-size-xs;
        color: @color-text-dim;
        margin-top: @space-1;
      }
    }
  }
  
  .form-actions {
    display: flex;
    gap: @space-3;
    justify-content: flex-end;
    padding-top: @space-4;
    border-top: 1px solid @color-border;
  }
}
</style>
