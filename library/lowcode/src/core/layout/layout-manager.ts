/**
 * 布局管理器
 * 统一管理 Grid 和 Flex 布局
 */

import type { LayoutConfig, LayoutEngine } from '../../types';
import { GridLayoutEngine } from './grid-layout';
import { FlexLayoutEngine } from './flex-layout';

/**
 * 布局管理器类
 */
export class LayoutManager {
  private gridEngine: GridLayoutEngine;
  private flexEngine: FlexLayoutEngine;

  constructor() {
    this.gridEngine = new GridLayoutEngine();
    this.flexEngine = new FlexLayoutEngine();
  }

  /**
   * 获取布局引擎
   */
  getEngine(type: 'grid' | 'flex'): LayoutEngine {
    return type === 'grid' ? this.gridEngine : this.flexEngine;
  }

  /**
   * 生成容器样式
   */
  generateContainerStyle(type: 'grid' | 'flex', config?: any): Record<string, any> {
    const engine = this.getEngine(type);
    return engine.generateContainerStyle(config);
  }

  /**
   * 生成组件样式
   */
  generateComponentStyle(layout: LayoutConfig): Record<string, any> {
    const engine = this.getEngine(layout.type || 'grid');
    return engine.generateComponentStyle(layout);
  }

  /**
   * 计算拖放位置
   */
  calculateDropPosition(
    type: 'grid' | 'flex',
    event: DragEvent,
    container: HTMLElement
  ): Partial<LayoutConfig> {
    const engine = this.getEngine(type);
    return engine.calculateDropPosition(event, container);
  }
}

/**
 * 创建布局管理器实例
 */
export function createLayoutManager(): LayoutManager {
  return new LayoutManager();
}



