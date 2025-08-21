<template>
  <teleport to="body">
    <div 
      v-if="open"
      class="modal-overlay"
      :class="{ 'modal-overlay--no-backdrop': !showBackdrop }"
      @click="handleBackdropClick"
      @keydown.esc="handleEscape"
    >
      <div 
        ref="modalRef"
        class="modal"
        :class="[
          `modal--${size}`,
          { 'modal--full-screen': fullScreen }
        ]"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        @click.stop
      >
        <!-- Modal Header -->
        <header v-if="$slots.header || title || closable" class="modal__header">
          <slot name="header">
            <h2 v-if="title" :id="titleId" class="modal__title">{{ title }}</h2>
          </slot>
          
          <button
            v-if="closable"
            class="modal__close"
            @click="handleClose"
            :aria-label="closeAriaLabel"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </header>
        
        <!-- Modal Body -->
        <div class="modal__body" :id="descriptionId">
          <slot></slot>
        </div>
        
        <!-- Modal Footer -->
        <footer v-if="$slots.footer" class="modal__footer">
          <slot name="footer"></slot>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useFocusTrap } from '@/composables/useKeyboardNav'

interface Props {
  open: boolean
  title?: string
  size?: 'small' | 'medium' | 'large' | 'extra-large'
  fullScreen?: boolean
  closable?: boolean
  showBackdrop?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  closeAriaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  fullScreen: false,
  closable: true,
  showBackdrop: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  closeAriaLabel: 'Close dialog'
})

const emit = defineEmits<{
  close: []
  'before-close': []
  'after-open': []
}>()

const modalRef = ref<HTMLElement>()
const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`
const descriptionId = `modal-description-${Math.random().toString(36).substr(2, 9)}`

// Focus trap for accessibility
const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } = useFocusTrap(modalRef, {
  immediate: false,
  restoreFocus: true
})

const handleClose = () => {
  emit('before-close')
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleClose()
  }
}

const handleEscape = () => {
  if (props.closeOnEscape) {
    handleClose()
  }
}

// Handle body scroll lock
const lockBodyScroll = () => {
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
  document.body.style.overflow = 'hidden'
  document.body.style.paddingRight = `${scrollBarWidth}px`
}

const unlockBodyScroll = () => {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}

// Watch for open state changes
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    lockBodyScroll()
    await nextTick()
    activateFocusTrap()
    emit('after-open')
  } else {
    unlockBodyScroll()
    deactivateFocusTrap()
  }
}, { immediate: true })

// Cleanup on unmount
onUnmounted(() => {
  if (props.open) {
    unlockBodyScroll()
    deactivateFocusTrap()
  }
})

// Handle initial mount
onMounted(() => {
  if (props.open) {
    lockBodyScroll()
    nextTick(() => {
      activateFocusTrap()
    })
  }
})
</script>

<style lang="less" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: @z-modal;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: @space-4;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  animation: fadeIn @transition-base @ease-out;
  
  &--no-backdrop {
    background: transparent;
    backdrop-filter: none;
  }
  
  @media (max-width: @screen-sm) {
    padding: @space-2;
    align-items: flex-end;
    
    .modal {
      margin-bottom: 0;
    }
  }
}

.modal {
  .m-card();
  width: 100%;
  max-height: calc(100vh - @space-8);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideInUp @transition-base @ease-out;
  
  &--small {
    max-width: 400px;
  }
  
  &--medium {
    max-width: 600px;
  }
  
  &--large {
    max-width: 800px;
  }
  
  &--extra-large {
    max-width: 1200px;
  }
  
  &--full-screen {
    max-width: none;
    max-height: none;
    height: 100vh;
    border-radius: 0;
    
    @media (min-width: @screen-md) {
      height: calc(100vh - @space-8);
      border-radius: @radius-xl;
    }
  }
  
  @media (max-width: @screen-sm) {
    max-height: 85vh;
    border-radius: @radius-xl @radius-xl 0 0;
  }
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-4;
  padding: @space-6 @space-6 0;
  flex-shrink: 0;
}

.modal__title {
  margin: 0;
  font-size: @font-size-xl;
  font-weight: @font-weight-semibold;
  color: @color-text;
  line-height: @line-height-tight;
}

.modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  color: @color-text-dim;
  cursor: pointer;
  border-radius: @radius-md;
  transition: all @transition-base @ease-out;
  flex-shrink: 0;
  
  .icon {
    width: 20px;
    height: 20px;
    stroke-width: 2;
  }
  
  &:hover {
    background: fade(@color-text-dim, 10%);
    color: @color-text;
  }
  
  &:focus-visible {
    .m-focus();
  }
}

.modal__body {
  flex: 1;
  overflow-y: auto;
  padding: @space-6;
  
  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: @color-border;
    border-radius: 4px;
    
    &:hover {
      background: @color-border-light;
    }
  }
}

.modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: @space-3;
  padding: 0 @space-6 @space-6;
  border-top: 1px solid @color-border;
  flex-shrink: 0;
}

// Animations
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// High contrast theme
.theme-contrast & {
  .modal-overlay {
    background: rgba(0, 0, 0, 0.8);
  }
  
  .modal {
    background: @color-contrast-panel;
    border-color: @color-contrast-border;
  }
  
  .modal__title {
    color: @color-contrast-text;
  }
  
  .modal__close {
    color: fade(@color-contrast-text, 70%);
    
    &:hover {
      background: fade(@color-contrast-text, 10%);
      color: @color-contrast-text;
    }
  }
  
  .modal__footer {
    border-top-color: @color-contrast-border;
  }
  
  .modal__body {
    &::-webkit-scrollbar-thumb {
      background: @color-contrast-border;
      
      &:hover {
        background: fade(@color-contrast-text, 30%);
      }
    }
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .modal-overlay {
    animation: fadeInSimple @transition-fast @ease-out;
  }
  
  .modal {
    animation: fadeInSimple @transition-fast @ease-out;
  }
  
  @keyframes fadeInSimple {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}

// Touch device adjustments
@media (hover: none) {
  .modal__close {
    width: 44px;
    height: 44px;
    
    .icon {
      width: 22px;
      height: 22px;
    }
  }
}

// Print styles
@media print {
  .modal-overlay {
    position: static;
    background: transparent;
    backdrop-filter: none;
  }
  
  .modal {
    box-shadow: none;
    border: 1px solid #000;
    max-width: none;
    max-height: none;
    height: auto;
  }
  
  .modal__close {
    display: none;
  }
}
</style>
