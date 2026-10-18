import React, { useEffect, useRef } from 'react';
import { drawPixelCharacter } from '../utils/pixelSprites';

interface PixelCharacterPreviewProps {
  equippedIds: string[];
  scale?: number;
  width?: number;
  height?: number;
  interactive?: boolean;
  animate?: boolean;
  facing?: 'left' | 'right';
  className?: string;
  pose?: 'idle' | 'walk1' | 'walk2' | 'catch' | 'slip';
}

export const PixelCharacterPreview: React.FC<PixelCharacterPreviewProps> = ({
  equippedIds,
  scale = 6,
  width = 160,
  height = 190,
  animate = true,
  facing = 'right',
  className = '',
  pose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let animationFrameId: number;
    let startTime = performance.now();

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Draw subtle retro pedestal / fitting room spotlight
      const pedestalY = height - 24;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.ellipse(width / 2, pedestalY + 8, width * 0.4, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pedestal pixel border
      ctx.fillStyle = '#334155';
      ctx.fillRect(width / 2 - 40, pedestalY + 4, 80, 4);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(width / 2 - 36, pedestalY + 8, 72, 6);

      // Character positioning
      // Character is 16px wide x 24px tall
      const charWidthPx = 16 * scale;
      const charHeightPx = 24 * scale;
      const charX = (width - charWidthPx) / 2;
      const charY = pedestalY - charHeightPx;

      // Breathing bob offset
      const bobOffset = animate ? Math.sin(elapsed * 3.5) * 0.4 : 0;
      const blink = animate ? Math.sin(elapsed * 1.5) > 0.94 : false;

      // Animation state
      let currentState: 'idle' | 'walk1' | 'walk2' | 'catch' | 'slip' = 'idle';
      if (pose) {
        currentState = pose;
      } else if (animate) {
        // Subtle idle pose with slight foot tap or breath
        const cycle = (elapsed * 2) % 4;
        if (cycle > 3.7) {
          currentState = 'catch';
        }
      }

      drawPixelCharacter({
        ctx,
        x: charX,
        y: charY,
        scale,
        facing,
        animationState: currentState,
        equippedIds,
        bobOffset,
        blink,
      });

      if (animate) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (animate) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      render(startTime);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [equippedIds, scale, width, height, animate, facing, pose]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="pixelated block drop-shadow-lg"
      />
    </div>
  );
};
