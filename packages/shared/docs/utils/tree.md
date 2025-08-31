# 树结构

树结构工具函数提供了完整的树形数据处理功能，包括构建、遍历、查找、过滤等操作。

## 概述

树结构模块包含以下功能：
- **树构建**：从扁平数据构建树形结构
- **树遍历**：深度优先和广度优先遍历
- **节点操作**：查找、插入、删除、移动节点
- **树转换**：树形结构与扁平结构的相互转换
- **树过滤**：根据条件过滤树节点

## 安装和导入

```typescript
// 按需导入
import { 
  buildTree, 
  flattenTree, 
  findTreeNode, 
  filterTree,
  mapTree 
} from '@ldesign/shared'

// 或者导入整个树模块
import { tree } from '@ldesign/shared'
```

## 类型定义

```typescript
interface TreeNode<T = any> {
  id: string | number
  parentId?: string | number | null
  children?: TreeNode<T>[]
  [key: string]: any
}

interface TreeOptions {
  idKey?: string
  parentIdKey?: string
  childrenKey?: string
  rootValue?: any
}
```

## API 参考

### buildTree

从扁平数据构建树形结构。

**函数签名**
```typescript
function buildTree<T extends Record<string, any>>(
  data: T[],
  options?: TreeOptions
): TreeNode<T>[]
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| data | T[] | ✓ | - | 扁平数据数组 |
| options | TreeOptions | ✗ | {} | 构建选项 |

**选项说明**

| 选项 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| idKey | string | ✗ | 'id' | ID 字段名 |
| parentIdKey | string | ✗ | 'parentId' | 父级 ID 字段名 |
| childrenKey | string | ✗ | 'children' | 子节点字段名 |
| rootValue | any | ✗ | null | 根节点的父级 ID 值 |

**返回值**
- `TreeNode<T>[]` - 树形结构数组

**使用示例**

```typescript
// 基础菜单数据
const menuData = [
  { id: 1, name: '首页', parentId: null, path: '/' },
  { id: 2, name: '用户管理', parentId: null, path: '/users' },
  { id: 3, name: '用户列表', parentId: 2, path: '/users/list' },
  { id: 4, name: '添加用户', parentId: 2, path: '/users/add' },
  { id: 5, name: '系统设置', parentId: null, path: '/settings' },
  { id: 6, name: '权限管理', parentId: 5, path: '/settings/permissions' }
]

const menuTree = buildTree(menuData)
console.log(menuTree)
// [
//   { id: 1, name: '首页', parentId: null, path: '/', children: [] },
//   {
//     id: 2, name: '用户管理', parentId: null, path: '/users',
//     children: [
//       { id: 3, name: '用户列表', parentId: 2, path: '/users/list', children: [] },
//       { id: 4, name: '添加用户', parentId: 2, path: '/users/add', children: [] }
//     ]
//   },
//   {
//     id: 5, name: '系统设置', parentId: null, path: '/settings',
//     children: [
//       { id: 6, name: '权限管理', parentId: 5, path: '/settings/permissions', children: [] }
//     ]
//   }
// ]

// 自定义字段名
const orgData = [
  { code: 'ROOT', title: '总公司', parent: null },
  { code: 'BJ', title: '北京分公司', parent: 'ROOT' },
  { code: 'SH', title: '上海分公司', parent: 'ROOT' },
  { code: 'BJ_DEV', title: '北京研发部', parent: 'BJ' },
  { code: 'BJ_SALES', title: '北京销售部', parent: 'BJ' }
]

const orgTree = buildTree(orgData, {
  idKey: 'code',
  parentIdKey: 'parent',
  childrenKey: 'departments'
})

// 实际应用：构建部门树
class DepartmentManager {
  buildDepartmentTree(departments: any[]) {
    return buildTree(departments, {
      idKey: 'deptId',
      parentIdKey: 'parentDeptId',
      rootValue: 0
    })
  }
  
  renderDepartmentSelect(tree: TreeNode[]) {
    const options: Array<{ value: any; label: string; level: number }> = []
    
    const traverse = (nodes: TreeNode[], level = 0) => {
      nodes.forEach(node => {
        options.push({
          value: node.deptId,
          label: '  '.repeat(level) + node.name,
          level
        })
        
        if (node.children?.length) {
          traverse(node.children, level + 1)
        }
      })
    }
    
    traverse(tree)
    return options
  }
}
```

### flattenTree

将树形结构转换为扁平数组。

**函数签名**
```typescript
function flattenTree<T>(
  tree: TreeNode<T>[],
  options?: {
    childrenKey?: string
    includeParent?: boolean
    maxDepth?: number
  }
): T[]
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| tree | TreeNode\<T\>[] | ✓ | - | 树形结构 |
| options | object | ✗ | {} | 扁平化选项 |

**使用示例**

```typescript
const tree = [
  {
    id: 1, name: '根节点',
    children: [
      { id: 2, name: '子节点1', children: [] },
      {
        id: 3, name: '子节点2',
        children: [
          { id: 4, name: '孙节点1', children: [] }
        ]
      }
    ]
  }
]

// 基础扁平化
const flattened = flattenTree(tree)
console.log(flattened.map(node => ({ id: node.id, name: node.name })))
// [
//   { id: 1, name: '根节点' },
//   { id: 2, name: '子节点1' },
//   { id: 3, name: '子节点2' },
//   { id: 4, name: '孙节点1' }
// ]

// 限制深度
const limitedFlat = flattenTree(tree, { maxDepth: 2 })

// 实际应用：生成面包屑导航
function generateBreadcrumb(tree: TreeNode[], targetId: string | number) {
  const flattened = flattenTree(tree)
  const target = flattened.find(node => node.id === targetId)
  
  if (!target) return []
  
  const breadcrumb = []
  let current = target
  
  while (current) {
    breadcrumb.unshift(current)
    current = flattened.find(node => node.id === current.parentId)
  }
  
  return breadcrumb
}
```

### findTreeNode

在树中查找节点。

**函数签名**
```typescript
function findTreeNode<T>(
  tree: TreeNode<T>[],
  predicate: (node: TreeNode<T>) => boolean,
  options?: {
    childrenKey?: string
    findAll?: boolean
  }
): TreeNode<T> | TreeNode<T>[] | null
```

**使用示例**

```typescript
const tree = buildTree(menuData)

// 根据 ID 查找
const userManagement = findTreeNode(tree, node => node.id === 2)
console.log(userManagement?.name) // '用户管理'

// 根据路径查找
const userList = findTreeNode(tree, node => node.path === '/users/list')

// 查找所有匹配的节点
const allUserPages = findTreeNode(tree, 
  node => node.path?.includes('/users'), 
  { findAll: true }
) as TreeNode[]

// 实际应用：权限检查
class PermissionChecker {
  hasPermission(tree: TreeNode[], userId: number, requiredPermission: string): boolean {
    const userNode = findTreeNode(tree, node => node.userId === userId)
    
    if (!userNode) return false
    
    // 检查用户及其所有父级节点的权限
    const checkNodePermissions = (node: TreeNode): boolean => {
      if (node.permissions?.includes(requiredPermission)) {
        return true
      }
      
      // 检查父级权限
      if (node.parentId) {
        const parent = findTreeNode(tree, n => n.id === node.parentId)
        return parent ? checkNodePermissions(parent) : false
      }
      
      return false
    }
    
    return checkNodePermissions(userNode)
  }
}
```

### filterTree

根据条件过滤树节点。

**函数签名**
```typescript
function filterTree<T>(
  tree: TreeNode<T>[],
  predicate: (node: TreeNode<T>) => boolean,
  options?: {
    childrenKey?: string
    includeParents?: boolean
    includeChildren?: boolean
  }
): TreeNode<T>[]
```

**使用示例**

```typescript
// 过滤活跃的菜单项
const activeMenus = filterTree(menuTree, node => node.active !== false)

// 过滤有权限的菜单
const authorizedMenus = filterTree(menuTree, node => {
  return userPermissions.includes(node.permission)
}, {
  includeParents: true // 包含父级节点
})

// 实际应用：搜索功能
class TreeSearch {
  search(tree: TreeNode[], keyword: string): TreeNode[] {
    if (!keyword.trim()) return tree
    
    return filterTree(tree, node => {
      return node.name?.toLowerCase().includes(keyword.toLowerCase()) ||
             node.description?.toLowerCase().includes(keyword.toLowerCase())
    }, {
      includeParents: true,
      includeChildren: true
    })
  }
  
  // 高亮搜索结果
  highlightSearchResults(tree: TreeNode[], keyword: string): TreeNode[] {
    return mapTree(tree, node => ({
      ...node,
      highlighted: node.name?.toLowerCase().includes(keyword.toLowerCase())
    }))
  }
}
```

### mapTree

映射树节点，返回新的树结构。

**函数签名**
```typescript
function mapTree<T, R>(
  tree: TreeNode<T>[],
  mapper: (node: TreeNode<T>, level: number, parent?: TreeNode<T>) => TreeNode<R>,
  options?: {
    childrenKey?: string
  }
): TreeNode<R>[]
```

**使用示例**

```typescript
// 添加层级信息
const treeWithLevels = mapTree(menuTree, (node, level) => ({
  ...node,
  level,
  indent: '  '.repeat(level),
  isLeaf: !node.children?.length
}))

// 转换为选择器选项
const selectOptions = mapTree(menuTree, (node, level) => ({
  value: node.id,
  label: '  '.repeat(level) + node.name,
  disabled: node.disabled || false
}))

// 实际应用：生成导航组件数据
class NavigationBuilder {
  buildNavigation(tree: TreeNode[]): any[] {
    return mapTree(tree, (node, level) => ({
      key: node.id,
      title: node.name,
      icon: node.icon,
      path: node.path,
      level,
      children: node.children?.length ? [] : undefined // 将在递归中填充
    }))
  }
  
  // 添加统计信息
  addStatistics(tree: TreeNode[]): TreeNode[] {
    return mapTree(tree, (node) => {
      const childCount = this.countAllChildren(node)
      const leafCount = this.countLeafNodes(node)
      
      return {
        ...node,
        statistics: {
          totalChildren: childCount,
          leafNodes: leafCount,
          hasChildren: childCount > 0
        }
      }
    })
  }
  
  private countAllChildren(node: TreeNode): number {
    if (!node.children?.length) return 0
    
    return node.children.reduce((count, child) => {
      return count + 1 + this.countAllChildren(child)
    }, 0)
  }
  
  private countLeafNodes(node: TreeNode): number {
    if (!node.children?.length) return 1
    
    return node.children.reduce((count, child) => {
      return count + this.countLeafNodes(child)
    }, 0)
  }
}
```

## 高级应用

### 树形表格

```typescript
class TreeTable {
  expandedKeys = new Set<string | number>()
  
  flattenForTable(tree: TreeNode[]): Array<TreeNode & { level: number; hasChildren: boolean }> {
    const result: Array<TreeNode & { level: number; hasChildren: boolean }> = []
    
    const traverse = (nodes: TreeNode[], level = 0) => {
      nodes.forEach(node => {
        const hasChildren = Boolean(node.children?.length)
        
        result.push({
          ...node,
          level,
          hasChildren
        })
        
        // 只有展开的节点才显示子节点
        if (hasChildren && this.expandedKeys.has(node.id)) {
          traverse(node.children!, level + 1)
        }
      })
    }
    
    traverse(tree)
    return result
  }
  
  toggleExpand(nodeId: string | number) {
    if (this.expandedKeys.has(nodeId)) {
      this.expandedKeys.delete(nodeId)
    } else {
      this.expandedKeys.add(nodeId)
    }
  }
}
```

### 拖拽排序

```typescript
class TreeDragSort {
  moveNode(tree: TreeNode[], dragId: string | number, dropId: string | number, position: 'before' | 'after' | 'inside'): TreeNode[] {
    const clonedTree = deepClone(tree)
    const flattened = flattenTree(clonedTree)
    
    const dragNode = flattened.find(node => node.id === dragId)
    const dropNode = flattened.find(node => node.id === dropId)
    
    if (!dragNode || !dropNode) return tree
    
    // 移除拖拽节点
    this.removeNode(clonedTree, dragId)
    
    // 插入到新位置
    this.insertNode(clonedTree, dragNode, dropNode, position)
    
    return clonedTree
  }
  
  private removeNode(tree: TreeNode[], nodeId: string | number): boolean {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].id === nodeId) {
        tree.splice(i, 1)
        return true
      }
      
      if (tree[i].children && this.removeNode(tree[i].children!, nodeId)) {
        return true
      }
    }
    
    return false
  }
  
  private insertNode(tree: TreeNode[], node: TreeNode, target: TreeNode, position: string) {
    // 实现插入逻辑
    // ...
  }
}
```

## 注意事项

### 性能优化
- 大型树结构考虑虚拟滚动
- 频繁操作时使用缓存
- 避免深度过大的树结构

### 内存管理
- 及时清理不需要的树节点
- 避免循环引用
- 使用弱引用处理临时数据

### 数据一致性
- 确保 ID 的唯一性
- 验证父子关系的正确性
- 处理孤儿节点

## 相关功能

- [数组操作](/utils/array) - 数组处理工具
- [通用工具](/utils/general) - 深度克隆等工具
- [useVirtualList](/hooks/use-virtual-list) - 虚拟列表 Hook
