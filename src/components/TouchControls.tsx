import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Zap, Droplets } from 'lucide-react';

interface TouchControlsProps {
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
  onShoot: () => void;
  onJump: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onKeyDown,
  onKeyUp,
  onShoot,
  onJump,
}) => {
  const bindTouch = (key: string) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      onKeyDown(key);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      onKeyUp(key);
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      onKeyDown(key);
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault();
      onKeyUp(key);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      e.preventDefault();
      onKeyUp(key);
    },
  });

  return (
    <div className="absolute bottom-3 inset-x-3 pointer-events-none z-20 flex items-end justify-between select-none">
      {/* D-Pad a la izquierda (Izquierda, Derecha, Agacharse) */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          {...bindTouch('left')}
          className="w-14 h-14 bg-slate-900/80 active:bg-slate-700 text-amber-400 border-2 border-slate-700/80 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Izquierda"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>

        <button
          {...bindTouch('down')}
          className="w-12 h-12 bg-slate-900/80 active:bg-slate-700 text-amber-400 border-2 border-slate-700/80 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Agacharse"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        <button
          {...bindTouch('right')}
          className="w-14 h-14 bg-slate-900/80 active:bg-slate-700 text-amber-400 border-2 border-slate-700/80 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Derecha"
        >
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>

      {/* Botones de Acción a la derecha (Saltar [A], Correr [B], Motobomba [X]) */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* Disparo Motobomba [X] */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onShoot();
          }}
          onClick={onShoot}
          className="w-13 h-13 bg-sky-600/90 active:bg-sky-500 text-white border-2 border-sky-300 rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Disparar Motobomba"
        >
          <Droplets className="w-5 h-5" />
          <span className="font-arcade text-[8px] mt-0.5">AGUA</span>
        </button>

        {/* Sprint / Correr [B] */}
        <button
          {...bindTouch('sprint')}
          className="w-13 h-13 bg-amber-600/90 active:bg-amber-500 text-white border-2 border-amber-300 rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Correr"
        >
          <Zap className="w-5 h-5" />
          <span className="font-arcade text-[8px] mt-0.5">CORRER</span>
        </button>

        {/* Saltar [A] */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          onClick={onJump}
          className="w-16 h-16 bg-red-600/95 active:bg-red-500 text-white border-2 border-amber-300 rounded-2xl flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform"
          aria-label="Saltar"
        >
          <ArrowUp className="w-6 h-6 stroke-[3]" />
          <span className="font-arcade text-[9px] mt-0.5">SALTAR</span>
        </button>
      </div>
    </div>
  );
};
