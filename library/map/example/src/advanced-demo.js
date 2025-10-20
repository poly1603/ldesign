/**
 * 高级功能演示
 * 展示地图插件的所有高级特性
 */

import {
  MapRenderer,
  AnimationController,
  Easings,
  animate,
  LayerManager,
  GeometryUtils,
  DataTransformer,
  PerformanceMonitor,
  MemoryManager,
  ClusterManager,
  HeatmapRenderer
} from '@ldesign/map-renderer';

console.log('高级功能演示加载中...');

// 全局状态
const state = {
  mapRenderer: null,
  animationController: new AnimationController(),
  layerManager: null,
  performanceMonitor: null,
  memoryManager: new MemoryManager({
    maxMemoryMB: 500,
    autoCleanup: true,
    onMemoryWarning: (usage) => {
      console.warn(`内存警告: ${usage.toFixed(2)}%`);
    }
  })
};

/**
 * 初始化地图
 */
export async function initAdvancedDemo() {
  console.log('初始化高级演示...');

  // 创建地图渲染器
  const mapRenderer = new MapRenderer('#advanced-map', {
    mode: '2d',
    autoFit: true,
    smoothZoom: true,
    showTooltip: true,
    selectionMode: 'single',
    selectionStyle: {
      strokeColor: [255, 215, 0, 255],
      strokeWidth: 4,
      highlightColor: [255, 215, 0, 100]
    },
    onSelect: (selectedFeatures) => {
      if (selectedFeatures.length > 0) {
        const feature = selectedFeatures[0];
        console.log('已选择区域:', feature.properties);
        
        // 展示几何计算
        if (feature.geometry.type === 'Polygon') {
          const coords = feature.geometry.coordinates[0];
          const area = GeometryUtils.polygonArea(coords);
          const centroid = GeometryUtils.polygonCentroid(coords);
          
          console.log('区域面积:', GeometryUtils.formatArea(area));
          console.log('区域质心:', centroid);
        }
      }
    }
  });

  state.mapRenderer = mapRenderer;

  // 创建图层管理器
  state.layerManager = new LayerManager(() => {
    console.log('图层已更新');
    updateLayerList();
  });

  // 创建性能监控器
  state.performanceMonitor = new PerformanceMonitor(
    document.getElementById('advanced-map'),
    {
      position: 'top-left',
      showFPS: true,
      showMemory: true,
      showRenderTime: true,
      showLayerCount: true
    }
  );

  // 启动内存监控
  state.memoryManager.startMonitoring();

  // 加载示例数据
  await loadSampleData();

  console.log('高级演示初始化完成');
}

/**
 * 加载示例数据
 */
async function loadSampleData() {
  try {
    // 加载广东省地图数据
    const response = await fetch('./maps/city/440100.json');
    const geoJSON = await response.json();

    // 使用数据转换器添加额外属性
    const enrichedGeoJSON = DataTransformer.addProperty(
      geoJSON,
      'area',
      (feature) => {
        if (feature.geometry.type === 'Polygon') {
          const area = GeometryUtils.polygonArea(feature.geometry.coordinates[0]);
          return area;
        }
        return 0;
      }
    );

    // 渲染地图
    state.mapRenderer.renderGeoJSON(enrichedGeoJSON, {
      id: 'base-layer',
      showLabels: true,
      colorScheme: {
        mode: 'gradient',
        startColor: [66, 165, 245],
        endColor: [255, 152, 0],
        opacity: 180
      },
      labelOptions: {
        getColor: 'auto',
        fontSize: 14
      }
    });

    console.log('数据加载成功');
  } catch (error) {
    console.error('加载数据失败:', error);
  }
}

/**
 * 演示动画功能
 */
export function demonstrateAnimations() {
  console.log('开始动画演示...');

  // 创建旋转动画
  const rotationAnim = state.animationController.createAnimation('rotation', {
    duration: 5000,
    loop: true,
    easing: Easings.linear,
    autoStart: true,
    onUpdate: (progress) => {
      const bearing = progress * 360;
      state.mapRenderer.setViewState({ bearing });
    }
  });

  console.log('旋转动画已启动, ID:', rotationAnim);

  // 3秒后停止
  setTimeout(() => {
    state.animationController.stopAnimation('rotation');
    state.mapRenderer.setViewState({ bearing: 0, transitionDuration: 1000 });
    console.log('旋转动画已停止');
  }, 3000);
}

/**
 * 演示动画缓动函数
 */
export function demonstrateEasings() {
  console.log('演示缓动函数...');

  const easingTypes = [
    'linear',
    'easeInQuad',
    'easeOutQuad',
    'easeInOutCubic',
    'easeInElastic',
    'easeOutBounce'
  ];

  let currentIndex = 0;

  const showNextEasing = () => {
    if (currentIndex >= easingTypes.length) {
      console.log('所有缓动函数演示完成');
      return;
    }

    const easingName = easingTypes[currentIndex];
    console.log(`演示缓动: ${easingName}`);

    animate({
      from: 6,
      to: 10,
      duration: 2000,
      easing: Easings[easingName],
      onUpdate: (zoom) => {
        state.mapRenderer.setViewState({ zoom, transitionDuration: 0 });
      }
    }).then(() => {
      currentIndex++;
      setTimeout(showNextEasing, 500);
    });
  };

  showNextEasing();
}

/**
 * 演示几何工具
 */
export function demonstrateGeometry() {
  console.log('演示几何工具...');

  // 测试点
  const point1 = [113.28, 23.13];
  const point2 = [113.50, 23.25];

  // 计算距离
  const distance = GeometryUtils.haversineDistance(
    point1[0],
    point1[1],
    point2[0],
    point2[1]
  );
  console.log('两点距离:', GeometryUtils.formatDistance(distance));

  // 计算方位角
  const bearing = GeometryUtils.bearing(point1[0], point1[1], point2[0], point2[1]);
  console.log('方位角:', bearing.toFixed(2), '度');

  // 计算目标点
  const destination = GeometryUtils.destination(point1[0], point1[1], 10000, 45);
  console.log('目标点:', destination);

  // 在地图上显示
  state.mapRenderer.addMarker({
    position: point1,
    style: 'star',
    size: 15,
    color: [255, 0, 0, 255],
    label: {
      text: '起点',
      fontSize: 14,
      color: [255, 255, 255, 255],
      backgroundColor: [255, 0, 0, 230],
      visible: true
    }
  });

  state.mapRenderer.addMarker({
    position: point2,
    style: 'star',
    size: 15,
    color: [0, 255, 0, 255],
          label: {
      text: '终点',
            fontSize: 14,
            color: [255, 255, 255, 255],
      backgroundColor: [0, 255, 0, 230],
      visible: true
    }
  });

  state.mapRenderer.addMarker({
    position: destination,
    style: 'diamond',
    size: 12,
    color: [0, 0, 255, 255],
    label: {
      text: '目标点',
      fontSize: 12,
      color: [255, 255, 255, 255],
      backgroundColor: [0, 0, 255, 230],
      visible: true
    }
  });

  // 创建缓冲区
  const buffer = GeometryUtils.createBuffer(point1, 5000, 32);
  console.log('创建缓冲区:', buffer.length, '个点');
}

/**
 * 演示数据转换
 */
export function demonstrateDataTransform() {
  console.log('演示数据转换...');

  // CSV 转 GeoJSON
  const csvData = `
name,longitude,latitude,value
广州塔,113.3241,23.1063,100
白云山,113.3020,23.1756,85
珠江新城,113.3210,23.1188,95
  `.trim();

  const geoJSON = DataTransformer.csvToGeoJSON(csvData, 'longitude', 'latitude');
  console.log('CSV转GeoJSON:', geoJSON);

  // 添加属性
  const enriched = DataTransformer.addProperty(geoJSON, 'category', 'landmark');
  console.log('添加属性后:', enriched);

  // 计算统计
  const stats = DataTransformer.calculateStatistics(enriched, 'value');
  console.log('统计数据:', stats);

  // 分组
  const grouped = DataTransformer.groupGeoJSONByProperty(enriched, 'category');
  console.log('分组结果:', grouped);

  // GeoJSON 转 CSV
  const csv = DataTransformer.geoJSONToCSV(geoJSON);
  console.log('GeoJSON转CSV:\n', csv);
}

/**
 * 演示图层管理
 */
export function demonstrateLayerManagement() {
  console.log('演示图层管理...');

  const layerManager = state.layerManager;

  // 创建分组
  layerManager.createGroup('boundaries', '行政边界');
  layerManager.createGroup('markers', '标记点');

  // 获取所有图层
  const layers = layerManager.getAllLayers();
  console.log('当前图层数:', layers.length);

  // 图层操作
  if (layers.length > 0) {
    const layer = layers[0];
    console.log('图层信息:', layer);

    // 设置透明度
    layerManager.setLayerOpacity(layer.id, 0.5);
    console.log('已设置图层透明度: 50%');

    // 切换可见性
    layerManager.toggleLayerVisibility(layer.id);
    console.log('已切换图层可见性');

    // 恢复
    setTimeout(() => {
      layerManager.setLayerOpacity(layer.id, 1.0);
      layerManager.toggleLayerVisibility(layer.id);
      console.log('已恢复图层状态');
    }, 2000);
  }

  // 导出配置
  const config = layerManager.exportConfig();
  console.log('图层配置:', config);
}

/**
 * 演示性能监控
 */
export function demonstratePerformance() {
  console.log('演示性能监控...');

  const monitor = state.performanceMonitor;

  if (monitor) {
    // 获取统计信息
    const stats = monitor.getStats();
    console.log('性能统计:', stats);

    // 获取FPS统计
    console.log('平均FPS:', monitor.getAverageFPS());
    console.log('最小FPS:', monitor.getMinFPS());
    console.log('最大FPS:', monitor.getMaxFPS());

    // 切换显示
    setTimeout(() => {
      monitor.toggle();
      console.log('切换性能监控面板显示');
    }, 2000);

  setTimeout(() => {
      monitor.toggle();
    }, 4000);
  }
}

/**
 * 演示内存管理
 */
export function demonstrateMemoryManagement() {
  console.log('演示内存管理...');

  const memoryManager = state.memoryManager;

  // 获取内存使用情况
  const usage = memoryManager.getMemoryUsage();
  console.log('内存使用:', usage);

  // 获取统计
  const stats = memoryManager.getStats();
  console.log('内存统计:', stats);

  // 检测内存泄漏
  const leak = memoryManager.detectMemoryLeak();
  console.log('检测到内存泄漏:', leak);

  // 获取报告
  const report = memoryManager.getReport();
  console.log('内存报告:\n', report);

  // 注册清理回调
  const unregister = memoryManager.registerCleanupCallback(() => {
    console.log('执行内存清理...');
    state.mapRenderer?.clearMarkers();
  });

  // 3秒后取消注册
  setTimeout(() => {
    unregister();
    console.log('清理回调已取消注册');
  }, 3000);
}

/**
 * 演示聚类功能
 */
export async function demonstrateClustering() {
  console.log('演示聚类功能...');

  // 生成随机点
  const points = [];
  for (let i = 0; i < 1000; i++) {
    points.push({
      position: [
        113.0 + Math.random() * 0.7,
        22.7 + Math.random() * 0.9
      ],
      weight: Math.random() * 100,
      id: `point-${i}`
    });
  }

  console.log('生成了', points.length, '个点');

  // 使用聚类管理器
  const clusterManager = new ClusterManager({
    minZoom: 0,
    maxZoom: 20,
    radius: 40,
    extent: 512
  });

  // 添加点
  points.forEach(point => {
    clusterManager.addPoint({
      coordinates: point.position,
      properties: {
        id: point.id,
        weight: point.weight
      }
    });
  });

  // 获取当前级别的聚类
  const clusters = clusterManager.getClusters({ zoom: 8 });
  console.log('聚类结果:', clusters.length, '个聚类');

  // 渲染聚类
  clusters.forEach((cluster, index) => {
    const size = cluster.isCluster
      ? Math.min(Math.sqrt(cluster.pointCount) * 4, 25)
      : 4;

    state.mapRenderer.addMarker({
      position: cluster.coordinates,
      style: 'circle',
      size,
      color: cluster.isCluster ? [0, 140, 255, 220] : [255, 100, 0, 220],
      label: cluster.isCluster
        ? {
            text: String(cluster.pointCount),
            fontSize: 13,
            color: [255, 255, 255, 255],
            visible: true,
            fontWeight: 'bold'
          }
        : undefined
    });
  });

  console.log('聚类渲染完成');
}

/**
 * 更新图层列表
 */
function updateLayerList() {
  if (!state.layerManager) return;

  const layers = state.layerManager.getAllLayers();
  console.log('图层列表更新:', layers.length, '个图层');
}

/**
 * 清理演示
 */
export function cleanup() {
  console.log('清理演示资源...');

  state.animationController?.destroy();
  state.performanceMonitor?.destroy();
  state.memoryManager?.destroy();
  state.layerManager?.destroy();
  state.mapRenderer?.destroy();

  console.log('清理完成');
}

// 导出状态供调试使用
window.advancedDemo = {
  state,
  demonstrateAnimations,
  demonstrateEasings,
  demonstrateGeometry,
  demonstrateDataTransform,
  demonstrateLayerManagement,
  demonstratePerformance,
  demonstrateMemoryManagement,
  demonstrateClustering,
  cleanup
};

console.log('高级演示模块加载完成');
console.log('可用函数:');
console.log('- window.advancedDemo.demonstrateAnimations()');
console.log('- window.advancedDemo.demonstrateEasings()');
console.log('- window.advancedDemo.demonstrateGeometry()');
console.log('- window.advancedDemo.demonstrateDataTransform()');
console.log('- window.advancedDemo.demonstrateLayerManagement()');
console.log('- window.advancedDemo.demonstratePerformance()');
console.log('- window.advancedDemo.demonstrateMemoryManagement()');
console.log('- window.advancedDemo.demonstrateClustering()');
