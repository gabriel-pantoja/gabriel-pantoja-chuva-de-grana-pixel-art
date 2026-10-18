/**
 * Game Types & Interfaces for Chuva de Grana Pixel Arcade
 */

export type ClothingSlot = 'head' | 'torso' | 'legs' | 'feet' | 'accessory';

export type ClothingRarity = 'common' | 'rare' | 'ultra_rare';

export interface ClothingItem {
  id: string;
  name: string;
  slot: ClothingSlot;
  rarity: ClothingRarity;
  price: number;
  description: string;
  colorTheme: string;
  badgeText: string;
}

export type ItemType =
  | 'coin_bronze'
  | 'coin_silver'
  | 'coin_gold'
  | 'bill_single'
  | 'bill_stack'
  | 'money_bag'
  | 'gold_bar'
  | 'diamond'
  | 'powerup_magnet'
  | 'powerup_2x'
  | 'powerup_speed'
  | 'hazard_banana';

export interface FallingItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  type: ItemType;
  value: number; // in dollars
  rotation: number;
  vRot: number;
  frame: number;
  swayTimer?: number;
  swaySpeed?: number;
}

export interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number; // 1.0 down to 0
  vy: number;
  scale?: number;
}

export interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

export type GameScreen = 'title' | 'playing' | 'paused' | 'round_end' | 'shop';

export interface PlayerStats {
  totalRoundsPlayed: number;
  highestRoundScore: number;
  lifetimeEarnings: number;
  totalItemsBought: number;
  maxComboStreak: number;
}

export interface ActivePowerup {
  type: 'magnet' | 'multiplier' | 'speed';
  duration: number; // remaining seconds
  maxDuration: number;
}
