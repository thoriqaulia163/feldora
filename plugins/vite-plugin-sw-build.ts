/**
 * Vite Plugin: Service Worker Build
 *
 * Bundles src/sw.ts into the output directory after the main build completes.
 * Uses esbuild (already available via Vite) to bundle the SW with Workbox imports.
 * This replaces the need for a separate workbox-build step.
 */

import { build } from 'esbuild'
import { resolve } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

export default function swBuildPlugin(): Plugin {
  let config: ResolvedConfig
  let outDir: string

  return {
    name: 'vite-plugin-sw-build',
    apply: 'build',

    configResolved(resolvedConfig) {
      config = resolvedConfig
      outDir = resolve(config.root, config.build.outDir || 'dist')
    },

    async closeBundle() {
      const swEntry = resolve(config.root, 'src/sw.ts')

      try {
        await build({
          entryPoints: [swEntry],
          bundle: true,
          minify: true,
          format: 'esm',
          outfile: resolve(outDir, 'client', 'sw.js'),
          platform: 'browser',
          target: 'es2020',
          define: {
            'process.env.NODE_ENV': '"production"',
          },
          // Workbox modules are bundled inline
          external: [],
        })
        console.log('  ✓ Service Worker bundled → sw.js')
      } catch (err) {
        console.error('  ✗ Service Worker build failed:', err)
        throw err
      }
    },
  }
}
