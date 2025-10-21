# @ldesign/table-vue

基于Vue 3的高性能表格组件。

## 安装

```bash
npm install @ldesign/table-vue
# or
pnpm add @ldesign/table-vue
```

## 使用

```vue
<template>
  <LTable
    :data="tableData"
    :columns="columns"
    selectionMode="multiple"
    virtual
    stripe
    @selection-change="handleSelectionChange"
  />
</template>

<script setup>
import { LTable } from '@ldesign/table-vue';

const tableData = [
  { id: 1, name: '张三', age: 28 },
  { id: 2, name: '李四', age: 32 },
];

const columns = [
  { id: 'id', prop: 'id', label: 'ID', width: 80 },
  { id: 'name', prop: 'name', label: '姓名', width: 120, sortable: true },
  { id: 'age', prop: 'age', label: '年龄', width: 100, sortable: true },
];

function handleSelectionChange(keys, rows) {
  console.log('选中的行:', rows);
}
</script>
```

## 插件安装

```javascript
import { createApp } from 'vue';
import LTable from '@ldesign/table-vue';
import App from './App.vue';

const app = createApp(App);
app.use(LTable);
app.mount('#app');
```

## License

MIT



