import { Flex, Box, Text } from '@radix-ui/themes'
import type { BattleStats } from '../sim/types'
import './BattleStats.css'

type BattleStatsProps = {
  stats: BattleStats
}

export function BattleStats({ stats }: BattleStatsProps) {
  // Filter out factions with zero dots for the bar only
  const activeFactions = stats.factions.filter(f => f.count > 0);
  
  return (
    <div className="battle-stats-container">
      <div className="faction-composition-bar">
        {activeFactions.map((faction, index) => (
          <div
            key={index}
            className="faction-segment"
            style={{
              '--segment-color': faction.color,
              width: `${faction.percentage}%`
            } as React.CSSProperties}
            title={`${faction.percentage.toFixed(1)}% (${faction.count} dots)`}
          />
        ))}
      </div>
      
      <div className="faction-percentages">
        <Flex gap="3" wrap="wrap">
          {stats.factions.map((faction, index) => (
            <Text key={index} size="1">
              <Box
                as="span"
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '2px',
                  backgroundColor: faction.color,
                  marginRight: '4px'
                }}
              />
              {faction.percentage.toFixed(1)}%
            </Text>
          ))}
        </Flex>
        <Text size="1">FPS: {stats.fps}</Text>
      </div>
    </div>
  )
}
