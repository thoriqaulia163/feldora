/**
 * Vite Plugin: Route Manifest Generator
 *
 * Generates a `route-manifest.json` at build time that maps routes to their
 * corresponding chunk files. This enables the Service Worker to:
 * 1. Know which assets belong to which route
 * 2. Selectively download only chunks for previously visited routes on update
 * 3. Map old route chunks to new ones across deployments
 *
 * Output format:
 * {
 *   "version": "1.11.2",
 *   "buildId": "abc123",
 *   "timestamp": "2026-06-23T...",
 *   "routes": {
 *     "/": { "chunks": ["assets/index-Hk4x.js"] },
 *     "/about": { "chunks": ["assets/about-Lm3y.js"] },
 *     ...
 *   },
 *   "shared": ["assets/vendor-Xz1a.js", "assets/framework-Bc4d.js"],
 *   "all": ["assets/index-Hk4x.js", "assets/about-Lm3y.js", ...]
 * }
 */

import { readFileSync } from 'node:fs'
import { resolve, basename } from 'node:path'
import { createHash } from 'node:crypto'
import type { Plugin, ResolvedConfig } from 'vite'

interface RouteManifest {
  version: string
  buildId: string
  timestamp: string
  routes: Record<string, { chunks: string[] }>
  shared: string[]
  all: string[]
}

/**
 * Maps route file names (from src/routes/) to their URL paths.
 * Follows TanStack Router file-based routing conventions.
 */
function routeFileToPath(filename: string): string {
  // Remove extension
  let route = filename.replace(/\.tsx?$/, '')

  // __root is not a navigable route
  if (route === '__root') return ''

  // index files → parent path
  // "index" → "/"
  // "playground.index" → "/playground"
  if (route === 'index') return '/'
  if (route.endsWith('.index')) {
    route = route.replace(/\.index$/, '')
  }

  // Dots become slashes: "playground.local-weather-forecast" → "/playground/local-weather-forecast"
  // Dollar signs are params: "story.$slug" → "/story/$slug"
  return '/' + route.replace(/\./g, '/')
}

export default function routeManifestPlugin(): Plugin {
  let config: ResolvedConfig
  let appVersion: string

  return {
    name: 'vite-plugin-route-manifest',
    apply: 'build',

    configResolved(resolvedConfig) {
      config = resolvedConfig
      // Read version from package.json
      try {
        const pkg = JSON.parse(readFileSync(resolve(config.root, 'package.json'), 'utf-8'))
        appVersion = pkg.version || '0.0.0'
      } catch {
        appVersion = '0.0.0'
      }
    },

    generateBundle(_, bundle) {
      // Collect all route files and their corresponding output chunks
      const routeChunkMap: Record<string, string[]> = {}
      const allChunks: string[] = []
      const sharedChunks: Set<string> = new Set()

      // First pass: identify which chunks correspond to route files
      const routeFilePattern = /src\/routes\//

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk') continue
        allChunks.push(fileName)

        // Check if this chunk has a facadeModuleId pointing to a route file
        if (chunk.facadeModuleId && routeFilePattern.test(chunk.facadeModuleId)) {
          const routeFile = basename(chunk.facadeModuleId)
          const routePath = routeFileToPath(routeFile)
          if (routePath) {
            if (!routeChunkMap[routePath]) routeChunkMap[routePath] = []
            routeChunkMap[routePath].push(fileName)
          }
        }

        // Chunks imported by multiple routes are "shared"
        if (chunk.isDynamicEntry === false && !chunk.facadeModuleId) {
          sharedChunks.add(fileName)
        }
      }

      // Second pass: identify shared chunks (imported by 2+ route chunks)
      const importCounts: Record<string, number> = {}
      for (const [_, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk') continue
        for (const imported of chunk.imports || []) {
          importCounts[imported] = (importCounts[imported] || 0) + 1
        }
      }
      for (const [file, count] of Object.entries(importCounts)) {
        if (count >= 2) sharedChunks.add(file)
      }

      // Also include CSS assets
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type === 'asset' && fileName.endsWith('.css')) {
          allChunks.push(fileName)
          // CSS is typically shared
          sharedChunks.add(fileName)
        }
      }

      // Build manifest
      const buildId = createHash('md5')
        .update(Date.now().toString() + appVersion)
        .digest('hex')
        .slice(0, 8)

      const routes: Record<string, { chunks: string[] }> = {}
      for (const [path, chunks] of Object.entries(routeChunkMap)) {
        routes[path] = { chunks }
      }

      const manifest: RouteManifest = {
        version: appVersion,
        buildId,
        timestamp: new Date().toISOString(),
        routes,
        shared: [...sharedChunks],
        all: allChunks,
      }

      // Emit as a build asset
      this.emitFile({
        type: 'asset',
        fileName: 'route-manifest.json',
        source: JSON.stringify(manifest, null, 2),
      })
    },
  }
}
