// 使用库中的 MapRenderer
import { MapRenderer } from '@ldesign/map-renderer';
// 导入广州数据作为示例
import guangzhouData from './maps/city/440100.json';

// 保存地图实例
let mapRenderer = null;
let currentColorMode = 'gradient';

// 颜色方案配置示例
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
  
  // 数据驱动模式（需要数据字段）
  data: {
    mode: 'data',
    dataField: 'adcode',  // 使用adcode作为数据
    colorStops: [
      { value: 0, color: [68, 138, 255] },     // 蓝色
      { value: 0.5, color: [255, 235, 59] },   // 黄色
      { value: 1, color: [255, 82, 82] }       // 红色
    ],
    opacity: 180
  }
};

// 初始化地图
function initMap() {
  const container = document.getElementById('map-container');
  
  if (!container) {
    console.error('Container not found!');
    return;
  }
  
  // 添加控制按钮
  createColorControls();
  
  try {
    // 创建地图渲染器
    mapRenderer = new MapRenderer(container, {
      mode: '2d',
      autoFit: true
    });
    
    // 使用渐变色方案渲染
    renderWithColorScheme(currentColorMode);
    
  } catch (error) {
    console.error('Error initializing map:', error);
  }
}

// 使用指定颜色方案渲染
function renderWithColorScheme(schemeName) {
  if (!mapRenderer) {
    console.error('MapRenderer not initialized');
    return;
  }
  
  console.log(`Switching to ${schemeName} color scheme...`);
  
  // 清除现有层
  mapRenderer.clearLayers();
  
  // 确保数据存在
  if (!guangzhouData || !guangzhouData.features) {
    console.error('GeoJSON data not available');
    return;
  }
  
  // 使用新的颜色方案渲染
  try {
    mapRenderer.renderGeoJSON(guangzhouData, {
      id: 'guangzhou-layer',
      showLabels: true,
      colorScheme: colorSchemes[schemeName]
    });
    
    currentColorMode = schemeName;
    console.log(`Successfully rendered with ${schemeName} color scheme`);
    
    // 更新按钮状态
    updateButtonStates(schemeName);
  } catch (error) {
    console.error('Error rendering with color scheme:', error);
  }
}

// 更新按钮状态
function updateButtonStates(activeSchemeName) {
  const buttons = document.querySelectorAll('.color-buttons button');
  buttons.forEach(button => {
    if (button.getAttribute('data-scheme') === activeSchemeName) {
      button.style.background = '#2196F3';
      button.style.color = 'white';
    } else {
      button.style.background = '#fff';
      button.style.color = '#333';
    }
  });
}

// 创建颜色控制按钮
function createColorControls() {
  const controls = document.createElement('div');
  controls.className = 'color-controls';
  controls.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.95);
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
  `;
  
  controls.innerHTML = `
    <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">颜色方案</h3>
    <div class="color-buttons" style="display: flex; flex-direction: column; gap: 8px;">
      <button data-scheme="single" onclick="renderWithColorScheme('single')" style="padding: 8px 12px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; transition: all 0.3s;">单色模式</button>
      <button data-scheme="gradient" onclick="renderWithColorScheme('gradient')" style="padding: 8px 12px; border: 1px solid #ddd; background: #2196F3; color: white; border-radius: 4px; cursor: pointer; transition: all 0.3s;">渐变色模式</button>
      <button data-scheme="category" onclick="renderWithColorScheme('category')" style="padding: 8px 12px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; transition: all 0.3s;">分类色模式</button>
      <button data-scheme="random" onclick="renderWithColorScheme('random')" style="padding: 8px 12px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; transition: all 0.3s;">随机色模式</button>
      <button data-scheme="data" onclick="renderWithColorScheme('data')" style="padding: 8px 12px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; transition: all 0.3s;">数据驱动模式</button>
    </div>
  `;
  
  document.body.appendChild(controls);
}

// 将函数暴露到全局
window.renderWithColorScheme = renderWithColorScheme;
window.updateButtonStates = updateButtonStates;

// DOM加载完成后初始化地图
document.addEventListener('DOMContentLoaded', initMap);

// 窗口大小变化时调整地图大小
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (mapRenderer) {
      console.log('Resizing map...');
      mapRenderer.resize();
    }
  }, 250);  // 防抖延迟
});
