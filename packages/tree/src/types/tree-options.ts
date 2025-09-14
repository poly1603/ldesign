/**
 * 树形组件配置选项类型定义
 */

import type { TreeNodeData, TreeNodeId } from './tree-node'
import { SelectionMode, ExpandMode, DragMode } from './tree-node'

/**
 * 树形组件的配置选项接口
 */
export interface TreeOptions {
  /** 树形数据 */
  data?: TreeNodeData[]

  /** 选择相关配置 */
  selection?: {
    /** 选择模式 */
    mode: SelectionMode
    /** 是否允许多选 */
    multiple?: boolean
    /** 是否级联选择（父子联动） */
    cascade?: boolean
    /** 默认选中的节点ID */
    defaultSelected?: TreeNodeId[]
    /** 最大选择数量 */
    maxSelection?: number
  }

  /** 展开相关配置 */
  expansion?: {
    /** 展开模式 */
    mode: ExpandMode
    /** 默认展开的节点ID */
    defaultExpanded?: TreeNodeId[]
    /** 是否展开所有节点 */
    expandAll?: boolean
    /** 是否手风琴模式（同级只能展开一个） */
    accordion?: boolean
  }

  /** 拖拽相关配置 */
  drag?: {
    /** 拖拽模式 */
    mode: DragMode
    /** 是否启用拖拽 */
    enabled?: boolean
    /** 拖拽约束函数 */
    constraint?: (dragNode: TreeNodeData, dropNode: TreeNodeData, position: 'before' | 'after' | 'inside') => boolean
    /** 拖拽排序回调 */
    onSort?: (nodes: TreeNodeData[]) => void
    /** 拖拽移动回调 */
    onMove?: (dragNode: TreeNodeData, dropNode: TreeNodeData, position: 'before' | 'after' | 'inside') => void
  }

  /** 搜索相关配置 */
  search?: {
    /** 是否启用搜索 */
    enabled?: boolean
    /** 搜索模式 */
    mode?: string
    /** 搜索字段 */
    fields?: string[]
    /** 是否大小写敏感 */
    caseSensitive?: boolean
    /** 是否模糊搜索 */
    fuzzy?: boolean
    /** 搜索高亮样式类名 */
    highlightClass?: string
    /** 是否展开匹配的节点路径 */
    expandMatched?: boolean
    /** 搜索过滤函数 */
    filter?: (node: TreeNodeData, keyword: string) => boolean
  }

  /** 异步加载相关配置 */
  async?: {
    /** 是否启用异步加载 */
    enabled?: boolean
    /** 异步加载函数 */
    loader?: (node: TreeNodeData) => Promise<TreeNodeData[]>
    /** 加载缓存策略 */
    cache?: boolean
    /** 缓存过期时间（毫秒） */
    cacheExpiry?: number
    /** 最大缓存大小 */
    maxCacheSize?: number
    /** 是否启用懒加载 */
    lazy?: boolean
    /** 加载超时时间（毫秒） */
    timeout?: number
    /** 加载重试次数 */
    retries?: number
  }

  /** 虚拟滚动相关配置 */
  virtual?: {
    /** 是否启用虚拟滚动 */
    enabled?: boolean
    /** 节点高度 */
    itemHeight?: number
    /** 缓冲区大小 */
    buffer?: number
    /** 容器高度 */
    height?: number
    /** 容器高度 */
    containerHeight?: number
    /** 预扫描数量 */
    overscan?: number
    /** 阈值 */
    threshold?: number
    /** 是否动态高度 */
    dynamic?: boolean
  }

  /** 样式相关配置 */
  style?: {
    /** 主题名称 */
    theme?: string
    /** 自定义样式类名 */
    className?: string
    /** 节点缩进大小 */
    indent?: number
    /** 连接线样式 */
    showLine?: boolean
    /** 图标配置 */
    icons?: {
      expand?: string
      collapse?: string
      leaf?: string
      loading?: string
      error?: string
    }
  }

  /** 无障碍访问配置 */
  accessibility?: {
    /** 是否启用无障碍访问 */
    enabled?: boolean
    /** 键盘导航 */
    keyboard?: boolean
    /** 屏幕阅读器支持 */
    screenReader?: boolean
    /** 焦点管理 */
    focusManagement?: boolean
  }

  /** 性能相关配置 */
  performance?: {
    /** 是否启用性能优化 */
    enabled?: boolean
    /** 防抖延迟（毫秒） */
    debounce?: number
    /** 节流延迟（毫秒） */
    throttle?: number
    /** 是否启用懒渲染 */
    lazyRender?: boolean
  }

  /** 节点操作相关配置 */
  operations?: {
    /** 最大历史记录数量 */
    maxHistorySize?: number
    /** 是否启用操作历史 */
    enableHistory?: boolean
  }

  /** 国际化配置 */
  i18n?: {
    /** 语言代码 */
    locale?: string
    /** 文本配置 */
    messages?: Record<string, string>
  }
}

/**
 * 树形组件的默认配置
 */
export const DEFAULT_TREE_OPTIONS: Required<TreeOptions> = {
  data: [],
  selection: {
    mode: SelectionMode.SINGLE,
    multiple: false,
    cascade: false,
    defaultSelected: [],
    maxSelection: Infinity,
  },
  expansion: {
    mode: ExpandMode.MANUAL,
    defaultExpanded: [],
    expandAll: false,
    accordion: false,
  },
  drag: {
    mode: DragMode.DISABLED,
    enabled: false,
    constraint: () => true,
    onSort: () => { },
    onMove: () => { },
  },
  search: {
    enabled: false,
    mode: 'contains',
    fields: ['label'],
    caseSensitive: false,
    fuzzy: false,
    highlightClass: 'tree-search-highlight',
    expandMatched: true,
    filter: (node, keyword) => {
      return node.label.toLowerCase().includes(keyword.toLowerCase())
    },
  },
  async: {
    enabled: false,
    loader: async () => [],
    cache: true,
    cacheExpiry: 300000, // 5分钟
    maxCacheSize: 100,
    lazy: false,
    timeout: 5000,
    retries: 3,
  },
  virtual: {
    enabled: false,
    itemHeight: 32,
    buffer: 10,
    height: 300,
    containerHeight: 400,
    overscan: 5,
    threshold: 100,
    dynamic: false,
  },
  style: {
    theme: 'default',
    className: '',
    indent: 24,
    showLine: true,
    icons: {
      expand: 'chevron-right',
      collapse: 'chevron-down',
      leaf: 'file',
      loading: 'loader',
      error: 'alert-circle',
    },
  },
  accessibility: {
    enabled: true,
    keyboard: true,
    screenReader: true,
    focusManagement: true,
  },
  performance: {
    enabled: true,
    debounce: 300,
    throttle: 100,
    lazyRender: true,
  },
  operations: {
    maxHistorySize: 50,
    enableHistory: true,
  },
  i18n: {
    locale: 'zh-CN',
    messages: {
      'tree.loading': '加载中...',
      'tree.error': '加载失败',
      'tree.empty': '暂无数据',
      'tree.search.placeholder': '搜索节点...',
    },
  },
}
