/**
 * LayerPanel - 图层管理面板
 * 显示和控制地图图层的显示/隐藏
 */

export interface LayerInfo {
  id: string;
  name: string;
  visible: boolean;
  type: string;
}

export interface LayerPanelOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  maxHeight?: number;
  onToggleLayer?: (layerId: string, visible: boolean) => void;
}

export class LayerPanel {
  private container: HTMLElement;
  private panelElement: HTMLDivElement | null = null;
  private options: LayerPanelOptions;
  private layers: Map<string, LayerInfo> = new Map();

  constructor(container: HTMLElement, options: LayerPanelOptions = {}) {
    this.container = container;
    this.options = {
      position: 'top-left',
      maxHeight: 300,
      ...options
    };

    this.create();
  }

  private create(): void {
    this.panelElement = document.createElement('div');
    this.panelElement.className = 'layer-panel';

    Object.assign(this.panelElement.style, {
      position: 'absolute',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '12px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: '999',
      minWidth: '200px',
      maxHeight: `${this.options.maxHeight}px`,
      overflowY: 'auto',
      fontSize: '13px',
      ...this.getPositionStyles()
    });

    this.renderContent();
    this.container.appendChild(this.panelElement);
  }

  private renderContent(): void {
    if (!this.panelElement) return;

    const title = document.createElement('div');
    title.textContent = '图层管理';
    Object.assign(title.style, {
      fontWeight: 'bold',
      marginBottom: '10px',
      paddingBottom: '8px',
      borderBottom: '2px solid #e0e0e0',
      color: '#333'
    });

    this.panelElement.innerHTML = '';
    this.panelElement.appendChild(title);

    this.layers.forEach((layerInfo) => {
      const item = this.createLayerItem(layerInfo);
      this.panelElement?.appendChild(item);
    });

    if (this.layers.size === 0) {
      const empty = document.createElement('div');
      empty.textContent = '暂无图层';
      empty.style.color = '#999';
      empty.style.fontSize = '12px';
      this.panelElement.appendChild(empty);
    }
  }

  private createLayerItem(layerInfo: LayerInfo): HTMLDivElement {
    const item = document.createElement('div');
    Object.assign(item.style, {
      display: 'flex',
      alignItems: 'center',
      padding: '6px',
      marginBottom: '4px',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background 0.2s'
    });

    item.addEventListener('mouseenter', () => {
      item.style.backgroundColor = '#f0f0f0';
    });

    item.addEventListener('mouseleave', () => {
      item.style.backgroundColor = 'transparent';
    });

    // 复选框
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = layerInfo.visible;
    checkbox.style.marginRight = '8px';
    checkbox.style.cursor = 'pointer';

    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      layerInfo.visible = checkbox.checked;
      this.options.onToggleLayer?.(layerInfo.id, checkbox.checked);
    });

    // 名称
    const label = document.createElement('span');
    label.textContent = layerInfo.name;
    label.style.flex = '1';
    label.style.color = '#333';

    // 类型标签
    const typeLabel = document.createElement('span');
    typeLabel.textContent = layerInfo.type;
    Object.assign(typeLabel.style, {
      fontSize: '11px',
      color: '#666',
      backgroundColor: '#f0f0f0',
      padding: '2px 6px',
      borderRadius: '3px'
    });

    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(typeLabel);

    item.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      layerInfo.visible = checkbox.checked;
      this.options.onToggleLayer?.(layerInfo.id, checkbox.checked);
    });

    return item;
  }

  addLayer(layerId: string, name: string, type: string = 'geojson', visible: boolean = true): void {
    this.layers.set(layerId, { id: layerId, name, visible, type });
    this.renderContent();
  }

  removeLayer(layerId: string): void {
    this.layers.delete(layerId);
    this.renderContent();
  }

  updateLayer(layerId: string, updates: Partial<LayerInfo>): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      Object.assign(layer, updates);
      this.renderContent();
    }
  }

  clearLayers(): void {
    this.layers.clear();
    this.renderContent();
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
        return { top: margin, left: margin };
    }
  }

  show(): void {
    if (this.panelElement) {
      this.panelElement.style.display = 'block';
    }
  }

  hide(): void {
    if (this.panelElement) {
      this.panelElement.style.display = 'none';
    }
  }

  destroy(): void {
    if (this.panelElement && this.panelElement.parentNode) {
      this.panelElement.parentNode.removeChild(this.panelElement);
      this.panelElement = null;
    }
  }
}




