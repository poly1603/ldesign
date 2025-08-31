# 数组操作

数组操作工具函数提供了丰富的数组处理功能，包括去重、分块、分组、扁平化等常用操作。

## 概述

数组操作模块包含以下功能：
- **去重处理**：移除数组中的重复元素
- **数组分块**：将数组分割成指定大小的块
- **数组分组**：根据指定条件对数组元素进行分组
- **数组扁平化**：将嵌套数组展平
- **集合运算**：交集、并集、差集等操作
- **数组查找**：高效的查找和过滤操作

## 安装和导入

```typescript
// 按需导入
import { unique, chunk, groupBy, flatten } from '@ldesign/shared'

// 或者导入整个数组模块
import { array } from '@ldesign/shared'
const { unique, chunk, groupBy, flatten } = array
```

## API 参考

### unique

移除数组中的重复元素。

**函数签名**
```typescript
function unique<T>(array: T[]): T[]
function unique<T, K>(array: T[], key: keyof T | ((item: T) => K)): T[]
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| array | T[] | ✓ | - | 要去重的数组 |
| key | keyof T \| ((item: T) => K) | ✗ | - | 去重依据的键或函数 |

**返回值**
- `T[]` - 去重后的新数组

**使用示例**

```typescript
// 基础类型去重
const numbers = [1, 2, 2, 3, 3, 4]
const uniqueNumbers = unique(numbers)
console.log(uniqueNumbers) // [1, 2, 3, 4]

// 字符串去重
const strings = ['a', 'b', 'b', 'c']
const uniqueStrings = unique(strings)
console.log(uniqueStrings) // ['a', 'b', 'c']

// 对象数组按属性去重
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 1, name: 'John Doe' }, // 重复的 id
  { id: 3, name: 'Bob' }
]

const uniqueUsers = unique(users, 'id')
console.log(uniqueUsers)
// [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }, { id: 3, name: 'Bob' }]

// 使用函数进行复杂去重
const products = [
  { id: 1, category: 'electronics', name: 'Phone' },
  { id: 2, category: 'books', name: 'Novel' },
  { id: 3, category: 'electronics', name: 'Laptop' }
]

const uniqueByCategory = unique(products, item => item.category)
console.log(uniqueByCategory)
// [{ id: 1, category: 'electronics', name: 'Phone' }, { id: 2, category: 'books', name: 'Novel' }]
```

### chunk

将数组分割成指定大小的块。

**函数签名**
```typescript
function chunk<T>(array: T[], size: number): T[][]
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| array | T[] | ✓ | - | 要分块的数组 |
| size | number | ✓ | - | 每块的大小 |

**返回值**
- `T[][]` - 分块后的二维数组

**使用示例**

```typescript
// 数字数组分块
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const chunks = chunk(numbers, 3)
console.log(chunks) // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

// 不能整除的情况
const items = ['a', 'b', 'c', 'd', 'e']
const itemChunks = chunk(items, 2)
console.log(itemChunks) // [['a', 'b'], ['c', 'd'], ['e']]

// 实际应用：分页处理
const allUsers = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `User${i + 1}` }))
const pageSize = 10
const pages = chunk(allUsers, pageSize)

console.log(`总共 ${pages.length} 页`)
pages.forEach((page, index) => {
  console.log(`第 ${index + 1} 页: ${page.length} 个用户`)
})
```

### groupBy

根据指定条件对数组元素进行分组。

**函数签名**
```typescript
function groupBy<T, K extends string | number | symbol>(
  array: T[], 
  key: keyof T | ((item: T) => K)
): Record<K, T[]>
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| array | T[] | ✓ | - | 要分组的数组 |
| key | keyof T \| ((item: T) => K) | ✓ | - | 分组依据的键或函数 |

**返回值**
- `Record<K, T[]>` - 分组后的对象，键为分组标识，值为该组的元素数组

**使用示例**

```typescript
// 按属性分组
const students = [
  { name: 'Alice', grade: 'A', subject: 'Math' },
  { name: 'Bob', grade: 'B', subject: 'Math' },
  { name: 'Charlie', grade: 'A', subject: 'Science' },
  { name: 'David', grade: 'B', subject: 'Math' },
  { name: 'Eve', grade: 'A', subject: 'Science' }
]

const byGrade = groupBy(students, 'grade')
console.log(byGrade)
// {
//   'A': [
//     { name: 'Alice', grade: 'A', subject: 'Math' },
//     { name: 'Charlie', grade: 'A', subject: 'Science' },
//     { name: 'Eve', grade: 'A', subject: 'Science' }
//   ],
//   'B': [
//     { name: 'Bob', grade: 'B', subject: 'Math' },
//     { name: 'David', grade: 'B', subject: 'Math' }
//   ]
// }

// 使用函数进行复杂分组
const orders = [
  { id: 1, amount: 100, date: '2024-01-15' },
  { id: 2, amount: 250, date: '2024-01-15' },
  { id: 3, amount: 80, date: '2024-01-16' },
  { id: 4, amount: 300, date: '2024-01-16' }
]

const byDate = groupBy(orders, order => order.date)
console.log(byDate)
// {
//   '2024-01-15': [
//     { id: 1, amount: 100, date: '2024-01-15' },
//     { id: 2, amount: 250, date: '2024-01-15' }
//   ],
//   '2024-01-16': [
//     { id: 3, amount: 80, date: '2024-01-16' },
//     { id: 4, amount: 300, date: '2024-01-16' }
//   ]
// }

// 按金额范围分组
const byAmountRange = groupBy(orders, order => {
  if (order.amount < 100) return 'small'
  if (order.amount < 200) return 'medium'
  return 'large'
})
console.log(byAmountRange)
// {
//   'medium': [{ id: 1, amount: 100, date: '2024-01-15' }],
//   'large': [
//     { id: 2, amount: 250, date: '2024-01-15' },
//     { id: 4, amount: 300, date: '2024-01-16' }
//   ],
//   'small': [{ id: 3, amount: 80, date: '2024-01-16' }]
// }
```

### flatten

将嵌套数组展平到指定深度。

**函数签名**
```typescript
function flatten<T>(array: any[], depth?: number): T[]
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| array | any[] | ✓ | - | 要展平的数组 |
| depth | number | ✗ | 1 | 展平深度 |

**返回值**
- `T[]` - 展平后的数组

**使用示例**

```typescript
// 一层展平
const nested1 = [1, [2, 3], [4, [5, 6]]]
const flat1 = flatten(nested1)
console.log(flat1) // [1, 2, 3, 4, [5, 6]]

// 深度展平
const nested2 = [1, [2, [3, [4, 5]]]]
const flat2 = flatten(nested2, 2)
console.log(flat2) // [1, 2, 3, [4, 5]]

// 完全展平
const deepNested = [1, [2, [3, [4, [5]]]]]
const completelyFlat = flatten(deepNested, Infinity)
console.log(completelyFlat) // [1, 2, 3, 4, 5]

// 实际应用：处理嵌套的菜单数据
const menuData = [
  {
    title: '首页',
    children: [
      { title: '概览' },
      { title: '统计' }
    ]
  },
  {
    title: '用户管理',
    children: [
      { title: '用户列表' },
      {
        title: '权限管理',
        children: [
          { title: '角色管理' },
          { title: '权限分配' }
        ]
      }
    ]
  }
]

// 提取所有菜单项的标题
function extractTitles(menus: any[]): string[] {
  return flatten(
    menus.map(menu => [
      menu.title,
      ...(menu.children ? extractTitles(menu.children) : [])
    ])
  )
}

const allTitles = extractTitles(menuData)
console.log(allTitles)
// ['首页', '概览', '统计', '用户管理', '用户列表', '权限管理', '角色管理', '权限分配']
```

## 注意事项

### 性能考虑
- `unique` 函数对于大数组使用 Set 进行优化
- `groupBy` 只遍历数组一次，时间复杂度为 O(n)
- `chunk` 和 `flatten` 都会创建新数组，注意内存使用

### 类型安全
- 所有函数都提供完整的 TypeScript 类型支持
- 泛型参数确保输入输出类型的一致性
- 编译时类型检查避免运行时错误

### 边界情况
```typescript
// 空数组处理
console.log(unique([])) // []
console.log(chunk([], 3)) // []
console.log(groupBy([], 'key')) // {}
console.log(flatten([])) // []

// 无效参数处理
console.log(chunk([1, 2, 3], 0)) // 抛出错误
console.log(chunk([1, 2, 3], -1)) // 抛出错误
console.log(flatten([1, 2, 3], -1)) // [1, 2, 3]（深度为 0）
```

## 相关功能

- [字符串处理](/utils/string) - 字符串相关的工具函数
- [通用工具](/utils/general) - 其他通用工具函数
- [树结构](/utils/tree) - 树形数据结构操作
