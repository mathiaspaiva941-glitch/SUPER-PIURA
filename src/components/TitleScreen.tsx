import React from 'react';
import { CHARACTERS } from '../game/levels';
import { CharacterId } from '../game/types';
import { Sparkles, Shield, Zap, Heart, Footprints } from 'lucide-react';

interface TitleScreenProps {
  selectedChar: CharacterId;
  onSelectChar: (id: CharacterId) => void;
  onStartGame: () => void;
  onOpenShop: () => void;
  onOpenMap: () => void;
  coins: number;
  level: number;
  powerLevel: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedChar,
  onSelectChar,
  onStartGame,
  onOpenShop,
  onOpenMap,
  coins,
  level,
  powerLevel,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs relative overflow-hidden">
      {/* Fondo cinematográfico con la foto del juego */}
      <img
        src="/assets/aistudio/image_32265f24.png"
        alt="Piura Inundada por El Niño"
        className="absolute inset-0 w-full h-full object-cover filter brightness-[0.35] blur-[1px] scale-105 pointer-events-none"
      />
      <div className="relative z-10 w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-slate-900/90 border-2 border-amber-400 rounded-2xl p-6 sm:p-8 shadow-2xl text-center text-slate-100 flex flex-col items-center backdrop-blur-md">
        {/* Logo Retro Mario Bros estilo Perú */}
        <div className="mb-2">
          <svg className="w-full max-w-md h-auto" viewBox="0 0 540 120" fill="none">
            {/* Texto SUPER */}
            <text
              x="270"
              y="38"
              textAnchor="middle"
              className="font-arcade text-2xl font-black fill-amber-400"
              style={{ filter: 'drop-shadow(3px 3px 0px #78350f)' }}
            >
              SUPER PIURA BROS
            </text>
            {/* Subtítulo EL FENÓMENO DEL NIÑO */}
            <text
              x="270"
              y="74"
              textAnchor="middle"
              className="font-arcade text-sm sm:text-base font-bold fill-sky-300"
              style={{ filter: 'drop-shadow(2px 2px 0px #0369a1)' }}
            >
              EDICIÓN EL FENÓMENO DEL NIÑO
            </text>
            {/* Badge 100 MISIONES */}
            <rect x="170" y="88" width="200" height="24" rx="6" fill="#dc2626" />
            <text
              x="270"
              y="104"
              textAnchor="middle"
              className="font-arcade text-[10px] font-bold fill-white"
            >
              100 NIVELES · 10 JEFES
            </text>
          </svg>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mb-5 leading-relaxed">
          Las intensas lluvias y huaicos azotan la costa norte del Perú. Corre, salta, esquiva
          escombros y derrota a los 10 Titanes de Tempestad al final de cada mundo.
          <span className="block mt-1.5 font-bold text-red-400 bg-red-950/60 border border-red-500/50 py-1 px-3 rounded-lg">
            ⚡ ¡DIFICULTAD EXTREMA DESDE EL NIVEL 3! Monstruos que disparan lodo, nubes con rayos y huaicos despiadados. ¡Requiere reflejos y mejorar a tu personaje en el Taller!
          </span>
        </p>

        {/* Selector de Brigadistas */}
        <div className="w-full mb-6">
          <div className="text-xs font-arcade text-amber-400 mb-3 tracking-wider">
            ELIGE TU BRIGADISTA
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.values(CHARACTERS).map((char) => {
              const isSelected = selectedChar === char.id;
              return (
                <button
                  key={char.id}
                  onClick={() => onSelectChar(char.id)}
                  className={`p-3.5 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                      : 'bg-slate-900/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/40"
                      style={{ backgroundColor: char.color }}
                    />
                    <span className="text-[10px] font-arcade text-amber-300">
                      {char.id.toUpperCase()}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white mb-0.5">{char.name}</div>
                  <div className="text-[11px] text-sky-300 mb-2">{char.role}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                    {char.specialTrait}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-lg mb-4">
          <button
            onClick={onStartGame}
            className="w-full sm:w-auto flex-1 px-8 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-arcade text-sm rounded-xl shadow-lg shadow-red-600/30 transform active:scale-95 transition-all border-2 border-amber-300"
          >
            ▶ JUGAR (MISIÓN {level})
          </button>
          <button
            onClick={onOpenShop}
            className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/50 font-arcade text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            TALLER (MEJORAS)
          </button>
          <button
            onClick={onOpenMap}
            className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/50 font-arcade text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            MAPA 100
          </button>
        </div>

        {/* Barra de Estadísticas y Controles */}
        <div className="w-full pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4 font-mono">
            <span>🪙 Monedas: <strong className="text-amber-400">{coins}</strong></span>
            <span>⚡ Poder: <strong className="text-sky-400">Nv.{powerLevel}</strong></span>
            <span>🧭 Misión: <strong className="text-emerald-400">{level}/100</strong></span>
          </div>
          <div className="text-[11px] text-slate-400">
            [A/D o Flechas] Mover · [Shift/Z] Correr · [Espacio/W] Saltar · [X/J] Motobomba · [S] Agacharse
          </div>
        </div>
      </div>
    </div>
  );
};
