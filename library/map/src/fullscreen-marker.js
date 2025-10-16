import { MapRenderer } from './MapRenderer';
import './style.css';

// 初始化地图渲染器
const mapContainer = document.getElementById('map-fullscreen');

// 根据容器尺寸计算初始缩放
function calculateInitialZoom() {
  const rect = mapContainer.getBoundingClientRect();
  const aspectRatio = rect.width / rect.height;
  
  // 广州市需要更大的缩放级别
  let zoom = 8.5;
  if (aspectRatio > 1.6) {
    zoom = 8.2;  // 超宽屏
  } else if (aspectRatio > 1.3) {
    zoom = 8.4;  // 宽屏
  } else if (aspectRatio < 0.7) {
    zoom = 8.8;  // 竖屏
  } else {
    zoom = 8.5;  // 正常比例
  }
  
  return zoom;
}

const initialZoom = calculateInitialZoom();

const mapRenderer = new MapRenderer(mapContainer, {
  mode: '2d',
  // 使用广州市中心
  longitude: 113.264434,
  latitude: 23.129162,
  zoom: initialZoom,
  viewState: {
    longitude: 113.264434,
    latitude: 23.129162,
    zoom: initialZoom,
    pitch: 0,
    bearing: 0,
    transitionDuration: 0
  },
  autoFit: true,  // 启用自动适配
  smoothZoom: true,
  zoomSpeed: 0.5,
  transitionDuration: 300,
  showTooltip: true
});

// 加载广州市地图数据
async function loadGuangzhouMap() {
  try {
    // 加载广州市数据
    const response = await fetch('/src/maps/city/440100.json');
    const geoJson = await response.json();
    
    // 渲染地图
    mapRenderer.renderGeoJSON(geoJson, {
      id: 'guangzhou-base',
      filled: true,
      stroked: true,
      lineWidthMinPixels: 1,
      getLineColor: [255, 255, 255, 200],
      getFillColor: (feature) => {
        // 根据区域生成不同的颜色
        const colors = [
          [102, 126, 234, 180],  // 紫蓝色
          [17, 153, 142, 180],   // 青绿色
          [252, 74, 26, 180],    // 橙红色
          [79, 172, 254, 180],   // 天蓝色
          [235, 51, 73, 180],    // 红色
          [56, 178, 172, 180],   // 青色
          [255, 195, 0, 180],    // 金色
          [149, 97, 226, 180],   // 紫色
        ];
        const index = Math.floor(Math.random() * colors.length);
        return colors[index];
      },
      labelOptions: {
        fontSize: 14,
        getColor: [255, 255, 255, 255],
        fontWeight: 'bold'
      }
    });
    
    // 地图加载完成后，强制设置一个合适的视口
    // 确保地图完全在视口内且不溢出
    setTimeout(() => {
      // 广东省的实际范围大约是：
      // 经度: 109.5°E - 117.5°E
      // 纬度: 20°N - 25.5°N
      // 为了确保地图完全显示在视口内，需要让视点居中并保持适当缩放
      const containerRect = mapContainer.getBoundingClientRect();
      const aspectRatio = containerRect.width / containerRect.height;
      
      // 根据容器宽高比调整缩放
      let zoom = 6.0;
      if (aspectRatio > 1.5) {
        zoom = 5.8;  // 宽屏需要更小的缩放
      } else if (aspectRatio < 0.8) {
        zoom = 6.3;  // 竖屏需要稍大的缩放
      }
      
      mapRenderer.setViewState({
        longitude: 113.5,
        latitude: 23.0,
        zoom: zoom,
        pitch: 0,
        bearing: 0,
        transitionDuration: 800
      });
    }, 100);
    
    updateStatus('地图加载完成');
  } catch (error) {
    console.error('Failed to load map:', error);
    updateStatus('地图加载失败');
  }
}

// 标记点数据存储
let markerCount = 0;
let landmarkCount = 0;
let animatedCount = 0;
let markersVisible = true;
let animationEnabled = true;

// 美丽地标位置（广州市内）
const beautifulLandmarks = [
  { name: '广州塔', coordinates: [113.3245, 23.1066], color: [255, 215, 0, 255] },
  { name: '白云山', coordinates: [113.3025, 23.1772], color: [34, 139, 34, 255] },
  { name: '珠江新城', coordinates: [113.3212, 23.1198], color: [30, 144, 255, 255] },
  { name: '北京路步行街', coordinates: [113.2664, 23.1318], color: [255, 105, 180, 255] },
  { name: '花城广场', coordinates: [113.3206, 23.1201], color: [138, 43, 226, 255] },
  { name: '中山纪念堂', coordinates: [113.2685, 23.1453], color: [255, 69, 0, 255] },
  { name: '陈家祠', coordinates: [113.2506, 23.1281], color: [0, 191, 255, 255] },
  { name: '沙面', coordinates: [113.2700, 23.1046], color: [50, 205, 50, 255] }
];

// 添加美观地标
document.getElementById('add-beautiful-landmarks').addEventListener('click', () => {
  const markers = beautifulLandmarks.map(landmark => ({
    position: landmark.coordinates,
    size: 15,
    color: landmark.color,
    shape: 'circle',
    label: landmark.name,
    animation: animationEnabled ? 'ripple' : 'none',
    glowEffect: true,
    glowRadius: 20,
    glowIntensity: 0.5
  }));
  
  mapRenderer.addMarkerGroup({
    id: 'beautiful-landmarks',
    markers: markers
  });
  
  landmarkCount = beautifulLandmarks.length;
  markerCount += landmarkCount;
  updateStats();
  updateStatus(`已添加 ${landmarkCount} 个美丽地标`);
});

// 添加动画标记
document.getElementById('add-animated-markers').addEventListener('click', () => {
  const animations = ['pulse', 'bounce', 'ripple', 'glow'];
  const shapes = ['circle', 'square', 'triangle', 'diamond'];
  const colors = [
    [255, 87, 34, 255],   // 深橙色
    [33, 150, 243, 255],  // 蓝色
    [76, 175, 80, 255],   // 绿色
    [255, 193, 7, 255],   // 琥珀色
    [156, 39, 176, 255],  // 紫色
  ];
  
  // 在广州市范围内生成随机位置
  const randomMarkers = Array.from({ length: 10 }, () => {
    const longitude = 113.0 + Math.random() * 0.6;  // 广州市经度范围约113.0-113.6
    const latitude = 22.9 + Math.random() * 0.5;    // 广州市纬度范围约22.9-23.4
    
    return {
      position: [longitude, latitude],
      size: 8 + Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      animation: animationEnabled ? animations[Math.floor(Math.random() * animations.length)] : 'none',
      glowEffect: Math.random() > 0.5,
      glowRadius: 10 + Math.random() * 20,
      glowIntensity: 0.3 + Math.random() * 0.4
    };
  });
  
  mapRenderer.addMarkerGroup({
    id: `animated-markers-${Date.now()}`,
    markers: randomMarkers
  });
  
  animatedCount += 10;
  markerCount += 10;
  updateStats();
  updateStatus('已添加 10 个动画标记');
});

// 切换动画效果
document.getElementById('toggle-animation').addEventListener('click', () => {
  animationEnabled = !animationEnabled;
  
  // 更新所有标记的动画状态
  const allMarkers = mapRenderer.getAllMarkers();
  allMarkers.forEach(marker => {
    if (marker.id) {
      mapRenderer.updateMarker(marker.id, {
        animation: animationEnabled ? (marker.animation || 'pulse') : 'none'
      });
    }
  });
  
  updateStatus(animationEnabled ? '动画已启用' : '动画已禁用');
});

// 显示/隐藏标记
document.getElementById('toggle-visibility').addEventListener('click', () => {
  markersVisible = !markersVisible;
  
  // 更新所有标记的可见性
  const allMarkers = mapRenderer.getAllMarkers();
  allMarkers.forEach(marker => {
    if (marker.id) {
      mapRenderer.setMarkerVisibility(marker.id, markersVisible);
    }
  });
  
  updateStatus(markersVisible ? '标记已显示' : '标记已隐藏');
});

// 清除所有标记
document.getElementById('clear-all').addEventListener('click', () => {
  mapRenderer.clearMarkers();
  markerCount = 0;
  landmarkCount = 0;
  animatedCount = 0;
  updateStats();
  updateStatus('已清除所有标记');
});

// 更新统计信息
function updateStats() {
  document.getElementById('marker-count').textContent = markerCount;
  document.getElementById('landmark-count').textContent = landmarkCount;
  document.getElementById('animated-count').textContent = animatedCount;
  document.getElementById('last-action').textContent = new Date().toLocaleTimeString('zh-CN');
}

// 更新状态栏
function updateStatus(message) {
  document.getElementById('status-text').textContent = message;
}

// 初始化页面
loadGuangzhouMap();
updateStats();

// 添加键盘快捷键
document.addEventListener('keydown', (event) => {
  switch(event.key) {
    case '1':
      document.getElementById('add-beautiful-landmarks').click();
      break;
    case '2':
      document.getElementById('add-animated-markers').click();
      break;
    case '3':
      document.getElementById('toggle-animation').click();
      break;
    case '4':
      document.getElementById('toggle-visibility').click();
      break;
    case 'Delete':
    case 'Backspace':
      if (event.ctrlKey || event.metaKey) {
        document.getElementById('clear-all').click();
      }
      break;
  }
});

// 添加窗口大小调整处理
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // 重新计算并设置视口
    const newZoom = calculateInitialZoom();
    mapRenderer.setViewState({
      longitude: 113.5,
      latitude: 23.0,
      zoom: newZoom,
      transitionDuration: 300
    });
    mapRenderer.resize();
    updateStatus('窗口大小已调整');
  }, 300);
});

// 导出给全局使用（便于调试）
window.mapRenderer = mapRenderer;