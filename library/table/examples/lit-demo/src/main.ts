import '@ldesign/table-lit';

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  address: string;
}

// 基础数据
const tableData: User[] = [
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
];

// 大数据
const largeData: User[] = [];
for (let i = 0; i < 10000; i++) {
  largeData.push({
    id: i + 1,
    name: `用户 ${i + 1}`,
    age: 20 + (i % 50),
    email: `user${i + 1}@example.com`,
    address: `地址 ${i + 1}`,
  });
}

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

// 初始化基础表格
const basicTable = document.getElementById('basic-table') as any;
if (basicTable) {
  basicTable.data = tableData;
  basicTable.columns = columns;
}

// 初始化选择表格
const selectionTable = document.getElementById('selection-table') as any;
const selectionInfo = document.getElementById('selection-info');
if (selectionTable) {
  selectionTable.data = tableData;
  selectionTable.columns = columns;

  selectionTable.addEventListener('selection-change', (e: CustomEvent) => {
    const { selectedRows } = e.detail;
    if (selectionInfo) {
      selectionInfo.textContent = `已选择: ${selectedRows.length} 行`;
    }
    console.log('选中的行:', selectedRows);
  });
}

// 初始化虚拟滚动表格
const virtualTable = document.getElementById('virtual-table') as any;
if (virtualTable) {
  virtualTable.data = largeData;
  virtualTable.columns = columns;
}



