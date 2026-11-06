import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { CharacterId, GameState, Upgrades } from './game/types';
import { sound } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { ShopModal } from './components/ShopModal';
import { WorldMapModal } from './components/WorldMapModal';
import { TouchControls } from './components/TouchControls';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Estados sincronizados con React para la UI
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [level, setLevel] = useState<number>(1);
  const [world, setWorld] = useState<number>(1);
  const [subLevel, setSubLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [powerLevel, setPowerLevel] = useState<number>(4);
  const [selectedChar, setSelectedChar] = useState<CharacterId>('killa');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [radioAlert, setRadioAlert] = useState<string | null>(null);

  // Modales
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Sincronizar datos del motor con React
  const syncFromEngine = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    setLevel(engine.currentLevel);
    setWorld(engine.levelData?.world || 1);
    setSubLevel(engine.levelData?.subLevel || 1);
    setScore(engine.score);
    setCoins(engine.coins);
    setLives(engine.lives);
    setSelectedChar(engine.selectedChar);
    setPowerLevel(engine.getPlayerPowerLevel());
    setSoundEnabled(sound.enabled);
  }, []);

  // Inicializar Motor y Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Configurar resolución interna de 960x540 (16:9 clásica)
    canvas.width = 960;
    canvas.height = 540;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    engine.onStateChange = (newState) => {
      setGameState(newState);
      syncFromEngine();
    };

    engine.onHudUpdate = () => {
      syncFromEngine();
    };

    engine.onRadioAlert = (msg) => {
      setRadioAlert(msg);
      setTimeout(() => setRadioAlert(null), 6000);
    };

    syncFromEngine();
    engine.startLoop();

    return () => {
      engine.stopLoop();
    };
  }, [syncFromEngine]);

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.keys.right = true;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        engine.keys.down = true;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        engine.keys.jump = true;
        engine.jump();
      }
      if (e.key === 'Shift' || e.key === 'z' || e.key === 'Z') {
        engine.keys.sprint = true;
      }
      if (e.key === 'x' || e.key === 'X' || e.key === 'j' || e.key === 'J' || e.key === 'e' || e.key === 'E') {
        engine.shootWater();
      }
      if (e.key === 'Escape') {
        if (engine.state === 'PLAYING') {
          setIsPaused((prev) => !prev);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.keys.right = false;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        engine.keys.down = false;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        engine.keys.jump = false;
      }
      if (e.key === 'Shift' || e.key === 'z' || e.key === 'Z') {
        engine.keys.sprint = false;
      }
    };

    const handleBlur = () => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.keys.left = false;
      engine.keys.right = false;
      engine.keys.up = false;
      engine.keys.down = false;
      engine.keys.jump = false;
      engine.keys.sprint = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Controladores de UI
  const handleStartGame = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.startLevel(engine.currentLevel);
    setGameState('PLAYING');
    setIsPaused(false);
  };

  const handleSelectChar = (id: CharacterId) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setCharacter(id);
    setSelectedChar(id);
  };

  const handleUpgrade = (type: keyof Upgrades, cost: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.purchaseUpgrade(type, cost);
    syncFromEngine();
  };

  const handleSelectLevel = (lvl: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.startLevel(lvl);
    setGameState('PLAYING');
    setIsPaused(false);
  };

  const handleToggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
    const engine = engineRef.current;
    if (engine) engine.saveProgress();
  };

  const handleNextLevel = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.advanceNextLevel();
  };

  const handleRetry = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.startLevel(engine.currentLevel);
  };

  const handleTouchKeyDown = (key: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (key === 'left') engine.keys.left = true;
    if (key === 'right') engine.keys.right = true;
    if (key === 'down') engine.keys.down = true;
    if (key === 'sprint') engine.keys.sprint = true;
  };

  const handleTouchKeyUp = (key: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (key === 'left') engine.keys.left = false;
    if (key === 'right') engine.keys.right = false;
    if (key === 'down') engine.keys.down = false;
    if (key === 'sprint') engine.keys.sprint = false;
  };

  const handleTouchShoot = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.shootWater();
  };

  const handleTouchJump = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.jump();
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center relative select-none">
      {/* Marco de fondo ambiental difuminado con la foto del juego */}
      <img
        src="/assets/aistudio/image_32265f24.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover filter blur-xl opacity-25 pointer-events-none scale-110"
      />

      {/* Contenedor del Juego Escala 16:9 */}
      <div className="relative w-full h-full max-w-[1920px] max-h-[1080px] aspect-video flex items-center justify-center">
        {/* Canvas de juego retro */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pixel-art shadow-2xl block"
        />

        {/* HUD de Juego (visible en PLAYING y PAUSA) */}
        {gameState === 'PLAYING' && (
          <>
            <HUD
              level={level}
              world={world}
              subLevel={subLevel}
              zone={engineRef.current?.levelData?.zone || null}
              score={score}
              coins={coins}
              lives={lives}
              powerLevel={powerLevel}
              boss={engineRef.current?.activeBoss || null}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              onPause={() => setIsPaused((prev) => !prev)}
              onOpenShop={() => setShowShop(true)}
              onOpenMap={() => setShowMap(true)}
              radioAlert={radioAlert}
            />

            {/* Controles táctiles en pantalla */}
            <TouchControls
              onKeyDown={handleTouchKeyDown}
              onKeyUp={handleTouchKeyUp}
              onShoot={handleTouchShoot}
              onJump={handleTouchJump}
            />
          </>
        )}

        {/* Pantalla de Inicio */}
        {gameState === 'TITLE' && (
          <TitleScreen
            selectedChar={selectedChar}
            onSelectChar={handleSelectChar}
            onStartGame={handleStartGame}
            onOpenShop={() => setShowShop(true)}
            onOpenMap={() => setShowMap(true)}
            coins={coins}
            level={level}
            powerLevel={powerLevel}
          />
        )}

        {/* Modal de Pausa */}
        {isPaused && gameState === 'PLAYING' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="bg-slate-900 border-2 border-amber-400 rounded-2xl p-6 text-center max-w-sm w-full shadow-2xl">
              <h2 className="font-arcade text-lg text-amber-400 mb-3">⏸ PAUSA</h2>
              <p className="text-xs text-slate-300 mb-5">
                Misión {level} detenida temporalmente.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setIsPaused(false)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-xs rounded-xl transition-all"
                >
                  CONTINUAR
                </button>
                <button
                  onClick={() => {
                    setIsPaused(false);
                    setShowShop(true);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-arcade text-xs rounded-xl transition-all"
                >
                  TALLER (MEJORAS)
                </button>
                <button
                  onClick={() => {
                    setIsPaused(false);
                    setGameState('TITLE');
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-arcade text-xs rounded-xl transition-all"
                >
                  MENÚ PRINCIPAL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Victoria */}
        {gameState === 'VICTORY' && (
          <VictoryModal
            level={level}
            score={score}
            coins={coins}
            boss={engineRef.current?.activeBoss || null}
            onNextLevel={handleNextLevel}
            onOpenShop={() => setShowShop(true)}
          />
        )}

        {/* Modal de Misión Fallida / Game Over */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal
            level={level}
            boss={engineRef.current?.activeBoss || null}
            powerLevel={powerLevel}
            onRetry={handleRetry}
            onOpenShop={() => setShowShop(true)}
          />
        )}

        {/* Modal del Taller / Tienda de Mejoras */}
        {showShop && (
          <ShopModal
            coins={coins}
            upgrades={engineRef.current?.upgrades || { waterCannon: 1, boots: 1, raincoat: 1, backpack: 1, maxLives: 1 }}
            powerLevel={powerLevel}
            currentLevel={level}
            onUpgrade={handleUpgrade}
            onClose={() => setShowShop(false)}
          />
        )}

        {/* Modal del Mapa de las 100 Misiones */}
        {showMap && (
          <WorldMapModal
            currentLevel={level}
            maxUnlockedLevel={engineRef.current?.maxUnlockedLevel || 1}
            onSelectLevel={handleSelectLevel}
            onClose={() => setShowMap(false)}
          />
        )}
      </div>
    </div>
  );
}
