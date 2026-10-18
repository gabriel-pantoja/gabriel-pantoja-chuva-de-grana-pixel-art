import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FallingItem,
  FloatingParticle,
  SparkleParticle,
  ActivePowerup,
  ItemType,
} from '../types/game';
import {
  drawPixelCharacter,
  drawPixelItem,
  drawCityBackdrop,
} from '../utils/pixelSprites';
import { sound } from '../utils/audio';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';

interface GameCanvasProps {
  equippedIds: string[];
  onRoundComplete: (score: number, maxCombo: number, itemsCount: number) => void;
  onScoreUpdate: (currentScore: number, combo: number, activePowerups: ActivePowerup[]) => void;
  onTimeUpdate: (secondsLeft: number) => void;
  isPaused: boolean;
}

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 320;
const GROUND_Y = CANVAS_HEIGHT - 48;
const CHAR_SCALE = 2.4; // 16x24 * 2.4 = ~38x58px
const CHAR_WIDTH = 16 * CHAR_SCALE;
const CHAR_HEIGHT = 24 * CHAR_SCALE;
const ROUND_DURATION = 60.0; // 60 seconds

export const GameCanvas: React.FC<GameCanvasProps> = ({
  equippedIds,
  onRoundComplete,
  onScoreUpdate,
  onTimeUpdate,
  isPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Touch control states
  const [touchLeft, setTouchLeft] = useState(false);
  const [touchRight, setTouchRight] = useState(false);
  const [touchDash, setTouchDash] = useState(false);

  // References for live mutable game state to avoid re-renders inside 60fps loop
  const stateRef = useRef({
    player: {
      x: CANVAS_WIDTH / 2 - CHAR_WIDTH / 2,
      y: GROUND_Y - CHAR_HEIGHT,
      vx: 0,
      speed: 210,
      facing: 'right' as 'left' | 'right',
      animationState: 'idle' as 'idle' | 'walk1' | 'walk2' | 'catch' | 'slip',
      walkDistance: 0,
      catchTimer: 0,
      slipTimer: 0,
      isSlipped: false,
    },
    keys: {
      left: false,
      right: false,
      dash: false,
    },
    items: [] as FallingItem[],
    particles: [] as FloatingParticle[],
    sparkles: [] as SparkleParticle[],
    powerups: [] as ActivePowerup[],
    timeRemaining: ROUND_DURATION,
    roundScore: 0,
    combo: 1,
    maxCombo: 1,
    itemsCollectedCount: 0,
    nextItemId: 1,
    nextParticleId: 1,
    spawnTimer: 0,
    lastSecondTicked: 60,
    hasEnded: false,
  });

  // Handle Keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a'].includes(e.code) || e.key === 'ArrowLeft') {
        stateRef.current.keys.left = true;
      }
      if (['ArrowRight', 'KeyD', 'd'].includes(e.code) || e.key === 'ArrowRight') {
        stateRef.current.keys.right = true;
      }
      if (e.code === 'Space' || e.code === 'ShiftLeft') {
        stateRef.current.keys.dash = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA', 'a'].includes(e.code) || e.key === 'ArrowLeft') {
        stateRef.current.keys.left = false;
      }
      if (['ArrowRight', 'KeyD', 'd'].includes(e.code) || e.key === 'ArrowRight') {
        stateRef.current.keys.right = false;
      }
      if (e.code === 'Space' || e.code === 'ShiftLeft') {
        stateRef.current.keys.dash = false;
      }
    };

    const handleBlur = () => {
      stateRef.current.keys.left = false;
      stateRef.current.keys.right = false;
      stateRef.current.keys.dash = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Update touch buttons into stateRef
  useEffect(() => {
    stateRef.current.keys.left = touchLeft;
  }, [touchLeft]);
  useEffect(() => {
    stateRef.current.keys.right = touchRight;
  }, [touchRight]);
  useEffect(() => {
    stateRef.current.keys.dash = touchDash;
  }, [touchDash]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let animId: number;
    let lastTime = performance.now();

    // Spawn falling item helper
    const spawnItem = (secondsLeft: number) => {
      const state = stateRef.current;
      const progress = 1 - secondsLeft / ROUND_DURATION; // 0 to 1

      // Weight item types according to round progression
      const rand = Math.random();
      let type: ItemType = 'coin_bronze';
      let value = 1;
      let width = 20;
      let height = 20;
      let vy = 75 + Math.random() * 45;

      if (progress < 0.25) {
        // Initial 15s: Bronze, Silver coins, occasional $20 bill
        if (rand < 0.5) {
          type = 'coin_bronze';
          value = 1;
        } else if (rand < 0.8) {
          type = 'coin_silver';
          value = 5;
        } else {
          type = 'bill_single';
          value = 20;
          width = 28;
          height = 18;
          vy = 60 + Math.random() * 30;
        }
      } else if (progress < 0.6) {
        // 15-36s: Silver, Gold coins, $20, $50 stacks, occasional banana peel
        if (rand < 0.25) {
          type = 'coin_silver';
          value = 5;
        } else if (rand < 0.5) {
          type = 'coin_gold';
          value = 10;
        } else if (rand < 0.72) {
          type = 'bill_single';
          value = 20;
          width = 28;
          height = 18;
        } else if (rand < 0.85) {
          type = 'bill_stack';
          value = 50;
          width = 28;
          height = 20;
        } else if (rand < 0.94) {
          type = 'powerup_magnet';
          value = 0;
          width = 24;
          height = 24;
        } else {
          // Hazard banana peel
          type = 'hazard_banana';
          value = 0;
          width = 22;
          height = 20;
          vy = 85;
        }
      } else {
        // 36-60s Frenzy: Big bags, gold bars, rare diamonds, power-ups!
        if (rand < 0.2) {
          type = 'coin_gold';
          value = 10;
        } else if (rand < 0.4) {
          type = 'bill_stack';
          value = 50;
          width = 28;
          height = 20;
        } else if (rand < 0.6) {
          type = 'money_bag';
          value = 100;
          width = 26;
          height = 26;
          vy = 90 + Math.random() * 40;
        } else if (rand < 0.75) {
          type = 'gold_bar';
          value = 200;
          width = 26;
          height = 18;
          vy = 120 + Math.random() * 30; // heavy
        } else if (rand < 0.85) {
          type = 'diamond';
          value = 500;
          width = 24;
          height = 24;
          vy = 80;
        } else if (rand < 0.93) {
          // Power-up
          type = Math.random() < 0.5 ? 'powerup_2x' : 'powerup_magnet';
          value = 0;
          width = 24;
          height = 24;
        } else {
          type = 'hazard_banana';
          value = 0;
          width = 22;
          height = 20;
        }
      }

      const x = 20 + Math.random() * (CANVAS_WIDTH - 60);
      const isBill = type === 'bill_single' || type === 'bill_stack';

      state.items.push({
        id: state.nextItemId++,
        x,
        y: -30,
        vx: 0,
        vy,
        width,
        height,
        type,
        value,
        rotation: 0,
        vRot: (Math.random() - 0.5) * 2,
        frame: 0,
        swayTimer: Math.random() * Math.PI * 2,
        swaySpeed: isBill ? 3 + Math.random() * 2 : 0,
      });
    };

    const addFloatingText = (x: number, y: number, text: string, color: string, scale = 1) => {
      stateRef.current.particles.push({
        id: stateRef.current.nextParticleId++,
        x,
        y,
        text,
        color,
        life: 1.0,
        vy: -40,
        scale,
      });
    };

    const addSparkles = (x: number, y: number, color = '#fbbf24') => {
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 60;
        stateRef.current.sparkles.push({
          id: Math.random(),
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: 2 + Math.random() * 2,
          life: 0.6 + Math.random() * 0.4,
        });
      }
    };

    const gameLoop = (time: number) => {
      const rawDt = (time - lastTime) / 1000;
      lastTime = time;
      const dt = Math.min(rawDt, 0.05); // clamp frame delta time

      const state = stateRef.current;

      if (!isPaused && !state.hasEnded) {
        // 1. Countdown update
        state.timeRemaining -= dt;

        // Sound tick in last 10 seconds
        const currentIntSecond = Math.ceil(state.timeRemaining);
        if (currentIntSecond <= 10 && currentIntSecond > 0 && currentIntSecond !== state.lastSecondTicked) {
          sound.playTick(true);
          state.lastSecondTicked = currentIntSecond;
        } else if (currentIntSecond > 10 && currentIntSecond % 5 === 0 && currentIntSecond !== state.lastSecondTicked) {
          sound.playTick(false);
          state.lastSecondTicked = currentIntSecond;
        }

        // Notify parent HUD
        onTimeUpdate(Math.max(0, state.timeRemaining));

        // Check Round End
        if (state.timeRemaining <= 0) {
          state.hasEnded = true;
          sound.playRoundOver();
          onRoundComplete(state.roundScore, state.maxCombo, state.itemsCollectedCount);
          return;
        }

        // 2. Powerups decay
        state.powerups = state.powerups
          .map((p) => ({ ...p, duration: p.duration - dt }))
          .filter((p) => p.duration > 0);

        const hasMagnet = state.powerups.some((p) => p.type === 'magnet');
        const has2X = state.powerups.some((p) => p.type === 'multiplier');
        const hasSpeed = state.powerups.some((p) => p.type === 'speed');

        // 3. Player movement & animation
        const player = state.player;

        // Slip timer
        if (player.isSlipped) {
          player.slipTimer -= dt;
          player.animationState = 'slip';
          if (player.slipTimer <= 0) {
            player.isSlipped = false;
            player.animationState = 'idle';
          }
        } else {
          // Normal control
          const baseSpeed = hasSpeed ? 320 : player.speed;
          const currentSpeed = state.keys.dash ? baseSpeed * 1.4 : baseSpeed;

          let moveX = 0;
          if (state.keys.left) moveX -= 1;
          if (state.keys.right) moveX += 1;

          player.vx = moveX * currentSpeed;
          player.x += player.vx * dt;

          // Boundary clamp
          if (player.x < 10) player.x = 10;
          if (player.x > CANVAS_WIDTH - CHAR_WIDTH - 10) {
            player.x = CANVAS_WIDTH - CHAR_WIDTH - 10;
          }

          if (moveX !== 0) {
            player.facing = moveX > 0 ? 'right' : 'left';
            player.walkDistance += Math.abs(player.vx) * dt;
            player.animationState = Math.floor(player.walkDistance / 14) % 2 === 0 ? 'walk1' : 'walk2';
          } else if (player.catchTimer > 0) {
            player.catchTimer -= dt;
            player.animationState = 'catch';
          } else {
            player.animationState = 'idle';
          }
        }

        // 4. Spawning items
        state.spawnTimer += dt;
        // Faster spawns near the end of the 60s
        const spawnInterval = Math.max(0.28, 0.75 - (1 - state.timeRemaining / ROUND_DURATION) * 0.4);
        if (state.spawnTimer >= spawnInterval) {
          state.spawnTimer = 0;
          spawnItem(state.timeRemaining);
        }

        // 5. Update falling items
        const playerCenter = player.x + CHAR_WIDTH / 2;
        const playerTop = player.y;
        const playerBottom = player.y + CHAR_HEIGHT;

        for (let i = state.items.length - 1; i >= 0; i--) {
          const item = state.items[i];

          // Magnet suction logic
          if (hasMagnet && item.type !== 'hazard_banana') {
            const dx = playerCenter - (item.x + item.width / 2);
            const dy = playerTop - (item.y + item.height / 2);
            const dist = Math.hypot(dx, dy);
            if (dist < 160) {
              item.x += (dx / dist) * 220 * dt;
              item.y += (dy / dist) * 220 * dt;
            }
          }

          // Swaying paper bills
          if (item.swaySpeed && item.swayTimer !== undefined) {
            item.swayTimer += dt * item.swaySpeed;
            item.x += Math.sin(item.swayTimer) * 45 * dt;
          }

          item.y += item.vy * dt;
          item.rotation += item.vRot * dt;
          item.frame += dt * 8;

          // AABB collision with player
          const itemRight = item.x + item.width;
          const itemBottom = item.y + item.height;
          const charLeft = player.x + 4;
          const charRight = player.x + CHAR_WIDTH - 4;
          const charCatchTop = player.y - 6;

          const isColliding =
            itemRight > charLeft &&
            item.x < charRight &&
            itemBottom > charCatchTop &&
            item.y < playerBottom;

          if (isColliding && !player.isSlipped) {
            // Collision caught!
            if (item.type === 'hazard_banana') {
              // Slipped!
              player.isSlipped = true;
              player.slipTimer = 1.2;
              state.combo = 1; // reset combo
              sound.playSlip();
              addFloatingText(player.x, player.y - 15, 'ESCORREGOU! 🍌', '#ef4444', 1.1);
            } else if (item.type.startsWith('powerup_')) {
              // Picked up power-up!
              sound.playPowerup();
              if (item.type === 'powerup_magnet') {
                state.powerups.push({ type: 'magnet', duration: 7, maxDuration: 7 });
                addFloatingText(player.x, player.y - 20, 'ÍMÃ ATIVADO! 🧲', '#38bdf8', 1.2);
              } else if (item.type === 'powerup_2x') {
                state.powerups.push({ type: 'multiplier', duration: 7, maxDuration: 7 });
                addFloatingText(player.x, player.y - 20, 'DOBRO 2X! ⚡', '#facc15', 1.2);
              } else if (item.type === 'powerup_speed') {
                state.powerups.push({ type: 'speed', duration: 6, maxDuration: 6 });
                addFloatingText(player.x, player.y - 20, 'SUPER VELOZ! 👟', '#22c55e', 1.2);
              }
              addSparkles(item.x, item.y, '#38bdf8');
            } else {
              // Picked up money!
              player.catchTimer = 0.25;
              state.itemsCollectedCount++;

              let earned = item.value;
              if (has2X) earned *= 2;
              earned *= state.combo; // apply combo multiplier

              state.roundScore += earned;

              // Combo increment
              state.combo = Math.min(5, state.combo + 1);
              if (state.combo > state.maxCombo) {
                state.maxCombo = state.combo;
              }

              // Sound effects
              if (item.type.startsWith('coin_')) {
                sound.playCoin(item.value);
              } else if (item.type.startsWith('bill_')) {
                sound.playBill();
              } else if (item.type === 'money_bag') {
                sound.playMoneyBag();
                addSparkles(item.x, item.y, '#f59e0b');
              } else if (item.type === 'diamond' || item.type === 'gold_bar') {
                sound.playDiamond();
                addSparkles(item.x, item.y, '#38bdf8');
              }

              // Floating text
              const comboText = state.combo > 2 ? ` (x${state.combo})` : '';
              addFloatingText(
                item.x,
                item.y - 10,
                `+$${earned}${comboText}`,
                earned >= 100 ? '#fde047' : '#4ade80'
              );
            }

            // Remove caught item
            state.items.splice(i, 1);
            onScoreUpdate(state.roundScore, state.combo, state.powerups);
            continue;
          }

          // Fallen out of screen
          if (item.y > GROUND_Y + 12) {
            if (item.type !== 'hazard_banana' && !item.type.startsWith('powerup_')) {
              // Missed money drops combo
              if (state.combo > 1) {
                state.combo = 1;
                onScoreUpdate(state.roundScore, state.combo, state.powerups);
              }
            }
            state.items.splice(i, 1);
          }
        }

        // 6. Update floating text particles
        for (let pIdx = state.particles.length - 1; pIdx >= 0; pIdx--) {
          const pt = state.particles[pIdx];
          pt.y += pt.vy * dt;
          pt.life -= dt * 1.4;
          if (pt.life <= 0) {
            state.particles.splice(pIdx, 1);
          }
        }

        // 7. Update sparkles
        for (let sIdx = state.sparkles.length - 1; sIdx >= 0; sIdx--) {
          const sp = state.sparkles[sIdx];
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          sp.life -= dt * 2.0;
          if (sp.life <= 0) {
            state.sparkles.splice(sIdx, 1);
          }
        }
      }

      // --- RENDERING ---
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 1. Draw Parallax City Backdrop
      drawCityBackdrop(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, time / 1000);

      // 2. Draw Falling Items
      state.items.forEach((item) => {
        drawPixelItem(
          ctx,
          item.type,
          item.x,
          item.y,
          item.width,
          item.height,
          item.frame,
          item.rotation
        );
      });

      // 3. Draw Player
      const player = state.player;
      const bob = Math.sin((time / 1000) * 8) * (player.vx !== 0 ? 0.6 : 0.3);

      drawPixelCharacter({
        ctx,
        x: player.x,
        y: player.y,
        scale: CHAR_SCALE,
        facing: player.facing,
        animationState: player.animationState,
        equippedIds,
        bobOffset: bob,
      });

      // 4. Draw Magnet Glow or Aura if active
      if (state.powerups.some((p) => p.type === 'magnet')) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(player.x + CHAR_WIDTH / 2, player.y + CHAR_HEIGHT / 2, 70, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 5. Draw Sparkles
      state.sparkles.forEach((sp) => {
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = Math.max(0, sp.life);
        ctx.fillRect(sp.x, sp.y, sp.size, sp.size);
      });
      ctx.globalAlpha = 1.0;

      // 6. Draw Floating Score/Text Particles
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';

      state.particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.fillStyle = '#0f172a'; // shadow outline
        ctx.fillText(pt.text, pt.x + 1, pt.y + 1);
        ctx.fillStyle = pt.color;
        ctx.fillText(pt.text, pt.x, pt.y);
      });
      ctx.globalAlpha = 1.0;

      if (!state.hasEnded) {
        animId = requestAnimationFrame(gameLoop);
      }
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [equippedIds, isPaused, onRoundComplete, onScoreUpdate, onTimeUpdate]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Canvas Viewport with crisp pixel art scaling */}
      <div className="relative w-full max-w-4xl max-h-[82vh] aspect-[480/320] flex items-center justify-center bg-black border-4 border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain pixelated block"
        />

        {/* CRT Scanline Overlay for retro arcade feel */}
        <div className="absolute inset-0 crt-overlay pointer-events-none opacity-40" />
      </div>

      {/* On-screen Mobile / Touch Controls (hidden on desktop or pointer:fine, visible on touch) */}
      <div className="w-full max-w-md px-4 py-2 flex items-center justify-between gap-4 mt-1 select-none pointer-events-auto">
        {/* Left Arrow Button */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            setTouchLeft(true);
          }}
          onPointerUp={() => setTouchLeft(false)}
          onPointerLeave={() => setTouchLeft(false)}
          className={`flex-1 py-3.5 bg-slate-800 active:bg-slate-700 text-amber-300 border-2 border-slate-600 flex items-center justify-center pixel-btn-retro cursor-pointer ${
            touchLeft ? 'bg-amber-600 text-slate-950' : ''
          }`}
          aria-label="Mover para Esquerda"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Dash Speed Button */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            setTouchDash(true);
          }}
          onPointerUp={() => setTouchDash(false)}
          onPointerLeave={() => setTouchDash(false)}
          className={`px-5 py-3.5 bg-slate-900 active:bg-slate-800 text-yellow-400 border-2 border-yellow-500/70 flex items-center justify-center pixel-btn-retro cursor-pointer ${
            touchDash ? 'bg-yellow-500 text-slate-950' : ''
          }`}
          aria-label="Dash Turbo"
        >
          <Zap className="w-5 h-5 fill-yellow-400" />
        </button>

        {/* Right Arrow Button */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            setTouchRight(true);
          }}
          onPointerUp={() => setTouchRight(false)}
          onPointerLeave={() => setTouchRight(false)}
          className={`flex-1 py-3.5 bg-slate-800 active:bg-slate-700 text-amber-300 border-2 border-slate-600 flex items-center justify-center pixel-btn-retro cursor-pointer ${
            touchRight ? 'bg-amber-600 text-slate-950' : ''
          }`}
          aria-label="Mover para Direita"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
