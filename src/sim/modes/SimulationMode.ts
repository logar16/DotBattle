import type { Dot, SimulationControls, SimulationStats, SimCallbacks, BaseMode, MouseState } from '../types'
import { SpatialGrid } from '../utils/SpatialGrid'
import { applyForce } from '../utils/physics'
import { spawnDot, handleMouseForces } from './modeUtils'

export class SimulationMode implements BaseMode<SimulationControls, SimulationStats> {
  public readonly dots: Dot[] = []
  
  private canvas: HTMLCanvasElement
  private controls: SimulationControls
  private callbacks: SimCallbacks<SimulationStats>
  private grid: SpatialGrid
  private mouseState: MouseState = { x: 0, y: 0, active: false }
  private arenaPadding = { top: 12, right: 12, bottom: 20, left: 12 }
  private menuDot: Dot | null = null
  
  private lastStatsTime = 0
  private fps = 0

  constructor(canvas: HTMLCanvasElement, controls: SimulationControls, callbacks: SimCallbacks<SimulationStats>) {
    this.canvas = canvas
    this.controls = controls
    this.callbacks = callbacks
    
    const rect = canvas.getBoundingClientRect()
    const cellSize = Math.max(8, controls.maxSize * 5)
    this.grid = new SpatialGrid(rect.width, rect.height, cellSize)
    
    this.init()
  }

  private init(): void {
    const { count, minSize, maxSize } = this.controls
    const palette = this.callbacks.getPalette()
    if (!palette.length) {
      this.dots.length = 0
      return
    }

    const rect = this.canvas.getBoundingClientRect()
    const width = rect.width - this.arenaPadding.left - this.arenaPadding.right
    const height = rect.height - this.arenaPadding.top - this.arenaPadding.bottom

    this.dots.length = 0
    for (let i = 0; i < count; i++) {
      const faction = Math.floor(Math.random() * palette.length)
      const dot = spawnDot(faction, minSize, maxSize, width, height)
      dot.x += this.arenaPadding.left
      dot.y += this.arenaPadding.top
      this.dots.push(dot)
    }
  }

  update(dt: number): void {
    const { magnetStrength, mouseAttraction, mouseRange, maxSize, speed } = this.controls
    const rect = this.canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const padding = this.arenaPadding
    const minX = padding.left
    const minY = padding.top
    const maxX = width - padding.right
    const maxY = height - padding.bottom

    this.grid.clear()

    for (const dot of this.dots) {
      this.grid.insert(dot)
    }

    const influenceRadius = Math.max(8, maxSize * 5)
    const influenceRadiusSq = influenceRadius * influenceRadius

    this.grid.forEachWithNeighbors(influenceRadius, (dot, neighbors) => {
      for (const other of neighbors) {
        const dx = other.x - dot.x
        const dy = other.y - dot.y
        const distSq = dx * dx + dy * dy
        
        if (distSq === 0 || distSq > influenceRadiusSq) continue

        const dist = Math.sqrt(distSq)
        const sizeFactor = other.size / maxSize
        const effectiveRadius = influenceRadius * (0.6 + sizeFactor)
        const effectiveRadiusSq = effectiveRadius * effectiveRadius

        if (distSq > effectiveRadiusSq) continue

        const dirX = dx / dist
        const dirY = dy / dist
        const falloff = 1 - dist / effectiveRadius
        const force = (magnetStrength / 100) * falloff * (0.5 + sizeFactor * sizeFactor)
        
        // Always repel in simulation mode
        applyForce(dot, dirX * force * -1 * dt, dirY * force * -1 * dt, 1)
      }
    })

    handleMouseForces(this.dots, this.mouseState, mouseAttraction, mouseRange)

    const maxSpeed = 3
    const wallRadius = Math.max(20, influenceRadius * 0.5)
    const wallStrength = 0.4
    const bounceDamping = 0.6

    for (const dot of this.dots) {
      const speedVal = Math.hypot(dot.vx, dot.vy)
      if (speedVal > maxSpeed) {
        const scale = maxSpeed / speedVal
        dot.vx *= scale
        dot.vy *= scale
      }

      const left = minX + dot.size
      const right = maxX - dot.size
      const top = minY + dot.size
      const bottom = maxY - dot.size
      
      const leftDist = dot.x - left
      const rightDist = right - dot.x
      const topDist = dot.y - top
      const bottomDist = bottom - dot.y

      if (leftDist < wallRadius) dot.vx += (1 - leftDist / wallRadius) * wallStrength * dt
      if (rightDist < wallRadius) dot.vx -= (1 - rightDist / wallRadius) * wallStrength * dt
      if (topDist < wallRadius) dot.vy += (1 - topDist / wallRadius) * wallStrength * dt
      if (bottomDist < wallRadius) dot.vy -= (1 - bottomDist / wallRadius) * wallStrength * dt

      dot.x += dot.vx * dt * (speed / 100)
      dot.y += dot.vy * dt * (speed / 100)

      if (dot.x <= left || dot.x >= right) dot.vx *= -bounceDamping
      if (dot.y <= top || dot.y >= bottom) dot.vy *= -bounceDamping
      
      dot.x = Math.max(left, Math.min(right, dot.x))
      dot.y = Math.max(top, Math.min(bottom, dot.y))
    }
  }

  updateStats(timestamp: number): void {
    if (timestamp - this.lastStatsTime < 250) return
    
    const total = this.dots.length
    
    let totalVelocity = 0
    for (const dot of this.dots) {
      totalVelocity += Math.hypot(dot.vx, dot.vy)
    }
    const avgVelocity = total > 0 ? totalVelocity / total : 0

    this.callbacks.onStatsChange({
      totalDots: total,
      fps: Math.round(this.fps),
      avgVelocity
    })

    this.lastStatsTime = timestamp
  }

  setFps(fps: number): void {
    this.fps = this.fps ? this.fps * 0.9 + fps * 0.1 : fps
  }

  setControls(controls: SimulationControls): void {
    // Just update controls - count changes are handled by Simulation class
    this.controls = controls
  }

  handleMouseMove(x: number, y: number): void {
    this.mouseState = { x, y, active: true }
  }

  handleMouseLeave(): void {
    this.mouseState.active = false
  }

  handleCanvasClick(x: number, y: number, shiftKey: boolean): void {
    if (shiftKey) return // No shift-click impulse in simulation mode
    
    const clicked = this.findDotAt(x, y)
    if (clicked) {
      const { minSize, maxSize } = this.controls
      const rect = this.canvas.getBoundingClientRect()
      const padding = this.arenaPadding
      
      for (let i = 0; i < 50; i++) {
        const offsetX = (Math.random() * 2 - 1) * clicked.size
        const offsetY = (Math.random() * 2 - 1) * clicked.size
        const newX = Math.max(
          padding.left,
          Math.min(rect.width - padding.right, clicked.x + offsetX)
        )
        const newY = Math.max(
          padding.top,
          Math.min(rect.height - padding.bottom, clicked.y + offsetY)
        )
        
        const dot = spawnDot(clicked.faction, minSize, maxSize, rect.width, rect.height)
        dot.x = newX
        dot.y = newY
        this.dots.push(dot)
      }
    }
  }

  setMenuDot(x: number, y: number): Dot | null {
    this.menuDot = this.findDotAt(x, y)
    return this.menuDot
  }

  clearMenuDot(): void {
    this.menuDot = null
  }

  updateMenuDot(size: number | undefined, faction: number | undefined): void {
    if (!this.menuDot) return
    if (size !== undefined) this.menuDot.size = size
    if (faction !== undefined) this.menuDot.faction = faction
  }

  destroy(): void {
    this.dots.length = 0
    this.grid.clear()
  }

  private findDotAt(x: number, y: number): Dot | null {
    for (let i = this.dots.length - 1; i >= 0; i--) {
      const dot = this.dots[i]
      const dx = x - dot.x
      const dy = y - dot.y
      if (dx * dx + dy * dy <= dot.size * dot.size) {
        return dot
      }
    }
    return null
  }
}
