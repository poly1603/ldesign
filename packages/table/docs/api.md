# API 文档

## Table 类

### 构造函数

```typescript
new Table<T = any>(config: TableConfig<T>)
```

创建一个新的表格实例。

#### 参数

- `config: TableConfig<T>` - 表格配置对象

#### 示例

```typescript
import { Table } from '@ldesign/table'

const table = new Table({
  container: '#table-container',
  columns: [
    { key: 'name', title: '姓名', sortable: true },
    { key: 'age', title: '年龄', sortable: true }
  ],
  data: [
    { id: 1, name: '张三', age: 25 },
    { id: 2, name: '李四', age: 30 }
  ],
  rowKey: 'id'
})
```

### 配置接口

#### TableConfig<T>

```typescript
interface TableConfig<T> {
  /** 容器元素或选择器 */
  container: HTMLElement | string
  
  /** 列配置 */
  columns: ColumnConfig<T>[]
  
  /** 数据数组 */
  data: T[]
  
  /** 行唯一标识字段 */
  rowKey: keyof T | ((row: T) => string | number)
  
  /** 分页配置 */
  pagination?: PaginationConfig
  
  /** 选择配置 */
  selection?: SelectionConfig
  
  /** 排序配置 */
  sorting?: SortingConfig
  
  /** 筛选配置 */
  filtering?: FilteringConfig
  
  /** 虚拟滚动配置 */
  virtualScroll?: VirtualScrollConfig
  
  /** 可编辑配置 */
  editable?: EditableConfig<T>
  
  /** 拖拽排序配置 */
  dragSort?: DragSortConfig<T>
  
  /** 导出配置 */
  export?: ExportConfig
  
  /** 主题配置 */
  theme?: ThemeConfig
  
  /** 性能配置 */
  performance?: PerformanceConfig
}
```

#### ColumnConfig<T>

```typescript
interface ColumnConfig<T> {
  /** 列键名 */
  key: keyof T | string
  
  /** 列标题 */
  title: string
  
  /** 列宽度 */
  width?: number | string
  
  /** 最小宽度 */
  minWidth?: number
  
  /** 最大宽度 */
  maxWidth?: number
  
  /** 是否可排序 */
  sortable?: boolean
  
  /** 是否可筛选 */
  filterable?: boolean
  
  /** 是否可调整大小 */
  resizable?: boolean
  
  /** 是否固定列 */
  fixed?: 'left' | 'right'
  
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  
  /** 自定义渲染函数 */
  render?: (value: any, row: T, index: number) => string | HTMLElement
  
  /** 自定义排序函数 */
  sorter?: (a: T, b: T) => number
  
  /** 筛选选项 */
  filters?: FilterOption[]
  
  /** 列类名 */
  className?: string
  
  /** 列样式 */
  style?: CSSStyleDeclaration | Record<string, string>
}
```

### 实例方法

#### 数据操作

##### setData(data: T[]): void

设置表格数据。

```typescript
table.setData([
  { id: 1, name: '张三', age: 25 },
  { id: 2, name: '李四', age: 30 }
])
```

##### getData(): T[]

获取当前表格数据。

```typescript
const data = table.getData()
console.log(data) // 返回当前数据数组
```

##### addRow(row: T): void

添加单行数据。

```typescript
table.addRow({ id: 3, name: '王五', age: 28 })
```

##### addRows(rows: T[]): void

批量添加多行数据。

```typescript
table.addRows([
  { id: 3, name: '王五', age: 28 },
  { id: 4, name: '赵六', age: 32 }
])
```

##### updateRow(key: string | number, row: Partial<T>): void

更新指定行数据。

```typescript
table.updateRow(1, { age: 26 })
```

##### removeRow(key: string | number): void

删除指定行。

```typescript
table.removeRow(1)
```

##### removeRows(keys: (string | number)[]): void

批量删除多行。

```typescript
table.removeRows([1, 2, 3])
```

#### 选择操作

##### getSelectedRows(): T[]

获取选中的行数据。

```typescript
const selectedRows = table.getSelectedRows()
console.log(selectedRows)
```

##### selectRow(key: string | number): void

选中指定行。

```typescript
table.selectRow(1)
```

##### selectRows(keys: (string | number)[]): void

批量选中多行。

```typescript
table.selectRows([1, 2, 3])
```

##### unselectRow(key: string | number): void

取消选中指定行。

```typescript
table.unselectRow(1)
```

##### selectAll(): void

选中所有行。

```typescript
table.selectAll()
```

##### clearSelection(): void

清空选择。

```typescript
table.clearSelection()
```

#### 排序操作

##### sort(column: string, direction: 'asc' | 'desc'): void

对指定列进行排序。

```typescript
table.sort('age', 'desc')
```

##### clearSort(): void

清除排序。

```typescript
table.clearSort()
```

##### getSortState(): SortState

获取当前排序状态。

```typescript
const sortState = table.getSortState()
console.log(sortState) // { column: 'age', direction: 'desc' }
```

#### 筛选操作

##### setFilter(key: string, filter: FilterFunction<T> | any): void

设置筛选条件。

```typescript
// 函数筛选
table.setFilter('age', (row) => row.age > 25)

// 值筛选
table.setFilter('department', '技术部')
```

##### clearFilter(key: string): void

清除指定筛选条件。

```typescript
table.clearFilter('age')
```

##### clearAllFilters(): void

清除所有筛选条件。

```typescript
table.clearAllFilters()
```

##### getFilterState(): Record<string, any>

获取当前筛选状态。

```typescript
const filters = table.getFilterState()
console.log(filters)
```

#### 分页操作

##### setPage(page: number): void

设置当前页码。

```typescript
table.setPage(2)
```

##### setPageSize(size: number): void

设置每页大小。

```typescript
table.setPageSize(20)
```

##### getPaginationState(): PaginationState

获取分页状态。

```typescript
const pagination = table.getPaginationState()
console.log(pagination) // { current: 1, pageSize: 10, total: 100 }
```

#### 导出操作

##### exportData(options: ExportOptions): void

导出数据。

```typescript
table.exportData({
  format: 'csv',
  filename: '数据导出.csv',
  columns: ['name', 'age'],
  includeHeaders: true
})
```

#### 主题操作

##### setTheme(config: Partial<ThemeConfig>): void

设置主题。

```typescript
table.setTheme({
  type: 'dark',
  responsive: 'auto'
})
```

##### getTheme(): ThemeConfig

获取当前主题配置。

```typescript
const theme = table.getTheme()
console.log(theme)
```

##### toggleTheme(): void

切换明亮/暗黑主题。

```typescript
table.toggleTheme()
```

#### 事件操作

##### on(event: string, handler: Function): void

绑定事件监听器。

```typescript
table.on('selection-change', (data) => {
  console.log('选择变更:', data.selectedRows)
})
```

##### off(event: string, handler?: Function): void

移除事件监听器。

```typescript
table.off('selection-change', handler)
```

##### emit(event: string, data?: any): void

触发事件。

```typescript
table.emit('custom-event', { message: 'Hello' })
```

#### 生命周期

##### refresh(): void

刷新表格。

```typescript
table.refresh()
```

##### resize(): void

重新计算表格尺寸。

```typescript
table.resize()
```

##### destroy(): void

销毁表格实例。

```typescript
table.destroy()
```

### 事件系统

#### 数据事件

- `data-change` - 数据变更时触发
- `row-add` - 添加行时触发
- `row-update` - 更新行时触发
- `row-remove` - 删除行时触发

#### 选择事件

- `selection-change` - 选择变更时触发
- `row-select` - 选中行时触发
- `row-unselect` - 取消选中行时触发

#### 排序事件

- `sort-change` - 排序变更时触发

#### 筛选事件

- `filter-change` - 筛选变更时触发

#### 分页事件

- `page-change` - 页码变更时触发
- `page-size-change` - 每页大小变更时触发

#### 编辑事件

- `edit-start` - 开始编辑时触发
- `edit-end` - 结束编辑时触发
- `edit-save` - 保存编辑时触发
- `edit-cancel` - 取消编辑时触发

#### 拖拽事件

- `drag-start` - 开始拖拽时触发
- `drag-end` - 结束拖拽时触发
- `sort-change` - 排序变更时触发

#### 导出事件

- `export-start` - 开始导出时触发
- `export-progress` - 导出进度时触发
- `export-complete` - 导出完成时触发
- `export-error` - 导出错误时触发

#### 主题事件

- `theme-change` - 主题变更时触发

#### 生命周期事件

- `init` - 初始化完成时触发
- `render` - 渲染完成时触发
- `destroy` - 销毁时触发

### 类型定义

#### 基础类型

```typescript
type SortDirection = 'asc' | 'desc'
type FilterFunction<T> = (row: T) => boolean
type RenderFunction<T> = (value: any, row: T, index: number) => string | HTMLElement

interface SortState {
  column: string
  direction: SortDirection
}

interface PaginationState {
  current: number
  pageSize: number
  total: number
}

interface FilterOption {
  text: string
  value: any
}
```

#### 配置类型

详细的配置类型定义请参考 [类型定义文档](./types.md)。

### 错误处理

表格组件提供了完善的错误处理机制：

```typescript
try {
  table.setData(invalidData)
} catch (error) {
  console.error('数据设置失败:', error.message)
}

// 监听错误事件
table.on('error', (error) => {
  console.error('表格错误:', error)
})
```

### 最佳实践

1. **性能优化**
   - 对于大数据集，启用虚拟滚动
   - 使用 `rowKey` 提高更新性能
   - 避免在渲染函数中进行复杂计算

2. **内存管理**
   - 及时调用 `destroy()` 方法清理资源
   - 移除不需要的事件监听器

3. **类型安全**
   - 使用 TypeScript 获得更好的类型检查
   - 为数据定义明确的接口

4. **用户体验**
   - 提供加载状态指示
   - 实现适当的错误处理和用户反馈
