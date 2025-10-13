/**
 * Decorative module styles for beautiful QR codes
 */

/**
 * Draw a star-shaped module
 */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const spikes = 5;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.2;

  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / spikes) * i;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw a heart-shaped module
 */
export function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  const s = size * 0.8;
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.3);
  
  // Left curve
  ctx.bezierCurveTo(
    cx - s * 0.5, cy,
    cx - s * 0.5, cy - s * 0.3,
    cx - s * 0.25, cy - s * 0.3
  );
  
  // Top left arc
  ctx.bezierCurveTo(
    cx - s * 0.1, cy - s * 0.3,
    cx, cy - s * 0.15,
    cx, cy - s * 0.05
  );
  
  // Top right arc
  ctx.bezierCurveTo(
    cx, cy - s * 0.15,
    cx + s * 0.1, cy - s * 0.3,
    cx + s * 0.25, cy - s * 0.3
  );
  
  // Right curve
  ctx.bezierCurveTo(
    cx + s * 0.5, cy - s * 0.3,
    cx + s * 0.5, cy,
    cx, cy + s * 0.3
  );
  
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw a diamond-shaped module
 */
export function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const s = size * 0.45;

  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.lineTo(cx + s, cy);
  ctx.lineTo(cx, cy + s);
  ctx.lineTo(cx - s, cy);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw a flower/petal-shaped module
 */
export function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const petals = 6;
  const petalRadius = size * 0.25;

  for (let i = 0; i < petals; i++) {
    const angle = (Math.PI * 2 / petals) * i;
    const px = cx + Math.cos(angle) * petalRadius;
    const py = cy + Math.sin(angle) * petalRadius;
    
    ctx.beginPath();
    ctx.arc(px, py, petalRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, petalRadius * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw a hexagon-shaped module
 */
export function drawHexagon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const radius = size * 0.45;

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw a cross/plus-shaped module
 */
export function drawCross(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const thickness = size * 0.3;
  const length = size * 0.8;

  ctx.fillRect(cx - thickness / 2, cy - length / 2, thickness, length);
  ctx.fillRect(cx - length / 2, cy - thickness / 2, length, thickness);
}

/**
 * Draw a triangle module
 */
export function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const s = size * 0.45;

  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.lineTo(cx + s * 0.866, cy + s * 0.5);
  ctx.lineTo(cx - s * 0.866, cy + s * 0.5);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw a gear-shaped module
 */
export function drawGear(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const teeth = 8;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.35;
  const toothWidth = Math.PI / (teeth * 2);

  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const angle = (Math.PI * 2 / teeth) * i;
    
    // Outer tooth edge
    ctx.arc(cx, cy, outerRadius, angle - toothWidth, angle + toothWidth);
    
    // Inner valley
    ctx.arc(cx, cy, innerRadius, angle + toothWidth, angle + Math.PI * 2 / teeth - toothWidth);
  }
  ctx.closePath();
  ctx.fill();
}

export type DecorativeStyle = 
  | 'star'
  | 'heart'
  | 'diamond'
  | 'flower'
  | 'hexagon'
  | 'cross'
  | 'triangle'
  | 'gear';

/**
 * Draw a decorative module based on style
 */
export function drawDecorativeModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: DecorativeStyle
): void {
  switch (style) {
    case 'star':
      drawStar(ctx, x, y, size);
      break;
    case 'heart':
      drawHeart(ctx, x, y, size);
      break;
    case 'diamond':
      drawDiamond(ctx, x, y, size);
      break;
    case 'flower':
      drawFlower(ctx, x, y, size);
      break;
    case 'hexagon':
      drawHexagon(ctx, x, y, size);
      break;
    case 'cross':
      drawCross(ctx, x, y, size);
      break;
    case 'triangle':
      drawTriangle(ctx, x, y, size);
      break;
    case 'gear':
      drawGear(ctx, x, y, size);
      break;
    default:
      // Fallback to simple square
      ctx.fillRect(x, y, size, size);
  }
}