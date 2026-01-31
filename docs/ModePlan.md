## Plan: Mode System with Component Composition and Physics Separation

Transform DotBattle from an implicit mode system (based on `battleRadius === 0`) into an explicit, extensible architecture where modes have complete physics control, dedicated UI components, and clean separation of concerns through composition. This enables adding new modes (health-based combat, velocity coloring, shape obstacles) without modifying existing code.

**Key Architectural Principles:**

- **Complete physics isolation**: Each mode implements its own `update()` loop from scratch
- **Separation of concerns**: Mode = logic/physics, Renderer = drawing, utilities = reusable helpers
- **Type-safe generics**: `BaseMode<TControls, TStats>` ensures modes only receive correct data types
- **Component composition**: Mode-specific settings built from reusable pieces (`SliderInput`, `SharedSetupSettings`)
- **Display-only stats**: Stats components are purely visual, all interactions in settings
- **Public data access**: Modes expose dots, external code manipulates via utilities

* * *

**Steps**

1. **Create spatial grid utility** at src/sim/utils/SpatialGrid.ts

    - Class `SpatialGrid` with constructor taking `width`, `height`, `cellSize`
    - Store dots in grid cells using `Map<string, Dot[]>` with cell key `"x,y"`
    - `clear(): void` - empties all cells
    - `insert(dot: Dot): void` - adds dot to appropriate cell(s)
    - `getNearby(x: number, y: number, radius: number): Dot[]` - returns dots within radius
    - `forEachPair(callback: (a: Dot, b: Dot) => boolean): void` - iterates each unique pair once, callback returns true to mark pair as "processed" (won't be yielded again this iteration)
    - `forEachWithNeighbors(radius: number, callback: (dot: Dot, neighbors: Dot[]) => void): void` - for each dot, calls callback with nearby dots
    - Internally tracks processed pairs per iteration to avoid duplicate work
    - Cell size typically `max(8, maxDotSize * 5)` for optimal performance
2. **Create physics utilities** at src/sim/utils/physics.ts

    - `fixOutOfBounds(dot: Dot, width: number, height: number, damping: number): void` - bounces dot off walls, applies velocity damping
    - `applyForce(dot: Dot, fx: number, fy: number, strength: number): void` - adds force vector to dot velocity scaled by strength
    - `getDistanceSquared(x1: number, y1: number, x2: number, y2: number): number` - fast distance calculation without sqrt
    - `normalizeVector(x: number, y: number): { x: number; y: number; length: number }` - returns unit vector with original length
    - `clamp(value: number, min: number, max: number): number` - clamps value to range
    - All pure functions, no state
3. **Create dot manipulation utilities** at src/sim/utils/dotManipulation.ts

    - `addDotsForFaction(dots: Dot[], faction: number, count: number, spawner: () => Dot): void` - spawns and adds dots
    - `removeDotsForFaction(dots: Dot[], faction: number, count?: number): void` - removes count dots (or all if undefined) of faction
    - `setAllToFaction(dots: Dot[], faction: number): void` - changes all dots to faction
    - Takes spawner function as parameter so each mode can provide its own spawn logic
4. **Create shared mode utilities** at src/sim/modes/modeUtils.ts

    - `spawnDot(faction: number, minSize: number, maxSize: number, width: number, height: number): Dot` - creates random dot with random position, zero velocity, random size in range
    - `handleMouseForces(dots: Dot[], mouseState: MouseState, attraction: number, range: number): void` - applies attraction/repulsion from mouse
    - `handleClickImpulse(dots: Dot[], clickState: ClickImpulseState, dt: number): void` - applies radial force from shift-clicks
    - Type exports: `MouseState = { x: number; y: number; active: boolean }`, `ClickImpulseState = { x: number; y: number; strength: number; active: boolean }`
    - Modes can import and use these or implement custom versions
5. **Create Renderer class** at src/sim/Renderer.ts

    - Constructor: `(canvas: HTMLCanvasElement)`
    - `render(dots: Dot[], options: RenderOptions): void` where `RenderOptions = { getFactionColor: (faction: number) => string, menuDot?: Dot | null, showArena?: boolean }`
    - Clears canvas, draws arena boundary if enabled, draws each dot as circle with faction color, highlights menu dot if present
    - `resizeCanvas(): void` - handles high DPI scaling with `devicePixelRatio`
    - Single responsibility: rendering only, no physics or state
    - Future: subclass for WebGL renderer, particle effects, motion trails
6. **Create mode type system** in src/sim/types.ts

    - Add `ModeType = "battle" | "simulation"` type
    - Define generic `BaseMode<TControls, TStats = void>` interface:
    ```typescript
    interface BaseMode<TControls, TStats = void> {
      readonly dots: Dot[];  // Public read/write access
      update(dt: number): void;
      setControls(controls: TControls): void;
      destroy(): void;

      // Optional interaction handlers
      handleMouseMove?(x: number, y: number): void;
      handleMouseLeave?(): void;
      handleCanvasClick?(x: number, y: number, shiftKey: boolean): void;

      // Optional context menu support
      setMenuDot?(x: number, y: number): Dot | null;
      clearMenuDot?(): void;
      updateMenuDot?(size: number, faction: number): void;
    }
    ```
    - Define `BattleControls` type: `{ count, speed, minSize, maxSize, battleRadius, magnetStrength, mouseAttraction, mouseRange }`
    - Define `SimulationControls` type: `{ count, speed, minSize, maxSize, magnetStrength, mouseAttraction, mouseRange }` (no `repelAll` - always repels by definition)
    - Define `BattleStats` type: `{ factions: Array<{ count: number; color: string; percentage: number }>; totalDots: number; fps: number }`
    - Define `SimulationStats` type: `{ totalDots: number; fps: number; avgVelocity: number }`
    - Create App-level discriminated union: `type SimControls = ({ mode: "battle" } & BattleControls) | ({ mode: "simulation" } & SimulationControls)`
    - Create stats union: `type ModeStats = { mode: "battle"; data: BattleStats } | { mode: "simulation"; data: SimulationStats }`
    - Define `SimCallbacks<TStats>` type: `{ getPalette: () => string[]; getFactionColor: (index: number) => string; onStatsChange: (stats: TStats) => void }`
7. **Implement BattleMode** at src/sim/modes/BattleMode.ts

    - `class BattleMode implements BaseMode<BattleControls, BattleStats>`
    - Constructor: `(canvas: HTMLCanvasElement, controls: BattleControls, callbacks: SimCallbacks<BattleStats>)`
    - State: `public readonly dots: Dot[] = []`, `private grid: SpatialGrid`, `private processed = new Set<Dot>()`, `private mouseState: MouseState`, `private clickImpulse: ClickImpulseState`, `private menuDot: Dot | null`, stats tracking (fps, last stats time)
    - `init()`: spawns initial dots using `spawnDot` from modeUtils
    - `update(dt: number)`:
        - Clear processed set
        - Rebuild spatial grid with all dots
        - Iterate with `grid.forEachWithNeighbors()` to apply magnet forces (same-faction repel with -1 sign, different-faction attract with +1 sign) using `applyForce` from physics utils
        - Iterate with `grid.forEachPair()` to resolve battles: check if different factions, within `battleRadius`, not already processed, then size-weighted probabilistic color switch, mark both as processed
        - Call `handleMouseForces` and `handleClickImpulse` from modeUtils
        - Apply velocity to position for each dot
        - Call `fixOutOfBounds` for each dot from physics utils
        - Emit stats every 250ms with faction counts, colors, percentages
    - `setControls(controls: BattleControls)`: updates internal control values, doesn't reinitialize
    - Implements all optional handlers: `handleMouseMove`, `handleMouseLeave`, `handleCanvasClick` (shift-click for radial impulse), `setMenuDot`, `clearMenuDot`, `updateMenuDot`
    - `destroy()`: cleanup if needed
    - Future extension: health points system, same-faction clustering toggle
8. **Implement SimulationMode** at src/sim/modes/SimulationMode.ts

    - `class SimulationMode implements BaseMode<SimulationControls, SimulationStats>`
    - Constructor: `(canvas: HTMLCanvasElement, controls: SimulationControls, callbacks: SimCallbacks<SimulationStats>)`
    - State: `public readonly dots: Dot[] = []`, `private grid: SpatialGrid`, `private mouseState: MouseState`, stats tracking
    - `init()`: spawns initial dots using `spawnDot` from modeUtils
    - `update(dt: number)`:
        - Rebuild spatial grid
        - Iterate with `grid.forEachWithNeighbors()` to apply repulsion forces (all dots repel, -1 sign always) using `applyForce`
        - Call `handleMouseForces` from modeUtils (may skip if `mouseAttraction === 0`)
        - Apply velocity to position
        - Call `fixOutOfBounds` from physics utils
        - NO battle resolution
        - Emit stats with total dots, fps, average velocity
    - `setControls(controls: SimulationControls)`: updates internal control values
    - May skip some optional handlers (e.g., click impulse, context menu not needed)
    - `destroy()`: cleanup
    - Future extension: shape obstacles with custom collision detection, color by velocity gradient
9. **Refactor Simulation orchestrator** in [simulation.ts](vscode-file://vscode-app/c:/Users/loganjones/AppData/Local/Programs/Microsoft%20VS%20Code%20Insiders/7722bb2e96/resources/app/out/vs/code/electron-browser/workbench/workbench.html)

    - Becomes thin facade managing active mode and rendering
    - Constructor: `(canvas: HTMLCanvasElement, initialControls: SimControls, callbacks: SimCallbacks<any>)`
    - State: `private currentMode: BaseMode<any, any>`, `private renderer: Renderer`, `private paused: boolean`, animation frame tracking
    - `createMode(controls: SimControls)`: factory method checks `controls.mode` and returns `new BattleMode(...)` or `new SimulationMode(...)`
    - Animation loop using `requestAnimationFrame`: calculates `dt`, calls `currentMode.update(dt)` if not paused, always calls `render()`
    - `render()`: calls `renderer.render(currentMode.dots, { getFactionColor, menuDot, showArena: true })`
    - `setControls(controls: SimControls)`: if `controls.mode` changed, calls `switchMode()`, else calls `currentMode.setControls(controls)`
    - `switchMode(newControls: SimControls)`: destroys old mode, creates new mode via factory, calls `init()` on new mode
    - `setPaused(paused: boolean)`, `setPalette(palette: string[])`: update internal state
    - Delegates optional handlers safely: `handleMouseMove(x, y) { this.currentMode.handleMouseMove?.(x, y); }`
    - Public convenience methods for App (call dot manipulation utils): `addDotsForFaction(faction, count)`, `removeDotsForFaction(faction, count)`, `setAllToFaction(faction)`
    - `resizeCanvas()`: delegates to `renderer.resizeCanvas()`
    - `start()`, `stop()`, `destroy()`: animation frame lifecycle
    - Public API unchanged from App.tsx perspective (maintains compatibility)
10. **Create SharedSetupSettings component** at src/components/SharedSetupSettings.tsx

    - Props: `{ controls: { count: number; speed: number; minSize: number; maxSize: number }; onControlChange: (key: string, value: number) => void }`
    - Renders four sliders using `SliderInput` component: count (10-2000, step 10), speed (5-300, step 5), minSize (1-10, step 0.5), maxSize (2-20, step 0.5)
    - Uses Radix Flex for layout per instructions
    - Reusable across all modes
11. **Create BattleSettings component** at src/components/BattleSettings.tsx

    - Props: `{ controls: BattleControls; palette: string[]; onControlChange: (key: string, value: number) => void; onAddDotsForFaction: (faction: number) => void; onRemoveFactionDots: (faction: number, count?: number) => void; onSetAllToFaction: (faction: number) => void }`
    - Renders Battle-specific sliders using `SliderInput`: battleRadius (0-20, step 1), magnetStrength (0-100, step 5), mouseAttraction (0-100, step 5), mouseRange (50-300, step 10)
    - Renders faction control section:
        - Heading "Faction Controls"
        - Grid of colored buttons (one per palette color) using Radix Button
        - Inline style forbidden per instructions, use CSS custom property: `style={{ "--faction-color": color } as React.CSSProperties}` with CSS rule `.faction-button { background: var(--faction-color); }`
        - Click handlers: `onClick` checks `e.shiftKey` to choose add vs setAll, `onContextMenu` checks `e.shiftKey` to choose remove 50 vs remove all
        - Tooltip/title attribute: "Click: +50 | Shift+Click: Set all | Right-Click: -50 | Shift+Right-Click: Remove all"
    - Uses Radix Flex, Box, Heading per instructions
    - Wrapped content suitable for Accordion section
12. **Create SimulationSettings component** at src/components/SimulationSettings.tsx

    - Props: `{ controls: SimulationControls; onControlChange: (key: string, value: number) => void }`
    - Renders Simulation-specific sliders using `SliderInput`: magnetStrength (0-100, step 5, label "Repulsion Strength"), mouseAttraction (0-100, step 5), mouseRange (50-300, step 10)
    - No battleRadius, no faction controls
    - Uses Radix components per instructions
    - Future: obstacle controls, color mode selector
    - Wrapped content suitable for Accordion section
13. **Update SettingsPanel** in src/components/SettingsPanel.tsx

    - Add mode selector at top of Setup accordion section (before `SharedSetupSettings`):
        - Radix Select component with ChevronDown icon
        - Options: "Battle" (value "battle"), "Simulation" (value "simulation")
        - `onValueChange` calls `onControlChange("mode", value)` which triggers restart
        - Optional: Text description below explaining current mode
    - Setup section renders: Mode selector + `<SharedSetupSettings controls={controls} onControlChange={onControlChange} />`
    - Variables section (currently lines 124-199) replace existing controls with mode-specific components:
    ```tsx
    {controls.mode === "battle" && (
      <BattleSettings
        controls={controls}
        palette={palette}
        onControlChange={onControlChange}
        onAddDotsForFaction={onAddDotsForFaction}
        onRemoveFactionDots={onRemoveFactionDots}
        onSetAllToFaction={onSetAllToFaction}
      />
    )}
    {controls.mode === "simulation" && (
      <SimulationSettings
        controls={controls}
        onControlChange={onControlChange}
      />
    )}
    ```
    - Palette section (lines 247-451) unchanged, shared across all modes
    - Add props to SettingsPanel interface: `onAddDotsForFaction`, `onRemoveFactionDots`, `onSetAllToFaction`
14. **Create BattleStats component** at src/components/BattleStats.tsx

    - Props: `{ stats: BattleStats }`
    - Display-only, no interaction handlers
    - Renders faction bars: map over `stats.factions`, each showing colored bar (width based on `percentage`), count text
    - Use CSS custom property for bar color: `style={{ "--bar-color": faction.color } as React.CSSProperties}` with CSS `.faction-bar-fill { background: var(--bar-color); }`
    - Shows total dots and FPS at bottom
    - Styled with CSS in src/components/BattleStats.css
    - Uses Radix Flex, Box, Text per instructions
15. **Create SimulationStats component** at src/components/SimulationStats.tsx

    - Props: `{ stats: SimulationStats }`
    - Display-only
    - Simple text display: "Dots: {totalDots}", "Avg Speed: {avgVelocity.toFixed(1)}", "FPS: {fps}"
    - Uses Radix Flex, Text per instructions
    - Future: velocity histogram, density visualization
16. **Update StatsPanel** in src/components/StatsPanel.tsx

    - Change props from current interface to: `{ mode: ModeType; stats: BattleStats | SimulationStats }`
    - Remove: `palette`, `onFactionClick`, `onFactionContextMenu` props (no longer needed)
    - Conditionally render mode-specific stats component:
    ```tsx
    {mode === "battle" && <BattleStats stats={stats as BattleStats} />}
    {mode === "simulation" && <SimulationStats stats={stats as SimulationStats} />}
    ```
    - Container styling unchanged
17. **Update App.tsx state and effects** in src/App.tsx

    - Add mode to controls state initialization (line ~60): `const [controls, setControls] = useState<SimControls>({ mode: "battle", count: 500, speed: 60, minSize: 2, maxSize: 6, battleRadius: 5, magnetStrength: 80, mouseAttraction: 0, mouseRange: 150 })`
    - Add stats state: `const [stats, setStats] = useState<ModeStats>({ mode: "battle", data: { factions: [], totalDots: 0, fps: 0 } })`
    - Update callbacks object (line ~215) to include typed `onStatsChange`:
    ```typescript
    const callbacks = {
      getPalette: () => paletteRef.current,
      getFactionColor: (index: number) =>
        paletteRef.current.length
          ? paletteRef.current[index % paletteRef.current.length]
          : "#111827",
      onStatsChange: (newStats: BattleStats | SimulationStats) => {
        setStats({ mode: controls.mode, data: newStats });
      }
    };
    ```
    - Update controls useEffect (currently lines 247-249) to detect mode changes:
    ```typescript
    const prevModeRef = useRef<ModeType>(controls.mode);
    useEffect(() => {
      if (prevModeRef.current !== controls.mode) {
        simRef.current?.switchMode(controls);
        prevModeRef.current = controls.mode;
      } else {
        simRef.current?.setControls(controls);
      }
    }, [controls]);
    ```
    - Update SettingsPanel props (lines ~365-395): add `onAddDotsForFaction={(faction) => simRef.current?.addDotsForFaction(faction, 50)}`, `onRemoveFactionDots={(faction, count) => simRef.current?.removeDotsForFaction(faction, count)}`, `onSetAllToFaction={(faction) => simRef.current?.setAllToFaction(faction)}`
    - Update StatsPanel props (lines ~398-405): change to `mode={controls.mode}`, `stats={stats.data}`, remove `palette`, `onFactionClick`, `onFactionContextMenu`
    - Remove old faction interaction handlers: `handleFactionClick`, `handleFactionContextMenu` (no longer used)
    - Optional: Persist mode to localStorage similar to theme (lines ~72-76)
18. **File organization cleanup**

    - Create directory structure:
    ```
    src/sim/
      modes/
        BattleMode.ts
        SimulationMode.ts
        modeUtils.ts
        index.ts
      utils/
        SpatialGrid.ts
        physics.ts
        dotManipulation.ts
      Renderer.ts
      simulation.ts
      types.ts
    src/components/
      BattleSettings.tsx
      SimulationSettings.tsx
      SharedSetupSettings.tsx
      BattleStats.tsx
      BattleStats.css
      SimulationStats.tsx
      StatsPanel.tsx
      StatsPanel.css
      SettingsPanel.tsx
      SliderInput.tsx
    ```
    - Create src/sim/modes/index.ts: `export { BattleMode } from './BattleMode'; export { SimulationMode } from './SimulationMode';`
    - Update imports in src/sim/simulation.ts: `import { BattleMode, SimulationMode } from './modes';`
    - Update imports in src/App.tsx: add `import type { ModeType, ModeStats } from './sim/types';`

**Verification**

- Start app, verify Battle mode is default with current behavior preserved
- Verify faction bars in stats show correct counts and colors
- Switch to Simulation mode via dropdown in Setup section, verify simulation restarts
- Verify dots in Simulation mode all repel each other (no color switching)
- Verify Variables section shows BattleSettings in Battle mode (battleRadius slider, faction control buttons visible)
- Verify Variables section shows SimulationSettings in Simulation mode (no battleRadius, no faction buttons, "Repulsion Strength" label)
- Click faction buttons in BattleSettings Variables section, verify dots added/removed (not from stats panel)
- Test faction button modifiers: click (+50), shift+click (set all), right-click (-50), shift+right-click (remove all)
- Verify stats display is non-interactive (no click handlers on faction bars)
- Verify 60 FPS maintained during runtime and when switching modes
- Add `console.log` in BattleMode and SimulationMode `update()` to confirm correct mode is active
- Test context menu on dots when paused (size slider, color swatches) still works
- Verify high DPI displays render correctly (Renderer handles devicePixelRatio)
- Check TypeScript compilation with zero errors (discriminated unions, generics working)
- Test optional handlers: verify App doesn't crash if SimulationMode doesn't implement certain handlers

**Decisions**

- **Renderer separation**: Modes own logic/data, Renderer class handles canvas drawing (Single Responsibility Principle)
- **Public dots array**: Modes expose `readonly dots: Dot[]`, external code can read and manipulate directly
- **Dot manipulation utilities**: `addDotsForFaction` etc. are utility functions, not mode methods - more flexible and reusable
- **SpatialGrid with interaction tracking**: Prevents N² complexity and double-processing in single pass
- **Generics for type safety**: `BaseMode<TControls, TStats>` ensures compile-time correctness without union type casting
- **Optional handlers**: Modes implement only what they need (`handleMouseMove?()` syntax)
- **No repelAll in SimulationControls**: Simulation mode repels by definition, not configurable
- **Stats include display data**: Stats objects contain colors, percentages, pre-calculated for UI
- **Display-only stats panel**: All dot manipulation moved to settings, stats are purely visual
- **Mode switching triggers restart**: Cleaner than hot-swapping, matches "Setup" section semantics
- **Component composition over conditionals**: Mode-specific settings components composed from shared pieces

**Future Extensibility**

**Adding Health System to Battle Mode:**

1. Add `health: number` to Dot type in src/sim/types.ts
2. Add `healthEnabled: boolean, healthMax: number, healthRegenRate: number` to `BattleControls`
3. Update BattleMode.ts `init()` to initialize dot health
4. Update `resolveBattles()` to decrement health instead of instant switching, remove dots when health reaches 0
5. Add health regeneration in `update()` loop
6. Update `BattleStats` to include `factions: Array<{ ..., avgHealth: number }>`
7. Add health toggle, max slider, regen slider to BattleSettings.tsx
8. Update BattleStats.tsx to show health bars below faction bars
9. Zero changes to SimulationMode or other modes

**Adding Heatmap Mode (color by local density):**

1. Add `"heatmap"` to `ModeType` in src/sim/types.ts
2. Define `HeatmapControls` with `count, speed, minSize, maxSize, densityRadius, colorGradient: string[]`
3. Define `HeatmapStats` with `totalDots, fps, avgDensity, maxDensity`
4. Create HeatmapMode.ts implementing `BaseMode<HeatmapControls, HeatmapStats>`
5. Override color per dot in `update()` based on `grid.getNearby()` count (local density)
6. Store `dotColors: string[]` and modify Renderer to accept optional per-dot colors
7. Create HeatmapSettings.tsx with density radius slider, gradient color picker
8. Create HeatmapStats.tsx with density distribution graph
9. Add to `createMode()` factory in src/sim/simulation.ts
10. Add to SettingsPanel and StatsPanel conditionals
11. Zero changes to BattleMode or SimulationMode

**Adding Shape Obstacles to Simulation Mode:**

1. Define `Shape` type: `{ type: "circle" | "rect", x, y, width?, height?, radius?, repelStrength }`
2. Add `obstacles: Shape[]` to `SimulationControls`
3. Add `checkShapeCollision(dot: Dot, shape: Shape): { colliding: boolean, normal: {x, y} }` to physics utils
4. Update SimulationMode.ts `update()` to apply shape collision forces
5. Update `Renderer.render()` to accept optional `shapes: Shape[]` and draw them
6. Add obstacle editor UI to SimulationSettings.tsx with add/remove/edit controls
7. Zero changes to BattleMode

This architecture provides complete isolation between modes while maximizing code reuse through composition, generics, and utility functions. Each mode is self-contained and can evolve independently without risk of breaking other modes.
