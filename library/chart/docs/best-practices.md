# 最佳实践指南

本指南提供使用 @ldesign/chart 的最佳实践，帮助你构建高性能、可维护的图表应用。

## 🎯 核心原则

1. **按需优化** - 只在需要时启用优化功能
2. **测量先行** - 使用监控工具识别性能瓶颈
3. **渐进增强** - 从基础配置开始，逐步添加优化
4. **清理资源** - 始终正确销毁不再使用的图表

## 📦 项目结构

### 推荐的文件组织

```
src/
├── charts/
│   ├── LineChart.vue      # 封装的图表组件
│   ├── BarChart.vue
│   └── utils/
│       ├── chartConfig.ts  # 共享配置
│       └── dataTransform.ts # 数据转换
├── composables/
│   └── useChart.ts         # 图表 composition API
└── views/
    └── Dashboard.vue       # 使用图表的页面
```

### 组件封装示例

```vue
<!-- charts/LineChart.vue -->
<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Chart } from '@ldesign/chart';
import type { ChartConfig } from '@ldesign/chart';

interface Props {
  data: any[];
  config?: Partial<ChartConfig>;
  enableOptimizations?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  enableOptimizations: true,
});

const chartRef = ref<HTMLElement>();
let chart: Chart | null = null;

onMounted(() => {
  if (!chartRef.value) return;
  
  const config: ChartConfig = {
    type: 'line',
    data: props.data,
    // 根据数据大小自动启用优化
    virtual: props.enableOptimizations && props.data.length > 10000,
    worker: props.enableOptimizations && props.data.length > 50000,
    cache: props.enableOptimizations,
    ...props.config,
  };
  
  chart = new Chart(chartRef.value, config);
});

// 监听数据变化
watch(() => props.data, (newData) => {
  chart?.updateData(newData);
}, { deep: true });

// 清理资源
onUnmounted(() => {
  chart?.dispose();
  chart = null;
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
}
</style>
```

## 🔧 数据处理

### 数据预处理

```typescript
// utils/dataTransform.ts
import { memoize } from '@ldesign/chart/utils';

// 使用记忆化缓存转换结果
export const transformChartData = memoize((rawData: any[]) => {
  return rawData.map(item => ({
    x: new Date(item.timestamp),
    y: item.value,
  }));
}, {
  maxSize: 50,  // 缓存最近 50 次转换
  ttl: 60000,   // 1 分钟过期
});

// 数据验证
export function validateChartData(data: any[]): boolean {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return false;
  return true;
}

// 数据清洗
export function cleanChartData(data: any[]): any[] {
  return data
    .filter(item => item != null && !isNaN(item.value))
    .sort((a, b) => a.timestamp - b.timestamp);
}
```

### 大数据处理

```typescript
// composables/useChartData.ts
import { ref, computed } from 'vue';
import { ChartWorker } from '@ldesign/chart';

export function useChartData(initialData: any[]) {
  const rawData = ref(initialData);
  const worker = new ChartWorker();
  
  // 自动采样大数据集
  const processedData = computed(async () => {
    if (rawData.value.length > 10000) {
      return await worker.processData(rawData.value, 'sample', {
        method: 'lttb',
        count: 2000,
      });
    }
    return rawData.value;
  });
  
  return {
    rawData,
    processedData,
  };
}
```

## 🎨 组件设计

### 响应式图表

```vue
<template>
  <div class="responsive-chart">
    <Chart 
      :data="data"
      :config="chartConfig"
      :responsive="responsiveConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWindowSize } from '@vueuse/core';

const { width } = useWindowSize();

const responsiveConfig = computed(() => ({
  debounce: 200,  // 防抖延迟
  breakpoints: {
    mobile: width.value < 768,
    tablet: width.value >= 768 && width.value < 1024,
    desktop: width.value >= 1024,
  },
}));

const chartConfig = computed(() => ({
  fontSize: width.value < 768 ? 10 : 12,
  legend: {
    show: width.value >= 768,  // 移动端隐藏图例
  },
}));
</script>
```

### 异步数据加载

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Chart } from '@ldesign/chart';
import { retry } from '@ldesign/chart/utils';

const loading = ref(true);
const error = ref<Error | null>(null);
const data = ref([]);

onMounted(async () => {
  try {
    // 使用重试机制获取数据
    data.value = await retry(
      async () => {
        const response = await fetch('/api/chart-data');
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      },
      {
        retries: 3,
        delay: 1000,
        backoff: 2,
      }
    );
  } catch (e) {
    error.value = e as Error;
  } finally {
    loading.value = false;
  }
});
</script>
```

## 🧪 测试

### 单元测试

```typescript
// charts/__tests__/LineChart.spec.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LineChart from '../LineChart.vue';

describe('LineChart', () => {
  let wrapper: any;
  
  beforeEach(() => {
    wrapper = mount(LineChart, {
      props: {
        data: [1, 2, 3, 4, 5],
      },
    });
  });
  
  afterEach(() => {
    wrapper.unmount();
  });
  
  it('should render chart', () => {
    expect(wrapper.find('.chart-container').exists()).toBe(true);
  });
  
  it('should cleanup on unmount', () => {
    const chart = wrapper.vm.chart;
    wrapper.unmount();
    expect(chart.isDestroyed()).toBe(true);
  });
});
```

### 性能测试

```typescript
// __tests__/performance.spec.ts
import { describe, it, expect } from 'vitest';
import { Chart } from '@ldesign/chart';
import { performanceMonitor } from '@ldesign/chart';

describe('Performance', () => {
  it('should initialize within 500ms', () => {
    const container = document.createElement('div');
    performanceMonitor.mark('init-start');
    
    new Chart(container, {
      type: 'line',
      data: Array.from({ length: 1000 }, (_, i) => i),
    });
    
    const duration = performanceMonitor.measure('init', 'init-start');
    expect(duration).toBeLessThan(500);
  });
  
  it('should handle large dataset efficiently', async () => {
    const container = document.createElement('div');
    const largeData = Array.from({ length: 100000 }, (_, i) => i);
    
    performanceMonitor.mark('large-init-start');
    
    new Chart(container, {
      type: 'line',
      data: largeData,
      virtual: true,
      worker: true,
    });
    
    const duration = performanceMonitor.measure('large-init', 'large-init-start');
    expect(duration).toBeLessThan(2000);  // 2 秒内完成
  });
});
```

## 🔒 类型安全

### TypeScript 配置

```typescript
// types/chart.ts
import type { ChartConfig as BaseChartConfig } from '@ldesign/chart';

// 扩展配置类型
export interface AppChartConfig extends BaseChartConfig {
  customTheme?: 'light' | 'dark' | 'blue';
  showLegend?: boolean;
  exportable?: boolean;
}

// 创建类型安全的图表工厂
export function createChart(
  container: HTMLElement,
  config: AppChartConfig
): Chart {
  // 应用应用级默认配置
  const finalConfig: AppChartConfig = {
    cache: true,
    responsive: true,
    ...config,
  };
  
  return new Chart(container, finalConfig);
}
```

## 🎭 主题和样式

### 主题切换

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark();
const chart = ref<Chart>();

// 监听主题变化
watch(isDark, (dark) => {
  chart.value?.setDarkMode(dark);
});
</script>
```

### 自定义主题

```typescript
// config/chartTheme.ts
import { themeManager } from '@ldesign/chart';

// 注册自定义主题
themeManager.registerTheme('company', {
  color: ['#1890ff', '#52c41a', '#faad14', '#f5222d'],
  backgroundColor: '#ffffff',
  textStyle: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
  },
  title: {
    textStyle: {
      color: '#333',
      fontWeight: 600,
    },
  },
});
```

## 📊 状态管理

### Pinia Store 集成

```typescript
// stores/chartStore.ts
import { defineStore } from 'pinia';
import { chartCache, instanceManager } from '@ldesign/chart';

export const useChartStore = defineStore('chart', {
  state: () => ({
    charts: new Map<string, Chart>(),
  }),
  
  actions: {
    register(id: string, chart: Chart) {
      this.charts.set(id, chart);
    },
    
    dispose(id: string) {
      const chart = this.charts.get(id);
      if (chart) {
        chart.dispose();
        this.charts.delete(id);
      }
    },
    
    disposeAll() {
      this.charts.forEach(chart => chart.dispose());
      this.charts.clear();
    },
    
    getStats() {
      return {
        cache: chartCache.stats(),
        instances: instanceManager.stats(),
      };
    },
  },
});
```

## 🚨 错误处理

### 全局错误处理

```typescript
// plugins/chartErrorHandler.ts
import { errorHandler, ErrorLevel } from '@ldesign/chart';

// 配置错误处理器
errorHandler.config({
  enableConsoleLog: process.env.NODE_ENV === 'development',
  enableCollection: true,
  maxLogs: 100,
  onError: (error, context) => {
    // 发送到监控服务
    if (error.level === ErrorLevel.FATAL) {
      sendToMonitoring({
        message: error.message,
        type: error.type,
        context,
      });
    }
  },
});
```

## 📈 监控和分析

### 性能监控集成

```typescript
// utils/monitoring.ts
import { performanceMonitor, chartCache, instanceManager } from '@ldesign/chart';

export function setupMonitoring() {
  // 每 30 秒收集性能指标
  setInterval(() => {
    const metrics = {
      performance: performanceMonitor.getStats(),
      cache: chartCache.stats(),
      instances: instanceManager.stats(),
      timestamp: Date.now(),
    };
    
    // 发送到分析服务
    sendMetrics(metrics);
    
    // 性能警告
    if (metrics.performance.avgFrameTime > 30) {
      console.warn('Performance degradation detected');
    }
  }, 30000);
}
```

## ✅ 检查清单

### 开发阶段
- [ ] 组件正确封装和复用
- [ ] 数据验证和清洗
- [ ] TypeScript 类型定义完整
- [ ] 单元测试覆盖
- [ ] 错误处理完善

### 性能优化
- [ ] 大数据集启用虚拟渲染
- [ ] 数据处理使用 Worker
- [ ] 启用缓存机制
- [ ] 响应式配置合理
- [ ] 内存管理优化

### 生产部署
- [ ] 使用生产构建
- [ ] 移除开发日志
- [ ] 配置监控和告警
- [ ] 性能测试通过
- [ ] 浏览器兼容性测试

## 📚 相关资源

- [性能优化指南](./performance-guide.md)
- [API 文档](./api-reference.md)
- [故障排查](./troubleshooting.md)
- [示例代码](../examples/)

---

**记住**：好的代码不仅能运行，还要易于维护、性能优秀、健壮可靠。遵循这些最佳实践，你将构建出高质量的图表应用。

