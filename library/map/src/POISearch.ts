import { ScatterplotLayer, TextLayer, IconLayer } from '@deck.gl/layers';
import type { DeckGLLayer } from './types';

/**
 * POI 类型
 */
export type POIType = 
  | 'restaurant'
  | 'hotel'
  | 'shopping'
  | 'hospital'
  | 'school'
  | 'bank'
  | 'gas_station'
  | 'parking'
  | 'transit'
  | 'entertainment'
  | 'government'
  | 'company'
  | 'scenic'
  | 'custom';

/**
 * POI 数据
 */
export interface POIData {
  id: string;
  name: string;
  type: POIType;
  position: [number, number];
  address?: string;
  phone?: string;
  rating?: number;
  tags?: string[];
  distance?: number;
  description?: string;
  icon?: string;
  color?: number[];
  metadata?: any;
}

/**
 * 搜索选项
 */
export interface SearchOptions {
  keyword?: string;
  types?: POIType[];
  center?: [number, number];
  radius?: number;
  limit?: number;
  sortBy?: 'distance' | 'rating' | 'name';
  filters?: SearchFilter[];
}

/**
 * 搜索过滤器
 */
export interface SearchFilter {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'in';
  value: any;
}

/**
 * 搜索结果
 */
export interface SearchResult {
  total: number;
  results: POIData[];
  center?: [number, number];
  radius?: number;
  searchTime: number;
}

/**
 * POI 分类配置
 */
export interface POICategoryConfig {
  type: POIType;
  name: string;
  icon: string;
  color: number[];
  visible?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * POISearch - POI搜索管理器
 * 支持关键字搜索、空间搜索、分类筛选等
 */
export class POISearch {
  private poiDatabase: Map<string, POIData> = new Map();
  private poiIndex: Map<POIType, Set<string>> = new Map();
  private searchHistory: SearchResult[] = [];
  private layers: DeckGLLayer[] = [];
  private visiblePOIs: Set<string> = new Set();
  private selectedPOI: POIData | null = null;
  private categoryConfigs: Map<POIType, POICategoryConfig> = new Map();
  
  constructor() {
    this.initializeCategoryConfigs();
  }
  
  /**
   * 初始化分类配置
   */
  private initializeCategoryConfigs(): void {
    const configs: POICategoryConfig[] = [
      { type: 'restaurant', name: '餐饮', icon: '🍴', color: [255, 87, 34] },
      { type: 'hotel', name: '酒店', icon: '🏨', color: [33, 150, 243] },
      { type: 'shopping', name: '购物', icon: '🛍️', color: [156, 39, 176] },
      { type: 'hospital', name: '医院', icon: '🏥', color: [244, 67, 54] },
      { type: 'school', name: '学校', icon: '🎓', color: [3, 169, 244] },
      { type: 'bank', name: '银行', icon: '🏦', color: [76, 175, 80] },
      { type: 'gas_station', name: '加油站', icon: '⛽', color: [255, 193, 7] },
      { type: 'parking', name: '停车场', icon: '🅿️', color: [96, 125, 139] },
      { type: 'transit', name: '交通', icon: '🚇', color: [0, 188, 212] },
      { type: 'entertainment', name: '娱乐', icon: '🎭', color: [255, 152, 0] },
      { type: 'government', name: '政府', icon: '🏛️', color: [63, 81, 181] },
      { type: 'company', name: '企业', icon: '🏢', color: [158, 158, 158] },
      { type: 'scenic', name: '景点', icon: '🏞️', color: [139, 195, 74] },
      { type: 'custom', name: '自定义', icon: '📍', color: [121, 85, 72] }
    ];
    
    configs.forEach(config => {
      this.categoryConfigs.set(config.type, { ...config, visible: true });
    });
  }
  
  /**
   * 添加 POI
   */
  addPOI(poi: POIData): void {
    this.poiDatabase.set(poi.id, poi);
    
    // 更新索引
    if (!this.poiIndex.has(poi.type)) {
      this.poiIndex.set(poi.type, new Set());
    }
    this.poiIndex.get(poi.type)!.add(poi.id);
    
    // 添加到可见集合
    this.visiblePOIs.add(poi.id);
    
    this.updateLayers();
  }
  
  /**
   * 批量添加 POI
   */
  addPOIs(pois: POIData[]): void {
    pois.forEach(poi => {
      this.poiDatabase.set(poi.id, poi);
      
      if (!this.poiIndex.has(poi.type)) {
        this.poiIndex.set(poi.type, new Set());
      }
      this.poiIndex.get(poi.type)!.add(poi.id);
      
      this.visiblePOIs.add(poi.id);
    });
    
    this.updateLayers();
  }
  
  /**
   * 更新 POI
   */
  updatePOI(poiId: string, updates: Partial<POIData>): void {
    const poi = this.poiDatabase.get(poiId);
    if (poi) {
      // 如果类型改变，更新索引
      if (updates.type && updates.type !== poi.type) {
        this.poiIndex.get(poi.type)?.delete(poiId);
        if (!this.poiIndex.has(updates.type)) {
          this.poiIndex.set(updates.type, new Set());
        }
        this.poiIndex.get(updates.type)!.add(poiId);
      }
      
      this.poiDatabase.set(poiId, { ...poi, ...updates });
      this.updateLayers();
    }
  }
  
  /**
   * 删除 POI
   */
  removePOI(poiId: string): void {
    const poi = this.poiDatabase.get(poiId);
    if (poi) {
      this.poiDatabase.delete(poiId);
      this.poiIndex.get(poi.type)?.delete(poiId);
      this.visiblePOIs.delete(poiId);
      
      if (this.selectedPOI?.id === poiId) {
        this.selectedPOI = null;
      }
      
      this.updateLayers();
    }
  }
  
  /**
   * 清空所有 POI
   */
  clearPOIs(): void {
    this.poiDatabase.clear();
    this.poiIndex.clear();
    this.visiblePOIs.clear();
    this.selectedPOI = null;
    this.layers = [];
  }
  
  /**
   * 搜索 POI
   */
  search(options: SearchOptions): SearchResult {
    const startTime = Date.now();
    let results: POIData[] = Array.from(this.poiDatabase.values());
    
    // 关键字搜索
    if (options.keyword) {
      const keyword = options.keyword.toLowerCase();
      results = results.filter(poi => 
        poi.name.toLowerCase().includes(keyword) ||
        poi.address?.toLowerCase().includes(keyword) ||
        poi.tags?.some(tag => tag.toLowerCase().includes(keyword)) ||
        poi.description?.toLowerCase().includes(keyword)
      );
    }
    
    // 类型筛选
    if (options.types && options.types.length > 0) {
      results = results.filter(poi => options.types!.includes(poi.type));
    }
    
    // 空间搜索
    if (options.center && options.radius) {
      results = results.filter(poi => {
        const distance = this.calculateDistance(poi.position, options.center!);
        poi.distance = distance;
        return distance <= options.radius!;
      });
    } else if (options.center) {
      // 计算距离但不过滤
      results.forEach(poi => {
        poi.distance = this.calculateDistance(poi.position, options.center!);
      });
    }
    
    // 应用过滤器
    if (options.filters) {
      results = this.applyFilters(results, options.filters);
    }
    
    // 排序
    if (options.sortBy) {
      results = this.sortResults(results, options.sortBy);
    }
    
    // 限制结果数量
    if (options.limit && options.limit > 0) {
      results = results.slice(0, options.limit);
    }
    
    const searchResult: SearchResult = {
      total: results.length,
      results,
      center: options.center,
      radius: options.radius,
      searchTime: Date.now() - startTime
    };
    
    // 保存搜索历史
    this.searchHistory.unshift(searchResult);
    if (this.searchHistory.length > 10) {
      this.searchHistory.pop();
    }
    
    return searchResult;
  }
  
  /**
   * 附近搜索
   */
  searchNearby(center: [number, number], radius: number, type?: POIType): SearchResult {
    return this.search({
      center,
      radius,
      types: type ? [type] : undefined,
      sortBy: 'distance'
    });
  }
  
  /**
   * 沿路搜索
   */
  searchAlongRoute(route: [number, number][], bufferDistance: number, type?: POIType): SearchResult {
    const startTime = Date.now();
    let results: POIData[] = Array.from(this.poiDatabase.values());
    
    // 类型筛选
    if (type) {
      results = results.filter(poi => poi.type === type);
    }
    
    // 沿路筛选
    results = results.filter(poi => {
      for (let i = 0; i < route.length - 1; i++) {
        const distance = this.pointToSegmentDistance(
          poi.position,
          route[i],
          route[i + 1]
        );
        if (distance <= bufferDistance) {
          poi.distance = distance;
          return true;
        }
      }
      return false;
    });
    
    // 按距离排序
    results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    return {
      total: results.length,
      results,
      searchTime: Date.now() - startTime
    };
  }
  
  /**
   * 获取 POI 详情
   */
  getPOIDetail(poiId: string): POIData | null {
    return this.poiDatabase.get(poiId) || null;
  }
  
  /**
   * 选中 POI
   */
  selectPOI(poiId: string): void {
    const poi = this.poiDatabase.get(poiId);
    if (poi) {
      this.selectedPOI = poi;
      this.updateLayers();
    }
  }
  
  /**
   * 取消选中
   */
  clearSelection(): void {
    this.selectedPOI = null;
    this.updateLayers();
  }
  
  /**
   * 设置分类可见性
   */
  setCategoryVisibility(type: POIType, visible: boolean): void {
    const config = this.categoryConfigs.get(type);
    if (config) {
      config.visible = visible;
      
      // 更新可见 POI 集合
      const poiIds = this.poiIndex.get(type);
      if (poiIds) {
        poiIds.forEach(id => {
          if (visible) {
            this.visiblePOIs.add(id);
          } else {
            this.visiblePOIs.delete(id);
          }
        });
      }
      
      this.updateLayers();
    }
  }
  
  /**
   * 获取分类配置
   */
  getCategoryConfig(type: POIType): POICategoryConfig | undefined {
    return this.categoryConfigs.get(type);
  }
  
  /**
   * 获取所有分类
   */
  getAllCategories(): POICategoryConfig[] {
    return Array.from(this.categoryConfigs.values());
  }
  
  /**
   * 获取搜索历史
   */
  getSearchHistory(): SearchResult[] {
    return this.searchHistory;
  }
  
  /**
   * 清空搜索历史
   */
  clearSearchHistory(): void {
    this.searchHistory = [];
  }
  
  /**
   * 获取统计信息
   */
  getStatistics(): any {
    const stats: any = {
      total: this.poiDatabase.size,
      visible: this.visiblePOIs.size,
      categories: {}
    };
    
    this.poiIndex.forEach((poiIds, type) => {
      stats.categories[type] = poiIds.size;
    });
    
    return stats;
  }
  
  /**
   * 获取图层
   */
  getLayers(): DeckGLLayer[] {
    return this.layers;
  }
  
  /**
   * 导出 POI 数据
   */
  exportPOIs(type?: POIType): POIData[] {
    if (type) {
      const poiIds = this.poiIndex.get(type);
      if (poiIds) {
        return Array.from(poiIds).map(id => this.poiDatabase.get(id)!).filter(Boolean);
      }
      return [];
    }
    return Array.from(this.poiDatabase.values());
  }
  
  /**
   * 导入 POI 数据
   */
  importPOIs(pois: POIData[]): void {
    this.addPOIs(pois);
  }
  
  /**
   * 更新图层
   */
  private updateLayers(): void {
    const layers: DeckGLLayer[] = [];
    
    // 获取可见的 POI
    const visiblePOIs = Array.from(this.visiblePOIs)
      .map(id => this.poiDatabase.get(id))
      .filter(poi => poi && this.categoryConfigs.get(poi.type)?.visible);
    
    if (visiblePOIs.length === 0) {
      this.layers = [];
      return;
    }
    
    // 创建散点图层
    const scatterLayer = new ScatterplotLayer({
      id: 'poi-points',
      data: visiblePOIs,
      getPosition: (d: POIData) => d.position,
      getFillColor: (d: POIData) => {
        if (this.selectedPOI?.id === d.id) {
          return [255, 0, 0, 255]; // 选中状态为红色
        }
        const config = this.categoryConfigs.get(d.type);
        return config ? [...config.color, 200] : [128, 128, 128, 200];
      },
      getRadius: (d: POIData) => this.selectedPOI?.id === d.id ? 12 : 8,
      radiusMinPixels: 4,
      radiusMaxPixels: 20,
      pickable: true,
      onClick: (info: any) => {
        if (info.object) {
          this.selectPOI(info.object.id);
        }
      }
    });
    layers.push(scatterLayer);
    
    // 创建文本标签图层
    const textLayer = new TextLayer({
      id: 'poi-labels',
      data: visiblePOIs,
      getPosition: (d: POIData) => d.position,
      getText: (d: POIData) => d.name,
      getSize: 12,
      getColor: [0, 0, 0, 255],
      getPixelOffset: [0, -20],
      billboard: true,
      pickable: false
    });
    layers.push(textLayer);
    
    // 如果有图标，创建图标图层
    const iconsData = visiblePOIs.filter(poi => poi.icon || this.categoryConfigs.get(poi.type)?.icon);
    if (iconsData.length > 0) {
      const iconMapping: any = {};
      const icons: string[] = [];
      
      // 收集所有唯一的图标
      iconsData.forEach(poi => {
        const icon = poi.icon || this.categoryConfigs.get(poi.type)?.icon;
        if (icon && !iconMapping[icon]) {
          iconMapping[icon] = {
            x: 0,
            y: icons.length * 128,
            width: 128,
            height: 128
          };
          icons.push(icon);
        }
      });
      
      // 如果有自定义图标URL，创建图标图层
      const urlIcons = iconsData.filter(poi => poi.icon && poi.icon.startsWith('http'));
      if (urlIcons.length > 0) {
        const iconLayer = new IconLayer({
          id: 'poi-icons',
          data: urlIcons,
          getPosition: (d: POIData) => d.position,
          getIcon: (d: POIData) => ({
            url: d.icon!,
            width: 128,
            height: 128
          }),
          sizeScale: 0.5,
          pickable: true,
          onClick: (info: any) => {
            if (info.object) {
              this.selectPOI(info.object.id);
            }
          }
        });
        layers.push(iconLayer);
      }
    }
    
    this.layers = layers;
  }
  
  /**
   * 应用过滤器
   */
  private applyFilters(pois: POIData[], filters: SearchFilter[]): POIData[] {
    return pois.filter(poi => {
      for (const filter of filters) {
        const value = (poi as any)[filter.field];
        
        switch (filter.operator) {
          case '=':
            if (value !== filter.value) return false;
            break;
          case '!=':
            if (value === filter.value) return false;
            break;
          case '>':
            if (!(value > filter.value)) return false;
            break;
          case '<':
            if (!(value < filter.value)) return false;
            break;
          case '>=':
            if (!(value >= filter.value)) return false;
            break;
          case '<=':
            if (!(value <= filter.value)) return false;
            break;
          case 'contains':
            if (typeof value === 'string' && !value.includes(filter.value)) return false;
            if (Array.isArray(value) && !value.includes(filter.value)) return false;
            break;
          case 'in':
            if (!filter.value.includes(value)) return false;
            break;
        }
      }
      return true;
    });
  }
  
  /**
   * 排序结果
   */
  private sortResults(pois: POIData[], sortBy: 'distance' | 'rating' | 'name'): POIData[] {
    return pois.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }
  
  /**
   * 计算两点距离
   */
  private calculateDistance(p1: [number, number], p2: [number, number]): number {
    const R = 6371000; // 地球半径（米）
    const lat1 = (p1[1] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;
    const deltaLat = ((p2[1] - p1[1]) * Math.PI) / 180;
    const deltaLng = ((p2[0] - p1[0]) * Math.PI) / 180;
    
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  /**
   * 点到线段的距离
   */
  private pointToSegmentDistance(point: [number, number], start: [number, number], end: [number, number]): number {
    const A = point[0] - start[0];
    const B = point[1] - start[1];
    const C = end[0] - start[0];
    const D = end[1] - start[1];
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx: number, yy: number;
    
    if (param < 0) {
      xx = start[0];
      yy = start[1];
    } else if (param > 1) {
      xx = end[0];
      yy = end[1];
    } else {
      xx = start[0] + param * C;
      yy = start[1] + param * D;
    }
    
    return this.calculateDistance(point, [xx, yy]);
  }
}

/**
 * 创建 POI 搜索管理器
 */
export function createPOISearch(): POISearch {
  return new POISearch();
}

/**
 * 从 GeoJSON 创建 POI
 */
export function createPOIsFromGeoJSON(geojson: any, typeField: string = 'type'): POIData[] {
  const pois: POIData[] = [];
  
  if (geojson.type === 'FeatureCollection') {
    geojson.features.forEach((feature: any) => {
      if (feature.geometry?.type === 'Point') {
        const properties = feature.properties || {};
        pois.push({
          id: properties.id || `poi-${Date.now()}-${Math.random()}`,
          name: properties.name || 'Unnamed POI',
          type: (properties[typeField] as POIType) || 'custom',
          position: feature.geometry.coordinates,
          address: properties.address,
          phone: properties.phone,
          rating: properties.rating,
          tags: properties.tags,
          description: properties.description,
          metadata: properties
        });
      }
    });
  }
  
  return pois;
}