import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@panorama-viewer/lit';
import type { PanoramaViewerElement } from '@panorama-viewer/lit';
import type { Hotspot, ViewLimits } from '@panorama-viewer/core';

const images = [
  'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg',
  'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg',
];

@customElement('app-component')
export class AppComponent extends LitElement {
  static override styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }

    .app {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    h1 {
      text-align: center;
      margin-bottom: 20px;
      font-size: 2rem;
    }

    h3 {
      margin: 0 0 10px 0;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .controls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .control-section {
      background: rgba(0, 0, 0, 0.3);
      padding: 15px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    button {
      width: 100%;
      padding: 10px 15px;
      margin-bottom: 8px;
      font-size: 13px;
      border: none;
      border-radius: 4px;
      background-color: #f7df1e;
      color: #000;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
    }

    button:last-child {
      margin-bottom: 0;
    }

    button:hover {
      background-color: #d4bd00;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    button:active {
      transform: translateY(0);
    }

    .info-text {
      display: block;
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.85rem;
      margin-top: 5px;
    }

    .progress-container {
      margin-bottom: 20px;
      text-align: center;
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 5px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #f7df1e, #d4bd00);
      transition: width 0.3s;
    }

    .progress-text {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .info-panel {
      margin-top: 20px;
      padding: 20px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    .info-row {
      margin-bottom: 15px;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .info-row strong {
      display: block;
      margin-bottom: 8px;
      color: #f7df1e;
    }

    .info-row ul {
      margin: 0;
      padding-left: 20px;
    }

    .info-row li {
      margin-bottom: 5px;
      line-height: 1.6;
    }
  `;

  @state()
  private autoRotate = false;

  @state()
  private showMiniMap = true;

  @state()
  private isFullscreen = false;

  @state()
  private viewLimits: ViewLimits | null = null;

  @state()
  private loadingProgress = 0;

  @state()
  private hotspots: Hotspot[] = [];

  @state()
  private lastHotspotClick: Hotspot | null = null;

  @state()
  private currentImageIndex = 0;

  private hotspotCounter = 0;

  private get viewerElement(): PanoramaViewerElement | null {
    return this.shadowRoot?.querySelector('panorama-viewer') as PanoramaViewerElement | null;
  }

  private toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
  }

  private reset() {
    this.viewerElement?.reset();
  }

  private async enableGyroscope() {
    const success = await this.viewerElement?.enableGyroscope();
    if (success) {
      alert('✅ Gyroscope enabled!');
    } else {
      alert('❌ Gyroscope not available or permission denied');
    }
  }

  private async toggleFullscreen() {
    if (this.isFullscreen) {
      this.viewerElement?.exitFullscreen();
      this.isFullscreen = false;
    } else {
      await this.viewerElement?.enterFullscreen();
      this.isFullscreen = true;
    }
  }

  private toggleMiniMapVisibility() {
    this.showMiniMap = !this.showMiniMap;
  }

  private takeScreenshot() {
    const dataURL = this.viewerElement?.screenshot(1920, 1080);
    if (dataURL) {
      const link = document.createElement('a');
      link.download = 'panorama-screenshot.png';
      link.href = dataURL;
      link.click();
      alert('📸 Screenshot captured and downloaded!');
    }
  }

  private addDemoHotspot() {
    const newHotspot: Hotspot = {
      id: `hotspot-${++this.hotspotCounter}`,
      position: {
        theta: Math.random() * Math.PI * 2,
        phi: Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.5,
      },
      label: `📍 #${this.hotspotCounter}`,
      data: { name: `Point of Interest ${this.hotspotCounter}` },
    };
    
    this.viewerElement?.addHotspot(newHotspot);
    this.hotspots = this.viewerElement?.getHotspots() || [];
  }

  private removeAllHotspots() {
    this.hotspots.forEach(h => this.viewerElement?.removeHotspot(h.id));
    this.hotspots = [];
    this.hotspotCounter = 0;
  }

  private setHorizontalLimit() {
    this.viewLimits = {
      minTheta: -Math.PI / 4,
      maxTheta: Math.PI / 4,
    };
    alert('↔️ Horizontal rotation limited to ±45°');
  }

  private setVerticalLimit() {
    this.viewLimits = {
      minPhi: Math.PI / 3,
      maxPhi: (2 * Math.PI) / 3,
    };
    alert('↕️ Vertical rotation limited');
  }

  private clearLimits() {
    this.viewLimits = null;
    alert('🔓 All rotation limits cleared');
  }

  private changeImage(index: number) {
    this.loadingProgress = 0;
    this.currentImageIndex = index;
  }

  private handleReady() {
    console.log('✅ Viewer ready!');
  }

  private handleError(event: CustomEvent) {
    console.error('❌ Viewer error:', event.detail.error);
    alert(`Error: ${event.detail.error.message}`);
  }

  private handleProgress(event: CustomEvent) {
    this.loadingProgress = event.detail.progress;
    if (this.loadingProgress >= 100) {
      setTimeout(() => {
        this.loadingProgress = 0;
      }, 500);
    }
  }

  private handleHotspotClick(event: CustomEvent) {
    this.lastHotspotClick = event.detail.hotspot;
    alert(`🎯 Clicked: ${event.detail.hotspot.label}\nData: ${JSON.stringify(event.detail.hotspot.data)}`);
  }

  override render() {
    return html`
      <div class="app">
        <h1>Lit Panorama Viewer Demo - Enhanced</h1>
        
        <div class="controls-grid">
          <div class="control-section">
            <h3>Basic Controls</h3>
            <button @click=${this.toggleAutoRotate}>
              ${this.autoRotate ? '⏸️ Stop' : '▶️ Start'} Rotation
            </button>
            <button @click=${this.reset}>🔄 Reset View</button>
            <button @click=${this.enableGyroscope}>📱 Enable Gyroscope</button>
          </div>

          <div class="control-section">
            <h3>Advanced Features</h3>
            <button @click=${this.toggleFullscreen}>
              ${this.isFullscreen ? '⬜ Exit' : '⛶ Enter'} Fullscreen
            </button>
            <button @click=${this.toggleMiniMapVisibility}>
              ${this.showMiniMap ? '🗺️ Hide' : '🗺️ Show'} Mini Map
            </button>
            <button @click=${this.takeScreenshot}>📷 Screenshot</button>
          </div>

          <div class="control-section">
            <h3>Hotspots</h3>
            <button @click=${this.addDemoHotspot}>📍 Add Hotspot</button>
            <button @click=${this.removeAllHotspots}>🗑️ Remove All</button>
            <span class="info-text">${this.hotspots.length} hotspots</span>
          </div>

          <div class="control-section">
            <h3>View Limits</h3>
            <button @click=${this.setHorizontalLimit}>↔️ Limit Horizontal</button>
            <button @click=${this.setVerticalLimit}>↕️ Limit Vertical</button>
            <button @click=${this.clearLimits}>🔓 Clear Limits</button>
          </div>

          <div class="control-section">
            <h3>Images</h3>
            <button @click=${() => this.changeImage(0)}>🏔️ Mountain</button>
            <button @click=${() => this.changeImage(1)}>🌃 Night</button>
          </div>
        </div>

        ${this.loadingProgress > 0 && this.loadingProgress < 100 ? html`
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${this.loadingProgress}%"></div>
            </div>
            <span class="progress-text">Loading: ${Math.round(this.loadingProgress)}%</span>
          </div>
        ` : ''}

        <panorama-viewer
          image=${images[this.currentImageIndex]}
          ?auto-rotate=${this.autoRotate}
          ?show-mini-map=${this.showMiniMap}
          .viewLimits=${this.viewLimits}
          fov="75"
          width="100%"
          height="600px"
          @ready=${this.handleReady}
          @error=${this.handleError}
          @progress=${this.handleProgress}
          @hotspotclick=${this.handleHotspotClick}
        ></panorama-viewer>

        <div class="info-panel">
          <div class="info-row">
            <strong>Controls:</strong>
            <ul>
              <li><strong>Mouse:</strong> Click + drag to rotate, wheel to zoom</li>
              <li><strong>Keyboard:</strong> Arrow keys to rotate, +/- to zoom</li>
              <li><strong>Touch:</strong> Single finger to rotate, pinch to zoom</li>
              <li><strong>Mobile:</strong> Device orientation (with permission)</li>
            </ul>
          </div>
          
          ${this.lastHotspotClick ? html`
            <div class="info-row">
              <strong>Last Hotspot Clicked:</strong> ${this.lastHotspotClick.label}
            </div>
          ` : ''}

          <div class="info-row">
            <strong>New Features:</strong>
            <ul>
              <li>✅ Keyboard controls with arrow keys</li>
              <li>✅ Mini-map with compass orientation</li>
              <li>✅ Interactive hotspots with custom markers</li>
              <li>✅ Full-screen mode support</li>
              <li>✅ Screenshot capture</li>
              <li>✅ View angle restrictions</li>
              <li>✅ Smooth image transitions</li>
              <li>✅ Loading progress indicator</li>
              <li>✅ Performance optimizations</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-component': AppComponent;
  }
}
