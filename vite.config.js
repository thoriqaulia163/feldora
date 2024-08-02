import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': "/src",
      '@pages': "/src/pages",
      '@components': "/src/components",
      '@services': "/src/services",
      '@lib': "/src/lib",
    },
  },
})
