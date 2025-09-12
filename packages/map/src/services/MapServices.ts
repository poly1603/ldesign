/**
 * 地图服务配置
 * 提供常用地图服务的预定义配置
 */

import { LayerType } from '../types';
import type { LayerConfig, TileLayerConfig } from '../types';

/**
 * 地图服务类别
 */
export enum MapServiceCategory {
  /** 街道地图 */
  STREET = 'street',
  /** 卫星地图 */
  SATELLITE = 'satellite',
  /** 地形地图 */
  TERRAIN = 'terrain',
  /** 混合地图 */
  HYBRID = 'hybrid',
  /** 中国地图 */
  CHINA = 'china'
}

/**
 * 地图服务提供商
 */
export enum MapServiceProvider {
  /** OpenStreetMap */
  OSM = 'osm',
  /** Google Maps */
  GOOGLE = 'google',
  /** Bing Maps */
  BING = 'bing',
  /** 天地图 */
  TIANDITU = 'tianditu',
  /** 高德地图 */
  AMAP = 'amap',
  /** 百度地图 */
  BAIDU = 'baidu',
  /** CartoDB */
  CARTODB = 'cartodb',
  /** Stamen */
  STAMEN = 'stamen'
}

/**
 * 地图服务信息接口
 */
export interface MapServiceInfo {
  /** 服务 ID */
  id: string;
  /** 服务名称 */
  name: string;
  /** 服务描述 */
  description: string;
  /** 服务提供商 */
  provider: MapServiceProvider;
  /** 服务类别 */
  category: MapServiceCategory;
  /** 图层配置 */
  layerConfig: LayerConfig;
  /** 是否需要 API Key */
  requiresApiKey?: boolean;
  /** API Key 参数名 */
  apiKeyParam?: string;
  /** 服务限制说明 */
  limitations?: string;
}

/**
 * 预定义的地图服务配置
 */
export const MAP_SERVICES: Record<string, MapServiceInfo> = {
  // OpenStreetMap 服务
  'osm-standard': {
    id: 'osm-standard',
    name: 'OpenStreetMap 标准',
    description: '开源的世界地图，详细的街道信息',
    provider: MapServiceProvider.OSM,
    category: MapServiceCategory.STREET,
    layerConfig: {
      id: 'osm-standard',
      name: 'OpenStreetMap 标准',
      type: LayerType.OSM,
      visible: true
    }
  },

  'osm-humanitarian': {
    id: 'osm-humanitarian',
    name: 'OpenStreetMap 人道主义',
    description: '适合人道主义用途的地图样式',
    provider: MapServiceProvider.OSM,
    category: MapServiceCategory.STREET,
    layerConfig: {
      id: 'osm-humanitarian',
      name: 'OpenStreetMap 人道主义',
      type: LayerType.XYZ,
      url: 'https://tile-{a-c}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      visible: true,
      attribution: '© OpenStreetMap contributors, Tiles courtesy of Humanitarian OpenStreetMap Team'
    } as TileLayerConfig
  },

  // CartoDB 服务
  'cartodb-positron': {
    id: 'cartodb-positron',
    name: 'CartoDB Positron',
    description: '简洁的浅色地图样式',
    provider: MapServiceProvider.CARTODB,
    category: MapServiceCategory.STREET,
    layerConfig: {
      id: 'cartodb-positron',
      name: 'CartoDB Positron',
      type: LayerType.XYZ,
      url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      visible: true,
      attribution: '© OpenStreetMap contributors, © CartoDB'
    } as TileLayerConfig
  },

  'cartodb-dark': {
    id: 'cartodb-dark',
    name: 'CartoDB Dark Matter',
    description: '简洁的深色地图样式',
    provider: MapServiceProvider.CARTODB,
    category: MapServiceCategory.STREET,
    layerConfig: {
      id: 'cartodb-dark',
      name: 'CartoDB Dark Matter',
      type: LayerType.XYZ,
      url: 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      visible: true,
      attribution: '© OpenStreetMap contributors, © CartoDB'
    } as TileLayerConfig
  },

  // Stamen 服务
  'stamen-terrain': {
    id: 'stamen-terrain',
    name: 'Stamen Terrain',
    description: '地形地图，显示山脉和地形特征',
    provider: MapServiceProvider.STAMEN,
    category: MapServiceCategory.TERRAIN,
    layerConfig: {
      id: 'stamen-terrain',
      name: 'Stamen Terrain',
      type: LayerType.XYZ,
      url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
      visible: true,
      attribution: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL'
    } as TileLayerConfig
  },

  'stamen-watercolor': {
    id: 'stamen-watercolor',
    name: 'Stamen Watercolor',
    description: '水彩风格的艺术地图',
    provider: MapServiceProvider.STAMEN,
    category: MapServiceCategory.STREET,
    layerConfig: {
      id: 'stamen-watercolor',
      name: 'Stamen Watercolor',
      type: LayerType.XYZ,
      url: 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png',
      visible: true,
      attribution: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL'
    } as TileLayerConfig
  },

  // 天地图服务（需要 API Key）
  'tianditu-vec': {
    id: 'tianditu-vec',
    name: '天地图矢量',
    description: '国家地理信息公共服务平台矢量地图',
    provider: MapServiceProvider.TIANDITU,
    category: MapServiceCategory.CHINA,
    requiresApiKey: true,
    apiKeyParam: 'tk',
    layerConfig: {
      id: 'tianditu-vec',
      name: '天地图矢量',
      type: LayerType.XYZ,
      url: 'https://t{0-7}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={API_KEY}',
      visible: true,
      attribution: '© 天地图'
    } as TileLayerConfig,
    limitations: '需要申请天地图 API Key'
  },

  'tianditu-img': {
    id: 'tianditu-img',
    name: '天地图影像',
    description: '国家地理信息公共服务平台卫星影像',
    provider: MapServiceProvider.TIANDITU,
    category: MapServiceCategory.SATELLITE,
    requiresApiKey: true,
    apiKeyParam: 'tk',
    layerConfig: {
      id: 'tianditu-img',
      name: '天地图影像',
      type: LayerType.XYZ,
      url: 'https://t{0-7}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={API_KEY}',
      visible: true,
      attribution: '© 天地图'
    } as TileLayerConfig,
    limitations: '需要申请天地图 API Key'
  },

  // Google Maps 服务（可能需要代理）
  'google-roadmap': {
    id: 'google-roadmap',
    name: 'Google 街道地图',
    description: 'Google Maps 街道地图',
    provider: MapServiceProvider.GOOGLE,
    category: MapServiceCategory.STREET,
    layerConfig: {
      id: 'google-roadmap',
      name: 'Google 街道地图',
      type: LayerType.XYZ,
      url: 'https://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      visible: true,
      attribution: '© Google'
    } as TileLayerConfig,
    limitations: '可能需要代理访问，请遵守 Google 服务条款'
  },

  'google-satellite': {
    id: 'google-satellite',
    name: 'Google 卫星地图',
    description: 'Google Maps 卫星影像',
    provider: MapServiceProvider.GOOGLE,
    category: MapServiceCategory.SATELLITE,
    layerConfig: {
      id: 'google-satellite',
      name: 'Google 卫星地图',
      type: LayerType.XYZ,
      url: 'https://mt{0-3}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      visible: true,
      attribution: '© Google'
    } as TileLayerConfig,
    limitations: '可能需要代理访问，请遵守 Google 服务条款'
  },

  'google-hybrid': {
    id: 'google-hybrid',
    name: 'Google 混合地图',
    description: 'Google Maps 卫星影像 + 标注',
    provider: MapServiceProvider.GOOGLE,
    category: MapServiceCategory.HYBRID,
    layerConfig: {
      id: 'google-hybrid',
      name: 'Google 混合地图',
      type: LayerType.XYZ,
      url: 'https://mt{0-3}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      visible: true,
      attribution: '© Google'
    } as TileLayerConfig,
    limitations: '可能需要代理访问，请遵守 Google 服务条款'
  },

  'google-terrain': {
    id: 'google-terrain',
    name: 'Google 地形地图',
    description: 'Google Maps 地形地图',
    provider: MapServiceProvider.GOOGLE,
    category: MapServiceCategory.TERRAIN,
    layerConfig: {
      id: 'google-terrain',
      name: 'Google 地形地图',
      type: LayerType.XYZ,
      url: 'https://mt{0-3}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      visible: true,
      attribution: '© Google'
    } as TileLayerConfig,
    limitations: '可能需要代理访问，请遵守 Google 服务条款'
  }
};

/**
 * 根据类别获取地图服务
 * @param category 地图服务类别
 * @returns 地图服务列表
 */
export function getServicesByCategory(category: MapServiceCategory): MapServiceInfo[] {
  return Object.values(MAP_SERVICES).filter(service => service.category === category);
}

/**
 * 根据提供商获取地图服务
 * @param provider 地图服务提供商
 * @returns 地图服务列表
 */
export function getServicesByProvider(provider: MapServiceProvider): MapServiceInfo[] {
  return Object.values(MAP_SERVICES).filter(service => service.provider === provider);
}

/**
 * 获取所有可用的地图服务
 * @returns 地图服务列表
 */
export function getAllServices(): MapServiceInfo[] {
  return Object.values(MAP_SERVICES);
}

/**
 * 根据 ID 获取地图服务
 * @param id 服务 ID
 * @returns 地图服务信息或 null
 */
export function getServiceById(id: string): MapServiceInfo | null {
  return MAP_SERVICES[id] || null;
}

/**
 * 创建带 API Key 的图层配置
 * @param serviceId 服务 ID
 * @param apiKey API Key
 * @returns 图层配置或 null
 */
export function createLayerConfigWithApiKey(serviceId: string, apiKey: string): LayerConfig | null {
  const service = getServiceById(serviceId);
  if (!service || !service.requiresApiKey) {
    return service?.layerConfig || null;
  }

  const config = { ...service.layerConfig } as TileLayerConfig;
  if (config.url) {
    config.url = config.url.replace('{API_KEY}', apiKey);
  }
  
  return config;
}
