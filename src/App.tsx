/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { ShopModal } from './components/ShopModal';
import { TitleScreen } from './components/TitleScreen';
import { RoundEndModal } from './components/RoundEndModal';
import { PauseModal } from './components/PauseModal';
import { ClothingItem, ActivePowerup, GameScreen } from './types/game';
import { CLOTHING_ITEMS } from './data/clothingItems';
import { sound } from './utils/audio';

const STORAGE_KEYS = {
  BANK: 'pixel_grana_bank_v2',
  OWNED: 'pixel_grana_owned_v2',
  EQUIPPED: 'pixel_grana_equipped_v2',
  HIGHSCORE: 'pixel_grana_highscore_v2',
};

export default function App() {
  // Screen state
  const [screen, setScreen] = useState<GameScreen>('title');

  // Bank & Inventory state
  const [bankBalance, setBankBalance] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BANK);
    return saved !== null ? parseInt(saved, 10) : 30; // $30 starter bonus
  });

  const [ownedItemIds, setOwnedItemIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OWNED);
    return saved ? JSON.parse(saved) : [];
  });

  const [equippedItemIds, setEquippedItemIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EQUIPPED);
    return saved ? JSON.parse(saved) : [];
  });

  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HIGHSCORE);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Active round state
  const [roundKey, setRoundKey] = useState<number>(1);
  const [roundScore, setRoundScore] = useState<number>(0);
  const [lastRoundEarnings, setLastRoundEarnings] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(60.0);
  const [combo, setCombo] = useState<number>(1);
  const [maxCombo, setMaxCombo] = useState<number>(1);
  const [itemsCollectedCount, setItemsCollectedCount] = useState<number>(0);
  const [activePowerups, setActivePowerups] = useState<ActivePowerup[]>([]);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted());

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANK, bankBalance.toString());
  }, [bankBalance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OWNED, JSON.stringify(ownedItemIds));
  }, [ownedItemIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EQUIPPED, JSON.stringify(equippedItemIds));
  }, [equippedItemIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HIGHSCORE, highScore.toString());
  }, [highScore]);

  // Start new 60s round
  const handleStartRound = useCallback(() => {
    setRoundScore(0);
    setTimeRemaining(60.0);
    setCombo(1);
    setMaxCombo(1);
    setItemsCollectedCount(0);
    setActivePowerups([]);
    setIsNewRecord(false);
    setRoundKey((prev) => prev + 1);
    setScreen('playing');
  }, []);

  // Round completed (60s expired)
  const handleRoundComplete = useCallback(
    (score: number, roundMaxCombo: number, itemsCount: number) => {
      setLastRoundEarnings(score);
      setMaxCombo(roundMaxCombo);
      setItemsCollectedCount(itemsCount);

      // Add to bank
      setBankBalance((prev) => prev + score);

      // Check high score
      let recordBroken = false;
      if (score > highScore) {
        setHighScore(score);
        recordBroken = true;
      }
      setIsNewRecord(recordBroken);

      // Open Round End celebration screen (leading into Shop)
      setScreen('round_end');
    },
    [highScore]
  );

  // Live HUD updates from GameCanvas
  const handleScoreUpdate = useCallback(
    (currentScore: number, currentCombo: number, powerups: ActivePowerup[]) => {
      setRoundScore(currentScore);
      setCombo(currentCombo);
      setActivePowerups(powerups);
    },
    []
  );

  const handleTimeUpdate = useCallback((secondsLeft: number) => {
    setTimeRemaining(secondsLeft);
  }, []);

  // Shop actions
  const handleBuyItem = useCallback(
    (item: ClothingItem) => {
      if (bankBalance < item.price) return;

      setBankBalance((prev) => prev - item.price);
      setOwnedItemIds((prev) => [...prev, item.id]);

      // Auto-equip item in its slot
      setEquippedItemIds((prev) => {
        // Remove any item that shares the same slot
        const filtered = prev.filter((id) => {
          const existing = CLOTHING_ITEMS.find((c) => c.id === id);
          return existing?.slot !== item.slot;
        });
        return [...filtered, item.id];
      });

      sound.playShopBuy();
    },
    [bankBalance]
  );

  const handleEquipItem = useCallback((item: ClothingItem) => {
    setEquippedItemIds((prev) => {
      // Remove any item that occupies the same slot
      const filtered = prev.filter((id) => {
        const existing = CLOTHING_ITEMS.find((c) => c.id === id);
        return existing?.slot !== item.slot;
      });
      return [...filtered, item.id];
    });
    sound.playEquip();
  }, []);

  const handleUnequipItem = useCallback((item: ClothingItem) => {
    setEquippedItemIds((prev) => prev.filter((id) => id !== item.id));
    sound.playEquip();
  }, []);

  const handleResetAllClothes = useCallback(() => {
    setEquippedItemIds([]);
    sound.playEquip();
  }, []);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Escape or P pauses when playing
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (screen === 'playing') {
          setScreen('paused');
        } else if (screen === 'paused') {
          setScreen('playing');
        }
      }

      // Space / Enter shortcuts on Shop or Title
      if (e.code === 'Space' || e.code === 'Enter') {
        if (screen === 'title') {
          handleStartRound();
        } else if (screen === 'shop') {
          // If in shop, start next round
          sound.playBeep(520, 0.1, 'square');
          handleStartRound();
        } else if (screen === 'round_end') {
          // Go to shop
          sound.playShopBuy();
          setScreen('shop');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [screen, handleStartRound]);

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white flex flex-col items-center justify-center font-arcade select-none">
      {/* Title Screen */}
      {screen === 'title' && (
        <TitleScreen
          onStartGame={handleStartRound}
          onOpenShop={() => setScreen('shop')}
          bankBalance={bankBalance}
          equippedIds={equippedItemIds}
          highScore={highScore}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Main Playing Canvas */}
      {(screen === 'playing' || screen === 'paused') && (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <GameCanvas
            key={roundKey}
            equippedIds={equippedItemIds}
            onRoundComplete={handleRoundComplete}
            onScoreUpdate={handleScoreUpdate}
            onTimeUpdate={handleTimeUpdate}
            isPaused={screen === 'paused'}
          />

          <HUD
            timeRemaining={timeRemaining}
            roundScore={roundScore}
            bankBalance={bankBalance}
            combo={combo}
            activePowerups={activePowerups}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={() => setScreen('paused')}
            onOpenShop={() => setScreen('shop')}
          />
        </div>
      )}

      {/* Pause Menu Modal */}
      {screen === 'paused' && (
        <PauseModal
          onResume={() => setScreen('playing')}
          onRestart={handleStartRound}
          onOpenShop={() => setScreen('shop')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Round End Modal (Celebration before shop) */}
      {screen === 'round_end' && (
        <RoundEndModal
          roundScore={lastRoundEarnings}
          bankBalance={bankBalance}
          maxCombo={maxCombo}
          itemsCollectedCount={itemsCollectedCount}
          isNewRecord={isNewRecord}
          equippedIds={equippedItemIds}
          onGoToShop={() => setScreen('shop')}
          onPlayAgain={handleStartRound}
        />
      )}

      {/* Pixel Art Clothing Store (Loja de Roupas) */}
      {screen === 'shop' && (
        <ShopModal
          bankBalance={bankBalance}
          lastRoundEarnings={lastRoundEarnings}
          ownedItemIds={ownedItemIds}
          equippedItemIds={equippedItemIds}
          onBuyItem={handleBuyItem}
          onEquipItem={handleEquipItem}
          onUnequipItem={handleUnequipItem}
          onStartNextRound={handleStartRound}
          onResetAllClothes={handleResetAllClothes}
        />
      )}
    </div>
  );
}
