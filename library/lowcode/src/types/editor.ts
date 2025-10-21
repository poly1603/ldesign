/**
 * 编辑器类型定义
 */

import type { ComponentNode, LowcodeSchema } from './schema';
import type { LayoutPosition } from './layout';

/**
 * 编辑器状态
 */
export interface EditorState {
  /** 当前 Schema */
  schema: LowcodeSchema;
  /** 选中的组件 ID 列表 */
  selectedIds: string[];
  /** 悬停的组件 ID */
  hoveredId: string | null;
  /** 编辑模式 */
  mode: EditorMode;
  /** 缩放比例 */
  scale: number;
  /** 是否显示网格 */
  showGrid: boolean;
  /** 是否显示参考线 */
  showGuides: boolean;
  /** 是否显示组件边界 */
  showBounds: boolean;
  /** 画布尺寸 */
  canvasSize: CanvasSize;
  /** 设备类型 */
  device: DeviceType;
}

/**
 * 编辑模式
 */
export type EditorMode = 'design' | 'preview' | 'code';

/**
 * 画布尺寸
 */
export interface CanvasSize {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
}

/**
 * 设备类型
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

/**
 * 设备配置
 */
export interface DeviceConfig {
  /** 设备类型 */
  type: DeviceType;
  /** 设备名称 */
  name: string;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 图标 */
  icon?: string;
}

/**
 * 选择信息
 */
export interface SelectionInfo {
  /** 选中的组件 */
  components: ComponentNode[];
  /** 边界框 */
  bounds?: LayoutPosition;
  /** 是否多选 */
  multiple: boolean;
}

/**
 * 拖放数据
 */
export interface DragDropData {
  /** 拖放类型 */
  type: DragDropType;
  /** 物料类型（当从物料面板拖拽时） */
  materialType?: string;
  /** 组件 ID（当拖动已有组件时） */
  componentId?: string;
  /** 拖动起始位置 */
  startPosition?: { x: number; y: number };
}

/**
 * 拖放类型
 */
export type DragDropType = 'material' | 'component' | 'resize';

/**
 * 拖放指示器
 */
export interface DropIndicator {
  /** 是否显示 */
  visible: boolean;
  /** 位置 */
  position?: LayoutPosition;
  /** 插入位置 */
  insertPosition?: InsertPosition;
  /** 目标容器 ID */
  targetId?: string;
}

/**
 * 插入位置
 */
export interface InsertPosition {
  /** 父容器 ID */
  parentId: string;
  /** 插入索引 */
  index: number;
}

/**
 * 历史记录项
 */
export interface HistoryRecord {
  /** 记录 ID */
  id: string;
  /** 操作类型 */
  type: HistoryActionType;
  /** Schema 快照 */
  snapshot: LowcodeSchema;
  /** 时间戳 */
  timestamp: number;
  /** 操作描述 */
  description?: string;
}

/**
 * 历史操作类型
 */
export type HistoryActionType =
  | 'add'
  | 'delete'
  | 'update'
  | 'move'
  | 'copy'
  | 'paste'
  | 'batch';

/**
 * 编辑器命令
 */
export interface EditorCommand {
  /** 命令名称 */
  name: string;
  /** 执行命令 */
  execute(...args: any[]): void;
  /** 撤销命令 */
  undo?(): void;
  /** 重做命令 */
  redo?(): void;
  /** 是否可撤销 */
  undoable?: boolean;
}

/**
 * 画布配置
 */
export interface CanvasConfig {
  /** 默认宽度 */
  defaultWidth: number;
  /** 默认高度 */
  defaultHeight: number;
  /** 最小缩放 */
  minScale: number;
  /** 最大缩放 */
  maxScale: number;
  /** 网格大小 */
  gridSize: number;
  /** 网格颜色 */
  gridColor: string;
  /** 背景颜色 */
  backgroundColor: string;
}

/**
 * 快捷键配置
 */
export interface ShortcutConfig {
  /** 快捷键组合 */
  keys: string[];
  /** 命令名称 */
  command: string;
  /** 描述 */
  description?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /** 工具按钮列表 */
  tools: ToolButton[];
  /** 位置 */
  position: 'top' | 'left' | 'right' | 'bottom';
  /** 是否可折叠 */
  collapsible?: boolean;
}

/**
 * 工具按钮
 */
export interface ToolButton {
  /** 按钮 ID */
  id: string;
  /** 图标 */
  icon: string;
  /** 标题 */
  title: string;
  /** 命令 */
  command?: string;
  /** 快捷键 */
  shortcut?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 分组 */
  group?: string;
}

/**
 * 面板配置
 */
export interface PanelConfig {
  /** 面板 ID */
  id: string;
  /** 面板标题 */
  title: string;
  /** 面板位置 */
  position: 'left' | 'right' | 'bottom';
  /** 宽度或高度 */
  size: number;
  /** 是否可调整大小 */
  resizable?: boolean;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 初始是否折叠 */
  collapsed?: boolean;
  /** 是否显示 */
  visible?: boolean;
}

/**
 * 编辑器选项
 */
export interface EditorOptions {
  /** 画布配置 */
  canvas?: Partial<CanvasConfig>;
  /** 工具栏配置 */
  toolbar?: Partial<ToolbarConfig>;
  /** 面板配置 */
  panels?: PanelConfig[];
  /** 快捷键配置 */
  shortcuts?: ShortcutConfig[];
  /** 是否启用历史记录 */
  history?: boolean;
  /** 历史记录最大数量 */
  maxHistory?: number;
  /** 自动保存间隔（毫秒） */
  autoSaveInterval?: number;
}



