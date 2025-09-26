/**
 * @ldesign/cropper 裁剪工具栏组件
 * 
 * 提供专门用于图片裁剪的工具栏组件
 */

import { Toolbar } from './Toolbar';
import type { CropToolbarComponent, CropTool, CropToolGroup, ToolbarItem } from '../types/ui';

// ============================================================================
// 裁剪工具栏组件类
// ============================================================================

/**
 * 裁剪工具栏组件类
 * 提供专门用于图片裁剪的工具栏功能
 */
export class CropToolbar extends Toolbar implements CropToolbarComponent {
  /** 工具栏配置 */
  protected declare config: CropToolbarComponent;
  
  /** 工具配置映射 */
  private static readonly TOOL_CONFIGS: Record<CropTool, Partial<ToolbarItem>> = {
    select: {
      id: 'select',
      type: 'button',
      button: {
        icon: `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 2h20v20H2V2zm2 2v16h16V4H4z"/>
          <path d="M6 6h4v4H6V6zm8 0h4v4h-4V6zm-8 8h4v4H6v-4zm8 0h4v4h-4v-4z"/>
        </svg>`,
        text: '选择',
        variant: 'outline'
      }
    },
    move: {
      id: 'move',
      type: 'button',
      button: {
        icon: `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3 3h-2v4h4V7l3 3-3 3v-2h-4v4h2l-3 3-3-3h2v-4H7v2l-3-3 3-3v2h4V5h-2l3-3z"/>
        </svg>`,
        text: '移动',
        variant: 'outline'
      }
    },
    zoom: {
      id: 'zoom',
      type: 'button',
      button: {
        icon: `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
        </svg>`,
        text: '缩放',
        variant: 'outline'
      }
    },
    rotate: {
      id: 'rotate',
      type: 'button',
      button: {
        icon: `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6z"/>
          <path d="M18.76 7.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
        </svg>`,
        text: '旋转',
        variant: 'outline'
      }
    },
    flip: {
      id: 'flip',
      type: 'button',
      button: {
        icon: `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 21h2v-2h-2v2zm4-12h2V7h-2v2zm2 8h-2v2c1 0 2-1 2-2zM3 7v2h2V7H3zm2 12h2v2c-1 0-2-1-2-2zm-2-8h2v-2H3v2zm4 8h2v2H7v-2zM5 3c-1 0-2 1-2 2h2V3zm4 0h2v2H9V3zm8 0h2v2h-2V3zm-4 0h2v2h-2V3zm0 18h2v2h-2v-2z"/>
        </svg>`,
        text: '翻转',
        variant: 'outline'
      }
    },
    reset: {
      id: 'reset',
      type: 'button',
      button: {
        icon: `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>`,
        text: '重置',
        variant: 'outline'
      }
    },
    undo: {
      id: 'undo',
      type: 'button',
      button: {
        icon: `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
        </svg>`,
        text: '撤销',
        variant: 'outline'
      }
    },
    redo: {
      id: 'redo',
      type: 'button',
      button: {
        icon: `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
        </svg>`,
        text: '重做',
        variant: 'outline'
      }
    },
    crop: {
      id: 'crop',
      type: 'button',
      button: {
        icon: `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z"/>
        </svg>`,
        text: '裁剪',
        variant: 'primary'
      }
    },
    export: {
      id: 'export',
      type: 'button',
      button: {
        icon: `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>
        </svg>`,
        text: '导出',
        variant: 'primary'
      }
    },
    fullscreen: {
      id: 'fullscreen',
      type: 'button',
      button: {
        icon: `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>`,
        text: '全屏',
        variant: 'outline'
      }
    },
    settings: {
      id: 'settings',
      type: 'button',
      button: {
        icon: `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>`,
        text: '设置',
        variant: 'outline'
      }
    }
  };

  constructor(config: Partial<CropToolbarComponent> = {}) {
    super({
      tools: ['select', 'move', 'zoom', 'rotate', 'crop', 'export'],
      groups: [],
      ...config
    });
  }

  // ============================================================================
  // 属性访问器
  // ============================================================================

  /**
   * 获取显示的工具
   */
  get tools(): CropTool[] {
    return this.config.tools || [];
  }

  /**
   * 设置显示的工具
   */
  set tools(value: CropTool[]) {
    this.config.tools = value;
    this.updateToolsFromConfig();
  }

  /**
   * 获取工具分组
   */
  get groups(): CropToolGroup[] {
    return this.config.groups || [];
  }

  /**
   * 设置工具分组
   */
  set groups(value: CropToolGroup[]) {
    this.config.groups = value;
    this.updateToolsFromConfig();
  }

  // ============================================================================
  // 组件生命周期
  // ============================================================================

  /**
   * 渲染工具栏内容
   */
  protected render(): void {
    this.updateToolsFromConfig();
    super.render();
  }

  /**
   * 获取基础CSS类名
   */
  protected getBaseClasses(): string[] {
    return [
      ...super.getBaseClasses(),
      'ldesign-cropper-crop-toolbar'
    ];
  }

  // ============================================================================
  // 工具配置更新
  // ============================================================================

  /**
   * 根据配置更新工具栏项目
   */
  private updateToolsFromConfig(): void {
    const items: ToolbarItem[] = [];

    // 如果有分组配置，使用分组
    if (this.groups.length > 0) {
      this.groups.forEach(group => {
        const groupItems = this.createGroupItems(group);
        if (groupItems.length > 0) {
          items.push({
            id: group.id,
            type: 'group',
            items: groupItems,
            visible: true,
            enabled: true
          });
        }
      });
    } else {
      // 否则使用简单的工具列表
      this.tools.forEach(tool => {
        const toolItem = this.createToolItem(tool);
        if (toolItem) {
          items.push(toolItem);
        }
      });
    }

    // 更新工具栏项目
    this.config.items = items;
  }

  /**
   * 创建工具项目
   * @param tool 工具类型
   * @returns 工具栏项目
   */
  private createToolItem(tool: CropTool): ToolbarItem | null {
    const toolConfig = CropToolbar.TOOL_CONFIGS[tool];
    if (!toolConfig) {
      console.warn(`Unknown crop tool: ${tool}`);
      return null;
    }

    return {
      ...toolConfig,
      visible: true,
      enabled: true
    } as ToolbarItem;
  }

  /**
   * 创建分组项目
   * @param group 工具分组
   * @returns 分组项目数组
   */
  private createGroupItems(group: CropToolGroup): ToolbarItem[] {
    const items: ToolbarItem[] = [];

    group.tools.forEach(tool => {
      const toolItem = this.createToolItem(tool);
      if (toolItem) {
        items.push(toolItem);
      }
    });

    return items;
  }

  // ============================================================================
  // 公共方法
  // ============================================================================

  /**
   * 添加工具
   * @param tool 工具类型
   * @param index 插入位置（可选）
   */
  addTool(tool: CropTool, index?: number): void {
    const tools = [...this.tools];
    
    if (typeof index === 'number' && index >= 0 && index <= tools.length) {
      tools.splice(index, 0, tool);
    } else {
      tools.push(tool);
    }
    
    this.tools = tools;
  }

  /**
   * 移除工具
   * @param tool 工具类型
   */
  removeTool(tool: CropTool): void {
    this.tools = this.tools.filter(t => t !== tool);
  }

  /**
   * 设置工具启用状态
   * @param tool 工具类型
   * @param enabled 是否启用
   */
  setToolEnabled(tool: CropTool, enabled: boolean): void {
    this.setItemEnabled(tool, enabled);
  }

  /**
   * 设置工具可见性
   * @param tool 工具类型
   * @param visible 是否可见
   */
  setToolVisible(tool: CropTool, visible: boolean): void {
    this.setItemVisible(tool, visible);
  }

  /**
   * 获取工具按钮
   * @param tool 工具类型
   * @returns 工具按钮组件
   */
  getToolButton(tool: CropTool): any {
    return this.getItem(tool);
  }

  /**
   * 设置工具点击处理器
   * @param tool 工具类型
   * @param handler 点击处理器
   */
  onToolClick(tool: CropTool, handler: (event: MouseEvent) => void): void {
    const button = this.getToolButton(tool);
    if (button && typeof button.onClick === 'function') {
      button.onClick(handler);
    }
  }

  /**
   * 添加工具分组
   * @param group 工具分组
   */
  addGroup(group: CropToolGroup): void {
    const groups = [...this.groups, group];
    this.groups = groups;
  }

  /**
   * 移除工具分组
   * @param groupId 分组ID
   */
  removeGroup(groupId: string): void {
    this.groups = this.groups.filter(group => group.id !== groupId);
  }

  /**
   * 设置分组折叠状态
   * @param groupId 分组ID
   * @param collapsed 是否折叠
   */
  setGroupCollapsed(groupId: string, collapsed: boolean): void {
    const groups = this.groups.map(group => 
      group.id === groupId ? { ...group, collapsed } : group
    );
    this.groups = groups;
  }

  /**
   * 使用预设工具配置
   * @param preset 预设名称
   */
  usePreset(preset: 'basic' | 'advanced' | 'minimal' | 'full'): void {
    switch (preset) {
      case 'basic':
        this.tools = ['select', 'move', 'crop', 'export'];
        break;
      
      case 'advanced':
        this.tools = ['select', 'move', 'zoom', 'rotate', 'flip', 'undo', 'redo', 'crop', 'export', 'settings'];
        break;
      
      case 'minimal':
        this.tools = ['crop', 'export'];
        break;
      
      case 'full':
        this.tools = ['select', 'move', 'zoom', 'rotate', 'flip', 'reset', 'undo', 'redo', 'crop', 'export', 'fullscreen', 'settings'];
        break;
      
      default:
        console.warn(`Unknown preset: ${preset}`);
    }
  }
}
