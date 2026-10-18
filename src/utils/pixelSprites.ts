/**
 * Pixel Art Sprite Rendering Engine
 * Direct pixel-grid rasterizer for character, clothing layers, and falling items.
 */

export interface DrawCharacterOptions {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  scale: number;
  facing?: 'left' | 'right';
  animationState?: 'idle' | 'walk1' | 'walk2' | 'catch' | 'slip';
  equippedIds: string[];
  bobOffset?: number;
  blink?: boolean;
}

// Colors for the pixel palette
const PALETTE = {
  skin: '#fcd34d',
  skinShadow: '#f59e0b',
  hair: '#78350f',
  hairDark: '#451a03',
  eyes: '#1e293b',
  mouth: '#b91c1c',
  underwearBase: '#e2e8f0',
  underwearStripe: '#3b82f6',
  underwearBorder: '#94a3b8',
  white: '#ffffff',
  black: '#0f172a',
};

/**
 * Draws a pixel rectangle at grid coordinates
 */
function pRect(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  w: number,
  h: number,
  color: string,
  baseX: number,
  baseY: number,
  scale: number,
  flipX: boolean,
  charWidth = 16
) {
  ctx.fillStyle = color;
  const drawX = flipX ? baseX + (charWidth - 1 - px - (w - 1)) * scale : baseX + px * scale;
  const drawY = baseY + py * scale;
  ctx.fillRect(Math.floor(drawX), Math.floor(drawY), Math.floor(w * scale), Math.floor(h * scale));
}

/**
 * Renders the full layered pixel character
 */
export function drawPixelCharacter(options: DrawCharacterOptions) {
  const {
    ctx,
    x,
    y,
    scale,
    facing = 'right',
    animationState = 'idle',
    equippedIds,
    bobOffset = 0,
    blink = false,
  } = options;

  const flipX = facing === 'left';
  const charWidth = 16;
  const by = y + bobOffset * scale; // apply breathing or movement bob
  const bx = x;

  const draw = (px: number, py: number, w: number, h: number, col: string) => {
    pRect(ctx, px, py, w, h, col, bx, by, scale, flipX, charWidth);
  };

  // Check equipped items
  const hasCap = equippedIds.includes('cap_retro');
  const hasDealWithIt = equippedIds.includes('glasses_deal_with_it');
  const hasTopHat = equippedIds.includes('top_hat');
  const hasCrown = equippedIds.includes('royal_crown');

  const hasTShirt = equippedIds.includes('tshirt_basic');
  const hasLeatherJacket = equippedIds.includes('leather_jacket');
  const hasBlazer = equippedIds.includes('blazer_elegant');
  const hasLuxurySuit = equippedIds.includes('luxury_suit');

  const hasJeans = equippedIds.includes('jeans_classic');
  const hasLuxurySlacks = equippedIds.includes('slacks_luxury');

  const hasSneakers = equippedIds.includes('sneakers_basic');
  const hasDressShoes = equippedIds.includes('dress_shoes');

  const hasGoldWatch = equippedIds.includes('gold_watch');
  const hasGoldChain = equippedIds.includes('gold_chain');

  // --- 1. HEAD & HAIR (Base) ---
  // Hair tuft
  if (!hasTopHat && !hasCap && !hasCrown) {
    draw(5, 1, 6, 2, PALETTE.hair);
    draw(4, 2, 8, 2, PALETTE.hair);
    draw(4, 3, 2, 2, PALETTE.hairDark);
  }

  // Head base (Skin)
  draw(5, 3, 6, 5, PALETTE.skin);
  draw(4, 4, 1, 3, PALETTE.skinShadow); // Left cheek/ear
  draw(11, 4, 1, 3, PALETTE.skin); // Right cheek/ear

  // Eyes
  if (animationState === 'slip') {
    // Dizzy X eyes
    draw(6, 4, 1, 1, PALETTE.mouth);
    draw(7, 5, 1, 1, PALETTE.mouth);
    draw(9, 4, 1, 1, PALETTE.mouth);
    draw(10, 5, 1, 1, PALETTE.mouth);
  } else if (blink) {
    // Closed blink
    draw(6, 5, 2, 1, PALETTE.eyes);
    draw(9, 5, 2, 1, PALETTE.eyes);
  } else if (animationState === 'catch') {
    // Happy arc eyes ^ ^
    draw(6, 4, 2, 1, PALETTE.eyes);
    draw(5, 5, 1, 1, PALETTE.eyes);
    draw(9, 4, 2, 1, PALETTE.eyes);
    draw(11, 5, 1, 1, PALETTE.eyes);
  } else {
    // Normal retro eyes with shine
    draw(6, 4, 2, 2, PALETTE.eyes);
    draw(6, 4, 1, 1, PALETTE.white);
    draw(9, 4, 2, 2, PALETTE.eyes);
    draw(9, 4, 1, 1, PALETTE.white);
  }

  // Smile / Mouth
  if (animationState === 'catch') {
    draw(7, 7, 3, 1, PALETTE.mouth); // Big open smile
  } else if (animationState === 'slip') {
    draw(7, 7, 3, 1, '#1e1b4b'); // Ouch mouth
  } else {
    draw(8, 7, 2, 1, PALETTE.mouth); // Normal smile
  }

  // Neck
  draw(7, 8, 2, 1, PALETTE.skinShadow);

  // --- 2. TORSO BASE (Bare Chest) ---
  draw(5, 9, 6, 5, PALETTE.skin);
  draw(5, 9, 1, 5, PALETTE.skinShadow); // torso shading

  // --- 3. CLOTHING: TORSO OVERLAY ---
  if (hasLuxurySuit) {
    // Charcoal double-breasted luxury suit with bow tie & gold buttons
    draw(4, 9, 8, 6, '#0f172a'); // Outer jacket
    draw(7, 9, 2, 3, '#ffffff'); // White dress shirt V-neck
    draw(7, 10, 2, 1, '#dc2626'); // Red satin bow tie
    // Double-breasted gold buttons
    draw(6, 12, 1, 1, '#f59e0b');
    draw(9, 12, 1, 1, '#f59e0b');
    draw(6, 14, 1, 1, '#f59e0b');
    draw(9, 14, 1, 1, '#f59e0b');
    // White pocket square
    draw(9, 11, 2, 1, '#f8fafc');
  } else if (hasBlazer) {
    // Navy blue blazer with golden buttons & white inner shirt
    draw(4, 9, 8, 6, '#1e3a8a'); // Navy blazer
    draw(7, 9, 2, 4, '#ffffff'); // White shirt inside
    draw(7, 11, 1, 2, '#3b82f6'); // Blue tie
    draw(8, 13, 1, 1, '#fbbf24'); // Gold button
  } else if (hasLeatherJacket) {
    // Cool biker leather jacket with silver zipper and collar
    draw(4, 9, 8, 6, '#27272a');
    draw(7, 9, 2, 2, '#71717a'); // Open collar
    draw(7, 11, 1, 4, '#e4e4e7'); // Silver zipper
    draw(4, 9, 2, 2, '#3f3f46'); // Lapels
    draw(10, 9, 2, 2, '#3f3f46');
  } else if (hasTShirt) {
    // Casual white/cyan t-shirt
    draw(4, 9, 8, 5, '#f8fafc');
    draw(6, 9, 4, 1, '#3b82f6'); // Blue collar trim
    draw(5, 13, 6, 1, '#cbd5e1'); // Bottom hem
  }

  // Gold Chain Accessory (layered on chest)
  if (hasGoldChain) {
    draw(6, 9, 1, 2, '#fbbf24');
    draw(9, 9, 1, 2, '#fbbf24');
    draw(7, 11, 2, 1, '#fbbf24');
    draw(7, 12, 2, 2, '#f59e0b'); // Dollar pendant
    draw(8, 12, 1, 1, '#ffffff'); // Glint
  }

  // --- 4. UNDERWEAR / BOXER SHORTS (Base) ---
  // The iconic default underwear!
  draw(5, 14, 6, 2, PALETTE.underwearBase);
  draw(5, 14, 6, 1, PALETTE.underwearStripe); // Blue waistband
  draw(7, 15, 2, 1, PALETTE.underwearBorder);

  // --- 5. CLOTHING: LEGS OVERLAY ---
  if (hasLuxurySlacks) {
    draw(5, 14, 6, 7, '#0f172a'); // Luxury dark slacks
    draw(7, 15, 2, 1, '#d97706'); // Gold belt buckle
    draw(7, 17, 2, 4, '#020617'); // Inseam crease
  } else if (hasJeans) {
    draw(5, 14, 6, 7, '#2563eb'); // Denim blue
    draw(5, 14, 6, 1, '#78350f'); // Brown leather belt
    draw(7, 14, 2, 1, '#f59e0b'); // Brass buckle
    draw(7, 17, 2, 4, '#1d4ed8'); // Inseam crease
    draw(5, 16, 2, 1, '#93c5fd'); // Pocket highlight
  }

  // --- 6. LEGS & WALKING ANIMATION ---
  // Leg positions depending on walk frame
  let leftLegY = 16;
  let rightLegY = 16;
  let leftLegX = 5;
  let rightLegX = 9;

  if (animationState === 'walk1') {
    leftLegY = 15;
    leftLegX = 4;
    rightLegX = 9;
  } else if (animationState === 'walk2') {
    rightLegY = 15;
    leftLegX = 6;
    rightLegX = 10;
  } else if (animationState === 'slip') {
    leftLegX = 3;
    rightLegX = 11;
  }

  // Bare skin legs if no pants
  if (!hasJeans && !hasLuxurySlacks) {
    draw(leftLegX, leftLegY, 2, 5, PALETTE.skin);
    draw(rightLegX, rightLegY, 2, 5, PALETTE.skin);
  }

  // --- 7. FEET / SHOES ---
  const footLeftY = leftLegY + 5;
  const footRightY = rightLegY + 5;

  if (hasDressShoes) {
    // Shiny black Oxford dress shoes
    draw(leftLegX - 1, footLeftY, 3, 2, '#09090b');
    draw(leftLegX, footLeftY, 1, 1, '#ffffff'); // Gloss shine
    draw(rightLegX, footRightY, 3, 2, '#09090b');
    draw(rightLegX + 1, footRightY, 1, 1, '#ffffff'); // Gloss shine
  } else if (hasSneakers) {
    // Red retro sneakers with white soles
    draw(leftLegX - 1, footLeftY, 3, 1, '#dc2626');
    draw(leftLegX - 1, footLeftY + 1, 3, 1, '#ffffff'); // White sole
    draw(rightLegX, footRightY, 3, 1, '#dc2626');
    draw(rightLegX, footRightY + 1, 3, 1, '#ffffff');
  } else {
    // Bare feet with cute pixel toes
    draw(leftLegX - 1, footLeftY, 3, 2, PALETTE.skin);
    draw(rightLegX, footRightY, 3, 2, PALETTE.skin);
  }

  // --- 8. ARMS & HANDS ---
  if (animationState === 'catch') {
    // Arms raised up to catch money!
    // Left arm
    draw(3, 7, 2, 4, PALETTE.skin);
    draw(2, 5, 2, 3, PALETTE.skin);
    // Right arm
    draw(11, 7, 2, 4, PALETTE.skin);
    draw(12, 5, 2, 3, PALETTE.skin);

    // Sleeves if dressed
    if (hasLuxurySuit) {
      draw(3, 8, 2, 3, '#0f172a');
      draw(11, 8, 2, 3, '#0f172a');
    } else if (hasBlazer) {
      draw(3, 8, 2, 3, '#1e3a8a');
      draw(11, 8, 2, 3, '#1e3a8a');
    } else if (hasLeatherJacket) {
      draw(3, 8, 2, 3, '#27272a');
      draw(11, 8, 2, 3, '#27272a');
    } else if (hasTShirt) {
      draw(3, 8, 2, 2, '#f8fafc');
      draw(11, 8, 2, 2, '#f8fafc');
    }
  } else {
    // Normal arms down with walking swing
    const armSwing = animationState === 'walk1' ? -1 : animationState === 'walk2' ? 1 : 0;
    // Left arm
    draw(3, 9 + armSwing, 2, 5, PALETTE.skin);
    // Right arm
    draw(11, 9 - armSwing, 2, 5, PALETTE.skin);

    // Sleeves if dressed
    if (hasLuxurySuit) {
      draw(3, 9 + armSwing, 2, 4, '#0f172a');
      draw(11, 9 - armSwing, 2, 4, '#0f172a');
      // White shirt cuffs
      draw(3, 13 + armSwing, 2, 1, '#ffffff');
      draw(11, 13 - armSwing, 2, 1, '#ffffff');
    } else if (hasBlazer) {
      draw(3, 9 + armSwing, 2, 4, '#1e3a8a');
      draw(11, 9 - armSwing, 2, 4, '#1e3a8a');
    } else if (hasLeatherJacket) {
      draw(3, 9 + armSwing, 2, 4, '#27272a');
      draw(11, 9 - armSwing, 2, 4, '#27272a');
    } else if (hasTShirt) {
      draw(3, 9 + armSwing, 2, 2, '#f8fafc');
      draw(11, 9 - armSwing, 2, 2, '#f8fafc');
    }

    // Gold Watch on wrist
    if (hasGoldWatch) {
      draw(11, 13 - armSwing, 2, 1, '#fbbf24');
      draw(12, 13 - armSwing, 1, 1, '#ffffff'); // Sparkle
    }
  }

  // --- 9. HEADWEAR OVERLAYS ---
  if (hasCrown) {
    // Golden royal crown with gems
    draw(4, 0, 8, 3, '#f59e0b');
    // Spikes
    draw(4, -1, 2, 1, '#fbbf24');
    draw(7, -2, 2, 2, '#fbbf24');
    draw(10, -1, 2, 1, '#fbbf24');
    // Jewels
    draw(5, 1, 1, 1, '#ef4444'); // Ruby
    draw(7, 0, 2, 1, '#3b82f6'); // Sapphire
    draw(10, 1, 1, 1, '#10b981'); // Emerald
  } else if (hasTopHat) {
    // Sophisticated Victorian Top Hat
    draw(2, 2, 12, 2, '#18181b'); // Wide brim
    draw(4, -4, 8, 6, '#18181b'); // Tall cylinder
    draw(4, 1, 8, 1, '#d97706'); // Velvet gold ribbon
    draw(5, -3, 1, 5, '#3f3f46'); // Highlight sheen
  } else if (hasCap) {
    // Red skate cap
    draw(4, 1, 8, 3, '#ef4444');
    draw(8, 3, 5, 1, '#b91c1c'); // Visor/Brim sticking forward
    draw(7, 0, 2, 1, '#ffffff'); // Button on top
  }

  // Deal With It Sunglasses (drawn on face)
  if (hasDealWithIt) {
    // Black frames
    draw(5, 4, 3, 2, '#000000');
    draw(8, 4, 3, 2, '#000000');
    draw(7, 4, 1, 1, '#000000'); // Bridge
    // Pixel glint reflection
    draw(5, 4, 1, 1, '#ffffff');
    draw(6, 5, 1, 1, '#ffffff');
    draw(8, 4, 1, 1, '#ffffff');
    draw(9, 5, 1, 1, '#ffffff');
  }
}

/**
 * Draws falling money & items in pixel art
 */
export function drawPixelItem(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  width: number,
  height: number,
  frame: number = 0,
  rotation: number = 0
) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  if (rotation !== 0) {
    ctx.rotate(rotation);
  }
  ctx.translate(-width / 2, -height / 2);

  const scale = width / 16;
  const p = (px: number, py: number, w: number, h: number, col: string) => {
    ctx.fillStyle = col;
    ctx.fillRect(Math.floor(px * scale), Math.floor(py * scale), Math.floor(w * scale), Math.floor(h * scale));
  };

  switch (type) {
    case 'coin_bronze':
    case 'coin_silver':
    case 'coin_gold': {
      const colors =
        type === 'coin_gold'
          ? { main: '#fbbf24', rim: '#d97706', shine: '#fef08a', dark: '#92400e' }
          : type === 'coin_silver'
          ? { main: '#e2e8f0', rim: '#94a3b8', shine: '#ffffff', dark: '#475569' }
          : { main: '#f97316', rim: '#c2410c', shine: '#fed7aa', dark: '#7c2d12' };

      // Rotating coin animation frames (0 to 3)
      const f = Math.floor(frame) % 4;
      if (f === 0) {
        // Full round
        p(4, 2, 8, 12, colors.rim);
        p(5, 3, 6, 10, colors.main);
        p(6, 4, 4, 8, colors.shine);
        p(7, 6, 2, 4, colors.dark); // $ sign or center
      } else if (f === 1 || f === 3) {
        // Tilted ellipse
        p(6, 2, 4, 12, colors.rim);
        p(7, 3, 2, 10, colors.main);
        p(7, 4, 1, 8, colors.shine);
      } else {
        // Thin edge
        p(7, 2, 2, 12, colors.shine);
        p(8, 3, 1, 10, colors.rim);
      }
      break;
    }

    case 'bill_single': {
      // Crisp 100-dollar green bill
      p(1, 4, 14, 8, '#14532d'); // Dark green border
      p(2, 5, 12, 6, '#22c55e'); // Green paper
      p(3, 6, 10, 4, '#86efac'); // Light interior
      p(6, 6, 4, 4, '#15803d'); // Center seal
      p(7, 7, 2, 2, '#fef08a'); // Gold portrait
      p(2, 5, 1, 1, '#14532d');
      p(13, 5, 1, 1, '#14532d');
      p(2, 10, 1, 1, '#14532d');
      p(13, 10, 1, 1, '#14532d');
      break;
    }

    case 'bill_stack': {
      // Stack of banded money bills
      p(2, 6, 12, 3, '#14532d');
      p(1, 4, 14, 3, '#15803d');
      p(0, 2, 16, 8, '#22c55e'); // Top bill
      p(2, 3, 12, 6, '#86efac');
      // Paper band strap
      p(6, 2, 4, 8, '#fef08a');
      p(7, 4, 2, 4, '#d97706');
      break;
    }

    case 'money_bag': {
      // Classic canvas sack with '$'
      p(6, 1, 4, 3, '#b45309'); // Tied knot
      p(4, 3, 8, 2, '#d97706'); // Neck
      p(2, 5, 12, 10, '#f59e0b'); // Body of bag
      p(3, 13, 10, 2, '#b45309'); // Base shadow
      p(3, 6, 3, 6, '#fbbf24'); // Light highlight
      // Dollar sign in black
      p(7, 7, 2, 6, '#0f172a');
      p(6, 8, 4, 1, '#0f172a');
      p(6, 11, 4, 1, '#0f172a');
      break;
    }

    case 'gold_bar': {
      // Heavy gleaming gold ingot
      p(2, 6, 12, 7, '#b45309'); // Base shadow
      p(3, 4, 10, 7, '#f59e0b'); // Main body
      p(4, 3, 8, 3, '#fef08a'); // Top highlight face
      p(5, 5, 6, 2, '#ffffff'); // Gleam glint
      break;
    }

    case 'diamond': {
      // Sparkling cyan diamond
      p(5, 2, 6, 2, '#a5f3fc');
      p(2, 4, 12, 3, '#38bdf8');
      p(4, 7, 8, 4, '#0284c7');
      p(6, 11, 4, 3, '#0369a1');
      p(7, 14, 2, 1, '#075985');
      // Facet highlights
      p(5, 3, 2, 2, '#ffffff');
      p(9, 4, 2, 2, '#ffffff');
      break;
    }

    case 'powerup_magnet': {
      // Red & blue horseshoe magnet with sparks
      p(3, 2, 3, 10, '#ef4444'); // Red left pole
      p(10, 2, 3, 10, '#3b82f6'); // Blue right pole
      p(3, 10, 10, 4, '#64748b'); // Bottom arch
      p(5, 10, 6, 2, '#0f172a'); // Interior hole
      // Silver tips
      p(3, 2, 3, 2, '#ffffff');
      p(10, 2, 3, 2, '#ffffff');
      break;
    }

    case 'powerup_2x': {
      // Golden star with '2X'
      p(6, 1, 4, 3, '#fbbf24');
      p(1, 5, 14, 4, '#fbbf24');
      p(3, 9, 10, 4, '#f59e0b');
      p(2, 12, 4, 3, '#d97706');
      p(10, 12, 4, 3, '#d97706');
      // '2X' in center
      p(6, 5, 4, 5, '#ffffff');
      p(7, 6, 2, 3, '#0f172a');
      break;
    }

    case 'powerup_speed': {
      // Winged sneaker / lightning
      p(6, 1, 4, 4, '#fbbf24');
      p(4, 5, 8, 3, '#f59e0b');
      p(2, 8, 12, 3, '#eab308');
      p(5, 11, 6, 4, '#d97706');
      p(6, 3, 2, 9, '#ffffff');
      break;
    }

    case 'hazard_banana': {
      // Comical yellow banana peel
      p(5, 3, 6, 2, '#713f12'); // Stem
      p(6, 5, 4, 5, '#eab308'); // Core
      p(2, 10, 4, 3, '#facc15'); // Left peel
      p(10, 10, 4, 3, '#facc15'); // Right peel
      p(6, 11, 4, 3, '#fef08a'); // Center peel
      p(7, 4, 2, 1, '#451a03'); // Tip
      break;
    }

    default:
      p(4, 4, 8, 8, '#ffffff');
      break;
  }

  ctx.restore();
}

/**
 * Renders the retro parallax city skyline backdrop
 */
export function drawCityBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
) {
  // 1. Sky Gradient (Retro arcade sunset to dusk)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#0f172a'); // Deep cosmic night
  skyGrad.addColorStop(0.5, '#1e1b4b'); // Royal indigo
  skyGrad.addColorStop(0.75, '#4c1d95'); // Neon purple
  skyGrad.addColorStop(0.88, '#be185d'); // Retro sunset magenta
  skyGrad.addColorStop(1, '#ea580c'); // Warm amber horizon
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Stars twinkling
  const numStars = 32;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < numStars; i++) {
    const sx = (i * 73 + 17) % width;
    const sy = (i * 41 + 11) % (height * 0.55);
    const blink = Math.sin(time * 3 + i * 1.5) > 0.2;
    if (blink) {
      ctx.fillRect(Math.floor(sx), Math.floor(sy), 2, 2);
    }
  }

  // 3. Moon (Retro Pixel Moon)
  const moonX = width - 60;
  const moonY = 32;
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(moonX + 4, moonY, 16, 24);
  ctx.fillRect(moonX, moonY + 4, 24, 16);
  ctx.fillRect(moonX + 2, moonY + 2, 20, 20);
  // Moon crater shadow
  ctx.fillStyle = '#fde047';
  ctx.fillRect(moonX + 6, moonY + 6, 6, 6);
  ctx.fillRect(moonX + 14, moonY + 12, 4, 4);

  // 4. Parallax Clouds (Slow drifting)
  const cloudOffset = (time * 12) % (width + 100) - 50;
  drawPixelCloud(ctx, (cloudOffset * 0.7) % width, 45, 1.2);
  drawPixelCloud(ctx, ((cloudOffset + 240) * 0.5) % width, 70, 0.9);
  drawPixelCloud(ctx, ((cloudOffset + 480) * 0.6) % width, 35, 1.0);

  // 5. Distant Skyline (Far dark purple silhouette)
  const groundY = height - 52;
  ctx.fillStyle = '#1e1135';
  const buildings1 = [
    { x: 0, w: 45, h: 90 },
    { x: 42, w: 35, h: 120 },
    { x: 75, w: 55, h: 80 },
    { x: 128, w: 40, h: 135 },
    { x: 165, w: 60, h: 100 },
    { x: 222, w: 50, h: 145 },
    { x: 270, w: 65, h: 85 },
    { x: 330, w: 45, h: 125 },
    { x: 372, w: 55, h: 105 },
    { x: 425, w: 70, h: 140 },
    { x: 490, w: 80, h: 95 },
  ];

  buildings1.forEach((b) => {
    ctx.fillRect(b.x % width, groundY - b.h, b.w, b.h);
    // Antenna / Spire on tall buildings
    if (b.h > 115) {
      ctx.fillRect((b.x + b.w / 2 - 1) % width, groundY - b.h - 16, 2, 16);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect((b.x + b.w / 2 - 1) % width, groundY - b.h - 17, 2, 2);
      ctx.fillStyle = '#1e1135';
    }
  });

  // 6. Midground Skyline (Darker navy with glowing yellow and cyan pixel windows)
  ctx.fillStyle = '#0f172a';
  const buildings2 = [
    { x: 15, w: 50, h: 75, win: true },
    { x: 62, w: 42, h: 95, win: true },
    { x: 102, w: 52, h: 65, win: false },
    { x: 150, w: 62, h: 110, win: true },
    { x: 210, w: 40, h: 80, win: true },
    { x: 248, w: 58, h: 100, win: true },
    { x: 304, w: 48, h: 70, win: false },
    { x: 350, w: 64, h: 90, win: true },
    { x: 412, w: 44, h: 115, win: true },
    { x: 454, w: 60, h: 75, win: true },
  ];

  buildings2.forEach((b) => {
    const bx = b.x % width;
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(bx, groundY - b.h, b.w, b.h);

    // Glowing windows
    if (b.win) {
      for (let r = 0; r < Math.floor(b.h / 12) - 1; r++) {
        for (let c = 0; c < Math.floor(b.w / 10) - 1; c++) {
          const seed = (b.x * 7 + r * 13 + c * 19) % 10;
          if (seed > 4) {
            ctx.fillStyle = seed > 7 ? '#fef08a' : '#38bdf8'; // Yellow or cyan glow
            ctx.fillRect(bx + 6 + c * 8, groundY - b.h + 8 + r * 11, 4, 5);
          }
        }
      }
    }
  });

  // 7. Ground / Pavement / Sidewalk
  // Curb rim
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, groundY, width, 4);

  // Sidewalk tiles
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, groundY + 4, width, height - (groundY + 4));

  // Retro brick sidewalk pattern
  ctx.fillStyle = '#0f172a';
  for (let x = 0; x < width; x += 16) {
    ctx.fillRect(x, groundY + 4, 1, height - (groundY + 4));
  }
  for (let y = groundY + 14; y < height; y += 12) {
    ctx.fillRect(0, y, width, 1);
  }

  // 8. Pixel Streetlamp casting a warm cone of light
  const lampX = 40;
  ctx.fillStyle = '#475569';
  ctx.fillRect(lampX, groundY - 60, 4, 60); // Pole
  ctx.fillRect(lampX - 6, groundY - 64, 16, 4); // Arm
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(lampX - 4, groundY - 60, 12, 6); // Lantern light bulb
}

function drawPixelCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  const p = (px: number, py: number, w: number, h: number) => {
    ctx.fillRect(Math.floor(x + px * scale), Math.floor(y + py * scale), Math.floor(w * scale), Math.floor(h * scale));
  };
  p(8, 0, 16, 8);
  p(4, 4, 24, 8);
  p(0, 8, 32, 6);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  p(2, 10, 28, 4);
}
