import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://120.26.123.36:5262',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
