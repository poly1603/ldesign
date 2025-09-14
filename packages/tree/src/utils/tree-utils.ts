/**
 * 树形数据处理工具函数
 */

import type { TreeNodeData } from '../types'

/**
 * 扁平化树形数据
 */
export function flattenTree(nodes: TreeNodeData[]): TreeNodeData[] {
  const result: TreeNodeData[] = []
  
  function traverse(nodeList: TreeNodeData[]) {
    for (const node of nodeList) {
      result.push(node)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    }
  }
  
  traverse(nodes)
  return result
}

/**
 * 根据ID查找节点
 */
export function findNodeById(nodes: TreeNodeData[], id: string): TreeNodeData | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }
    
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) {
        return found
      }
    }
  }
  
  return null
}

/**
 * 获取节点的所有父节点ID
 */
export function getParentIds(nodes: TreeNodeData[], nodeId: string): string[] {
  const parentIds: string[] = []
  
  function findParents(nodeList: TreeNodeData[], targetId: string, currentPath: string[]): boolean {
    for (const node of nodeList) {
      const newPath = [...currentPath, node.id]
      
      if (node.id === targetId) {
        parentIds.push(...currentPath)
        return true
      }
      
      if (node.children && findParents(node.children, targetId, newPath)) {
        return true
      }
    }
    
    return false
  }
  
  findParents(nodes, nodeId, [])
  return parentIds
}

/**
 * 获取节点的所有子节点ID
 */
export function getChildrenIds(node: TreeNodeData): string[] {
  const childrenIds: string[] = []
  
  function traverse(currentNode: TreeNodeData) {
    if (currentNode.children) {
      for (const child of currentNode.children) {
        childrenIds.push(child.id)
        traverse(child)
      }
    }
  }
  
  traverse(node)
  return childrenIds
}

/**
 * 过滤树形数据
 */
export function filterTree(
  nodes: TreeNodeData[],
  predicate: (node: TreeNodeData) => boolean
): TreeNodeData[] {
  const result: TreeNodeData[] = []
  
  for (const node of nodes) {
    const filteredChildren = node.children ? filterTree(node.children, predicate) : []
    
    if (predicate(node) || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren,
      })
    }
  }
  
  return result
}

/**
 * 深度克隆树形数据
 */
export function cloneTree(nodes: TreeNodeData[]): TreeNodeData[] {
  return nodes.map(node => ({
    ...node,
    children: node.children ? cloneTree(node.children) : undefined,
  }))
}

/**
 * 计算树的深度
 */
export function getTreeDepth(nodes: TreeNodeData[]): number {
  let maxDepth = 0
  
  function traverse(nodeList: TreeNodeData[], depth: number) {
    maxDepth = Math.max(maxDepth, depth)
    
    for (const node of nodeList) {
      if (node.children && node.children.length > 0) {
        traverse(node.children, depth + 1)
      }
    }
  }
  
  traverse(nodes, 1)
  return maxDepth
}

/**
 * 获取节点在树中的路径
 */
export function getNodePath(nodes: TreeNodeData[], nodeId: string): TreeNodeData[] {
  const path: TreeNodeData[] = []
  
  function findPath(nodeList: TreeNodeData[]): boolean {
    for (const node of nodeList) {
      path.push(node)
      
      if (node.id === nodeId) {
        return true
      }
      
      if (node.children && findPath(node.children)) {
        return true
      }
      
      path.pop()
    }
    
    return false
  }
  
  findPath(nodes)
  return path
}
