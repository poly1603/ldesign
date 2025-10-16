import { MapRenderer } from '@ldesign/map-renderer';
import guangzhouData from './maps/city/440100.json';

// 全局变量
let mapRenderer;
let markersVisible = true;
let stats = {
  total: 0,
  landmarks: 0,
  animated: 0
};

// 美观的颜色方案 - 更高的饱和度和亮度
const beautifulColors = {
  primary: [102, 126, 234, 255],     // 紫蓝 - 更亮
  success: [56, 239, 125, 255],      // 绿色 - 更亮
  warning: [247, 183, 51, 255],      // 橙黄 - 更亮
  info: [79, 172, 254, 255],         // 天蓝 - 更亮
  danger: [245, 92, 67, 255],        // 红橙 - 更亮
  purple: [156, 39, 176, 255],       // 紫色 - 更亮
  cyan: [0, 188, 212, 255],          // 青色 - 更亮
  pink: [233, 30, 99, 255],          // 粉红 - 更亮
  indigo: [63, 81, 181, 255],        // 靛蓝 - 更亮
  teal: [0, 150, 136, 255],          // 青绿 - 更亮
  amber: [255, 193, 7, 255],         // 琥珀 - 更亮
  lime: [205, 220, 57, 255]          // 酸橙 - 更亮
};

// 更新统计信息
function updateStats() {
  document.getElementById('marker-count').textContent = stats.total;
  document.getElementById('landmark-count').textContent = stats.landmarks;
  document.getElementById('animated-count').textContent = stats.animated;
}

// 更新状态栏
function updateStatus(text, duration = 3000) {
  const statusText = document.getElementById('status-text');
  statusText.textContent = text;
  
  if (duration > 0) {
    setTimeout(() => {
      statusText.textContent = '准备就绪';
    }, duration);
  }
}

// 更新最后操作
function updateLastAction(action) {
  document.getElementById('last-action').textContent = action;
}

// 初始化地图
function initMap() {
  const container = document.getElementById('map-fullscreen');
  
  // 确保容器有正确的定位上下文
  if (container) {
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
  }
  
  mapRenderer = new MapRenderer(container, {
    mode: '2d',
    autoFit: false,  // 禁用自动适配
    smoothZoom: true,
    zoomSpeed: 0.6,
    transitionDuration: 0,  // 初始加载时无动画
    inertia: true,
    showTooltip: false,
    // 直接设置初始视口
    viewState: {
      longitude: 113.28,
      latitude: 23.13,
      zoom: 9,
      pitch: 0,
      bearing: 0,
      maxZoom: 15,
      minZoom: 8,
      maxPitch: 0,
      minPitch: 0
    }
  });
  
  // 渲染广州地图作为底图
  mapRenderer.renderGeoJSON(guangzhouData, {
    id: 'guangzhou-base',
    showLabels: true,
    colorScheme: {
      mode: 'gradient',
      startColor: [240, 244, 248],
      endColor: [226, 232, 240],
      opacity: 60
    },
    labelOptions: {
      fontSize: 13,
      getColor: [100, 116, 139, 200],
      fontWeight: '500'
    }
  });
  
  updateStatus('地图初始化完成');
}

// 添加美观地标
function addBeautifulLandmarks() {
  const landmarks = [
    {
      name: '广州塔',
      position: [113.3241, 23.1063],
      style: 'pin',
      color: beautifulColors.danger,
      size: 35,  // 增大尺寸
      importance: 5
    },
    {
      name: '白云山',
      position: [113.3020, 23.1756],
      style: 'triangle',
      color: beautifulColors.success,
      size: 32,  // 增大尺寸
      animation: 'pulse',  // 添加动画
      importance: 4
    },
    {
      name: '珠江新城CBD',
      position: [113.3210, 23.1188],
      style: 'square',
      color: beautifulColors.info,
      size: 30,  // 增大尺寸
      animation: 'bounce',  // 添加动画
      importance: 5
    },
    {
      name: '陈家祠',
      position: [113.2506, 23.1253],
      style: 'diamond',
      color: beautifulColors.purple,
      size: 28,  // 增大尺寸
      animation: 'pulse',  // 添加动画
      importance: 3
    },
    {
      name: '越秀公园',
      position: [113.2668, 23.1388],
      style: 'circle',
      color: beautifulColors.amber,
      size: 30,  // 增大尺寸
      animation: 'ripple',
      importance: 3
    },
    {
      name: '海心沙',
      position: [113.3184, 23.1139],
      style: 'circle',
      color: beautifulColors.cyan,
      size: 28,  // 增大尺寸
      animation: 'ripple',
      importance: 3
    },
    {
      name: '黄埔军校',
      position: [113.4036, 23.0936],
      style: 'square',
      color: beautifulColors.warning,
      size: 26,  // 增大尺寸
      animation: 'bounce',  // 添加动画
      importance: 4
    },
    {
      name: '长隆旅游度假区',
      position: [113.3300, 23.0050],
      style: 'diamond',
      color: beautifulColors.pink,
      size: 32,  // 增大尺寸
      animation: 'pulse',  // 添加动画
      importance: 4
    },
    {
      name: '花城广场',
      position: [113.3225, 23.1168],
      style: 'circle',
      color: beautifulColors.lime,
      size: 28,  // 增大尺寸
      animation: 'ripple',
      importance: 4
    },
    {
      name: '广州南站',
      position: [113.2690, 22.9880],
      style: 'square',
      color: beautifulColors.indigo,
      size: 30,  // 增大尺寸
      animation: 'bounce',  // 添加动画
      importance: 4
    }
  ];
  
  landmarks.forEach(landmark => {
    mapRenderer.addMarker({
      position: landmark.position,
      style: landmark.style,
      size: landmark.size,
      color: landmark.color,
      animation: landmark.animation || 'pulse',  // 默认都有动画
      opacity: 1.0,  // 完全不透明
      pickable: true,  // 确保可点击
      label: {
        text: landmark.name,
        offset: [0, -0.006],
        fontSize: 16,  // 更大的字体
        fontWeight: 'bold',  // 加粗
        color: [255, 255, 255, 255],
        backgroundColor: [33, 33, 33, 240],  // 更深的背景
        backgroundPadding: [10, 5],
        visible: true
      },
      data: { 
        name: landmark.name,
        type: 'landmark',
        importance: landmark.importance
      },
      onClick: (marker) => {
        updateStatus(`点击了地标: ${marker.data.name}`, 2000);
        // 聚焦到该点并添加特效
        mapRenderer.flyTo(marker.position[0], marker.position[1], 12);
        
        // 点击后的脉冲效果
        const originalSize = marker.size;
        mapRenderer.updateMarker(marker.id, {
          size: originalSize * 1.5,
          animation: 'bounce'
        });
        setTimeout(() => {
          mapRenderer.updateMarker(marker.id, {
            size: originalSize,
            animation: landmark.animation || 'pulse'
          });
        }, 500);
      },
      onHover: (marker) => {
        // 悬停时高亮和放大
        mapRenderer.highlightMarker(marker.id, [255, 215, 0, 255]);
        const originalSize = marker.size;
        mapRenderer.updateMarker(marker.id, {
          size: originalSize * 1.2
        });
        
        // 延迟恢复
        setTimeout(() => {
          mapRenderer.unhighlightMarker(marker.id);
          mapRenderer.updateMarker(marker.id, {
            size: originalSize
          });
        }, 1000);
      }
    });
    
    if (landmark.animation) {
      stats.animated++;
    }
  });
  
  stats.landmarks += landmarks.length;
  stats.total += landmarks.length;
  updateStats();
  updateLastAction('添加美观地标');
  updateStatus(`成功添加 ${landmarks.length} 个精美地标`, 3000);
}

// 添加动画标记
function addAnimatedMarkers() {
  // 获取当前视图状态
  const viewState = mapRenderer.getDeck()?.viewState;
  if (!viewState) return;
  
  // 根据当前缩放计算可视范围
  const zoomFactor = Math.pow(2, 11 - viewState.zoom);
  const lngRange = 0.3 * zoomFactor;
  const latRange = 0.2 * zoomFactor;
  
  const bounds = {
    minLng: Math.max(viewState.longitude - lngRange, 112.95),
    maxLng: Math.min(viewState.longitude + lngRange, 113.85),
    minLat: Math.max(viewState.latitude - latRange, 22.5),
    maxLat: Math.min(viewState.latitude + latRange, 23.6)
  };
  
  const markerCount = 12;
  const newMarkers = [];
  
  for (let i = 0; i < markerCount; i++) {
    const lng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
    const lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
    
    // 随机选择样式和颜色
    const styles = ['circle', 'square', 'triangle', 'diamond', 'pin'];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const colorKeys = Object.keys(beautifulColors);
    const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    const color = beautifulColors[colorKey];
    
    // 圆形标记有更高概率添加水波纹
    const hasRipple = style === 'circle' && Math.random() > 0.3;
    
    const marker = {
      position: [lng, lat],
      style: style,
      size: 20 + Math.random() * 25,  // 更大的尺寸范围
      color: color,
      animation: hasRipple ? 'ripple' : (Math.random() > 0.5 ? 'pulse' : 'bounce'),  // 更多动画
      opacity: 1.0,  // 完全不透明
      pickable: true,
      label: {
        text: `标记 ${stats.total + i + 1}`,
        fontSize: 14,  // 更大的字体
        fontWeight: 'bold',
        color: [255, 255, 255, 255],
        backgroundColor: [66, 66, 66, 220],  // 更深的背景
        backgroundPadding: [8, 4],
        visible: false
      },
      data: {
        type: 'dynamic',
        id: stats.total + i + 1
      },
      onClick: (marker) => {
        // 点击显示/隐藏标签
        const currentLabel = marker.label;
        mapRenderer.updateMarker(marker.id, {
          label: { ...currentLabel, visible: !currentLabel.visible }
        });
        updateStatus(`标记 ${marker.data.id}: ${currentLabel.visible ? '隐藏' : '显示'}标签`, 1500);
      },
      onHover: (marker) => {
        // 悬停时强烈的视觉反馈
        const originalSize = marker.size;
        const originalColor = marker.color;
        
        // 立即放大并高亮
        mapRenderer.updateMarker(marker.id, {
          size: originalSize * 1.4,
          color: [255, 255, 100, 255]  // 黄色高亮
        });
        
        // 显示标签
        mapRenderer.updateMarker(marker.id, {
          label: { ...marker.label, visible: true }
        });
        
        // 延迟恢复
        setTimeout(() => {
          mapRenderer.updateMarker(marker.id, {
            size: originalSize,
            color: originalColor,
            label: { ...marker.label, visible: false }
          });
        }, 600);
      }
    };
    
    mapRenderer.addMarker(marker);
    newMarkers.push(marker);
    
    if (hasRipple) {
      stats.animated++;
    }
  }
  
  stats.total += markerCount;
  updateStats();
  updateLastAction('添加动画标记');
  updateStatus(`在可视区域添加了 ${markerCount} 个精美标记`, 3000);
}

// 切换动画效果
function toggleAnimation() {
  const markers = mapRenderer.getAllMarkers();
  let animatedCount = 0;
  
  markers.forEach((marker, index) => {
    let animation = 'none';
    
    if (marker.style === 'circle') {
      animation = marker.animation === 'ripple' ? 'none' : 'ripple';
    } else if (marker.style === 'pin') {
      animation = marker.animation === 'bounce' ? 'none' : 'bounce';
    } else {
      animation = marker.animation === 'pulse' ? 'none' : 'pulse';
    }
    
    mapRenderer.updateMarker(marker.id, {
      animation: animation,
      animationDuration: 2000
    });
    
    if (animation !== 'none') {
      animatedCount++;
    }
  });
  
  stats.animated = animatedCount;
  updateStats();
  updateLastAction('切换动画效果');
  updateStatus(`动画效果已切换，当前 ${animatedCount} 个标记带动画`, 3000);
}

// 切换显示/隐藏
function toggleVisibility() {
  markersVisible = !markersVisible;
  const markers = mapRenderer.getAllMarkers();
  
  markers.forEach(marker => {
    mapRenderer.setMarkerVisibility(marker.id, markersVisible);
  });
  
  updateLastAction(markersVisible ? '显示所有标记' : '隐藏所有标记');
  updateStatus(markersVisible ? '所有标记已显示' : '所有标记已隐藏', 2000);
}

// 清除所有标记
function clearAll() {
  mapRenderer.clearMarkers();
  stats = { total: 0, landmarks: 0, animated: 0 };
  updateStats();
  updateLastAction('清除所有标记');
  updateStatus('已清除所有标记', 2000);
}

// 初始化事件监听
function initEventListeners() {
  document.getElementById('add-beautiful-landmarks').addEventListener('click', addBeautifulLandmarks);
  document.getElementById('add-animated-markers').addEventListener('click', addAnimatedMarkers);
  document.getElementById('toggle-animation').addEventListener('click', toggleAnimation);
  document.getElementById('toggle-visibility').addEventListener('click', toggleVisibility);
  document.getElementById('clear-all').addEventListener('click', clearAll);
  
  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    switch(e.key) {
      case '1':
        addBeautifulLandmarks();
        break;
      case '2':
        addAnimatedMarkers();
        break;
      case 'a':
      case 'A':
        toggleAnimation();
        break;
      case 'v':
      case 'V':
        toggleVisibility();
        break;
      case 'Delete':
      case 'Backspace':
        if (e.shiftKey) {
          clearAll();
        }
        break;
    }
  });
  
  updateStatus('使用数字键 1-2 快速添加标记，A 切换动画，V 切换显示', 5000);
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initEventListeners();
  
  // 自动添加一些初始地标
  setTimeout(() => {
    addBeautifulLandmarks();
  }, 1000);
});