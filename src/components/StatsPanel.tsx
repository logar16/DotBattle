import { Box } from "@radix-ui/themes";
import { BattleStats } from "./BattleStats";
import { SimulationStats } from "./SimulationStats";
import type { ModeType, BattleStats as BattleStatsType, SimulationStats as SimulationStatsType } from "../sim/types";
import "./StatsPanel.css";

interface StatsPanelProps {
  mode: ModeType;
  stats: BattleStatsType | SimulationStatsType;
}

export function StatsPanel({ mode, stats }: StatsPanelProps) {
  return (
    <Box className="stats">
      {mode === "battle" && <BattleStats stats={stats as BattleStatsType} />}
      {mode === "simulation" && <SimulationStats stats={stats as SimulationStatsType} />}
    </Box>
  );
}
