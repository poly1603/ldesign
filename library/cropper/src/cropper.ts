import {
  CROPPER_CANVAS,
  CROPPER_IMAGE,
  CROPPER_SELECTION,
  CROPPER_SHADE,
  getRootDocument,
  isElement,
  isString,
} from './utils';
import {
  CropperCanvas,
  CropperCrosshair,
  CropperGrid,
  CropperHandle,
  CropperImage,
  CropperSelection,
  CropperShade,
  CropperViewer,
} from './elements';
import DEFAULT_TEMPLATE from './template';

export interface CropperOptions {
  container?: Element | string;
  template?: string;
}

const REGEXP_ALLOWED_ELEMENTS = /^img|canvas$/;
const REGEXP_BLOCKED_TAGS = /<(\/?(?:script|style)[^>]*)>/gi;
const DEFAULT_OPTIONS: CropperOptions = {
  template: DEFAULT_TEMPLATE,
};

CropperCanvas.$define();
CropperCrosshair.$define();
CropperGrid.$define();
CropperHandle.$define();
CropperImage.$define();
CropperSelection.$define();
CropperShade.$define();
CropperViewer.$define();

export { DEFAULT_TEMPLATE };
export * from './utils';
export * from './elements';

export default class Cropper {
  static version = '1.0.0';

  element: HTMLImageElement | HTMLCanvasElement;
  options: CropperOptions = DEFAULT_OPTIONS;
  container: Element;
  /** Track created elements for cleanup */
  private createdElements: Element[] = [];

  constructor(
    element: HTMLImageElement | HTMLCanvasElement | string,
    options?: CropperOptions,
  ) {
    if (isString(element)) {
      element = document.querySelector(element) as HTMLImageElement;
    }

    if (!isElement(element) || !REGEXP_ALLOWED_ELEMENTS.test(element.localName)) {
      throw new Error('The first argument is required and must be an <img> or <canvas> element.');
    }

    this.element = element;
    options = { ...DEFAULT_OPTIONS, ...options };
    this.options = options;

    let { container } = options;

    if (container) {
      if (isString(container)) {
        container = getRootDocument(element)?.querySelector(container) as Element;
      }

      if (!isElement(container)) {
        throw new Error('The `container` option must be an element or a valid selector.');
      }
    }

    if (!isElement(container)) {
      if (element.parentElement) {
        container = element.parentElement;
      } else {
        container = element.ownerDocument.body;
      }
    }

    this.container = container;

    const tagName = element.localName;
    let src = '';

    if (tagName === 'img') {
      ({ src } = element as HTMLImageElement);
    } else if (tagName === 'canvas' && window.HTMLCanvasElement) {
      src = (element as HTMLCanvasElement).toDataURL();
    }

    const { template } = options;

    if (template && isString(template)) {
      const templateElement = document.createElement('template');
      const documentFragment = document.createDocumentFragment();

      templateElement.innerHTML = template.replace(REGEXP_BLOCKED_TAGS, '&lt;$1&gt;');
      documentFragment.appendChild(templateElement.content);

      // Record the elements that will be inserted for later cleanup
      this.createdElements = Array.from(
        documentFragment.querySelectorAll(
          [
            CROPPER_CANVAS,
            CROPPER_IMAGE,
            CROPPER_SELECTION,
            CROPPER_SHADE,
            'cropper-handle',
            'cropper-grid',
            'cropper-crosshair',
            'cropper-viewer',
          ].join(', '),
        ),
      );

      Array.from(documentFragment.querySelectorAll(CROPPER_IMAGE)).forEach((image) => {
        image.setAttribute('src', src);
        image.setAttribute('alt', (element as HTMLImageElement).alt || 'The image to crop');

        // Inherit additional attributes from HTMLImageElement
        if (tagName === 'img') {
          [
            'crossorigin',
            'decoding',
            'elementtiming',
            'fetchpriority',
            'loading',
            'referrerpolicy',
            'sizes',
            'srcset',
          ].forEach((attribute) => {
            if ((element as HTMLImageElement).hasAttribute(attribute)) {
              image.setAttribute(attribute, (element as HTMLImageElement).getAttribute(attribute) || '');
            }
          });
        }
      });

      if (element.parentElement) {
        element.style.display = 'none';
        container.insertBefore(documentFragment, element.nextSibling);
      } else {
        container.appendChild(documentFragment);
      }
    }
  }

  getCropperCanvas(): CropperCanvas | null {
    return this.container.querySelector(CROPPER_CANVAS);
  }

  getCropperImage(): CropperImage | null {
    return this.container.querySelector(CROPPER_IMAGE);
  }

  getCropperSelection(): CropperSelection | null {
    return this.container.querySelector(CROPPER_SELECTION);
  }

  getCropperSelections(): NodeListOf<CropperSelection> | null {
    return this.container.querySelectorAll(CROPPER_SELECTION);
  }

  // 简化的 API 方法
  getData() {
    const selection = this.getCropperSelection();
    return selection ? {
      x: selection.x,
      y: selection.y,
      width: selection.width,
      height: selection.height,
    } : null;
  }

  setData(data: { x?: number; y?: number; width?: number; height?: number }) {
    const selection = this.getCropperSelection();
    if (selection) {
      if (data.x !== undefined) selection.x = data.x;
      if (data.y !== undefined) selection.y = data.y;
      if (data.width !== undefined) selection.width = data.width;
      if (data.height !== undefined) selection.height = data.height;
      selection.$render();
    }
    return this;
  }

  /**
   * Get cropped canvas respecting image transforms (rotate/scale/move)
   * Options: { width?: number; height?: number; fillColor?: string; imageSmoothingEnabled?: boolean; imageSmoothingQuality?: CanvasImageSmoothingQuality }
   */
  async getCroppedCanvas(options?: {
    width?: number;
    height?: number;
    fillColor?: string;
    imageSmoothingEnabled?: boolean;
    imageSmoothingQuality?: ImageSmoothingQuality;
  }): Promise<HTMLCanvasElement> {
    const selection = this.getCropperSelection();
    const canvasEl = this.getCropperCanvas();

    if (!selection || !canvasEl) {
      return Promise.reject(new Error('No selection'));
    }

    // 1) Render the transformed image into an offscreen canvas matching the canvas element size
    const offscreen = await canvasEl.$toCanvas();

    // 2) Crop the selection region from the offscreen canvas
    const sx = Math.max(0, selection.x);
    const sy = Math.max(0, selection.y);
    const sWidth = Math.max(0, selection.width);
    const sHeight = Math.max(0, selection.height);

    // Determine output size
    let outWidth = options?.width ?? sWidth;
    let outHeight = options?.height ?? sHeight;

    // Guard against zero sizes
    outWidth = Math.max(0, Math.round(outWidth));
    outHeight = Math.max(0, Math.round(outHeight));

    const result = document.createElement('canvas');
    result.width = outWidth;
    result.height = outHeight;

    const ctx = result.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to get canvas 2D context');
    }

    if (typeof options?.imageSmoothingEnabled === 'boolean') {
      ctx.imageSmoothingEnabled = options.imageSmoothingEnabled;
    }
    if (options?.imageSmoothingQuality) {
      ctx.imageSmoothingQuality = options.imageSmoothingQuality;
    }

    // Optional background fill (useful for JPEG export)
    if (options?.fillColor) {
      ctx.save();
      ctx.fillStyle = options.fillColor;
      ctx.fillRect(0, 0, outWidth, outHeight);
      ctx.restore();
    }

    ctx.drawImage(offscreen, sx, sy, sWidth, sHeight, 0, 0, outWidth, outHeight);

    return result;
  }

  reset() {
    const selection = this.getCropperSelection();
    selection?.$reset?.();
    return this;
  }

  clear() {
    const selection = this.getCropperSelection();
    selection?.$clear?.();
    return this;
  }

  // ===== Additional APIs for better parity with Cropper.js =====

  /** Destroy the cropper: remove created elements and restore original element */
  destroy(): void {
    // Remove created custom elements
    this.createdElements.forEach((el) => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    this.createdElements = [];

    // Restore the original element
    if (this.element) {
      (this.element as HTMLElement).style.display = '';
    }
  }

  /** Replace the image source */
  replace(src: string): this {
    const image = this.getCropperImage();
    if (image) {
      (image as any).src = src;
    }
    // Also reflect to original element if it is an <img>
    if (this.element && this.element.localName === 'img') {
      (this.element as HTMLImageElement).src = src;
    }
    return this;
  }

  /** Set aspect ratio of the selection */
  setAspectRatio(ratio: number): this {
    const selection = this.getCropperSelection();
    if (selection) {
      (selection as any).aspectRatio = ratio;
    }
    return this;
  }

  /** Move the image by (x, y) */
  move(x: number, y?: number): this {
    const img = this.getCropperImage();
    (img as any)?.$move?.(x, y as any);
    return this;
  }

  /** Move the image to (x, y) */
  moveTo(x: number, y?: number): this {
    const img = this.getCropperImage();
    (img as any)?.$moveTo?.(x, y as any);
    return this;
  }

  /** Rotate the image by angle (deg or rad string) around optional (x,y) */
  rotate(angle: number | string, x?: number, y?: number): this {
    const img = this.getCropperImage();
    (img as any)?.$rotate?.(angle, x as any, y as any);
    return this;
  }

  /** Zoom the image by scale at optional (x, y) */
  zoom(scale: number, x?: number, y?: number): this {
    const img = this.getCropperImage();
    (img as any)?.$zoom?.(scale, x as any, y as any);
    return this;
  }

  /** Scale the image (x, y) */
  scale(x: number, y?: number): this {
    const img = this.getCropperImage();
    (img as any)?.$scale?.(x, y as any);
    return this;
  }
}
