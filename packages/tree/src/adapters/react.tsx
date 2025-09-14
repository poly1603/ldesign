/**
 * React 适配器
 * 
 * 提供React组件包装器，使树形组件能够在React应用中使用
 */

import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import { Tree } from '../core/tree'
import type { TreeOptions, TreeNodeData } from '../types'

/**
 * React 树形组件属性接口
 */
export interface LDesignTreeProps {
  // 数据
  data?: TreeNodeData[]
  
  // 配置选项
  options?: Partial<TreeOptions>

  // 选中的节点
  selectedKeys?: string[]

  // 展开的节点
  expandedKeys?: string[]

  // 选择模式
  selectionMode?: 'single' | 'multiple' | 'cascade'

  // 是否显示复选框
  showCheckbox?: boolean

  // 是否可拖拽
  draggable?: boolean

  // 是否可搜索
  searchable?: boolean

  // 搜索关键词
  searchKeyword?: string

  // 虚拟滚动
  virtualScroll?: boolean

  // 异步加载
  asyncLoad?: (node: any) => Promise<TreeNodeData[]>

  // 主题
  theme?: 'light' | 'dark' | 'compact' | 'comfortable'

  // 尺寸
  size?: 'small' | 'medium' | 'large'

  // 是否禁用
  disabled?: boolean

  // 加载状态
  loading?: boolean

  // 空状态文本
  emptyText?: string

  // 类名
  className?: string

  // 样式
  style?: React.CSSProperties

  // 事件回调
  onSelect?: (selectedKeys: string[]) => void
  onExpand?: (nodeId: string) => void
  onCollapse?: (nodeId: string) => void
  onCheck?: (checkedKeys: string[]) => void
  onUncheck?: (uncheckedKeys: string[]) => void
  onDragStart?: (nodeId: string) => void
  onDragEnd?: (nodeId: string) => void
  onDrop?: (data: any) => void
  onSearch?: (keyword: string, results: any[]) => void
  onLoad?: (nodeId: string, data: TreeNodeData[]) => void
  onError?: (error: Error) => void
}

/**
 * React 树形组件引用接口
 */
export interface LDesignTreeRef {
  // 获取树实例
  getTreeInstance: () => Tree | undefined
  
  // 数据操作
  setData: (data: TreeNodeData[]) => void
  getData: () => TreeNodeData[]
  addNode: (nodeData: TreeNodeData, parentId?: string) => void
  removeNode: (nodeId: string) => void
  updateNode: (nodeId: string, nodeData: Partial<TreeNodeData>) => void
  
  // 选择操作
  selectNode: (nodeId: string) => void
  unselectNode: (nodeId: string) => void
  selectAll: () => void
  unselectAll: () => void
  getSelectedNodes: () => string[]
  
  // 展开操作
  expandNode: (nodeId: string) => void
  collapseNode: (nodeId: string) => void
  expandAll: () => void
  collapseAll: () => void
  
  // 搜索操作
  search: (keyword: string) => void
  clearSearch: () => void
  
  // 滚动操作
  scrollToNode: (nodeId: string) => void
  
  // 刷新
  refresh: () => void
}

/**
 * React 树形组件
 */
export const LDesignTree = forwardRef<LDesignTreeRef, LDesignTreeProps>((props, ref) => {
  const {
    data = [],
    options = {},
    selectedKeys = [],
    expandedKeys = [],
    selectionMode = 'single',
    showCheckbox = false,
    draggable = false,
    searchable = false,
    searchKeyword = '',
    virtualScroll = false,
    asyncLoad,
    theme = 'light',
    size = 'medium',
    disabled = false,
    loading = false,
    emptyText = '暂无数据',
    className,
    style,
    onSelect,
    onExpand,
    onCollapse,
    onCheck,
    onUncheck,
    onDragStart,
    onDragEnd,
    onDrop,
    onSearch,
    onLoad,
    onError,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const treeInstanceRef = useRef<Tree>()

  // 初始化树形组件
  const initTree = useCallback(() => {
    if (!containerRef.current) return

    const treeOptions: TreeOptions = {
      selection: {
        mode: selectionMode,
        showCheckbox,
      },
      dragDrop: {
        enabled: draggable,
      },
      search: {
        enabled: searchable,
      },
      virtualScroll: {
        enabled: virtualScroll,
      },
      async: {
        enabled: !!asyncLoad,
        loader: asyncLoad,
      },
      theme,
      size,
      disabled,
      loading,
      emptyText,
      ...options,
    }

    treeInstanceRef.current = new Tree(containerRef.current, treeOptions)

    // 绑定事件
    treeInstanceRef.current.on('select', (nodeIds: string[]) => {
      onSelect?.(nodeIds)
    })

    treeInstanceRef.current.on('expand', (nodeId: string) => {
      onExpand?.(nodeId)
    })

    treeInstanceRef.current.on('collapse', (nodeId: string) => {
      onCollapse?.(nodeId)
    })

    treeInstanceRef.current.on('check', (nodeIds: string[]) => {
      onCheck?.(nodeIds)
    })

    treeInstanceRef.current.on('uncheck', (nodeIds: string[]) => {
      onUncheck?.(nodeIds)
    })

    treeInstanceRef.current.on('dragStart', (nodeId: string) => {
      onDragStart?.(nodeId)
    })

    treeInstanceRef.current.on('dragEnd', (nodeId: string) => {
      onDragEnd?.(nodeId)
    })

    treeInstanceRef.current.on('drop', (data: any) => {
      onDrop?.(data)
    })

    treeInstanceRef.current.on('search', (keyword: string, results: any[]) => {
      onSearch?.(keyword, results)
    })

    treeInstanceRef.current.on('load', (nodeId: string, data: TreeNodeData[]) => {
      onLoad?.(nodeId, data)
    })

    treeInstanceRef.current.on('error', (error: Error) => {
      onError?.(error)
    })

    // 设置初始数据
    if (data.length > 0) {
      treeInstanceRef.current.setData(data)
    }

    // 设置初始选中状态
    if (selectedKeys.length > 0) {
      treeInstanceRef.current.setSelectedNodes(selectedKeys)
    }

    // 设置初始展开状态
    if (expandedKeys.length > 0) {
      treeInstanceRef.current.setExpandedNodes(expandedKeys)
    }

    // 设置初始搜索关键词
    if (searchKeyword) {
      treeInstanceRef.current.search(searchKeyword)
    }
  }, [
    selectionMode,
    showCheckbox,
    draggable,
    searchable,
    virtualScroll,
    asyncLoad,
    theme,
    size,
    disabled,
    loading,
    emptyText,
    options,
  ])

  // 组件挂载时初始化
  useEffect(() => {
    initTree()

    return () => {
      if (treeInstanceRef.current) {
        treeInstanceRef.current.destroy()
      }
    }
  }, [initTree])

  // 监听数据变化
  useEffect(() => {
    if (treeInstanceRef.current) {
      treeInstanceRef.current.setData(data)
    }
  }, [data])

  // 监听选中状态变化
  useEffect(() => {
    if (treeInstanceRef.current) {
      treeInstanceRef.current.setSelectedNodes(selectedKeys)
    }
  }, [selectedKeys])

  // 监听展开状态变化
  useEffect(() => {
    if (treeInstanceRef.current) {
      treeInstanceRef.current.setExpandedNodes(expandedKeys)
    }
  }, [expandedKeys])

  // 监听搜索关键词变化
  useEffect(() => {
    if (treeInstanceRef.current) {
      treeInstanceRef.current.search(searchKeyword)
    }
  }, [searchKeyword])

  // 暴露方法
  useImperativeHandle(ref, () => ({
    // 获取树实例
    getTreeInstance: () => treeInstanceRef.current,
    
    // 数据操作
    setData: (data: TreeNodeData[]) => treeInstanceRef.current?.setData(data),
    getData: () => treeInstanceRef.current?.getData() || [],
    addNode: (nodeData: TreeNodeData, parentId?: string) => treeInstanceRef.current?.addNode(nodeData, parentId),
    removeNode: (nodeId: string) => treeInstanceRef.current?.removeNode(nodeId),
    updateNode: (nodeId: string, nodeData: Partial<TreeNodeData>) => treeInstanceRef.current?.updateNode(nodeId, nodeData),
    
    // 选择操作
    selectNode: (nodeId: string) => treeInstanceRef.current?.selectNode(nodeId),
    unselectNode: (nodeId: string) => treeInstanceRef.current?.unselectNode(nodeId),
    selectAll: () => treeInstanceRef.current?.selectAll(),
    unselectAll: () => treeInstanceRef.current?.unselectAll(),
    getSelectedNodes: () => treeInstanceRef.current?.getSelectedNodes() || [],
    
    // 展开操作
    expandNode: (nodeId: string) => treeInstanceRef.current?.expandNode(nodeId),
    collapseNode: (nodeId: string) => treeInstanceRef.current?.collapseNode(nodeId),
    expandAll: () => treeInstanceRef.current?.expandAll(),
    collapseAll: () => treeInstanceRef.current?.collapseAll(),
    
    // 搜索操作
    search: (keyword: string) => treeInstanceRef.current?.search(keyword),
    clearSearch: () => treeInstanceRef.current?.clearSearch(),
    
    // 滚动操作
    scrollToNode: (nodeId: string) => treeInstanceRef.current?.scrollToNode(nodeId),
    
    // 刷新
    refresh: () => treeInstanceRef.current?.refresh(),
  }))

  // 计算类名
  const classNames = [
    'ldesign-tree-react',
    {
      [`ldesign-tree--${theme}`]: theme !== 'light',
      [`ldesign-tree--${size}`]: size !== 'medium',
      'ldesign-tree--disabled': disabled,
      'ldesign-tree--loading': loading,
    },
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={containerRef}
      className={classNames}
      style={style}
    />
  )
})

LDesignTree.displayName = 'LDesignTree'

// 默认导出
export default LDesignTree
