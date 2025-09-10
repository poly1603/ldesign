/**
 * 工具栏组件
 * 提供节点创建、编辑工具、缩放控制等功能
 */

import type { NodeType, EdgeType, EventEmitter } from '@/types/index.js';
import { EventType } from '@/types/index.js';
import { SimpleEventEmitter, createElement, addClass, removeClass } from '@/utils/index.js';

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /** 容器元素 */
  container: HTMLElement;
  /** 是否显示节点工具 */
  showNodeTools?: boolean;
  /** 是否显示连接线工具 */
  showEdgeTools?: boolean;
  /** 是否显示编辑工具 */
  showEditTools?: boolean;
  /** 是否显示缩放工具 */
  showZoomTools?: boolean;
  /** 自定义工具 */
  customTools?: ToolConfig[];
}

/**
 * 工具配置
 */
export interface ToolConfig {
  /** 工具ID */
  id: string;
  /** 工具名称 */
  name: string;
  /** 工具图标 */
  icon: string;
  /** 工具提示 */
  tooltip?: string;
  /** 工具类型 */
  type: 'button' | 'toggle' | 'dropdown';
  /** 工具分组 */
  group?: string;
  /** 点击处理函数 */
  onClick?: () => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否激活（仅toggle类型） */
  active?: boolean;
  /** 下拉选项（仅dropdown类型） */
  options?: { value: string; label: string; icon?: string }[];
}

/**
 * 工具栏类
 */
export class Toolbar extends SimpleEventEmitter implements EventEmitter {
  private container: HTMLElement;
  private element: HTMLElement;
  private config: ToolbarConfig;
  private tools: Map<string, ToolConfig> = new Map();
  private toolElements: Map<string, HTMLElement> = new Map();
  private activeNodeType: NodeType | null = null;
  private activeEdgeType: EdgeType | null = null;

  constructor(config: ToolbarConfig) {
    super();
    
    this.config = config;
    this.container = config.container;
    
    this.createElement();
    this.setupDefaultTools();
    this.setupCustomTools();
    this.render();
  }

  /**
   * 创建工具栏元素
   */
  private createElement(): void {
    this.element = createElement('div', {
      className: 'flowchart-toolbar',
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ls-spacing-sm)',
        padding: 'var(--ls-padding-sm)',
        backgroundColor: 'var(--ldesign-bg-color-container)',
        borderBottom: '1px solid var(--ldesign-border-level-1-color)',
        boxShadow: 'var(--ldesign-shadow-1)',
        userSelect: 'none'
      }
    });

    this.container.appendChild(this.element);
  }

  /**
   * 设置默认工具
   */
  private setupDefaultTools(): void {
    // 节点工具
    if (this.config.showNodeTools !== false) {
      this.addTool({
        id: 'node-start',
        name: '开始节点',
        icon: '⭕',
        tooltip: '添加开始节点',
        type: 'toggle',
        group: 'nodes',
        onClick: () => this.selectNodeType('start' as NodeType)
      });

      this.addTool({
        id: 'node-process',
        name: '处理节点',
        icon: '⬜',
        tooltip: '添加处理节点',
        type: 'toggle',
        group: 'nodes',
        onClick: () => this.selectNodeType('process' as NodeType)
      });

      this.addTool({
        id: 'node-decision',
        name: '决策节点',
        icon: '◆',
        tooltip: '添加决策节点',
        type: 'toggle',
        group: 'nodes',
        onClick: () => this.selectNodeType('decision' as NodeType)
      });

      this.addTool({
        id: 'node-approval',
        name: '审批节点',
        icon: '👤',
        tooltip: '添加审批节点',
        type: 'toggle',
        group: 'nodes',
        onClick: () => this.selectNodeType('approval' as NodeType)
      });

      this.addTool({
        id: 'node-end',
        name: '结束节点',
        icon: '⭕',
        tooltip: '添加结束节点',
        type: 'toggle',
        group: 'nodes',
        onClick: () => this.selectNodeType('end' as NodeType)
      });
    }

    // 连接线工具
    if (this.config.showEdgeTools !== false) {
      this.addSeparator();

      this.addTool({
        id: 'edge-straight',
        name: '直线连接',
        icon: '—',
        tooltip: '直线连接',
        type: 'toggle',
        group: 'edges',
        onClick: () => this.selectEdgeType('straight' as EdgeType)
      });

      this.addTool({
        id: 'edge-bezier',
        name: '曲线连接',
        icon: '〜',
        tooltip: '贝塞尔曲线连接',
        type: 'toggle',
        group: 'edges',
        onClick: () => this.selectEdgeType('bezier' as EdgeType)
      });

      // Bezier 辅助工具：重置控制点（仅当选中Bezier时启用）
      this.addTool({
        id: 'bezier-reset-cp',
        name: '重置控制点',
        icon: '↺',
        tooltip: '重置贝塞尔自定义控制点',
        type: 'button',
        group: 'edges',
        disabled: true,
        onClick: () => this.emit('bezier-reset-cp')
      });

      this.addTool({
        id: 'edge-orthogonal',
        name: '直角连接',
        icon: '⌐',
        tooltip: '直角连接',
        type: 'toggle',
        group: 'edges',
        onClick: () => this.selectEdgeType('orthogonal' as EdgeType)
      });
    }

    // 编辑工具
    if (this.config.showEditTools !== false) {
      this.addSeparator();

      this.addTool({
        id: 'select',
        name: '选择',
        icon: '↖',
        tooltip: '选择工具',
        type: 'toggle',
        group: 'edit',
        active: true,
        onClick: () => this.selectTool('select')
      });

      this.addTool({
        id: 'pan',
        name: '平移',
        icon: '✋',
        tooltip: '平移画布',
        type: 'toggle',
        group: 'edit',
        onClick: () => this.selectTool('pan')
      });

      this.addSeparator();

      this.addTool({
        id: 'undo',
        name: '撤销',
        icon: '↶',
        tooltip: '撤销 (Ctrl+Z)',
        type: 'button',
        onClick: () => this.emit('undo')
      });

      this.addTool({
        id: 'redo',
        name: '重做',
        icon: '↷',
        tooltip: '重做 (Ctrl+Y)',
        type: 'button',
        onClick: () => this.emit('redo')
      });

      this.addSeparator();

      this.addTool({
        id: 'delete',
        name: '删除',
        icon: '🗑',
        tooltip: '删除选中项 (Delete)',
        type: 'button',
        onClick: () => this.emit('delete')
      });
    }

    // 缩放工具
    if (this.config.showZoomTools !== false) {
      this.addSeparator();

      this.addTool({
        id: 'zoom-in',
        name: '放大',
        icon: '🔍+',
        tooltip: '放大',
        type: 'button',
        onClick: () => this.emit('zoom-in')
      });

      this.addTool({
        id: 'zoom-out',
        name: '缩小',
        icon: '🔍-',
        tooltip: '缩小',
        type: 'button',
        onClick: () => this.emit('zoom-out')
      });

      this.addTool({
        id: 'zoom-fit',
        name: '适应画布',
        icon: '⬜',
        tooltip: '适应画布',
        type: 'button',
        onClick: () => this.emit('zoom-fit')
      });

      this.addTool({
        id: 'zoom-reset',
        name: '重置缩放',
        icon: '1:1',
        tooltip: '重置缩放',
        type: 'button',
        onClick: () => this.emit('zoom-reset')
      });
    }

    // 辅助工具：吸附与对齐线
    this.addSeparator();

    this.addTool({
      id: 'snap',
      name: '网格吸附',
      icon: '⛙',
      tooltip: '网格吸附',
      type: 'toggle',
      group: 'assist',
      active: false,
      onClick: () => {
        const t = this.tools.get('snap');
        const next = !t?.active;
        this.updateTool('snap', { active: next });
        this.emit('toggle-snap', next);
      }
    });

    this.addTool({
      id: 'guides',
      name: '对齐线',
      icon: '╏',
      tooltip: '显示/隐藏对齐线',
      type: 'toggle',
      group: 'assist',
      active: true,
      onClick: () => {
        const t = this.tools.get('guides');
        const next = !t?.active;
        this.updateTool('guides', { active: next });
        this.emit('toggle-guides', next);
      }
    });

    // 吸附步长切换
    this.addTool({
      id: 'snap-size',
      name: '吸附步长',
      icon: '10',
      tooltip: '切换吸附步长',
      type: 'button',
      group: 'assist',
      onClick: () => this.emit('cycle-snap-size')
    });
  }

  /**
   * 设置自定义工具
   */
  private setupCustomTools(): void {
    if (this.config.customTools) {
      this.addSeparator();
      
      for (const tool of this.config.customTools) {
        this.addTool(tool);
      }
    }
  }

  /**
   * 添加工具
   */
  addTool(config: ToolConfig): void {
    this.tools.set(config.id, { ...config });
  }

  /**
   * 移除工具
   */
  removeTool(id: string): void {
    this.tools.delete(id);
    const element = this.toolElements.get(id);
    if (element) {
      element.remove();
      this.toolElements.delete(id);
    }
  }

  /**
   * 更新工具
   */
  updateTool(id: string, updates: Partial<ToolConfig>): void {
    const tool = this.tools.get(id);
    if (tool) {
      Object.assign(tool, updates);
      this.renderTool(tool);
    }
  }

  /**
   * 添加分隔符
   */
  private addSeparator(): void {
    const separator = createElement('div', {
      className: 'toolbar-separator',
      style: {
        width: '1px',
        height: '24px',
        backgroundColor: 'var(--ldesign-border-level-1-color)',
        margin: '0 var(--ls-spacing-xs)'
      }
    });

    this.element.appendChild(separator);
  }

  /**
   * 渲染工具栏
   */
  private render(): void {
    // 清空现有内容
    this.element.innerHTML = '';
    this.toolElements.clear();

    // 重新设置工具
    this.setupDefaultTools();
    this.setupCustomTools();
  }

  /**
   * 渲染单个工具
   */
  private renderTool(config: ToolConfig): void {
    let element = this.toolElements.get(config.id);
    
    if (!element) {
      element = this.createToolElement(config);
      this.toolElements.set(config.id, element);
      this.element.appendChild(element);
    } else {
      this.updateToolElement(element, config);
    }
  }

  /**
   * 创建工具元素
   */
  private createToolElement(config: ToolConfig): HTMLElement {
    const element = createElement('button', {
      className: `toolbar-tool toolbar-tool-${config.type}`,
      title: config.tooltip || config.name,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        border: '1px solid var(--ldesign-border-level-1-color)',
        borderRadius: 'var(--ls-border-radius-sm)',
        backgroundColor: 'var(--ldesign-bg-color-component)',
        color: 'var(--ldesign-text-color-primary)',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s ease'
      }
    });

    // 设置图标
    element.textContent = config.icon;

    // 设置状态
    this.updateToolElement(element, config);

    // 添加事件监听
    element.addEventListener('click', () => {
      if (!config.disabled) {
        config.onClick?.();
      }
    });

    // 悬停效果
    element.addEventListener('mouseenter', () => {
      if (!config.disabled) {
        element.style.backgroundColor = 'var(--ldesign-bg-color-component-hover)';
        element.style.borderColor = 'var(--ldesign-border-color-hover)';
      }
    });

    element.addEventListener('mouseleave', () => {
      if (!config.disabled) {
        element.style.backgroundColor = config.active 
          ? 'var(--ldesign-brand-color-focus)' 
          : 'var(--ldesign-bg-color-component)';
        element.style.borderColor = config.active 
          ? 'var(--ldesign-brand-color)' 
          : 'var(--ldesign-border-level-1-color)';
      }
    });

    return element;
  }

  /**
   * 更新工具元素
   */
  private updateToolElement(element: HTMLElement, config: ToolConfig): void {
    // 更新禁用状态
    if (config.disabled) {
      element.style.opacity = '0.5';
      element.style.cursor = 'not-allowed';
      element.style.backgroundColor = 'var(--ldesign-bg-color-component-disabled)';
    } else {
      element.style.opacity = '1';
      element.style.cursor = 'pointer';
    }

    // 更新激活状态
    if (config.active && config.type === 'toggle') {
      element.style.backgroundColor = 'var(--ldesign-brand-color-focus)';
      element.style.borderColor = 'var(--ldesign-brand-color)';
      element.style.color = 'var(--ldesign-brand-color)';
    } else {
      element.style.backgroundColor = 'var(--ldesign-bg-color-component)';
      element.style.borderColor = 'var(--ldesign-border-level-1-color)';
      element.style.color = 'var(--ldesign-text-color-primary)';
    }

    // 更新图标
    element.textContent = config.icon;

    // 更新提示
    element.title = config.tooltip || config.name;
  }

  /**
   * 选择节点类型
   */
  private selectNodeType(nodeType: NodeType): void {
    this.activeNodeType = nodeType;
    this.clearGroupSelection('nodes');
    this.updateTool(`node-${nodeType}`, { active: true });
    this.emit('node-type-select', nodeType);
  }

  /**
   * 选择连接线类型
   */
  private selectEdgeType(edgeType: EdgeType): void {
    this.activeEdgeType = edgeType;
    this.clearGroupSelection('edges');
    this.updateTool(`edge-${edgeType}`, { active: true });
    this.emit('edge-type-select', edgeType);
  }

  /**
   * 选择工具
   */
  private selectTool(toolId: string): void {
    this.clearGroupSelection('edit');
    this.updateTool(toolId, { active: true });
    this.emit('tool-select', toolId);
  }

  /**
   * 清除分组选择
   */
  private clearGroupSelection(group: string): void {
    for (const [id, tool] of this.tools) {
      if (tool.group === group && tool.active) {
        this.updateTool(id, { active: false });
      }
    }
  }

  /**
   * 设置工具启用状态
   */
  setToolEnabled(id: string, enabled: boolean): void {
    this.updateTool(id, { disabled: !enabled });
  }

  /**
   * 设置工具激活状态
   */
  setToolActive(id: string, active: boolean): void {
    this.updateTool(id, { active });
  }

  /**
   * 获取当前选中的节点类型
   */
  getActiveNodeType(): NodeType | null {
    return this.activeNodeType;
  }

  /**
   * 获取当前选中的连接线类型
   */
  getActiveEdgeType(): EdgeType | null {
    return this.activeEdgeType;
  }

  /**
   * 显示工具栏
   */
  show(): void {
    this.element.style.display = 'flex';
  }

  /**
   * 隐藏工具栏
   */
  hide(): void {
    this.element.style.display = 'none';
  }

  /**
   * 销毁工具栏
   */
  destroy(): void {
    this.element.remove();
    this.tools.clear();
    this.toolElements.clear();
    this.removeAllListeners();
  }
}
