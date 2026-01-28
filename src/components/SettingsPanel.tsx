import * as Dialog from '@radix-ui/react-dialog'
import * as Checkbox from '@radix-ui/react-checkbox'
import * as Select from '@radix-ui/react-select'
import { Check, Copy, Download, Eraser, FolderOpen, Plus, RefreshCw, Save, Shuffle, Trash2 } from 'lucide-react'
import type { SimControls } from '../sim/types'
import type { Favorite } from '../types'
import { SliderInput } from './SliderInput'

type SettingsPanelProps = {
  controls: SimControls
  onControlChange: <K extends keyof SimControls>(key: K, value: SimControls[K]) => void
  paletteColors: string[]
  paletteInput: string
  setPaletteInput: (value: string) => void
  onAddColor: () => void
  onUpdateColor: (index: number, value: string) => void
  onRemoveColor: (index: number) => void
  onClearPalette: () => void
  onRandomize: () => void
  onReset: () => void
  onCopyPalette: () => void
  onLoadPalette: () => void
  favorites: Favorite[]
  favoriteName: string
  setFavoriteName: (value: string) => void
  selectedFavorite: string
  setSelectedFavorite: (value: string) => void
  onSaveFavorite: () => void
  onLoadFavorite: () => void
  onDeleteFavorite: () => void
  onExportFavorites: () => void
  favoritesImport: string
  setFavoritesImport: (value: string) => void
  onImportFavorites: () => void
  onAddDotsForFaction: (index: number) => void
}

export type ContextMenuSizeSliderProps = {
  value: number
  onChange: (value: number) => void
}

export function ContextMenuSizeSlider({ value, onChange }: ContextMenuSizeSliderProps) {
  return (
    <SliderInput
      min={2}
      max={30}
      step={1}
      value={value}
      onValueChange={onChange}
    />
  )
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
    <div className="controls-scroll">
      <section className="panel">
        <h3>Variables</h3>
        <label className="control-label">
          <span>Speed</span>
          <div className="control-row">
            <SliderInput
              min={5}
              max={300}
              step={5}
              value={controls.speed}
              onValueChange={(value) => onControlChange('speed', value)}
            />
            <span className="value">{controls.speed}</span>
          </div>
        </label>
        <label className="control-label">
          <span>Battle radius</span>
          <div className="control-row">
            <SliderInput
              min={0}
              max={20}
              step={1}
              value={controls.battleRadius}
              onValueChange={(value) => onControlChange('battleRadius', value)}
            />
            <span className="value">{controls.battleRadius}</span>
          </div>
        </label>
        <label className="control-label">
          <span>Magnet strength</span>
          <div className="control-row">
            <SliderInput
              min={0}
              max={200}
              step={5}
              value={controls.magnetStrength}
              onValueChange={(value) => onControlChange('magnetStrength', value)}
            />
            <span className="value">{controls.magnetStrength}</span>
          </div>
        </label>
        <label className="control-label">
          <span>Mouse attraction power</span>
          <div className="control-row">
            <SliderInput
              min={-1}
              max={1}
              step={0.05}
              value={controls.mouseAttraction}
              onValueChange={(value) => onControlChange('mouseAttraction', value)}
            />
            <span className="value">{controls.mouseAttraction.toFixed(2)}</span>
          </div>
        </label>
        <label className="control-label">
          <span>Mouse attraction range</span>
          <div className="control-row">
            <SliderInput
              min={100}
              max={500}
              step={10}
              value={controls.mouseRange}
              onValueChange={(value) => onControlChange('mouseRange', value)}
            />
            <span className="value">{controls.mouseRange}</span>
          </div>
        </label>
        <label className="control-toggle" title="Repel all colors">
          <Checkbox.Root
            className="checkbox-root"
            checked={controls.repelAll}
            onCheckedChange={(checked) => onControlChange('repelAll', checked === true)}
          >
            <Checkbox.Indicator className="checkbox-indicator">
              <Check size={20} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <span>Repel all colors</span>
        </label>
      </section>

      <section className="panel">
        <h3>Setup</h3>
        <label className="control-label">
          <span>Dots</span>
          <div className="control-row">
            <SliderInput
              min={100}
              max={2000}
              step={10}
              value={controls.count}
              onValueChange={(value) => onControlChange('count', value)}
            />
            <span className="value">{controls.count}</span>
          </div>
        </label>
        <label className="control-label">
          <span>Min size</span>
          <div className="control-row">
            <SliderInput
              min={2}
              max={10}
              step={1}
              value={controls.minSize}
              onValueChange={(value) => onControlChange('minSize', value)}
            />
            <span className="value">{controls.minSize}</span>
          </div>
        </label>
        <label className="control-label">
          <span>Max size</span>
          <div className="control-row">
            <SliderInput
              min={4}
              max={20}
              step={1}
              value={controls.maxSize}
              onValueChange={(value) => onControlChange('maxSize', value)}
            />
            <span className="value">{controls.maxSize}</span>
          </div>
        </label>
        <div className="palette-editor">
          <div className="palette-actions-group">
            <div className="palette-actions-header">Palette actions</div>
            <div className="palette-actions">
            <button className="icon-button" title="Add color" onClick={onAddColor}>
              <Plus size={16} />
            </button>
            <button className="icon-button" title="Clear palette" onClick={onClearPalette}>
              <Eraser size={16} />
            </button>
            <button className="icon-button" title="Randomize palette" onClick={onRandomize}>
              <Shuffle size={16} />
            </button>
            <button className="icon-button" title="Reset palette" onClick={onReset}>
              <RefreshCw size={16} />
            </button>
            <button className="icon-button" title="Copy palette JSON" onClick={onCopyPalette}>
              <Copy size={16} />
            </button>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="icon-button" title="Load palette JSON">
                  <FolderOpen size={16} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog" aria-describedby={undefined}>
                  <Dialog.Title>Load palette</Dialog.Title>
                  <textarea
                    value={paletteInput}
                    onChange={(event) => setPaletteInput(event.target.value)}
                    placeholder='["#ff0000", "#00ff00"]'
                  />
                  <div className="dialog-actions">
                    <Dialog.Close asChild>
                      <button className="button">Cancel</button>
                    </Dialog.Close>
                    <Dialog.Close asChild>
                      <button className="button" onClick={onLoadPalette}>Load</button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            </div>
          </div>
          <div className="palette-rows">
            {paletteColors.map((color, index) => (
              <div className="palette-row" key={index}>
                <input
                  type="color"
                  className="palette-color"
                  value={color}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => onUpdateColor(index, event.target.value)}
                />
                <span className="palette-hex">{color}</span>
                <button
                  className="mini-button"
                  title="Add 50 dots"
                  onClick={() => onAddDotsForFaction(index)}
                >
                  +50
                </button>
                <button className="icon-button" title="Remove color" onClick={() => onRemoveColor(index)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="favorites-actions">
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="button-with-icon" title="Save favorite">
                  <Save size={16} />
                  <span>Save</span>
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog" aria-describedby={undefined}>
                  <Dialog.Title>Save favorite</Dialog.Title>
                  <input
                    value={favoriteName}
                    onChange={(event) => setFavoriteName(event.target.value)}
                    placeholder="My palette"
                  />
                  <div className="dialog-actions">
                    <Dialog.Close asChild>
                      <button className="button">Cancel</button>
                    </Dialog.Close>
                    <Dialog.Close asChild>
                      <button className="button" onClick={onSaveFavorite}>Save</button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="button-with-icon" title="Load favorite">
                  <FolderOpen size={16} />
                  <span>Load</span>
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog" aria-describedby={undefined}>
                  <Dialog.Title>Load favorite</Dialog.Title>
                  <Select.Root value={selectedFavorite} onValueChange={setSelectedFavorite}>
                    <Select.Trigger className="select-trigger">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="select-content" position="popper">
                        <Select.Viewport className="select-viewport">
                          {favorites.map((fav, index) => (
                            <Select.Item className="select-item" value={String(index)} key={fav.name + index}>
                              <Select.ItemText>{fav.name}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                  <div className="dialog-actions">
                    <Dialog.Close asChild>
                      <button className="button">Cancel</button>
                    </Dialog.Close>
                    <Dialog.Close asChild>
                      <button className="button" onClick={onLoadFavorite}>Load</button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="button-with-icon" title="Delete favorite">
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog" aria-describedby={undefined}>
                  <Dialog.Title>Delete favorite</Dialog.Title>
                  <Select.Root value={selectedFavorite} onValueChange={setSelectedFavorite}>
                    <Select.Trigger className="select-trigger">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="select-content" position="popper">
                        <Select.Viewport className="select-viewport">
                          {favorites.map((fav, index) => (
                            <Select.Item className="select-item" value={String(index)} key={fav.name + index}>
                              <Select.ItemText>{fav.name}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                  <div className="dialog-actions">
                    <Dialog.Close asChild>
                      <button className="button">Cancel</button>
                    </Dialog.Close>
                    <Dialog.Close asChild>
                      <button className="button" onClick={onDeleteFavorite}>Delete</button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <button className="icon-button" title="Export favorites JSON" onClick={onExportFavorites}>
              <Download size={16} />
            </button>
          </div>

          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button className="button-with-icon" title="Import favorites JSON">
                <Download size={16} />
                <span>Import</span>
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="dialog-overlay" />
              <Dialog.Content className="dialog" aria-describedby={undefined}>
                <Dialog.Title>Import favorites</Dialog.Title>
                <textarea
                  value={favoritesImport}
                  onChange={(event) => setFavoritesImport(event.target.value)}
                  placeholder='[{"name":"Palette 1","colors":["#ff0000","#00ff00"]}]'
                />
                <div className="dialog-actions">
                  <Dialog.Close asChild>
                    <button className="button">Cancel</button>
                  </Dialog.Close>
                  <Dialog.Close asChild>
                    <button className="button" onClick={onImportFavorites}>Import</button>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </section>
    </div>
  )
}
