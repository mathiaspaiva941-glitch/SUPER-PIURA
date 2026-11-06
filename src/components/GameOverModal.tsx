import React from 'react';
import { ActiveBoss } from '../game/types';
import { RotateCcw, ShoppingBag, AlertTriangle, ShieldAlert } from 'lucide-react';

interface GameOverModalProps {
  level: number;
  boss: ActiveBoss | null;
  powerLevel: number;
  onRetry: () => void;
  onOpenShop: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  boss,
  powerLevel,
  onRetry,
  onOpenShop,
}) => {
  const isBossLevel = !!boss;
  const underLeveled = boss && powerLevel < boss.def.requiredPowerLevel;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-red-500 rounded-2xl p-6 shadow-2xl text-center text-slate-100 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-3">
          <ShieldAlert className="w-9 h-9 text-red-500" />
        </div>

        <h2 className="font-arcade text-base sm:text-lg text-red-400 mb-1">
          ¡MISIÓN FALLIDA!
        </h2>

        <div className="text-xs text-slate-400 mb-3">
          Te has quedado sin vidas en la Misión {level}
        </div>

        {/* Consejo Táctico Especial si se perdió contra un jefe */}
        {isBossLevel ? (
          <div className="w-full bg-amber-950/40 border border-amber-500/50 rounded-xl p-3 mb-5 text-left text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>CONSEJO DEL COE PARA VENCER AL JEFE:</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {underLeveled
                ? `Tu nivel de poder (Nv.${powerLevel}) es insuficiente frente al ${boss.def.name} (Requiere Nv.${boss.def.requiredPowerLevel}). ¡Solo podrás vencerlo si mejoras tu Motobomba y Botas en el Taller!`
                : `${boss.def.tacticalAdvice} Esquiva sus ráfagas agachándote con [S] y disparando a distancia.`}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-300 mb-5 leading-relaxed">
            Las corrientes de agua y huaicos pueden ser peligrosos. Mejora las Botas de Salto o el Chubasquero para mayor resistencia.
          </p>
        )}

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <button
            onClick={onRetry}
            className="flex-1 px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-arcade text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINTENTAR</span>
          </button>

          <button
            onClick={onOpenShop}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/50 font-arcade text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>MEJORAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
