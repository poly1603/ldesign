import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PanoramaViewer as CoreViewer } from '@panorama-viewer/core';
import type { ViewerOptions, Hotspot, ViewLimits, CubemapImages } from '@panorama-viewer/core';

/**
 * Panorama Viewer Web Component
 * 
 * @element panorama-viewer
 * 
 * @attr {string} image - URL or path to the panorama image
 * @attr {string} format - Image format: 'equirectangular' or 'cubemap'
 * @attr {number} fov - Field of view in degrees (default: 75)
 * @attr {number} min-fov - Minimum field of view for zoom (default: 30)
 * @attr {number} max-fov - Maximum field of view for zoom (default: 100)
 * @attr {boolean} auto-rotate - Enable auto rotation (default: false)
 * @attr {number} auto-rotate-speed - Auto rotation speed (default: 0.5)
 * @attr {boolean} gyroscope - Enable gyroscope controls on mobile (default: true)
 * @attr {boolean} keyboard-controls - Enable keyboard controls (default: true)
 * @attr {boolean} render-on-demand - Enable render on demand (default: true)
 * @attr {boolean} show-mini-map - Show mini map (default: true)
 * @attr {string} width - Container width (default: 100%)
 * @attr {string} height - Container height (default: 500px)
 * 
 * @fires ready - Fired when the viewer is initialized
 * @fires error - Fired when an error occurs
 * @fires progress - Fired during image loading
 * @fires hotspotclick - Fired when a hotspot is clicked
 */
@customElement('panorama-viewer')
export class PanoramaViewerElement extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: relative;
    }

    .container {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  `;

  @property({ type: String })
  image = '';

  @property({ type: String })
  format: 'equirectangular' | 'cubemap' = 'equirectangular';

  @property({ type: Number })
  fov = 75;

  @property({ type: Number, attribute: 'min-fov' })
  minFov = 30;

  @property({ type: Number, attribute: 'max-fov' })
  maxFov = 100;

  @property({ type: Boolean, attribute: 'auto-rotate' })
  autoRotate = false;

  @property({ type: Number, attribute: 'auto-rotate-speed' })
  autoRotateSpeed = 0.5;

  @property({ type: Boolean })
  gyroscope = true;

  @property({ type: Boolean, attribute: 'keyboard-controls' })
  keyboardControls = true;

  @property({ type: Boolean, attribute: 'render-on-demand' })
  renderOnDemand = true;

  @property({ type: Boolean, attribute: 'show-mini-map' })
  showMiniMap = true;

  @property({ type: String })
  width = '100%';

  @property({ type: String })
  height = '500px';

  @property({ type: Object, attribute: false })
  viewLimits: ViewLimits | null = null;

  private viewer: CoreViewer | null = null;
  private containerElement: HTMLElement | null = null;

  override render() {
    return html`
      <div class="container" style="width: ${this.width}; height: ${this.height}">
      </div>
    `;
  }

  override firstUpdated() {
    this.containerElement = this.shadowRoot?.querySelector('.container') as HTMLElement;
    
    if (this.containerElement && this.image) {
      this.initializeViewer();
    }
  }

  private initializeViewer() {
    if (!this.containerElement || !this.image) return;

    try {
      const options: ViewerOptions = {
        container: this.containerElement,
        image: this.image,
        format: this.format,
        fov: this.fov,
        minFov: this.minFov,
        maxFov: this.maxFov,
        autoRotate: this.autoRotate,
        autoRotateSpeed: this.autoRotateSpeed,
        gyroscope: this.gyroscope,
        viewLimits: this.viewLimits,
        keyboardControls: this.keyboardControls,
        renderOnDemand: this.renderOnDemand,
        onProgress: (progress: number) => {
          this.dispatchEvent(new CustomEvent('progress', { detail: { progress } }));
        },
      };

      this.viewer = new CoreViewer(options);

      // Setup hotspot click listener
      this.containerElement.addEventListener('hotspotclick', ((e: CustomEvent) => {
        this.dispatchEvent(new CustomEvent('hotspotclick', {
          detail: { hotspot: e.detail.hotspot },
        }));
      }) as EventListener);

      // Set initial minimap visibility
      if (!this.showMiniMap && this.viewer) {
        this.viewer.hideMiniMap();
      }

      this.dispatchEvent(new CustomEvent('ready'));
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('error', {
          detail: { error },
        })
      );
    }
  }

  override updated(changedProperties: Map<string, any>) {
    // Handle image changes
    if (changedProperties.has('image') && this.viewer && this.image) {
      this.viewer.loadImage(this.image, true).catch((error) => {
        this.dispatchEvent(
          new CustomEvent('error', {
            detail: { error },
          })
        );
      });
    }

    // Handle autoRotate changes
    if (changedProperties.has('autoRotate') && this.viewer) {
      if (this.autoRotate) {
        this.viewer.enableAutoRotate();
      } else {
        this.viewer.disableAutoRotate();
      }
    }

    // Handle viewLimits changes
    if (changedProperties.has('viewLimits') && this.viewer) {
      this.viewer.setViewLimits(this.viewLimits);
    }

    // Handle minimap visibility
    if (changedProperties.has('showMiniMap') && this.viewer) {
      if (this.showMiniMap) {
        this.viewer.showMiniMap();
      } else {
        this.viewer.hideMiniMap();
      }
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.viewer) {
      this.viewer.dispose();
      this.viewer = null;
    }
  }

  /**
   * Load a new panorama image
   */
  public async loadImage(url: string | CubemapImages, transition = false): Promise<void> {
    if (this.viewer) {
      await this.viewer.loadImage(url, transition);
    }
  }

  /**
   * Reset camera to initial position
   */
  public reset(): void {
    if (this.viewer) {
      this.viewer.reset();
    }
  }

  /**
   * Enable auto rotation
   */
  public enableAutoRotate(): void {
    if (this.viewer) {
      this.viewer.enableAutoRotate();
    }
  }

  /**
   * Disable auto rotation
   */
  public disableAutoRotate(): void {
    if (this.viewer) {
      this.viewer.disableAutoRotate();
    }
  }

  /**
   * Enable gyroscope controls (mobile only)
   */
  public async enableGyroscope(): Promise<boolean> {
    if (this.viewer) {
      return await this.viewer.enableGyroscope();
    }
    return false;
  }

  /**
   * Disable gyroscope controls
   */
  public disableGyroscope(): void {
    if (this.viewer) {
      this.viewer.disableGyroscope();
    }
  }

  /**
   * Get the current camera rotation
   */
  public getRotation(): { x: number; y: number; z: number } {
    if (this.viewer) {
      return this.viewer.getRotation();
    }
    return { x: 0, y: 0, z: 0 };
  }

  /**
   * Set the camera rotation
   */
  public setRotation(x: number, y: number, z: number): void {
    if (this.viewer) {
      this.viewer.setRotation(x, y, z);
    }
  }

  /**
   * Add a hotspot marker
   */
  public addHotspot(hotspot: Hotspot): void {
    if (this.viewer) {
      this.viewer.addHotspot(hotspot);
    }
  }

  /**
   * Remove a hotspot by ID
   */
  public removeHotspot(id: string): void {
    if (this.viewer) {
      this.viewer.removeHotspot(id);
    }
  }

  /**
   * Get all hotspots
   */
  public getHotspots(): Hotspot[] {
    if (this.viewer) {
      return this.viewer.getHotspots();
    }
    return [];
  }

  /**
   * Enter fullscreen mode
   */
  public async enterFullscreen(): Promise<void> {
    if (this.viewer) {
      await this.viewer.enterFullscreen();
    }
  }

  /**
   * Exit fullscreen mode
   */
  public exitFullscreen(): void {
    if (this.viewer) {
      this.viewer.exitFullscreen();
    }
  }

  /**
   * Check if in fullscreen
   */
  public isFullscreen(): boolean {
    if (this.viewer) {
      return this.viewer.isFullscreen();
    }
    return false;
  }

  /**
   * Take a screenshot
   */
  public screenshot(width?: number, height?: number): string {
    if (this.viewer) {
      return this.viewer.screenshot(width, height);
    }
    return '';
  }

  /**
   * Set view limits
   */
  public setViewLimits(limits: ViewLimits | null): void {
    if (this.viewer) {
      this.viewer.setViewLimits(limits);
    }
  }

  /**
   * Show mini map
   */
  public showMiniMap(): void {
    if (this.viewer) {
      this.viewer.showMiniMap();
    }
  }

  /**
   * Hide mini map
   */
  public hideMiniMap(): void {
    if (this.viewer) {
      this.viewer.hideMiniMap();
    }
  }

  /**
   * Toggle mini map visibility
   */
  public toggleMiniMap(): void {
    if (this.viewer) {
      this.viewer.toggleMiniMap();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'panorama-viewer': PanoramaViewerElement;
  }
}
