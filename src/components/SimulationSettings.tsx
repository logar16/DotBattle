import { Flex, Box, Text } from '@radix-ui/themes'
import { SliderInput } from './SliderInput'
import type { SimulationControls } from '../sim/types'

type SimulationSettingsProps = {
  controls: SimulationControls
  onControlChange: (key: string, value: number) => void
}

export function SimulationSettings({ controls, onControlChange }: SimulationSettingsProps) {
  return (
    <Flex direction="column" gap="4">
      <Box>
        <Text as="div" size="2" mb="2">Repulsion strength</Text>
        <Flex gap="2" align="center">
          <SliderInput
            min={0}
            max={100}
            step={5}
            value={controls.magnetStrength}
            onValueChange={(v) => onControlChange('magnetStrength', v)}
          />
          <Text className="value">{controls.magnetStrength}</Text>
        </Flex>
      </Box>
      
      <Box>
        <Text as="div" size="2" mb="2">Mouse attraction</Text>
        <Flex gap="2" align="center">
          <SliderInput
            min={-1}
            max={1}
            step={0.05}
            value={controls.mouseAttraction}
            onValueChange={(v) => onControlChange('mouseAttraction', v)}
          />
          <Text className="value">{controls.mouseAttraction.toFixed(2)}</Text>
        </Flex>
      </Box>
      
      <Box>
        <Text as="div" size="2" mb="2">Mouse range</Text>
        <Flex gap="2" align="center">
          <SliderInput
            min={50}
            max={500}
            step={10}
            value={controls.mouseRange}
            onValueChange={(v) => onControlChange('mouseRange', v)}
          />
          <Text className="value">{controls.mouseRange}</Text>
        </Flex>
      </Box>
    </Flex>
  )
}
