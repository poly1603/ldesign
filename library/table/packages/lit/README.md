# @ldesign/table-lit

基于Lit的Web Components表格组件。

## 安装

```bash
npm install @ldesign/table-lit
# or
pnpm add @ldesign/table-lit
```

## 使用

```html
<l-table id="myTable" virtual stripe selectionMode="multiple"></l-table>

<script type="module">
  import '@ldesign/table-lit';

  const table = document.getElementById('myTable');
  
  table.data = [
    { id: 1, name: '张三', age: 28 },
    { id: 2, name: '李四', age: 32 },
  ];

  table.columns = [
    { id: 'id', prop: 'id', label: 'ID', width: 80 },
    { id: 'name', prop: 'name', label: '姓名', width: 120, sortable: true },
    { id: 'age', prop: 'age', label: '年龄', width: 100, sortable: true },
  ];

  table.addEventListener('selection-change', (e) => {
    console.log('选中的行:', e.detail.selectedRows);
  });
</script>
```

## 在任何框架中使用

由于是标准的Web Components，可以在任何框架中使用：

```jsx
// React
function App() {
  return <l-table ref={tableRef} />;
}

// Vue
<template>
  <l-table ref="table" />
</template>

// Angular
<l-table #table></l-table>
```

## License

MIT



