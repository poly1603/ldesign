import { DotStyle, EyeStyleConfig, GradientConfig } from '../../types';
import { drawDot, getDotSVGPath } from './dots';
import { createCanvasGradient, createSVGGradient, getGradientId } from './gradients';

/**
 * Eye position information
 */
export interface EyePosition {
  row: number;
  col: number;
  size: number;
}

/**
 * Get positions of the three finder patterns (eyes)
 */
export function getEyePositions(moduleCount: number): EyePosition[] {
  return [
    { row: 0, col: 0, size: 7 }, // Top-left
    { row: 0, col: moduleCount - 7, size: 7 }, // Top-right
    { row: moduleCount - 7, col: 0, size: 7 }, // Bottom-left
  ];
}

/**
 * Check if a module position is part of an eye
 */
export function isInEye(row: number, col: number, eyePositions: EyePosition[]): boolean {
  return eyePositions.some((eye) => {
    return (
      row >= eye.row &&
      row < eye.row + eye.size &&
      col >= eye.col &&
      col < eye.col + eye.size
    );
  });
}

/**
 * Check if a module is part of the outer frame of an eye
 */
export function isEyeOuter(row: number, col: number, eye: EyePosition): boolean {
  const isTopOrBottom = row === eye.row || row === eye.row + eye.size - 1;
  const isLeftOrRight = col === eye.col || col === eye.col + eye.size - 1;
  const isInRange =
    row >= eye.row &&
    row < eye.row + eye.size &&
    col >= eye.col &&
    col < eye.col + eye.size;

  return isInRange && (isTopOrBottom || isLeftOrRight);
}

/**
 * Check if a module is part of the inner square of an eye
 */
export function isEyeInner(row: number, col: number, eye: EyePosition): boolean {
  const innerStart = 2;
  const innerEnd = eye.size - 2;

  return (
    row >= eye.row + innerStart &&
    row < eye.row + innerEnd &&
    col >= eye.col + innerStart &&
    col < eye.col + innerEnd
  );
}

/**
 * Draw an eye pattern on canvas
 */
export function drawEye(
  ctx: CanvasRenderingContext2D,
  eye: EyePosition,
  moduleSize: number,
  margin: number,
  style: EyeStyleConfig,
  isDark: (row: number, col: number) => boolean,
  qrSize: number
): void {
  const startX = (eye.col + margin) * moduleSize;
  const startY = (eye.row + margin) * moduleSize;

  // Draw outer frame
  if (style.outer) {
    const outerStyle = style.outer.style || DotStyle.Square;
    const outerColor = style.outer.color || '#000000';

    if (style.outer.gradient) {
      const gradient = createCanvasGradient(ctx, style.outer.gradient, qrSize, qrSize);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = outerColor;
    }

    // Draw outer frame as connected modules
    for (let r = 0; r < eye.size; r++) {
      for (let c = 0; c < eye.size; c++) {
        if (isEyeOuter(eye.row + r, eye.col + c, eye) && isDark(eye.row + r, eye.col + c)) {
          const x = startX + c * moduleSize;
          const y = startY + r * moduleSize;
          drawDot(ctx, x, y, moduleSize, outerStyle);
        }
      }
    }
  }

  // Draw inner square
  if (style.inner) {
    const innerStyle = style.inner.style || DotStyle.Square;
    const innerColor = style.inner.color || '#000000';

    if (style.inner.gradient) {
      const gradient = createCanvasGradient(ctx, style.inner.gradient, qrSize, qrSize);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = innerColor;
    }

    // Draw inner square as connected modules
    for (let r = 0; r < eye.size; r++) {
      for (let c = 0; c < eye.size; c++) {
        if (isEyeInner(eye.row + r, eye.col + c, eye) && isDark(eye.row + r, eye.col + c)) {
          const x = startX + c * moduleSize;
          const y = startY + r * moduleSize;
          drawDot(ctx, x, y, moduleSize, innerStyle);
        }
      }
    }
  }
}

/**
 * Create SVG elements for an eye pattern
 */
export function createEyeSVG(
  svg: SVGSVGElement,
  eye: EyePosition,
  moduleSize: number,
  margin: number,
  style: EyeStyleConfig,
  isDark: (row: number, col: number) => boolean,
  qrSize: number
): SVGGElement {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const startX = (eye.col + margin) * moduleSize;
  const startY = (eye.row + margin) * moduleSize;

  // Draw outer frame
  if (style.outer) {
    const outerStyle = style.outer.style || DotStyle.Square;
    let outerFill: string;

    if (style.outer.gradient) {
      const gradientId = getGradientId('eye-outer-gradient');
      createSVGGradient(svg, style.outer.gradient, gradientId, qrSize, qrSize);
      outerFill = `url(#${gradientId})`;
    } else {
      outerFill = style.outer.color || '#000000';
    }

    for (let r = 0; r < eye.size; r++) {
      for (let c = 0; c < eye.size; c++) {
        if (isEyeOuter(eye.row + r, eye.col + c, eye) && isDark(eye.row + r, eye.col + c)) {
          const x = startX + c * moduleSize;
          const y = startY + r * moduleSize;
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', getDotSVGPath(x, y, moduleSize, outerStyle));
          path.setAttribute('fill', outerFill);
          group.appendChild(path);
        }
      }
    }
  }

  // Draw inner square
  if (style.inner) {
    const innerStyle = style.inner.style || DotStyle.Square;
    let innerFill: string;

    if (style.inner.gradient) {
      const gradientId = getGradientId('eye-inner-gradient');
      createSVGGradient(svg, style.inner.gradient, gradientId, qrSize, qrSize);
      innerFill = `url(#${gradientId})`;
    } else {
      innerFill = style.inner.color || '#000000';
    }

    for (let r = 0; r < eye.size; r++) {
      for (let c = 0; c < eye.size; c++) {
        if (isEyeInner(eye.row + r, eye.col + c, eye) && isDark(eye.row + r, eye.col + c)) {
          const x = startX + c * moduleSize;
          const y = startY + r * moduleSize;
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', getDotSVGPath(x, y, moduleSize, innerStyle));
          path.setAttribute('fill', innerFill);
          group.appendChild(path);
        }
      }
    }
  }

  return group;
}
