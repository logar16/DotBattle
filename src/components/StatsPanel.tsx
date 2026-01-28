import React from 'react'
import './StatsPanel.css'

interface StatsPanelProps {
  factions: number[]
  total: number
  fps: number
  palette: string[]
  onFactionClick: (faction: number, shiftKey: boolean) => void
  onFactionContextMenu: (faction: number, shiftKey: boolean) => void
}

export function StatsPanel({
  factions,
  total,
  fps,
  palette,
  onFactionClick,
  onFactionContextMenu,
}: StatsPanelProps) {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest('button[data-faction]') as HTMLButtonElement | null
    if (!target) return
    const faction = Number(target.dataset.faction)
    if (!Number.isFinite(faction)) return
    onFactionClick(faction, event.shiftKey)
  }

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest('button[data-faction]') as HTMLButtonElement | null
    if (!target) return
    event.preventDefault()
    const faction = Number(target.dataset.faction)
    if (!Number.isFinite(faction)) return
    onFactionContextMenu(faction, event.shiftKey)
  }

  return (
    <div className="stats" onClick={handleClick} onContextMenu={handleContextMenu}>
      {factions.map((count, index) => {
        const percent = total ? Math.round((count / total) * 100) : 0
        const color = palette[index % palette.length] ?? '#111827'
        return (
          <button
            type="button"
            data-faction={index}
            key={`faction-${index}`}
            style={{ '--faction-color': color } as React.CSSProperties}
          >
            <span className="faction-swatch">■</span>
            <span className="count">
              {count} ({percent}%)
            </span>
          </button>
        )
      })}
      <div className="total">
        <strong>Total</strong> <span className="count">{total}</span>
      </div>
      <div className="fps">
        <strong>FPS</strong> <span className="count">{Math.round(fps)}</span>
      </div>
      <div className="info-tooltip">
        <button type="button" aria-label="Faction controls info">
          i
        </button>
        <span>
          Click a faction swatch to add 50 dots. Shift + click converts all dots to that faction. Right-click removes
          50. Shift + right-click removes all dots for that faction.
        </span>
      </div>
    </div>
  )
}
