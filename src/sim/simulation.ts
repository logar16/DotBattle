import type { SimControls, NewSimControls, BattleControls, SimulationControls, BaseMode, BattleStats, SimulationStats, ModeType } from './types'
import { Renderer } from './Renderer'
import { BattleMode, SimulationMode } from './modes'
import { addDotsForFaction, removeDotsForFaction, setAllToFaction } from './utils/dotManipulation'
import { spawnDot } from './modes/modeUtils'

export type SimulationOptions = {
  getPalette: () => string[]
  getFactionColor: (index: number) => string
  onStatsChange?: (counts: number[], total: number, fps: number) => void
}

export class Simulation {
  private canvas: HTMLCanvasElement
  private renderer: Renderer
  private currentMode: BaseMode<any, any>
  private currentModeType: ModeType = 'battle'
  private controls: SimControls | NewSimControls
  private getFactionColor: (index: number) => string
  private getPalette: () => string[]
  private onStatsChange?: (counts: number[], total: number, fps: number) => void

  private paused = false
  private lastTime = 0
  private lastSimulationTime = 0
  private lastFrameTime = 0
  private fps = 0
  private targetFps = 60
  private hoverDot: any = null
  private needsRender = true
  private rafId: number | null = null

  constructor(canvas: HTMLCanvasElement, controls: SimControls | NewSimControls, options: SimulationOptions) {
    this.canvas = canvas
    this.renderer = new Renderer(canvas)
    this.controls = controls
    this.getFactionColor = options.getFactionColor
    this.getPalette = options.getPalette
    this.onStatsChange = options.onStatsChange

    // Determine mode type
    if ('mode' in controls) {
      this.currentModeType = controls.mode
    }

    this.currentMode = this.createMode(this.currentModeType, controls)
  }

  private createMode(modeType: ModeType, controls: SimControls | NewSimControls): BaseMode<any, any> {
    if (modeType === 'battle') {
      const battleControls: BattleControls = {
        count: controls.count,
        speed: controls.speed,
        minSize: controls.minSize,
        maxSize: controls.maxSize,
        battleRadius: 'battleRadius' in controls ? controls.battleRadius : 5,
        magnetStrength: controls.magnetStrength,
        mouseAttraction: controls.mouseAttraction,
        mouseRange: controls.mouseRange
      }

      return new BattleMode(this.canvas, battleControls, {
        getPalette: this.getPalette,
        getFactionColor: this.getFactionColor,
        onStatsChange: (stats: BattleStats) => {
          if (this.onStatsChange) {
            const counts = stats.factions.map(f => f.count)
            this.onStatsChange(counts, stats.totalDots, stats.fps)
          }
        }
      })
    } else {
      const simControls: SimulationControls = {
        count: controls.count,
        speed: controls.speed,
        minSize: controls.minSize,
        maxSize: controls.maxSize,
        magnetStrength: controls.magnetStrength,
        mouseAttraction: controls.mouseAttraction,
        mouseRange: controls.mouseRange
      }

      return new SimulationMode(this.canvas, simControls, {
        getPalette: this.getPalette,
        getFactionColor: this.getFactionColor,
        onStatsChange: (stats: SimulationStats) => {
          if (this.onStatsChange) {
            this.onStatsChange([stats.totalDots], stats.totalDots, stats.fps)
          }
        }
      })
    }
  }

  start() {
    this.stop()
    this.renderer.resizeCanvas()
    this.loop(performance.now())
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = null
  }

  restart() {
    // Force reinitialize by destroying and recreating the current mode
    this.currentMode.destroy()
    this.currentMode = this.createMode(this.currentModeType, this.controls)
    this.needsRender = true
  }

  setControls(next: SimControls | NewSimControls) {
    const newModeType: ModeType = 'mode' in next ? next.mode : 'battle'
    const oldCount = this.controls.count
    
    // Check if mode changed
    if (newModeType !== this.currentModeType) {
      // Mode switch - destroy old mode and create new one
      this.currentMode.destroy()
      this.currentModeType = newModeType
      this.currentMode = this.createMode(newModeType, next)
      this.controls = next
      this.needsRender = true
      return
    }

    // Same mode - just update controls
    this.controls = next
    
    if (newModeType === 'battle') {
      const battleControls: BattleControls = {
        count: next.count,
        speed: next.speed,
        minSize: next.minSize,
        maxSize: next.maxSize,
        battleRadius: 'battleRadius' in next ? next.battleRadius : 5,
        magnetStrength: next.magnetStrength,
        mouseAttraction: next.mouseAttraction,
        mouseRange: next.mouseRange
      }
      // If count changed, reinit mode directly (faster than delegating to mode)
      if (next.count !== oldCount) {
        this.currentMode.destroy()
        this.currentMode = this.createMode(newModeType, next)
        this.needsRender = true
      } else {
        this.currentMode.setControls(battleControls)
      }
    } else {
      const simControls: SimulationControls = {
        count: next.count,
        speed: next.speed,
        minSize: next.minSize,
        maxSize: next.maxSize,
        magnetStrength: next.magnetStrength,
        mouseAttraction: next.mouseAttraction,
        mouseRange: next.mouseRange
      }
      // If count changed, reinit mode directly (faster than delegating to mode)
      if (next.count !== oldCount) {
        this.currentMode.destroy()
        this.currentMode = this.createMode(newModeType, next)
        this.needsRender = true
      } else {
        this.currentMode.setControls(simControls)
      }
    }
  }

  setPalette(colors: string[]) {
    if (!colors.length) {
      this.currentMode.dots.length = 0
      this.needsRender = true
      return
    }
    
    for (const dot of this.currentMode.dots) {
      dot.faction = dot.faction % colors.length
    }
    
    this.needsRender = true
  }

  setPaused(paused: boolean) {
    this.paused = paused
    this.needsRender = true
  }

  setMenuDotAt(x: number, y: number) {
    if (this.currentMode.setMenuDot) {
      const dot = this.currentMode.setMenuDot(x, y)
      this.hoverDot = dot
      if (dot) this.needsRender = true
      return dot
    }
    return null
  }

  clearMenuDot() {
    this.currentMode.clearMenuDot?.()
    this.hoverDot = null
    this.needsRender = true
  }

  updateMenuDotSize(size: number) {
    this.currentMode.updateMenuDot?.(size, undefined)
    this.needsRender = true
  }

  updateMenuDotFaction(faction: number) {
    this.currentMode.updateMenuDot?.(undefined, faction)
    this.needsRender = true
  }

  setAllToFaction(faction: number) {
    setAllToFaction(this.currentMode.dots, faction)
    this.needsRender = true
  }

  addDotsForFaction(faction: number, count = 50) {
    const { minSize, maxSize } = this.controls
    const rect = this.canvas.getBoundingClientRect()
    
    addDotsForFaction(this.currentMode.dots, faction, count, () => {
      return spawnDot(faction, minSize, maxSize, rect.width, rect.height)
    })
    
    this.needsRender = true
  }

  removeFactionDots(faction: number, count?: number) {
    removeDotsForFaction(this.currentMode.dots, faction, count)
    this.needsRender = true
  }

  handleMouseMove(x: number, y: number) {
    this.currentMode.handleMouseMove?.(x, y)
    
    if (this.paused) {
      this.hoverDot = this.findDotAt(x, y)
      this.needsRender = true
    }
  }

  handleMouseLeave() {
    this.currentMode.handleMouseLeave?.()
    
    if (this.paused) {
      this.hoverDot = null
      this.needsRender = true
    }
  }

  handleShiftClick(x: number, y: number) {
    if (this.paused) return
    this.currentMode.handleCanvasClick?.(x, y, true)
    this.needsRender = true
  }

  handleCanvasClick(x: number, y: number, shiftKey: boolean) {
    if (this.paused && shiftKey) return
    this.currentMode.handleCanvasClick?.(x, y, shiftKey)
    this.needsRender = true
  }

  resizeCanvas() {
    this.renderer.resizeCanvas()
    this.needsRender = true
  }

  private loop = (timestamp: number) => {
    if (document.hidden) {
      this.lastFrameTime = timestamp
      this.lastSimulationTime = timestamp
      this.lastTime = timestamp
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
      
      this.currentMode.update(dt)
      
      this.lastSimulationTime = timestamp
      
      if (this.lastFrameTime) {
        const frameMs = timestamp - this.lastFrameTime
        if (frameMs > 0) {
          const currentFps = 1000 / frameMs
          this.fps = this.fps ? this.fps * 0.9 + currentFps * 0.1 : currentFps
          
          if (this.currentMode instanceof BattleMode) {
            this.currentMode.setFps(this.fps)
          } else if (this.currentMode instanceof SimulationMode) {
            this.currentMode.setFps(this.fps)
          }
        }
      }
      this.lastFrameTime = timestamp
    } else if (this.paused) {
      this.lastTime = timestamp
      this.lastSimulationTime = timestamp
    } else {
      // Simulation is throttled - still update lastTime to avoid delta spikes
      this.lastTime = timestamp
    }

    if (!this.paused || this.needsRender) {
      this.renderer.render(this.currentMode.dots, {
        getFactionColor: this.getFactionColor,
        menuDot: this.paused ? this.hoverDot : null,
        showArena: true
      })
      this.needsRender = false
    }

    if (this.currentMode instanceof BattleMode) {
      this.currentMode.updateStats(timestamp)
    } else if (this.currentMode instanceof SimulationMode) {
      this.currentMode.updateStats(timestamp)
    }

    this.rafId = requestAnimationFrame(this.loop)
  }

  private findDotAt(x: number, y: number) {
    for (let i = this.currentMode.dots.length - 1; i >= 0; i--) {
      const dot = this.currentMode.dots[i]
      const dx = x - dot.x
      const dy = y - dot.y
      if (dx * dx + dy * dy <= dot.size * dot.size) return dot
    }
    return null
  }

  destroy() {
    this.stop()
    this.currentMode.destroy()
  }
}
