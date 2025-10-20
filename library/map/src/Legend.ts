import type { ColorScheme } from './types';

/**
 * 图例位置
 */
export type LegendPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * 图例项
 */
export interface LegendItem {
  label: string;
  color: number[];
  value?: number | string;
}

/**
 * 图例配置选项
 */
export interface LegendOptions {
  title?: string;
  position?: LegendPosition;
  items?: LegendItem[];
  colorScheme?: ColorScheme;
  width?: number;
  maxHeight?: number;
  style?: Partial<CSSStyleDeclaration>;
}

/**
 * Legend - 图例组件
 * 用于显示颜色方案说明
 */
export class Legend {
  private container: HTMLElement;
  private legendElement: HTMLDivElement | null = null;
  private options: LegendOptions;

  constructor(container: HTMLElement, options: LegendOptions = {}) {
    this.container = container;
    this.options = {
      position: 'bottom-right',
      width: 200,
      maxHeight: 300,
      ...options
    };

    this.create();
  }

  /**
   * 创建图例元素
   */
  private create(): void {
    // 创建图例容器
    this.legendElement = document.createElement('div');
    this.legendElement.className = 'map-legend';

    // 设置基础样式
    this.applyStyles(this.legendElement, {
      position: 'absolute',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '12px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      zIndex: '1000',
      maxHeight: `${this.options.maxHeight}px`,
      width: `${this.options.width}px`,
      overflowY: 'auto',
      ...this.getPositionStyles(),
      ...this.options.style
    });

    // 添加标题
    if (this.options.title) {
      const title = document.createElement('div');
      title.textContent = this.options.title;
      this.applyStyles(title, {
        fontWeight: 'bold',
        marginBottom: '8px',
        fontSize: '14px',
        color: '#333'
      });
      this.legendElement.appendChild(title);
    }

    // 添加图例项
    this.renderItems();

    // 添加到容器
    this.container.appendChild(this.legendElement);
  }

  /**
   * 渲染图例项
   */
  private renderItems(): void {
    if (!this.legendElement) return;

    // 清除现有项（保留标题）
    const items = this.legendElement.querySelectorAll('.legend-item');
    items.forEach(item => item.remove());

    let legendItems: LegendItem[] = [];

    // 从 colorScheme 生成图例项
    if (this.options.colorScheme) {
      legendItems = this.generateItemsFromColorScheme(this.options.colorScheme);
    } else if (this.options.items) {
      legendItems = this.options.items;
    }

    // 渲染每个图例项
    legendItems.forEach(item => {
      const itemElement = this.createLegendItem(item);
      this.legendElement?.appendChild(itemElement);
    });
  }

  /**
   * 从颜色方案生成图例项
   */
  private generateItemsFromColorScheme(scheme: ColorScheme): LegendItem[] {
    const items: LegendItem[] = [];

    switch (scheme.mode) {
      case 'single':
        items.push({
          label: '统一颜色',
          color: scheme.color || [100, 150, 250]
        });
        break;

      case 'gradient':
        items.push(
          {
            label: '起始',
            color: scheme.startColor || [0, 100, 200]
          },
          {
            label: '结束',
            color: scheme.endColor || [200, 100, 0]
          }
        );
        break;

      case 'category':
        if (scheme.colors) {
          scheme.colors.forEach((color, index) => {
            items.push({
              label: `类别 ${index + 1}`,
              color
            });
          });
        }
        break;

      case 'data':
        if (scheme.colorStops) {
          scheme.colorStops.forEach((stop, index) => {
            items.push({
              label: stop.value !== undefined ? String(stop.value) : `级别 ${index + 1}`,
              color: stop.color,
              value: stop.value
            });
          });
        }
        break;

      case 'random':
        items.push({
          label: '随机颜色',
          color: [150, 150, 150]
        });
        break;

      default:
        break;
    }

    return items;
  }

  /**
   * 创建单个图例项元素
   */
  private createLegendItem(item: LegendItem): HTMLDivElement {
    const itemElement = document.createElement('div');
    itemElement.className = 'legend-item';

    this.applyStyles(itemElement, {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '6px',
      gap: '8px'
    });

    // 颜色方块
    const colorBox = document.createElement('div');
    this.applyStyles(colorBox, {
      width: '20px',
      height: '20px',
      borderRadius: '3px',
      backgroundColor: this.rgbArrayToCss(item.color),
      border: '1px solid rgba(0, 0, 0, 0.2)',
      flexShrink: '0'
    });

    // 标签
    const label = document.createElement('span');
    label.textContent = item.label;
    this.applyStyles(label, {
      color: '#555',
      fontSize: '12px'
    });

    itemElement.appendChild(colorBox);
    itemElement.appendChild(label);

    return itemElement;
  }

  /**
   * 获取位置样式
   */
  private getPositionStyles(): Partial<CSSStyleDeclaration> {
    const position = this.options.position || 'bottom-right';
    const margin = '16px';

    switch (position) {
      case 'top-left':
        return { top: margin, left: margin };
      case 'top-right':
        return { top: margin, right: margin };
      case 'bottom-left':
        return { bottom: margin, left: margin };
      case 'bottom-right':
      default:
        return { bottom: margin, right: margin };
    }
  }

  /**
   * 应用样式到元素
   */
  private applyStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.assign(element.style, styles);
  }

  /**
   * RGB 数组转 CSS 颜色字符串
   */
  private rgbArrayToCss(rgb: number[]): string {
    const r = Math.round(rgb[0] || 0);
    const g = Math.round(rgb[1] || 0);
    const b = Math.round(rgb[2] || 0);
    const a = rgb[3] !== undefined ? rgb[3] / 255 : 1;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  /**
   * 更新图例
   */
  update(options: Partial<LegendOptions>): void {
    this.options = { ...this.options, ...options };
    
    if (this.legendElement) {
      // 更新标题
      if (options.title !== undefined) {
        const titleElement = this.legendElement.querySelector('div');
        if (titleElement && !titleElement.classList.contains('legend-item')) {
          titleElement.textContent = options.title;
        }
      }

      // 更新位置
      if (options.position) {
        const positionStyles = this.getPositionStyles();
        this.applyStyles(this.legendElement, positionStyles);
      }

      // 重新渲染项
      if (options.items || options.colorScheme) {
        this.renderItems();
      }
    }
  }

  /**
   * 显示图例
   */
  show(): void {
    if (this.legendElement) {
      this.legendElement.style.display = 'block';
    }
  }

  /**
   * 隐藏图例
   */
  hide(): void {
    if (this.legendElement) {
      this.legendElement.style.display = 'none';
    }
  }

  /**
   * 切换图例显示状态
   */
  toggle(): void {
    if (this.legendElement) {
      const isHidden = this.legendElement.style.display === 'none';
      if (isHidden) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  /**
   * 销毁图例
   */
  destroy(): void {
    if (this.legendElement && this.legendElement.parentNode) {
      this.legendElement.parentNode.removeChild(this.legendElement);
      this.legendElement = null;
    }
  }

  /**
   * 获取图例元素
   */
  getElement(): HTMLDivElement | null {
    return this.legendElement;
  }
}









