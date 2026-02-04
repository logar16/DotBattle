import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Button } from "@radix-ui/themes";
import {
  Maximize2,
  Moon,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Sun,
} from "lucide-react";
import "./App.css";
import { Simulation } from "./sim/simulation";
import type { NewSimControls } from "./sim/types";
import type { Favorite } from "./types";
import { normalizeHex, randomizePalette } from "./utils/palette";
import {
  SettingsPanel,
  ContextMenuSizeSlider,
} from "./components/SettingsPanel";
import { StatsPanel } from "./components/StatsPanel";

const defaultPresets: Favorite[] = [
  {
    name: "Syntax Highlights",
    colors: [
      "#39a8cb",
      "#4d5eac",
      "#ae42e4",
      "#dd1e74",
      "#f09f66",
      "#a8e278",
      "#34e5a1",
    ],
  },
  {
    name: "Default",
    colors: [
      "#dc143c",
      "#ff7a00",
      "#ffff00",
      "#7fff00",
      "#00ffff",
      "#0000ff",
      "#7b1fa2",
      "#ffffff",
    ],
  },
  {
    name: "Mints",
    colors: ["#92dce5", "#d38dcd", "#c39bee", "#5897e4", "#a67de3"],
  },
  {
    name: "Firesky",
    colors: ["#3e9ec1", "#face68", "#f79845", "#fa6868"],
  },
  {
    name: "Ladybug",
    colors: ["#78c841", "#b4e50d", "#ff9b2f", "#df4343", "#ffea00"],
  },
  {
    name: "Ocean",
    colors: ["#4319b8", "#1961cc", "#00b8e6", "#00ffee", "#00faa7"],
  },
  {
    name: "Jungle",
    colors: ["#73ec8b", "#54c392", "#abe7b2", "#6ac8b5", "#15b392", "#6dc355"],
  },
];

const favoritesStorageKey = "dotbattle.paletteFavorites";
const favoritesInitializedKey = "dotbattle.paletteFavorites.initialized";

function getFavorites(): Favorite[] {
  try {
    // On first load, initialize with default presets
    const initialized = localStorage.getItem(favoritesInitializedKey);
    if (!initialized) {
      localStorage.setItem(favoritesStorageKey, JSON.stringify(defaultPresets));
      localStorage.setItem(favoritesInitializedKey, "true");
      return [...defaultPresets];
    }

    const stored = JSON.parse(
      localStorage.getItem(favoritesStorageKey) || "[]",
    );
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [...defaultPresets];
  }
}

function saveFavorites(favorites: Favorite[]) {
  localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites));
}

type AppProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

function App({ theme, onToggleTheme }: AppProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const simRef = useRef<Simulation | null>(null);
  const scheduleResize = useCallback(() => {
    requestAnimationFrame(() => {
      simRef.current?.resizeCanvas();
      requestAnimationFrame(() => {
        simRef.current?.resizeCanvas();
      });
    });
  }, []);

  const [favorites, setFavorites] = useState<Favorite[]>(() => getFavorites());

  // Pick a random preset once for both currentPreset and palette
  const initialPreset = (() => {
    const allFavorites = getFavorites();
    if (allFavorites.length > 0) {
      const randomIndex = Math.floor(Math.random() * allFavorites.length);
      return allFavorites[randomIndex];
    }
    return null;
  })();

  const [currentPreset, setCurrentPreset] = useState<string>(
    initialPreset?.name || "[Custom]",
  );
  const [palette, setPalette] = useState<string[]>(
    initialPreset?.colors || defaultPresets[0].colors,
  );
  const [basePalette, setBasePalette] = useState<string[]>(palette);
  const paletteRef = useRef<string[]>(palette);
  const [favoriteName, setFavoriteName] = useState("");
  const [favoritesImport, setFavoritesImport] = useState("");
  const paletteColors = useMemo(() => palette, [palette]);

  const [statsFactions, setStatsFactions] = useState<number[]>([]);
  const [statsTotal, setStatsTotal] = useState(0);
  const [statsFps, setStatsFps] = useState(0);
  const [paused, setPaused] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setMenuDotActive] = useState(false);
  const [menuSize, setMenuSize] = useState(0);
  const [controls, setControls] = useState<NewSimControls>({
    mode: "battle" as const,
    count: 500,
    speed: 60,
    minSize: 2,
    maxSize: 6,
    battleRadius: 5,
    magnetStrength: 80,
    mouseAttraction: 0,
    mouseRange: 150,
  });

  const updateControl = (key: string, value: number | boolean | string) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddColor = () => setPalette((prev) => [...prev, "#ffffff"]);
  const handleClearPalette = () => setPalette([]);
  const handleRemoveColor = (index: number) => {
    setPalette((prev) => prev.filter((_, i) => i !== index));
  };
  const handleUpdateColor = (index: number, value: string) => {
    setPalette((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };
  const handleRandomize = () => {
    setPalette(randomizePalette());
  };
  const handleReset = () => setPalette([...basePalette]);
  const handleRestart = () => {
    simRef.current?.restart();
  };

  const handleCopyPalette = async () => {
    const json = JSON.stringify(palette, null, 2);
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      // Silently fail if clipboard not available
    }
  };

  const handleSaveFavorite = () => {
    const name = favoriteName.trim();
    if (!name || name === "[Custom]") return;

    // Check if overwriting existing
    const existingIndex = favorites.findIndex((f) => f.name === name);
    let next: Favorite[];

    if (existingIndex >= 0) {
      // Overwrite existing
      next = [...favorites];
      next[existingIndex] = { name, colors: palette };
    } else {
      // Add new
      next = [...favorites, { name, colors: palette }];
    }

    setFavorites(next);
    saveFavorites(next);
    setFavoriteName("");
    setCurrentPreset(name); // Update current preset to the saved name
    setBasePalette(palette);
  };

  const handleExportFavorites = async () => {
    const json = JSON.stringify(favorites, null, 2);
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      setFavoritesImport(json);
    }
  };

  const handleImportFavorites = () => {
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(favoritesImport);
    } catch {
      return;
    }

    // Handle single palette array: ["#color1", "#color2"]
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      typeof parsed[0] === "string"
    ) {
      const colors = parsed
        .map((color: string) => normalizeHex(String(color)))
        .filter((c): c is string => Boolean(c));
      if (colors.length) {
        setPalette(colors);
        setCurrentPreset("[Custom]");
        setFavoritesImport("");
      }
      return;
    }

    // Handle favorites array: [{name, colors}, ...]
    if (!Array.isArray(parsed)) return;
    const cleaned = parsed
      .map((entry) => {
        const name =
          typeof entry?.name === "string"
            ? entry.name.trim()
            : "Imported palette";
        const colors = Array.isArray(entry?.colors)
          ? entry.colors
              .map((color: string) => normalizeHex(String(color)))
              .filter((c: string | null): c is string => Boolean(c))
          : [];
        if (!colors.length) return null;
        return { name, colors };
      })
      .filter(Boolean) as Favorite[];
    if (!cleaned.length) return;

    // Merge with existing favorites
    const merged = [...favorites];
    for (const importedFav of cleaned) {
      const existingIndex = merged.findIndex(
        (f) => f.name === importedFav.name,
      );
      if (existingIndex >= 0) {
        merged[existingIndex] = importedFav;
      } else {
        merged.push(importedFav);
      }
    }

    setFavorites(merged);
    saveFavorites(merged);
    setFavoritesImport("");
  };

  const handleLoadPreset = (presetName: string) => {
    const selected = favorites.find((f) => f.name === presetName);
    if (!selected) return;
    setPalette(selected.colors);
    setBasePalette(selected.colors);
    setCurrentPreset(presetName);
  };

  const handleDeleteFavorite = () => {
    if (currentPreset === "[Custom]") return;

    const next = favorites.filter((f) => f.name !== currentPreset);
    setFavorites(next);
    saveFavorites(next);

    // Switch to first available preset or [Custom]
    if (next.length > 0) {
      const newPreset = next[0].name;
      setCurrentPreset(newPreset);
      setPalette(next[0].colors);
      setBasePalette(next[0].colors);
    } else {
      setCurrentPreset("[Custom]");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sim = new Simulation(canvas, controls, {
      getPalette: () => paletteRef.current,
      getFactionColor: (index) =>
        paletteRef.current.length
          ? paletteRef.current[index % paletteRef.current.length]
          : "#111827",
      onStatsChange: (counts, total, fps) => {
        setStatsFactions(counts);
        setStatsTotal(total);
        setStatsFps(fps);
      },
    });
    simRef.current = sim;
    sim.start();
    scheduleResize();
    const handleResize = () => scheduleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      sim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only create simulation once on mount

  useEffect(() => {
    paletteRef.current = palette;
  }, [palette]);

  useEffect(() => {
    scheduleResize();
  }, [palette.length, scheduleResize]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => scheduleResize());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [scheduleResize]);
  useEffect(() => {
    simRef.current?.setControls(controls);
  }, [controls]);

  useEffect(() => {
    simRef.current?.setPalette(palette);
  }, [palette]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = document.fullscreenElement === mainRef.current;
      setIsFullscreen(active);
      scheduleResize();
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div
      ref={portalContainerRef}
      className={`app${controlsCollapsed ? " controls-collapsed" : ""}${isFullscreen ? " fullscreen" : ""}`}
    >
      <aside className="controls">
        <div className="control-bar">
          <Button
            type="button"
            variant="solid"
            size="2"
            title="Settings"
            aria-expanded={!controlsCollapsed}
            onClick={() => {
              setControlsCollapsed((prev) => !prev);
              scheduleResize();
            }}
          >
            <Settings size={18} />
          </Button>
          <Button
            variant="solid"
            size="2"
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            onClick={onToggleTheme}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
          <Button
            variant="solid"
            size="2"
            title="Restart"
            onClick={handleRestart}
          >
            <RefreshCw size={18} />
          </Button>
          <Button
            variant="solid"
            size="2"
            title={paused ? "Resume" : "Pause"}
            onClick={() => {
              const next = !paused;
              setPaused(next);
              simRef.current?.setPaused(next);
            }}
          >
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </Button>
          <Button
            variant="solid"
            size="2"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
                return;
              }
              mainRef.current?.requestFullscreen();
            }}
          >
            <Maximize2 size={18} />
          </Button>
        </div>

        <SettingsPanel
          controls={controls}
          onControlChange={updateControl}
          paletteColors={paletteColors}
          onAddColor={handleAddColor}
          onClearPalette={handleClearPalette}
          onUpdateColor={handleUpdateColor}
          onRemoveColor={handleRemoveColor}
          onRandomize={handleRandomize}
          onReset={handleReset}
          onCopyPalette={handleCopyPalette}
          favorites={favorites}
          currentPreset={currentPreset}
          onLoadPreset={handleLoadPreset}
          favoriteName={favoriteName}
          setFavoriteName={setFavoriteName}
          onSaveFavorite={handleSaveFavorite}
          onDeleteFavorite={handleDeleteFavorite}
          onExportFavorites={handleExportFavorites}
          favoritesImport={favoritesImport}
          setFavoritesImport={setFavoritesImport}
          onImportFavorites={handleImportFavorites}
          onAddDotsForFaction={(index, count) =>
            simRef.current?.addDotsForFaction(index, count)
          }
          onRemoveFactionDots={(faction, count) =>
            simRef.current?.removeFactionDots(faction, count)
          }
          onSetAllToFaction={(faction) =>
            simRef.current?.setAllToFaction(faction)
          }
        />
      </aside>

      <main className="main" ref={mainRef}>
        <StatsPanel
          mode={controls.mode}
          stats={
            controls.mode === "simulation"
              ? {
                  totalDots: statsTotal,
                  fps: statsFps,
                  avgVelocity: 0,
                }
              : {
                  factions: statsFactions.map((count, index) => ({
                    count,
                    color: palette[index] || "#111827",
                    percentage: statsTotal > 0 ? (count / statsTotal) * 100 : 0,
                  })),
                  totalDots: statsTotal,
                  fps: statsFps,
                }
          }
        />
        <ContextMenu.Root
          onOpenChange={(open) => {
            if (!open) {
              setMenuDotActive(false);
              simRef.current?.clearMenuDot();
            }
          }}
        >
          <ContextMenu.Trigger asChild>
            <canvas
              ref={canvasRef}
              className="canvas"
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                simRef.current?.handleMouseMove(
                  event.clientX - rect.left,
                  event.clientY - rect.top,
                );
              }}
              onMouseLeave={() => simRef.current?.handleMouseLeave()}
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                simRef.current?.handleCanvasClick(
                  event.clientX - rect.left,
                  event.clientY - rect.top,
                  event.shiftKey,
                );
              }}
              onContextMenu={(event) => {
                if (!paused) {
                  event.preventDefault();
                  setMenuDotActive(false);
                  simRef.current?.clearMenuDot();
                  return;
                }
                const rect = event.currentTarget.getBoundingClientRect();
                const dot = simRef.current?.setMenuDotAt(
                  event.clientX - rect.left,
                  event.clientY - rect.top,
                );
                if (dot) {
                  setMenuSize(Math.round(dot.size));
                  setMenuDotActive(true);
                } else {
                  event.preventDefault();
                  setMenuDotActive(false);
                  simRef.current?.clearMenuDot();
                }
              }}
            />
          </ContextMenu.Trigger>
          <ContextMenu.Portal container={portalContainerRef.current}>
            <ContextMenu.Content className="context-menu-content">
              <div className="context-menu-section">
                <div className="context-menu-label">Size</div>
                <div className="context-menu-row">
                  <ContextMenuSizeSlider
                    value={menuSize}
                    onChange={(value) => {
                      setMenuSize(value);
                      simRef.current?.updateMenuDotSize(value);
                    }}
                  />
                  <span className="context-menu-value">{menuSize}</span>
                </div>
              </div>
              <div className="context-menu-section">
                <div className="context-menu-label">Color</div>
                <div className="context-menu-swatch-grid">
                  {palette.map((color, index) => (
                    // edge-tools-disable-next-line no-inline-styles -- Dynamic runtime color from user palette, no alternative
                    <ContextMenu.Item
                      key={`${color}-${index}`}
                      className="context-menu-swatch"
                      style={{ "--swatch-color": color } as React.CSSProperties}
                      onSelect={(event) => {
                        event.preventDefault();
                        simRef.current?.updateMenuDotFaction(index);
                      }}
                    />
                  ))}
                </div>
              </div>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      </main>
    </div>
  );
}

export default App;
