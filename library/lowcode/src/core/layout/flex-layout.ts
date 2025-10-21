/**
 * Flex 布局引擎
 */

import type { LayoutConfig, FlexContainerConfig, LayoutPosition, LayoutEngine } from '../../types';
import type { ComponentNode } from '../../types/schema';

/**
 * Flex 布局引擎类
 */
export class FlexLayoutEngine implements LayoutEngine {
  private gap = 16;

  constructor(config?: { gap?: number }) {
    if (config?.gap) {
      this.gap = config.gap;
    }
  }

  /**
   * 生成容器样式
   */
  generateContainerStyle(config?: Partial<FlexContainerConfig>): Record<string, any> {
    return {
      display: 'flex',
      flexDirection: config?.flexDirection || 'row',
      flexWrap: config?.flexWrap || 'wrap',
      justifyContent: config?.justifyContent || 'flex-start',
      alignItems: config?.alignItems || 'stretch',
      alignContent: config?.alignContent,
      gap: config?.gap !== undefined ? `${config.gap}px` : `${this.gap}px`,
      rowGap: config?.rowGap !== undefined ? `${config.rowGap}px` : undefined,
      columnGap: config?.columnGap !== undefined ? `${config.columnGap}px` : undefined
    };
  }

  /**
   * 生成组件样式
   */
  generateComponentStyle(layout: LayoutConfig): Record<string, any> {
    const style: Record<string, any> = {};

    // Flex 属性
    if (layout.flex) {
      style.flex = layout.flex;
    } else {
      if (layout.flexGrow !== undefined) style.flexGrow = layout.flexGrow;
      if (layout.flexShrink !== undefined) style.flexShrink = layout.flexShrink;
      if (layout.flexBasis) style.flexBasis = layout.flexBasis;
    }

    // 对齐
    if (layout.alignSelf) {
      style.alignSelf = layout.alignSelf;
    }

    // 顺序
    if (layout.order !== undefined) {
      style.order = layout.order;
    }

    // 尺寸
    if (layout.width) {
      style.width = typeof layout.width === 'number' ? `${layout.width}px` : layout.width;
    }
    if (layout.height) {
      style.height = typeof layout.height === 'number' ? `${layout.height}px` : layout.height;
    }

    // 边距
    if (layout.margin) {
      style.margin = typeof layout.margin === 'number' ? `${layout.margin}px` : layout.margin;
    }
    if (layout.padding) {
      style.padding = typeof layout.padding === 'number' ? `${layout.padding}px` : layout.padding;
    }

    return style;
  }

  /**
   * 计算组件位置
   */
  calculatePosition(component: ComponentNode, container: HTMLElement): LayoutPosition {
    const element = container.querySelector(`[data-component-id="${component.id}"]`) as HTMLElement;
    if (!element) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return {
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height
    };
  }

  /**
   * 计算拖放位置
   */
  calculateDropPosition(event: DragEvent, container: HTMLElement): Partial<LayoutConfig> {
    // Flex布局主要通过order来控制顺序
    const children = Array.from(container.children) as HTMLElement[];
    const y = event.clientY;

    let order = 0;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const rect = child.getBoundingClientRect();
      if (y < rect.top + rect.height / 2) {
        order = i;
        break;
      }
      order = i + 1;
    }

    return {
      type: 'flex',
      order,
      flex: '1 1 auto'
    };
  }

  /**
   * 验证布局配置
   */
  validateLayout(layout: LayoutConfig): boolean {
    return layout.type === 'flex';
  }
}

/**
 * 创建 Flex 布局引擎实例
 */
export function createFlexLayout(config?: { gap?: number }): FlexLayoutEngine {
  return new FlexLayoutEngine(config);
}



