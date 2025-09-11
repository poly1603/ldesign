# 基础示例

这里展示了 @ldesign/chart 的基本使用方法和常见场景。

## 简单折线图

```html
<!DOCTYPE html>
<html>
<head>
  <title>折线图示例</title>
  <script src="https://unpkg.com/@ldesign/chart/dist/index.umd.js"></script>
</head>
<body>
  <div id="line-chart" style="width: 600px; height: 400px;"></div>
  
  <script>
    const { Chart } = LDesignChart;
    
    const data = [
      { name: '1月', value: 100 },
      { name: '2月', value: 200 },
      { name: '3月', value: 150 },
      { name: '4月', value: 300 },
      { name: '5月', value: 250 },
    ];
    
    const chart = new Chart(document.getElementById('line-chart'), {
      type: 'line',
      data,
      title: '月度销售趋势',
      smooth: true,
    });
  </script>
</body>
</html>
```

## 柱状图对比

```typescript
import { createBarChart } from '@ldesign/chart';

const container = document.getElementById('bar-chart');

const data = {
  categories: ['产品A', '产品B', '产品C', '产品D', '产品E'],
  series: [
    {
      name: '2023年',
      data: [120, 200, 150, 80, 70],
    },
    {
      name: '2024年',
      data: [140, 180, 170, 90, 85],
    },
  ],
};

const chart = createBarChart(container, data, {
  title: '产品销售对比',
  barWidth: '60%',
  showLabel: true,
});
```

## 饼图分布

```typescript
import { createPieChart } from '@ldesign/chart';

const pieData = [
  { name: '移动端', value: 45 },
  { name: '桌面端', value: 35 },
  { name: '平板端', value: 15 },
  { name: '其他', value: 5 },
];

const chart = createPieChart(document.getElementById('pie-chart'), pieData, {
  title: '访问来源分布',
  showLabel: true,
  labelPosition: 'outside',
});
```

## 多系列面积图

```typescript
import { Chart } from '@ldesign/chart';

const areaData = {
  categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
  series: [
    {
      name: '收入',
      data: [1000, 1200, 1100, 1400, 1300, 1600],
    },
    {
      name: '支出',
      data: [800, 900, 850, 1000, 950, 1100],
    },
  ],
};

const chart = new Chart(document.getElementById('area-chart'), {
  type: 'area',
  data: areaData,
  title: '收支情况',
  areaOpacity: 0.3,
  stack: false,
});
```

## 散点图关系

```typescript
import { Chart } from '@ldesign/chart';

const scatterData = [
  { name: '数据点1', value: [161.2, 51.6] },
  { name: '数据点2', value: [167.5, 59.0] },
  { name: '数据点3', value: [159.5, 49.2] },
  { name: '数据点4', value: [157.0, 63.0] },
  { name: '数据点5', value: [155.8, 53.6] },
  { name: '数据点6', value: [170.0, 59.0] },
  { name: '数据点7', value: [159.1, 47.6] },
  { name: '数据点8', value: [166.0, 69.8] },
  { name: '数据点9', value: [176.2, 66.8] },
  { name: '数据点10', value: [160.2, 75.2] },
];

const chart = new Chart(document.getElementById('scatter-chart'), {
  type: 'scatter',
  data: scatterData,
  title: '身高体重关系图',
  xAxis: { name: '身高(cm)' },
  yAxis: { name: '体重(kg)' },
  symbolSize: 8,
});
```

## 主题切换示例

```typescript
import { Chart } from '@ldesign/chart';

const data = [
  { name: 'A', value: 100 },
  { name: 'B', value: 200 },
  { name: 'C', value: 150 },
];

const chart = new Chart(document.getElementById('theme-chart'), {
  type: 'bar',
  data,
  title: '主题切换示例',
  theme: 'light',
});

// 切换到深色主题
document.getElementById('dark-theme').addEventListener('click', () => {
  chart.setTheme('dark');
});

// 切换到彩色主题
document.getElementById('colorful-theme').addEventListener('click', () => {
  chart.setTheme('colorful');
});

// 自定义主题
document.getElementById('custom-theme').addEventListener('click', () => {
  const customTheme = {
    name: 'custom',
    colors: {
      primary: '#ff6b6b',
      background: '#ffffff',
      text: '#333333',
      palette: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'],
    },
  };
  chart.setTheme(customTheme);
});
```

## 响应式图表

```typescript
import { Chart } from '@ldesign/chart';

const chart = new Chart(document.getElementById('responsive-chart'), {
  type: 'line',
  data: [
    { name: '1月', value: 100 },
    { name: '2月', value: 200 },
    { name: '3月', value: 150 },
  ],
  title: '响应式图表',
  responsive: true,
});

// 监听窗口大小变化
window.addEventListener('resize', () => {
  // 图表会自动调整大小，无需手动处理
  console.log('窗口大小已改变，图表自动调整');
});

// 手动调整图表大小
document.getElementById('resize-btn').addEventListener('click', () => {
  chart.resize({ width: 800, height: 600 });
});
```

## 事件处理示例

```typescript
import { Chart } from '@ldesign/chart';

const chart = new Chart(document.getElementById('event-chart'), {
  type: 'bar',
  data: [
    { name: '产品A', value: 100 },
    { name: '产品B', value: 200 },
    { name: '产品C', value: 150 },
  ],
  title: '事件处理示例',
});

// 点击事件
chart.on('click', (params) => {
  console.log('点击了:', params.name, params.value);
  alert(`点击了 ${params.name}: ${params.value}`);
});

// 鼠标悬停事件
chart.on('mouseover', (params) => {
  console.log('鼠标悬停:', params.name);
});

// 鼠标离开事件
chart.on('mouseout', (params) => {
  console.log('鼠标离开:', params.name);
});
```

## 动态数据更新

```typescript
import { Chart } from '@ldesign/chart';

let data = [
  { name: '产品A', value: 100 },
  { name: '产品B', value: 200 },
  { name: '产品C', value: 150 },
];

const chart = new Chart(document.getElementById('dynamic-chart'), {
  type: 'line',
  data,
  title: '动态数据更新',
});

// 定时更新数据
setInterval(() => {
  data = data.map(item => ({
    ...item,
    value: Math.floor(Math.random() * 300) + 50,
  }));
  
  chart.updateData(data);
}, 2000);

// 手动更新数据
document.getElementById('update-btn').addEventListener('click', () => {
  const newData = [
    { name: '新产品A', value: Math.floor(Math.random() * 300) },
    { name: '新产品B', value: Math.floor(Math.random() * 300) },
    { name: '新产品C', value: Math.floor(Math.random() * 300) },
    { name: '新产品D', value: Math.floor(Math.random() * 300) },
  ];
  
  chart.updateData(newData);
});
```
