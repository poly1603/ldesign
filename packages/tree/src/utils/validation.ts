/**
 * 数据验证工具函数
 */

import type { TreeNodeData, TreeOptions } from '../types'

/**
 * 验证节点数据
 */
export function validateNodeData(node: any): node is TreeNodeData {
  if (!node || typeof node !== 'object') {
    return false
  }
  
  // 必需字段检查
  if (typeof node.id !== 'string' || !node.id) {
    return false
  }
  
  if (typeof node.label !== 'string') {
    return false
  }
  
  // 可选字段类型检查
  if (node.parentId !== undefined && typeof node.parentId !== 'string') {
    return false
  }
  
  if (node.children !== undefined && !Array.isArray(node.children)) {
    return false
  }
  
  if (node.icon !== undefined && typeof node.icon !== 'string') {
    return false
  }
  
  if (node.disabled !== undefined && typeof node.disabled !== 'boolean') {
    return false
  }
  
  if (node.expanded !== undefined && typeof node.expanded !== 'boolean') {
    return false
  }
  
  if (node.selected !== undefined && typeof node.selected !== 'boolean') {
    return false
  }
  
  if (node.loading !== undefined && typeof node.loading !== 'boolean') {
    return false
  }
  
  // 递归验证子节点
  if (node.children) {
    for (const child of node.children) {
      if (!validateNodeData(child)) {
        return false
      }
    }
  }
  
  return true
}

/**
 * 验证树形数据
 */
export function validateTreeData(data: any): data is TreeNodeData[] {
  if (!Array.isArray(data)) {
    return false
  }
  
  // 检查ID唯一性
  const ids = new Set<string>()
  
  function collectIds(nodes: TreeNodeData[]) {
    for (const node of nodes) {
      if (ids.has(node.id)) {
        return false // 重复ID
      }
      ids.add(node.id)
      
      if (node.children) {
        if (!collectIds(node.children)) {
          return false
        }
      }
    }
    return true
  }
  
  // 验证每个节点
  for (const node of data) {
    if (!validateNodeData(node)) {
      return false
    }
  }
  
  // 检查ID唯一性
  if (!collectIds(data)) {
    return false
  }
  
  return true
}

/**
 * 验证配置选项
 */
export function validateOptions(options: any): options is TreeOptions {
  if (!options || typeof options !== 'object') {
    return true // 空配置是有效的
  }
  
  // 验证数据
  if (options.data !== undefined && !validateTreeData(options.data)) {
    return false
  }
  
  // 验证选择配置
  if (options.selection !== undefined) {
    const { selection } = options
    if (typeof selection !== 'object') {
      return false
    }
    
    if (selection.mode !== undefined) {
      const validModes = ['single', 'multiple', 'cascade']
      if (!validModes.includes(selection.mode)) {
        return false
      }
    }
    
    if (selection.showCheckbox !== undefined && typeof selection.showCheckbox !== 'boolean') {
      return false
    }
    
    if (selection.showRadio !== undefined && typeof selection.showRadio !== 'boolean') {
      return false
    }
    
    if (selection.disabled !== undefined && typeof selection.disabled !== 'boolean') {
      return false
    }
  }
  
  // 验证拖拽配置
  if (options.dragDrop !== undefined) {
    const { dragDrop } = options
    if (typeof dragDrop !== 'object') {
      return false
    }
    
    if (dragDrop.enabled !== undefined && typeof dragDrop.enabled !== 'boolean') {
      return false
    }
    
    if (dragDrop.allowCrossLevel !== undefined && typeof dragDrop.allowCrossLevel !== 'boolean') {
      return false
    }
    
    if (dragDrop.allowReorder !== undefined && typeof dragDrop.allowReorder !== 'boolean') {
      return false
    }
  }
  
  // 验证搜索配置
  if (options.search !== undefined) {
    const { search } = options
    if (typeof search !== 'object') {
      return false
    }
    
    if (search.enabled !== undefined && typeof search.enabled !== 'boolean') {
      return false
    }
    
    if (search.placeholder !== undefined && typeof search.placeholder !== 'string') {
      return false
    }
    
    if (search.highlightMatches !== undefined && typeof search.highlightMatches !== 'boolean') {
      return false
    }
  }
  
  return true
}

/**
 * 验证节点ID
 */
export function validateNodeId(id: any): id is string {
  return typeof id === 'string' && id.length > 0
}

/**
 * 验证节点ID数组
 */
export function validateNodeIds(ids: any): ids is string[] {
  if (!Array.isArray(ids)) {
    return false
  }
  
  return ids.every(id => validateNodeId(id))
}
