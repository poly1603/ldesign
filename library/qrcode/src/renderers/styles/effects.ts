import { ShadowConfig, StrokeConfig } from '../../types';

/**
 * Apply shadow effect to canvas context
 */
export function applyShadow(ctx: CanvasRenderingContext2D, shadow: ShadowConfig): void {
  ctx.shadowBlur = shadow.blur;
  ctx.shadowColor = shadow.color;
  ctx.shadowOffsetX = shadow.offsetX || 0;
  ctx.shadowOffsetY = shadow.offsetY || 0;
}

/**
 * Clear shadow effect from canvas context
 */
export function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/**
 * Apply stroke to a path
 */
export function applyStroke(ctx: CanvasRenderingContext2D, stroke: StrokeConfig): void {
  ctx.lineWidth = stroke.width;
  ctx.strokeStyle = stroke.color;
  ctx.stroke();
}

/**
 * Draw background image on canvas
 */
export async function drawBackgroundImage(
  ctx: CanvasRenderingContext2D,
  imageSrc: string,
  width: number,
  height: number,
  opacity: number = 0.1
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();
      resolve();
    };

    img.onerror = () => {
      reject(new Error(`Failed to load background image: ${imageSrc}`));
    };

    img.src = imageSrc;
  });
}

/**
 * Create SVG filter for shadow effect
 */
export function createSVGShadowFilter(
  svg: SVGSVGElement,
  shadow: ShadowConfig,
  filterId: string
): SVGFilterElement {
  const defs = svg.querySelector('defs') || createDefs(svg);

  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filter.setAttribute('id', filterId);
  filter.setAttribute('x', '-50%');
  filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%');
  filter.setAttribute('height', '200%');

  // Drop shadow
  const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
  feGaussianBlur.setAttribute('in', 'SourceAlpha');
  feGaussianBlur.setAttribute('stdDeviation', String(shadow.blur));
  filter.appendChild(feGaussianBlur);

  const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
  feOffset.setAttribute('dx', String(shadow.offsetX || 0));
  feOffset.setAttribute('dy', String(shadow.offsetY || 0));
  feOffset.setAttribute('result', 'offsetblur');
  filter.appendChild(feOffset);

  const feFlood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
  feFlood.setAttribute('flood-color', shadow.color);
  filter.appendChild(feFlood);

  const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
  feComposite.setAttribute('in2', 'offsetblur');
  feComposite.setAttribute('operator', 'in');
  filter.appendChild(feComposite);

  const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');

  const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  feMerge.appendChild(feMergeNode1);

  const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  feMergeNode2.setAttribute('in', 'SourceGraphic');
  feMerge.appendChild(feMergeNode2);

  filter.appendChild(feMerge);
  defs.appendChild(filter);

  return filter;
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
 * Create SVG pattern for background image
 */
export function createSVGBackgroundPattern(
  svg: SVGSVGElement,
  imageSrc: string,
  patternId: string,
  width: number,
  height: number,
  opacity: number = 0.1
): SVGPatternElement {
  const defs = svg.querySelector('defs') || createDefs(svg);

  const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
  pattern.setAttribute('id', patternId);
  pattern.setAttribute('x', '0');
  pattern.setAttribute('y', '0');
  pattern.setAttribute('width', '100%');
  pattern.setAttribute('height', '100%');

  const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  image.setAttribute('href', imageSrc);
  image.setAttribute('x', '0');
  image.setAttribute('y', '0');
  image.setAttribute('width', String(width));
  image.setAttribute('height', String(height));
  image.setAttribute('opacity', String(opacity));

  pattern.appendChild(image);
  defs.appendChild(pattern);

  return pattern;
}
