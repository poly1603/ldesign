/**
 * VirtualScroller 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualScroller } from '../managers/VirtualScroller';
import type { Column, RowData } from '../types';

interface TestData extends RowData {
  id: number;
  name: string;
}

describe('VirtualScroller', () => {
  let scroller: VirtualScroller<TestData>;
  const rowHeight = 48;
  const headerHeight = 48;
  const containerHeight = 600;
  const containerWidth = 800;

  const mockColumns: Column<TestData>[] = [
    {
      id: 'id',
      prop: 'id',
      label: 'ID',
      width: 100,
      minWidth: 80,
      maxWidth: 200,
      align: 'left',
      fixed: false,
      sortable: false,
      filterable: false,
      resizable: true,
      render: (row) => row.id,
      level: 0,
      computedWidth: 100,
    },
    {
      id: 'name',
      prop: 'name',
      label: 'Name',
      width: 200,
      minWidth: 80,
      maxWidth: 300,
      align: 'left',
      fixed: false,
      sortable: false,
      filterable: false,
      resizable: true,
      render: (row) => row.name,
      level: 0,
      computedWidth: 200,
    },
  ];

  beforeEach(() => {
    scroller = new VirtualScroller<TestData>(
      containerHeight,
      containerWidth,
      rowHeight,
      headerHeight,
      3 // overscan
    );
  });

  describe('初始化', () => {
    it('应该正确初始化', () => {
      expect(scroller).toBeDefined();
      const state = scroller.getState();
      expect(state.containerHeight).toBe(containerHeight);
      expect(state.containerWidth).toBe(containerWidth);
      expect(state.overscan).toBe(3);
    });
  });

  describe('行计算', () => {
    it('应该正确计算可见行范围', () => {
      scroller.setTotalRows(1000);
      const range = scroller.getVisibleRowRange();
      expect(range.start).toBe(0);
      expect(range.end).toBeGreaterThan(0);
    });

    it('应该在滚动时更新可见范围', () => {
      scroller.setTotalRows(1000);
      scroller.setScrollTop(480); // 滚动10行
      const range = scroller.getVisibleRowRange();
      expect(range.start).toBeGreaterThan(0);
    });

    it('应该包含缓冲区', () => {
      scroller.setTotalRows(1000);
      const range = scroller.getVisibleRowRange();
      const visibleCount = Math.ceil(containerHeight / rowHeight);
      // 应该包含overscan行
      expect(range.end - range.start).toBeGreaterThan(visibleCount);
    });

    it('应该正确计算总高度', () => {
      scroller.setTotalRows(1000);
      const totalHeight = scroller.getTotalHeight();
      expect(totalHeight).toBe(1000 * rowHeight + headerHeight);
    });

    it('应该能够滚动到指定行', () => {
      scroller.setTotalRows(1000);
      const scrollTop = scroller.scrollToRow(10);
      expect(scrollTop).toBe(10 * rowHeight);
    });
  });

  describe('列计算', () => {
    beforeEach(() => {
      scroller.setColumns(mockColumns);
    });

    it('应该正确计算可见列范围', () => {
      const range = scroller.getVisibleColumnRange();
      expect(range.start).toBe(0);
      expect(range.end).toBeLessThanOrEqual(mockColumns.length);
    });

    it('应该在水平滚动时更新可见列范围', () => {
      scroller.setScrollLeft(150);
      const range = scroller.getVisibleColumnRange();
      // 第一列被部分遮挡或完全遮挡
      expect(range.start).toBeGreaterThanOrEqual(0);
    });

    it('应该正确计算总宽度', () => {
      const totalWidth = scroller.getTotalWidth();
      expect(totalWidth).toBe(300); // 100 + 200
    });

    it('应该能够滚动到指定列', () => {
      const scrollLeft = scroller.scrollToColumn(1);
      expect(scrollLeft).toBe(100); // 第一列的宽度
    });

    it('应该正确计算列偏移和尺寸', () => {
      const range = scroller.getVisibleColumnRange();
      expect(range.offset).toBeGreaterThanOrEqual(0);
      expect(range.size).toBeGreaterThan(0);
    });
  });

  describe('容器尺寸', () => {
    it('应该能够更新容器尺寸', () => {
      scroller.setContainerSize(1000, 800);
      const state = scroller.getState();
      expect(state.containerWidth).toBe(1000);
      expect(state.containerHeight).toBe(800);
    });

    it('更新尺寸后应该重新计算可见范围', () => {
      scroller.setTotalRows(1000);
      const rangeBefore = scroller.getVisibleRowRange();
      
      scroller.setContainerSize(800, 1200); // 增大高度
      const rangeAfter = scroller.getVisibleRowRange();
      
      // 更大的容器应该显示更多行
      expect(rangeAfter.end - rangeAfter.start).toBeGreaterThan(
        rangeBefore.end - rangeBefore.start
      );
    });
  });

  describe('滚动位置', () => {
    beforeEach(() => {
      scroller.setTotalRows(1000);
      scroller.setColumns(mockColumns);
    });

    it('应该能够设置垂直滚动位置', () => {
      scroller.setScrollTop(500);
      const state = scroller.getState();
      expect(state.scrollTop).toBe(500);
    });

    it('应该能够设置水平滚动位置', () => {
      scroller.setScrollLeft(100);
      const state = scroller.getState();
      expect(state.scrollLeft).toBe(100);
    });

    it('应该防止负数滚动位置', () => {
      scroller.setScrollTop(-100);
      const state = scroller.getState();
      expect(state.scrollTop).toBe(0);
    });
  });

  describe('边界情况', () => {
    it('应该处理空数据', () => {
      scroller.setTotalRows(0);
      const range = scroller.getVisibleRowRange();
      expect(range.start).toBe(0);
      expect(range.end).toBe(0);
    });

    it('应该处理数据少于可见区域的情况', () => {
      scroller.setTotalRows(5);
      const range = scroller.getVisibleRowRange();
      expect(range.end).toBeLessThanOrEqual(5);
    });

    it('应该处理空列', () => {
      scroller.setColumns([]);
      const totalWidth = scroller.getTotalWidth();
      expect(totalWidth).toBe(0);
    });

    it('应该处理滚动超出范围', () => {
      scroller.setTotalRows(10);
      scroller.setScrollTop(10000); // 远超实际高度
      const range = scroller.getVisibleRowRange();
      // 应该仍然返回有效范围
      expect(range.start).toBeLessThan(10);
    });
  });

  describe('性能优化', () => {
    it('应该限制缓冲区范围在有效数据内', () => {
      scroller.setTotalRows(100);
      scroller.setScrollTop(0);
      const range = scroller.getVisibleRowRange();
      expect(range.start).toBe(0);
      expect(range.end).toBeLessThanOrEqual(100);
    });

    it('应该在滚动到底部时正确计算范围', () => {
      const totalRows = 100;
      scroller.setTotalRows(totalRows);
      scroller.setScrollTop(totalRows * rowHeight);
      const range = scroller.getVisibleRowRange();
      expect(range.end).toBeLessThanOrEqual(totalRows);
    });
  });
});



