import { Flex, Box, Heading, Button, Text } from '@radix-ui/themes'
import { Eraser, ReplaceAll, Plus, Minus } from "lucide-react";
import { SliderInput } from "./SliderInput";
import type { BattleControls } from "../sim/types";
import "./BattleSettings.css";

type BattleSettingsProps = {
  controls: BattleControls;
  palette: string[];
  onControlChange: (key: string, value: number) => void;
  onAddDotsForFaction: (faction: number, count?: number) => void;
  onRemoveFactionDots: (faction: number, count?: number) => void;
  onSetAllToFaction: (faction: number) => void;
};

export function BattleSettings({
  controls,
  palette,
  onControlChange,
  onAddDotsForFaction,
  onRemoveFactionDots,
  onSetAllToFaction,
}: BattleSettingsProps) {
  const handleAddDots = (index: number) => {
    onAddDotsForFaction(index, 100);
  };

  const handleRemoveDots = (index: number) => {
    onRemoveFactionDots(index, 100);
  };

  return (
    <Flex direction="column" gap="4">
      <Box>
        <Text as="div" size="2" mb="2">
          Battle radius
        </Text>
        <Flex gap="2" align="center">
          <SliderInput
            min={0}
            max={20}
            step={1}
            value={controls.battleRadius}
            onValueChange={(v) => onControlChange("battleRadius", v)}
          />
          <Text className="value">{controls.battleRadius}</Text>
        </Flex>
      </Box>

      <Box>
        <Text as="div" size="2" mb="2">
          Magnet strength
        </Text>
        <Flex gap="2" align="center">
          <SliderInput
            min={0}
            max={100}
            step={5}
            value={controls.magnetStrength}
            onValueChange={(v) => onControlChange("magnetStrength", v)}
          />
          <Text className="value">{controls.magnetStrength}</Text>
        </Flex>
      </Box>

      <Box>
        <Text as="div" size="2" mb="2">
          Mouse attraction
        </Text>
        <Flex gap="2" align="center">
          <SliderInput
            min={-1}
            max={1}
            step={0.05}
            value={controls.mouseAttraction}
            onValueChange={(v) => onControlChange("mouseAttraction", v)}
          />
          <Text className="value">{controls.mouseAttraction.toFixed(2)}</Text>
        </Flex>
      </Box>

      <Box>
        <Text as="div" size="2" mb="2">
          Mouse range
        </Text>
        <Flex gap="2" align="center">
          <SliderInput
            min={50}
            max={500}
            step={10}
            value={controls.mouseRange}
            onValueChange={(v) => onControlChange("mouseRange", v)}
          />
          <Text className="value">{controls.mouseRange}</Text>
        </Flex>
      </Box>

      <Box mt="2">
        <Heading as="h4" size="2" mb="3">
          Faction Controls
        </Heading>
        <Box className="faction-table">
          {palette.map((color, index) => (
            <Box
              key={`${color}-${index}`}
              className="faction-row"
              style={{ "--faction-color": color } as React.CSSProperties}
            >
              <Box className="faction-swatch" title={color} />
              <Button
                size="1"
                variant="outline"
                className="faction-action"
                title="Add 100 dots"
                onClick={() => handleAddDots(index)}
              >
                <Plus size={14} />
              </Button>
              <Button
                size="1"
                variant="outline"
                className="faction-action"
                title="Remove 100 dots"
                onClick={() => handleRemoveDots(index)}
              >
                <Minus size={14} />
              </Button>
              <Button
                size="1"
                variant="outline"
                className="faction-action"
                title="Set all dots to this faction"
                onClick={() => onSetAllToFaction(index)}
              >
                <ReplaceAll size={14} />
              </Button>
              <Button
                size="1"
                variant="outline"
                color="crimson"
                className="faction-action"
                title="Remove all dots for this faction"
                onClick={() => onRemoveFactionDots(index)}
              >
                <Eraser size={14} />
              </Button>
            </Box>
          ))}
        </Box>
      </Box>
    </Flex>
  );
}
