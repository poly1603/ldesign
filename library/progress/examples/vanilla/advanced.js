import {
  ImageProgress,
  CustomShapeProgress,
  GaugeProgress,
  RingProgress,
  PolygonProgress,
  BatteryProgress,
  HeartProgress,
} from '@ldesign/progress-core';
import '@ldesign/progress-core/src/styles/index.css';

// 存储所有进度条实例
const progressInstances = [];

// 示例图片 URL（使用占位图）
const sampleImage = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop';

// ====== 图片进度条 ======
const imageHorizontal = new ImageProgress('#image-horizontal', {
  value: 50,
  imageSrc: sampleImage,
  imageWidth: 180,
  imageHeight: 180,
  fillDirection: 'horizontal',
  showText: true,
});
progressInstances.push(imageHorizontal);

const imageVertical = new ImageProgress('#image-vertical', {
  value: 50,
  imageSrc: sampleImage,
  imageWidth: 180,
  imageHeight: 180,
  fillDirection: 'vertical',
  showText: true,
});
progressInstances.push(imageVertical);

const imageRadial = new ImageProgress('#image-radial', {
  value: 50,
  imageSrc: sampleImage,
  imageWidth: 180,
  imageHeight: 180,
  fillDirection: 'radial',
  showText: true,
});
progressInstances.push(imageRadial);

// ====== 自定义形状进度条 ======

// 星形路径生成函数
function createStarPath(width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 10;
  const innerRadius = outerRadius * 0.4;
  const points = [];
  
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  points.push('Z');
  return points.join(' ');
}

const shapeStar = new CustomShapeProgress('#shape-star', {
  value: 50,
  shapePath: createStarPath,
  shapeWidth: 150,
  shapeHeight: 150,
  color: ['#ffd700', '#ff8c00'],
  strokeWidth: 4,
  showText: true,
});
progressInstances.push(shapeStar);

// 波浪线路径
const waveLinePath = 'M 20,100 Q 50,50 80,100 T 180,100';
const shapeWaveLine = new CustomShapeProgress('#shape-wave-line', {
  value: 50,
  shapePath: waveLinePath,
  shapeWidth: 200,
  shapeHeight: 150,
  color: '#409eff',
  strokeWidth: 6,
  showText: false,
});
progressInstances.push(shapeWaveLine);

// 无限符号路径
const infinityPath = 'M 60,75 C 60,45 20,45 20,75 C 20,105 60,105 60,75 C 60,45 100,45 100,75 C 100,105 140,105 140,75 C 140,45 100,45 100,75';
const shapeInfinity = new CustomShapeProgress('#shape-infinity', {
  value: 50,
  shapePath: infinityPath,
  shapeWidth: 160,
  shapeHeight: 120,
  color: ['#667eea', '#764ba2'],
  strokeWidth: 5,
  showText: false,
});
progressInstances.push(shapeInfinity);

// ====== 高级仪表盘 ======
const gaugeNumbers = new GaugeProgress('#gauge-numbers', {
  value: 65,
  showNumbers: true,
  showPointer: true,
  showScale: true,
  tickCount: 10,
  showMinorTicks: true,
  needleType: 'line',
  radius: 70,
});
progressInstances.push(gaugeNumbers);

const gaugeArrow = new GaugeProgress('#gauge-arrow', {
  value: 65,
  showNumbers: false,
  showPointer: true,
  needleType: 'arrow',
  radius: 70,
  colorRanges: [
    { min: 0, max: 30, color: '#67c23a' },
    { min: 30, max: 70, color: '#e6a23c' },
    { min: 70, max: 100, color: '#f56c6c' },
  ],
});
progressInstances.push(gaugeArrow);

const gaugeTriangle = new GaugeProgress('#gauge-triangle', {
  value: 65,
  showNumbers: true,
  showPointer: true,
  needleType: 'triangle',
  radius: 70,
  numberFormat: (value) => `${Math.round(value)}`,
});
progressInstances.push(gaugeTriangle);

// ====== 多环进度条 ======
const ringDouble = new RingProgress('#ring-double', {
  value: 50,
  baseRadius: 50,
  ringGap: 12,
  showText: true,
  rings: [
    { value: 70, color: '#409eff', strokeWidth: 8, label: 'CPU' },
    { value: 50, color: '#67c23a', strokeWidth: 8, label: 'RAM' },
  ],
});
progressInstances.push(ringDouble);

const ringTriple = new RingProgress('#ring-triple', {
  value: 60,
  baseRadius: 45,
  ringGap: 10,
  showText: true,
  rings: [
    { value: 80, color: '#409eff', strokeWidth: 6 },
    { value: 60, color: '#67c23a', strokeWidth: 6 },
    { value: 40, color: '#e6a23c', strokeWidth: 6 },
  ],
});
progressInstances.push(ringTriple);

const ringMulti = new RingProgress('#ring-multi', {
  value: 50,
  baseRadius: 35,
  ringGap: 8,
  showText: true,
  rings: [
    { value: 90, color: '#409eff', strokeWidth: 5 },
    { value: 70, color: '#67c23a', strokeWidth: 5 },
    { value: 50, color: '#e6a23c', strokeWidth: 5 },
    { value: 30, color: '#f56c6c', strokeWidth: 5 },
    { value: 60, color: '#909399', strokeWidth: 5 },
  ],
});
progressInstances.push(ringMulti);

// ====== 多边形进度条 ======
const polygonTriangle = new PolygonProgress('#polygon-triangle', {
  value: 50,
  sides: 3,
  radius: 60,
  color: '#f56c6c',
  strokeWidth: 8,
  showText: true,
});
progressInstances.push(polygonTriangle);

const polygonHexagon = new PolygonProgress('#polygon-hexagon', {
  value: 50,
  sides: 6,
  radius: 60,
  color: ['#409eff', '#67c23a'],
  strokeWidth: 8,
  showText: true,
});
progressInstances.push(polygonHexagon);

const polygonOctagon = new PolygonProgress('#polygon-octagon', {
  value: 50,
  sides: 8,
  radius: 60,
  rotation: 22.5,
  color: '#e6a23c',
  strokeWidth: 8,
  showText: true,
});
progressInstances.push(polygonOctagon);

// ====== 电池进度条 ======
const batteryHorizontal = new BatteryProgress('#battery-horizontal', {
  value: 75,
  orientation: 'horizontal',
  batteryWidth: 150,
  batteryHeight: 60,
  showText: true,
  lowBatteryThreshold: 20,
});
progressInstances.push(batteryHorizontal);

const batteryVertical = new BatteryProgress('#battery-vertical', {
  value: 45,
  orientation: 'vertical',
  batteryWidth: 60,
  batteryHeight: 150,
  showText: true,
});
progressInstances.push(batteryVertical);

const batteryCharging = new BatteryProgress('#battery-charging', {
  value: 60,
  orientation: 'horizontal',
  batteryWidth: 150,
  batteryHeight: 60,
  showText: true,
  showBoltIcon: true,
  chargingColor: '#67c23a',
});
progressInstances.push(batteryCharging);

// ====== 心形进度条 ======
const heartBottom = new HeartProgress('#heart-bottom', {
  value: 70,
  heartSize: 120,
  fillMode: 'bottom-up',
  color: ['#ff6b6b', '#ee5a6f'],
  showText: true,
});
progressInstances.push(heartBottom);

const heartCenter = new HeartProgress('#heart-center', {
  value: 50,
  heartSize: 120,
  fillMode: 'center-out',
  color: '#ff4757',
  showText: true,
});
progressInstances.push(heartCenter);

const heartBeat = new HeartProgress('#heart-beat', {
  value: 80,
  heartSize: 120,
  fillMode: 'bottom-up',
  color: ['#ff6b6b', '#ee5a6f'],
  showText: true,
  beatAnimation: true,
  beatSpeed: 800,
});
progressInstances.push(heartBeat);

// ====== 全局控制函数 ======
window.updateAll = function(value) {
  progressInstances.forEach(instance => {
    instance.setValue(value);
  });
};

// 动画演示
window.animateAll = function() {
  let value = 0;
  const interval = setInterval(() => {
    value += 2;
    progressInstances.forEach(instance => {
      instance.setValue(value);
    });
    
    if (value >= 100) {
      clearInterval(interval);
      // 重置到 50%
      setTimeout(() => {
        progressInstances.forEach(instance => {
          instance.setValue(50);
        });
      }, 1000);
    }
  }, 30);
};

console.log('🎉 已加载', progressInstances.length, '个高级进度条实例！');
console.log('💡 提示：点击下方按钮控制所有进度条');


