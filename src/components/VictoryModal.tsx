import React from 'react';
import { ActiveBoss } from '../game/types';
import { Trophy, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  level: number;
  score: number;
  coins: number;
  boss: ActiveBoss | null;
  onNextLevel: () => void;
  onOpenShop: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  score,
  coins,
  boss,
  onNextLevel,
  onOpenShop,
}) => {
  const isBossDefeated = boss && boss.state === 'defeated';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-400 rounded-2xl p-6 shadow-2xl text-center text-slate-100 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-3">
          <Trophy className="w-9 h-9 text-amber-400" />
        </div>

        <h2 className="font-arcade text-base sm:text-lg text-amber-400 mb-1">
          {isBossDefeated ? '🏆 ¡TITÁN DERROTADO!' : '¡MISIÓN COMPLETADA!'}
        </h2>

        <div className="text-xs text-sky-300 font-bold mb-4">
          {isBossDefeated
            ? `Has vencido al ${boss.def.name} en el Nivel ${level}`
            : `Misión ${level} superada con éxito`}
        </div>

        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          {isBossDefeated
            ? '¡Tu perseverancia y mejoras de brigada rompieron la tempestad! La comunidad está a salvo gracias a tu preparación.'
            : 'Los suministros llegaron al refugio seguro. ¡Excelente labor de rescate ante la emergencia!'}
        </p>

        {/* Resumen de Recompensas */}
        <div className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 mb-5 flex items-center justify-around font-mono text-xs">
          <div>
            <div className="text-[10px] text-slate-400">PUNTAJE</div>
            <div className="font-bold text-white text-sm">{score}</div>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div>
            <div className="text-[10px] text-slate-400">MONEDAS</div>
            <div className="font-bold text-amber-300 text-sm">🪙 {coins}</div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <button
            onClick={onNextLevel}
            className="flex-1 px-5 py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-arcade text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>SIGUIENTE</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenShop}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/50 font-arcade text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>TALLER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
