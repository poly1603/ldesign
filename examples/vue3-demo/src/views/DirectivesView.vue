<!--
  指令视图 - 展示 v-chart 指令用法
-->

<template>
  <div class="directives-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>🎯 指令用法</h1>
      <p>使用 v-chart 指令快速创建图表</p>
    </div>

    <!-- 基础用法 -->
    <section class="demo-section">
      <h2 class="section-title">基础用法</h2>
      
      <div class="demo-card">
        <div class="demo-card__preview">
          <div 
            v-chart="basicDirectiveOptions"
            class="chart-container"
          ></div>
        </div>
        
        <div class="demo-card__code">
          <div class="code-block">
            <div class="code-block__header">
              <span class="language">vue</span>
              <button class="copy-btn" @click="copyCode(basicDirectiveCode)">复制</button>
            </div>
            <pre><code>{{ basicDirectiveCode }}</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- 动态更新 -->
    <section class="demo-section">
      <h2 class="section-title">动态更新</h2>
      
      <div class="demo-card">
        <div class="demo-card__preview">
          <div 
            v-chart="dynamicDirectiveOptions"
            class="chart-container"
          ></div>
        </div>
        
        <div class="demo-card__controls">
          <div class="control-group">
            <label>图表类型:</label>
            <select v-model="dynamicType">
              <option value="line">折线图</option>
              <option value="bar">柱状图</option>
              <option value="pie">饼图</option>
            </select>
          </div>
          
          <div class="control-group">
            <button class="btn btn--primary" @click="updateDynamicData">
              🔄 更新数据
            </button>
          </div>
        </div>
        
        <div class="demo-card__code">
          <div class="code-block">
            <div class="code-block__header">
              <span class="language">vue</span>
              <button class="copy-btn" @click="copyCode(dynamicDirectiveCode)">复制</button>
            </div>
            <pre><code>{{ dynamicDirectiveCode }}</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- 事件处理 -->
    <section class="demo-section">
      <h2 class="section-title">事件处理</h2>
      
      <div class="demo-card">
        <div class="demo-card__preview">
          <div 
            v-chart="eventDirectiveOptions"
            class="chart-container"
          ></div>
        </div>
        
        <div class="demo-card__info">
          <div class="alert alert--info">
            <strong>提示:</strong> 点击图表中的数据点查看事件响应
          </div>
          
          <div v-if="lastClickEvent" class="event-info">
            <h4>最后点击事件:</h4>
            <pre>{{ JSON.stringify(lastClickEvent, null, 2) }}</pre>
          </div>
        </div>
        
        <div class="demo-card__code">
          <div class="code-block">
            <div class="code-block__header">
              <span class="language">vue</span>
              <button class="copy-btn" @click="copyCode(eventDirectiveCode)">复制</button>
            </div>
            <pre><code>{{ eventDirectiveCode }}</code></pre>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

/**
 * 基础指令用法
 */
const basicDirectiveOptions = {
  type: 'line' as const,
  data: [
    { name: '1月', value: 120 },
    { name: '2月', value: 200 },
    { name: '3月', value: 150 },
    { name: '4月', value: 300 },
    { name: '5月', value: 250 },
    { name: '6月', value: 400 }
  ],
  config: {
    title: 'v-chart 基础示例',
    smooth: true
  },
  theme: 'light'
}

/**
 * 动态更新示例
 */
const dynamicType = ref<'line' | 'bar' | 'pie'>('line')
const dynamicData = ref([
  { name: 'A', value: 100 },
  { name: 'B', value: 200 },
  { name: 'C', value: 150 },
  { name: 'D', value: 300 }
])

const dynamicDirectiveOptions = computed(() => ({
  type: dynamicType.value,
  data: dynamicData.value,
  config: {
    title: '动态更新示例'
  },
  theme: 'light'
}))

const updateDynamicData = () => {
  dynamicData.value = dynamicData.value.map(item => ({
    ...item,
    value: Math.floor(Math.random() * 400) + 50
  }))
}

/**
 * 事件处理示例
 */
const lastClickEvent = ref<any>(null)

const handleChartClick = (params: any) => {
  lastClickEvent.value = {
    name: params.name,
    value: params.value,
    dataIndex: params.dataIndex,
    timestamp: new Date().toLocaleTimeString()
  }
}

const eventDirectiveOptions = {
  type: 'bar' as const,
  data: [
    { name: '产品A', value: 320 },
    { name: '产品B', value: 240 },
    { name: '产品C', value: 180 },
    { name: '产品D', value: 400 },
    { name: '产品E', value: 280 }
  ],
  config: {
    title: '点击事件示例'
  },
  theme: 'light',
  listeners: {
    click: handleChartClick
  }
}

/**
 * 代码示例
 */
const basicDirectiveCode = `<template>
  <div 
    v-chart="chartOptions"
    style="width: 100%; height: 300px;"
  ></div>
</template>

<script setup>
const chartOptions = {
  type: 'line',
  data: [
    { name: '1月', value: 120 },
    { name: '2月', value: 200 },
    { name: '3月', value: 150 },
    { name: '4月', value: 300 }
  ],
  config: {
    title: '我的图表',
    smooth: true
  },
  theme: 'light'
}
</script>`

const dynamicDirectiveCode = `<template>
  <div 
    v-chart="dynamicOptions"
    style="width: 100%; height: 300px;"
  ></div>
  <select v-model="chartType">
    <option value="line">折线图</option>
    <option value="bar">柱状图</option>
  </select>
</template>

<script setup>
import { ref, computed } from 'vue'

const chartType = ref('line')
const data = ref([
  { name: 'A', value: 100 },
  { name: 'B', value: 200 }
])

const dynamicOptions = computed(() => ({
  type: chartType.value,
  data: data.value,
  config: { title: '动态图表' }
}))
</script>`

const eventDirectiveCode = `<template>
  <div 
    v-chart="chartWithEvents"
    style="width: 100%; height: 300px;"
  ></div>
  <div v-if="clickData">
    点击了: {{ clickData.name }}
  </div>
</template>

<script setup>
import { ref } from 'vue'

const clickData = ref(null)

const handleClick = (params) => {
  clickData.value = params
}

const chartWithEvents = {
  type: 'bar',
  data: [
    { name: '产品A', value: 320 },
    { name: '产品B', value: 240 }
  ],
  config: { title: '可点击图表' },
  listeners: {
    click: handleClick
  }
}
</script>`

/**
 * 复制代码
 */
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    console.log('代码已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
  }
}
</script>

<style lang="less" scoped>
.directives-view {
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

/* 演示区域 */
.demo-section {
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

/* 演示卡片 */
.demo-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  box-shadow: var(--ldesign-shadow-1);
  overflow: hidden;

  &__preview {
    padding: var(--ls-padding-lg);
    background: var(--ldesign-bg-color-component);
    border-bottom: 1px solid var(--ldesign-border-color);

    .chart-container {
      width: 100%;
      height: 300px;
      background: var(--ldesign-bg-color-container);
      border-radius: var(--ls-border-radius-base);
    }
  }

  &__controls {
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-container);
    border-bottom: 1px solid var(--ldesign-border-color);
    display: flex;
    flex-wrap: wrap;
    gap: var(--ls-spacing-base);
    align-items: center;

    .control-group {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-sm);

      label {
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-secondary);
        white-space: nowrap;
      }

      select {
        padding: var(--ls-padding-xs) var(--ls-padding-sm);
        border: 1px solid var(--ldesign-border-color);
        border-radius: var(--ls-border-radius-sm);
        background: var(--ldesign-bg-color-component);
        color: var(--ldesign-text-color-primary);
      }
    }
  }

  &__info {
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-container);
    border-bottom: 1px solid var(--ldesign-border-color);

    .event-info {
      margin-top: var(--ls-margin-base);

      h4 {
        margin: 0 0 var(--ls-margin-sm);
        font-size: var(--ls-font-size-base);
        color: var(--ldesign-text-color-primary);
      }

      pre {
        background: var(--ldesign-bg-color-component);
        padding: var(--ls-padding-sm);
        border-radius: var(--ls-border-radius-sm);
        font-size: var(--ls-font-size-xs);
        overflow-x: auto;
      }
    }
  }

  &__code {
    background: var(--ldesign-bg-color-component);
  }
}
</style>
