// 使用库中的 MapRenderer
import { MapRenderer } from '@ldesign/map-renderer';
// 导入广州数据作为示例
import guangzhouData from './maps/city/440100.json';

console.log('Map Renderer v2.0 - 完整功能演示');
console.log('MapRenderer loaded:', MapRenderer);
console.log('Data loaded, features:', guangzhouData.features?.length);

// 全局状态
const state = {
  currentTab: 'colors',
  mapInstances: {},
  initialized: {},  // 跟踪哪些标签页已初始化
  colorScheme: 'single',
  selectionMode: 'none',
  showLabels: true,
  markerCount: 0,
  clusterCount: 0
};

// 配色方案配置
const colorSchemes = {
  single: {
    mode: 'single',
    color: [100, 149, 237, 180],
    name: '单色模式',
    description: '所有区域使用相同的矢车菊蓝色'
  },
  gradient: {
    mode: 'gradient',
    startColor: [66, 165, 245],
    endColor: [255, 152, 0],
    opacity: 180,
    name: '渐变色模式',
    description: '从蓝色平滑过渡到橙色'
  },
  category: {
    mode: 'category',
    categoryField: 'adcode',
    colors: [
      [26, 188, 156], [46, 204, 113], [52, 152, 219],
      [155, 89, 182], [52, 73, 94], [241, 196, 15],
      [230, 126, 34], [231, 76, 60], [149, 165, 166],
      [22, 160, 133], [243, 156, 18]
    ],
    opacity: 180,
    name: '分类色模式',
    description: '根据区域代码分配不同颜色'
  },
  random: {
    mode: 'random',
    opacity: 180,
    name: '随机色模式',
    description: '每个区域随机分配颜色'
  },
  data: {
    mode: 'data',
    dataField: 'adcode',
    colorStops: [
      { value: 0, color: [68, 138, 255] },
      { value: 0.5, color: [255, 235, 59] },
      { value: 1, color: [255, 82, 82] }
    ],
    opacity: 180,
    name: '数据驱动模式',
    description: '基于数据值映射颜色'
  },
  custom: {
    mode: 'custom',
    customFunction: (feature, index) => {
      const name = feature.properties?.name || '';
      const length = name.length;
      if (length <= 3) return [255, 107, 107, 180];
      else if (length <= 4) return [78, 205, 196, 180];
      else return [162, 155, 254, 180];
    },
    opacity: 180,
    name: '自定义函数模式',
    description: '根据区域名称长度决定颜色'
  }
};

// 工具函数：生成随机点
function generateRandomPoints(count, bounds) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const lng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
    const lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
    const weight = Math.random() * 100;
    points.push({ position: [lng, lat], weight });
  }
  return points;
}

// 工具函数：计算距离（Haversine公式）
function calculateDistance(point1, point2) {
  const R = 6371000;
  const lat1 = (point1[1] * Math.PI) / 180;
  const lat2 = (point2[1] * Math.PI) / 180;
  const deltaLat = ((point2[1] - point1[1]) * Math.PI) / 180;
  const deltaLng = ((point2[0] - point1[0]) * Math.PI) / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 工具函数：格式化距离
function formatDistance(meters) {
  if (meters < 1000) return `${meters.toFixed(2)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

// 工具函数：计算多边形面积
function calculatePolygonArea(polygon) {
  if (polygon.length < 3) return 0;
  
  const R = 6371000;
  const coords = [...polygon];
  if (coords[0][0] !== coords[coords.length - 1][0] || 
      coords[0][1] !== coords[coords.length - 1][1]) {
    coords.push(coords[0]);
  }

  let area = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const lng1 = (coords[i][0] * Math.PI) / 180;
    const lng2 = (coords[i + 1][0] * Math.PI) / 180;
    const lat1 = (coords[i][1] * Math.PI) / 180;
    const lat2 = (coords[i + 1][1] * Math.PI) / 180;
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  return Math.abs(area * R * R / 2);
}

// 工具函数：格式化面积
function formatArea(squareMeters) {
  if (squareMeters < 10000) return `${squareMeters.toFixed(2)} m²`;
  else if (squareMeters < 1000000) return `${(squareMeters / 10000).toFixed(2)} 公顷`;
  return `${(squareMeters / 1000000).toFixed(2)} km²`;
}

// 工具函数：更新信息提示
function updateInfo(tab, message, type = 'info') {
  const infoEl = document.getElementById(`${tab}-info`);
  if (infoEl) {
    infoEl.textContent = message;
    infoEl.className = `demo-info ${type}`;
  }
}

// 1. 初始化配色方案演示
function initColorsDemo() {
  if (state.initialized.colors) return;
  
  console.log('初始化配色方案演示...');
  
  const mapRenderer = new MapRenderer('#map-colors', {
    mode: '2d',
    autoFit: true,
    smoothZoom: true,
    showTooltip: false
  });

  state.mapInstances.colors = mapRenderer;
  state.initialized.colors = true;

  // 默认加载单色模式
  mapRenderer.renderGeoJSON(guangzhouData, {
    id: 'colors-layer',
    showLabels: true,
    colorScheme: colorSchemes.single,
    labelOptions: {
      getColor: 'auto',
      fontSize: 14
    }
  });

  updateInfo('color', `当前: ${colorSchemes.single.name} - ${colorSchemes.single.description}`);

  console.log('配色方案演示初始化完成');
}

// 2. 初始化区域选择演示
function initSelectionDemo() {
  if (state.initialized.selection) return;
  
  console.log('初始化区域选择演示...');
  
  const mapRenderer = new MapRenderer('#map-selection', {
    mode: '2d',
    autoFit: true,
    smoothZoom: true,
    showTooltip: false,
    selectionMode: 'none',
    selectionStyle: {
      strokeColor: [255, 215, 0, 255],
      strokeWidth: 4,
      highlightColor: [255, 215, 0, 100]
    },
    onSelect: (selectedFeatures) => {
      if (selectedFeatures.length === 0) {
        updateInfo('selection', '未选择任何区域');
      } else if (selectedFeatures.length === 1) {
        const name = selectedFeatures[0].properties?.name || '未知';
        const adcode = selectedFeatures[0].properties?.adcode || 'N/A';
        updateInfo('selection', `✓ 已选择: ${name} (${adcode})`, 'success');
      } else {
        const names = selectedFeatures.map(f => f.properties?.name || '未知').join('、');
        updateInfo('selection', `✓ 已选择 ${selectedFeatures.length} 个区域: ${names}`, 'success');
      }
    }
  });

  state.mapInstances.selection = mapRenderer;
  state.initialized.selection = true;

  mapRenderer.renderGeoJSON(guangzhouData, {
    id: 'selection-layer',
    showLabels: true,
    colorScheme: colorSchemes.gradient,
    labelOptions: {
      getColor: 'auto',
      fontSize: 14
    }
  });

  console.log('区域选择演示初始化完成');
}

// 3. 初始化标记点演示
function initMarkersDemo() {
  if (state.initialized.markers) return;
  
  console.log('初始化标记点演示...');
  
  const mapRenderer = new MapRenderer('#map-markers', {
    mode: '2d',
    autoFit: true,
    smoothZoom: true,
    showTooltip: false
  });

  state.mapInstances.markers = mapRenderer;
  state.initialized.markers = true;

  mapRenderer.renderGeoJSON(guangzhouData, {
    id: 'markers-base',
    showLabels: true,
    colorScheme: {
      mode: 'single',
      color: [240, 240, 240, 100]
    },
    labelOptions: {
      getColor: [150, 150, 150, 255],
      fontSize: 12
    }
  });

  console.log('标记点演示初始化完成');
}

// 4. 初始化热力图演示
function initHeatmapDemo() {
  if (state.initialized.heatmap) return;
  
  console.log('初始化热力图演示...');
  
  const mapRenderer = new MapRenderer('#map-heatmap', {
    mode: '2d',
    autoFit: true,
    smoothZoom: true,
    showTooltip: false
  });

  state.mapInstances.heatmap = mapRenderer;
  state.initialized.heatmap = true;

  mapRenderer.renderGeoJSON(guangzhouData, {
    id: 'heatmap-base',
    showLabels: false,
    colorScheme: {
      mode: 'single',
      color: [240, 240, 240, 80]
    }
  });

  console.log('热力图演示初始化完成');
}

// 5. 初始化聚类演示
function initClusterDemo() {
  if (state.initialized.cluster) return;
  
  console.log('初始化聚类演示...');
  
  const mapRenderer = new MapRenderer('#map-cluster', {
    mode: '2d',
    autoFit: true,
    smoothZoom: true,
    showTooltip: false
  });

  state.mapInstances.cluster = mapRenderer;
  state.initialized.cluster = true;

  mapRenderer.renderGeoJSON(guangzhouData, {
    id: 'cluster-base',
    showLabels: false,
    colorScheme: {
      mode: 'single',
      color: [220, 230, 245, 100]
    }
  });

  console.log('聚类演示初始化完成');
}

// 6. 初始化测量工具演示
function initMeasurementDemo() {
  if (state.initialized.measurement) return;
  
  console.log('初始化测量工具演示...');
  
  const mapRenderer = new MapRenderer('#map-measurement', {
    mode: '2d',
    autoFit: true,
    smoothZoom: true,
    showTooltip: false
  });

  state.mapInstances.measurement = mapRenderer;
  state.initialized.measurement = true;

  mapRenderer.renderGeoJSON(guangzhouData, {
    id: 'measurement-base',
    showLabels: true,
    colorScheme: colorSchemes.category,
    labelOptions: {
      getColor: 'auto',
      fontSize: 14
    }
  });

  console.log('测量工具演示初始化完成');
}

// 7. 初始化地图导出演示
function initExportDemo() {
  if (state.initialized.export) return;
  
  console.log('初始化地图导出演示...');
  
  const mapRenderer = new MapRenderer('#map-export', {
    mode: '2d',
    autoFit: true,
    smoothZoom: true,
    showTooltip: false
  });

  state.mapInstances.export = mapRenderer;
  state.initialized.export = true;

  mapRenderer.renderGeoJSON(guangzhouData, {
    id: 'export-base',
    showLabels: true,
    colorScheme: colorSchemes.data,
    labelOptions: {
      getColor: 'auto',
      fontSize: 14
    }
  });

  // 添加一些标记点
  const landmarks = [
    { name: '广州塔', position: [113.3241, 23.1063] },
    { name: '珠江新城', position: [113.3210, 23.1188] },
    { name: '白云山', position: [113.3020, 23.1756] }
  ];

  landmarks.forEach(landmark => {
    mapRenderer.addMarker({
      position: landmark.position,
      style: 'star',
      size: 15,
      color: [255, 215, 0, 255],
      label: {
        text: landmark.name,
        fontSize: 14,
        color: [255, 255, 255, 255],
        backgroundColor: [33, 33, 33, 230],
        visible: true
      }
    });
  });

  console.log('地图导出演示初始化完成');
}

// 标签页切换和延迟初始化
function initTabSwitching() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.demo-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.tab;
      
      // 更新按钮状态
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // 更新内容显示
      tabContents.forEach(content => content.classList.remove('active'));
      const targetContent = document.getElementById(`tab-${tabName}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }

      state.currentTab = tabName;
      console.log('切换到标签页:', tabName);

      // 延迟初始化对应的演示
      setTimeout(() => {
        initDemoByTab(tabName);
        
        // 调整地图尺寸
        const mapInstance = state.mapInstances[tabName];
        if (mapInstance && mapInstance.resize) {
          mapInstance.resize();
        }
      }, 100);
    });
  });
}

// 根据标签页名称初始化对应的演示
function initDemoByTab(tabName) {
  switch (tabName) {
    case 'colors':
      initColorsDemo();
      break;
    case 'selection':
      initSelectionDemo();
      break;
    case 'markers':
      initMarkersDemo();
      break;
    case 'heatmap':
      initHeatmapDemo();
      break;
    case 'cluster':
      initClusterDemo();
      break;
    case 'measurement':
      initMeasurementDemo();
      break;
    case 'export':
      initExportDemo();
      break;
  }
}

// 设置事件监听器
function setupEventListeners() {
  // 配色方案事件
  const applyColorBtn = document.getElementById('apply-color-scheme');
  if (applyColorBtn) {
    applyColorBtn.addEventListener('click', () => {
      const mapRenderer = state.mapInstances.colors;
      if (!mapRenderer) return;

      const selectedScheme = document.getElementById('color-scheme-select').value;
      state.colorScheme = selectedScheme;
      
      mapRenderer.clearLayers();
      mapRenderer.renderGeoJSON(guangzhouData, {
        id: 'colors-layer',
        showLabels: state.showLabels,
        colorScheme: colorSchemes[selectedScheme],
        labelOptions: {
          getColor: 'auto',
          fontSize: 14
        }
      });

      const scheme = colorSchemes[selectedScheme];
      updateInfo('color', `✓ 已应用: ${scheme.name} - ${scheme.description}`, 'success');
    });
  }

  const toggleLabelsBtn = document.getElementById('toggle-labels');
  if (toggleLabelsBtn) {
    toggleLabelsBtn.addEventListener('click', () => {
      const mapRenderer = state.mapInstances.colors;
      if (!mapRenderer) return;

      state.showLabels = !state.showLabels;
      mapRenderer.toggleLabels('colors-layer', state.showLabels);
      updateInfo('color', `标签已${state.showLabels ? '显示' : '隐藏'}`, 'success');
    });
  }

  // 区域选择事件
  const applySelectionBtn = document.getElementById('apply-selection-mode');
  if (applySelectionBtn) {
    applySelectionBtn.addEventListener('click', () => {
      const mapRenderer = state.mapInstances.selection;
      if (!mapRenderer) return;

      const mode = document.getElementById('selection-mode-select').value;
      state.selectionMode = mode;
      mapRenderer.setSelectionMode(mode);
      
      const modeNames = { none: '禁用', single: '单选', multiple: '多选' };
      updateInfo('selection', `✓ 已切换到${modeNames[mode]}模式`, 'success');
    });
  }

  const clearSelectionBtn = document.getElementById('clear-selection');
  if (clearSelectionBtn) {
    clearSelectionBtn.addEventListener('click', () => {
      const mapRenderer = state.mapInstances.selection;
      if (!mapRenderer) return;

      mapRenderer.clearSelection();
      updateInfo('selection', '✓ 已清除所有选择', 'success');
    });
  }

  // 标记点事件
  const addLandmarksBtn = document.getElementById('add-landmarks');
  if (addLandmarksBtn) {
    addLandmarksBtn.addEventListener('click', () => {
      const mapRenderer = state.mapInstances.markers;
      if (!mapRenderer) return;

      const landmarks = [
        { name: '广州塔', position: [113.3241, 23.1063], color: [255, 59, 48, 255] },
        { name: '白云山', position: [113.3020, 23.1756], color: [52, 199, 89, 255] },
        { name: '珠江新城', position: [113.3210, 23.1188], color: [0, 122, 255, 255] },
        { name: '陈家祠', position: [113.2506, 23.1253], color: [175, 82, 222, 255] },
        { name: '越秀公园', position: [113.2668, 23.1388], color: [255, 204, 0, 255] }
      ];

      landmarks.forEach(landmark => {
        mapRenderer.addMarker({
          position: landmark.position,
          style: 'star',
          size: 15,
          color: landmark.color,
          label: {
            text: landmark.name,
            fontSize: 14,
            color: [255, 255, 255, 255],
            backgroundColor: [33, 33, 33, 230],
            backgroundPadding: [6, 3],
            visible: true,
            fontWeight: 'bold'
          }
        });
      });

      state.markerCount += landmarks.length;
      updateInfo('marker', `✓ 已添加 ${landmarks.length} 个地标，总计 ${state.markerCount} 个标记`, 'success');
    });
  }

  const addRandomMarkersBtn = document.getElementById('add-random-markers');
  if (addRandomMarkersBtn) {
    addRandomMarkersBtn.addEventListener('click', () => {
      const mapRenderer = state.mapInstances.markers;
      if (!mapRenderer) return;

      const count = 10;
      const styles = ['circle', 'square', 'triangle', 'diamond'];
      const colors = [
        [255, 87, 34, 255], [33, 150, 243, 255], [76, 175, 80, 255],
        [255, 193, 7, 255], [156, 39, 176, 255]
      ];

      for (let i = 0; i < count; i++) {
        const lng = 113.0 + Math.random() * 0.7;
        const lat = 22.7 + Math.random() * 0.9;
        
        mapRenderer.addMarker({
          position: [lng, lat],
          style: styles[Math.floor(Math.random() * styles.length)],
          size: 10 + Math.random() * 10,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      state.markerCount += count;
      updateInfo('marker', `✓ 已添加 ${count} 个随机标记，总计 ${state.markerCount} 个标记`, 'success');
    });
  }

  const addRippleMarkersBtn = document.getElementById('add-ripple-markers');
  if (addRippleMarkersBtn) {
    addRippleMarkersBtn.addEventListener('click', () => {
      const mapRenderer = state.mapInstances.markers;
      if (!mapRenderer) return;

      const rippleMarkers = [
        { position: [113.28, 23.13], color: [255, 0, 0] },
        { position: [113.35, 23.18], color: [0, 255, 0] },
        { position: [113.42, 23.12], color: [0, 0, 255] }
      ];

      rippleMarkers.forEach(marker => {
        mapRenderer.addMarker({
          position: marker.position,
          style: 'circle',
          size: 15,
          color: [...marker.color, 255],
          animation: 'ripple'
        });
      });

      state.markerCount += rippleMarkers.length;
      updateInfo('marker', `✓ 已添加 ${rippleMarkers.length} 个水波纹标记，总计 ${state.markerCount} 个标记`, 'success');
    });
  }

  let markersVisible = true;
  const toggleMarkerBtn = document.getElementById('toggle-marker-visibility');
  if (toggleMarkerBtn) {
    toggleMarkerBtn.addEventListener('click', () => {
      const mapRenderer = state.mapInstances.markers;
      if (!mapRenderer) return;

      const markers = mapRenderer.getAllMarkers();
      markers.forEach(marker => {
        mapRenderer.setMarkerVisibility(marker.id, !markersVisible);
      });
      markersVisible = !markersVisible;
      updateInfo('marker', `✓ 标记已${markersVisible ? '显示' : '隐藏'}`, 'success');
    });
  }

  const clearMarkersBtn = document.getElementById('clear-markers');
  if (clearMarkersBtn) {
    clearMarkersBtn.addEventListener('click', () => {
      const mapRenderer = state.mapInstances.markers;
      if (!mapRenderer) return;

      mapRenderer.clearMarkers();
      state.markerCount = 0;
      markersVisible = true;
      updateInfo('marker', '✓ 已清除所有标记', 'success');
    });
  }

  // 热力图事件
  const heatmap500Btn = document.getElementById('heatmap-add-500');
  if (heatmap500Btn) {
    heatmap500Btn.addEventListener('click', () => addHeatPoints(500));
  }

  const heatmap1000Btn = document.getElementById('heatmap-add-1000');
  if (heatmap1000Btn) {
    heatmap1000Btn.addEventListener('click', () => addHeatPoints(1000));
  }

  const heatmapClearBtn = document.getElementById('heatmap-clear');
  if (heatmapClearBtn) {
    heatmapClearBtn.addEventListener('click', () => {
      const mapRenderer = state.mapInstances.heatmap;
      if (!mapRenderer) return;

      mapRenderer.clearMarkers();
      updateInfo('heatmap', '✓ 已清除热力图', 'success');
    });
  }

  // 聚类事件
  const cluster1000Btn = document.getElementById('cluster-add-1000');
  if (cluster1000Btn) {
    cluster1000Btn.addEventListener('click', () => addClusterPoints(1000));
  }

  const cluster5000Btn = document.getElementById('cluster-add-5000');
  if (cluster5000Btn) {
    cluster5000Btn.addEventListener('click', () => addClusterPoints(5000));
  }

  const clusterClearBtn = document.getElementById('cluster-clear');
  if (clusterClearBtn) {
    clusterClearBtn.addEventListener('click', () => {
      const mapRenderer = state.mapInstances.cluster;
      if (!mapRenderer) return;

      mapRenderer.clearMarkers();
      state.clusterCount = 0;
      updateInfo('cluster', '✓ 已清除所有聚类点', 'success');
    });
  }

  // 测量工具事件
  const measureDistanceBtn = document.getElementById('measure-test-distance');
  if (measureDistanceBtn) {
    measureDistanceBtn.addEventListener('click', () => testDistance());
  }

  const measureAreaBtn = document.getElementById('measure-test-area');
  if (measureAreaBtn) {
    measureAreaBtn.addEventListener('click', () => testArea());
  }

  // 导出事件
  const exportInfoBtn = document.getElementById('export-info-btn');
  if (exportInfoBtn) {
    exportInfoBtn.addEventListener('click', () => {
      updateInfo('export', '💡 地图导出功能需要 ExportUtil 模块，可导出为 PNG/JPEG/WebP 格式，支持高分辨率导出', 'warning');
    });
  }

  const exportDemoBtn = document.getElementById('export-demo');
  if (exportDemoBtn) {
    exportDemoBtn.addEventListener('click', () => {
      updateInfo('export', '✓ 模拟导出成功！实际使用: await ExportUtil.downloadAsImage(mapRenderer.getDeck(), { format: "png", scale: 2 })', 'success');
    });
  }
}

// 添加热点函数
function addHeatPoints(count) {
  const mapRenderer = state.mapInstances.heatmap;
  if (!mapRenderer) return;

  const bounds = { minLng: 113.0, maxLng: 113.7, minLat: 22.7, maxLat: 23.6 };
  const points = generateRandomPoints(count, bounds);

  points.forEach((point, index) => {
    const intensity = point.weight / 100;
    const color = [
      Math.floor(255 * intensity),
      Math.floor(100 * (1 - intensity)),
      Math.floor(50 * (1 - intensity)),
      200
    ];

    mapRenderer.addMarker({
      id: `heat-${Date.now()}-${index}`,
      position: point.position,
      style: 'circle',
      size: 3 + intensity * 8,
      color,
      opacity: 0.7
    });
  });

  updateInfo('heatmap', `✓ 已添加 ${count} 个热点（使用彩色标记模拟）`, 'success');
}

// 添加聚类点函数
function addClusterPoints(count) {
  const mapRenderer = state.mapInstances.cluster;
  if (!mapRenderer) return;

  const bounds = { minLng: 113.0, maxLng: 113.7, minLat: 22.7, maxLat: 23.6 };
  const points = generateRandomPoints(count, bounds);

  // 简单网格聚类
  const gridSize = 0.08;
  const grid = new Map();

  points.forEach(point => {
    const gridX = Math.floor(point.position[0] / gridSize);
    const gridY = Math.floor(point.position[1] / gridSize);
    const key = `${gridX},${gridY}`;
    
    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key).push(point);
  });

  // 渲染聚类
  let clusterIndex = 0;
  grid.forEach(gridPoints => {
    const avgLng = gridPoints.reduce((sum, p) => sum + p.position[0], 0) / gridPoints.length;
    const avgLat = gridPoints.reduce((sum, p) => sum + p.position[1], 0) / gridPoints.length;
    const pointCount = gridPoints.length;

    if (pointCount > 1) {
      mapRenderer.addMarker({
        id: `cluster-${Date.now()}-${clusterIndex++}`,
        position: [avgLng, avgLat],
        style: 'circle',
        size: Math.min(Math.sqrt(pointCount) * 4, 25),
        color: [0, 140, 255, 220],
        label: {
          text: String(pointCount),
          fontSize: 13,
          color: [255, 255, 255, 255],
          visible: true,
          fontWeight: 'bold'
        }
      });
    } else {
      mapRenderer.addMarker({
        id: `point-${Date.now()}-${clusterIndex++}`,
        position: gridPoints[0].position,
        style: 'circle',
        size: 4,
        color: [255, 100, 0, 220]
      });
    }
  });

  state.clusterCount += count;
  updateInfo('cluster', `✓ 已添加 ${count} 个点，聚类成 ${grid.size} 组，总计 ${state.clusterCount} 个点`, 'success');
}

// 测试距离函数
function testDistance() {
  const mapRenderer = state.mapInstances.measurement;
  if (!mapRenderer) return;

  const point1 = [113.28, 23.13];
  const point2 = [113.50, 23.25];
  
  const distance = calculateDistance(point1, point2);
  const formatted = formatDistance(distance);

  mapRenderer.clearMarkers();
  mapRenderer.addMarker({
    position: point1,
    style: 'star',
    size: 15,
    color: [255, 0, 0, 255],
    label: { text: '起点', fontSize: 13, color: [255, 255, 255, 255], backgroundColor: [255, 0, 0, 230], visible: true }
  });
  mapRenderer.addMarker({
    position: point2,
    style: 'star',
    size: 15,
    color: [0, 255, 0, 255],
    label: { text: '终点', fontSize: 13, color: [255, 255, 255, 255], backgroundColor: [0, 255, 0, 230], visible: true }
  });

  updateInfo('measurement', `✓ 距离测量: ${formatted} (使用 Haversine 公式计算)`, 'success');
}

// 测试面积函数
function testArea() {
  const mapRenderer = state.mapInstances.measurement;
  if (!mapRenderer) return;

  const polygon = [
    [113.28, 23.13],
    [113.32, 23.13],
    [113.32, 23.16],
    [113.28, 23.16]
  ];

  const area = calculatePolygonArea(polygon);
  const formatted = formatArea(area);

  mapRenderer.clearMarkers();
  polygon.forEach((point, index) => {
    mapRenderer.addMarker({
      position: point,
      style: 'diamond',
      size: 12,
      color: [0, 122, 255, 255],
      label: { text: `P${index + 1}`, fontSize: 12, color: [255, 255, 255, 255], backgroundColor: [0, 122, 255, 230], visible: true }
    });
  });

  updateInfo('measurement', `✓ 面积测量: ${formatted} (使用球面三角形公式计算)`, 'success');
}

// 初始化所有功能
function initAllDemos() {
  console.log('=== 开始初始化所有演示 ===');
  
  try {
    // 初始化标签页切换
    initTabSwitching();
    
    // 设置所有事件监听器
    setupEventListeners();

    // 只初始化第一个标签页（配色方案）
    initColorsDemo();

    console.log('=== 所有演示初始化完成 ===');
  } catch (error) {
    console.error('初始化失败:', error);
  }
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 加载完成，开始初始化...');
  initAllDemos();
});

// 导出全局状态供调试使用
window.mapRendererDemo = {
  state,
  mapInstances: state.mapInstances,
  colorSchemes,
  initDemoByTab
};

console.log('main.js 加载完成');
