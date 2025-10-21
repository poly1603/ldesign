/**
 * 性能基准测试
 */

import { TableCore } from '../packages/core/src/TableCore';

interface TestData {
  id: number;
  name: string;
  age: number;
  email: string;
  address: string;
  phone: string;
  company: string;
  position: string;
}

// 生成测试数据
function generateData(count: number): TestData[] {
  const data: TestData[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: i + 1,
      name: `User ${i + 1}`,
      age: 20 + (i % 50),
      email: `user${i + 1}@example.com`,
      address: `Address ${i + 1}`,
      phone: `138${String(i).padStart(8, '0')}`,
      company: `Company ${(i % 100) + 1}`,
      position: `Position ${(i % 20) + 1}`,
    });
  }
  return data;
}

const columns = [
  { id: 'id', prop: 'id' as const, label: 'ID', width: 80 },
  { id: 'name', prop: 'name' as const, label: '姓名', width: 120, sortable: true },
  { id: 'age', prop: 'age' as const, label: '年龄', width: 100, sortable: true },
  { id: 'email', prop: 'email' as const, label: '邮箱', width: 200 },
  { id: 'address', prop: 'address' as const, label: '地址', width: 200 },
  { id: 'phone', prop: 'phone' as const, label: '电话', width: 150 },
  { id: 'company', prop: 'company' as const, label: '公司', width: 150 },
  { id: 'position', prop: 'position' as const, label: '职位', width: 120 },
];

// 性能测试工具
class PerformanceTest {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  measure(fn: () => void): number {
    const start = performance.now();
    fn();
    const end = performance.now();
    return end - start;
  }

  run(fn: () => void, iterations = 1): void {
    const times: number[] = [];
    
    // 预热
    for (let i = 0; i < 3; i++) {
      fn();
    }

    // 正式测试
    for (let i = 0; i < iterations; i++) {
      times.push(this.measure(fn));
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    console.log(`\n${this.name}:`);
    console.log(`  平均: ${avg.toFixed(2)}ms`);
    console.log(`  最小: ${min.toFixed(2)}ms`);
    console.log(`  最大: ${max.toFixed(2)}ms`);
    console.log(`  迭代: ${iterations}次`);
  }
}

// 测试场景
console.log('='.repeat(60));
console.log('LDesign Table 性能基准测试');
console.log('='.repeat(60));

// 1. 初始化性能测试
console.log('\n1. 初始化性能测试');
console.log('-'.repeat(60));

[1000, 10000, 50000, 100000].forEach((count) => {
  const data = generateData(count);
  const test = new PerformanceTest(`初始化 ${count.toLocaleString()} 行`);
  test.run(() => {
    const table = new TableCore({
      data,
      columns,
      rowKey: 'id',
    });
    table.destroy();
  }, 5);
});

// 2. 排序性能测试
console.log('\n2. 排序性能测试');
console.log('-'.repeat(60));

[1000, 10000, 50000].forEach((count) => {
  const data = generateData(count);
  const table = new TableCore({
    data,
    columns,
    rowKey: 'id',
  });

  const test = new PerformanceTest(`排序 ${count.toLocaleString()} 行`);
  test.run(() => {
    table.setSorting([{ id: 'age', order: 'asc' }]);
  }, 10);

  table.destroy();
});

// 3. 筛选性能测试
console.log('\n3. 筛选性能测试');
console.log('-'.repeat(60));

[1000, 10000, 50000].forEach((count) => {
  const data = generateData(count);
  const table = new TableCore({
    data,
    columns,
    rowKey: 'id',
  });

  const test = new PerformanceTest(`筛选 ${count.toLocaleString()} 行`);
  test.run(() => {
    table.setFilters([
      { field: 'age', operator: 'gte', value: 30 },
      { field: 'name', operator: 'contains', value: 'User' },
    ]);
  }, 10);

  table.destroy();
});

// 4. 虚拟滚动性能测试
console.log('\n4. 虚拟滚动性能测试');
console.log('-'.repeat(60));

[10000, 50000, 100000].forEach((count) => {
  const data = generateData(count);
  const table = new TableCore({
    data,
    columns,
    rowKey: 'id',
    virtual: true,
  });

  table.setContainerSize(800, 600);

  const test = new PerformanceTest(`虚拟滚动 ${count.toLocaleString()} 行`);
  test.run(() => {
    for (let i = 0; i < 100; i++) {
      table.setScrollTop(i * 48);
    }
  }, 3);

  table.destroy();
});

// 5. 选择性能测试
console.log('\n5. 选择性能测试');
console.log('-'.repeat(60));

[1000, 10000].forEach((count) => {
  const data = generateData(count);
  const table = new TableCore({
    data,
    columns,
    rowKey: 'id',
    selectionMode: 'multiple',
  });

  const test = new PerformanceTest(`全选 ${count.toLocaleString()} 行`);
  test.run(() => {
    table.toggleSelectAll();
  }, 10);

  table.destroy();
});

// 6. 内存占用测试
console.log('\n6. 内存占用测试');
console.log('-'.repeat(60));

if (typeof process !== 'undefined' && process.memoryUsage) {
  [10000, 50000, 100000].forEach((count) => {
    const beforeMem = process.memoryUsage();
    const data = generateData(count);
    const table = new TableCore({
      data,
      columns,
      rowKey: 'id',
      virtual: true,
    });
    
    const afterMem = process.memoryUsage();
    const heapUsed = (afterMem.heapUsed - beforeMem.heapUsed) / 1024 / 1024;
    
    console.log(`\n${count.toLocaleString()} 行数据:`);
    console.log(`  堆内存增加: ${heapUsed.toFixed(2)} MB`);
    console.log(`  单行内存: ${(heapUsed * 1024 / count).toFixed(2)} KB`);
    
    table.destroy();
  });
} else {
  console.log('  内存测试需要在Node.js环境中运行');
}

console.log('\n' + '='.repeat(60));
console.log('测试完成');
console.log('='.repeat(60) + '\n');



