import React from 'react';
import { BOSS_ROSTER, WORLD_ZONES } from '../game/levels';
import { X, Lock, Skull, CheckCircle2, Play, Flame } from 'lucide-react';

interface WorldMapModalProps {
  currentLevel: number;
  maxUnlockedLevel: number;
  onSelectLevel: (lvl: number) => void;
  onClose: () => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  currentLevel,
  maxUnlockedLevel,
  onSelectLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border-2 border-sky-400 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-arcade text-lg sm:text-xl text-sky-400">
              🗺️ MAPA DE LAS 100 MISIONES · NORTE DEL PERÚ
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              10 Mundos, 10 Jefes de Tormenta. Puedes repetir niveles desbloqueados para conseguir más monedas.
            </p>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-950/50 border border-amber-500/40 px-2 py-0.5 rounded-md inline-flex">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>¡Dificultad Extrema desde el Nivel 3! Escupidores de lodo y nubes eléctricas atacando activamente.</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Lista de los 10 Mundos */}
        <div className="mt-4 space-y-4">
          {WORLD_ZONES.map((zone) => {
            const startLvl = (zone.world - 1) * 10 + 1;
            const endLvl = zone.world * 10;
            const bossLvl = endLvl;
            const bossDef = BOSS_ROSTER[bossLvl];
            const isWorldUnlocked = maxUnlockedLevel >= startLvl;

            return (
              <div
                key={zone.world}
                className={`p-3.5 rounded-xl border transition-all ${
                  isWorldUnlocked
                    ? 'bg-slate-800/70 border-slate-700'
                    : 'bg-slate-900/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-arcade text-xs text-amber-400">
                      MUNDO {zone.world}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {zone.name}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      · {zone.region}
                    </span>
                  </div>

                  {bossDef && (
                    <div className="flex items-center gap-1.5 text-[11px] text-red-300 bg-red-950/60 border border-red-800/60 px-2.5 py-0.5 rounded-full">
                      <Skull className="w-3.5 h-3.5 text-red-400" />
                      <span>Jefe: {bossDef.name}</span>
                    </div>
                  )}
                </div>

                {/* Grilla de los 10 Niveles del Mundo */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {Array.from({ length: 10 }, (_, i) => {
                    const lvl = startLvl + i;
                    const isUnlocked = lvl <= maxUnlockedLevel;
                    const isCurrent = lvl === currentLevel;
                    const isCompleted = lvl < maxUnlockedLevel;
                    const isBoss = lvl % 10 === 0;

                    return (
                      <button
                        key={lvl}
                        disabled={!isUnlocked}
                        onClick={() => {
                          onSelectLevel(lvl);
                          onClose();
                        }}
                        className={`p-2 rounded-lg text-center font-mono text-xs flex flex-col items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 font-bold border-2 border-amber-200 shadow-md scale-105'
                            : isBoss
                            ? isUnlocked
                              ? 'bg-red-900/80 text-red-200 border border-red-500/70 hover:bg-red-800'
                              : 'bg-slate-950/60 text-slate-600 border border-slate-800'
                            : isCompleted
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900/80'
                            : isUnlocked
                            ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
                            : 'bg-slate-950/40 text-slate-600 border border-slate-800/80 cursor-not-allowed'
                        }`}
                      >
                        <span className="font-bold">{lvl}</span>
                        <div className="mt-0.5">
                          {isCurrent ? (
                            <Play className="w-3 h-3 fill-slate-950 text-slate-950" />
                          ) : isBoss ? (
                            <Skull className="w-3 h-3" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : isUnlocked ? (
                            lvl >= 3 ? (
                              <Flame className="w-3 h-3 text-orange-400" />
                            ) : (
                              <span className="text-[9px] opacity-70">DISP</span>
                            )
                          ) : (
                            <Lock className="w-3 h-3 opacity-40" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-all"
          >
            VOLVER AL JUEGO
          </button>
        </div>
      </div>
    </div>
  );
};
