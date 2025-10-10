/**
 * Marker (Finder Pattern) Shape Implementation
 * Implements various shapes for QR code finder patterns (eyes)
 */

import { MarkerShape, MarkerInner } from '../../types';

/**
 * Draw marker outer frame shape
 */
export function drawMarkerShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: MarkerShape
): void {
  switch (shape) {
    case MarkerShape.Square:
      drawMarkerSquare(ctx, x, y, size);
      break;
    case MarkerShape.Circle:
      drawMarkerCircle(ctx, x, y, size);
      break;
    case MarkerShape.RoundedSquare:
      drawMarkerRoundedSquare(ctx, x, y, size);
      break;
    case MarkerShape.Octagon:
      drawMarkerOctagon(ctx, x, y, size);
      break;
    case MarkerShape.Leaf:
      drawMarkerLeaf(ctx, x, y, size);
      break;
    case MarkerShape.Frame:
      drawMarkerFrame(ctx, x, y, size);
      break;
    case MarkerShape.Extra:
      drawMarkerExtra(ctx, x, y, size);
      break;
    default:
      drawMarkerSquare(ctx, x, y, size);
  }
}

/**
 * Draw marker inner shape
 */
export function drawMarkerInnerShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: MarkerInner
): void {
  switch (shape) {
    case MarkerInner.Square:
      drawInnerSquare(ctx, x, y, size);
      break;
    case MarkerInner.Circle:
      drawInnerCircle(ctx, x, y, size);
      break;
    case MarkerInner.Diamond:
      drawInnerDiamond(ctx, x, y, size);
      break;
    case MarkerInner.Rounded:
      drawInnerRounded(ctx, x, y, size);
      break;
    case MarkerInner.Petal:
      drawInnerPetal(ctx, x, y, size);
      break;
    case MarkerInner.Plus:
      drawInnerPlus(ctx, x, y, size);
      break;
    case MarkerInner.Star:
      drawInnerStar(ctx, x, y, size);
      break;
    case MarkerInner.Auto:
      // Auto will be handled by caller
      drawInnerSquare(ctx, x, y, size);
      break;
    default:
      drawInnerSquare(ctx, x, y, size);
  }
}

// ============= Marker Outer Frame Shapes =============

/**
 * Square marker frame (7x7 with 1-module-wide border)
 */
function drawMarkerSquare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  // Outer 7x7 square
  ctx.fillRect(x, y, size, size);

  // Clear inner 5x5 area
  const innerOffset = size / 7;
  const innerSize = size * (5 / 7);
  ctx.clearRect(x + innerOffset, y + innerOffset, innerSize, innerSize);
}

/**
 * Circular marker frame
 */
function drawMarkerCircle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const outerRadius = size / 2;
  const innerRadius = (size / 2) * (5 / 7);

  // Draw outer circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.fill();

  // Clear inner circle
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Rounded square marker frame
 */
function drawMarkerRoundedSquare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const radius = size * 0.2;
  const innerOffset = size / 7;
  const innerSize = size * (5 / 7);
  const innerRadius = innerSize * 0.2;

  // Draw outer rounded rectangle
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

  // Clear inner rounded rectangle
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  const innerX = x + innerOffset;
  const innerY = y + innerOffset;
  ctx.moveTo(innerX + innerRadius, innerY);
  ctx.lineTo(innerX + innerSize - innerRadius, innerY);
  ctx.quadraticCurveTo(innerX + innerSize, innerY, innerX + innerSize, innerY + innerRadius);
  ctx.lineTo(innerX + innerSize, innerY + innerSize - innerRadius);
  ctx.quadraticCurveTo(innerX + innerSize, innerY + innerSize, innerX + innerSize - innerRadius, innerY + innerSize);
  ctx.lineTo(innerX + innerRadius, innerY + innerSize);
  ctx.quadraticCurveTo(innerX, innerY + innerSize, innerX, innerY + innerSize - innerRadius);
  ctx.lineTo(innerX, innerY + innerRadius);
  ctx.quadraticCurveTo(innerX, innerY, innerX + innerRadius, innerY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Octagon marker frame
 */
function drawMarkerOctagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const outerRadius = size / 2;
  const innerRadius = outerRadius * (5 / 7);

  // Draw outer octagon
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 8;
    const px = centerX + Math.cos(angle) * outerRadius;
    const py = centerY + Math.sin(angle) * outerRadius;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();

  // Clear inner octagon
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 8;
    const px = centerX + Math.cos(angle) * innerRadius;
    const py = centerY + Math.sin(angle) * innerRadius;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Leaf-shaped marker frame
 */
function drawMarkerLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  // Outer leaf shape using bezier curves
  ctx.beginPath();
  ctx.moveTo(centerX, y);
  ctx.bezierCurveTo(x + size, y, x + size, y + size, centerX, y + size);
  ctx.bezierCurveTo(x, y + size, x, y, centerX, y);
  ctx.closePath();
  ctx.fill();

  // Clear inner leaf shape
  const innerOffset = size * (1 / 7);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.moveTo(centerX, y + innerOffset);
  ctx.bezierCurveTo(
    x + size - innerOffset,
    y + innerOffset,
    x + size - innerOffset,
    y + size - innerOffset,
    centerX,
    y + size - innerOffset
  );
  ctx.bezierCurveTo(
    x + innerOffset,
    y + size - innerOffset,
    x + innerOffset,
    y + innerOffset,
    centerX,
    y + innerOffset
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Frame style marker (decorative border)
 */
function drawMarkerFrame(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const cornerCut = size * 0.15;

  // Draw outer frame with cut corners
  ctx.beginPath();
  ctx.moveTo(x + cornerCut, y);
  ctx.lineTo(x + size - cornerCut, y);
  ctx.lineTo(x + size, y + cornerCut);
  ctx.lineTo(x + size, y + size - cornerCut);
  ctx.lineTo(x + size - cornerCut, y + size);
  ctx.lineTo(x + cornerCut, y + size);
  ctx.lineTo(x, y + size - cornerCut);
  ctx.lineTo(x, y + cornerCut);
  ctx.closePath();
  ctx.fill();

  // Clear inner area
  const innerOffset = size / 7;
  const innerSize = size * (5 / 7);
  const innerCut = innerSize * 0.15;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  const innerX = x + innerOffset;
  const innerY = y + innerOffset;
  ctx.moveTo(innerX + innerCut, innerY);
  ctx.lineTo(innerX + innerSize - innerCut, innerY);
  ctx.lineTo(innerX + innerSize, innerY + innerCut);
  ctx.lineTo(innerX + innerSize, innerY + innerSize - innerCut);
  ctx.lineTo(innerX + innerSize - innerCut, innerY + innerSize);
  ctx.lineTo(innerX + innerCut, innerY + innerSize);
  ctx.lineTo(innerX, innerY + innerSize - innerCut);
  ctx.lineTo(innerX, innerY + innerCut);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Extra decorative marker frame
 */
function drawMarkerExtra(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const outerRadius = size / 2;

  // Draw outer shape with decorative points
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI / 6) * i;
    const radius = i % 2 === 0 ? outerRadius : outerRadius * 0.9;
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

  // Clear inner circle
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const innerRadius = outerRadius * (5 / 7);
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ============= Marker Inner Shapes =============

/**
 * Square inner (3x3)
 */
function drawInnerSquare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const innerOffset = size * (2 / 7);
  const innerSize = size * (3 / 7);
  ctx.fillRect(x + innerOffset, y + innerOffset, innerSize, innerSize);
}

/**
 * Circle inner
 */
function drawInnerCircle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const radius = (size / 2) * (3 / 7);

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Diamond inner
 */
function drawInnerDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const halfSize = (size / 2) * (3 / 7);

  ctx.beginPath();
  ctx.moveTo(centerX, centerY - halfSize);
  ctx.lineTo(centerX + halfSize, centerY);
  ctx.lineTo(centerX, centerY + halfSize);
  ctx.lineTo(centerX - halfSize, centerY);
  ctx.closePath();
  ctx.fill();
}

/**
 * Rounded square inner
 */
function drawInnerRounded(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const innerOffset = size * (2 / 7);
  const innerSize = size * (3 / 7);
  const radius = innerSize * 0.25;
  const innerX = x + innerOffset;
  const innerY = y + innerOffset;

  ctx.beginPath();
  ctx.moveTo(innerX + radius, innerY);
  ctx.lineTo(innerX + innerSize - radius, innerY);
  ctx.quadraticCurveTo(innerX + innerSize, innerY, innerX + innerSize, innerY + radius);
  ctx.lineTo(innerX + innerSize, innerY + innerSize - radius);
  ctx.quadraticCurveTo(innerX + innerSize, innerY + innerSize, innerX + innerSize - radius, innerY + innerSize);
  ctx.lineTo(innerX + radius, innerY + innerSize);
  ctx.quadraticCurveTo(innerX, innerY + innerSize, innerX, innerY + innerSize - radius);
  ctx.lineTo(innerX, innerY + radius);
  ctx.quadraticCurveTo(innerX, innerY, innerX + radius, innerY);
  ctx.closePath();
  ctx.fill();
}

/**
 * Petal/flower inner
 */
function drawInnerPetal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const radius = (size / 2) * (3 / 7);

  // Draw 4 petals using circles
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i;
    const px = centerX + Math.cos(angle) * (radius * 0.4);
    const py = centerY + Math.sin(angle) * (radius * 0.4);
    ctx.moveTo(px + radius * 0.6, py);
    ctx.arc(px, py, radius * 0.6, 0, Math.PI * 2);
  }
  ctx.fill();

  // Add center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Plus/cross inner
 */
function drawInnerPlus(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const armLength = (size / 2) * (3 / 7);
  const armWidth = armLength * 0.4;

  // Horizontal bar
  ctx.fillRect(centerX - armLength, centerY - armWidth / 2, armLength * 2, armWidth);

  // Vertical bar
  ctx.fillRect(centerX - armWidth / 2, centerY - armLength, armWidth, armLength * 2);
}

/**
 * Star inner
 */
function drawInnerStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const outerRadius = (size / 2) * (3 / 7);
  const innerRadius = outerRadius * 0.4;
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

// ============= SVG Path Generators =============

/**
 * Get SVG path for marker outer frame shape
 */
export function getMarkerShapeSVGPath(
  x: number,
  y: number,
  size: number,
  shape: MarkerShape
): string {
  switch (shape) {
    case MarkerShape.Square:
      return getMarkerSquareSVGPath(x, y, size);
    case MarkerShape.Circle:
      return getMarkerCircleSVGPath(x, y, size);
    case MarkerShape.RoundedSquare:
      return getMarkerRoundedSquareSVGPath(x, y, size);
    case MarkerShape.Octagon:
      return getMarkerOctagonSVGPath(x, y, size);
    case MarkerShape.Leaf:
      return getMarkerLeafSVGPath(x, y, size);
    case MarkerShape.Frame:
      return getMarkerFrameSVGPath(x, y, size);
    case MarkerShape.Extra:
      return getMarkerExtraSVGPath(x, y, size);
    default:
      return getMarkerSquareSVGPath(x, y, size);
  }
}

/**
 * Get SVG path for marker inner shape
 */
export function getMarkerInnerShapeSVGPath(
  x: number,
  y: number,
  size: number,
  shape: MarkerInner
): string {
  switch (shape) {
    case MarkerInner.Square:
      return getInnerSquareSVGPath(x, y, size);
    case MarkerInner.Circle:
      return getInnerCircleSVGPath(x, y, size);
    case MarkerInner.Diamond:
      return getInnerDiamondSVGPath(x, y, size);
    case MarkerInner.Rounded:
      return getInnerRoundedSVGPath(x, y, size);
    case MarkerInner.Petal:
      return getInnerPetalSVGPath(x, y, size);
    case MarkerInner.Plus:
      return getInnerPlusSVGPath(x, y, size);
    case MarkerInner.Star:
      return getInnerStarSVGPath(x, y, size);
    case MarkerInner.Auto:
      return getInnerSquareSVGPath(x, y, size);
    default:
      return getInnerSquareSVGPath(x, y, size);
  }
}

// ============= SVG Marker Outer Shapes =============

function getMarkerSquareSVGPath(x: number, y: number, size: number): string {
  const innerOffset = size / 7;
  const innerSize = size * (5 / 7);
  const innerX = x + innerOffset;
  const innerY = y + innerOffset;

  return `M ${x} ${y} h ${size} v ${size} h ${-size} Z M ${innerX} ${innerY} h ${innerSize} v ${innerSize} h ${-innerSize} Z`;
}

function getMarkerCircleSVGPath(x: number, y: number, size: number): string {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const outerRadius = size / 2;
  const innerRadius = (size / 2) * (5 / 7);

  return `M ${centerX - outerRadius} ${centerY} A ${outerRadius} ${outerRadius} 0 1 0 ${centerX + outerRadius} ${centerY} A ${outerRadius} ${outerRadius} 0 1 0 ${centerX - outerRadius} ${centerY} Z M ${centerX - innerRadius} ${centerY} A ${innerRadius} ${innerRadius} 0 1 1 ${centerX + innerRadius} ${centerY} A ${innerRadius} ${innerRadius} 0 1 1 ${centerX - innerRadius} ${centerY} Z`;
}

function getMarkerRoundedSquareSVGPath(x: number, y: number, size: number): string {
  const radius = size * 0.2;
  const innerOffset = size / 7;
  const innerSize = size * (5 / 7);
  const innerRadius = innerSize * 0.2;
  const innerX = x + innerOffset;
  const innerY = y + innerOffset;

  const outer = `M ${x + radius} ${y} L ${x + size - radius} ${y} Q ${x + size} ${y} ${x + size} ${y + radius} L ${x + size} ${y + size - radius} Q ${x + size} ${y + size} ${x + size - radius} ${y + size} L ${x + radius} ${y + size} Q ${x} ${y + size} ${x} ${y + size - radius} L ${x} ${y + radius} Q ${x} ${y} ${x + radius} ${y} Z`;
  const inner = `M ${innerX + innerRadius} ${innerY} L ${innerX + innerSize - innerRadius} ${innerY} Q ${innerX + innerSize} ${innerY} ${innerX + innerSize} ${innerY + innerRadius} L ${innerX + innerSize} ${innerY + innerSize - innerRadius} Q ${innerX + innerSize} ${innerY + innerSize} ${innerX + innerSize - innerRadius} ${innerY + innerSize} L ${innerX + innerRadius} ${innerY + innerSize} Q ${innerX} ${innerY + innerSize} ${innerX} ${innerY + innerSize - innerRadius} L ${innerX} ${innerY + innerRadius} Q ${innerX} ${innerY} ${innerX + innerRadius} ${innerY} Z`;

  return `${outer} ${inner}`;
}

function getMarkerOctagonSVGPath(x: number, y: number, size: number): string {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const outerRadius = size / 2;
  const innerRadius = outerRadius * (5 / 7);

  let path = 'M ';
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 8;
    const px = centerX + Math.cos(angle) * outerRadius;
    const py = centerY + Math.sin(angle) * outerRadius;
    path += `${px} ${py} ${i < 7 ? 'L ' : ''}`;
  }
  path += 'Z M ';

  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 8;
    const px = centerX + Math.cos(angle) * innerRadius;
    const py = centerY + Math.sin(angle) * innerRadius;
    path += `${px} ${py} ${i < 7 ? 'L ' : ''}`;
  }
  path += 'Z';

  return path;
}

function getMarkerLeafSVGPath(x: number, y: number, size: number): string {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const innerOffset = size * (1 / 7);

  const outer = `M ${centerX} ${y} C ${x + size} ${y} ${x + size} ${y + size} ${centerX} ${y + size} C ${x} ${y + size} ${x} ${y} ${centerX} ${y} Z`;
  const inner = `M ${centerX} ${y + innerOffset} C ${x + size - innerOffset} ${y + innerOffset} ${x + size - innerOffset} ${y + size - innerOffset} ${centerX} ${y + size - innerOffset} C ${x + innerOffset} ${y + size - innerOffset} ${x + innerOffset} ${y + innerOffset} ${centerX} ${y + innerOffset} Z`;

  return `${outer} ${inner}`;
}

function getMarkerFrameSVGPath(x: number, y: number, size: number): string {
  const cornerCut = size * 0.15;
  const innerOffset = size / 7;
  const innerSize = size * (5 / 7);
  const innerCut = innerSize * 0.15;
  const innerX = x + innerOffset;
  const innerY = y + innerOffset;

  const outer = `M ${x + cornerCut} ${y} L ${x + size - cornerCut} ${y} L ${x + size} ${y + cornerCut} L ${x + size} ${y + size - cornerCut} L ${x + size - cornerCut} ${y + size} L ${x + cornerCut} ${y + size} L ${x} ${y + size - cornerCut} L ${x} ${y + cornerCut} Z`;
  const inner = `M ${innerX + innerCut} ${innerY} L ${innerX + innerSize - innerCut} ${innerY} L ${innerX + innerSize} ${innerY + innerCut} L ${innerX + innerSize} ${innerY + innerSize - innerCut} L ${innerX + innerSize - innerCut} ${innerY + innerSize} L ${innerX + innerCut} ${innerY + innerSize} L ${innerX} ${innerY + innerSize - innerCut} L ${innerX} ${innerY + innerCut} Z`;

  return `${outer} ${inner}`;
}

function getMarkerExtraSVGPath(x: number, y: number, size: number): string {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const outerRadius = size / 2;
  const innerRadius = outerRadius * (5 / 7);

  let path = 'M ';
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI / 6) * i;
    const radius = i % 2 === 0 ? outerRadius : outerRadius * 0.9;
    const px = centerX + Math.cos(angle) * radius;
    const py = centerY + Math.sin(angle) * radius;
    path += `${px} ${py} ${i < 11 ? 'L ' : ''}`;
  }
  path += `Z M ${centerX - innerRadius} ${centerY} A ${innerRadius} ${innerRadius} 0 1 1 ${centerX + innerRadius} ${centerY} A ${innerRadius} ${innerRadius} 0 1 1 ${centerX - innerRadius} ${centerY} Z`;

  return path;
}

// ============= SVG Marker Inner Shapes =============

function getInnerSquareSVGPath(x: number, y: number, size: number): string {
  const innerOffset = size * (2 / 7);
  const innerSize = size * (3 / 7);
  const innerX = x + innerOffset;
  const innerY = y + innerOffset;

  return `M ${innerX} ${innerY} h ${innerSize} v ${innerSize} h ${-innerSize} Z`;
}

function getInnerCircleSVGPath(x: number, y: number, size: number): string {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const radius = (size / 2) * (3 / 7);

  return `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 0 ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 0 ${centerX - radius} ${centerY} Z`;
}

function getInnerDiamondSVGPath(x: number, y: number, size: number): string {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const halfSize = (size / 2) * (3 / 7);

  return `M ${centerX} ${centerY - halfSize} L ${centerX + halfSize} ${centerY} L ${centerX} ${centerY + halfSize} L ${centerX - halfSize} ${centerY} Z`;
}

function getInnerRoundedSVGPath(x: number, y: number, size: number): string {
  const innerOffset = size * (2 / 7);
  const innerSize = size * (3 / 7);
  const radius = innerSize * 0.25;
  const innerX = x + innerOffset;
  const innerY = y + innerOffset;

  return `M ${innerX + radius} ${innerY} L ${innerX + innerSize - radius} ${innerY} Q ${innerX + innerSize} ${innerY} ${innerX + innerSize} ${innerY + radius} L ${innerX + innerSize} ${innerY + innerSize - radius} Q ${innerX + innerSize} ${innerY + innerSize} ${innerX + innerSize - radius} ${innerY + innerSize} L ${innerX + radius} ${innerY + innerSize} Q ${innerX} ${innerY + innerSize} ${innerX} ${innerY + innerSize - radius} L ${innerX} ${innerY + radius} Q ${innerX} ${innerY} ${innerX + radius} ${innerY} Z`;
}

function getInnerPetalSVGPath(x: number, y: number, size: number): string {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const radius = (size / 2) * (3 / 7);

  let path = '';
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i;
    const px = centerX + Math.cos(angle) * (radius * 0.4);
    const py = centerY + Math.sin(angle) * (radius * 0.4);
    const r = radius * 0.6;
    path += `M ${px - r} ${py} A ${r} ${r} 0 1 0 ${px + r} ${py} A ${r} ${r} 0 1 0 ${px - r} ${py} Z `;
  }

  const centerRadius = radius * 0.3;
  path += `M ${centerX - centerRadius} ${centerY} A ${centerRadius} ${centerRadius} 0 1 0 ${centerX + centerRadius} ${centerY} A ${centerRadius} ${centerRadius} 0 1 0 ${centerX - centerRadius} ${centerY} Z`;

  return path;
}

function getInnerPlusSVGPath(x: number, y: number, size: number): string {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const armLength = (size / 2) * (3 / 7);
  const armWidth = armLength * 0.4;

  const hBar = `M ${centerX - armLength} ${centerY - armWidth / 2} h ${armLength * 2} v ${armWidth} h ${-armLength * 2} Z`;
  const vBar = `M ${centerX - armWidth / 2} ${centerY - armLength} h ${armWidth} v ${armLength * 2} h ${-armWidth} Z`;

  return `${hBar} ${vBar}`;
}

function getInnerStarSVGPath(x: number, y: number, size: number): string {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const outerRadius = (size / 2) * (3 / 7);
  const innerRadius = outerRadius * 0.4;
  const points = 5;

  let path = 'M ';
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const px = centerX + Math.cos(angle) * radius;
    const py = centerY + Math.sin(angle) * radius;
    path += `${px} ${py} ${i < points * 2 - 1 ? 'L ' : ''}`;
  }
  path += 'Z';

  return path;
}

