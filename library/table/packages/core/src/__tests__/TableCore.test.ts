/**
 * TableCore 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TableCore } from '../TableCore';
import type { RowData } from '../types';

interface TestData extends RowData {
  id: number;
  name: string;
  age: number;
  email: string;
}

describe('TableCore', () => {
  let tableCore: TableCore<TestData>;
  const mockData: TestData[] = [
    { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com' },
    { id: 2, name: '李四', age: 32, email: 'lisi@example.com' },
    { id: 3, name: '王五', age: 25, email: 'wangwu@example.com' },
    { id: 4, name: '赵六', age: 35, email: 'zhaoliu@example.com' },
    { id: 5, name: '钱七', age: 29, email: 'qianqi@example.com' },
  ];

  const mockColumns = [
    { id: 'id', prop: 'id' as keyof TestData, label: 'ID', width: 80 },
    { id: 'name', prop: 'name' as keyof TestData, label: '姓名', width: 120, sortable: true },
    { id: 'age', prop: 'age' as keyof TestData, label: '年龄', width: 100, sortable: true },
    { id: 'email', prop: 'email' as keyof TestData, label: '邮箱', width: 200 },
  ];

  beforeEach(() => {
    tableCore = new TableCore<TestData>({
      data: mockData,
      columns: mockColumns,
      rowKey: 'id',
    });
  });

  describe('初始化', () => {
    it('应该正确初始化表格', () => {
      expect(tableCore).toBeDefined();
      expect(tableCore.getData()).toEqual(mockData);
    });

    it('应该正确获取状态', () => {
      const state = tableCore.getState();
      expect(state.rawData).toEqual(mockData);
      expect(state.processedData).toEqual(mockData);
      expect(state.columns.length).toBe(4);
    });
  });

  describe('数据操作', () => {
    it('应该能够设置新数据', () => {
      const newData = [
        { id: 6, name: '孙八', age: 30, email: 'sunba@example.com' },
      ];
      tableCore.setData(newData);
      expect(tableCore.getData()).toEqual(newData);
    });

    it('应该能够获取原始数据', () => {
      expect(tableCore.getRawData()).toEqual(mockData);
    });
  });

  describe('排序功能', () => {
    it('应该能够升序排序', () => {
      tableCore.setSorting([{ id: 'age', order: 'asc' }]);
      const data = tableCore.getData();
      expect(data[0].age).toBe(25);
      expect(data[data.length - 1].age).toBe(35);
    });

    it('应该能够降序排序', () => {
      tableCore.setSorting([{ id: 'age', order: 'desc' }]);
      const data = tableCore.getData();
      expect(data[0].age).toBe(35);
      expect(data[data.length - 1].age).toBe(25);
    });

    it('应该支持多列排序', () => {
      const dataWithSameAge = [
        { id: 1, name: 'B', age: 30, email: 'b@example.com' },
        { id: 2, name: 'A', age: 30, email: 'a@example.com' },
        { id: 3, name: 'C', age: 25, email: 'c@example.com' },
      ];
      tableCore.setData(dataWithSameAge);
      tableCore.setSorting([
        { id: 'age', order: 'asc' },
        { id: 'name', order: 'asc' },
      ]);
      const data = tableCore.getData();
      expect(data[1].name).toBe('A');
      expect(data[2].name).toBe('B');
    });
  });

  describe('筛选功能', () => {
    it('应该能够筛选数据', () => {
      tableCore.setFilters([
        { field: 'age', operator: 'gt', value: 28 },
      ]);
      const data = tableCore.getData();
      expect(data.length).toBe(3); // 29, 32, 35
      expect(data.every((row) => row.age > 28)).toBe(true);
    });

    it('应该支持多条件筛选', () => {
      tableCore.setFilters([
        { field: 'age', operator: 'gte', value: 28 },
        { field: 'name', operator: 'contains', value: '张' },
      ]);
      const data = tableCore.getData();
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('张三');
    });

    it('应该支持contains操作符', () => {
      tableCore.setFilters([
        { field: 'email', operator: 'contains', value: 'zhangsan' },
      ]);
      const data = tableCore.getData();
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('张三');
    });
  });

  describe('分页功能', () => {
    it('应该能够设置分页', () => {
      tableCore.setPagination({ pageIndex: 0, pageSize: 2, total: 5 });
      const data = tableCore.getData();
      expect(data.length).toBe(2);
      expect(data[0].id).toBe(1);
    });

    it('应该能够翻页', () => {
      tableCore.setPagination({ pageIndex: 1, pageSize: 2, total: 5 });
      const data = tableCore.getData();
      expect(data.length).toBe(2);
      expect(data[0].id).toBe(3);
    });

    it('应该正确计算总数', () => {
      tableCore.setPagination({ pageIndex: 0, pageSize: 10, total: 0 });
      const state = tableCore.getState();
      expect(state.pagination?.total).toBe(5);
    });
  });

  describe('选择功能', () => {
    beforeEach(() => {
      tableCore = new TableCore<TestData>({
        data: mockData,
        columns: mockColumns,
        rowKey: 'id',
        selectionMode: 'multiple',
      });
    });

    it('应该能够选择单行', () => {
      tableCore.toggleRowSelection(1);
      const selectedRows = tableCore.getSelectedRows();
      expect(selectedRows.length).toBe(1);
      expect(selectedRows[0].id).toBe(1);
    });

    it('应该能够全选', () => {
      tableCore.toggleSelectAll();
      const selectedRows = tableCore.getSelectedRows();
      expect(selectedRows.length).toBe(5);
    });

    it('应该能够取消选择', () => {
      tableCore.toggleRowSelection(1);
      tableCore.toggleRowSelection(1);
      const selectedRows = tableCore.getSelectedRows();
      expect(selectedRows.length).toBe(0);
    });

    it('单选模式应该只能选择一行', () => {
      const singleSelectTable = new TableCore<TestData>({
        data: mockData,
        columns: mockColumns,
        rowKey: 'id',
        selectionMode: 'single',
      });
      singleSelectTable.toggleRowSelection(1);
      singleSelectTable.toggleRowSelection(2);
      const selectedRows = singleSelectTable.getSelectedRows();
      expect(selectedRows.length).toBe(1);
      expect(selectedRows[0].id).toBe(2);
    });
  });

  describe('展开功能', () => {
    it('应该能够展开行', () => {
      tableCore.toggleRowExpand(1);
      const state = tableCore.getState();
      expect(state.expand.expandedRowKeys.has(1)).toBe(true);
    });

    it('应该能够折叠行', () => {
      tableCore.toggleRowExpand(1);
      tableCore.toggleRowExpand(1);
      const state = tableCore.getState();
      expect(state.expand.expandedRowKeys.has(1)).toBe(false);
    });
  });

  describe('列宽调整', () => {
    it('应该能够调整列宽', () => {
      tableCore.resizeColumn('name', 200);
      const state = tableCore.getState();
      const nameColumn = state.columns.find((col) => col.id === 'name');
      expect(nameColumn?.computedWidth).toBe(200);
    });

    it('应该限制最小宽度', () => {
      tableCore.resizeColumn('name', 50);
      const state = tableCore.getState();
      const nameColumn = state.columns.find((col) => col.id === 'name');
      expect(nameColumn?.computedWidth).toBe(80); // minWidth
    });
  });

  describe('订阅机制', () => {
    it('应该能够订阅状态变化', (done) => {
      let callCount = 0;
      const unsubscribe = tableCore.subscribe((state) => {
        callCount++;
        if (callCount === 2) {
          // 第一次是立即调用，第二次是数据变化
          expect(state.rawData.length).toBe(1);
          unsubscribe();
          done();
        }
      });

      tableCore.setData([{ id: 1, name: '测试', age: 20, email: 'test@example.com' }]);
    });

    it('应该能够取消订阅', () => {
      let callCount = 0;
      const unsubscribe = tableCore.subscribe(() => {
        callCount++;
      });
      
      unsubscribe();
      tableCore.setData([{ id: 1, name: '测试', age: 20, email: 'test@example.com' }]);
      
      // 只有初始调用，没有后续调用
      expect(callCount).toBe(1);
    });
  });

  describe('虚拟滚动', () => {
    beforeEach(() => {
      tableCore = new TableCore<TestData>({
        data: mockData,
        columns: mockColumns,
        rowKey: 'id',
        virtual: true,
      });
    });

    it('应该能够设置容器尺寸', () => {
      tableCore.setContainerSize(800, 600);
      const state = tableCore.getState();
      expect(state.virtualScroll?.containerWidth).toBe(800);
      expect(state.virtualScroll?.containerHeight).toBe(600);
    });

    it('应该能够设置滚动位置', () => {
      tableCore.setContainerSize(800, 600);
      tableCore.setScrollTop(100);
      const state = tableCore.getState();
      expect(state.virtualScroll?.scrollTop).toBe(100);
    });

    it('应该能够获取可见范围', () => {
      tableCore.setContainerSize(800, 200);
      const range = tableCore.getVisibleRange();
      expect(range).toBeDefined();
      expect(range?.start).toBeGreaterThanOrEqual(0);
    });
  });

  describe('销毁', () => {
    it('应该能够正确销毁', () => {
      tableCore.destroy();
      // 销毁后订阅应该被清空，不应该触发回调
      let called = false;
      tableCore.subscribe(() => {
        called = true;
      });
      expect(called).toBe(false);
    });
  });
});



