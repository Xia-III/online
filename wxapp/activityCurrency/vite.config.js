import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 使用相对路径
  plugins: [
    uni(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://www.huanxizn.com/Sales',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
