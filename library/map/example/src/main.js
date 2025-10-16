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

// 存储地图实例
const mapInstances = {};

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
      // 创建地图渲染器，启用平滑缩放，明确禁用 tooltip，启用单选
      const mapRenderer = new MapRenderer(container, {
        mode: '2d',
        autoFit: true,
        smoothZoom: true,           // 启用平滑缩放动画
        zoomSpeed: 0.5,             // 缩放速度（0.5 = 中速）
        transitionDuration: 300,    // 动画时长 300ms
        inertia: true,              // 启用惯性效果
        showTooltip: false,         // 明确禁用 tooltip（黑色弹窗）
        selectionMode: 'single',    // 启用单选模式
        selectionStyle: {
          strokeColor: [255, 0, 0, 255],     // 红色描边
          strokeWidth: 3,
          highlightColor: [255, 0, 0, 80]    // 红色半透明高亮
        }
      });

      // 渲染 GeoJSON 数据
      mapRenderer.renderGeoJSON(guangzhouData, {
        id: config.layerId,
        showLabels: true,
        colorScheme: config.colorScheme,
        labelOptions: {
          getColor: 'auto',  // 自动计算文本颜色
          fontSize: 14       // 基础字体大小，会根据 zoom 动态调整
        }
      });

      console.log(`Map ${config.containerId} initialized successfully`);

    } catch (error) {
      console.error(`Error initializing map ${config.containerId}:`, error);
    }
  });

  console.log('All maps initialized!');
}

// 初始化单选模式地图
function initSingleSelectMap() {
  const container = document.getElementById('map-single-select');
  const infoDiv = document.getElementById('info-single');
  
  if (!container || !infoDiv) {
    console.error('Single select map container not found!');
    return;
  }
  
  try {
    const mapRenderer = new MapRenderer(container, {
      mode: '2d',
      autoFit: true,
      smoothZoom: true,
      zoomSpeed: 0.5,
      transitionDuration: 300,
      inertia: true,
      showTooltip: false,           // 禁用 tooltip
      selectionMode: 'single',      // 启用单选模式
      selectionStyle: {
        strokeColor: [255, 215, 0, 255],   // 金色描边
        strokeWidth: 4,
        highlightColor: [255, 215, 0, 100] // 金色高亮
      },
      onSelect: (selectedFeatures) => {
        // 选择回调
        if (selectedFeatures.length === 0) {
          infoDiv.textContent = '未选择任何区域';
        } else {
          const feature = selectedFeatures[0];
          const name = feature.properties?.name || '未知';
          const adcode = feature.properties?.adcode || 'N/A';
          infoDiv.textContent = `已选择：${name} (${adcode})`;
        }
      }
    });
    
    mapRenderer.renderGeoJSON(guangzhouData, {
      id: 'single-select-layer',
      showLabels: true,
      colorScheme: colorSchemes.category,
      labelOptions: {
        getColor: 'auto',
        fontSize: 14
      }
    });
    
    mapInstances['single-select'] = mapRenderer;
    
    // 清除按钮
    document.getElementById('clear-single')?.addEventListener('click', () => {
      mapRenderer.clearSelection();
    });
    
    console.log('Single select map initialized');
  } catch (error) {
    console.error('Error initializing single select map:', error);
  }
}

// 初始化多选模式地图
function initMultipleSelectMap() {
  const container = document.getElementById('map-multiple-select');
  const infoDiv = document.getElementById('info-multiple');
  
  if (!container || !infoDiv) {
    console.error('Multiple select map container not found!');
    return;
  }
  
  try {
    const mapRenderer = new MapRenderer(container, {
      mode: '2d',
      autoFit: true,
      smoothZoom: true,
      zoomSpeed: 0.5,
      transitionDuration: 300,
      inertia: true,
      showTooltip: false,           // 禁用 tooltip
      selectionMode: 'multiple',    // 启用多选模式
      selectionStyle: {
        strokeColor: [76, 175, 80, 255],   // 绿色描边
        strokeWidth: 4,
        highlightColor: [76, 175, 80, 100] // 绿色高亮
      },
      onSelect: (selectedFeatures) => {
        // 选择回调
        if (selectedFeatures.length === 0) {
          infoDiv.textContent = '未选择任何区域';
        } else {
          const names = selectedFeatures.map(f => f.properties?.name || '未知').join('、');
          infoDiv.textContent = `已选择 ${selectedFeatures.length} 个区域：${names}`;
        }
      }
    });
    
    mapRenderer.renderGeoJSON(guangzhouData, {
      id: 'multiple-select-layer',
      showLabels: true,
      colorScheme: colorSchemes.gradient,
      labelOptions: {
        getColor: 'auto',
        fontSize: 14
      }
    });
    
    mapInstances['multiple-select'] = mapRenderer;
    
    // 清除按钮
    document.getElementById('clear-multiple')?.addEventListener('click', () => {
      mapRenderer.clearSelection();
    });
    
    console.log('Multiple select map initialized');
  } catch (error) {
    console.error('Error initializing multiple select map:', error);
  }
}

// DOM加载完成后初始化所有地图
document.addEventListener('DOMContentLoaded', () => {
  initAllMaps();
  initSingleSelectMap();
  initMultipleSelectMap();
});
