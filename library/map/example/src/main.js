// 使用库中的 MapRenderer
import { MapRenderer } from '@ldesign/map-renderer';
// 导入广州数据作为示例
import guangzhouData from './maps/city/440100.json';

// 颜色方案配置
const colorSchemes = {
  // 单色模式 - 所有区域使用相同颜色
  single: {
    mode: 'single',
    color: [100, 149, 237, 180],  // 矢车菊蓝
    opacity: 180
  },

  // 渐变色模式 - 从蓝色渐变到橙色
  gradient: {
    mode: 'gradient',
    startColor: [66, 165, 245],   // 蓝色
    endColor: [255, 152, 0],      // 橙色
    opacity: 180
  },

  // 分类色模式 - 根据adcode分配不同颜色
  category: {
    mode: 'category',
    categoryField: 'adcode',
    colors: [
      [26, 188, 156],   // 青绿
      [46, 204, 113],   // 翠绿
      [52, 152, 219],   // 蓝色
      [155, 89, 182],   // 紫色
      [52, 73, 94],     // 深蓝灰
      [241, 196, 15],   // 金黄
      [230, 126, 34],   // 橙色
      [231, 76, 60],    // 红色
      [149, 165, 166],  // 灰色
      [22, 160, 133],   // 墨绿
      [243, 156, 18]    // 橙黄
    ],
    opacity: 180
  },

  // 随机色模式
  random: {
    mode: 'random',
    opacity: 180
  },

  // 数据驱动模式（使用adcode作为数据）
  data: {
    mode: 'data',
    dataField: 'adcode',  // 使用adcode作为数据
    colorStops: [
      { value: 0, color: [68, 138, 255] },     // 蓝色
      { value: 0.5, color: [255, 235, 59] },   // 黄色
      { value: 1, color: [255, 82, 82] }       // 红色
    ],
    opacity: 180
  },

  // 自定义函数模式
  custom: {
    mode: 'custom',
    customFunction: (feature, index) => {
      // 根据区域名称的长度决定颜色
      const name = feature.properties?.name || '';
      const length = name.length;

      if (length <= 3) {
        return [255, 107, 107, 180];  // 红色系
      } else if (length <= 4) {
        return [78, 205, 196, 180];   // 青色系
      } else {
        return [162, 155, 254, 180];  // 紫色系
      }
    },
    opacity: 180
  }
};

// 地图配置
const mapConfigs = [
  { containerId: 'map-single', layerId: 'single-layer', colorScheme: colorSchemes.single },
  { containerId: 'map-gradient', layerId: 'gradient-layer', colorScheme: colorSchemes.gradient },
  { containerId: 'map-category', layerId: 'category-layer', colorScheme: colorSchemes.category },
  { containerId: 'map-random', layerId: 'random-layer', colorScheme: colorSchemes.random },
  { containerId: 'map-data', layerId: 'data-layer', colorScheme: colorSchemes.data },
  { containerId: 'map-custom', layerId: 'custom-layer', colorScheme: colorSchemes.custom }
];

// 初始化所有地图
function initAllMaps() {
  console.log('Initializing all maps...');

  mapConfigs.forEach(config => {
    const container = document.getElementById(config.containerId);

    if (!container) {
      console.error(`Container ${config.containerId} not found!`);
      return;
    }

    try {
      // 创建地图渲染器
      const mapRenderer = new MapRenderer(container, {
        mode: '2d',
        autoFit: true
      });

      // 渲染 GeoJSON 数据
      mapRenderer.renderGeoJSON(guangzhouData, {
        id: config.layerId,
        showLabels: true,
        colorScheme: config.colorScheme
      });

      console.log(`Map ${config.containerId} initialized successfully`);

    } catch (error) {
      console.error(`Error initializing map ${config.containerId}:`, error);
    }
  });

  console.log('All maps initialized!');
}

// DOM加载完成后初始化所有地图
document.addEventListener('DOMContentLoaded', initAllMaps);
