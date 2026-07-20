// ABOUTME: Internal deterministic search structures for corridor routing modules.
// ABOUTME: Provides an index-tie-broken binary min-heap and a disjoint set forest.

export interface HeapEntry {
  index: number
  priority: number
}

export class MinHeap {
  private readonly items: HeapEntry[] = []

  get size(): number {
    return this.items.length
  }

  push(entry: HeapEntry): void {
    this.items.push(entry)
    let index = this.items.length - 1
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (!this.before(this.items[index], this.items[parent])) break
      ;[this.items[index], this.items[parent]] = [this.items[parent], this.items[index]]
      index = parent
    }
  }

  pop(): HeapEntry | null {
    const first = this.items[0]
    const last = this.items.pop()
    if (!first || !last) return first ?? null
    if (this.items.length === 0) return first
    this.items[0] = last
    let index = 0
    while (true) {
      const left = index * 2 + 1
      const right = left + 1
      let smallest = index
      if (left < this.items.length && this.before(this.items[left], this.items[smallest])) {
        smallest = left
      }
      if (right < this.items.length && this.before(this.items[right], this.items[smallest])) {
        smallest = right
      }
      if (smallest === index) break
      ;[this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]]
      index = smallest
    }
    return first
  }

  private before(a: HeapEntry, b: HeapEntry): boolean {
    return a.priority < b.priority || (a.priority === b.priority && a.index < b.index)
  }
}

export class DisjointSet {
  private readonly parents: Map<string, string>

  constructor(ids: string[]) {
    this.parents = new Map(ids.map((id) => [id, id]))
  }

  find(id: string): string {
    const parent = this.parents.get(id) ?? id
    if (parent === id) return id
    const root = this.find(parent)
    this.parents.set(id, root)
    return root
  }

  union(a: string, b: string): boolean {
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA === rootB) return false
    const [first, second] = rootA < rootB ? [rootA, rootB] : [rootB, rootA]
    this.parents.set(second, first)
    return true
  }
}
