/**
 * MapControls - 地图控制器组件
 * 提供缩放、定位、重置等控制按钮
 */

export interface MapControlsOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showZoom?: boolean;
  showCompass?: boolean;
  showHome?: boolean;
  showFullscreen?: boolean;
  showLocation?: boolean;
  zoomDelta?: number;
  style?: Partial<CSSStyleDeclaration>;
}

export class MapControls {
  private container: HTMLElement;
  private controlsElement: HTMLDivElement | null = null;
  private options: MapControlsOptions;
  private onZoomIn?: () => void;
  private onZoomOut?: () => void;
  private onReset?: () => void;
  private onFullscreen?: () => void;
  private onLocation?: () => void;

  constructor(
    container: HTMLElement,
    options: MapControlsOptions = {},
    callbacks: {
      onZoomIn?: () => void;
      onZoomOut?: () => void;
      onReset?: () => void;
      onFullscreen?: () => void;
      onLocation?: () => void;
    } = {}
  ) {
    this.container = container;
    this.options = {
      position: 'top-right',
      showZoom: true,
      showCompass: false,
      showHome: true,
      showFullscreen: true,
      showLocation: false,
      zoomDelta: 1,
      ...options
    };

    this.onZoomIn = callbacks.onZoomIn;
    this.onZoomOut = callbacks.onZoomOut;
    this.onReset = callbacks.onReset;
    this.onFullscreen = callbacks.onFullscreen;
    this.onLocation = callbacks.onLocation;

    this.create();
  }

  private create(): void {
    this.controlsElement = document.createElement('div');
    this.controlsElement.className = 'map-controls';

    this.applyStyles(this.controlsElement, {
      position: 'absolute',
      zIndex: '1000',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '10px',
      ...this.getPositionStyles(),
      ...this.options.style
    });

    // 添加控制按钮
    if (this.options.showZoom) {
      this.addZoomControls();
    }

    if (this.options.showHome) {
      this.addButton('🏠', '重置视图', () => this.onReset?.());
    }

    if (this.options.showFullscreen) {
      this.addButton('⛶', '全屏', () => this.toggleFullscreen());
    }

    if (this.options.showLocation) {
      this.addButton('📍', '当前位置', () => this.onLocation?.());
    }

    this.container.appendChild(this.controlsElement);
  }

  private addZoomControls(): void {
    const zoomContainer = document.createElement('div');
    this.applyStyles(zoomContainer, {
      display: 'flex',
      flexDirection: 'column',
      gap: '1px',
      backgroundColor: 'white',
      borderRadius: '4px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    });

    // 放大按钮
    const zoomInBtn = this.createControlButton('+', '放大');
    zoomInBtn.addEventListener('click', () => this.onZoomIn?.());
    zoomContainer.appendChild(zoomInBtn);

    // 分隔线
    const separator = document.createElement('div');
    this.applyStyles(separator, {
      height: '1px',
      backgroundColor: '#e0e0e0'
    });
    zoomContainer.appendChild(separator);

    // 缩小按钮
    const zoomOutBtn = this.createControlButton('-', '缩小');
    zoomOutBtn.addEventListener('click', () => this.onZoomOut?.());
    zoomContainer.appendChild(zoomOutBtn);

    this.controlsElement?.appendChild(zoomContainer);
  }

  private addButton(icon: string, title: string, onClick: () => void): void {
    const button = this.createControlButton(icon, title);
    button.addEventListener('click', onClick);
    this.controlsElement?.appendChild(button);
  }

  private createControlButton(content: string, title: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = content;
    button.title = title;

    this.applyStyles(button, {
      width: '36px',
      height: '36px',
      border: 'none',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#f0f0f0';
      button.style.transform = 'scale(1.05)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'white';
      button.style.transform = 'scale(1)';
    });

    return button;
  }

  private getPositionStyles(): Partial<CSSStyleDeclaration> {
    const margin = '16px';
    switch (this.options.position) {
      case 'top-left':
        return { top: margin, left: margin };
      case 'top-right':
        return { top: margin, right: margin };
      case 'bottom-left':
        return { bottom: margin, left: margin };
      case 'bottom-right':
        return { bottom: margin, right: margin };
      default:
        return { top: margin, right: margin };
    }
  }

  private applyStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.assign(element.style, styles);
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    this.onFullscreen?.();
  }

  show(): void {
    if (this.controlsElement) {
      this.controlsElement.style.display = 'flex';
    }
  }

  hide(): void {
    if (this.controlsElement) {
      this.controlsElement.style.display = 'none';
    }
  }

  destroy(): void {
    if (this.controlsElement && this.controlsElement.parentNode) {
      this.controlsElement.parentNode.removeChild(this.controlsElement);
      this.controlsElement = null;
    }
  }
}





