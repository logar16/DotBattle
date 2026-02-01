import type { Dot } from '../types'

export function addDotsForFaction(
  dots: Dot[],
  faction: number,
  count: number,
  spawner: () => Dot
): void {
  for (let i = 0; i < count; i++) {
    const dot = spawner()
    dot.faction = faction
    dots.push(dot)
  }
}

export function removeDotsForFaction(
  dots: Dot[],
  faction: number,
  count?: number
): void {
  if (count === undefined) {
    // Remove all dots of this faction
    for (let i = dots.length - 1; i >= 0; i--) {
      if (dots[i].faction === faction) {
        dots.splice(i, 1)
      }
    }
  } else {
    // Remove specific count
    let removed = 0
    for (let i = dots.length - 1; i >= 0 && removed < count; i--) {
      if (dots[i].faction === faction) {
        dots.splice(i, 1)
        removed++
      }
    }
  }
}

export function setAllToFaction(dots: Dot[], faction: number): void {
  for (const dot of dots) {
    dot.faction = faction
  }
}
