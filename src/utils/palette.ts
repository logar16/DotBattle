import { rand } from './math'

export function normalizeHex(raw: string) {
  const cleaned = raw.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(cleaned)) return null
  const hex = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned
  return `#${hex.toLowerCase()}`
}

export function hsvToHex(h: number, s: number, v: number) {
  const c = v * s
  const hh = (h % 360) / 60
  const x = c * (1 - Math.abs((hh % 2) - 1))
  let r = 0
  let g = 0
  let b = 0
  if (hh >= 0 && hh < 1) [r, g, b] = [c, x, 0]
  else if (hh < 2) [r, g, b] = [x, c, 0]
  else if (hh < 3) [r, g, b] = [0, c, x]
  else if (hh < 4) [r, g, b] = [0, x, c]
  else if (hh < 5) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const m = v - c
  const toHex = (value: number) => Math.round((value + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function parsePaletteInput(text: string) {
  if (!text.trim()) return []
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => normalizeHex(String(entry))).filter(Boolean) as string[]
    }
  } catch {
    // fall through
  }
  return text
    .split(/[\s,]+/)
    .map((token) => normalizeHex(token))
    .filter(Boolean) as string[]
}

export function randomizePalette(count = Math.floor(rand(4, 9))) {
  const hueStep = 360 / count
  const baseHue = rand(0, 360)
  return Array.from({ length: count }, (_, i) => {
    const hue = (baseHue + hueStep * i + rand(-12, 12) + 360) % 360
    return hsvToHex(hue, rand(0.55, 0.9), rand(0.65, 0.95))
  })
}
