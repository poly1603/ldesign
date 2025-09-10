# TreeUtils - 树形数据处理工具

TreeUtils 是一个专门处理树形数据结构的工具类，提供数据转换、遍历、查找和操作功能。

## 功能特性

- 🔄 **数据转换**: 扁平数组与树形结构的相互转换
- 🔍 **节点查找**: 高效的树节点查找和路径获取
- 🌲 **树遍历**: 支持深度优先和广度优先遍历
- 🎯 **节点操作**: 过滤、映射、深度计算等操作
- ⚡ **高性能**: 优化的算法确保处理大型树结构的性能
- 🔧 **灵活配置**: 支持自定义字段名和根节点值

## 安装使用

```typescript
import { TreeUtils } from '@ldesign/kit'

// 或者单独导入
import { TreeUtils } from '@ldesign/kit/utils'
```

## 基础用法

### 数据转换

```typescript
// 扁平数组转树形结构
const flatData = [
  { id: '1', name: 'Root', parentId: null },
  { id: '2', name: 'Child 1', parentId: '1' },
  { id: '3', name: 'Child 2', parentId: '1' },
  { id: '4', name: 'Grandchild', parentId: '2' }
]

const tree = TreeUtils.arrayToTree(flatData)
console.log(tree)
/*
[
  {
    id: '1',
    name: 'Root',
    parentId: null,
    children: [
      {
        id: '2',
        name: 'Child 1',
        parentId: '1',
        children: [
          { id: '4', name: 'Grandchild', parentId: '2' }
        ]
      },
      { id: '3', name: 'Child 2', parentId: '1' }
    ]
  }
]
*/

// 树形结构转扁平数组
const flatArray = TreeUtils.treeToArray(tree)
console.log(flatArray) // 返回原始的扁平数组结构
```

### 节点查找

```typescript
// 查找特定节点
const foundNode = TreeUtils.findNode(tree, node => node.id === '4')
console.log(foundNode?.name) // 'Grandchild'

// 获取节点路径
const path = TreeUtils.getNodePath(tree, '4')
console.log(path.map(node => node.name)) // ['Root', 'Child 1', 'Grandchild']
```

### 树操作

```typescript
// 过滤树节点
const filteredTree = TreeUtils.filterTree(tree, node => 
  node.name.includes('Child')
)

// 映射树节点
const mappedTree = TreeUtils.mapTree(tree, node => ({
  ...node,
  displayName: `[${node.id}] ${node.name}`,
  level: TreeUtils.getNodePath(tree, node.id).length
}))

// 获取树的深度
const depth = TreeUtils.getDepth(tree)
console.log(depth) // 3
```

## 高级用法

### 自定义字段配置

```typescript
// 使用自定义字段名
const customData = [
  { key: '1', title: 'Root', parent: null },
  { key: '2', title: 'Child 1', parent: '1' },
  { key: '3', title: 'Child 2', parent: '1' }
]

const customTree = TreeUtils.arrayToTree(customData, {
  idKey: 'key',
  parentIdKey: 'parent',
  childrenKey: 'items',
  rootValue: null
})
```

### 组织架构处理

```typescript
interface Employee {
  id: string
  name: string
  position: string
  managerId: string | null
  department: string
}

const employees: Employee[] = [
  { id: '1', name: 'CEO', position: 'Chief Executive Officer', managerId: null, department: 'Executive' },
  { id: '2', name: 'CTO', position: 'Chief Technology Officer', managerId: '1', department: 'Technology' },
  { id: '3', name: 'CFO', position: 'Chief Financial Officer', managerId: '1', department: 'Finance' },
  { id: '4', name: 'Dev Lead', position: 'Development Lead', managerId: '2', department: 'Technology' },
  { id: '5', name: 'Developer', position: 'Software Developer', managerId: '4', department: 'Technology' }
]

// 构建组织架构树
const orgChart = TreeUtils.arrayToTree(employees, {
  parentIdKey: 'managerId'
})

// 查找某个部门的所有员工
const techEmployees = TreeUtils.filterTree(orgChart, employee => 
  employee.department === 'Technology'
)

// 计算组织层级深度
const orgDepth = TreeUtils.getDepth(orgChart)
console.log(`组织层级深度: ${orgDepth}`)
```

### 菜单系统处理

```typescript
interface MenuItem {
  id: string
  title: string
  url?: string
  parentId: string | null
  order: number
  icon?: string
}

const menuItems: MenuItem[] = [
  { id: '1', title: '首页', url: '/', parentId: null, order: 1 },
  { id: '2', title: '产品', parentId: null, order: 2 },
  { id: '3', title: '手机', url: '/products/phones', parentId: '2', order: 1 },
  { id: '4', title: '电脑', url: '/products/computers', parentId: '2', order: 2 },
  { id: '5', title: '关于我们', url: '/about', parentId: null, order: 3 }
]

// 构建菜单树
const menuTree = TreeUtils.arrayToTree(menuItems)

// 生成面包屑导航
function generateBreadcrumb(menuTree: TreeNode<MenuItem>[], currentId: string) {
  const path = TreeUtils.getNodePath(menuTree, currentId)
  return path.map(node => ({
    title: node.title,
    url: node.url
  }))
}

const breadcrumb = generateBreadcrumb(menuTree, '3')
console.log(breadcrumb) // [{ title: '产品' }, { title: '手机', url: '/products/phones' }]
```

## API 参考

### 类型定义

```typescript
interface TreeNode<T = any> extends Record<string, unknown> {
  id: string
  children?: TreeNode<T>[]
}

interface TreeOptions {
  idKey?: string        // ID字段名，默认 'id'
  parentIdKey?: string  // 父ID字段名，默认 'parentId'
  childrenKey?: string  // 子节点字段名，默认 'children'
  rootValue?: any       // 根节点的父ID值，默认 null
}
```

### 方法列表

| 方法 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `arrayToTree` | 扁平数组转树形结构 | `items: T[], options?: TreeOptions` | `TreeNode<T>[]` |
| `treeToArray` | 树形结构转扁平数组 | `tree: TreeNode<T>[]` | `T[]` |
| `findNode` | 查找节点 | `tree: TreeNode<T>[], predicate: Function` | `TreeNode<T> \| null` |
| `filterTree` | 过滤树节点 | `tree: TreeNode<T>[], predicate: Function` | `TreeNode<T>[]` |
| `mapTree` | 映射树节点 | `tree: TreeNode<T>[], mapper: Function` | `TreeNode<R>[]` |
| `getDepth` | 获取树深度 | `tree: TreeNode<T>[]` | `number` |
| `getNodePath` | 获取节点路径 | `tree: TreeNode<T>[], nodeId: string, idKey?: string` | `TreeNode<T>[]` |

## 性能优化

### 大数据处理

```typescript
// 对于大型数据集，考虑分批处理
function processBigTree<T>(items: T[], batchSize = 1000) {
  const batches = []
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }
  
  return batches.map(batch => TreeUtils.arrayToTree(batch))
}
```

### 缓存优化

```typescript
// 缓存树结构避免重复计算
const treeCache = new Map()

function getCachedTree(data: any[], cacheKey: string) {
  if (!treeCache.has(cacheKey)) {
    treeCache.set(cacheKey, TreeUtils.arrayToTree(data))
  }
  return treeCache.get(cacheKey)
}
```

## 注意事项

1. **循环引用**: 确保数据中没有循环引用，否则可能导致无限递归
2. **内存使用**: 处理大型树结构时注意内存使用情况
3. **深度限制**: 避免过深的树结构，可能导致栈溢出
4. **数据完整性**: 确保父子关系的数据完整性

## 相关资源

- [树数据结构](https://en.wikipedia.org/wiki/Tree_(data_structure))
- [深度优先搜索](https://en.wikipedia.org/wiki/Depth-first_search)
- [广度优先搜索](https://en.wikipedia.org/wiki/Breadth-first_search)
