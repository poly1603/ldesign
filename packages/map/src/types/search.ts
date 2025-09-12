/**
 * 地址搜索相关类型定义
 * 支持地理编码、反向地理编码和POI搜索功能
 */

import type { Coordinate } from 'ol/coordinate';

/**
 * 搜索配置选项
 */
export interface SearchOptions {
  /** 搜索查询文本 */
  query: string;
  /** 搜索类型 */
  type?: SearchType;
  /** 搜索范围边界 */
  bounds?: [number, number, number, number];
  /** 搜索中心点 */
  center?: Coordinate;
  /** 搜索半径（米） */
  radius?: number;
  /** 返回结果数量限制 */
  limit?: number;
  /** 搜索语言 */
  language?: string;
  /** 国家代码限制 */
  countryCode?: string;
  /** POI类型过滤 */
  poiTypes?: string[];
  /** 是否包含详细信息 */
  includeDetails?: boolean;
  /** 搜索提供商 */
  provider?: SearchProvider;
}

/**
 * 搜索类型
 */
export enum SearchType {
  /** 地址搜索 */
  ADDRESS = 'address',
  /** POI搜索 */
  POI = 'poi',
  /** 地理编码 */
  GEOCODING = 'geocoding',
  /** 反向地理编码 */
  REVERSE_GEOCODING = 'reverse_geocoding',
  /** 综合搜索 */
  COMPREHENSIVE = 'comprehensive'
}

/**
 * 搜索提供商
 */
export enum SearchProvider {
  /** 高德地图 */
  AMAP = 'amap',
  /** 百度地图 */
  BAIDU = 'baidu',
  /** 腾讯地图 */
  TENCENT = 'tencent',
  /** OpenStreetMap Nominatim */
  NOMINATIM = 'nominatim',
  /** Mapbox */
  MAPBOX = 'mapbox',
  /** Google Maps */
  GOOGLE = 'google',
  /** 天地图 */
  TIANDITU = 'tianditu'
}

/**
 * 地理编码选项
 */
export interface GeocodingOptions {
  /** 地址文本 */
  address: string;
  /** 搜索范围边界 */
  bounds?: [number, number, number, number];
  /** 国家代码 */
  countryCode?: string;
  /** 语言 */
  language?: string;
  /** 结果数量限制 */
  limit?: number;
  /** 搜索提供商 */
  provider?: SearchProvider;
}

/**
 * 反向地理编码选项
 */
export interface ReverseGeocodingOptions {
  /** 坐标位置 */
  coordinate: Coordinate;
  /** 搜索半径（米） */
  radius?: number;
  /** 语言 */
  language?: string;
  /** 结果类型 */
  resultTypes?: ReverseGeocodingResultType[];
  /** 搜索提供商 */
  provider?: SearchProvider;
}

/**
 * 反向地理编码结果类型
 */
export enum ReverseGeocodingResultType {
  /** 国家 */
  COUNTRY = 'country',
  /** 省/州 */
  PROVINCE = 'province',
  /** 城市 */
  CITY = 'city',
  /** 区/县 */
  DISTRICT = 'district',
  /** 街道 */
  STREET = 'street',
  /** 门牌号 */
  HOUSE_NUMBER = 'house_number',
  /** POI */
  POI = 'poi'
}

/**
 * 搜索结果
 */
export interface SearchResult {
  /** 结果唯一标识 */
  id: string;
  /** 显示名称 */
  displayName: string;
  /** 地址信息 */
  address: AddressInfo;
  /** 坐标位置 */
  coordinate: Coordinate;
  /** 结果类型 */
  type: SearchResultType;
  /** 相关性评分 */
  relevance: number;
  /** 距离（米，如果有搜索中心点） */
  distance?: number;
  /** 边界框 */
  bounds?: [number, number, number, number];
  /** POI信息（如果适用） */
  poi?: POIInfo;
  /** 搜索提供商 */
  provider: SearchProvider;
  /** 额外属性 */
  properties?: Record<string, any>;
}

/**
 * 搜索结果类型
 */
export enum SearchResultType {
  /** 地址 */
  ADDRESS = 'address',
  /** 兴趣点 */
  POI = 'poi',
  /** 行政区域 */
  ADMINISTRATIVE = 'administrative',
  /** 街道 */
  STREET = 'street',
  /** 建筑物 */
  BUILDING = 'building',
  /** 自然地理特征 */
  NATURAL = 'natural'
}

/**
 * 地址信息
 */
export interface AddressInfo {
  /** 完整地址 */
  fullAddress: string;
  /** 国家 */
  country?: string;
  /** 国家代码 */
  countryCode?: string;
  /** 省/州 */
  province?: string;
  /** 城市 */
  city?: string;
  /** 区/县 */
  district?: string;
  /** 街道 */
  street?: string;
  /** 门牌号 */
  houseNumber?: string;
  /** 邮政编码 */
  postalCode?: string;
  /** 社区/小区 */
  neighborhood?: string;
}

/**
 * POI信息
 */
export interface POIInfo {
  /** POI名称 */
  name: string;
  /** POI类型 */
  type: string;
  /** POI分类 */
  category: string;
  /** 子分类 */
  subcategory?: string;
  /** 电话号码 */
  phone?: string;
  /** 网站 */
  website?: string;
  /** 营业时间 */
  openingHours?: string;
  /** 评分 */
  rating?: number;
  /** 评论数 */
  reviewCount?: number;
  /** 价格等级 */
  priceLevel?: number;
  /** 标签 */
  tags?: string[];
  /** 描述 */
  description?: string;
}

/**
 * 搜索建议选项
 */
export interface SearchSuggestionOptions {
  /** 输入文本 */
  input: string;
  /** 搜索类型 */
  types?: SearchType[];
  /** 搜索范围 */
  bounds?: [number, number, number, number];
  /** 搜索中心点 */
  center?: Coordinate;
  /** 建议数量限制 */
  limit?: number;
  /** 语言 */
  language?: string;
  /** 搜索提供商 */
  provider?: SearchProvider;
}

/**
 * 搜索建议结果
 */
export interface SearchSuggestion {
  /** 建议文本 */
  text: string;
  /** 建议类型 */
  type: SearchResultType;
  /** 匹配的文本部分 */
  matchedText?: string;
  /** 描述信息 */
  description?: string;
  /** 坐标位置（如果有） */
  coordinate?: Coordinate;
  /** 相关性评分 */
  relevance: number;
}

/**
 * 搜索历史记录
 */
export interface SearchHistory {
  /** 搜索查询 */
  query: string;
  /** 搜索类型 */
  type: SearchType;
  /** 搜索时间 */
  timestamp: Date;
  /** 搜索结果数量 */
  resultCount: number;
  /** 选中的结果 */
  selectedResult?: SearchResult;
}

/**
 * 搜索统计信息
 */
export interface SearchStatistics {
  /** 总搜索次数 */
  totalSearches: number;
  /** 成功搜索次数 */
  successfulSearches: number;
  /** 平均响应时间（毫秒） */
  averageResponseTime: number;
  /** 最常搜索的查询 */
  topQueries: { query: string; count: number }[];
  /** 搜索类型分布 */
  typeDistribution: Record<SearchType, number>;
  /** 提供商使用统计 */
  providerUsage: Record<SearchProvider, number>;
}

/**
 * 搜索事件类型
 */
export enum SearchEventType {
  /** 搜索开始 */
  SEARCH_STARTED = 'search-started',
  /** 搜索完成 */
  SEARCH_COMPLETED = 'search-completed',
  /** 搜索失败 */
  SEARCH_FAILED = 'search-failed',
  /** 结果选择 */
  RESULT_SELECTED = 'result-selected',
  /** 建议选择 */
  SUGGESTION_SELECTED = 'suggestion-selected',
  /** 历史记录清除 */
  HISTORY_CLEARED = 'history-cleared'
}

/**
 * 搜索事件数据
 */
export interface SearchEventData {
  /** 事件类型 */
  type: SearchEventType;
  /** 搜索选项 */
  searchOptions?: SearchOptions;
  /** 搜索结果 */
  results?: SearchResult[];
  /** 选中的结果 */
  selectedResult?: SearchResult;
  /** 错误信息 */
  error?: string;
  /** 响应时间（毫秒） */
  responseTime?: number;
  /** 事件时间戳 */
  timestamp: Date;
}

/**
 * 搜索管理器接口
 */
export interface ISearchManager {
  /** 搜索地址或POI */
  search(options: SearchOptions): Promise<SearchResult[]>;
  /** 地理编码 */
  geocode(options: GeocodingOptions): Promise<SearchResult[]>;
  /** 反向地理编码 */
  reverseGeocode(options: ReverseGeocodingOptions): Promise<SearchResult>;
  /** 获取搜索建议 */
  getSuggestions(options: SearchSuggestionOptions): Promise<SearchSuggestion[]>;
  /** 获取搜索历史 */
  getSearchHistory(limit?: number): SearchHistory[];
  /** 清除搜索历史 */
  clearSearchHistory(): void;
  /** 添加到搜索历史 */
  addToHistory(query: string, type: SearchType, results: SearchResult[], selectedResult?: SearchResult): void;
  /** 获取搜索统计 */
  getSearchStatistics(): SearchStatistics;
  /** 重置搜索统计 */
  resetSearchStatistics(): void;
  /** 设置默认搜索提供商 */
  setDefaultProvider(provider: SearchProvider): void;
  /** 获取默认搜索提供商 */
  getDefaultProvider(): SearchProvider;
  /** 配置搜索提供商 */
  configureProvider(provider: SearchProvider, config: Record<string, any>): void;
  /** 监听搜索事件 */
  on(eventType: SearchEventType, callback: (data: SearchEventData) => void): void;
  /** 移除事件监听 */
  off(eventType: SearchEventType, callback: (data: SearchEventData) => void): void;
}
