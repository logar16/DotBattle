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

**All form inputs and interactive elements MUST use Radix UI components** - no native HTML elements (except `<input type="color">` since Radix has no color picker).

### Required Radix Packages

#### Radix Primitives (for specialized controls)
- `@radix-ui/react-slider` → all range inputs (speed, size, radius, etc.)
- `@radix-ui/react-checkbox` → all checkboxes
- `@radix-ui/react-select` → all dropdowns/selects
- `@radix-ui/react-dialog` → all modals/dialogs
- `@radix-ui/react-context-menu` → right-click menus
- `@radix-ui/react-popover` → popovers
- `@radix-ui/react-accordion` → collapsible sections

#### Radix Themes (for common UI elements)
- `@radix-ui/themes` → Button, TextField, TextArea, Box, Flex, Card, Text, Heading, etc.

**Setup:** Wrap app root with `<Theme>` from `@radix-ui/themes`:
```typescript
// App.tsx or main component
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  return (
    <Theme appearance={theme} accentColor="blue" grayColor="slate" radius="medium" scaling="95%">
      {/* Your app content */}
    </Theme>
  );
}
```

**Theme Management:**
- Always store theme preference in localStorage: `localStorage.setItem('dotbattle.theme', theme)`
- Provide theme toggle UI (sun/moon icon button)
- Use `appearance` prop on Theme to control light/dark mode

### Standard Patterns

**Button:**
```typescript
import { Button } from '@radix-ui/themes';

// Icon button
<Button variant="ghost" onClick={handleClick}>
  <Icon size={16} />
</Button>

// Button with text
<Button variant="soft" onClick={handleSave}>
  <Save size={16} />
  <span>Save</span>
</Button>

// Variants: solid (default), soft, outline, ghost
```

**TextField (text input):**
```typescript
import { TextField } from '@radix-ui/themes';

<TextField.Root
  value={value}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
  placeholder="Enter text"
/>
```

**TextArea:**
```typescript
import { TextArea } from '@radix-ui/themes';

<TextArea
  value={value}
  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
  placeholder="Enter multiline text"
/>
```

**Layout Components:**
```typescript
import { Box, Flex, Card, Text, Heading } from '@radix-ui/themes';

// Card for panels/sections
<Card>
  <Heading as="h3" size="3">Section Title</Heading>
  <Flex direction="column" gap="4" mt="4">
    {/* Content */}
  </Flex>
</Card>

// Flex for layouts
<Flex gap="2" align="center" justify="between">
  <Text>Label</Text>
  <Button>Action</Button>
</Flex>

// Box for containers
<Box className="custom-class" p="4">
  {/* Content */}
</Box>
```

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

**Accordion (Collapsible Sections):**
```typescript
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

<Accordion.Root type="multiple" defaultValue={['section1', 'section2']}>
  <Accordion.Item value="section1">
    <Accordion.Header>
      <Accordion.Trigger className="accordion-trigger">
        <Flex align="center" justify="between" width="100%">
          <Heading as="h3" size="3">Section Title</Heading>
          <ChevronDown className="accordion-chevron" size={18} />
        </Flex>
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content className="accordion-content">
      <Flex direction="column" gap="4" mt="2">
        {/* Section content */}
      </Flex>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
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
- **Radix components are styled** - use their variants and props for common patterns
- **Use Radix layout components** (Box, Flex, Card) instead of divs for automatic theme adaptation
- **Use CSS theme tokens** for custom styles to support light/dark modes:
  - Colors: `var(--gray-1)` through `var(--gray-12)`, `var(--accent-9)`, `var(--color-background)`, `var(--color-panel)`, `var(--color-surface)`
  - Shadows: `var(--shadow-1)` through `var(--shadow-6)`
  - Borders: `var(--gray-6)` or `var(--gray-7)`
- **Use data attributes** for Radix primitive states: `[data-state="checked"]`, `[data-highlighted]`

```css
/* GOOD: Theme-aware colors */
.custom-panel {
  background: var(--color-panel);
  border: 1px solid var(--gray-6);
  color: var(--gray-12);
}

/* BAD: Hardcoded dark mode colors */
.custom-panel {
  background: #111827;
  border: 1px solid #3334;
  color: #e2e8f0;
}
```

## Common Pitfalls

### ❌ DON'T
```typescript
// Don't recreate simulation every render
function App() {
  const sim = new Simulation(canvas, palette); // BAD!
}

// Don't use native inputs (except color picker)
<input type="text" value={name} onChange={e => setName(e.target.value)} /> // BAD!
<textarea value={text} onChange={e => setText(e.target.value)} /> // BAD!
<button onClick={handleClick}>Click me</button> // BAD!
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

// Use Radix Themes components
import { Button, TextField, TextArea } from '@radix-ui/themes';
<TextField.Root value={name} onChange={e => setName(e.target.value)} /> // GOOD!
<TextArea value={text} onChange={e => setText(e.target.value)} /> // GOOD!
<Button onClick={handleClick}>Click me</Button> // GOOD!

// Use Radix primitives for specialized controls
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
# Primitives (specialized controls)
npm install @radix-ui/react-slider

# Themes (common UI elements)
npm install @radix-ui/themes

npm run dev # Restart dev server to resolve imports
```

**Don't forget:** Wrap app with `<Theme>` and import `@radix-ui/themes/styles.css` when adding Themes package.

---

**Remember:** The simulation runs independently of React. React controls it, but doesn't contain it. This separation is critical for performance.
