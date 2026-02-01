import { Flex, Text } from '@radix-ui/themes'
import type { SimulationStats } from '../sim/types'

type SimulationStatsProps = {
  stats: SimulationStats
}

export function SimulationStats({ stats }: SimulationStatsProps) {
  return (
    <Flex justify="between">
      <Text size="1">FPS:</Text>
      <Text size="1" weight="medium">{stats.fps}</Text>
    </Flex>
  )
}
