import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://suaxe247backend.test',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/BackendSuaxe247/public/api'),
      },
    },
  },
})
