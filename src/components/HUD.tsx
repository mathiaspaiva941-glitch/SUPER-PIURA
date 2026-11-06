import React from 'react';
import { ActiveBoss, WorldZone } from '../game/types';
import { Heart, Coins, Zap, Volume2, VolumeX, Pause, ShoppingBag, Map } from 'lucide-react';

interface HUDProps {
  level: number;
  world: number;
  subLevel: number;
  zone: WorldZone | null;
  score: number;
  coins: number;
  lives: number;
  powerLevel: number;
  boss: ActiveBoss | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onOpenShop: () => void;
  onOpenMap: () => void;
  radioAlert: string | null;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  world,
  subLevel,
  zone,
  score,
  coins,
  lives,
  powerLevel,
  boss,
  soundEnabled,
  onToggleSound,
  onPause,
  onOpenShop,
  onOpenMap,
  radioAlert,
}) => {
  const isBossLevel = subLevel === 10;

  const difficultyBadge =
    world <= 2
      ? { label: 'NORMAL', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' }
      : world <= 5
      ? { label: 'DIFÍCIL', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' }
      : world <= 8
      ? { label: 'EXTREMA', color: 'text-red-400 border-red-500/40 bg-red-950/50' }
      : { label: 'PESADILLA', color: 'text-purple-400 border-purple-500/40 bg-purple-950/60 animate-pulse' };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 select-none">
      {/* Top Bar - Mario HUD Clásico */}
      <div className="flex items-start justify-between gap-4">
        {/* Izquierda: Mundo, Zona y Dificultad */}
        <div className="flex flex-col bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 pointer-events-auto backdrop-blur-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-arcade text-xs text-amber-400">
              MUNDO {world}-{subLevel}
            </span>
            {isBossLevel ? (
              <span className="font-arcade text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded animate-pulse">
                JEFE
              </span>
            ) : (
              <span className={`font-arcade text-[9px] px-1.5 py-0.5 rounded border ${difficultyBadge.color}`}>
                {difficultyBadge.label}
              </span>
            )}
          </div>
          <span className="text-[11px] text-sky-200 font-semibold truncate max-w-[170px]">
            {zone?.name || 'Piura'}
          </span>
        </div>

        {/* Centro: Barra de Jefe si está en nivel de jefe, o Puntuación */}
        {boss && boss.state !== 'defeated' ? (
          <div className="flex-1 max-w-md mx-auto bg-slate-950/85 border-2 border-red-500 rounded-xl px-4 py-2 pointer-events-auto backdrop-blur-xs shadow-xl animate-fade-in">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-arcade text-[11px] text-red-400 truncate font-bold">
                {boss.def.name.toUpperCase()}
              </span>
              <span className="font-mono text-xs text-slate-300 font-bold">
                {Math.max(0, boss.hp)} / {boss.maxHp} HP
              </span>
            </div>
            {/* Barra de Vida del Jefe */}
            <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  boss.hp / boss.maxHp > 0.5
                    ? 'bg-gradient-to-r from-red-600 to-amber-500'
                    : 'bg-gradient-to-r from-red-700 to-red-500 animate-pulse'
                }`}
                style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
              />
            </div>
            {/* Estado de Blindaje vs Vulnerabilidad */}
            <div className="mt-1 flex items-center justify-between text-[10px]">
              {powerLevel < boss.def.requiredPowerLevel ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  ⚠️ Blindado: Requiere Poder Nv.{boss.def.requiredPowerLevel} (Tienes Nv.{powerLevel})
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  ⚡ Armadura rota: ¡Tu equipamiento puede derrotarlo!
                </span>
              )}
              <span className="text-slate-400 font-mono">Fase {boss.phase}</span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex flex-col items-center bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-2 backdrop-blur-xs">
            <span className="text-[10px] text-slate-400 font-arcade">PUNTAJE</span>
            <span className="font-mono text-sm text-white font-bold tracking-widest tabular-nums">
              {score.toString().padStart(6, '0')}
            </span>
          </div>
        )}

        {/* Derecha: Monedas, Vidas, Poder y Acciones */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Monedas */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-amber-500/40 rounded-xl px-2.5 py-2 shadow-md">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
              {coins}
            </span>
          </div>

          {/* Vidas */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-red-500/40 rounded-xl px-2.5 py-2 shadow-md">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="font-mono text-xs font-bold text-red-300 tabular-nums">
              {lives}
            </span>
          </div>

          {/* Nivel de Poder */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-sky-500/40 rounded-xl px-2.5 py-2 shadow-md" title="Nivel de poder total de tu personaje">
            <Zap className="w-4 h-4 text-sky-400" />
            <span className="font-mono text-xs font-bold text-sky-300 tabular-nums">
              Nv.{powerLevel}
            </span>
          </div>

          {/* Botón Tienda / Mejoras */}
          <button
            onClick={onOpenShop}
            className="p-2 bg-amber-600/90 hover:bg-amber-500 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
            title="Taller de Mejoras de Personaje"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden lg:inline">TALLER</span>
          </button>

          {/* Botón Mapa */}
          <button
            onClick={onOpenMap}
            className="p-2 bg-slate-800/90 hover:bg-slate-700 text-sky-300 rounded-xl border border-slate-700 shadow-md transition-all active:scale-95"
            title="Ver Mapa de 100 Misiones"
          >
            <Map className="w-4 h-4" />
          </button>

          {/* Botón Sonido */}
          <button
            onClick={onToggleSound}
            className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 shadow-md transition-all active:scale-95"
            title="Activar/Desactivar sonido"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Botón Pausa */}
          <button
            onClick={onPause}
            className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 shadow-md transition-all active:scale-95"
            title="Pausar juego"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ticker de Radio de Emergencia / Consejos Tácticos */}
      {radioAlert && (
        <div className="self-center max-w-xl bg-slate-900/90 border border-sky-400/60 rounded-xl px-4 py-2 backdrop-blur-xs text-xs text-sky-200 pointer-events-auto shadow-lg flex items-center gap-2 mb-2 animate-fade-in">
          <span className="font-arcade text-[10px] text-amber-400 uppercase tracking-wider shrink-0">
            📻 RADIO COE:
          </span>
          <span className="leading-tight font-medium text-[11px]">{radioAlert}</span>
        </div>
      )}
    </div>
  );
};
