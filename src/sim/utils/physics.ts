import type { Dot } from '../types'

export function fixOutOfBounds(
  dot: Dot,
  width: number,
  height: number,
  damping: number
): void {
  if (dot.x < dot.size) {
    dot.x = dot.size
    dot.vx = Math.abs(dot.vx) * damping
  } else if (dot.x > width - dot.size) {
    dot.x = width - dot.size
    dot.vx = -Math.abs(dot.vx) * damping
  }

  if (dot.y < dot.size) {
    dot.y = dot.size
    dot.vy = Math.abs(dot.vy) * damping
  } else if (dot.y > height - dot.size) {
    dot.y = height - dot.size
    dot.vy = -Math.abs(dot.vy) * damping
  }
}

export function applyForce(
  dot: Dot,
  fx: number,
  fy: number,
  strength: number
): void {
  dot.vx += fx * strength
  dot.vy += fy * strength
}

export function getDistanceSquared(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1
  const dy = y2 - y1
  return dx * dx + dy * dy
}

export function normalizeVector(
  x: number,
  y: number
): { x: number; y: number; length: number } {
  const length = Math.sqrt(x * x + y * y)
  if (length === 0) {
    return { x: 0, y: 0, length: 0 }
  }
  return { x: x / length, y: y / length, length }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
