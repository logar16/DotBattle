import { Flex, Text, Box } from '@radix-ui/themes'
import { SliderInput } from './SliderInput'

type SharedSetupSettingsProps = {
  controls: {
    count: number
    speed: number
    minSize: number
    maxSize: number
  }
  onControlChange: (key: string, value: number) => void
}

export function SharedSetupSettings({ controls, onControlChange }: SharedSetupSettingsProps) {
  return (
    <Flex direction="column" gap="4">
      <Box>
        <Text as="div" size="2" mb="2">Dot count</Text>
        <Flex gap="2" align="center">
          <SliderInput
            min={10}
            max={2000}
            step={10}
            value={controls.count}
            onValueChange={(v) => onControlChange('count', v)}
          />
          <Text className="value">{controls.count}</Text>
        </Flex>
      </Box>
      
      <Box>
        <Text as="div" size="2" mb="2">Speed</Text>
        <Flex gap="2" align="center">
          <SliderInput
            min={5}
            max={300}
            step={5}
            value={controls.speed}
            onValueChange={(v) => onControlChange('speed', v)}
          />
          <Text className="value">{controls.speed}</Text>
        </Flex>
      </Box>
      
      <Box>
        <Text as="div" size="2" mb="2">Min size</Text>
        <Flex gap="2" align="center">
          <SliderInput
            min={1}
            max={10}
            step={0.5}
            value={controls.minSize}
            onValueChange={(v) => onControlChange('minSize', v)}
          />
          <Text className="value">{controls.minSize}</Text>
        </Flex>
      </Box>
      
      <Box>
        <Text as="div" size="2" mb="2">Max size</Text>
        <Flex gap="2" align="center">
          <SliderInput
            min={2}
            max={20}
            step={0.5}
            value={controls.maxSize}
            onValueChange={(v) => onControlChange('maxSize', v)}
          />
          <Text className="value">{controls.maxSize}</Text>
        </Flex>
      </Box>
    </Flex>
  )
}
