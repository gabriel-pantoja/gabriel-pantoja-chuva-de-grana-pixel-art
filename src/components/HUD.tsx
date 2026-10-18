import React from 'react';
import { Volume2, VolumeX, Pause, ShoppingBag, Flame, Zap, Magnet } from 'lucide-react';
import { ActivePowerup } from '../types/game';

interface HUDProps {
  timeRemaining: number;
  roundScore: number;
  bankBalance: number;
  combo: number;
  activePowerups: ActivePowerup[];
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenShop?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  timeRemaining,
  roundScore,
  bankBalance,
  combo,
  activePowerups,
  isMuted,
  onToggleMute,
  onPause,
  onOpenShop,
}) => {
  const isUrgent = timeRemaining <= 10;

  return (
    <div className="absolute inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between select-none">
      {/* Top Bar Status Clusters */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: Round & Bank Earnings */}
        <div className="flex flex-col gap-1.5">
          {/* Round Score */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border-2 border-emerald-400 shadow-lg text-emerald-300">
            <span className="text-[9px] font-arcade uppercase text-emerald-400">TURNO:</span>
            <span className="font-pixel text-sm sm:text-base text-emerald-200 tabular-nums">
              +${roundScore.toLocaleString()}
            </span>
          </div>

          {/* Bank Balance */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/80 border border-slate-700 text-slate-300">
            <span className="text-[8px] font-arcade uppercase text-amber-400">BANCO:</span>
            <span className="font-pixel text-xs text-amber-300 tabular-nums">
              ${bankBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Center: Retro 60s Arcade Timer */}
        <div className="flex flex-col items-center">
          <div
            className={`px-4 py-2 border-3 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.6)] ${
              isUrgent
                ? 'bg-red-950/90 border-red-500 animate-pulse text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                : 'bg-slate-900/90 border-amber-400 text-amber-300'
            }`}
          >
            <div className="text-[8px] font-arcade text-center uppercase tracking-wider mb-0.5 opacity-80">
              TEMPO RESTANTE
            </div>
            <div className="font-pixel text-xl sm:text-2xl text-center tabular-nums leading-none">
              {String(Math.max(0, Math.ceil(timeRemaining))).padStart(2, '0')}s
            </div>
          </div>

          {/* Combo Multiplier Meter */}
          {combo > 1 && (
            <div className="mt-1.5 px-2.5 py-0.5 bg-amber-500 text-slate-950 border border-amber-300 font-pixel text-[9px] flex items-center gap-1 animate-bounce">
              <Flame className="w-3 h-3 fill-slate-950" />
              <span>COMBO x{combo}</span>
            </div>
          )}
        </div>

        {/* Right: Controls & Active Powerups */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {onOpenShop && (
            <button
              onClick={onOpenShop}
              className="p-2 bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-2 border-amber-400 cursor-pointer shadow-md transition-colors"
              title="Abrir Loja de Roupas"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onToggleMute}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer shadow-md transition-colors"
            title={isMuted ? 'Desmutar Som' : 'Mutar Som'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onPause}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer shadow-md transition-colors"
            title="Pausar Jogo (Esc / P)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Powerups Tray (Bottom Left) */}
      <div className="flex items-center gap-2">
        {activePowerups.map((p) => (
          <div
            key={p.type}
            className="px-2.5 py-1 bg-slate-900/90 border border-amber-400 text-amber-300 text-[9px] font-pixel flex items-center gap-1.5 shadow-md"
          >
            {p.type === 'magnet' && <Magnet className="w-3 h-3 text-red-400 animate-pulse" />}
            {p.type === 'multiplier' && <Zap className="w-3 h-3 text-yellow-300 animate-pulse" />}
            {p.type === 'speed' && <Zap className="w-3 h-3 text-blue-400 animate-pulse" />}
            <span className="uppercase">{p.type}</span>
            <span className="text-white tabular-nums">{p.duration.toFixed(1)}s</span>
          </div>
        ))}
      </div>
    </div>
  );
};
