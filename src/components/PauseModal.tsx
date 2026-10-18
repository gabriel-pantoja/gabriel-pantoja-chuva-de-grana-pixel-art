import React from 'react';
import { Play, RotateCcw, ShoppingBag, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenShop: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenShop,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-slate-900 border-4 border-amber-500 p-6 text-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
        <h3 className="font-pixel text-lg text-amber-300 mb-6 drop-shadow-[0_2px_0_#78350f]">
          JOGO PAUSADO
        </h3>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs border-2 border-emerald-400 pixel-btn-retro flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>CONTINUAR (ESC)</span>
          </button>

          <button
            onClick={onOpenShop}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs border-2 border-amber-300 font-bold pixel-btn-retro flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>LOJA DE ROUPAS</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs border border-slate-600 pixel-btn-retro flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINICIAR TURNO</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 font-arcade text-xs border border-slate-800 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span>SOM: {isMuted ? 'DESATIVADO' : 'ATIVADO'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
