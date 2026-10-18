import React from 'react';
import { ShoppingBag, Play, Trophy, Sparkles, Flame } from 'lucide-react';
import { PixelCharacterPreview } from './PixelCharacterPreview';

interface RoundEndModalProps {
  roundScore: number;
  bankBalance: number;
  maxCombo: number;
  itemsCollectedCount: number;
  isNewRecord: boolean;
  equippedIds: string[];
  onGoToShop: () => void;
  onPlayAgain: () => void;
}

export const RoundEndModal: React.FC<RoundEndModalProps> = ({
  roundScore,
  bankBalance,
  maxCombo,
  itemsCollectedCount,
  isNewRecord,
  equippedIds,
  onGoToShop,
  onPlayAgain,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-4 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)] p-6 text-center flex flex-col items-center">
        
        {/* Banner Title */}
        <div className="inline-block px-4 py-1.5 bg-red-600 text-white font-pixel text-xs sm:text-sm border-2 border-red-400 mb-3 animate-pulse">
          TEMPO ESGOTADO!
        </div>

        <h3 className="font-pixel text-lg sm:text-xl text-yellow-300 drop-shadow-[0_2px_0_#78350f]">
          FIM DO TURNO (60s)
        </h3>

        {/* Character Celebration Preview */}
        <div className="my-3">
          <PixelCharacterPreview
            equippedIds={equippedIds}
            scale={5}
            width={120}
            height={150}
            pose="catch"
            animate={true}
          />
        </div>

        {/* Earnings Card */}
        <div className="w-full bg-slate-950 border-2 border-amber-400/80 p-4 my-2 shadow-inner">
          <div className="text-[10px] font-arcade text-slate-400 uppercase tracking-wider">
            Total Coletado Neste Turno
          </div>
          <div className="font-pixel text-2xl sm:text-3xl text-emerald-400 my-1 animate-bounce">
            +${roundScore.toLocaleString()}
          </div>
          {isNewRecord && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-slate-950 font-pixel text-[8px] font-bold">
              <Trophy className="w-3 h-3" /> NOVO RECORDE PESSOAL!
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 w-full my-2 text-xs">
          <div className="bg-slate-950/70 border border-slate-800 p-2 text-left">
            <span className="text-[9px] font-arcade text-slate-400 block">ITENS COLETADOS</span>
            <span className="font-pixel text-slate-200">{itemsCollectedCount} itens</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-2 text-left">
            <span className="text-[9px] font-arcade text-slate-400 block">MAIOR COMBO</span>
            <span className="font-pixel text-amber-300 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-400" /> {maxCombo}x
            </span>
          </div>
        </div>

        <div className="text-[10px] font-arcade text-amber-200/90 my-2">
          Saldo total transferido para seu banco: <strong className="text-yellow-300 font-pixel text-xs">${bankBalance.toLocaleString()}</strong>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full mt-3">
          <button
            onClick={onGoToShop}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs border-2 border-amber-300 font-bold pixel-btn-retro flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.4)]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>LOJA DE ROUPAS</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs border-2 border-emerald-300 pixel-btn-retro flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>JOGAR NOVAMENTE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
