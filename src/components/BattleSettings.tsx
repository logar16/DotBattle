import { Flex, Box, Heading, Button, Text } from '@radix-ui/themes'
import { SliderInput } from './SliderInput'
import type { BattleControls } from '../sim/types'
import './BattleSettings.css'

type BattleSettingsProps = {
  controls: BattleControls
  palette: string[]
  onControlChange: (key: string, value: number) => void
  onAddDotsForFaction: (faction: number) => void
  onRemoveFactionDots: (faction: number, count?: number) => void
  onSetAllToFaction: (faction: number) => void
}

export function BattleSettings({
  controls,
  palette,
  onControlChange,
  onAddDotsForFaction,
  onRemoveFactionDots,
  onSetAllToFaction
}: BattleSettingsProps) {
  const handleFactionClick = (index: number, e: React.MouseEvent) => {
    if (e.shiftKey) {
      onSetAllToFaction(index)
    } else {
      onAddDotsForFaction(index)
    }
  }

  const handleFactionContextMenu = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    if (e.shiftKey) {
      onRemoveFactionDots(index)
    } else {
      onRemoveFactionDots(index, 50)
    }
  }

  return (
    <Flex direction="column" gap="4">
      <Box>
        <Text as="div" size="2" mb="2">Battle radius</Text>
        <Flex gap="2" align="center">
          <SliderInput
            min={0}
            max={20}
            step={1}
            value={controls.battleRadius}
            onValueChange={(v) => onControlChange('battleRadius', v)}
          />
          <Text className="value">{controls.battleRadius}</Text>
        </Flex>
      </Box>
      
      <Box>
        <Text as="div" size="2" mb="2">Magnet strength</Text>
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
      
      <Box mt="2">
        <Heading as="h4" size="2" mb="3">Faction Controls</Heading>
        <Flex gap="2" wrap="wrap">
          {palette.map((color, index) => (
            <Button
              key={index}
              className="faction-button"
              style={{ '--faction-color': color } as React.CSSProperties}
              onClick={(e) => handleFactionClick(index, e)}
              onContextMenu={(e) => handleFactionContextMenu(index, e)}
              title="Click: +50 | Shift+Click: Set all | Right-Click: -50 | Shift+Right-Click: Remove all"
            >
              {index}
            </Button>
          ))}
        </Flex>
      </Box>
    </Flex>
  )
}
