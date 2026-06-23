import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import routeManifestPlugin from './plugins/vite-plugin-route-manifest'
import swBuildPlugin from './plugins/vite-plugin-sw-build'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig({
  server: {
    port: 3000,
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  plugins: [tanstackStart(), nitro(), react(), routeManifestPlugin(), swBuildPlugin()],
})
