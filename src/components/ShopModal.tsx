import React from 'react';
import { Upgrades } from '../game/types';
import { BOSS_ROSTER } from '../game/levels';
import { X, Shield, Zap, Footprints, Droplets, Heart, Backpack, Check, AlertTriangle } from 'lucide-react';

interface ShopModalProps {
  coins: number;
  upgrades: Upgrades;
  powerLevel: number;
  currentLevel: number;
  onUpgrade: (type: keyof Upgrades, cost: number) => void;
  onClose: () => void;
}

interface UpgradeItem {
  id: keyof Upgrades;
  name: string;
  icon: React.ReactNode;
  desc: string;
  benefits: string[];
  basePrice: number;
  priceMultiplier: number;
}

const UPGRADE_DEFINITIONS: UpgradeItem[] = [
  {
    id: 'waterCannon',
    name: 'Motobomba a Presión',
    icon: <Droplets className="w-6 h-6 text-sky-400" />,
    desc: 'Arma principal de agua a presión. Indispensable para disolver las corazas de barro de los jefes.',
    benefits: [
      'Nivel 1: Chorro suave (1 daño)',
      'Nivel 2: Agua concentrada (2 daño · rompe armadura Jefe 1)',
      'Nivel 3: Cañón hidráulico (3 daño · hiere Jefe 2 y 3)',
      'Nivel 4: Torrente pesado (4 daño · quiebra rocas)',
      'Nivel 5: Super Chorro Industrial (5 daño · anula Ciclón Yaku)',
    ],
    basePrice: 40,
    priceMultiplier: 1.6,
  },
  {
    id: 'boots',
    name: 'Botas Antideslizantes',
    icon: <Footprints className="w-6 h-6 text-amber-400" />,
    desc: 'Tracción sobre lodo y mayor altura de salto. ¡El Nivel 3 desbloquea el Doble Salto!',
    benefits: [
      'Nivel 1: Salto normal',
      'Nivel 2: Tracción anti-lodo y sprint +20%',
      'Nivel 3: ¡DOBLE SALTO en el aire para esquivar!',
      'Nivel 4: Salto alto extendido',
      'Nivel 5: Máxima agilidad y deslizamiento rápido',
    ],
    basePrice: 50,
    priceMultiplier: 1.7,
  },
  {
    id: 'raincoat',
    name: 'Chubasquero Blindado',
    icon: <Shield className="w-6 h-6 text-emerald-400" />,
    desc: 'Armadura impermeable que amortigua golpes de huaico y reduce el daño de tormenta.',
    benefits: [
      'Nivel 1: Traje de brigada estándar',
      'Nivel 2: Escudo impermeable básico',
      'Nivel 3: Reducción de retroceso por impactos',
      'Nivel 4: Probabilidad de anular golpes graves',
      'Nivel 5: Blindaje hermético anti-vendavales',
    ],
    basePrice: 45,
    priceMultiplier: 1.6,
  },
  {
    id: 'backpack',
    name: 'Mochila & Imán de Monedas',
    icon: <Backpack className="w-6 h-6 text-purple-400" />,
    desc: 'Mayor cadencia de disparo para la motobomba y campo magnético para atraer monedas.',
    benefits: [
      'Nivel 1: Radio de imán básico',
      'Nivel 2: Mayor velocidad de disparo y +30% imán',
      'Nivel 3: Ráfagas continuas de agua',
      'Nivel 4: Gran radio de atracción de monedas',
      'Nivel 5: Cadencia turbo e imán masivo',
    ],
    basePrice: 35,
    priceMultiplier: 1.5,
  },
  {
    id: 'maxLives',
    name: 'Resistencia / Corazón Extra',
    icon: <Heart className="w-6 h-6 text-red-500 fill-red-500" />,
    desc: 'Aumenta tus vidas máximas por cada nivel para resistir las batallas más difíciles.',
    benefits: [
      'Nivel 1: 3 Vidas de brigadista',
      'Nivel 2: +1 Vida (Total 4)',
      'Nivel 3: +1 Vida (Total 5)',
      'Nivel 4: +1 Vida (Total 6)',
      'Nivel 5: +1 Vida (Total 7 vidas)',
    ],
    basePrice: 60,
    priceMultiplier: 1.8,
  },
];

export const ShopModal: React.FC<ShopModalProps> = ({
  coins,
  upgrades,
  powerLevel,
  currentLevel,
  onUpgrade,
  onClose,
}) => {
  // Próximo jefe
  const nextBossLevel = Math.ceil(currentLevel / 10) * 10;
  const nextBoss = BOSS_ROSTER[nextBossLevel] || BOSS_ROSTER[10];
  const isReadyForNextBoss = powerLevel >= nextBoss.requiredPowerLevel;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border-2 border-amber-400 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col">
        {/* Cabecera del Taller */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-arcade text-lg sm:text-xl text-amber-400">
              🛒 TALLER DE MEJORAS DE LA BRIGADA
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Mejora a tu personaje para derrotar a los 10 Titanes de Tempestad.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Panel de Estado de Preparación para el Jefe */}
        <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Nivel de Preparación de tu Personaje
              </div>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                Poder Total: <span className="text-amber-400 font-mono">Nv.{powerLevel}</span>
              </div>
            </div>
          </div>

          {/* Saldo de Monedas */}
          <div className="px-4 py-2 bg-slate-900 border border-amber-500/50 rounded-xl flex items-center gap-2">
            <span className="text-xs text-slate-400">Tus Monedas:</span>
            <span className="font-mono text-base font-bold text-amber-300">
              🪙 {coins}
            </span>
          </div>
        </div>

        {/* Alerta del Próximo Jefe */}
        <div
          className={`mt-3 p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
            isReadyForNextBoss
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}
        >
          {isReadyForNextBoss ? (
            <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm">
              Próximo Jefe: {nextBoss.name} (Misión {nextBossLevel})
            </div>
            <div className="mt-0.5 opacity-90">
              {isReadyForNextBoss
                ? `¡Tu brigadista está preparado (Poder Nv.${powerLevel} >= Nv.${nextBoss.requiredPowerLevel})! Podrás perforar su escudo de lodo.`
                : `⚠️ ¡ADVERTENCIA! El jefe requiere Poder Nv.${nextBoss.requiredPowerLevel}. ${nextBoss.tacticalAdvice}`}
            </div>
          </div>
        </div>

        {/* Tarjetas de Mejoras */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-2">
          {UPGRADE_DEFINITIONS.map((item) => {
            const currentTier = upgrades[item.id];
            const isMax = currentTier >= 5;
            const cost = Math.round(
              item.basePrice * Math.pow(item.priceMultiplier, currentTier - 1)
            );
            const canAfford = coins >= cost && !isMax;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">{item.name}</h3>
                        <div className="text-[11px] text-amber-400 font-mono font-semibold">
                          Nivel {currentTier} / 5
                        </div>
                      </div>
                    </div>

                    {/* Indicador de Tiers */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((tier) => (
                        <div
                          key={tier}
                          className={`w-2.5 h-2.5 rounded-xs ${
                            tier <= currentTier
                              ? 'bg-amber-400 shadow-xs shadow-amber-400/50'
                              : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-2 leading-snug">
                    {item.desc}
                  </p>

                  <div className="text-[11px] text-sky-300 font-medium bg-slate-900/60 p-2 rounded-lg border border-slate-700/50 mb-3">
                    {item.benefits[currentTier - 1]}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-750">
                  <span className="text-xs font-mono font-semibold text-slate-300">
                    {isMax ? 'NIVEL MÁXIMO' : `Costo: 🪙 ${cost}`}
                  </span>
                  <button
                    disabled={!canAfford}
                    onClick={() => onUpgrade(item.id, cost)}
                    className={`px-4 py-2 rounded-lg font-arcade text-[10px] transition-all ${
                      isMax
                        ? 'bg-slate-750 text-slate-400 cursor-not-allowed'
                        : canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold active:scale-95 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    {isMax ? 'COMPLETO' : 'MEJORAR'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón Cerrar */}
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
