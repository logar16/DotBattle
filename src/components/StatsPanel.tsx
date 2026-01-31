import React from 'react'
import { Button, Box, Flex, Text } from "@radix-ui/themes";
import "./StatsPanel.css";

interface StatsPanelProps {
  factions: number[];
  total: number;
  fps: number;
  palette: string[];
  onFactionClick: (faction: number, shiftKey: boolean) => void;
  onFactionContextMenu: (faction: number, shiftKey: boolean) => void;
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
    const target = (event.target as HTMLElement).closest(
      "[data-faction]",
    ) as HTMLButtonElement | null;
    if (!target) return;
    const faction = Number(target.dataset.faction);
    if (!Number.isFinite(faction)) return;
    onFactionClick(faction, event.shiftKey);
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest(
      "[data-faction]",
    ) as HTMLButtonElement | null;
    if (!target) return;
    event.preventDefault();
    const faction = Number(target.dataset.faction);
    if (!Number.isFinite(faction)) return;
    onFactionContextMenu(faction, event.shiftKey);
  };

  return (
    <Box
      className="stats"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {factions.map((count, index) => {
        const percent = total ? Math.round((count / total) * 100) : 0;
        const color = palette[index % palette.length] ?? "#111827";
        return (
          <Button
            type="button"
            variant="ghost"
            data-faction={index}
            key={`faction-${index}`}
            style={{ "--faction-color": color } as React.CSSProperties}
          >
            <Text as="span" className="faction-swatch">
              ■
            </Text>
            <Text as="span" className="count">
              {count} ({percent}%)
            </Text>
          </Button>
        );
      })}
      <Flex className="total" gap="2">
        <Text weight="bold">Total</Text> <Text className="count">{total}</Text>
      </Flex>
      <Flex className="fps" gap="2">
        <Text weight="bold">FPS</Text>{" "}
        <Text className="count">{Math.round(fps)}</Text>
      </Flex>
      <Box className="info-tooltip">
        <Button
          type="button"
          variant="ghost"
          aria-label="Faction controls info"
        >
          i
        </Button>
        <Text as="span">
          Click a faction swatch to add 50 dots. Shift + click converts all dots
          to that faction. Right-click removes 50. Shift + right-click removes
          all dots for that faction.
        </Text>
      </Box>
    </Box>
  );
}
