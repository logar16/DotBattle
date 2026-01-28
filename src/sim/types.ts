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
