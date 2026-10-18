import React, { useState } from 'react';
import { CLOTHING_ITEMS } from '../data/clothingItems';
import { ClothingItem, ClothingSlot } from '../types/game';
import { PixelCharacterPreview } from './PixelCharacterPreview';
import { sound } from '../utils/audio';
import {
  Sparkles,
  ShoppingBag,
  Check,
  Play,
  RotateCcw,
  Shirt,
  Glasses,
  Footprints,
  Watch,
  Coins,
  Crown,
} from 'lucide-react';

interface ShopModalProps {
  bankBalance: number;
  lastRoundEarnings: number;
  ownedItemIds: string[];
  equippedItemIds: string[];
  onBuyItem: (item: ClothingItem) => void;
  onEquipItem: (item: ClothingItem) => void;
  onUnequipItem: (item: ClothingItem) => void;
  onStartNextRound: () => void;
  onResetAllClothes?: () => void;
}

type CategoryFilter = 'all' | ClothingSlot;

export const ShopModal: React.FC<ShopModalProps> = ({
  bankBalance,
  lastRoundEarnings,
  ownedItemIds,
  equippedItemIds,
  onBuyItem,
  onEquipItem,
  onUnequipItem,
  onStartNextRound,
  onResetAllClothes,
}) => {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [previewFacing, setPreviewFacing] = useState<'left' | 'right'>('right');
  const [activePreviewPose, setActivePreviewPose] = useState<'idle' | 'catch' | 'walk1'>('idle');

  const filteredItems = CLOTHING_ITEMS.filter((item) => {
    if (filter === 'all') return true;
    return item.slot === filter;
  });

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'ultra_rare':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/60',
          dot: 'bg-amber-400 animate-pulse',
          label: '★ LUXO',
        };
      case 'rare':
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/60',
          dot: 'bg-purple-400',
          label: '◆ RARO',
        };
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60',
          dot: 'bg-emerald-400',
          label: '● COMUM',
        };
    }
  };

  const getSlotIcon = (slot: ClothingSlot) => {
    switch (slot) {
      case 'head':
        return <Glasses className="w-3.5 h-3.5" />;
      case 'torso':
        return <Shirt className="w-3.5 h-3.5" />;
      case 'legs':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'feet':
        return <Footprints className="w-3.5 h-3.5" />;
      case 'accessory':
        return <Watch className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xs select-none overflow-y-auto">
      {/* Arcade cabinet outer container */}
      <div className="relative w-full max-w-5xl bg-slate-900 border-4 border-amber-500 rounded-none shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 px-4 py-3 border-b-4 border-amber-900 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-950 border-2 border-amber-300 flex items-center justify-center shadow-inner">
              <Crown className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="font-pixel text-sm sm:text-base tracking-wider text-amber-100 drop-shadow-[0_2px_0_#78350f]">
                BOUTIQUE RETRÔ PIXEL
              </h2>
              <p className="text-[10px] text-amber-200/90 font-arcade">
                Personalize o visual do seu boneco para as próximas rodadas
              </p>
            </div>
          </div>

          {/* Money Display */}
          <div className="flex items-center gap-3">
            {lastRoundEarnings > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-300 text-xs font-pixel">
                <span>+ ${lastRoundEarnings.toLocaleString()}</span>
                <span className="text-[9px] text-emerald-400 font-arcade">(no turno)</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border-2 border-amber-400 shadow-inner">
              <Coins className="w-4 h-4 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[8px] text-amber-400 font-arcade uppercase">Saldo Disponível</span>
                <span className="font-pixel text-sm sm:text-base text-yellow-300">
                  ${bankBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body: Split between Fitting Room (Left) & Wardrobe Items (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden min-h-0 bg-slate-950">
          
          {/* LEFT: Fitting Room Mirror & Avatar Stage */}
          <div className="md:col-span-4 lg:col-span-4 bg-slate-900/90 border-b-4 md:border-b-0 md:border-r-4 border-slate-800 p-4 flex flex-col items-center justify-between">
            <div className="w-full text-center">
              <div className="inline-block px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-arcade uppercase tracking-wider mb-2">
                Provador Virtual
              </div>
              <h3 className="font-pixel text-xs text-amber-400">VISUAL ATUAL</h3>
            </div>

            {/* Mirror Frame */}
            <div className="relative my-2 p-3 bg-gradient-to-b from-slate-950 to-slate-900 border-4 border-amber-600/70 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] w-full max-w-[220px] flex flex-col items-center">
              <div className="absolute top-1 left-2 text-[8px] font-pixel text-amber-500/50">8-BIT</div>
              
              <PixelCharacterPreview
                equippedIds={equippedItemIds}
                scale={6}
                width={160}
                height={200}
                facing={previewFacing}
                pose={activePreviewPose}
                animate={true}
              />

              {/* Pose & Turn toggles */}
              <div className="flex items-center gap-1.5 mt-2">
                <button
                  onClick={() => setPreviewFacing(previewFacing === 'left' ? 'right' : 'left')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[9px] font-arcade text-slate-300 border border-slate-600 cursor-pointer"
                  title="Virar personagem"
                >
                  ↻ Virar
                </button>
                <button
                  onClick={() =>
                    setActivePreviewPose(
                      activePreviewPose === 'idle'
                        ? 'catch'
                        : activePreviewPose === 'catch'
                        ? 'walk1'
                        : 'idle'
                    )
                  }
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[9px] font-arcade text-amber-300 border border-slate-600 cursor-pointer"
                  title="Mudar pose"
                >
                  Pose: {activePreviewPose.toUpperCase()}
                </button>
              </div>
            </div>

            {/* Currently Equipped Summary */}
            <div className="w-full bg-slate-950/70 border border-slate-800 p-2.5 text-xs">
              <div className="text-[9px] font-pixel text-slate-400 mb-1 flex items-center justify-between">
                <span>PEÇAS EQUIPADAS ({equippedItemIds.length})</span>
                {equippedItemIds.length > 0 && onResetAllClothes && (
                  <button
                    onClick={onResetAllClothes}
                    className="text-red-400 hover:text-red-300 text-[8px] underline cursor-pointer"
                  >
                    Despir tudo
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {equippedItemIds.length === 0 ? (
                  <span className="text-[10px] font-arcade text-slate-500 italic">
                    Vestindo apenas cueca básica!
                  </span>
                ) : (
                  equippedItemIds.map((id) => {
                    const item = CLOTHING_ITEMS.find((c) => c.id === id);
                    if (!item) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-800 text-[9px] text-amber-200 border border-slate-700"
                      >
                        {item.name}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Clothing Catalog & Filters */}
          <div className="md:col-span-8 lg:col-span-8 flex flex-col min-h-0 bg-slate-950 p-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'head', label: 'Cabeça' },
                { id: 'torso', label: 'Tronco' },
                { id: 'legs', label: 'Pernas' },
                { id: 'feet', label: 'Calçados' },
                { id: 'accessory', label: 'Acessórios' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFilter(tab.id as CategoryFilter);
                    sound.playTick();
                  }}
                  className={`px-3 py-1.5 text-[10px] font-arcade whitespace-nowrap border-2 transition-colors cursor-pointer ${
                    filter === tab.id
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto py-3 pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredItems.map((item) => {
                const isOwned = ownedItemIds.includes(item.id);
                const isEquipped = equippedItemIds.includes(item.id);
                const canAfford = bankBalance >= item.price;
                const rarityStyle = getRarityBadge(item.rarity);

                return (
                  <div
                    key={item.id}
                    className={`relative p-3 border-2 flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'bg-amber-950/20 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                        : isOwned
                        ? 'bg-slate-900 border-slate-700'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-750'
                    }`}
                  >
                    {/* Top Row: Rarity badge & Slot */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-pixel border ${rarityStyle.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${rarityStyle.dot}`} />
                        <span>{rarityStyle.label}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-arcade text-slate-400 uppercase">
                        {getSlotIcon(item.slot)}
                        <span>{item.slot}</span>
                      </div>
                    </div>

                    {/* Middle: Name & Description */}
                    <div className="my-1">
                      <h4 className="font-pixel text-xs text-slate-100 flex items-center justify-between">
                        <span>{item.name}</span>
                        {isEquipped && (
                          <span className="text-[8px] px-1 bg-amber-500 text-slate-950 font-arcade font-bold">
                            EQUIPADO
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-arcade mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom: Price and Action Button */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div>
                        {isOwned ? (
                          <span className="text-[9px] font-pixel text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> ADQUIRIDO
                          </span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 font-arcade">PREÇO</span>
                            <span
                              className={`font-pixel text-xs ${
                                canAfford ? 'text-amber-400' : 'text-slate-500'
                              }`}
                            >
                              ${item.price}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div>
                        {isEquipped ? (
                          <button
                            onClick={() => onUnequipItem(item)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-[9px] font-pixel cursor-pointer pixel-btn-retro"
                          >
                            DESEQUIPAR
                          </button>
                        ) : isOwned ? (
                          <button
                            onClick={() => onEquipItem(item)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white border-2 border-blue-400 text-[9px] font-pixel cursor-pointer pixel-btn-retro"
                          >
                            EQUIPAR
                          </button>
                        ) : (
                          <button
                            onClick={() => onBuyItem(item)}
                            disabled={!canAfford}
                            className={`px-3 py-1.5 text-[9px] font-pixel cursor-pointer pixel-btn-retro flex items-center gap-1.5 ${
                              canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-2 border-amber-300 font-bold'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <ShoppingBag className="w-3 h-3" />
                            COMPRAR
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Footer Action Bar: "Iniciar Próximo Turno" */}
            <div className="mt-3 pt-3 border-t-2 border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[10px] font-arcade text-slate-400">
                Pressione <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-amber-300">ESPAÇO</kbd> para iniciar
              </div>

              <button
                onClick={onStartNextRound}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-pixel text-xs sm:text-sm border-3 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer pixel-btn-retro flex items-center justify-center gap-2 group"
              >
                <Play className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
                <span>INICIAR PRÓXIMO TURNO (60s)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
