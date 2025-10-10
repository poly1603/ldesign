import { DotStyle, EyeStyleConfig, GradientConfig, MarkerShape, MarkerInner } from '../../types';
import { drawDot, getDotSVGPath } from './dots';
import { createCanvasGradient, createSVGGradient, getGradientId } from './gradients';
import {
  drawMarkerShape,
  drawMarkerInnerShape,
  getMarkerShapeSVGPath,
  getMarkerInnerShapeSVGPath,
} from './markers';

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
  const eyeSize = eye.size * moduleSize;

  // Check if using new Marker API
  if (style.markerShape !== undefined || style.markerInner !== undefined) {
    // Use new enhanced Marker API
    const markerShape = style.markerShape ?? MarkerShape.Square;
    const markerInner = style.markerInner ?? MarkerInner.Square;

    // Get colors from outer/inner config for backward compatibility
    const outerColor = style.outer?.color || '#000000';
    const innerColor = style.inner?.color || '#000000';

    // Draw outer frame with markerShape
    if (style.outer?.gradient) {
      const gradient = createCanvasGradient(ctx, style.outer.gradient, qrSize, qrSize);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = outerColor;
    }
    drawMarkerShape(ctx, startX, startY, eyeSize, markerShape);

    // Draw inner shape with markerInner
    if (style.inner?.gradient) {
      const gradient = createCanvasGradient(ctx, style.inner.gradient, qrSize, qrSize);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = innerColor;
    }

    // Auto mode: match inner shape to outer shape
    let actualInnerShape = markerInner;
    if (markerInner === MarkerInner.Auto) {
      actualInnerShape = getAutoInnerShape(markerShape);
    }

    drawMarkerInnerShape(ctx, startX, startY, eyeSize, actualInnerShape);
  } else {
    // Use legacy API for backward compatibility
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
}

/**
 * Auto-match inner shape to outer shape
 */
function getAutoInnerShape(outerShape: MarkerShape): MarkerInner {
  switch (outerShape) {
    case MarkerShape.Circle:
      return MarkerInner.Circle;
    case MarkerShape.RoundedSquare:
      return MarkerInner.Rounded;
    case MarkerShape.Octagon:
      return MarkerInner.Circle;
    case MarkerShape.Leaf:
      return MarkerInner.Petal;
    case MarkerShape.Frame:
      return MarkerInner.Diamond;
    case MarkerShape.Extra:
      return MarkerInner.Star;
    case MarkerShape.Square:
    default:
      return MarkerInner.Square;
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
  const eyeSize = eye.size * moduleSize;

  // Check if using new Marker API
  if (style.markerShape !== undefined || style.markerInner !== undefined) {
    // Use new enhanced Marker API
    const markerShape = style.markerShape ?? MarkerShape.Square;
    const markerInner = style.markerInner ?? MarkerInner.Square;

    // Get colors from outer/inner config for backward compatibility
    const outerColor = style.outer?.color || '#000000';
    const innerColor = style.inner?.color || '#000000';

    // Draw outer frame with markerShape
    let outerFill: string;
    if (style.outer?.gradient) {
      const gradientId = getGradientId('marker-outer-gradient');
      createSVGGradient(svg, style.outer.gradient, gradientId, qrSize, qrSize);
      outerFill = `url(#${gradientId})`;
    } else {
      outerFill = outerColor;
    }

    const outerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    outerPath.setAttribute('d', getMarkerShapeSVGPath(startX, startY, eyeSize, markerShape));
    outerPath.setAttribute('fill', outerFill);
    outerPath.setAttribute('fill-rule', 'evenodd');
    group.appendChild(outerPath);

    // Draw inner shape with markerInner
    let innerFill: string;
    if (style.inner?.gradient) {
      const gradientId = getGradientId('marker-inner-gradient');
      createSVGGradient(svg, style.inner.gradient, gradientId, qrSize, qrSize);
      innerFill = `url(#${gradientId})`;
    } else {
      innerFill = innerColor;
    }

    // Auto mode: match inner shape to outer shape
    let actualInnerShape = markerInner;
    if (markerInner === MarkerInner.Auto) {
      actualInnerShape = getAutoInnerShape(markerShape);
    }

    const innerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    innerPath.setAttribute('d', getMarkerInnerShapeSVGPath(startX, startY, eyeSize, actualInnerShape));
    innerPath.setAttribute('fill', innerFill);
    group.appendChild(innerPath);
  } else {
    // Use legacy API for backward compatibility
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
  }

  return group;
}
