import type { Dot, MouseState } from '../types'

export type ClickImpulseState = {
  x: number
  y: number
  strength: number
  active: boolean
}

export function spawnDot(
  faction: number,
  minSize: number,
  maxSize: number,
  width: number,
  height: number
): Dot {
  const size = minSize + Math.random() * (maxSize - minSize)
  return {
    x: size + Math.random() * (width - size * 2),
    y: size + Math.random() * (height - size * 2),
    vx: 0,
    vy: 0,
    size,
    faction
  }
}

export function handleMouseForces(
  dots: Dot[],
  mouseState: MouseState,
  attraction: number,
  range: number
): void {
  if (!mouseState.active || attraction === 0) return

  const rangeSq = range * range

  for (const dot of dots) {
    const dx = mouseState.x - dot.x
    const dy = mouseState.y - dot.y
    const distSq = dx * dx + dy * dy

    if (distSq < rangeSq && distSq > 0) {
      const dist = Math.sqrt(distSq)
      const force = attraction * (1 - dist / range) * 0.5
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force

      dot.vx += fx
      dot.vy += fy
    }
  }
}

export function handleClickImpulse(
  dots: Dot[],
  clickState: ClickImpulseState,
  dt: number
): void {
  if (!clickState.active) return

  const radius = 100
  const radiusSq = radius * radius
  const force = clickState.strength * 0.5

  for (const dot of dots) {
    const dx = dot.x - clickState.x
    const dy = dot.y - clickState.y
    const distSq = dx * dx + dy * dy

    if (distSq < radiusSq && distSq > 0) {
      const dist = Math.sqrt(distSq)
      const impulse = force * (1 - dist / radius) * dt
      const fx = (dx / dist) * impulse
      const fy = (dy / dist) * impulse

      dot.vx += fx
      dot.vy += fy
    }
  }
}
