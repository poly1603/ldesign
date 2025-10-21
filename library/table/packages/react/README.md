# @ldesign/table-react

基于React的高性能表格组件。

## 安装

```bash
npm install @ldesign/table-react
# or
pnpm add @ldesign/table-react
```

## 使用

```tsx
import { LTable } from '@ldesign/table-react';

function App() {
  const data = [
    { id: 1, name: '张三', age: 28 },
    { id: 2, name: '李四', age: 32 },
  ];

  const columns = [
    { id: 'id', prop: 'id', label: 'ID', width: 80 },
    { id: 'name', prop: 'name', label: '姓名', width: 120, sortable: true },
    { id: 'age', prop: 'age', label: '年龄', width: 100, sortable: true },
  ];

  return (
    <LTable
      data={data}
      columns={columns}
      selectionMode="multiple"
      virtual
      stripe
      onSelectionChange={(keys, rows) => {
        console.log('选中的行:', rows);
      }}
    />
  );
}
```

## Hooks

```tsx
import { useTable } from '@ldesign/table-react';

function CustomTable() {
  const { state, tableCore } = useTable({
    data,
    columns,
  });

  // 自定义渲染...
}
```

## License

MIT



