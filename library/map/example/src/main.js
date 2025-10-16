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

// 初始化标记点功能地图
function initMarkersMap() {
  const container = document.getElementById('map-markers');
  const infoDiv = document.getElementById('marker-info');
  
  if (!container || !infoDiv) {
    console.error('Markers map container not found!');
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
      showTooltip: false,
      longitude: 113.28,
      latitude: 23.13,
      zoom: 9.5  // 适当放大以看到更多细节
    });
    
    // 渲染底图
    mapRenderer.renderGeoJSON(guangzhouData, {
      id: 'markers-base-layer',
      showLabels: true,
      colorScheme: {
        mode: 'single',
        color: [240, 240, 240, 100],
        opacity: 100
      },
      labelOptions: {
        getColor: [150, 150, 150, 255],
        fontSize: 12
      }
    });
    
    mapInstances['markers'] = mapRenderer;
    
    let markersVisible = true;
    let markerCount = 0;
    
    // 添加地标按钮
    document.getElementById('add-landmarks')?.addEventListener('click', () => {
      const landmarks = [
        { name: '广州塔', position: [113.3241, 23.1063], style: 'pin', color: [255, 87, 34, 255], size: 25 },
        { name: '白云山', position: [113.3020, 23.1756], style: 'triangle', color: [76, 175, 80, 255], size: 22 },
        { name: '珠江新城', position: [113.3210, 23.1188], style: 'square', color: [33, 150, 243, 255], size: 20 },
        { name: '陈家祠', position: [113.2506, 23.1253], style: 'diamond', color: [156, 39, 176, 255], size: 18 },
        { name: '越秀公园', position: [113.2668, 23.1388], style: 'circle', color: [255, 193, 7, 255], size: 20, animation: 'ripple' },
        { name: '海心沙', position: [113.3184, 23.1139], style: 'circle', color: [0, 188, 212, 255], size: 18, animation: 'ripple' },
        { name: '黄埔古港', position: [113.4036, 23.0936], style: 'square', color: [121, 85, 72, 255], size: 16 },
        { name: '长隆旅游度假区', position: [113.3300, 23.0050], style: 'diamond', color: [233, 30, 99, 255], size: 22 }
      ];
      
      landmarks.forEach(landmark => {
        mapRenderer.addMarker({
          position: landmark.position,
          style: landmark.style,
          size: landmark.size,
          color: landmark.color,
          animation: landmark.animation || 'none',
          label: {
            text: landmark.name,
            offset: [0, -0.004],
            fontSize: 14,
            color: [33, 33, 33, 255],
            backgroundColor: [255, 255, 255, 220],
            backgroundPadding: [6, 3],
            visible: true
          },
          data: { name: landmark.name },
          onClick: (marker) => {
            infoDiv.textContent = `点击了: ${marker.data.name} (${marker.position[0].toFixed(4)}, ${marker.position[1].toFixed(4)})`;
          },
          onHover: (marker) => {
            mapRenderer.highlightMarker(marker.id, [255, 255, 0, 255]);
            setTimeout(() => mapRenderer.unhighlightMarker(marker.id), 1000);
          }
        });
      });
      
      markerCount += landmarks.length;
      infoDiv.textContent = `已添加 ${landmarks.length} 个地标，总计 ${markerCount} 个标记`;
    });
    
    // 添加随机标记按钮
    document.getElementById('add-random-markers')?.addEventListener('click', () => {
      const styles = ['circle', 'square', 'triangle', 'diamond', 'pin'];
      const beautifulColors = [
        [255, 87, 34, 220],    // 深橙色
        [33, 150, 243, 220],   // 蓝色
        [76, 175, 80, 220],    // 绿色
        [255, 193, 7, 220],    // 琥珀色
        [156, 39, 176, 220],   // 紫色
        [0, 188, 212, 220],    // 青色
        [233, 30, 99, 220],    // 粉红色
        [63, 81, 181, 220],    // 靛蓝色
      ];
      
      // 获取当前地图的可视范围 (基于广州的实际范围)
      const bounds = {
        minLng: 113.0,   // 广州西部边界
        maxLng: 113.7,   // 广州东部边界
        minLat: 22.7,    // 广州南部边界
        maxLat: 23.5     // 广州北部边界
      };
      
      // 根据当前缩放级别调整范围
      const viewState = mapRenderer.getDeck()?.viewState;
      if (viewState && viewState.zoom) {
        // 根据缩放级别计算可视区域
        const zoomFactor = Math.pow(2, 10 - viewState.zoom);
        const lngRange = 0.5 * zoomFactor;
        const latRange = 0.4 * zoomFactor;
        
        bounds.minLng = viewState.longitude - lngRange;
        bounds.maxLng = viewState.longitude + lngRange;
        bounds.minLat = viewState.latitude - latRange;
        bounds.maxLat = viewState.latitude + latRange;
        
        // 限制在广州大范围内
        bounds.minLng = Math.max(bounds.minLng, 112.9);
        bounds.maxLng = Math.min(bounds.maxLng, 113.8);
        bounds.minLat = Math.max(bounds.minLat, 22.5);
        bounds.maxLat = Math.min(bounds.maxLat, 23.6);
      }
      
      const newMarkers = [];
      for (let i = 0; i < 8; i++) {  // 增加到 8 个标记
        const lng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
        const lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
        const style = styles[Math.floor(Math.random() * styles.length)];
        const isCircle = style === 'circle';
        
        const marker = {
          position: [lng, lat],
          style: style,
          size: 12 + Math.random() * 18,
          color: beautifulColors[Math.floor(Math.random() * beautifulColors.length)],
          animation: isCircle && Math.random() > 0.5 ? 'ripple' : 'none',  // 50%的圆形有水波纹
          label: {
            text: `点 ${++markerCount}`,
            fontSize: 12,
            color: [255, 255, 255, 255],
            backgroundColor: [33, 33, 33, 180],
            backgroundPadding: [4, 2],
            visible: false
          },
          onClick: (marker) => {
            // 点击后显示标签
            mapRenderer.updateMarker(marker.id, {
              label: { ...marker.label, visible: true }
            });
            infoDiv.textContent = `点击了: ${marker.label.text} (${marker.position[0].toFixed(4)}, ${marker.position[1].toFixed(4)})`;
          },
          onHover: (marker) => {
            // 悬停时放大
            const originalSize = marker.size;
            mapRenderer.updateMarker(marker.id, {
              size: originalSize * 1.2
            });
            setTimeout(() => {
              mapRenderer.updateMarker(marker.id, {
                size: originalSize
              });
            }, 500);
          }
        };
        
        mapRenderer.addMarker(marker);
        newMarkers.push(marker);
      }
      
      infoDiv.textContent = `已在可视范围内添加 ${newMarkers.length} 个美观标记，总计 ${markerCount} 个标记`;
    });
    
    // 显示/隐藏标记按钮
    document.getElementById('toggle-markers')?.addEventListener('click', () => {
      markersVisible = !markersVisible;
      const markers = mapRenderer.getAllMarkers();
      markers.forEach(marker => {
        mapRenderer.setMarkerVisibility(marker.id, markersVisible);
      });
      infoDiv.textContent = markersVisible ? '标记已显示' : '标记已隐藏';
    });
    
    // 添加动画按钮
    document.getElementById('animate-markers')?.addEventListener('click', () => {
      const markers = mapRenderer.getAllMarkers();
      markers.forEach((marker, index) => {
        // 为不同标记添加不同的动画效果
        let animation = 'none';
        if (marker.style === 'circle') {
          animation = 'ripple';  // 圆形使用水波纹
        } else if (marker.style === 'pin') {
          animation = 'bounce';  // 图钉使用弹跳
        } else {
          animation = 'pulse';   // 其他使用脉动
        }
        
        mapRenderer.updateMarker(marker.id, {
          animation: animation,
          animationDuration: 2000
        });
      });
      infoDiv.textContent = '已为所有标记添加美观的动画效果';
      
      // 5秒后停止动画
      setTimeout(() => {
        markers.forEach(marker => {
          mapRenderer.updateMarker(marker.id, {
            animation: 'none'
          });
        });
        infoDiv.textContent = '动画已停止';
      }, 5000);
    });
    
    // 清除标记按钮
    document.getElementById('clear-markers')?.addEventListener('click', () => {
      mapRenderer.clearMarkers();
      markerCount = 0;
      infoDiv.textContent = '所有标记已清除';
    });
    
    console.log('Markers map initialized');
  } catch (error) {
    console.error('Error initializing markers map:', error);
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
  initMarkersMap();
});
