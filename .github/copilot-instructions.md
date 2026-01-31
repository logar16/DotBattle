# DotBattle - Copilot Instructions

DotBattle is a React + TypeScript canvas simulation where colored dots battle using physics-based interactions.

## Build, Test, and Lint Commands

```bash
# Development server (runs on port 6416)
npm run dev

# Type-check and build for production
npm run build

# Lint all TypeScript/TSX files
npm run lint

# Preview production build
npm run preview
```

## Critical: Canvas Performance Architecture

**The simulation runs outside React at 60 FPS.** Never store simulation state (dots, positions, velocities) in React state.

### Simulation Lifecycle Pattern

```typescript
// ✅ CORRECT: Create simulation once, control via methods
const simRef = useRef<Simulation | null>(null);

useEffect(() => {
  if (!canvasRef.current) return;
  simRef.current = new Simulation(canvas, controls, options);
  simRef.current.start();
  return () => simRef.current?.destroy();
}, []); // Create once only

// Update simulation when settings change
useEffect(() => {
  simRef.current?.setControls(controls);
}, [controls]);

// ❌ WRONG: Never store canvas data in React state
const [dots, setDots] = useState<Dot[]>([]); // Kills performance!
```

### React ↔ Simulation Boundary

- **React manages:** UI state (palette, controls, favorites), theme, localStorage
- **Simulation manages:** Canvas rendering, physics, dot data, mouse interactions
- **Communication:** React calls simulation methods (e.g., `setPalette()`, `setControls()`)
- **Never:** Call React state setters from `requestAnimationFrame` loop
- **Stats updates:** Throttled to 100ms intervals via optional callback

## Key Conventions

### Palette System

- Each color in the palette defines a faction
- Battle mechanics: Color N attracts color N-1, repels color N+1 (circular)
- Favorites stored in localStorage as JSON: `dotbattle.paletteFavorites` → `{ name: string, colors: string[] }[]`
- Colors passed to simulation via `getFactionColor` callback (not stored in simulation)

### Physics Concepts

- **Battle radius:** Distance where dots detect allies/enemies
- **Magnet strength:** Attraction force toward allies
- **Mouse attraction:** Optional magnetic pull toward cursor
- **Click impulse:** Shift+click creates temporary repulsion wave
- **Spatial grid:** Optimizes collision detection from O(n²) to ~O(n)

### Context Menu System

- Right-click a dot to select it (stored as `menuDot` ref)
- Menu options: change size/faction, spawn 50 clones, convert all dots to faction
- Highlighted dot rendered differently during menu interaction

### Theme Management

- Stored in localStorage: `dotbattle.theme` (`"light"` | `"dark"`)
- App wrapped in `<Theme appearance={theme}>` from `@radix-ui/themes`
- Toggle UI: sun/moon icon button in top-right

## UI Component Rules

**All form inputs MUST use Radix UI** (detailed patterns in `.github/instructions/react-typescript.instructions.md`):

- Sliders: `@radix-ui/react-slider`
- Checkboxes: `@radix-ui/react-checkbox`  
- Selects: `@radix-ui/react-select`
- Dialogs: `@radix-ui/react-dialog`
- Context menus: `@radix-ui/react-context-menu`
- Accordions: `@radix-ui/react-accordion`
- Buttons/TextField/Flex/Card: `@radix-ui/themes`

**Icons:** Use `lucide-react` only (never emoji or image files)

### Styling Rules

- ❌ **Never use inline styles** (`style` prop forbidden)
- ✅ Create separate `.css` files (e.g., `Component.tsx` → `Component.css`)
- ✅ Use CSS custom properties: `var(--gray-1)`, `var(--color-panel)`, `var(--accent-9)`, etc.
- ✅ Use Radix layout components (Box, Flex, Card) for automatic theme support
- If dynamic values seem necessary, ask user for mitigation strategy (usually solvable with CSS custom properties)

### TypeScript Standards

- Always define explicit prop interfaces for components
- Put shared app types in `src/types.ts` (e.g., `Favorite`)
- Put simulation types in `src/sim/types.ts` (e.g., `Dot`, `SimControls`)
- Type all public simulation methods with explicit return types

## Component Extraction Guidelines

Extract components when:
- A section exceeds ~100 lines
- A Radix pattern is repeated (create wrapper like `SliderInput`)
- A logical UI boundary exists (settings panel, stats panel)

**State placement:**
- Shared state (palette, controls, favorites) → lift to `App.tsx`
- UI-only state (dialog open/closed) → keep local to component

## Common Patterns

### Adding a New Control

1. Add field to `SimControls` type in `src/sim/types.ts`
2. Add default value in `App.tsx` controls state
3. Add UI element (slider/checkbox) in `SettingsPanel.tsx` 
4. Update `Simulation.setControls()` to apply the new value
5. Use the value in physics calculations (e.g., in `update()` or `applyBattleForces()`)

### Adding a Palette Operation

1. Add utility function in `src/utils/palette.ts` if needed
2. Create handler function in `App.tsx` (prefix with `handle`)
3. Wire handler to button/input in `SettingsPanel.tsx`
4. Test with various palette sizes (0-20 colors)

### Modifying Physics

- Edit `src/sim/simulation.ts` (main methods: `applyBattleForces()`, `update()`, `loop()`)
- No React imports allowed in `sim/` directory
- Test with varying dot counts (100 to 2000+)
- Verify FPS stays ≥60 with 1000+ dots

## Performance Considerations

- Spatial grid reduces collision checks from O(n²) to ~O(n)
- `needsRender` flag prevents unnecessary canvas clears when paused
- Canvas resizing uses double `requestAnimationFrame` to ensure DOM updates settle
- Stats callback throttled to avoid excessive React renders

## File Organization

```
src/
  components/     # React UI components only
  sim/            # Pure TypeScript (NO React imports)
  utils/          # Pure functions (palette, math)
  types.ts        # Shared app types
  App.tsx         # Main orchestrator
```

**Rule:** Files in `sim/` must never import from React or `components/`

## References

- Detailed React/TypeScript patterns: `.github/instructions/react-typescript.instructions.md`
- Radix UI Primitives: https://www.radix-ui.com/primitives
- Radix Themes: https://www.radix-ui.com/themes
- Lucide icons: https://lucide.dev/
