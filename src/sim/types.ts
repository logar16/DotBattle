export type Dot = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  faction: number
}

export type ClickImpulse = {
  x: number
  y: number
  radius: number
  radiusSq: number
  strength: number
  duration: number
  elapsed: number
  decay: number
}

export type MouseState = {
  x: number
  y: number
  active: boolean
}

// Legacy type for backward compatibility during migration
export type SimControls = {
  count: number
  speed: number
  minSize: number
  maxSize: number
  battleRadius: number
  magnetStrength: number
  mouseAttraction: number
  mouseRange: number
  repelAll: boolean
}

// New mode system types
export type ModeType = 'battle' | 'simulation'

export interface BaseMode<TControls, _TStats = never> {
  readonly dots: Dot[]
  update(dt: number): void
  setControls(controls: TControls): void
  destroy(): void

  handleMouseMove?(x: number, y: number): void
  handleMouseLeave?(): void
  handleCanvasClick?(x: number, y: number, shiftKey: boolean): void

  setMenuDot?(x: number, y: number): Dot | null
  clearMenuDot?(): void
  updateMenuDot?(size: number, faction: number): void
}

export type BattleControls = {
  count: number
  speed: number
  minSize: number
  maxSize: number
  battleRadius: number
  magnetStrength: number
  mouseAttraction: number
  mouseRange: number
}

export type SimulationControls = {
  count: number
  speed: number
  minSize: number
  maxSize: number
  magnetStrength: number
  mouseAttraction: number
  mouseRange: number
}

export type BattleStats = {
  factions: Array<{
    count: number
    color: string
    percentage: number
  }>
  totalDots: number
  fps: number
}

export type SimulationStats = {
  totalDots: number
  fps: number
  avgVelocity: number
}

export type NewSimControls =
  | ({ mode: 'battle' } & BattleControls)
  | ({ mode: 'simulation' } & SimulationControls)

export type ModeStats =
  | { mode: 'battle'; data: BattleStats }
  | { mode: 'simulation'; data: SimulationStats }

export type SimCallbacks<TStats = never> = {
  getPalette: () => string[]
  getFactionColor: (index: number) => string
  onStatsChange: (stats: TStats) => void
}
