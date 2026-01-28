---
name: "React + TypeScript Development Standards"
description: "Guidelines for React components, Radix UI, and canvas performance in DotBattle"
applyTo: "**/*.{ts,tsx}"
---

# DotBattle React Development Standards

## Critical: Canvas Performance Rules

**NEVER store simulation state in React state.** The canvas renders thousands of dots at 60 FPS - simulation state must stay outside React.

- ✅ Use `useRef` for simulation instances and canvas elements
- ✅ Keep dots, positions, and physics in the `Simulation` class (pure TypeScript)
- ✅ Update simulation via methods, not by replacing the instance
- ❌ Never `useState` for dot positions, velocities, or canvas data
- ❌ Never trigger React renders from `requestAnimationFrame`

```typescript
// CORRECT: Simulation ref pattern
const simulationRef = useRef<Simulation | null>(null);
useEffect(() => {
  if (!canvasRef.current) return;
  simulationRef.current = new Simulation(canvasRef.current, palette);
  return () => simulationRef.current?.destroy();
}, []);

// Update simulation when settings change
useEffect(() => {
  simulationRef.current?.setSpeed(speed);
}, [speed]);

// WRONG: This kills performance
const [dots, setDots] = useState<Dot[]>([]); // Never do this!
```

## Radix UI Component Requirements

**All form inputs MUST use Radix UI components** - no native HTML inputs (except `<input type="color">` since Radix has no color picker).

### Required Radix Components
- `@radix-ui/react-slider` → all range inputs (speed, size, radius, etc.)
- `@radix-ui/react-checkbox` → all checkboxes
- `@radix-ui/react-select` → all dropdowns/selects
- `@radix-ui/react-dialog` → all modals/dialogs
- `@radix-ui/react-context-menu` → right-click menus
- `@radix-ui/react-popover` → popovers

### Standard Patterns

**Slider with value display:**
```typescript
<label>
  Speed
  <div className="row">
    <Slider.Root value={[speed]} onValueChange={([v]) => setSpeed(v)} min={5} max={300} step={5}>
      <Slider.Track>
        <Slider.Range />
      </Slider.Track>
      <Slider.Thumb />
    </Slider.Root>
    <span className="value">{speed}</span>
  </div>
</label>
```

**Checkbox:**
```typescript
import { Check } from 'lucide-react';

<label className="row">
  <Checkbox.Root checked={value} onCheckedChange={setValue}>
    <Checkbox.Indicator>
      <Check size={14} />
    </Checkbox.Indicator>
  </Checkbox.Root>
  Label text
</label>
```

**Select/Dropdown:**
```typescript
import { ChevronDown, Check } from 'lucide-react';

<Select.Root value={mode} onValueChange={setMode}>
  <Select.Trigger>
    <Select.Value />
    <Select.Icon><ChevronDown size={16} /></Select.Icon>
  </Select.Trigger>
  <Select.Portal>
    <Select.Content>
      <Select.Viewport>
        <Select.Item value="battle">
          <Select.ItemText>Battle mode</Select.ItemText>
          <Select.ItemIndicator><Check size={14} /></Select.ItemIndicator>
        </Select.Item>
      </Select.Viewport>
    </Select.Content>
  </Select.Portal>
</Select.Root>
```

## Component Architecture

### File Organization
```
src/
  components/           # React components only
    SettingsPanel.tsx
    SliderInput.tsx
  sim/                  # Pure TypeScript (NO React imports)
    simulation.ts
    dot.ts
  utils/                # Pure functions
    colors.ts
  types.ts              # Shared interfaces
  App.tsx               # Main orchestrator
```

### Component Extraction Rules
- **Extract UI sections** into separate components when they exceed ~100 lines
- **Create wrapper components** for repeated Radix patterns (e.g., `SliderInput`)
- **Keep components focused** - one responsibility per component
- **Lift shared state** to App.tsx (palette, controls, favorites)
- **Keep UI-only state local** (dialog open/closed, form inputs)

```typescript
// GOOD: Extracted component with clear props
interface SettingsPanelProps {
  palette: string[];
  controls: Controls;
  onPaletteChange: (palette: string[]) => void;
  onControlChange: (key: string, value: number | boolean) => void;
}

export function SettingsPanel({ palette, controls, onPaletteChange, onControlChange }: SettingsPanelProps) {
  // Component-specific UI state
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return <section className="settings">...</section>;
}
```

## TypeScript Standards

### Prop Interfaces
Always define explicit interfaces for component props:

```typescript
interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

export function SliderInput({ label, value, min, max, step, onChange }: SliderInputProps) {
  // ...
}
```

### Shared Types
Put shared types in `src/types.ts`:

```typescript
// types.ts
export interface Favorite {
  name: string;
  colors: string[];
}

export interface Controls {
  speed: number;
  battleRadius: number;
  magnetStrength: number;
  mouseAttraction: number;
  mouseRange: number;
  repelAll: boolean;
}
```

### Simulation Typing
Type all simulation methods properly:

```typescript
// simulation.ts
export class Simulation {
  public setPalette(palette: string[]): void { /* ... */ }
  public setSpeed(speed: number): void { /* ... */ }
  public handleCanvasClick(x: number, y: number, shiftKey: boolean): void { /* ... */ }
  public destroy(): void { /* ... */ }
}
```

## Icons

**Use Lucide React for all icons** - never use emoji or image files:

```typescript
import { Settings, Play, Pause, Maximize, Check, ChevronDown, Plus, Trash2 } from 'lucide-react';

<button>
  <Settings size={20} />
</button>
```

## Styling

### Inline Styles Are Forbidden

**NEVER use inline styles in JSX** - all styles must be defined in separate CSS files.

- ✅ Create a `.css` file next to each component (e.g., `SettingsPanel.tsx` → `SettingsPanel.css`)
- ✅ Use className to apply styles
- ❌ Never use the `style` prop on JSX elements
- ❌ No CSS-in-JS libraries (styled-components, emotion, etc.)

```typescript
// ❌ FORBIDDEN: Inline styles
<div style={{ color: 'red', fontSize: '14px' }}>Text</div>

// ✅ CORRECT: Use CSS file and className
<div className="error-text">Text</div>

// error-text defined in Component.css
.error-text {
  color: red;
  font-size: 14px;
}
```

**Exception Policy:**
If you encounter a situation where inline styles seem unavoidable (e.g., dynamic values that can't be expressed with CSS classes), **STOP and ask the user for a mitigation strategy** before proceeding. There is usually a better solution using CSS custom properties or data attributes.

### General Styling Guidelines

- **All styles in CSS files** - no inline styles or CSS-in-JS
- **Radix components are unstyled** - add styles in App.css or component.css
- **Use CSS custom properties** for theming: `var(--color-primary)`
- **Use data attributes** for Radix states: `[data-state="checked"]`, `[data-highlighted]`

```css
/* Radix Slider */
.slider-root { position: relative; display: flex; align-items: center; }
.slider-track { background-color: #ddd; flex-grow: 1; height: 4px; }
.slider-range { background-color: var(--color-primary); height: 100%; }
.slider-thumb { width: 16px; height: 16px; background: white; border: 2px solid var(--color-primary); }

/* Radix Select */
.select-item[data-highlighted] { background-color: var(--color-primary); color: white; }
```

## Common Pitfalls

### ❌ DON'T
```typescript
// Don't recreate simulation every render
function App() {
  const sim = new Simulation(canvas, palette); // BAD!
}

// Don't use native inputs
<input type="range" value={speed} onChange={e => setSpeed(+e.target.value)} /> // BAD!

// Don't store canvas data in state
const [dotPositions, setDotPositions] = useState([]); // BAD!

// Don't use inline styles
<div style={{ color: 'red' }}>Text</div> // BAD!
```

### ✅ DO
```typescript
// Use refs for simulation
function App() {
  const simRef = useRef<Simulation | null>(null);
  useEffect(() => {
    simRef.current = new Simulation(canvas, palette);
    return () => simRef.current?.destroy();
  }, []);
}

// Use Radix components
<Slider.Root value={[speed]} onValueChange={([v]) => setSpeed(v)} /> // GOOD!

// Keep canvas data in the class
class Simulation {
  private dots: Dot[] = []; // GOOD!
}
```

## Performance Checklist

When modifying code, verify:
- [ ] Canvas component minimizes re-renders
- [ ] No simulation state leaked into React state
- [ ] Simulation instance created once (in useEffect)
- [ ] Cleanup function calls `simulation.destroy()`
- [ ] Animation loop uses `requestAnimationFrame` (not React lifecycle)
- [ ] Refs used for simulation callbacks and instances

## New Component Checklist

When creating components:
- [ ] Props typed with TypeScript interface
- [ ] Radix components used for all inputs
- [ ] Lucide React icons (not emoji)
- [ ] Styles in CSS file (not inline)
- [ ] Cleanup in useEffect return (if needed)
- [ ] No canvas/simulation state in React state
- [ ] Shared types in types.ts (not inline)

## Installation Note

After installing new Radix packages:
```bash
npm install @radix-ui/react-slider
npm run dev # Restart dev server to resolve imports
```

---

**Remember:** The simulation runs independently of React. React controls it, but doesn't contain it. This separation is critical for performance.
