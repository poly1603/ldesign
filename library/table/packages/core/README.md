# @ldesign/table-core

框架无关的表格核心库，基于headless架构设计。

## 特性

- 🎯 **Headless架构** - 核心逻辑与UI完全分离
- 🚀 **高性能虚拟滚动** - 支持10万+数据流畅渲染
- 💪 **功能完整** - 排序、筛选、分页、选择、展开、编辑、导出
- 📦 **零依赖** - 纯TypeScript实现，无任何外部依赖
- 🔧 **可扩展** - 灵活的插件式设计

## 安装

```bash
npm install @ldesign/table-core
# or
pnpm add @ldesign/table-core
# or
yarn add @ldesign/table-core
```

## 基础使用

```typescript
import { TableCore } from '@ldesign/table-core';

const table = new TableCore({
  data: [
    { id: 1, name: '张三', age: 28 },
    { id: 2, name: '李四', age: 32 },
  ],
  columns: [
    { id: 'id', prop: 'id', label: 'ID', width: 80 },
    { id: 'name', prop: 'name', label: '姓名', width: 120 },
    { id: 'age', prop: 'age', label: '年龄', width: 100, sortable: true },
  ],
  rowKey: 'id',
  virtual: true,
});

// 订阅状态变化
table.subscribe((state) => {
  console.log('当前状态:', state);
  // 更新你的UI
});

// 操作数据
table.setSorting([{ id: 'age', order: 'desc' }]);
table.setFilters([{ field: 'age', operator: 'gt', value: 25 }]);
table.toggleRowSelection(1);
```

## API

详见主项目文档。

## License

MIT



