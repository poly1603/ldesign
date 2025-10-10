import { GradientConfig } from '../../types';

/**
 * Create canvas gradient from configuration
 */
export function createCanvasGradient(
  ctx: CanvasRenderingContext2D,
  config: GradientConfig,
  width: number,
  height: number
): CanvasGradient {
  let gradient: CanvasGradient;

  if (config.type === 'linear') {
    const angle = (config.direction || 0) * (Math.PI / 180);
    const { x1, y1, x2, y2 } = getLinearGradientCoordinates(angle, width, height);
    gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  } else {
    // Radial gradient
    const centerX = config.position?.x ? config.position.x * width : width / 2;
    const centerY = config.position?.y ? config.position.y * height : height / 2;
    const radius = Math.max(width, height) / 2;
    gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  }

  // Add color stops
  const stops = config.stops || generateEvenStops(config.colors.length);
  config.colors.forEach((color, index) => {
    gradient.addColorStop(stops[index], color);
  });

  return gradient;
}

/**
 * Calculate linear gradient coordinates based on angle
 */
function getLinearGradientCoordinates(
  angle: number,
  width: number,
  height: number
): { x1: number; y1: number; x2: number; y2: number } {
  // Normalize angle to 0-2PI
  const normalizedAngle = angle % (2 * Math.PI);

  // Calculate endpoints
  const centerX = width / 2;
  const centerY = height / 2;
  const length = Math.sqrt(width * width + height * height) / 2;

  const x1 = centerX - Math.cos(normalizedAngle) * length;
  const y1 = centerY - Math.sin(normalizedAngle) * length;
  const x2 = centerX + Math.cos(normalizedAngle) * length;
  const y2 = centerY + Math.sin(normalizedAngle) * length;

  return { x1, y1, x2, y2 };
}

/**
 * Generate evenly distributed color stops
 */
function generateEvenStops(count: number): number[] {
  if (count <= 1) return [0];
  const stops: number[] = [];
  for (let i = 0; i < count; i++) {
    stops.push(i / (count - 1));
  }
  return stops;
}

/**
 * Create SVG gradient element
 */
export function createSVGGradient(
  svg: SVGSVGElement,
  config: GradientConfig,
  id: string,
  width: number,
  height: number
): SVGGradientElement {
  const defs = svg.querySelector('defs') || createDefs(svg);

  let gradient: SVGGradientElement;

  if (config.type === 'linear') {
    gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    const angle = (config.direction || 0) * (Math.PI / 180);
    const { x1, y1, x2, y2 } = getLinearGradientCoordinates(angle, 100, 100);

    gradient.setAttribute('x1', `${x1}%`);
    gradient.setAttribute('y1', `${y1}%`);
    gradient.setAttribute('x2', `${x2}%`);
    gradient.setAttribute('y2', `${y2}%`);
  } else {
    gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    const cx = config.position?.x || 0.5;
    const cy = config.position?.y || 0.5;

    gradient.setAttribute('cx', `${cx * 100}%`);
    gradient.setAttribute('cy', `${cy * 100}%`);
    gradient.setAttribute('r', '50%');
  }

  gradient.setAttribute('id', id);

  // Add color stops
  const stops = config.stops || generateEvenStops(config.colors.length);
  config.colors.forEach((color, index) => {
    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop.setAttribute('offset', `${stops[index] * 100}%`);
    stop.setAttribute('stop-color', color);
    gradient.appendChild(stop);
  });

  defs.appendChild(gradient);
  return gradient;
}

/**
 * Create or get defs element
 */
function createDefs(svg: SVGSVGElement): SVGDefsElement {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  svg.insertBefore(defs, svg.firstChild);
  return defs;
}

/**
 * Get gradient ID for SVG reference
 */
export function getGradientId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
