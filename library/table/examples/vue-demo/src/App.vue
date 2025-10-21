<template>
  <div id="app">
    <h1>LDesign Table - Vue Demo</h1>

    <div class="demo-section">
      <h2>基础表格</h2>
      <LTable
        :data="tableData"
        :columns="columns"
        stripe
        border
      />
    </div>

    <div class="demo-section">
      <h2>带选择的表格</h2>
      <LTable
        :data="tableData"
        :columns="columns"
        selectionMode="multiple"
        @selection-change="handleSelectionChange"
      />
      <p>已选择: {{ selectedRows.length }} 行</p>
    </div>

    <div class="demo-section">
      <h2>虚拟滚动表格（大数据）</h2>
      <LTable
        :data="largeData"
        :columns="columns"
        virtual
        :height="400"
        stripe
      />
    </div>

    <div class="demo-section">
      <h2>可排序表格</h2>
      <LTable
        :data="tableData"
        :columns="sortableColumns"
        @sort-change="handleSortChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { LTable } from '@ldesign/table-vue';
import type { RowKey } from '@ldesign/table-vue';

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  address: string;
}

// 基础数据
const tableData = ref<User[]>([
  {
    id: 1,
    name: '张三',
    age: 28,
    email: 'zhangsan@example.com',
    address: '北京市朝阳区',
  },
  {
    id: 2,
    name: '李四',
    age: 32,
    email: 'lisi@example.com',
    address: '上海市浦东新区',
  },
  {
    id: 3,
    name: '王五',
    age: 25,
    email: 'wangwu@example.com',
    address: '广州市天河区',
  },
  {
    id: 4,
    name: '赵六',
    age: 35,
    email: 'zhaoliu@example.com',
    address: '深圳市南山区',
  },
  {
    id: 5,
    name: '钱七',
    age: 29,
    email: 'qianqi@example.com',
    address: '杭州市西湖区',
  },
]);

// 大数据（用于虚拟滚动）
const largeData = computed(() => {
  const data: User[] = [];
  for (let i = 0; i < 10000; i++) {
    data.push({
      id: i + 1,
      name: `用户 ${i + 1}`,
      age: 20 + (i % 50),
      email: `user${i + 1}@example.com`,
      address: `地址 ${i + 1}`,
    });
  }
  return data;
});

// 列定义
const columns = [
  {
    id: 'id',
    prop: 'id',
    label: 'ID',
    width: 80,
  },
  {
    id: 'name',
    prop: 'name',
    label: '姓名',
    width: 120,
  },
  {
    id: 'age',
    prop: 'age',
    label: '年龄',
    width: 100,
  },
  {
    id: 'email',
    prop: 'email',
    label: '邮箱',
    width: 200,
  },
  {
    id: 'address',
    prop: 'address',
    label: '地址',
    minWidth: 200,
  },
];

// 可排序列
const sortableColumns = columns.map((col) => ({
  ...col,
  sortable: col.id === 'age' || col.id === 'name',
}));

// 选中的行
const selectedRows = ref<User[]>([]);

// 处理选择变化
function handleSelectionChange(selectedKeys: RowKey[], rows: User[]) {
  selectedRows.value = rows;
  console.log('选中的行:', rows);
}

// 处理排序变化
function handleSortChange(sorting: any) {
  console.log('排序变化:', sorting);
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 32px;
  margin-bottom: 30px;
  color: #333;
}

h2 {
  font-size: 20px;
  margin-bottom: 16px;
  color: #555;
}

.demo-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

p {
  margin-top: 12px;
  color: #666;
}
</style>



