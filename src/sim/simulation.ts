import { rand } from '../utils/math'
import type { ClickImpulse, Dot, MouseState, SimControls } from './types'

export type SimulationOptions = {
  getPalette: () => string[]
  getFactionColor: (index: number) => string
  onStatsChange?: (counts: number[], total: number, fps: number) => void
}

export class Simulation {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private controls: SimControls
  private getPalette: () => string[]
  private getFactionColor: (index: number) => string
  private onStatsChange?: (counts: number[], total: number, fps: number) => void

  private viewWidth = 0
  private viewHeight = 0
  private paused = false
  private lastTime = 0
  private lastSimulationTime = 0
  private nextStatsUpdate = 0
  private lastFrameTime = 0
  private fps = 0
  private targetFps = 60
  private gridCells: Dot[][] = []
  private dots: Dot[] = []
  private mouse: MouseState = { x: 0, y: 0, active: false }
  private clickImpulse: ClickImpulse | null = null
  private hoverDot: Dot | null = null
  private menuDot: Dot | null = null
  private needsRender = true
  private arenaPadding = { top: 12, right: 12, bottom: 20, left: 12 }
  private rafId: number | null = null

  constructor(canvas: HTMLCanvasElement, controls: SimControls, options: SimulationOptions) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context missing')
    this.canvas = canvas
    this.ctx = ctx
    this.controls = controls
    this.getPalette = options.getPalette
    this.getFactionColor = options.getFactionColor
    this.onStatsChange = options.onStatsChange
  }

  start() {
    this.stop()
    this.resizeCanvas()
    this.init()
    this.loop(performance.now())
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = null
  }

  setControls(next: SimControls) {
    this.controls = next
  }

  setPalette(colors: string[]) {
    if (!colors.length) {
      this.dots = []
      this.needsRender = true
      return
    }
    this.dots = this.dots.map((dot) => ({ ...dot, faction: dot.faction % colors.length }))
    if (this.menuDot) this.menuDot.faction = this.menuDot.faction % colors.length
    this.needsRender = true
  }

  setPaused(paused: boolean) {
    this.paused = paused
    this.needsRender = true
  }

  setMenuDotAt(x: number, y: number) {
    this.menuDot = this.findDotAt(x, y)
    if (this.menuDot) this.needsRender = true
    return this.menuDot
  }

  clearMenuDot() {
    this.menuDot = null
    this.needsRender = true
  }

  updateMenuDotSize(size: number) {
    if (!this.menuDot) return
    this.menuDot.size = size
    this.needsRender = true
  }

  updateMenuDotFaction(faction: number) {
    if (!this.menuDot) return
    this.menuDot.faction = faction
    this.needsRender = true
  }

  setAllToFaction(faction: number) {
    for (const dot of this.dots) dot.faction = faction
    this.needsRender = true
  }

  addDotsForFaction(faction: number) {
    const { minSize, maxSize } = this.controls
    for (let i = 0; i < 50; i++) {
      const x = rand(this.arenaPadding.left, this.viewWidth - this.arenaPadding.right)
      const y = rand(this.arenaPadding.top, this.viewHeight - this.arenaPadding.bottom)
      this.dots.push(this.spawnDot(faction, x, y, minSize, maxSize))
    }
    this.needsRender = true
  }

  handleCanvasClick(x: number, y: number, shiftKey: boolean) {
    if (this.paused && shiftKey) return
    for (let i = this.dots.length - 1; i >= 0; i--) {
      const dot = this.dots[i]
      const dx = x - dot.x
      const dy = y - dot.y
      if (dx * dx + dy * dy <= dot.size * dot.size) {
        const { minSize, maxSize } = this.controls
        for (let j = 0; j < 50; j++) {
          const offsetX = (Math.random() * 2 - 1) * dot.size
          const offsetY = (Math.random() * 2 - 1) * dot.size
          const newX = Math.max(
            this.arenaPadding.left,
            Math.min(this.viewWidth - this.arenaPadding.right, dot.x + offsetX),
          )
          const newY = Math.max(
            this.arenaPadding.top,
            Math.min(this.viewHeight - this.arenaPadding.bottom, dot.y + offsetY),
          )
          this.dots.push(this.spawnDot(dot.faction, newX, newY, minSize, maxSize))
        }
        this.needsRender = true
        return
      }
    }
    if (shiftKey && !this.paused) {
      this.handleShiftClick(x, y)
    }
  }

  removeFactionDots(faction: number, count?: number) {
    let removed = 0
    for (let i = this.dots.length - 1; i >= 0; i--) {
      if (this.dots[i].faction !== faction) continue
      this.dots.splice(i, 1)
      removed += 1
      if (count && removed >= count) break
    }
    this.needsRender = true
  }

  handleMouseMove(x: number, y: number) {
    this.mouse = { x, y, active: true }
    if (this.paused) {
      this.hoverDot = this.findDotAt(x, y)
      this.needsRender = true
    }
  }

  handleMouseLeave() {
    this.mouse.active = false
    if (this.paused) {
      this.hoverDot = null
      this.needsRender = true
    }
  }

  handleShiftClick(x: number, y: number) {
    if (this.paused) return
    this.clickImpulse = {
      x,
      y,
      radius: 150,
      radiusSq: 150 * 150,
      strength: 2.4,
      duration: 500,
      elapsed: 0,
      decay: 1,
    }
    this.needsRender = true
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    this.viewWidth = rect.width
    this.viewHeight = rect.height
    this.canvas.width = Math.round(rect.width * dpr)
    this.canvas.height = Math.round(rect.height * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.needsRender = true
  }

  private spawnDot(faction: number, x: number, y: number, minSize: number, maxSize: number): Dot {
    const size = rand(minSize, maxSize)
    const angle = rand(0, Math.PI * 2)
    const speed = rand(0.4, 1.0)
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      faction,
    }
  }

  private init() {
    const { count, minSize, maxSize } = this.controls
    const factions = this.getPalette().length
    if (!factions) {
      this.dots = []
      return
    }
    this.dots = new Array(count).fill(0).map(() => {
      return this.spawnDot(
        Math.floor(rand(0, factions)),
        rand(this.arenaPadding.left, this.viewWidth - this.arenaPadding.right),
        rand(this.arenaPadding.top, this.viewHeight - this.arenaPadding.bottom),
        minSize,
        maxSize,
      )
    })
  }

  private loop = (timestamp: number) => {
    if (document.hidden) {
      this.lastFrameTime = timestamp
      this.lastSimulationTime = timestamp
      this.needsRender = false
      this.rafId = requestAnimationFrame(this.loop)
      return
    }
    this.targetFps = document.hasFocus() ? 60 : 40
    const targetFrameMs = 1000 / this.targetFps
    const simDeltaMs = timestamp - this.lastSimulationTime
    if (!this.paused && simDeltaMs >= targetFrameMs) {
      const dt = Math.min(32, timestamp - this.lastTime) / 16.67
      this.lastTime = timestamp
      this.update(dt)
      this.lastSimulationTime = timestamp
      if (this.lastFrameTime) {
        const frameMs = timestamp - this.lastFrameTime
        if (frameMs > 0) {
          const currentFps = 1000 / frameMs
          this.fps = this.fps ? this.fps * 0.9 + currentFps * 0.1 : currentFps
        }
      }
      this.lastFrameTime = timestamp
    } else if (this.paused) {
      this.lastTime = timestamp
      this.lastSimulationTime = timestamp
    }
    if (!this.paused || this.needsRender) {
      this.render()
      this.needsRender = false
    }
    if (timestamp >= this.nextStatsUpdate) {
      this.updateStats()
      this.nextStatsUpdate = timestamp + 250
    }
    this.rafId = requestAnimationFrame(this.loop)
  }

  private update(dt: number) {
    const battleRadius = this.controls.battleRadius
    if (this.clickImpulse) {
      this.clickImpulse.elapsed += dt * 16.67
      this.clickImpulse.decay = Math.max(0, 1 - this.clickImpulse.elapsed / this.clickImpulse.duration)
      if (this.clickImpulse.decay === 0) this.clickImpulse = null
    }
    if (battleRadius <= 0) {
      this.runMovement(dt)
      return
    }
    this.runMovement(dt)
    this.resolveBattles(battleRadius)
  }

  private runMovement(dt: number) {
    const { repelAll, magnetStrength, mouseAttraction, mouseRange, maxSize } = this.controls
    const influenceRadius = Math.max(8, maxSize * 5)
    const width = this.viewWidth
    const height = this.viewHeight
    const padding = this.arenaPadding
    const minX = padding.left
    const minY = padding.top
    const maxX = width - padding.right
    const maxY = height - padding.bottom
    const cellSize = Math.max(8, influenceRadius)
    const cols = Math.ceil(width / cellSize)
    const rows = Math.ceil(height / cellSize)
    const cellCount = cols * rows
    if (cellCount !== this.gridCells.length) {
      this.gridCells = new Array(cellCount).fill(null).map(() => [])
    } else {
      for (const cell of this.gridCells) cell.length = 0
    }
    for (const dot of this.dots) {
      const cx = Math.min(cols - 1, Math.max(0, Math.floor(dot.x / cellSize)))
      const cy = Math.min(rows - 1, Math.max(0, Math.floor(dot.y / cellSize)))
      this.gridCells[cx + cy * cols].push(dot)
    }
    for (const dot of this.dots) {
      let ax = 0
      let ay = 0
      const cx = Math.min(cols - 1, Math.max(0, Math.floor(dot.x / cellSize)))
      const cy = Math.min(rows - 1, Math.max(0, Math.floor(dot.y / cellSize)))
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const nx = cx + ox
          const ny = cy + oy
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
          const cell = this.gridCells[nx + ny * cols]
          if (!cell.length) continue
          for (const other of cell) {
            if (other === dot) continue
            const dx = other.x - dot.x
            const dy = other.y - dot.y
            const distSq = dx * dx + dy * dy
            const sizeFactor = other.size / maxSize
            const effectiveRadius = influenceRadius * (0.6 + sizeFactor)
            const effectiveRadiusSq = effectiveRadius * effectiveRadius
            if (distSq === 0 || distSq > effectiveRadiusSq) continue
            const dist = Math.sqrt(distSq)
            const dirX = dx / dist
            const dirY = dy / dist
            const falloff = 1 - dist / effectiveRadius
            const force = (magnetStrength / 100) * falloff * (0.5 + sizeFactor * sizeFactor)
            const sign = repelAll ? -1 : other.faction === dot.faction ? -1 : 1
            ax += dirX * force * sign
            ay += dirY * force * sign
          }
        }
      }
      dot.vx += ax * dt
      dot.vy += ay * dt
      const speed = Math.hypot(dot.vx, dot.vy)
      const maxSpeed = 3
      if (speed > maxSpeed) {
        dot.vx = (dot.vx / speed) * maxSpeed
        dot.vy = (dot.vy / speed) * maxSpeed
      }
      if (this.mouse.active && mouseAttraction !== 0) {
        const dx = this.mouse.x - dot.x
        const dy = this.mouse.y - dot.y
        const distSq = dx * dx + dy * dy
        if (distSq > 0 && distSq <= mouseRange * mouseRange) {
          const dist = Math.sqrt(distSq)
          const falloff = 1 - dist / mouseRange
          const force = (mouseAttraction * 3) * falloff
          dot.vx += (dx / dist) * force * dt
          dot.vy += (dy / dist) * force * dt
        }
      }
      if (this.clickImpulse) {
        const dx = dot.x - this.clickImpulse.x
        const dy = dot.y - this.clickImpulse.y
        const distSq = dx * dx + dy * dy
        if (distSq > 0 && distSq <= this.clickImpulse.radiusSq) {
          const dist = Math.sqrt(distSq)
          const falloff = 1 - dist / this.clickImpulse.radius
          const force = this.clickImpulse.strength * falloff * this.clickImpulse.decay
          dot.vx += (dx / dist) * force * dt
          dot.vy += (dy / dist) * force * dt
        }
      }
      const wallRadius = Math.max(20, influenceRadius * 0.5)
      const wallStrength = 0.4
      const bounceDamping = 0.6
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
      dot.x += dot.vx * dt * (this.controls.speed / 100)
      dot.y += dot.vy * dt * (this.controls.speed / 100)
      if (dot.x <= left || dot.x >= right) dot.vx *= -bounceDamping
      if (dot.y <= top || dot.y >= bottom) dot.vy *= -bounceDamping
      dot.x = Math.max(left, Math.min(right, dot.x))
      dot.y = Math.max(top, Math.min(bottom, dot.y))
    }
    this.needsRender = true
  }

  private resolveBattles(battleRadius: number) {
    const cols = Math.ceil(this.viewWidth / Math.max(8, this.controls.maxSize * 5))
    const rows = Math.ceil(this.viewHeight / Math.max(8, this.controls.maxSize * 5))
    const battleRadiusSq = battleRadius * battleRadius
    for (let cy = 0; cy < rows; cy++) {
      for (let cx = 0; cx < cols; cx++) {
        const cell = this.gridCells[cx + cy * cols]
        if (!cell?.length) continue
        for (const dot of cell) {
          for (let oy = -1; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
              const nx = cx + ox
              const ny = cy + oy
              if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
              const neighborCell = this.gridCells[nx + ny * cols]
              if (!neighborCell?.length) continue
              for (const other of neighborCell) {
                if (other === dot || other.faction === dot.faction) continue
                const dx = other.x - dot.x
                const dy = other.y - dot.y
                const distSq = dx * dx + dy * dy
                if (distSq <= battleRadiusSq) {
                  const dotWeight = dot.size * dot.size
                  const otherWeight = other.size * other.size
                  const roll = Math.random() * (dotWeight + otherWeight)
                  if (roll < dotWeight) other.faction = dot.faction
                  else dot.faction = other.faction
                }
              }
            }
          }
        }
      }
    }
  }

  private render() {
    const width = this.viewWidth
    const height = this.viewHeight
    const padding = this.arenaPadding
    this.ctx.clearRect(0, 0, width, height)
    if (this.clickImpulse) {
      const progress = Math.min(1, this.clickImpulse.elapsed / this.clickImpulse.duration)
      const radius = this.clickImpulse.radius * progress
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
      this.ctx.lineWidth = 8
      this.ctx.beginPath()
      this.ctx.arc(this.clickImpulse.x, this.clickImpulse.y, radius, 0, Math.PI * 2)
      this.ctx.stroke()
    }
    this.ctx.strokeStyle = '#1f2937'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(
      padding.left,
      padding.top,
      width - padding.left - padding.right,
      height - padding.top - padding.bottom,
    )
    for (const dot of this.dots) {
      this.ctx.fillStyle = this.getFactionColor(dot.faction)
      this.ctx.beginPath()
      this.ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
      this.ctx.fill()
    }
    if (this.paused && this.hoverDot) {
      if (!this.dots.includes(this.hoverDot)) {
        this.hoverDot = null
      } else {
        this.ctx.strokeStyle = 'limegreen'
        this.ctx.lineWidth = 2
        this.ctx.beginPath()
        this.ctx.arc(this.hoverDot.x, this.hoverDot.y, this.hoverDot.size + 2, 0, Math.PI * 2)
        this.ctx.stroke()
      }
    }
  }

  private updateStats() {
    const factions = this.getPalette().length
    const counts = new Array(factions).fill(0)
    for (const dot of this.dots) counts[dot.faction]++
    const total = this.dots.length
    this.onStatsChange?.(counts, total, this.fps)
  }

  private findDotAt(x: number, y: number) {
    for (let i = this.dots.length - 1; i >= 0; i--) {
      const dot = this.dots[i]
      const dx = x - dot.x
      const dy = y - dot.y
      if (dx * dx + dy * dy <= dot.size * dot.size) return dot
    }
    return null
  }
}
