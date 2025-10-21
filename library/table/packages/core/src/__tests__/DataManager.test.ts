/**
 * DataManager 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DataManager } from '../managers/DataManager';
import type { RowData, Column } from '../types';

interface TestData extends RowData {
  id: number;
  name: string;
  age: number;
  score: number;
}

describe('DataManager', () => {
  let dataManager: DataManager<TestData>;
  const mockData: TestData[] = [
    { id: 1, name: 'Alice', age: 28, score: 85 },
    { id: 2, name: 'Bob', age: 32, score: 92 },
    { id: 3, name: 'Charlie', age: 25, score: 78 },
    { id: 4, name: 'David', age: 35, score: 88 },
    { id: 5, name: 'Eve', age: 29, score: 95 },
  ];

  const mockColumns: Column<TestData>[] = [
    {
      id: 'id',
      prop: 'id',
      label: 'ID',
      width: 80,
      minWidth: 80,
      maxWidth: 200,
      align: 'left',
      fixed: false,
      sortable: true,
      filterable: false,
      resizable: true,
      render: (row) => row.id,
      level: 0,
      computedWidth: 80,
    },
    {
      id: 'name',
      prop: 'name',
      label: 'Name',
      width: 120,
      minWidth: 80,
      maxWidth: 200,
      align: 'left',
      fixed: false,
      sortable: true,
      filterable: false,
      resizable: true,
      render: (row) => row.name,
      level: 0,
      computedWidth: 120,
    },
    {
      id: 'age',
      prop: 'age',
      label: 'Age',
      width: 100,
      minWidth: 80,
      maxWidth: 200,
      align: 'left',
      fixed: false,
      sortable: true,
      filterable: false,
      resizable: true,
      render: (row) => row.age,
      level: 0,
      computedWidth: 100,
    },
    {
      id: 'score',
      prop: 'score',
      label: 'Score',
      width: 100,
      minWidth: 80,
      maxWidth: 200,
      align: 'left',
      fixed: false,
      sortable: true,
      filterable: false,
      resizable: true,
      render: (row) => row.score,
      level: 0,
      computedWidth: 100,
    },
  ];

  beforeEach(() => {
    dataManager = new DataManager<TestData>(mockData);
  });

  describe('数据初始化', () => {
    it('应该正确初始化数据', () => {
      expect(dataManager.getRawData()).toEqual(mockData);
      expect(dataManager.getProcessedData()).toEqual(mockData);
    });

    it('应该能够设置新数据', () => {
      const newData = [{ id: 6, name: 'Frank', age: 30, score: 90 }];
      dataManager.setData(newData);
      expect(dataManager.getRawData()).toEqual(newData);
    });
  });

  describe('排序功能', () => {
    it('应该能够按年龄升序排序', () => {
      dataManager.setSorting([{ id: 'age', order: 'asc' }], mockColumns);
      const data = dataManager.getProcessedData();
      expect(data[0].age).toBe(25);
      expect(data[data.length - 1].age).toBe(35);
    });

    it('应该能够按年龄降序排序', () => {
      dataManager.setSorting([{ id: 'age', order: 'desc' }], mockColumns);
      const data = dataManager.getProcessedData();
      expect(data[0].age).toBe(35);
      expect(data[data.length - 1].age).toBe(25);
    });

    it('应该能够按字符串排序', () => {
      dataManager.setSorting([{ id: 'name', order: 'asc' }], mockColumns);
      const data = dataManager.getProcessedData();
      expect(data[0].name).toBe('Alice');
      expect(data[data.length - 1].name).toBe('Eve');
    });

    it('应该支持多列排序', () => {
      const dataWithSameAge = [
        { id: 1, name: 'Bob', age: 30, score: 85 },
        { id: 2, name: 'Alice', age: 30, score: 90 },
        { id: 3, name: 'Charlie', age: 25, score: 88 },
      ];
      dataManager.setData(dataWithSameAge);
      dataManager.setSorting(
        [
          { id: 'age', order: 'asc' },
          { id: 'name', order: 'asc' },
        ],
        mockColumns
      );
      const data = dataManager.getProcessedData();
      expect(data[1].name).toBe('Alice');
      expect(data[2].name).toBe('Bob');
    });

    it('应该能够清除排序', () => {
      dataManager.setSorting([{ id: 'age', order: 'asc' }], mockColumns);
      dataManager.clearSorting();
      const data = dataManager.getProcessedData();
      expect(data).toEqual(mockData);
    });
  });

  describe('筛选功能', () => {
    it('应该支持大于筛选', () => {
      dataManager.setFilters([{ field: 'age', operator: 'gt', value: 29 }]);
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(2); // Bob(32), David(35)
      expect(data.every((row) => row.age > 29)).toBe(true);
    });

    it('应该支持大于等于筛选', () => {
      dataManager.setFilters([{ field: 'age', operator: 'gte', value: 29 }]);
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(3); // Eve(29), Bob(32), David(35)
    });

    it('应该支持小于筛选', () => {
      dataManager.setFilters([{ field: 'age', operator: 'lt', value: 30 }]);
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(3); // Alice(28), Charlie(25), Eve(29)
    });

    it('应该支持等于筛选', () => {
      dataManager.setFilters([{ field: 'age', operator: 'eq', value: 28 }]);
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('Alice');
    });

    it('应该支持不等于筛选', () => {
      dataManager.setFilters([{ field: 'age', operator: 'ne', value: 28 }]);
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(4);
      expect(data.every((row) => row.age !== 28)).toBe(true);
    });

    it('应该支持contains筛选', () => {
      dataManager.setFilters([{ field: 'name', operator: 'contains', value: 'ar' }]);
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('Charlie');
    });

    it('应该支持startsWith筛选', () => {
      dataManager.setFilters([{ field: 'name', operator: 'startsWith', value: 'B' }]);
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('Bob');
    });

    it('应该支持endsWith筛选', () => {
      dataManager.setFilters([{ field: 'name', operator: 'endsWith', value: 'e' }]);
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(3); // Alice, Charlie, Eve
    });

    it('应该支持in筛选', () => {
      dataManager.setFilters([{ field: 'age', operator: 'in', value: [25, 28, 35] }]);
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(3);
    });

    it('应该支持多条件筛选', () => {
      dataManager.setFilters([
        { field: 'age', operator: 'gte', value: 28 },
        { field: 'score', operator: 'gte', value: 90 },
      ]);
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(2); // Bob(32,92), Eve(29,95)
    });

    it('应该能够清除筛选', () => {
      dataManager.setFilters([{ field: 'age', operator: 'gt', value: 30 }]);
      dataManager.clearFilters();
      const data = dataManager.getProcessedData();
      expect(data).toEqual(mockData);
    });
  });

  describe('分页功能', () => {
    it('应该能够分页', () => {
      dataManager.setPagination({ pageIndex: 0, pageSize: 2, total: 5 });
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(2);
      expect(data[0].id).toBe(1);
      expect(data[1].id).toBe(2);
    });

    it('应该能够翻到第二页', () => {
      dataManager.setPagination({ pageIndex: 1, pageSize: 2, total: 5 });
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(2);
      expect(data[0].id).toBe(3);
      expect(data[1].id).toBe(4);
    });

    it('应该正确处理最后一页', () => {
      dataManager.setPagination({ pageIndex: 2, pageSize: 2, total: 5 });
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(1);
      expect(data[0].id).toBe(5);
    });

    it('应该自动计算总数', () => {
      dataManager.setPagination({ pageIndex: 0, pageSize: 10, total: 0 });
      const pagination = dataManager.getPagination();
      expect(pagination?.total).toBe(5);
    });
  });

  describe('组合操作', () => {
    it('应该先筛选再排序', () => {
      dataManager.setFilters([{ field: 'age', operator: 'gte', value: 28 }]);
      dataManager.setSorting([{ id: 'age', order: 'asc' }], mockColumns);
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(4);
      expect(data[0].age).toBe(28);
      expect(data[data.length - 1].age).toBe(35);
    });

    it('应该先筛选、排序再分页', () => {
      dataManager.setFilters([{ field: 'score', operator: 'gte', value: 85 }]);
      dataManager.setSorting([{ id: 'score', order: 'desc' }], mockColumns);
      dataManager.setPagination({ pageIndex: 0, pageSize: 2, total: 0 });
      const data = dataManager.getProcessedData();
      expect(data.length).toBe(2);
      expect(data[0].score).toBe(95); // Eve
      expect(data[1].score).toBe(92); // Bob
    });
  });
});



