import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `@import "${resolve(__dirname, 'src/styles/variables.less')}";`,
        javascriptEnabled: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
