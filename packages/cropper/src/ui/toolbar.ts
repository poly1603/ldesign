/**
 * @ldesign/cropper - 工具栏组件
 * 
 * 提供裁剪操作的工具栏界面
 */

import type { ToolbarConfig } from '../types';
import { CSS_CLASSES } from '../constants';

/**
 * 工具按钮配置
 */
export interface ToolButtonConfig {
  id: string;
  icon: string;
  title: string;
  action: () => void;
  disabled?: boolean;
  active?: boolean;
}

/**
 * 工具栏类
 * 
 * 提供可配置的工具栏界面
 */
export class Toolbar {
  private container: HTMLElement;
  private element: HTMLElement;
  private config: ToolbarConfig;
  private buttons: Map<string, HTMLButtonElement> = new Map();
  private isVisible: boolean = true;

  constructor(container: HTMLElement, config: ToolbarConfig) {
    this.container = container;
    this.config = config;
    this.element = this.createElement();
    
    this.render();
    this.setupEventListeners();
  }

  /**
   * 创建工具栏元素
   */
  private createElement(): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.className = `${CSS_CLASSES.TOOLBAR} ${CSS_CLASSES.TOOLBAR}--${this.config.position}`;
    
    if (this.config.draggable) {
      toolbar.draggable = true;
      toolbar.style.cursor = 'move';
    }
    
    return toolbar;
  }

  /**
   * 渲染工具栏
   */
  private render(): void {
    this.element.innerHTML = '';
    this.buttons.clear();

    this.config.tools.forEach(toolId => {
      const button = this.createToolButton(toolId);
      if (button) {
        this.element.appendChild(button);
        this.buttons.set(toolId, button);
      }
    });

    if (this.config.show && this.isVisible) {
      this.container.appendChild(this.element);
    }
  }

  /**
   * 创建工具按钮
   */
  private createToolButton(toolId: string): HTMLButtonElement | null {
    const buttonConfig = this.getButtonConfig(toolId);
    if (!buttonConfig) return null;

    const button = document.createElement('button');
    button.className = 'toolbar-button';
    button.title = buttonConfig.title;
    button.disabled = buttonConfig.disabled || false;
    
    if (buttonConfig.active) {
      button.classList.add('toolbar-button--active');
    }

    // 设置图标
    button.innerHTML = this.getButtonIcon(buttonConfig.icon);

    // 绑定点击事件
    button.addEventListener('click', (e) => {
      e.preventDefault();
      if (!button.disabled) {
        buttonConfig.action();
      }
    });

    return button;
  }

  /**
   * 获取按钮配置
   */
  private getButtonConfig(toolId: string): ToolButtonConfig | null {
    const configs: Record<string, Omit<ToolButtonConfig, 'action'>> = {
      'zoom-in': {
        id: 'zoom-in',
        icon: 'zoom-in',
        title: '放大'
      },
      'zoom-out': {
        id: 'zoom-out',
        icon: 'zoom-out',
        title: '缩小'
      },
      'zoom-fit': {
        id: 'zoom-fit',
        icon: 'maximize',
        title: '适合窗口'
      },
      'rotate-left': {
        id: 'rotate-left',
        icon: 'rotate-ccw',
        title: '向左旋转'
      },
      'rotate-right': {
        id: 'rotate-right',
        icon: 'rotate-cw',
        title: '向右旋转'
      },
      'flip-horizontal': {
        id: 'flip-horizontal',
        icon: 'flip-horizontal',
        title: '水平翻转'
      },
      'flip-vertical': {
        id: 'flip-vertical',
        icon: 'flip-vertical',
        title: '垂直翻转'
      },
      'reset': {
        id: 'reset',
        icon: 'refresh-cw',
        title: '重置'
      },
      'download': {
        id: 'download',
        icon: 'download',
        title: '下载'
      },
      'undo': {
        id: 'undo',
        icon: 'undo',
        title: '撤销'
      },
      'redo': {
        id: 'redo',
        icon: 'redo',
        title: '重做'
      },
      'crop': {
        id: 'crop',
        icon: 'crop',
        title: '裁剪'
      },
      'move': {
        id: 'move',
        icon: 'move',
        title: '移动'
      },
      'settings': {
        id: 'settings',
        icon: 'settings',
        title: '设置'
      }
    };

    const config = configs[toolId];
    if (!config) return null;

    return {
      ...config,
      action: () => this.handleToolAction(toolId)
    };
  }

  /**
   * 获取按钮图标
   */
  private getButtonIcon(iconName: string): string {
    // 这里可以使用 Lucide 图标或其他图标库
    // 简化实现，返回 SVG 字符串
    const icons: Record<string, string> = {
      'zoom-in': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
      'zoom-out': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
      'maximize': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
      'rotate-ccw': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
      'rotate-cw': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`,
      'flip-horizontal': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><path d="M12 20v2"/><path d="M12 14v2"/><path d="M12 8v2"/><path d="M12 2v2"/></svg>`,
      'flip-vertical': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/><path d="M4 12H2"/><path d="M10 12H8"/><path d="M16 12h-2"/><path d="M22 12h-2"/></svg>`,
      'refresh-cw': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
      'download': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
      'undo': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`,
      'redo': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>`,
      'crop': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 6H8a2 2 0 0 1-2-2V2"/></svg>`,
      'move': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="5,9 2,12 5,15"/><polyline points="9,5 12,2 15,5"/><polyline points="15,19 12,22 9,19"/><polyline points="19,9 22,12 19,15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
      'settings': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m11-7a4 4 0 0 1 0 8m0-8a4 4 0 0 0 0 8"/></svg>`
    };

    return icons[iconName] || '';
  }

  /**
   * 处理工具操作
   */
  private handleToolAction(toolId: string): void {
    // 触发自定义事件
    const event = new CustomEvent('toolbarAction', {
      detail: { toolId }
    });
    this.element.dispatchEvent(event);
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (this.config.draggable) {
      this.setupDragListeners();
    }
  }

  /**
   * 设置拖拽监听器
   */
  private setupDragListeners(): void {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    this.element.addEventListener('mousedown', (e) => {
      if (e.target === this.element) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = this.element.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        
        this.element.style.position = 'fixed';
        this.element.style.zIndex = '1000';
        
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        this.element.style.left = `${startLeft + deltaX}px`;
        this.element.style.top = `${startTop + deltaY}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  /**
   * 更新按钮状态
   */
  updateButtonState(toolId: string, state: { disabled?: boolean; active?: boolean }): void {
    const button = this.buttons.get(toolId);
    if (!button) return;

    if (state.disabled !== undefined) {
      button.disabled = state.disabled;
    }

    if (state.active !== undefined) {
      button.classList.toggle('toolbar-button--active', state.active);
    }
  }

  /**
   * 添加工具按钮
   */
  addTool(toolId: string, config: ToolButtonConfig): void {
    if (!this.config.tools.includes(toolId)) {
      this.config.tools.push(toolId);
      this.render();
    }
  }

  /**
   * 移除工具按钮
   */
  removeTool(toolId: string): void {
    const index = this.config.tools.indexOf(toolId);
    if (index > -1) {
      this.config.tools.splice(index, 1);
      this.render();
    }
  }

  /**
   * 显示工具栏
   */
  show(): void {
    this.isVisible = true;
    if (this.config.show && !this.container.contains(this.element)) {
      this.container.appendChild(this.element);
    }
  }

  /**
   * 隐藏工具栏
   */
  hide(): void {
    this.isVisible = false;
    if (this.container.contains(this.element)) {
      this.container.removeChild(this.element);
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ToolbarConfig>): void {
    this.config = { ...this.config, ...config };
    
    // 更新位置类名
    this.element.className = `${CSS_CLASSES.TOOLBAR} ${CSS_CLASSES.TOOLBAR}--${this.config.position}`;
    
    // 重新渲染
    this.render();
  }

  /**
   * 获取工具栏元素
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * 监听工具栏事件
   */
  on(event: 'toolbarAction', callback: (detail: { toolId: string }) => void): void {
    this.element.addEventListener(event, (e: any) => {
      callback(e.detail);
    });
  }

  /**
   * 销毁工具栏
   */
  destroy(): void {
    if (this.container.contains(this.element)) {
      this.container.removeChild(this.element);
    }
    this.buttons.clear();
  }
}
