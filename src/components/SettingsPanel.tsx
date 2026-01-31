import * as Checkbox from "@radix-ui/react-checkbox";
import * as Accordion from "@radix-ui/react-accordion";
import {
  Button,
  TextField,
  TextArea,
  Box,
  Flex,
  Text,
  Heading,
  Dialog,
  Select,
} from "@radix-ui/themes";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  FolderOpen,
  Plus,
  RefreshCw,
  Save,
  Shuffle,
  Trash2,
  Upload,
} from "lucide-react";
import type { SimControls } from "../sim/types";
import type { Favorite } from "../types";
import { SliderInput } from "./SliderInput";

type SettingsPanelProps = {
  controls: SimControls;
  onControlChange: <K extends keyof SimControls>(
    key: K,
    value: SimControls[K],
  ) => void;
  paletteColors: string[];
  paletteInput: string;
  setPaletteInput: (value: string) => void;
  onAddColor: () => void;
  onUpdateColor: (index: number, value: string) => void;
  onRemoveColor: (index: number) => void;
  onClearPalette: () => void;
  onRandomize: () => void;
  onReset: () => void;
  onCopyPalette: () => void;
  onLoadPalette: () => void;
  favorites: Favorite[];
  favoriteName: string;
  setFavoriteName: (value: string) => void;
  selectedFavorite: string;
  setSelectedFavorite: (value: string) => void;
  onSaveFavorite: () => void;
  onLoadFavorite: () => void;
  onDeleteFavorite: () => void;
  onExportFavorites: () => void;
  favoritesImport: string;
  setFavoritesImport: (value: string) => void;
  onImportFavorites: () => void;
  onAddDotsForFaction: (index: number) => void;
};

export type ContextMenuSizeSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export function ContextMenuSizeSlider({
  value,
  onChange,
}: ContextMenuSizeSliderProps) {
  return (
    <SliderInput
      min={2}
      max={30}
      step={1}
      value={value}
      onValueChange={onChange}
    />
  );
}

export function SettingsPanel({
  controls,
  onControlChange,
  paletteColors,
  paletteInput,
  setPaletteInput,
  onAddColor,
  onUpdateColor,
  onRemoveColor,
  onClearPalette,
  onRandomize,
  onReset,
  onCopyPalette,
  onLoadPalette,
  favorites,
  favoriteName,
  setFavoriteName,
  selectedFavorite,
  setSelectedFavorite,
  onSaveFavorite,
  onLoadFavorite,
  onDeleteFavorite,
  onExportFavorites,
  favoritesImport,
  setFavoritesImport,
  onImportFavorites,
  onAddDotsForFaction,
}: SettingsPanelProps) {
  return (
    <Accordion.Root
      type="multiple"
      defaultValue={["variables", "setup", "palette"]}
      className="controls-scroll"
    >
      <Accordion.Item value="variables">
        <Accordion.Trigger className="accordion-trigger">
          <Flex align="center" justify="start" width="100%">
            <ChevronDown className="accordion-chevron" size={18} />
            <Heading as="h3" size="3">
              Variables
            </Heading>
          </Flex>
        </Accordion.Trigger>
        <Accordion.Content className="accordion-content">
          <Flex direction="column" gap="4">
            <label className="control-label">
              <span>Speed</span>
              <Flex gap="2" align="center">
                <SliderInput
                  min={5}
                  max={300}
                  step={5}
                  value={controls.speed}
                  onValueChange={(value) => onControlChange("speed", value)}
                />
                <Text className="value">{controls.speed}</Text>
              </Flex>
            </label>
            <label className="control-label">
              <span>Battle radius</span>
              <Flex gap="2" align="center">
                <SliderInput
                  min={0}
                  max={20}
                  step={1}
                  value={controls.battleRadius}
                  onValueChange={(value) =>
                    onControlChange("battleRadius", value)
                  }
                />
                <Text className="value">{controls.battleRadius}</Text>
              </Flex>
            </label>
            <label className="control-label">
              <span>Magnet strength</span>
              <Flex gap="2" align="center">
                <SliderInput
                  min={0}
                  max={200}
                  step={5}
                  value={controls.magnetStrength}
                  onValueChange={(value) =>
                    onControlChange("magnetStrength", value)
                  }
                />
                <Text className="value">{controls.magnetStrength}</Text>
              </Flex>
            </label>
            <label className="control-label">
              <span>Mouse attraction power</span>
              <Flex gap="2" align="center">
                <SliderInput
                  min={-1}
                  max={1}
                  step={0.05}
                  value={controls.mouseAttraction}
                  onValueChange={(value) =>
                    onControlChange("mouseAttraction", value)
                  }
                />
                <Text className="value">
                  {controls.mouseAttraction.toFixed(2)}
                </Text>
              </Flex>
            </label>
            <label className="control-label">
              <span>Mouse attraction range</span>
              <Flex gap="2" align="center">
                <SliderInput
                  min={100}
                  max={500}
                  step={10}
                  value={controls.mouseRange}
                  onValueChange={(value) =>
                    onControlChange("mouseRange", value)
                  }
                />
                <Text className="value">{controls.mouseRange}</Text>
              </Flex>
            </label>
            <label className="control-toggle" title="Repel all colors">
              <Checkbox.Root
                className="checkbox-root"
                checked={controls.repelAll}
                onCheckedChange={(checked) =>
                  onControlChange("repelAll", checked === true)
                }
              >
                <Checkbox.Indicator className="checkbox-indicator">
                  <Check size={20} />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span>Repel all colors</span>
            </label>
          </Flex>
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="setup">
        <Accordion.Trigger className="accordion-trigger">
          <Flex align="center" justify="start" width="100%">
            <ChevronDown className="accordion-chevron" size={18} />
            <Heading as="h3" size="3">
              Setup
            </Heading>
          </Flex>
        </Accordion.Trigger>
        <Accordion.Content className="accordion-content">
          <Flex direction="column" gap="4">
            <label className="control-label">
              <span>Dots</span>
              <Flex gap="2" align="center">
                <SliderInput
                  min={100}
                  max={2000}
                  step={10}
                  value={controls.count}
                  onValueChange={(value) => onControlChange("count", value)}
                />
                <Text className="value">{controls.count}</Text>
              </Flex>
            </label>
            <label className="control-label">
              <span>Min size</span>
              <Flex gap="2" align="center">
                <SliderInput
                  min={2}
                  max={10}
                  step={1}
                  value={controls.minSize}
                  onValueChange={(value) => onControlChange("minSize", value)}
                />
                <Text className="value">{controls.minSize}</Text>
              </Flex>
            </label>
            <label className="control-label">
              <span>Max size</span>
              <Flex gap="2" align="center">
                <SliderInput
                  min={4}
                  max={20}
                  step={1}
                  value={controls.maxSize}
                  onValueChange={(value) => onControlChange("maxSize", value)}
                />
                <Text className="value">{controls.maxSize}</Text>
              </Flex>
            </label>
          </Flex>
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="palette">
        <Accordion.Trigger className="accordion-trigger">
          <Flex align="center" justify="start" width="100%">
            <ChevronDown className="accordion-chevron" size={18} />
            <Heading as="h3" size="3">
              Palette
            </Heading>
          </Flex>
        </Accordion.Trigger>
        <Accordion.Content className="accordion-content">
          <Flex direction="column" gap="4">
            <Box className="palette-editor">
              <Box className="palette-actions-group">
                <Text
                  size="1"
                  weight="medium"
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    opacity: 0.6,
                  }}
                >
                  Palette actions
                </Text>
                <Flex gap="2" wrap="wrap" align="center">
                  <Button
                    variant="surface"
                    title="Add color"
                    onClick={onAddColor}
                  >
                    <Plus size={16} />
                  </Button>
                  <Button
                    variant="surface"
                    title="Clear palette"
                    onClick={onClearPalette}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <Button
                    variant="surface"
                    title="Randomize palette"
                    onClick={onRandomize}
                  >
                    <Shuffle size={16} />
                  </Button>
                  <Button
                    variant="surface"
                    title="Reset to last loaded"
                    onClick={onReset}
                  >
                    <RefreshCw size={16} />
                  </Button>
                  <Button
                    variant="surface"
                    title="Copy palette JSON"
                    onClick={onCopyPalette}
                  >
                    <Copy size={16} />
                  </Button>
                  <Dialog.Root>
                    <Dialog.Trigger>
                      <Button variant="surface" title="Import pallete">
                        <Download size={16} />
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px">
                      <Dialog.Title>Import palette</Dialog.Title>
                      <TextArea
                        value={paletteInput}
                        onChange={(event) =>
                          setPaletteInput(event.target.value)
                        }
                        placeholder='["#ff0000", "#00ff00"]'
                      />
                      <Flex gap="2" justify="end" mt="3">
                        <Dialog.Close>
                          <Button variant="soft">Cancel</Button>
                        </Dialog.Close>
                        <Dialog.Close>
                          <Button onClick={onLoadPalette}>Import</Button>
                        </Dialog.Close>
                      </Flex>
                    </Dialog.Content>
                  </Dialog.Root>
                </Flex>
              </Box>
              <Flex direction="column" gap="2">
                {paletteColors.map((color, index) => (
                  <Flex gap="2" align="center" key={index}>
                    <input
                      type="color"
                      className="palette-color"
                      value={color}
                      aria-label={`Color ${index + 1}`}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        onUpdateColor(index, event.target.value)
                      }
                    />
                    <Text size="1" style={{ opacity: 0.8, minWidth: "70px" }}>
                      {color}
                    </Text>
                    <Button
                      variant="outline"
                      size="1"
                      title="Add 50 dots"
                      onClick={() => onAddDotsForFaction(index)}
                    >
                      +50
                    </Button>
                    <Button
                      variant="outline"
                      size="1"
                      color="crimson"
                      title="Remove color"
                      onClick={() => onRemoveColor(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </Flex>
                ))}
              </Flex>

              <Flex direction="column" gap="2" mt="3">
                <Flex gap="2" wrap="wrap">
                  <Dialog.Root>
                    <Dialog.Trigger>
                      <Button variant="surface" title="Save favorite">
                        <Save size={16} />
                        <span>Save</span>
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px">
                      <Dialog.Title>Save favorite</Dialog.Title>
                      <TextField.Root
                        value={favoriteName}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => setFavoriteName(event.target.value)}
                        placeholder="My palette"
                      />
                      <Flex gap="2" justify="end" mt="3">
                        <Dialog.Close>
                          <Button variant="soft">Cancel</Button>
                        </Dialog.Close>
                        <Dialog.Close>
                          <Button onClick={onSaveFavorite}>Save</Button>
                        </Dialog.Close>
                      </Flex>
                    </Dialog.Content>
                  </Dialog.Root>

                  <Dialog.Root>
                    <Dialog.Trigger>
                      <Button variant="surface" title="Load favorite">
                        <FolderOpen size={16} />
                        <span>Load</span>
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px">
                      <Dialog.Title>Load favorite</Dialog.Title>
                      <Select.Root
                        value={selectedFavorite}
                        onValueChange={setSelectedFavorite}
                      >
                        <Select.Trigger />
                        <Select.Content position="popper">
                          {favorites.map((fav, index) => (
                            <Select.Item
                              value={String(index)}
                              key={fav.name + index}
                            >
                              {fav.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                      <Flex gap="2" justify="end" mt="3">
                        <Dialog.Close>
                          <Button variant="soft">Cancel</Button>
                        </Dialog.Close>
                        <Dialog.Close>
                          <Button onClick={onLoadFavorite}>Load</Button>
                        </Dialog.Close>
                      </Flex>
                    </Dialog.Content>
                  </Dialog.Root>

                  <Dialog.Root>
                    <Dialog.Trigger>
                      <Button
                        variant="surface"
                        color="crimson"
                        title="Delete favorite"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px">
                      <Dialog.Title>Delete favorite</Dialog.Title>
                      <Select.Root
                        value={selectedFavorite}
                        onValueChange={setSelectedFavorite}
                      >
                        <Select.Trigger />
                        <Select.Content position="popper">
                          {favorites.map((fav, index) => (
                            <Select.Item
                              value={String(index)}
                              key={fav.name + index}
                            >
                              {fav.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                      <Flex gap="2" justify="end" mt="3">
                        <Dialog.Close>
                          <Button variant="surface">Cancel</Button>
                        </Dialog.Close>
                        <Dialog.Close>
                          <Button color="crimson" onClick={onDeleteFavorite}>
                            Delete
                          </Button>
                        </Dialog.Close>
                      </Flex>
                    </Dialog.Content>
                  </Dialog.Root>
                </Flex>

                <Flex gap="2" wrap="wrap">
                  <Button
                    variant="surface"
                    title="Export favorites JSON"
                    onClick={onExportFavorites}
                  >
                    <Upload size={16} />
                    <span>Export</span>
                  </Button>

                  <Dialog.Root>
                    <Dialog.Trigger>
                      <Button variant="surface" title="Import favorites JSON">
                        <Download size={16} />
                        <span>Import</span>
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px">
                      <Dialog.Title>Import favorites</Dialog.Title>
                      <TextArea
                        value={favoritesImport}
                        onChange={(event) =>
                          setFavoritesImport(event.target.value)
                        }
                        placeholder='[{"name":"Palette 1","colors":["#ff0000","#00ff00"]}]'
                      />
                      <Flex gap="2" justify="end" mt="3">
                        <Dialog.Close>
                          <Button variant="surface">Cancel</Button>
                        </Dialog.Close>
                        <Dialog.Close>
                          <Button onClick={onImportFavorites}>Import</Button>
                        </Dialog.Close>
                      </Flex>
                    </Dialog.Content>
                  </Dialog.Root>
                </Flex>
              </Flex>
            </Box>
          </Flex>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
