import { DotStyle } from '../../types';

/**
 * Draw a dot with specified style
 */
export function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: DotStyle,
  cornerRadius?: number
): void {
  switch (style) {
    case DotStyle.Square:
      drawSquare(ctx, x, y, size);
      break;
    case DotStyle.Rounded:
      drawRounded(ctx, x, y, size, cornerRadius || 0.3);
      break;
    case DotStyle.Dots:
      drawCircle(ctx, x, y, size);
      break;
    case DotStyle.Diamond:
      drawDiamond(ctx, x, y, size);
      break;
    case DotStyle.Star:
      drawStar(ctx, x, y, size);
      break;
    case DotStyle.Classy:
      drawClassy(ctx, x, y, size);
      break;
    case DotStyle.ClassyRounded:
      drawClassyRounded(ctx, x, y, size);
      break;
    case DotStyle.ExtraRounded:
      drawRounded(ctx, x, y, size, 0.5);
      break;
    case DotStyle.Hexagon:
      drawHexagon(ctx, x, y, size);
      break;
    case DotStyle.Liquid:
      drawLiquid(ctx, x, y, size);
      break;
    case DotStyle.SmoothDots:
      drawSmoothDots(ctx, x, y, size);
      break;
    case DotStyle.SmoothFlow:
      // Smooth flow is handled differently in canvas renderer
      drawCircle(ctx, x, y, size);
      break;
    case DotStyle.UltraSmooth:
      // Ultra smooth is handled differently in canvas renderer
      drawCircle(ctx, x, y, size);
      break;
    default:
      drawSquare(ctx, x, y, size);
  }
}

/**
 * Draw square dot
 */
function drawSquare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.fillRect(x, y, size, size);
}

/**
 * Draw rounded square dot
 */
function drawRounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radiusRatio: number
): void {
  const radius = size * radiusRatio;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + size - radius, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
  ctx.lineTo(x + size, y + size - radius);
  ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
  ctx.lineTo(x + radius, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw circular dot
 */
function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const radius = size / 2;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw diamond shaped dot
 */
function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  ctx.beginPath();
  ctx.moveTo(centerX, y);
  ctx.lineTo(x + size, centerY);
  ctx.lineTo(centerX, y + size);
  ctx.lineTo(x, centerY);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw star shaped dot
 */
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const outerRadius = size / 2;
  const innerRadius = size / 4;
  const points = 5;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const px = centerX + Math.cos(angle) * radius;
    const py = centerY + Math.sin(angle) * radius;

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
 * Draw classy style (special corner treatment)
 */
function drawClassy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  // Classy style: square with small cut corners
  const cut = size * 0.15;

  ctx.beginPath();
  ctx.moveTo(x + cut, y);
  ctx.lineTo(x + size - cut, y);
  ctx.lineTo(x + size, y + cut);
  ctx.lineTo(x + size, y + size - cut);
  ctx.lineTo(x + size - cut, y + size);
  ctx.lineTo(x + cut, y + size);
  ctx.lineTo(x, y + size - cut);
  ctx.lineTo(x, y + cut);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw rounded classy style
 */
function drawClassyRounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): void {
  // Rounded classy: rounded square with smooth transitions
  const radius = size * 0.2;
  const cut = size * 0.1;

  ctx.beginPath();
  ctx.moveTo(x + cut + radius, y);
  ctx.lineTo(x + size - cut - radius, y);
  ctx.quadraticCurveTo(x + size - cut, y, x + size, y + cut);
  ctx.lineTo(x + size, y + size - cut);
  ctx.quadraticCurveTo(x + size, y + size - cut + radius, x + size - cut, y + size);
  ctx.lineTo(x + cut, y + size);
  ctx.quadraticCurveTo(x, y + size - cut + radius, x, y + size - cut);
  ctx.lineTo(x, y + cut);
  ctx.quadraticCurveTo(x, y, x + cut + radius, y);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw hexagon shaped dot
 */
function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const radius = size / 2;

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = centerX + Math.cos(angle) * radius;
    const py = centerY + Math.sin(angle) * radius;

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
 * Draw liquid/blob style dot
 */
function drawLiquid(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  // Create organic blob shape using bezier curves
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const radius = size / 2;
  const variance = 0.15; // How much the shape varies

  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i;
    const nextAngle = (Math.PI / 4) * (i + 1);

    // Add some randomness but keep it consistent for same position
    const offset1 = Math.sin(x * 0.1 + i) * variance;
    const offset2 = Math.cos(y * 0.1 + i) * variance;

    const r1 = radius * (1 + offset1);
    const r2 = radius * (1 + offset2);

    const x1 = centerX + Math.cos(angle) * r1;
    const y1 = centerY + Math.sin(angle) * r1;
    const x2 = centerX + Math.cos(nextAngle) * r2;
    const y2 = centerY + Math.sin(nextAngle) * r2;

    // Control point between the two points
    const cpAngle = (angle + nextAngle) / 2;
    const cpRadius = radius * 1.1;
    const cpX = centerX + Math.cos(cpAngle) * cpRadius;
    const cpY = centerY + Math.sin(cpAngle) * cpRadius;

    if (i === 0) {
      ctx.moveTo(x1, y1);
    }
    ctx.quadraticCurveTo(cpX, cpY, x2, y2);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw smooth dots with soft edges
 */
function drawSmoothDots(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const radius = size / 2.4; // Slightly smaller for better scanning

  // Just draw a simple circle - the "smooth" comes from anti-aliasing
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Get SVG path for dot style
 */
export function getDotSVGPath(
  x: number,
  y: number,
  size: number,
  style: DotStyle,
  cornerRadius?: number
): string {
  switch (style) {
    case DotStyle.Square:
      return `M ${x} ${y} h ${size} v ${size} h ${-size} Z`;
    case DotStyle.Rounded:
      return getRoundedSVGPath(x, y, size, cornerRadius || 0.3);
    case DotStyle.Dots:
      return getCircleSVGPath(x, y, size);
    case DotStyle.Diamond:
      return getDiamondSVGPath(x, y, size);
    case DotStyle.Star:
      return getStarSVGPath(x, y, size);
    case DotStyle.Classy:
      return getClassySVGPath(x, y, size);
    case DotStyle.ClassyRounded:
      return getClassyRoundedSVGPath(x, y, size);
    case DotStyle.ExtraRounded:
      return getRoundedSVGPath(x, y, size, 0.5);
    case DotStyle.Hexagon:
      return getHexagonSVGPath(x, y, size);
    case DotStyle.Liquid:
      return getLiquidSVGPath(x, y, size);
    case DotStyle.SmoothDots:
      return getCircleSVGPath(x, y, size); // Use circle for SVG smooth dots
    case DotStyle.UltraSmooth:
      return getCircleSVGPath(x, y, size); // Use circle for SVG ultra smooth
    default:
      return `M ${x} ${y} h ${size} v ${size} h ${-size} Z`;
  }
}

function getRoundedSVGPath(x: number, y: number, size: number, radiusRatio: number): string {
  const r = size * radiusRatio;
  return `M ${x + r} ${y} h ${size - 2 * r} a ${r} ${r} 0 0 1 ${r} ${r} v ${size - 2 * r} a ${r} ${r} 0 0 1 ${-r} ${r} h ${-(size - 2 * r)} a ${r} ${r} 0 0 1 ${-r} ${-r} v ${-(size - 2 * r)} a ${r} ${r} 0 0 1 ${r} ${-r} Z`;
}

function getCircleSVGPath(x: number, y: number, size: number): string {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;
  return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`;
}

function getDiamondSVGPath(x: number, y: number, size: number): string {
  const cx = x + size / 2;
  const cy = y + size / 2;
  return `M ${cx} ${y} L ${x + size} ${cy} L ${cx} ${y + size} L ${x} ${cy} Z`;
}

function getStarSVGPath(x: number, y: number, size: number): string {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const outerRadius = size / 2;
  const innerRadius = size / 4;
  const points = 5;
  let path = '';

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    path += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
  }
  return path + ' Z';
}

function getClassySVGPath(x: number, y: number, size: number): string {
  const cut = size * 0.15;
  return `M ${x + cut} ${y} L ${x + size - cut} ${y} L ${x + size} ${y + cut} L ${x + size} ${y + size - cut} L ${x + size - cut} ${y + size} L ${x + cut} ${y + size} L ${x} ${y + size - cut} L ${x} ${y + cut} Z`;
}

function getClassyRoundedSVGPath(x: number, y: number, size: number): string {
  const cut = size * 0.1;
  const r = size * 0.2;
  return `M ${x + cut + r} ${y} L ${x + size - cut - r} ${y} Q ${x + size - cut} ${y} ${x + size} ${y + cut} L ${x + size} ${y + size - cut} Q ${x + size} ${y + size - cut + r} ${x + size - cut} ${y + size} L ${x + cut} ${y + size} Q ${x} ${y + size - cut + r} ${x} ${y + size - cut} L ${x} ${y + cut} Q ${x} ${y} ${x + cut + r} ${y} Z`;
}

function getHexagonSVGPath(x: number, y: number, size: number): string {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;
  let path = '';

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    path += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
  }
  return path + ' Z';
}

function getLiquidSVGPath(x: number, y: number, size: number): string {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;
  const variance = 0.15;
  let path = '';

  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i;
    const nextAngle = (Math.PI / 4) * (i + 1);

    const offset1 = Math.sin(x * 0.1 + i) * variance;
    const offset2 = Math.cos(y * 0.1 + i) * variance;

    const r1 = r * (1 + offset1);
    const r2 = r * (1 + offset2);

    const x1 = cx + Math.cos(angle) * r1;
    const y1 = cy + Math.sin(angle) * r1;
    const x2 = cx + Math.cos(nextAngle) * r2;
    const y2 = cy + Math.sin(nextAngle) * r2;

    const cpAngle = (angle + nextAngle) / 2;
    const cpRadius = r * 1.1;
    const cpX = cx + Math.cos(cpAngle) * cpRadius;
    const cpY = cy + Math.sin(cpAngle) * cpRadius;

    if (i === 0) {
      path = `M ${x1} ${y1}`;
    }
    path += ` Q ${cpX} ${cpY} ${x2} ${y2}`;
  }
  return path + ' Z';
}
