# 性能优化指南

## 性能基准

### 测试环境
- CPU: Intel i7 / Apple M1
- RAM: 16GB
- Browser: Chrome 120+

### 基准数据

#### 初始化性能
| 数据量 | 初始化时间 | 内存占用 |
|--------|-----------|---------|
| 1,000行 | ~10ms | ~2MB |
| 10,000行 | ~50ms | ~15MB |
| 50,000行 | ~200ms | ~70MB |
| 100,000行 | ~400ms | ~140MB |

#### 渲染性能（虚拟滚动）
| 数据量 | 首次渲染 | 滚动帧率 | 单帧时间 |
|--------|---------|---------|---------|
| 10,000行 | ~15ms | 60fps | ~16ms |
| 50,000行 | ~15ms | 60fps | ~16ms |
| 100,000行 | ~15ms | 60fps | ~16ms |

#### 排序性能
| 数据量 | 单列排序 | 多列排序 |
|--------|---------|---------|
| 1,000行 | ~5ms | ~8ms |
| 10,000行 | ~30ms | ~50ms |
| 50,000行 | ~150ms | ~250ms |

#### 筛选性能
| 数据量 | 单条件 | 多条件 |
|--------|--------|--------|
| 1,000行 | ~2ms | ~5ms |
| 10,000行 | ~10ms | ~20ms |
| 50,000行 | ~50ms | ~100ms |

## 性能优化建议

### 1. 大数据量场景

#### ✅ 启用虚拟滚动
```typescript
const table = new TableCore({
  data: largeData,
  columns,
  virtual: true, // 必须开启
  overscan: 3,   // 缓冲区大小
});
```

#### ✅ 服务端分页
```typescript
// 客户端分页（不推荐大数据）
table.setPagination({
  pageIndex: 0,
  pageSize: 20,
  total: largeData.length,
});

// 服务端分页（推荐）
async function loadPage(page: number) {
  const data = await fetchData(page);
  table.setData(data.items);
}
```

#### ✅ 懒加载树形数据
```typescript
// 按需加载子节点
const columns = [
  {
    id: 'name',
    prop: 'name',
    label: '名称',
    render: (row) => {
      if (row.hasChildren && !row.children) {
        // 延迟加载
        loadChildren(row.id);
      }
      return row.name;
    },
  },
];
```

### 2. 渲染优化

#### ✅ 使用固定行高
```typescript
// 固定行高（性能最好）
const table = new TableCore({
  data,
  columns,
  rowHeight: 48, // 固定高度
});

// 动态行高（性能较差）
// 避免在大数据量时使用
```

#### ✅ 避免复杂的自定义渲染
```typescript
// ❌ 不推荐：每次都重新计算
{
  render: (row) => {
    const value = expensiveCalculation(row);
    return formatValue(value);
  }
}

// ✅ 推荐：预计算
const processedData = data.map(row => ({
  ...row,
  computed: expensiveCalculation(row),
}));

{
  render: (row) => formatValue(row.computed),
}
```

#### ✅ 限制可见列数
```typescript
// 使用水平虚拟滚动
// 自动只渲染可见列
const table = new TableCore({
  data,
  columns: manyColumns, // 100+列
  virtual: true,
});
```

### 3. 数据操作优化

#### ✅ 批量更新
```typescript
// ❌ 不推荐：多次更新触发多次重渲染
table.setSorting([{ id: 'age', order: 'asc' }]);
table.setFilters([{ field: 'name', operator: 'contains', value: 'test' }]);
table.setPagination({ pageIndex: 0, pageSize: 20 });

// ✅ 推荐：一次性设置
const table = new TableCore({
  data,
  columns,
  defaultSorting: [{ id: 'age', order: 'asc' }],
  defaultFilters: [{ field: 'name', operator: 'contains', value: 'test' }],
  defaultPagination: { pageIndex: 0, pageSize: 20 },
});
```

#### ✅ 使用Web Worker
```typescript
// 将耗时操作移至Worker
const worker = new Worker('sort-worker.js');

worker.postMessage({ data, sortBy: 'age' });
worker.onmessage = (e) => {
  table.setData(e.data.sorted);
};
```

#### ✅ 防抖筛选
```typescript
import { debounce } from '@ldesign/table-core';

const handleSearch = debounce((value: string) => {
  table.setFilters([
    { field: 'name', operator: 'contains', value },
  ]);
}, 300);
```

### 4. Vue特定优化

#### ✅ 使用v-once和v-memo
```vue
<template>
  <!-- 静态内容 -->
  <div v-once>{{ header }}</div>

  <!-- 根据依赖缓存 -->
  <div v-memo="[row.id, row.status]">
    {{ row.name }} - {{ row.status }}
  </div>
</template>
```

#### ✅ 避免不必要的响应式
```typescript
import { markRaw } from 'vue';

const table = useTable({
  data: markRaw(largeData), // 不需要深度响应式
  columns,
});
```

### 5. React特定优化

#### ✅ 使用useMemo和useCallback
```tsx
const table = useMemo(
  () => new TableCore({ data, columns }),
  [data, columns]
);

const handleSort = useCallback((columnId: string) => {
  table.setSorting([{ id: columnId, order: 'asc' }]);
}, [table]);
```

#### ✅ 使用React.memo
```tsx
const TableRow = React.memo<RowProps>(({ row }) => {
  return <tr>...</tr>;
}, (prev, next) => {
  // 自定义比较逻辑
  return prev.row.id === next.row.id;
});
```

### 6. 内存优化

#### ✅ 及时销毁
```typescript
// 组件卸载时销毁
onUnmounted(() => {
  table.destroy();
});

// React
useEffect(() => {
  return () => {
    table.destroy();
  };
}, []);
```

#### ✅ 清理不必要的数据
```typescript
// 只保留需要的字段
const optimizedData = rawData.map(item => ({
  id: item.id,
  name: item.name,
  age: item.age,
  // 不要包含大量不使用的字段
}));
```

#### ✅ 使用分页而不是无限滚动
```typescript
// ❌ 内存会不断增长
let allData = [];
function loadMore() {
  allData = [...allData, ...newData];
  table.setData(allData);
}

// ✅ 固定内存占用
function loadPage(page: number) {
  const data = fetchPage(page);
  table.setData(data); // 只保存当前页
}
```

## 性能监控

### 使用Performance API
```typescript
const mark = 'table-render';
performance.mark(`${mark}-start`);

table.setData(data);

performance.mark(`${mark}-end`);
performance.measure(mark, `${mark}-start`, `${mark}-end`);

const measure = performance.getEntriesByName(mark)[0];
console.log(`渲染耗时: ${measure.duration}ms`);
```

### Chrome DevTools
1. **Performance面板**: 录制渲染过程
2. **Memory面板**: 监控内存占用
3. **React/Vue DevTools**: 分析组件渲染

## 运行基准测试

```bash
# 运行性能测试
pnpm benchmark

# 查看测试覆盖率
pnpm test:coverage
```

## 性能问题诊断

### 问题1: 滚动卡顿
- 检查是否启用虚拟滚动
- 检查单元格渲染是否有复杂计算
- 检查是否有大量DOM操作

### 问题2: 初始化慢
- 检查数据量是否过大
- 检查是否有同步的耗时操作
- 考虑使用服务端分页

### 问题3: 内存占用高
- 检查是否有内存泄漏
- 检查是否及时销毁实例
- 检查数据是否包含大量不必要字段

### 问题4: 排序/筛选慢
- 考虑服务端排序/筛选
- 使用Web Worker处理
- 添加防抖延迟

## 最佳实践总结

1. ✅ 大数据量必须开启虚拟滚动
2. ✅ 使用固定行高而不是动态行高
3. ✅ 服务端分页优于客户端分页
4. ✅ 避免在render函数中进行复杂计算
5. ✅ 批量更新而不是多次单独更新
6. ✅ 及时销毁不用的实例
7. ✅ 使用防抖处理频繁操作
8. ✅ 定期进行性能测试

遵循这些优化建议，可以确保表格在各种场景下都有良好的性能表现。



