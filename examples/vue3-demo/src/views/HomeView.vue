<!--
  首页视图 - 图表组件库概览
-->

<template>
  <div class="home-view">
    <!-- 头部介绍 -->
    <section class="hero">
      <div class="hero__content">
        <h1 class="hero__title">
          📊 LDesign Chart
        </h1>
        <p class="hero__subtitle">
          基于 ECharts 的 Vue3 图表组件库
        </p>
        <p class="hero__description">
          提供丰富的图表类型、完善的 TypeScript 支持、响应式数据绑定和优雅的 API 设计
        </p>
        
        <div class="hero__actions">
          <router-link to="/basic-charts" class="btn btn--primary btn--large">
            🚀 开始使用
          </router-link>
          <router-link to="/composables" class="btn btn--secondary btn--large">
            📖 查看文档
          </router-link>
        </div>
      </div>
      
      <!-- 示例图表 -->
      <div class="hero__chart">
        <LLineChart
          :data="heroChartData"
          :config="heroChartConfig"
          width="100%"
          height="300px"
        />
      </div>
    </section>

    <!-- 特性介绍 -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">✨ 核心特性</h2>
        
        <div class="grid grid--cols-3">
          <div class="feature-card" v-for="feature in features" :key="feature.title">
            <div class="feature-card__icon">{{ feature.icon }}</div>
            <h3 class="feature-card__title">{{ feature.title }}</h3>
            <p class="feature-card__description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 图表类型展示 -->
    <section class="chart-types">
      <div class="container">
        <h2 class="section-title">📈 支持的图表类型</h2>
        
        <div class="grid grid--cols-4">
          <div 
            class="chart-type-card" 
            v-for="chartType in chartTypes" 
            :key="chartType.type"
            @click="navigateToChart(chartType.route)"
          >
            <div class="chart-type-card__preview">
              <component 
                :is="chartType.component"
                :data="chartType.data"
                :config="chartType.config"
                width="100%"
                height="120px"
              />
            </div>
            <div class="chart-type-card__info">
              <h4>{{ chartType.name }}</h4>
              <p>{{ chartType.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quick-start">
      <div class="container">
        <h2 class="section-title">🚀 快速开始</h2>
        
        <div class="grid grid--cols-2">
          <!-- 安装 -->
          <div class="card">
            <div class="card__header">
              <h3>1. 安装</h3>
              <p>使用 npm 或 pnpm 安装</p>
            </div>
            <div class="card__body">
              <div class="code-block">
                <div class="code-block__header">
                  <span class="language">bash</span>
                  <button class="copy-btn" @click="copyCode(installCode)">复制</button>
                </div>
                <pre><code>{{ installCode }}</code></pre>
              </div>
            </div>
          </div>

          <!-- 使用 -->
          <div class="card">
            <div class="card__header">
              <h3>2. 使用</h3>
              <p>在 Vue 组件中使用</p>
            </div>
            <div class="card__body">
              <div class="code-block">
                <div class="code-block__header">
                  <span class="language">vue</span>
                  <button class="copy-btn" @click="copyCode(usageCode)">复制</button>
                </div>
                <pre><code>{{ usageCode }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 统计信息 -->
    <section class="stats">
      <div class="container">
        <div class="grid grid--cols-4">
          <div class="stat-item" v-for="stat in stats" :key="stat.label">
            <div class="stat-item__value">{{ stat.value }}</div>
            <div class="stat-item__label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { LLineChart, LBarChart, LPieChart, LScatterChart } from '@ldesign/chart/vue'

/**
 * 路由
 */
const router = useRouter()

const navigateToChart = (route: string) => {
  router.push(route)
}

/**
 * 英雄区域图表数据
 */
const heroChartData = ref([
  { name: '1月', value: 120 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 },
  { name: '4月', value: 300 },
  { name: '5月', value: 250 },
  { name: '6月', value: 400 }
])

const heroChartConfig = {
  title: '月度数据趋势',
  smooth: true,
  area: true,
  showSymbol: false
}

/**
 * 特性列表
 */
const features = [
  {
    icon: '🎨',
    title: '丰富的图表类型',
    description: '支持折线图、柱状图、饼图、散点图等 20+ 种图表类型'
  },
  {
    icon: '⚡',
    title: '高性能渲染',
    description: '基于 ECharts 引擎，支持大数据量渲染和流畅的动画效果'
  },
  {
    icon: '🔧',
    title: 'TypeScript 支持',
    description: '完整的类型定义，提供优秀的开发体验和代码提示'
  },
  {
    icon: '📱',
    title: '响应式设计',
    description: '自动适配不同屏幕尺寸，支持移动端和桌面端'
  },
  {
    icon: '🎯',
    title: '易于使用',
    description: '简洁的 API 设计，支持组件式和 Composable 两种用法'
  },
  {
    icon: '🌈',
    title: '主题定制',
    description: '内置多种主题，支持自定义主题和深色模式'
  }
]

/**
 * 图表类型展示
 */
const chartTypes = [
  {
    type: 'line',
    name: '折线图',
    description: '展示数据趋势变化',
    component: LLineChart,
    route: '/basic-charts',
    data: [
      { name: 'A', value: 100 },
      { name: 'B', value: 200 },
      { name: 'C', value: 150 },
      { name: 'D', value: 300 }
    ],
    config: { showSymbol: false, smooth: true }
  },
  {
    type: 'bar',
    name: '柱状图',
    description: '比较不同类别数据',
    component: LBarChart,
    route: '/basic-charts',
    data: [
      { name: 'A', value: 100 },
      { name: 'B', value: 200 },
      { name: 'C', value: 150 },
      { name: 'D', value: 300 }
    ],
    config: {}
  },
  {
    type: 'pie',
    name: '饼图',
    description: '展示数据占比关系',
    component: LPieChart,
    route: '/basic-charts',
    data: [
      { name: 'A', value: 100 },
      { name: 'B', value: 200 },
      { name: 'C', value: 150 }
    ],
    config: {}
  },
  {
    type: 'scatter',
    name: '散点图',
    description: '展示数据分布关系',
    component: LScatterChart,
    route: '/advanced-charts',
    data: [
      { name: 'A', value: [10, 20] },
      { name: 'B', value: [15, 25] },
      { name: 'C', value: [20, 30] },
      { name: 'D', value: [25, 35] }
    ],
    config: { symbolSize: 8 }
  }
]

/**
 * 代码示例
 */
const installCode = `# 使用 npm
npm install @ldesign/chart

# 使用 pnpm
pnpm add @ldesign/chart`

const usageCode = `<template>
  <LLineChart 
    :data="chartData" 
    :config="{ title: '销售趋势' }"
    width="100%" 
    height="400px" 
  />
</template>

<script setup>
import { LLineChart } from '@ldesign/chart/vue'

const chartData = [
  { name: '1月', value: 120 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 }
]
</script>`

/**
 * 统计信息
 */
const stats = [
  { value: '20+', label: '图表类型' },
  { value: '100%', label:'TypeScript' },
  { value: '5KB', label: '核心大小' },
  { value: '99%', label: '测试覆盖率' }
]

/**
 * 复制代码
 */
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    // 这里可以添加提示消息
    console.log('代码已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
  }
}
</script>

<style lang="less" scoped>
.home-view {
  padding-bottom: var(--ls-padding-xl);
}

/* 英雄区域 */
.hero {
  background: linear-gradient(135deg, var(--ldesign-brand-color-1) 0%, var(--ldesign-brand-color-2) 100%);
  padding: var(--ls-padding-xl) 0;
  margin-bottom: var(--ls-margin-xl);
  border-radius: var(--ls-border-radius-lg);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ls-spacing-xl);
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }

  &__content {
    padding: 0 var(--ls-padding-lg);
  }

  &__title {
    font-size: var(--ls-font-size-h1);
    font-weight: 700;
    color: var(--ldesign-brand-color-8);
    margin-bottom: var(--ls-margin-base);
  }

  &__subtitle {
    font-size: var(--ls-font-size-xl);
    color: var(--ldesign-brand-color-7);
    margin-bottom: var(--ls-margin-sm);
    font-weight: 500;
  }

  &__description {
    font-size: var(--ls-font-size-base);
    color: var(--ldesign-text-color-secondary);
    line-height: 1.6;
    margin-bottom: var(--ls-margin-lg);
  }

  &__actions {
    display: flex;
    gap: var(--ls-spacing-base);
    flex-wrap: wrap;

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  &__chart {
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-container);
    border-radius: var(--ls-border-radius-base);
    box-shadow: var(--ldesign-shadow-2);
  }
}

/* 特性区域 */
.features {
  margin-bottom: var(--ls-margin-xl);

  .feature-card {
    text-align: center;
    padding: var(--ls-padding-lg);
    background: var(--ldesign-bg-color-container);
    border-radius: var(--ls-border-radius-base);
    box-shadow: var(--ldesign-shadow-1);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--ldesign-shadow-2);
    }

    &__icon {
      font-size: 48px;
      margin-bottom: var(--ls-margin-base);
    }

    &__title {
      font-size: var(--ls-font-size-lg);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-margin-sm);
    }

    &__description {
      color: var(--ldesign-text-color-secondary);
      line-height: 1.5;
    }
  }
}

/* 图表类型区域 */
.chart-types {
  margin-bottom: var(--ls-margin-xl);

  .chart-type-card {
    background: var(--ldesign-bg-color-container);
    border-radius: var(--ls-border-radius-base);
    box-shadow: var(--ldesign-shadow-1);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--ldesign-shadow-2);
    }

    &__preview {
      height: 120px;
      background: var(--ldesign-bg-color-component);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__info {
      padding: var(--ls-padding-base);

      h4 {
        margin: 0 0 var(--ls-margin-xs);
        font-size: var(--ls-font-size-base);
        color: var(--ldesign-text-color-primary);
      }

      p {
        margin: 0;
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-secondary);
      }
    }
  }
}

/* 快速开始区域 */
.quick-start {
  margin-bottom: var(--ls-margin-xl);
}

/* 统计区域 */
.stats {
  background: var(--ldesign-bg-color-container);
  padding: var(--ls-padding-xl) 0;
  border-radius: var(--ls-border-radius-lg);

  .stat-item {
    text-align: center;

    &__value {
      font-size: var(--ls-font-size-h2);
      font-weight: 700;
      color: var(--ldesign-brand-color);
      margin-bottom: var(--ls-margin-xs);
    }

    &__label {
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-text-color-secondary);
    }
  }
}

/* 通用样式 */
.section-title {
  text-align: center;
  font-size: var(--ls-font-size-h2);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-margin-xl);
}
</style>
