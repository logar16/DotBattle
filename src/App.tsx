import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Button, Theme } from "@radix-ui/themes";
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
import type { SimControls } from "./sim/types";
import type { Favorite } from "./types";
import {
  normalizeHex,
  parsePaletteInput,
  randomizePalette,
} from "./utils/palette";
import {
  SettingsPanel,
  ContextMenuSizeSlider,
} from "./components/SettingsPanel";
import { StatsPanel } from "./components/StatsPanel";

const defaultPalette = [
  "#dc143c",
  "#ff7a00",
  "#ffff00",
  "#7fff00",
  "#00ffff",
  "#0000ff",
  "#7b1fa2",
  "#ffffff",
];

const favoritesStorageKey = "dotbattle.paletteFavorites";

function getFavorites(): Favorite[] {
  try {
    const stored = JSON.parse(
      localStorage.getItem(favoritesStorageKey) || "[]",
    );
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: Favorite[]) {
  localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites));
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const simRef = useRef<Simulation | null>(null);
  const scheduleResize = useCallback(() => {
    requestAnimationFrame(() => {
      simRef.current?.resizeCanvas();
      requestAnimationFrame(() => {
        simRef.current?.resizeCanvas();
      });
    });
  }, []);

  const [palette, setPalette] = useState<string[]>(() => {
    const storedFavorites = getFavorites();
    if (storedFavorites.length > 0) {
      const randomIndex = Math.floor(Math.random() * storedFavorites.length);
      return storedFavorites[randomIndex].colors;
    }
    return [...defaultPalette];
  });
  const [basePalette, setBasePalette] = useState<string[]>(palette);
  const paletteRef = useRef<string[]>(palette);
  const [favorites, setFavorites] = useState<Favorite[]>(() => getFavorites());
  const [favoriteName, setFavoriteName] = useState("");
  const [favoritesImport, setFavoritesImport] = useState("");
  const [paletteInput, setPaletteInput] = useState("");
  const [selectedFavorite, setSelectedFavorite] = useState("0");
  const paletteColors = useMemo(() => palette, [palette]);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("dotbattle.theme");
    return stored === "light" || stored === "dark" ? stored : "dark";
  });

  const [statsFactions, setStatsFactions] = useState<number[]>([]);
  const [statsTotal, setStatsTotal] = useState(0);
  const [statsFps, setStatsFps] = useState(0);
  const [paused, setPaused] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setMenuDotActive] = useState(false);
  const [menuSize, setMenuSize] = useState(0);
  const [controls, setControls] = useState<SimControls>({
    count: 500,
    speed: 60,
    minSize: 2,
    maxSize: 6,
    battleRadius: 5,
    magnetStrength: 80,
    mouseAttraction: 0,
    mouseRange: 150,
    repelAll: false,
  });

  const updateControl = <K extends keyof SimControls>(
    key: K,
    value: SimControls[K],
  ) => {
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
    simRef.current?.setControls(controls);
    simRef.current?.start();
  };

  const handleCopyPalette = async () => {
    const json = JSON.stringify(palette, null, 2);
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      setPaletteInput(json);
    }
  };

  const handleSaveFavorite = () => {
    const name =
      favoriteName.trim() || `Palette ${new Date().toLocaleString()}`;
    const next = [...favorites, { name, colors: palette }];
    setFavorites(next);
    saveFavorites(next);
    setFavoriteName("");
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
    let parsed: Favorite[] | null = null;
    try {
      parsed = JSON.parse(favoritesImport);
    } catch {
      return;
    }
    if (!Array.isArray(parsed)) return;
    const cleaned = parsed
      .map((entry) => {
        const name =
          typeof entry?.name === "string"
            ? entry.name.trim()
            : "Imported palette";
        const colors = Array.isArray(entry?.colors)
          ? entry.colors
              .map((color) => normalizeHex(String(color)))
              .filter(Boolean)
          : [];
        if (!colors.length) return null;
        return { name, colors };
      })
      .filter(Boolean) as Favorite[];
    if (!cleaned.length) return;
    setFavorites(cleaned);
    saveFavorites(cleaned);
    setFavoritesImport("");
    setSelectedFavorite("0");
  };

  const handleLoadFavorite = () => {
    const index = Number(selectedFavorite);
    const selected = favorites[index];
    if (!selected) return;
    setPalette(selected.colors);
    setBasePalette(selected.colors);
  };

  const handleDeleteFavorite = () => {
    const index = Number(selectedFavorite);
    if (!Number.isFinite(index)) return;
    const next = favorites.filter((_, i) => i !== index);
    setFavorites(next);
    saveFavorites(next);
    setSelectedFavorite("0");
  };

  const handleLoadPalette = () => {
    const loaded = parsePaletteInput(paletteInput);
    if (!loaded.length) return;
    setPalette(loaded);
    setPaletteInput("");
  };

  const handleFactionClick = (faction: number, shiftKey: boolean) => {
    if (shiftKey) {
      simRef.current?.setAllToFaction(faction);
    } else {
      simRef.current?.addDotsForFaction(faction);
    }
  };

  const handleFactionContextMenu = (faction: number, shiftKey: boolean) => {
    if (shiftKey) {
      simRef.current?.removeFactionDots(faction);
    } else {
      simRef.current?.removeFactionDots(faction, 50);
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

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("dotbattle.theme", next);
      return next;
    });
  };

  return (
    <Theme
      appearance={theme}
      accentColor="blue"
      grayColor="slate"
      radius="medium"
      scaling="95%"
    >
      <div
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
              onClick={toggleTheme}
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
            paletteInput={paletteInput}
            setPaletteInput={setPaletteInput}
            onAddColor={handleAddColor}
            onClearPalette={handleClearPalette}
            onUpdateColor={handleUpdateColor}
            onRemoveColor={handleRemoveColor}
            onRandomize={handleRandomize}
            onReset={handleReset}
            onCopyPalette={handleCopyPalette}
            onLoadPalette={handleLoadPalette}
            favorites={favorites}
            favoriteName={favoriteName}
            setFavoriteName={setFavoriteName}
            selectedFavorite={selectedFavorite}
            setSelectedFavorite={setSelectedFavorite}
            onSaveFavorite={handleSaveFavorite}
            onLoadFavorite={handleLoadFavorite}
            onDeleteFavorite={handleDeleteFavorite}
            onExportFavorites={handleExportFavorites}
            favoritesImport={favoritesImport}
            setFavoritesImport={setFavoritesImport}
            onImportFavorites={handleImportFavorites}
            onAddDotsForFaction={(index) =>
              simRef.current?.addDotsForFaction(index)
            }
          />
        </aside>

        <main className="main" ref={mainRef}>
          <StatsPanel
            factions={statsFactions}
            total={statsTotal}
            fps={statsFps}
            palette={palette}
            onFactionClick={handleFactionClick}
            onFactionContextMenu={handleFactionContextMenu}
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
            <ContextMenu.Portal>
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
                        style={
                          { "--swatch-color": color } as React.CSSProperties
                        }
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
    </Theme>
  );
}

export default App;
