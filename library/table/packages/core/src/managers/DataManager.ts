/**
 * 数据管理器 - 处理排序、筛选、分页
 */

import type {
  RowData,
  SortingState,
  FilterState,
  FilterCondition,
  PaginationState,
  Column,
} from '../types';
import { getNestedValue } from '../utils';

export class DataManager<TData extends RowData = RowData> {
  private rawData: TData[] = [];
  private processedData: TData[] = [];
  private sorting: SortingState = [];
  private filters: FilterState = [];
  private pagination: PaginationState | null = null;

  constructor(data: TData[]) {
    this.rawData = data;
    this.processedData = [...data];
  }

  /**
   * 设置数据
   */
  setData(data: TData[]): void {
    this.rawData = data;
    this.reprocess();
  }

  /**
   * 获取原始数据
   */
  getRawData(): TData[] {
    return this.rawData;
  }

  /**
   * 获取处理后的数据
   */
  getProcessedData(): TData[] {
    return this.processedData;
  }

  /**
   * 设置排序
   */
  setSorting(sorting: SortingState, columns: Column<TData>[]): void {
    this.sorting = sorting;
    this.reprocess(columns);
  }

  /**
   * 设置筛选
   */
  setFilters(filters: FilterState): void {
    this.filters = filters;
    this.reprocess();
  }

  /**
   * 设置分页
   */
  setPagination(pagination: PaginationState | null): void {
    this.pagination = pagination;
    this.reprocess();
  }

  /**
   * 重新处理数据
   */
  private reprocess(columns?: Column<TData>[]): void {
    let result = [...this.rawData];

    // 1. 筛选
    if (this.filters.length > 0) {
      result = this.applyFilters(result);
    }

    // 2. 排序
    if (this.sorting.length > 0 && columns) {
      result = this.applySorting(result, columns);
    }

    // 更新总数（用于分页）
    if (this.pagination) {
      this.pagination.total = result.length;
    }

    // 3. 分页
    if (this.pagination) {
      result = this.applyPagination(result);
    }

    this.processedData = result;
  }

  /**
   * 应用筛选
   */
  private applyFilters(data: TData[]): TData[] {
    return data.filter((row) => {
      return this.filters.every((filter) => this.matchFilter(row, filter));
    });
  }

  /**
   * 匹配单个筛选条件
   */
  private matchFilter(row: TData, filter: FilterCondition): boolean {
    const value = getNestedValue(row, filter.field);
    const filterValue = filter.value;

    switch (filter.operator) {
      case 'eq':
        return value === filterValue;
      case 'ne':
        return value !== filterValue;
      case 'gt':
        return value > filterValue;
      case 'gte':
        return value >= filterValue;
      case 'lt':
        return value < filterValue;
      case 'lte':
        return value <= filterValue;
      case 'contains':
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
      case 'startsWith':
        return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
      case 'endsWith':
        return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value);
      default:
        return true;
    }
  }

  /**
   * 应用排序
   */
  private applySorting(data: TData[], columns: Column<TData>[]): TData[] {
    const sorted = [...data];

    sorted.sort((a, b) => {
      for (const sort of this.sorting) {
        const column = columns.find((col) => col.id === sort.id);
        if (!column) continue;

        let result = 0;

        // 使用自定义排序函数
        if (column.sortFn) {
          result = column.sortFn(a, b);
        } else {
          // 默认排序
          const aValue = getNestedValue(a, column.prop as string);
          const bValue = getNestedValue(b, column.prop as string);

          if (aValue === bValue) {
            result = 0;
          } else if (aValue == null) {
            result = 1;
          } else if (bValue == null) {
            result = -1;
          } else if (typeof aValue === 'string' && typeof bValue === 'string') {
            result = aValue.localeCompare(bValue);
          } else {
            result = aValue < bValue ? -1 : 1;
          }
        }

        if (result !== 0) {
          return sort.order === 'asc' ? result : -result;
        }
      }
      return 0;
    });

    return sorted;
  }

  /**
   * 应用分页
   */
  private applyPagination(data: TData[]): TData[] {
    if (!this.pagination) return data;

    const { pageIndex, pageSize } = this.pagination;
    const start = pageIndex * pageSize;
    const end = start + pageSize;

    return data.slice(start, end);
  }

  /**
   * 获取当前排序状态
   */
  getSorting(): SortingState {
    return this.sorting;
  }

  /**
   * 获取当前筛选状态
   */
  getFilters(): FilterState {
    return this.filters;
  }

  /**
   * 获取当前分页状态
   */
  getPagination(): PaginationState | null {
    return this.pagination;
  }

  /**
   * 清除所有筛选
   */
  clearFilters(): void {
    this.filters = [];
    this.reprocess();
  }

  /**
   * 清除所有排序
   */
  clearSorting(): void {
    this.sorting = [];
    this.reprocess();
  }
}



