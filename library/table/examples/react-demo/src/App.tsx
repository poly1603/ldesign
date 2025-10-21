import React, { useMemo, useState } from 'react';
import { LTable } from '@ldesign/table-react';
import type { RowKey, SortingState } from '@ldesign/table-react';
import './App.css';

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  address: string;
}

function App() {
  // 基础数据
  const tableData: User[] = useMemo(
    () => [
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
    ],
    []
  );

  // 大数据（用于虚拟滚动）
  const largeData = useMemo(() => {
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
  }, []);

  // 列定义
  const columns = useMemo(
    () => [
      {
        id: 'id',
        prop: 'id' as keyof User,
        label: 'ID',
        width: 80,
      },
      {
        id: 'name',
        prop: 'name' as keyof User,
        label: '姓名',
        width: 120,
      },
      {
        id: 'age',
        prop: 'age' as keyof User,
        label: '年龄',
        width: 100,
      },
      {
        id: 'email',
        prop: 'email' as keyof User,
        label: '邮箱',
        width: 200,
      },
      {
        id: 'address',
        prop: 'address' as keyof User,
        label: '地址',
        minWidth: 200,
      },
    ],
    []
  );

  // 可排序列
  const sortableColumns = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        sortable: col.id === 'age' || col.id === 'name',
      })),
    [columns]
  );

  // 选中的行
  const [selectedRows, setSelectedRows] = useState<User[]>([]);

  // 处理选择变化
  const handleSelectionChange = (selectedKeys: RowKey[], rows: User[]) => {
    setSelectedRows(rows);
    console.log('选中的行:', rows);
  };

  // 处理排序变化
  const handleSortChange = (sorting: SortingState) => {
    console.log('排序变化:', sorting);
  };

  return (
    <div id="app">
      <h1>LDesign Table - React Demo</h1>

      <div className="demo-section">
        <h2>基础表格</h2>
        <LTable data={tableData} columns={columns} stripe border />
      </div>

      <div className="demo-section">
        <h2>带选择的表格</h2>
        <LTable
          data={tableData}
          columns={columns}
          selectionMode="multiple"
          onSelectionChange={handleSelectionChange}
        />
        <p>已选择: {selectedRows.length} 行</p>
      </div>

      <div className="demo-section">
        <h2>虚拟滚动表格（大数据）</h2>
        <LTable
          data={largeData}
          columns={columns}
          virtual
          height={400}
          stripe
        />
      </div>

      <div className="demo-section">
        <h2>可排序表格</h2>
        <LTable
          data={tableData}
          columns={sortableColumns}
          onSortChange={handleSortChange}
        />
      </div>
    </div>
  );
}

export default App;



