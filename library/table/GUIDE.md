# LDesign Table 完整使用指南

## 目录

1. [基础用法](#基础用法)
2. [核心功能](#核心功能)
3. [高级功能](#高级功能)
4. [框架集成](#框架集成)
5. [API参考](#api参考)
6. [常见问题](#常见问题)

## 基础用法

### 最简单的表格

```typescript
import { TableCore } from '@ldesign/table-core';

const table = new TableCore({
  data: [
    { id: 1, name: '张三', age: 28 },
    { id: 2, name: '李四', age: 32 },
  ],
  columns: [
    { id: 'id', prop: 'id', label: 'ID' },
    { id: 'name', prop: 'name', label: '姓名' },
    { id: 'age', prop: 'age', label: '年龄' },
  ],
  rowKey: 'id',
});

// 监听状态变化
table.subscribe((state) => {
  console.log('当前数据:', state.processedData);
});
```

## 核心功能

### 1. 虚拟滚动

适用于大数据量场景（10万+行）。

```typescript
const table = new TableCore({
  data: largeData, // 100,000行
  columns,
  rowKey: 'id',
  virtual: true,        // 开启虚拟滚动
  rowHeight: 48,        // 固定行高
  headerHeight: 48,     // 表头高度
  overscan: 3,          // 缓冲区大小
});

// 设置容器尺寸
table.setContainerSize(800, 600);

// 监听滚动
containerEl.addEventListener('scroll', (e) => {
  table.setScrollTop(e.target.scrollTop);
  table.setScrollLeft(e.target.scrollLeft);
});

// 获取可见范围
const range = table.getVisibleRange();
console.log(`显示第 ${range.start} 到 ${range.end} 行`);
```

### 2. 排序

#### 单列排序

```typescript
// 升序
table.setSorting([{ id: 'age', order: 'asc' }]);

// 降序
table.setSorting([{ id: 'age', order: 'desc' }]);

// 清除排序
table.setSorting([]);
```

#### 多列排序

```typescript
table.setSorting([
  { id: 'age', order: 'asc' },      // 先按年龄
  { id: 'name', order: 'desc' },    // 再按姓名
]);
```

#### 自定义排序

```typescript
const columns = [
  {
    id: 'score',
    prop: 'score',
    label: '分数',
    sortable: true,
    sortFn: (a, b) => {
      // 自定义排序逻辑
      return a.score - b.score;
    },
  },
];
```

### 3. 筛选

#### 基础筛选

```typescript
// 单条件
table.setFilters([
  { field: 'age', operator: 'gt', value: 25 },
]);

// 多条件
table.setFilters([
  { field: 'age', operator: 'gte', value: 25 },
  { field: 'age', operator: 'lte', value: 35 },
  { field: 'name', operator: 'contains', value: '张' },
]);
```

#### 支持的操作符

- `eq` - 等于
- `ne` - 不等于
- `gt` - 大于
- `gte` - 大于等于
- `lt` - 小于
- `lte` - 小于等于
- `contains` - 包含
- `startsWith` - 开头是
- `endsWith` - 结尾是
- `in` - 在...之中

#### 自定义筛选

```typescript
const columns = [
  {
    id: 'status',
    prop: 'status',
    label: '状态',
    filterable: true,
    filterFn: (value, row) => {
      // 自定义筛选逻辑
      return row.status === 'active' && row.age > 25;
    },
  },
];
```

### 4. 分页

```typescript
// 客户端分页
table.setPagination({
  pageIndex: 0,    // 当前页（从0开始）
  pageSize: 20,    // 每页条数
  total: 100,      // 总条数（自动计算）
});

// 翻页
table.setPagination({
  pageIndex: 1,
  pageSize: 20,
});

// 取消分页
table.setPagination(null);
```

### 5. 选择

#### 单选模式

```typescript
const table = new TableCore({
  data,
  columns,
  rowKey: 'id',
  selectionMode: 'single',
});

// 选择某行
table.toggleRowSelection(1);

// 获取选中行
const selected = table.getSelectedRows();
```

#### 多选模式

```typescript
const table = new TableCore({
  data,
  columns,
  rowKey: 'id',
  selectionMode: 'multiple',
});

// 选择某行
table.toggleRowSelection(1);
table.toggleRowSelection(2);

// 全选
table.toggleSelectAll();

// 获取选中行
const selected = table.getSelectedRows();
```

### 6. 展开行

```typescript
// 展开某行
table.toggleRowExpand(1);

// 获取展开状态
const state = table.getState();
const isExpanded = state.expand.expandedRowKeys.has(1);
```

### 7. 固定列

```typescript
const columns = [
  {
    id: 'id',
    prop: 'id',
    label: 'ID',
    width: 80,
    fixed: 'left',  // 左固定
  },
  {
    id: 'name',
    prop: 'name',
    label: '姓名',
    width: 120,
    fixed: 'left',
  },
  // ... 中间列
  {
    id: 'action',
    label: '操作',
    width: 100,
    fixed: 'right', // 右固定
  },
];
```

### 8. 列宽调整

```typescript
// 调整列宽
table.resizeColumn('name', 200);

// 列定义中设置范围
const columns = [
  {
    id: 'name',
    prop: 'name',
    label: '姓名',
    width: 120,
    minWidth: 80,
    maxWidth: 300,
    resizable: true,
  },
];
```

## 高级功能

### 1. 单元格编辑

```typescript
const editManager = table.getColumnManager();

// 开始编辑
table.startEdit(rowKey, columnId, currentValue);

// 更新值
table.updateCell(rowKey, columnId, newValue);

// 结束编辑
table.endEdit(rowKey, columnId);

// 监听编辑事件
table.on('onCellEdit', (cell) => {
  console.log('编辑:', cell);
});
```

### 2. 数据导出

#### CSV导出

```typescript
table.exportData({
  format: 'csv',
  filename: 'data',
  includeHeader: true,
  delimiter: ',',
});
```

#### Excel导出

```typescript
table.exportData({
  format: 'excel',
  filename: 'data',
  includeHeader: true,
});
```

#### JSON导出

```typescript
table.exportData({
  format: 'json',
  filename: 'data',
});
```

#### 导出指定列

```typescript
table.exportData({
  format: 'csv',
  filename: 'data',
  columns: ['id', 'name', 'age'], // 只导出这些列
});
```

### 3. 自定义渲染

```typescript
const columns = [
  {
    id: 'status',
    prop: 'status',
    label: '状态',
    render: (row, rowIndex) => {
      // 返回自定义内容
      return row.status === 'active' ? '启用' : '禁用';
    },
  },
  {
    id: 'salary',
    prop: 'salary',
    label: '薪资',
    formatter: (value) => {
      // 格式化显示
      return `¥${value.toLocaleString()}`;
    },
  },
];
```

### 4. 事件监听

```typescript
// 数据变化
table.on('onDataChange', (data) => {
  console.log('数据更新:', data);
});

// 排序变化
table.on('onSortChange', (sorting) => {
  console.log('排序变化:', sorting);
});

// 选择变化
table.on('onSelectionChange', (keys, rows) => {
  console.log('选择变化:', keys, rows);
});

// 单元格点击
table.on('onCellClick', (row, column, event) => {
  console.log('单元格点击:', row, column);
});

// 行点击
table.on('onRowClick', (row, event) => {
  console.log('行点击:', row);
});
```

### 5. 状态订阅

```typescript
// 订阅所有状态变化
const unsubscribe = table.subscribe((state) => {
  console.log('状态变化:', state);
  
  // state包含所有状态
  // - rawData: 原始数据
  // - processedData: 处理后的数据
  // - columns: 列信息
  // - sorting: 排序状态
  // - filters: 筛选状态
  // - pagination: 分页状态
  // - selection: 选择状态
  // - expand: 展开状态
  // - edit: 编辑状态
  // - virtualScroll: 虚拟滚动状态
});

// 取消订阅
unsubscribe();
```

## 框架集成

### Vue 3

```vue
<template>
  <LTable
    :data="data"
    :columns="columns"
    virtual
    selectionMode="multiple"
    stripe
    border
    @selection-change="handleSelectionChange"
    @sort-change="handleSortChange"
  >
    <!-- 自定义表头 -->
    <template #header-name="{ column }">
      <strong>{{ column.label }}</strong>
    </template>

    <!-- 自定义单元格 -->
    <template #cell-status="{ row }">
      <span :class="row.status">{{ row.status }}</span>
    </template>

    <!-- 展开行内容 -->
    <template #expand="{ row }">
      <div>详细信息: {{ row }}</div>
    </template>
  </LTable>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LTable } from '@ldesign/table-vue';

const data = ref([...]);
const columns = [...];

function handleSelectionChange(keys, rows) {
  console.log('选中:', rows);
}

function handleSortChange(sorting) {
  console.log('排序:', sorting);
}
</script>
```

### React

```tsx
import { LTable } from '@ldesign/table-react';

function App() {
  const [data, setData] = useState([...]);
  const columns = [...];

  return (
    <LTable
      data={data}
      columns={columns}
      virtual
      selectionMode="multiple"
      stripe
      border
      onSelectionChange={(keys, rows) => {
        console.log('选中:', rows);
      }}
      onSortChange={(sorting) => {
        console.log('排序:', sorting);
      }}
      renderCell={(row, column, rowIndex) => {
        if (column.id === 'status') {
          return <span className={row.status}>{row.status}</span>;
        }
        return null;
      }}
      renderExpand={(row) => {
        return <div>详细信息: {JSON.stringify(row)}</div>;
      }}
    />
  );
}
```

### Lit (Web Components)

```html
<l-table id="table" virtual selectionMode="multiple"></l-table>

<script type="module">
  import '@ldesign/table-lit';

  const table = document.getElementById('table');
  
  table.data = [...];
  table.columns = [...];

  table.addEventListener('selection-change', (e) => {
    console.log('选中:', e.detail.selectedRows);
  });

  table.addEventListener('sort-change', (e) => {
    console.log('排序:', e.detail.sorting);
  });
</script>
```

## API参考

### TableCore

详见 [packages/core/README.md](./packages/core/README.md)

### Vue组件

详见 [packages/vue/README.md](./packages/vue/README.md)

### React组件

详见 [packages/react/README.md](./packages/react/README.md)

### Lit组件

详见 [packages/lit/README.md](./packages/lit/README.md)

## 常见问题

### 1. 如何处理大数据量？

**答**: 启用虚拟滚动，使用服务端分页。

```typescript
const table = new TableCore({
  data: largeData,
  columns,
  virtual: true,
  // 或使用服务端分页
  // 每次只加载一页数据
});
```

### 2. 如何自定义主题？

**答**: 覆盖CSS变量。

```css
:root {
  --l-table-primary-color: #1890ff;
  --l-table-border-color: #e8e8e8;
  --l-table-header-bg: #fafafa;
}
```

### 3. 如何实现服务端排序？

**答**: 监听排序变化，请求服务器数据。

```typescript
table.on('onSortChange', async (sorting) => {
  const data = await fetchData({ sorting });
  table.setData(data);
});
```

### 4. 如何实现行拖拽？

**答**: 使用第三方拖拽库（如sortablejs）配合表格。

```typescript
import Sortable from 'sortablejs';

const tbody = document.querySelector('.l-table__body');
Sortable.create(tbody, {
  onEnd: (evt) => {
    // 更新数据顺序
    const newData = [...data];
    const item = newData.splice(evt.oldIndex, 1)[0];
    newData.splice(evt.newIndex, 0, item);
    table.setData(newData);
  },
});
```

### 5. 如何实现单元格合并？

**答**: 使用自定义渲染，设置rowspan/colspan。

```typescript
{
  render: (row, rowIndex) => {
    if (rowIndex % 2 === 0) {
      return { content: row.value, rowspan: 2 };
    }
    return { content: '', rowspan: 0 };
  }
}
```

### 6. 如何实现树形数据？

**答**: 设置treeProps配置。

```typescript
const table = new TableCore({
  data: treeData,
  columns,
  treeProps: {
    children: 'children',
    hasChildren: 'hasChildren',
  },
});
```

### 7. 性能优化建议？

**答**: 查看 [PERFORMANCE.md](./PERFORMANCE.md)

## 更多资源

- [项目总结](./PROJECT_SUMMARY.md)
- [性能优化](./PERFORMANCE.md)
- [贡献指南](./CONTRIBUTING.md)
- [更新日志](./CHANGELOG.md)
- [快速开始](./QUICK_START.md)

## 获取帮助

- 查看示例项目：`examples/` 目录
- 提交Issue到GitHub
- 查看在线文档（待建设）



