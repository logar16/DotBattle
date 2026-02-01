import type { Dot } from '../types'

export class SpatialGrid {
  private cellSize: number
  private grid: Map<string, Dot[]>
  private processed: Set<string>

  constructor(_width: number, _height: number, cellSize: number) {
    this.cellSize = cellSize
    this.grid = new Map()
    this.processed = new Set()
  }

  clear(): void {
    this.grid.clear()
    this.processed.clear()
  }

  insert(dot: Dot): void {
    const cellX = Math.floor(dot.x / this.cellSize)
    const cellY = Math.floor(dot.y / this.cellSize)
    const key = `${cellX},${cellY}`
    
    if (!this.grid.has(key)) {
      this.grid.set(key, [])
    }
    this.grid.get(key)!.push(dot)
  }

  getNearby(x: number, y: number, radius: number): Dot[] {
    const nearby: Dot[] = []
    const cellRadius = Math.ceil(radius / this.cellSize)
    const centerX = Math.floor(x / this.cellSize)
    const centerY = Math.floor(y / this.cellSize)

    for (let dy = -cellRadius; dy <= cellRadius; dy++) {
      for (let dx = -cellRadius; dx <= cellRadius; dx++) {
        const cellX = centerX + dx
        const cellY = centerY + dy
        const key = `${cellX},${cellY}`
        
        const dots = this.grid.get(key)
        if (dots) {
          nearby.push(...dots)
        }
      }
    }

    return nearby
  }

  forEachPair(callback: (a: Dot, b: Dot) => boolean): void {
    this.processed.clear()

    for (const dots of this.grid.values()) {
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i]
          const b = dots[j]
          const pairKey = this.getPairKey(a, b)

          if (!this.processed.has(pairKey)) {
            const shouldMark = callback(a, b)
            if (shouldMark) {
              this.processed.add(pairKey)
            }
          }
        }
      }
    }
  }

  forEachWithNeighbors(radius: number, callback: (dot: Dot, neighbors: Dot[]) => void): void {
    const radiusSq = radius * radius
    const allDots: Dot[] = []
    
    for (const dots of this.grid.values()) {
      allDots.push(...dots)
    }

    for (const dot of allDots) {
      const nearby = this.getNearby(dot.x, dot.y, radius)
      const neighbors: Dot[] = []

      for (const other of nearby) {
        if (other === dot) continue
        
        const dx = other.x - dot.x
        const dy = other.y - dot.y
        const distSq = dx * dx + dy * dy

        if (distSq < radiusSq) {
          neighbors.push(other)
        }
      }

      if (neighbors.length > 0) {
        callback(dot, neighbors)
      }
    }
  }

  private getPairKey(a: Dot, b: Dot): string {
    const id1 = `${a.x.toFixed(3)},${a.y.toFixed(3)},${a.faction}`
    const id2 = `${b.x.toFixed(3)},${b.y.toFixed(3)},${b.faction}`
    return id1 < id2 ? `${id1}|${id2}` : `${id2}|${id1}`
  }
}
