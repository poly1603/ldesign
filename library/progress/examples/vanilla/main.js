import {
  LinearProgress,
  CircleProgress,
  SemiCircleProgress,
  DashboardProgress,
  StepProgress,
  SegmentProgress,
  WaveProgress,
  PolygonProgress,
  BatteryProgress,
  HeartProgress,
  RingProgress,
} from '@ldesign/progress-core';
import '@ldesign/progress-core/src/styles/index.css';

// 存储所有进度条实例
const progressInstances = [];

// 基础线性进度条
const linearBasic = new LinearProgress('#linear-basic', {
  value: 50,
  theme: 'primary',
});
progressInstances.push(linearBasic);

// 渐变色进度条
const linearGradient = new LinearProgress('#linear-gradient', {
  value: 60,
  color: ['#409eff', '#67c23a'],
});
progressInstances.push(linearGradient);

// 条纹进度条
const linearStriped = new LinearProgress('#linear-striped', {
  value: 70,
  striped: true,
  active: true,
  theme: 'warning',
});
progressInstances.push(linearStriped);

// 缓冲进度条
const linearBuffer = new LinearProgress('#linear-buffer', {
  value: 40,
  buffer: 80,
  theme: 'info',
});
progressInstances.push(linearBuffer);

// 不确定状态
const linearIndeterminate = new LinearProgress('#linear-indeterminate', {
  indeterminate: true,
  theme: 'success',
});

// 圆形进度条
const circleBasic = new CircleProgress('#circle-basic', {
  value: 60,
  theme: 'primary',
});
progressInstances.push(circleBasic);

const circleGradient = new CircleProgress('#circle-gradient', {
  value: 75,
  color: ['#ff6b6b', '#feca57', '#48dbfb'],
});
progressInstances.push(circleGradient);

const circleSuccess = new CircleProgress('#circle-success', {
  value: 90,
  theme: 'success',
  strokeWidth: 8,
});
progressInstances.push(circleSuccess);

// 半圆进度条
const semicircle = new SemiCircleProgress('#semicircle-basic', {
  value: 65,
  showScale: true,
  theme: 'warning',
});
progressInstances.push(semicircle);

// 仪表盘进度
const dashboard = new DashboardProgress('#dashboard-basic', {
  value: 55,
  showPointer: true,
  colorRanges: [
    { min: 0, max: 30, color: '#67c23a' },
    { min: 30, max: 70, color: '#e6a23c' },
    { min: 70, max: 100, color: '#f56c6c' },
  ],
});
progressInstances.push(dashboard);

// 步骤进度条
const step = new StepProgress('#step-basic', {
  currentStep: 1,
  steps: [
    { title: '开始', description: '创建订单', status: 'completed' },
    { title: '处理中', description: '确认订单', status: 'active' },
    { title: '完成', description: '订单完成', status: 'pending' },
  ],
});
progressInstances.push(step);

// 分段进度条
const segment = new SegmentProgress('#segment-basic', {
  value: 75,
  segments: [
    { value: 30, color: '#67c23a', label: '已完成' },
    { value: 25, color: '#e6a23c', label: '进行中' },
    { value: 20, color: '#909399', label: '待处理' },
  ],
});
progressInstances.push(segment);

// 水波纹进度
const wave = new WaveProgress('#wave-basic', {
  value: 60,
  width: 200,
  height: 200,
  color: '#409eff',
});
progressInstances.push(wave);

// 多边形进度条
const polygonBasic = new PolygonProgress('#polygon-basic', {
  value: 60,
  sides: 6,
  radius: 50,
  color: '#409eff',
  strokeWidth: 6,
  showText: true,
});
progressInstances.push(polygonBasic);

const polygonTriangle = new PolygonProgress('#polygon-triangle', {
  value: 60,
  sides: 3,
  radius: 50,
  color: '#f56c6c',
  strokeWidth: 6,
  showText: true,
});
progressInstances.push(polygonTriangle);

const polygonOctagon = new PolygonProgress('#polygon-octagon', {
  value: 60,
  sides: 8,
  radius: 50,
  rotation: 22.5,
  color: '#e6a23c',
  strokeWidth: 6,
  showText: true,
});
progressInstances.push(polygonOctagon);

// 电池进度条
const batteryBasic = new BatteryProgress('#battery-basic', {
  value: 75,
  orientation: 'horizontal',
  batteryWidth: 150,
  batteryHeight: 50,
  showText: true,
});
progressInstances.push(batteryBasic);

// 心形进度条
const heartBasic = new HeartProgress('#heart-basic', {
  value: 70,
  heartSize: 100,
  fillMode: 'bottom-up',
  color: ['#ff6b6b', '#ee5a6f'],
  showText: true,
});
progressInstances.push(heartBasic);

// 多环进度条
const ringBasic = new RingProgress('#ring-basic', {
  value: 50,
  baseRadius: 50,
  ringGap: 12,
  showText: true,
  rings: [
    { value: 70, color: '#409eff', strokeWidth: 8, label: 'CPU' },
    { value: 50, color: '#67c23a', strokeWidth: 8, label: 'RAM' },
    { value: 40, color: '#e6a23c', strokeWidth: 8, label: 'Disk' },
  ],
});
progressInstances.push(ringBasic);

// 全局控制函数
window.updateAll = function(value) {
  progressInstances.forEach(instance => {
    instance.setValue(value);
  });
};

window.resetAll = function() {
  progressInstances.forEach(instance => {
    instance.reset();
  });
};


