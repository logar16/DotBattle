import type { Dot } from './types'

export type RenderOptions = {
  getFactionColor: (faction: number) => string
  menuDot?: Dot | null
  showArena?: boolean
}

export class Renderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private arenaPadding = { top: 12, right: 12, bottom: 20, left: 12 }

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context missing')
    this.canvas = canvas
    this.ctx = ctx
  }

  render(dots: Dot[], options: RenderOptions): void {
    const width = this.canvas.width / window.devicePixelRatio
    const height = this.canvas.height / window.devicePixelRatio
    const padding = this.arenaPadding

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (options.showArena) {
      this.ctx.strokeStyle = '#1f2937'
      this.ctx.lineWidth = 2
      this.ctx.strokeRect(
        padding.left,
        padding.top,
        width - padding.left - padding.right,
        height - padding.top - padding.bottom
      )
    }

    for (const dot of dots) {
      this.ctx.fillStyle = options.getFactionColor(dot.faction)
      this.ctx.beginPath()
      this.ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
      this.ctx.fill()
    }

    if (options.menuDot && dots.includes(options.menuDot)) {
      this.ctx.strokeStyle = 'limegreen'
      this.ctx.lineWidth = 2
      this.ctx.beginPath()
      this.ctx.arc(
        options.menuDot.x,
        options.menuDot.y,
        options.menuDot.size + 2,
        0,
        Math.PI * 2
      )
      this.ctx.stroke()
    }
  }

  resizeCanvas(): void {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    
    this.ctx.scale(dpr, dpr)
  }
}
