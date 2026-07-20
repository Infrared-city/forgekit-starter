import type { SimpleMeshFormat } from './buildings.mesh-utils'

/**
 * LRU cache entry with size tracking
 */
interface CacheEntry {
  mesh: SimpleMeshFormat
  lastAccessed: number
  size: number // Approximate bytes
}

/**
 * Cache statistics for debugging and monitoring
 */
export interface MeshCacheStats {
  entries: number
  sizeBytes: number
  maxSizeBytes: number
  utilizationPercent: number
}

// Default 100MB cache limit
const MAX_CACHE_SIZE = 100 * 1024 * 1024

// Internal cache state
const cache = new Map<string, CacheEntry>()
let currentSize = 0

/**
 * Estimates the memory usage of a SimpleMeshFormat in bytes.
 * Accounts for typed array buffers used by positions, normals, and indices.
 */
function estimateMeshSize(mesh: SimpleMeshFormat): number {
  const positionsSize = mesh.attributes.positions.value.byteLength
  const normalsSize = mesh.attributes.normals.value.byteLength
  const indicesSize = mesh.indices.value.byteLength

  // Add some overhead for the object structure (~100 bytes)
  return positionsSize + normalsSize + indicesSize + 100
}

/**
 * Evicts the least recently used entry from the cache.
 */
function evictOldest(): void {
  let oldestKey: string | null = null
  let oldestTime = Infinity

  for (const [key, entry] of cache) {
    if (entry.lastAccessed < oldestTime) {
      oldestTime = entry.lastAccessed
      oldestKey = key
    }
  }

  if (oldestKey) {
    const evicted = cache.get(oldestKey)!
    currentSize -= evicted.size
    cache.delete(oldestKey)

    if (import.meta.env.DEV) {
      const sizeKB = (evicted.size / 1024).toFixed(1)
      console.debug(`[MeshCache] EVICT: ${oldestKey} (${sizeKB} KB)`)
    }
  }
}

/**
 * Retrieves a mesh from the cache if present.
 * Updates the access time for LRU tracking.
 *
 * @param id - The mesh identifier
 * @returns The cached mesh or undefined if not found
 */
export function getCachedMesh(id: string): SimpleMeshFormat | undefined {
  const entry = cache.get(id)

  if (entry) {
    entry.lastAccessed = Date.now()
    if (import.meta.env.DEV) {
      console.debug(`[MeshCache] HIT: ${id}`)
    }
    return entry.mesh
  }

  if (import.meta.env.DEV) {
    console.debug(`[MeshCache] MISS: ${id}`)
  }
  return undefined
}

/**
 * Stores a mesh in the cache.
 * Automatically evicts oldest entries if the cache exceeds the size limit.
 *
 * @param id - The mesh identifier
 * @param mesh - The mesh to cache
 */
export function setCachedMesh(id: string, mesh: SimpleMeshFormat): void {
  const size = estimateMeshSize(mesh)

  // Evict oldest entries until we have room
  while (currentSize + size > MAX_CACHE_SIZE && cache.size > 0) {
    evictOldest()
  }

  // If the mesh itself is larger than max cache, don't cache it
  if (size > MAX_CACHE_SIZE) {
    if (import.meta.env.DEV) {
      const sizeMB = (size / 1024 / 1024).toFixed(1)
      console.warn(`[MeshCache] Mesh ${id} too large to cache (${sizeMB} MB)`)
    }
    return
  }

  cache.set(id, { mesh, lastAccessed: Date.now(), size })
  currentSize += size

  if (import.meta.env.DEV) {
    const sizeKB = (size / 1024).toFixed(1)
    console.debug(`[MeshCache] SET: ${id} (${sizeKB} KB)`)
  }
}

/**
 * Invalidates (removes) a specific mesh from the cache.
 * Call this when a mesh has been transformed and the cached version is stale.
 *
 * @param id - The mesh identifier to invalidate
 * @returns true if the mesh was found and removed, false otherwise
 */
export function invalidateMesh(id: string): boolean {
  const entry = cache.get(id)

  if (entry) {
    currentSize -= entry.size
    cache.delete(id)

    if (import.meta.env.DEV) {
      console.debug(`[MeshCache] INVALIDATE: ${id}`)
    }
    return true
  }

  return false
}

/**
 * Clears all entries from the cache.
 * Useful for testing or when switching viewports.
 */
export function clearMeshCache(): void {
  cache.clear()
  currentSize = 0

  if (import.meta.env.DEV) {
    console.debug('[MeshCache] CLEARED')
  }
}

/**
 * Returns statistics about the current cache state.
 * Useful for debugging and monitoring memory usage.
 */
export function getMeshCacheStats(): MeshCacheStats {
  return {
    entries: cache.size,
    sizeBytes: currentSize,
    maxSizeBytes: MAX_CACHE_SIZE,
    utilizationPercent: cache.size > 0 ? (currentSize / MAX_CACHE_SIZE) * 100 : 0,
  }
}

/**
 * Checks if a mesh is currently cached.
 * Does not update the access time (use getCachedMesh for that).
 *
 * @param id - The mesh identifier
 * @returns true if the mesh is in the cache
 */
export function hasCachedMesh(id: string): boolean {
  return cache.has(id)
}
