/**
 * DataFilter - 数据过滤器
 * 提供强大的数据过滤和查询功能
 */

import type { Feature, FeatureCollection } from './types';

export type FilterOperator = 
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith'
  | 'exists' | 'between' | 'matches';

export interface FilterRule {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface FilterGroup {
  logic: 'and' | 'or';
  rules: (FilterRule | FilterGroup)[];
}

export type FilterExpression = FilterRule | FilterGroup;

/**
 * 数据过滤器类
 */
export class DataFilter {
  private originalData: FeatureCollection | null = null;
  private filteredData: FeatureCollection | null = null;
  private activeFilters: FilterExpression[] = [];

  /**
   * 设置原始数据
   */
  setData(data: FeatureCollection): void {
    this.originalData = data;
    this.filteredData = data;
  }

  /**
   * 添加过滤规则
   */
  addFilter(filter: FilterExpression): void {
    this.activeFilters.push(filter);
    this.applyFilters();
  }

  /**
   * 移除过滤规则
   */
  removeFilter(index: number): void {
    this.activeFilters.splice(index, 1);
    this.applyFilters();
  }

  /**
   * 清除所有过滤
   */
  clearFilters(): void {
    this.activeFilters = [];
    this.filteredData = this.originalData;
  }

  /**
   * 应用所有过滤规则
   */
  private applyFilters(): void {
    if (!this.originalData) {
      return;
    }

    if (this.activeFilters.length === 0) {
      this.filteredData = this.originalData;
      return;
    }

    const filtered = this.originalData.features.filter(feature => {
      return this.activeFilters.every(filter => this.evaluateFilter(feature, filter));
    });

    this.filteredData = {
      type: 'FeatureCollection',
      features: filtered
    };
  }

  /**
   * 评估单个过滤规则
   */
  private evaluateFilter(feature: Feature, filter: FilterExpression): boolean {
    if (this.isFilterGroup(filter)) {
      return this.evaluateFilterGroup(feature, filter);
    }
    return this.evaluateFilterRule(feature, filter);
  }

  /**
   * 评估过滤组
   */
  private evaluateFilterGroup(feature: Feature, group: FilterGroup): boolean {
    if (group.logic === 'and') {
      return group.rules.every(rule => this.evaluateFilter(feature, rule));
    } else {
      return group.rules.some(rule => this.evaluateFilter(feature, rule));
    }
  }

  /**
   * 评估过滤规则
   */
  private evaluateFilterRule(feature: Feature, rule: FilterRule): boolean {
    const value = this.getFeatureValue(feature, rule.field);

    switch (rule.operator) {
      case 'eq':
        return value === rule.value;
      case 'ne':
        return value !== rule.value;
      case 'gt':
        return value > rule.value;
      case 'gte':
        return value >= rule.value;
      case 'lt':
        return value < rule.value;
      case 'lte':
        return value <= rule.value;
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(value);
      case 'nin':
        return Array.isArray(rule.value) && !rule.value.includes(value);
      case 'contains':
        return String(value).includes(String(rule.value));
      case 'startsWith':
        return String(value).startsWith(String(rule.value));
      case 'endsWith':
        return String(value).endsWith(String(rule.value));
      case 'exists':
        return value !== undefined && value !== null;
      case 'between':
        return Array.isArray(rule.value) && value >= rule.value[0] && value <= rule.value[1];
      case 'matches':
        return new RegExp(rule.value).test(String(value));
      default:
        return true;
    }
  }

  /**
   * 获取要素属性值
   */
  private getFeatureValue(feature: Feature, field: string): any {
    const fields = field.split('.');
    let value: any = feature.properties;

    for (const f of fields) {
      if (value === undefined || value === null) {
        return undefined;
      }
      value = value[f];
    }

    return value;
  }

  /**
   * 判断是否为过滤组
   */
  private isFilterGroup(filter: FilterExpression): filter is FilterGroup {
    return 'logic' in filter && 'rules' in filter;
  }

  /**
   * 获取过滤后的数据
   */
  getFilteredData(): FeatureCollection | null {
    return this.filteredData;
  }

  /**
   * 获取原始数据
   */
  getOriginalData(): FeatureCollection | null {
    return this.originalData;
  }

  /**
   * 获取过滤统计
   */
  getStats(): {
    total: number;
    filtered: number;
    removed: number;
    filterCount: number;
  } {
    const total = this.originalData?.features.length || 0;
    const filtered = this.filteredData?.features.length || 0;

    return {
      total,
      filtered,
      removed: total - filtered,
      filterCount: this.activeFilters.length
    };
  }

  /**
   * 快速过滤方法
   */
  static filterByProperty(
    data: FeatureCollection,
    field: string,
    operator: FilterOperator,
    value: any
  ): FeatureCollection {
    const filter = new DataFilter();
    filter.setData(data);
    filter.addFilter({ field, operator, value });
    return filter.getFilteredData() || data;
  }

  /**
   * 按名称搜索
   */
  static searchByName(data: FeatureCollection, searchTerm: string): FeatureCollection {
    const filter = new DataFilter();
    filter.setData(data);
    filter.addFilter({
      field: 'name',
      operator: 'contains',
      value: searchTerm
    });
    return filter.getFilteredData() || data;
  }

  /**
   * 按范围过滤
   */
  static filterByRange(
    data: FeatureCollection,
    field: string,
    min: number,
    max: number
  ): FeatureCollection {
    const filter = new DataFilter();
    filter.setData(data);
    filter.addFilter({
      field,
      operator: 'between',
      value: [min, max]
    });
    return filter.getFilteredData() || data;
  }
}





