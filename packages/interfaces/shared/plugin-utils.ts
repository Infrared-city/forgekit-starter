import type { PluginBase } from './plugin-types.ts'

/**
 * Validate that every plugin's `requires` dependencies are satisfied by the
 * provided plugin set. Throws an error listing all unresolved dependencies.
 *
 * @param plugins - Array of plugins to validate.
 * @throws {Error} If any plugin requires a plugin ID that is not present.
 */
export function validatePlugins<T extends PluginBase>(plugins: T[]): void {
  const errors: string[] = []

  // Check for duplicate IDs
  const seen = new Set<string>()
  for (const plugin of plugins) {
    if (seen.has(plugin.id)) {
      errors.push(`Duplicate plugin id "${plugin.id}"`)
    }
    seen.add(plugin.id)
  }

  // Check that all requires dependencies are present
  const ids = new Set(plugins.map((p) => p.id))
  for (const plugin of plugins) {
    if (!plugin.requires) continue
    for (const dep of plugin.requires) {
      if (!ids.has(dep)) {
        errors.push(`Plugin "${plugin.id}" requires "${dep}" which is not registered`)
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Plugin validation failed:\n${errors.join('\n')}`)
  }
}

/**
 * Return plugins in dependency order using Kahn's algorithm (topological sort).
 * Plugins with no dependencies come first; plugins that depend on others come
 * after their dependencies.
 *
 * @param plugins - Array of plugins to order.
 * @returns A new array with plugins in dependency-safe order.
 * @throws {Error} If a circular dependency is detected.
 * @throws {Error} If any plugin requires a plugin ID that is not present.
 */
export function orderPlugins<T extends PluginBase>(plugins: T[]): T[] {
  // First validate that all deps exist
  validatePlugins(plugins)

  const pluginMap = new Map<string, T>()
  for (const p of plugins) {
    pluginMap.set(p.id, p)
  }

  // Build adjacency list and in-degree map
  // Edge: dependency -> dependent (dependency must come before dependent)
  const inDegree = new Map<string, number>()
  const dependents = new Map<string, string[]>()

  for (const p of plugins) {
    inDegree.set(p.id, 0)
    dependents.set(p.id, [])
  }

  for (const p of plugins) {
    if (!p.requires) continue
    for (const dep of p.requires) {
      // dep -> p.id edge
      dependents.get(dep)!.push(p.id)
      inDegree.set(p.id, (inDegree.get(p.id) ?? 0) + 1)
    }
  }

  // Kahn's algorithm: start with nodes that have no incoming edges
  const queue: string[] = []
  for (const [id, degree] of inDegree) {
    if (degree === 0) {
      queue.push(id)
    }
  }

  const sorted: T[] = []

  while (queue.length > 0) {
    const id = queue.shift()!
    sorted.push(pluginMap.get(id)!)

    for (const dependent of dependents.get(id) ?? []) {
      const newDegree = (inDegree.get(dependent) ?? 1) - 1
      inDegree.set(dependent, newDegree)
      if (newDegree === 0) {
        queue.push(dependent)
      }
    }
  }

  if (sorted.length !== plugins.length) {
    const remaining = plugins.filter((p) => !sorted.some((s) => s.id === p.id)).map((p) => p.id)
    throw new Error(`Circular dependency detected among plugins: ${remaining.join(', ')}`)
  }

  return sorted
}
