import React from 'react';
import { PixelCharacterPreview } from './PixelCharacterPreview';
import { Play, Sparkles, ShoppingBag, Trophy, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/audio';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenShop: () => void;
  bankBalance: number;
  equippedIds: string[];
  highScore: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenShop,
  bankBalance,
  equippedIds,
  highScore,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-between p-4 sm:p-8 bg-slate-950/95 overflow-hidden select-none">
      {/* Top Bar with sound and bank */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 text-xs font-pixel text-amber-300">
          <span>BANCO:</span>
          <span className="text-yellow-400 font-bold">${bankBalance.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          {highScore > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-amber-500/50 text-xs font-pixel text-amber-200">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>RECORDE: ${highScore.toLocaleString()}</span>
            </div>
          )}
          <button
            onClick={onToggleMute}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
            title="Alternar Áudio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Main Center Section */}
      <div className="flex flex-col items-center justify-center my-auto text-center z-10 max-w-xl">
        {/* Bespoke Pixel Art Title SVG Logo Lockup */}
        <div className="relative mb-4">
          <div className="font-pixel text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 drop-shadow-[0_4px_0_#78350f] tracking-tight leading-tight">
            CHUVA DE GRANA
          </div>
          <div className="font-arcade text-xs sm:text-sm text-emerald-400 tracking-widest mt-1 uppercase">
            ★ PIXEL ARCADE 8-BIT ★
          </div>
          <div className="absolute -top-3 -right-6 animate-bounce">
            <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-pixel text-[8px] font-bold border border-emerald-300">
              60s ROUNDS
            </span>
          </div>
        </div>

        {/* Live Animated Character Showcase */}
        <div className="relative my-3 p-4 bg-slate-900/80 border-4 border-amber-600 shadow-[0_0_25px_rgba(245,158,11,0.2)] flex flex-col items-center">
          <PixelCharacterPreview
            equippedIds={equippedIds}
            scale={6}
            width={140}
            height={170}
            animate={true}
          />
          <div className="text-[9px] font-pixel text-slate-400 mt-1">
            {equippedIds.length === 0
              ? 'Calção básico pronto para a fortuna!'
              : `${equippedIds.length} peça(s) de luxo equipada(s)`}
          </div>
        </div>

        {/* Start Game CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 w-full sm:w-auto">
          <button
            onClick={() => {
              sound.playBeep(520, 0.1, 'square');
              onStartGame();
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-pixel text-xs sm:text-sm border-3 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer pixel-btn-retro flex items-center justify-center gap-2 group font-bold"
          >
            <Play className="w-4 h-4 fill-slate-950 group-hover:scale-110 transition-transform" />
            <span>JOGAR TURNO (60s)</span>
          </button>

          <button
            onClick={() => {
              sound.playShopBuy();
              onOpenShop();
            }}
            className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs sm:text-sm border-3 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer pixel-btn-retro flex items-center justify-center gap-2 font-bold"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>LOJA DE ROUPAS</span>
          </button>
        </div>

        {/* Keyboard instructions & control hints */}
        <div className="mt-5 text-[10px] font-arcade text-slate-400 leading-relaxed bg-slate-900/60 px-4 py-2 border border-slate-800">
          <div className="text-amber-300 font-pixel text-[9px] mb-1">COMO JOGAR:</div>
          <div>← → / A D : Mover o personagem</div>
          <div>Colete moedas, notas e sacos de dinheiro antes do tempo acabar!</div>
          <div>Evite cascas de banana para não escorregar!</div>
        </div>
      </div>

      {/* Flat control hint line at bottom */}
      <div className="text-[10px] font-arcade text-slate-500 text-center z-10">
        [ENTER / ESPAÇO] Iniciar · [← / →] Mover · [P / ESC] Pausar
      </div>
    </div>
  );
};
