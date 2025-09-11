<!--
  高级图表视图 - 展示散点图、雷达图等高级图表类型
-->

<template>
  <div class="advanced-charts-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>🚀 高级图表</h1>
      <p>展示散点图、雷达图、仪表盘等高级图表类型</p>
    </div>

    <!-- 散点图部分 -->
    <section class="chart-section">
      <h2 class="section-title">🔍 散点图 (Scatter Chart)</h2>
      
      <div class="grid grid--cols-2">
        <!-- 基础散点图 -->
        <div class="chart-demo">
          <div class="chart-demo__header">
            <h3>基础散点图</h3>
          </div>
          
          <div class="chart-demo__chart">
            <LScatterChart
              :data="scatterData.basic"
              :config="scatterConfig.basic"
              width="100%"
              height="300px"
            />
          </div>
        </div>

        <!-- 气泡图 -->
        <div class="chart-demo">
          <div class="chart-demo__header">
            <h3>气泡图</h3>
          </div>
          
          <div class="chart-demo__chart">
            <LScatterChart
              :data="scatterData.bubble"
              :config="scatterConfig.bubble"
              width="100%"
              height="300px"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 更多图表类型提示 -->
    <section class="coming-soon">
      <div class="coming-soon-content">
        <h2>🔮 更多图表类型</h2>
        <p>雷达图、仪表盘、桑基图等更多高级图表类型正在开发中...</p>
        
        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-icon">📡</span>
            <span class="feature-name">雷达图</span>
            <span class="feature-status">开发中</span>
          </div>
          
          <div class="feature-item">
            <span class="feature-icon">⏱️</span>
            <span class="feature-name">仪表盘</span>
            <span class="feature-status">开发中</span>
          </div>
          
          <div class="feature-item">
            <span class="feature-icon">🌊</span>
            <span class="feature-name">桑基图</span>
            <span class="feature-status">计划中</span>
          </div>
          
          <div class="feature-item">
            <span class="feature-icon">🌳</span>
            <span class="feature-name">树图</span>
            <span class="feature-status">计划中</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { LScatterChart } from '@ldesign/chart/vue'

/**
 * 散点图数据
 */
const scatterData = {
  basic: [
    { name: '点1', value: [10, 20] },
    { name: '点2', value: [15, 25] },
    { name: '点3', value: [20, 30] },
    { name: '点4', value: [25, 35] },
    { name: '点5', value: [30, 40] },
    { name: '点6', value: [35, 45] },
    { name: '点7', value: [40, 50] },
    { name: '点8', value: [45, 55] }
  ],
  bubble: [
    { name: '产品A', value: [100, 200, 50] },
    { name: '产品B', value: [150, 180, 80] },
    { name: '产品C', value: [200, 220, 60] },
    { name: '产品D', value: [250, 160, 90] },
    { name: '产品E', value: [300, 240, 70] }
  ]
}

/**
 * 散点图配置
 */
const scatterConfig = {
  basic: {
    title: '基础散点图示例',
    symbolSize: 8
  },
  bubble: {
    title: '气泡图示例',
    symbolSize: (value: number[]) => value[2] || 10
  }
}
</script>

<style lang="less" scoped>
.advanced-charts-view {
  padding: var(--ls-padding-base) 0;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: var(--ls-margin-xl);

  h1 {
    font-size: var(--ls-font-size-h1);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-sm);
  }

  p {
    font-size: var(--ls-font-size-base);
    color: var(--ldesign-text-color-secondary);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

/* 图表区域 */
.chart-section {
  margin-bottom: var(--ls-margin-xl);

  .section-title {
    font-size: var(--ls-font-size-h2);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-lg);
    padding-bottom: var(--ls-padding-sm);
    border-bottom: 2px solid var(--ldesign-brand-color);
    display: inline-block;
  }
}

/* 图表演示卡片 */
.chart-demo {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  box-shadow: var(--ldesign-shadow-1);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--ldesign-shadow-2);
    transform: translateY(-2px);
  }

  &__header {
    padding: var(--ls-padding-base);
    border-bottom: 1px solid var(--ldesign-border-color);
    background: var(--ldesign-bg-color-component);

    h3 {
      margin: 0;
      font-size: var(--ls-font-size-lg);
      font-weight: 500;
      color: var(--ldesign-text-color-primary);
    }
  }

  &__chart {
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-container);
  }
}

/* 即将推出区域 */
.coming-soon {
  text-align: center;
  padding: var(--ls-padding-xl);
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  border: 2px dashed var(--ldesign-border-color);

  .coming-soon-content {
    max-width: 600px;
    margin: 0 auto;

    h2 {
      font-size: var(--ls-font-size-h2);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-margin-base);
    }

    p {
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-text-color-secondary);
      margin-bottom: var(--ls-margin-lg);
      line-height: 1.6;
    }
  }

  .feature-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--ls-spacing-base);
    margin-top: var(--ls-margin-lg);

    .feature-item {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-sm);
      padding: var(--ls-padding-base);
      background: var(--ldesign-bg-color-component);
      border-radius: var(--ls-border-radius-base);
      border: 1px solid var(--ldesign-border-color);

      .feature-icon {
        font-size: 24px;
      }

      .feature-name {
        flex: 1;
        font-weight: 500;
        color: var(--ldesign-text-color-primary);
      }

      .feature-status {
        font-size: var(--ls-font-size-sm);
        padding: 2px 8px;
        border-radius: var(--ls-border-radius-sm);
        background: var(--ldesign-warning-color-1);
        color: var(--ldesign-warning-color);
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grid--cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
