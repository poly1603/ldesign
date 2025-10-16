// 使用库中的 MapRenderer 和标记功能
import { MapRenderer } from '@ldesign/map-renderer';
import guangzhouData from './maps/city/440100.json';

// 全局变量
let mapRenderer;
let currentStyle = 'circle';
let markerIdCounter = 0;
let markersVisible = true;
let animationEnabled = false;

// 颜色转换函数
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
    255
  ] : [255, 0, 0, 255];
}

// 生成随机位置（在广州范围内）
function getRandomPosition() {
  const minLng = 112.96;
  const maxLng = 114.05;
  const minLat = 22.45;
  const maxLat = 23.95;
  
  return [
    minLng + Math.random() * (maxLng - minLng),
    minLat + Math.random() * (maxLat - minLat)
  ];
}

// 生成随机颜色
function getRandomColor() {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    200
  ];
}

// 更新标记列表UI
function updateMarkerList() {
  const markerList = document.getElementById('marker-list');
  const markers = mapRenderer.getAllMarkers();
  
  if (markers.length === 0) {
    markerList.innerHTML = '<div style="color: #999; text-align: center;">暂无标记</div>';
    return;
  }
  
  markerList.innerHTML = markers.map(marker => `
    <div class="marker-item">
      <div class="marker-item-info">
        <strong>${marker.id}</strong>
        ${marker.label ? `<br><small>${marker.label.text}</small>` : ''}
        <br><small style="color: #999;">${marker.position[0].toFixed(2)}, ${marker.position[1].toFixed(2)}</small>
      </div>
      <div class="marker-item-actions">
        <button class="mini-btn" onclick="window.toggleMarker('${marker.id}')">显/隐</button>
        <button class="mini-btn" onclick="window.highlightMarker('${marker.id}')">高亮</button>
        <button class="mini-btn delete" onclick="window.removeMarker('${marker.id}')">删除</button>
      </div>
    </div>
  `).join('');
}

// 初始化地图
function initMap() {
  const container = document.getElementById('map-container');
  
  mapRenderer = new MapRenderer(container, {
    mode: '2d',
    autoFit: true,
    smoothZoom: true,
    zoomSpeed: 0.5,
    transitionDuration: 300,
    inertia: true,
    showTooltip: false,
    longitude: 113.28,
    latitude: 23.13,
    zoom: 9
  });
  
  // 渲染广州地图作为底图
  mapRenderer.renderGeoJSON(guangzhouData, {
    id: 'guangzhou-base',
    showLabels: true,
    colorScheme: {
      mode: 'single',
      color: [220, 230, 240, 100],
      opacity: 100
    },
    labelOptions: {
      fontSize: 12,
      getColor: [100, 100, 100, 255]
    }
  });
  
  // 添加一些示例标记
  addSampleMarkers();
}

// 添加示例标记
function addSampleMarkers() {
  // 广州主要地标
  const landmarks = [
    { name: '广州塔', position: [113.3241, 23.1063], style: 'pin', color: [255, 87, 34, 255] },
    { name: '白云山', position: [113.3020, 23.1756], style: 'triangle', color: [76, 175, 80, 255] },
    { name: '珠江新城', position: [113.3210, 23.1188], style: 'square', color: [33, 150, 243, 255] },
    { name: '陈家祠', position: [113.2506, 23.1253], style: 'diamond', color: [156, 39, 176, 255] },
    { name: '越秀公园', position: [113.2668, 23.1388], style: 'circle', color: [255, 193, 7, 255] }
  ];
  
  landmarks.forEach(landmark => {
    mapRenderer.addMarker({
      position: landmark.position,
      style: landmark.style,
      size: 20,
      color: landmark.color,
      label: {
        text: landmark.name,
        offset: [0, -0.003],
        fontSize: 14,
        color: [33, 33, 33, 255],
        backgroundColor: [255, 255, 255, 200],
        backgroundPadding: [4, 2],
        visible: true
      },
      data: { name: landmark.name },
      onClick: (marker, event) => {
        alert(`点击了: ${marker.data.name}\n位置: ${marker.position[0].toFixed(4)}, ${marker.position[1].toFixed(4)}`);
      },
      onHover: (marker, event) => {
        console.log('悬停标记:', marker.data.name);
      }
    });
  });
  
  updateMarkerList();
}

// 添加随机标记
function addRandomMarker() {
  const position = getRandomPosition();
  const color = getRandomColor();
  const size = 10 + Math.random() * 20;
  
  const markerId = mapRenderer.addMarker({
    position,
    style: currentStyle,
    size,
    color,
    label: {
      text: `标记 ${++markerIdCounter}`,
      offset: [0, -0.002],
      fontSize: 12,
      visible: true
    },
    animation: animationEnabled ? 'pulse' : 'none',
    data: { id: markerIdCounter },
    onClick: (marker) => {
      alert(`标记 ID: ${marker.id}\n位置: ${marker.position[0].toFixed(4)}, ${marker.position[1].toFixed(4)}`);
    }
  });
  
  updateMarkerList();
  return markerId;
}

// 添加标记组
function addMarkerGroup() {
  const groupMarkers = [];
  const centerLng = 113.28 + (Math.random() - 0.5) * 0.5;
  const centerLat = 23.13 + (Math.random() - 0.5) * 0.5;
  const groupColor = getRandomColor();
  
  // 在中心点周围生成5个标记
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72) * Math.PI / 180;
    const radius = 0.05;
    groupMarkers.push({
      position: [
        centerLng + radius * Math.cos(angle),
        centerLat + radius * Math.sin(angle)
      ],
      label: {
        text: `组标记 ${i + 1}`,
        fontSize: 10,
        visible: true
      }
    });
  }
  
  mapRenderer.addMarkerGroup({
    id: `group-${Date.now()}`,
    markers: groupMarkers,
    style: {
      style: currentStyle,
      size: 12,
      color: groupColor,
      animation: animationEnabled ? 'bounce' : 'none'
    }
  });
  
  updateMarkerList();
}

// 添加自定义标记
function addCustomMarker() {
  const lng = parseFloat(document.getElementById('marker-lng').value);
  const lat = parseFloat(document.getElementById('marker-lat').value);
  const label = document.getElementById('marker-label').value;
  const size = parseFloat(document.getElementById('marker-size').value);
  const color = hexToRgb(document.getElementById('marker-color').value);
  
  mapRenderer.addMarker({
    position: [lng, lat],
    style: currentStyle,
    size,
    color,
    label: label ? {
      text: label,
      offset: [0, -0.002],
      fontSize: 14,
      visible: true
    } : undefined,
    animation: animationEnabled ? 'pulse' : 'none',
    onClick: (marker) => {
      alert(`自定义标记\n标签: ${label || '无'}\n位置: ${lng.toFixed(4)}, ${lat.toFixed(4)}`);
    }
  });
  
  updateMarkerList();
}

// 全局函数（供HTML按钮调用）
window.toggleMarker = function(markerId) {
  const marker = mapRenderer.getMarker(markerId);
  if (marker) {
    mapRenderer.setMarkerVisibility(markerId, !marker.visible);
    updateMarkerList();
  }
};

window.highlightMarker = function(markerId) {
  mapRenderer.highlightMarker(markerId, [255, 255, 0, 255]);
  setTimeout(() => {
    mapRenderer.unhighlightMarker(markerId);
  }, 2000);
};

window.removeMarker = function(markerId) {
  mapRenderer.removeMarker(markerId);
  updateMarkerList();
};

// 初始化事件监听
function initEventListeners() {
  // 样式按钮切换
  document.querySelectorAll('.style-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStyle = btn.dataset.style;
    });
  });
  
  // 快速添加按钮
  document.getElementById('add-random-marker').addEventListener('click', addRandomMarker);
  document.getElementById('add-marker-group').addEventListener('click', addMarkerGroup);
  document.getElementById('clear-all-markers').addEventListener('click', () => {
    mapRenderer.clearMarkers();
    updateMarkerList();
    markerIdCounter = 0;
  });
  
  // 自定义标记按钮
  document.getElementById('add-custom-marker').addEventListener('click', addCustomMarker);
  
  // 批量操作按钮
  document.getElementById('toggle-animation').addEventListener('click', () => {
    animationEnabled = !animationEnabled;
    const markers = mapRenderer.getAllMarkers();
    markers.forEach(marker => {
      mapRenderer.updateMarker(marker.id, {
        animation: animationEnabled ? 'pulse' : 'none'
      });
    });
  });
  
  document.getElementById('toggle-visibility').addEventListener('click', () => {
    markersVisible = !markersVisible;
    const markers = mapRenderer.getAllMarkers();
    markers.forEach(marker => {
      mapRenderer.setMarkerVisibility(marker.id, markersVisible);
    });
  });
  
  document.getElementById('highlight-all').addEventListener('click', () => {
    const markers = mapRenderer.getAllMarkers();
    markers.forEach(marker => {
      mapRenderer.highlightMarker(marker.id, [255, 255, 0, 255]);
    });
  });
  
  document.getElementById('unhighlight-all').addEventListener('click', () => {
    const markers = mapRenderer.getAllMarkers();
    markers.forEach(marker => {
      mapRenderer.unhighlightMarker(marker.id);
    });
  });
  
  // 点击地图添加标记
  const mapContainer = document.getElementById('map-container');
  mapContainer.addEventListener('click', (e) => {
    if (e.target === mapContainer || e.target.tagName === 'CANVAS') {
      // 获取点击位置的经纬度（这需要更复杂的计算，这里简化处理）
      // 实际应用中需要使用 deck.gl 的坐标转换
      console.log('Map clicked, but coordinate conversion is complex in deck.gl');
    }
  });
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initEventListeners();
});