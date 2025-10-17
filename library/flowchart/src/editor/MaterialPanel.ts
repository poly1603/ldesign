import { MaterialItem, NodeType } from '../types';
import { DEFAULT_NODE_STYLES } from '../styles/defaultStyles';

/**
 * 物料面板配置
 */
export interface MaterialPanelConfig {
  container: HTMLElement;
  materials: MaterialItem[];
  onMaterialSelect?: (material: MaterialItem) => void;
}

/**
 * 物料面板组件
 */
export class MaterialPanel {
  private container: HTMLElement;
  private config: MaterialPanelConfig;

  constructor(config: MaterialPanelConfig) {
    this.config = config;
    this.container = config.container;
    
    this.render();
  }

  /**
   * 渲染物料面板
   */
  private render(): void {
    this.container.innerHTML = '';
    this.container.style.cssText = `
      width: 240px;
      background: #fff;
      border-right: 1px solid #e0e0e0;
      padding: 15px;
      overflow-y: auto;
    `;

    // 标题
    const title = document.createElement('div');
    title.textContent = '组件库';
    title.style.cssText = `
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #2196f3;
    `;
    this.container.appendChild(title);

    // 物料列表
    const materialList = document.createElement('div');
    materialList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;

    this.config.materials.forEach(material => {
      materialList.appendChild(this.createMaterialItem(material));
    });

    this.container.appendChild(materialList);
  }

  /**
   * 创建物料项（带节点预览）
   */
  private createMaterialItem(material: MaterialItem): HTMLElement {
    const item = document.createElement('div');
    item.draggable = true;
    item.style.cssText = `
      padding: 12px;
      background: #fff;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: grab;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    // SVG 预览（真实的节点样式）
    const preview = this.createNodePreview(material.type, material.label);
    item.appendChild(preview);

    // 组件信息
    const info = document.createElement('div');
    info.style.cssText = `
      text-align: center;
    `;

    const label = document.createElement('div');
    label.textContent = `${material.icon || ''} ${material.label}`;
    label.style.cssText = `
      font-size: 13px;
      font-weight: 500;
      color: #333;
    `;
    info.appendChild(label);

    if (material.description) {
      const desc = document.createElement('div');
      desc.textContent = material.description;
      desc.style.cssText = `
        font-size: 11px;
        color: #999;
        margin-top: 2px;
      `;
      info.appendChild(desc);
    }

    item.appendChild(info);

    // 拖拽事件
    item.addEventListener('dragstart', (e) => {
      item.style.cursor = 'grabbing';
      item.style.opacity = '0.5';
      e.dataTransfer!.effectAllowed = 'copy';
      e.dataTransfer!.setData('application/json', JSON.stringify(material));
      
      // 创建拖拽图像（让拖拽更直观）
      const dragImage = document.createElement('div');
      dragImage.style.cssText = `
        position: absolute;
        padding: 8px 16px;
        background: #2196f3;
        color: white;
        border-radius: 6px;
        font-size: 14px;
        opacity: 0.9;
      `;
      dragImage.textContent = material.label;
      document.body.appendChild(dragImage);
      e.dataTransfer!.setDragImage(dragImage, 50, 20);
      
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
      
      this.config.onMaterialSelect?.(material);
    });

    item.addEventListener('dragend', () => {
      item.style.cursor = 'grab';
      item.style.opacity = '1';
    });

    // 悬停效果
    item.addEventListener('mouseenter', () => {
      item.style.background = '#e3f2fd';
      item.style.borderColor = '#2196f3';
      item.style.transform = 'translateX(4px)';
    });

    item.addEventListener('mouseleave', () => {
      item.style.background = '#f8f9fa';
      item.style.borderColor = '#e0e0e0';
      item.style.transform = 'translateX(0)';
    });

    return item;
  }

  /**
   * 创建节点预览（SVG）
   */
  private createNodePreview(type: NodeType, label: string): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      width: 100%;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // 创建 SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '140');
    svg.setAttribute('height', '50');
    svg.style.cssText = 'overflow: visible;';

    // 获取样式
    const style = DEFAULT_NODE_STYLES[type];

    // 创建节点形状
    let shape: SVGElement;
    
    if (type === NodeType.START || type === NodeType.END) {
      // 椭圆
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shape.setAttribute('x', '20');
      shape.setAttribute('y', '5');
      shape.setAttribute('width', '100');
      shape.setAttribute('height', '40');
      shape.setAttribute('rx', String(style.borderRadius || 20));
    } else if (type === NodeType.CONDITION) {
      // 菱形
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const points = '70,5 120,25 70,45 20,25';
      shape.setAttribute('points', points);
    } else {
      // 矩形
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shape.setAttribute('x', '20');
      shape.setAttribute('y', '5');
      shape.setAttribute('width', '100');
      shape.setAttribute('height', '40');
      shape.setAttribute('rx', String(style.borderRadius || 4));
    }

    // 应用样式
    shape.setAttribute('fill', style.backgroundColor || '#fff');
    shape.setAttribute('stroke', style.borderColor || '#666');
    shape.setAttribute('stroke-width', String(style.borderWidth || 2));

    // 文本
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '70');
    text.setAttribute('y', '25');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', style.textColor || '#333');
    text.setAttribute('font-size', String(style.fontSize || 12));
    text.textContent = label;

    svg.appendChild(shape);
    svg.appendChild(text);
    container.appendChild(svg);

    return container;
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.container.innerHTML = '';
  }
}


