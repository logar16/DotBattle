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
  ChevronDown,
  Copy,
  Download,
  Eraser,
  Plus,
  RefreshCw,
  Save,
  Shuffle,
  Trash2,
  Upload,
} from "lucide-react";
import type { NewSimControls, BattleControls, SimulationControls } from "../sim/types";
import type { Favorite } from "../types";
import { SliderInput } from "./SliderInput";
import { SharedSetupSettings } from "./SharedSetupSettings";
import { BattleSettings } from "./BattleSettings";
import { SimulationSettings } from "./SimulationSettings";

type SettingsPanelProps = {
  controls: NewSimControls;
  onControlChange: (key: string, value: number | boolean | string) => void;
  paletteColors: string[];
  onAddColor: () => void;
  onUpdateColor: (index: number, value: string) => void;
  onRemoveColor: (index: number) => void;
  onClearPalette: () => void;
  onRandomize: () => void;
  onReset: () => void;
  onCopyPalette: () => void;
  favorites: Favorite[];
  currentPreset: string;
  onLoadPreset: (presetName: string) => void;
  favoriteName: string;
  setFavoriteName: (value: string) => void;
  onSaveFavorite: () => void;
  onDeleteFavorite: () => void;
  onExportFavorites: () => void;
  favoritesImport: string;
  setFavoritesImport: (value: string) => void;
  onImportFavorites: () => void;
  onAddDotsForFaction: (index: number, count?: number) => void;
  onRemoveFactionDots: (faction: number, count?: number) => void;
  onSetAllToFaction: (faction: number) => void;
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
  onAddColor,
  onUpdateColor,
  onRemoveColor,
  onClearPalette,
  onRandomize,
  onReset,
  onCopyPalette,
  favorites,
  currentPreset,
  onLoadPreset,
  favoriteName,
  setFavoriteName,
  onSaveFavorite,
  onDeleteFavorite,
  onExportFavorites,
  favoritesImport,
  setFavoritesImport,
  onImportFavorites,
  onAddDotsForFaction,
  onRemoveFactionDots,
  onSetAllToFaction,
}: SettingsPanelProps) {
  const mode = 'mode' in controls ? controls.mode : 'battle';

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
          {mode === "battle" && (
            <BattleSettings
              controls={controls as BattleControls}
              palette={paletteColors}
              onControlChange={onControlChange}
              onAddDotsForFaction={onAddDotsForFaction}
              onRemoveFactionDots={onRemoveFactionDots}
              onSetAllToFaction={onSetAllToFaction}
            />
          )}
          {mode === "simulation" && (
            <SimulationSettings
              controls={controls as SimulationControls}
              onControlChange={onControlChange}
            />
          )}
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
            <Box>
              <Text as="div" size="2" mb="2">Mode</Text>
              <Select.Root
                value={mode}
                onValueChange={(value) => onControlChange('mode', value)}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="battle">Battle</Select.Item>
                  <Select.Item value="simulation">Simulation</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
            
            <SharedSetupSettings
              controls={controls}
              onControlChange={onControlChange}
            />
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
              <Box>
                <Text
                  as="div"
                  size="1"
                  mb="2"
                  weight="medium"
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    opacity: 0.6,
                  }}
                >
                  Presets
                </Text>
                <Select.Root
                  value={currentPreset}
                  onValueChange={onLoadPreset}
                >
                  <Select.Trigger />
                  <Select.Content position="popper">
                    {currentPreset === "[Custom]" && (
                      <Select.Item value="[Custom]" disabled>
                        [Custom]
                      </Select.Item>
                    )}
                    {favorites.map((fav) => (
                      <Select.Item value={fav.name} key={fav.name}>
                        {fav.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

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
                    <Eraser size={16} />
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
                      <Button variant="surface" title="Save preset">
                        <Save size={16} />
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px">
                      <Dialog.Title>Save preset</Dialog.Title>
                      <Dialog.Description size="2" mb="3">
                        {currentPreset === "[Custom]" 
                          ? "Enter a name for this preset"
                          : `Saving as "${currentPreset}" will overwrite the existing preset. Change the name to create a new one.`}
                      </Dialog.Description>
                      <TextField.Root
                        value={favoriteName}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => setFavoriteName(event.target.value)}
                        placeholder={currentPreset === "[Custom]" ? "My Palette" : currentPreset}
                        onFocus={() => {
                          if (currentPreset !== "[Custom]" && !favoriteName) {
                            setFavoriteName(currentPreset);
                          }
                        }}
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
                      <Button
                        variant="surface"
                        color="crimson"
                        title="Delete current preset"
                        disabled={currentPreset === "[Custom]"}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px">
                      <Dialog.Title>Delete preset</Dialog.Title>
                      <Dialog.Description size="2" mb="3">
                        Are you sure you want to delete "{currentPreset}"? This cannot be undone.
                      </Dialog.Description>
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
                <Text
                  size="1"
                  weight="medium"
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    opacity: 0.6,
                  }}
                >
                  Import / Export
                </Text>
                <Flex gap="2" wrap="wrap">
                  <Button
                    variant="surface"
                    title="Export presets JSON"
                    onClick={onExportFavorites}
                  >
                    <Upload size={16} />
                    <span>Export</span>
                  </Button>

                  <Dialog.Root>
                    <Dialog.Trigger>
                      <Button variant="surface" title="Import palette or presets">
                        <Download size={16} />
                        <span>Import</span>
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px">
                      <Dialog.Title>Import</Dialog.Title>
                      <Dialog.Description size="2" mb="3">
                        Paste a color array or presets JSON
                      </Dialog.Description>
                      <TextArea
                        value={favoritesImport}
                        onChange={(event) =>
                          setFavoritesImport(event.target.value)
                        }
                        placeholder='["#ff0000", "#00ff00"] or [{"name":"Palette","colors":[...]}]'
                        rows={6}
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
