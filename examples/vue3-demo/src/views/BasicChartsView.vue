<!--
  基础图表视图 - 展示折线图、柱状图、饼图等基础图表类型
-->

<template>
  <div class="basic-charts-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>📈 基础图表</h1>
      <p>展示折线图、柱状图、饼图等常用的基础图表类型及其配置选项</p>
    </div>

    <!-- 折线图部分 -->
    <section class="chart-section">
      <h2 class="section-title">📊 折线图 (Line Chart)</h2>
      
      <div class="grid grid--cols-2">
        <!-- 基础折线图 -->
        <div class="chart-demo">
          <div class="chart-demo__header">
            <h3>基础折线图</h3>
            <div class="chart-demo__actions">
              <button class="btn btn--text" @click="toggleCode('basicLine')">
                {{ showCode.basicLine ? '隐藏代码' : '查看代码' }}
              </button>
            </div>
          </div>
          
          <div class="chart-demo__chart">
            <LLineChart
              :data="lineChartData.basic"
              :config="lineChartConfig.basic"
              width="100%"
              height="300px"
            />
          </div>
          
          <div v-if="showCode.basicLine" class="chart-demo__code">
            <div class="code-block">
              <div class="code-block__header">
                <span class="language">vue</span>
                <button class="copy-btn" @click="copyCode(basicLineCode)">复制</button>
              </div>
              <pre><code>{{ basicLineCode }}</code></pre>
            </div>
          </div>
        </div>

        <!-- 平滑折线图 -->
        <div class="chart-demo">
          <div class="chart-demo__header">
            <h3>平滑折线图</h3>
            <div class="chart-demo__actions">
              <button class="btn btn--text" @click="toggleCode('smoothLine')">
                {{ showCode.smoothLine ? '隐藏代码' : '查看代码' }}
              </button>
            </div>
          </div>
          
          <div class="chart-demo__chart">
            <LLineChart
              :data="lineChartData.smooth"
              :config="lineChartConfig.smooth"
              width="100%"
              height="300px"
            />
          </div>
          
          <div v-if="showCode.smoothLine" class="chart-demo__code">
            <div class="code-block">
              <div class="code-block__header">
                <span class="language">vue</span>
                <button class="copy-btn" @click="copyCode(smoothLineCode)">复制</button>
              </div>
              <pre><code>{{ smoothLineCode }}</code></pre>
            </div>
          </div>
        </div>

        <!-- 面积图 -->
        <div class="chart-demo">
          <div class="chart-demo__header">
            <h3>面积图</h3>
            <div class="chart-demo__actions">
              <button class="btn btn--text" @click="toggleCode('areaLine')">
                {{ showCode.areaLine ? '隐藏代码' : '查看代码' }}
              </button>
            </div>
          </div>
          
          <div class="chart-demo__chart">
            <LLineChart
              :data="lineChartData.area"
              :config="lineChartConfig.area"
              width="100%"
              height="300px"
            />
          </div>
          
          <div v-if="showCode.areaLine" class="chart-demo__code">
            <div class="code-block">
              <div class="code-block__header">
                <span class="language">vue</span>
                <button class="copy-btn" @click="copyCode(areaLineCode)">复制</button>
              </div>
              <pre><code>{{ areaLineCode }}</code></pre>
            </div>
          </div>
        </div>

        <!-- 堆叠折线图 -->
        <div class="chart-demo">
          <div class="chart-demo__header">
            <h3>堆叠折线图</h3>
            <div class="chart-demo__actions">
              <button class="btn btn--text" @click="toggleCode('stackLine')">
                {{ showCode.stackLine ? '隐藏代码' : '查看代码' }}
              </button>
            </div>
          </div>
          
          <div class="chart-demo__chart">
            <LLineChart
              :data="lineChartData.stack"
              :config="lineChartConfig.stack"
              width="100%"
              height="300px"
            />
          </div>
          
          <div v-if="showCode.stackLine" class="chart-demo__code">
            <div class="code-block">
              <div class="code-block__header">
                <span class="language">vue</span>
                <button class="copy-btn" @click="copyCode(stackLineCode)">复制</button>
              </div>
              <pre><code>{{ stackLineCode }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 柱状图部分 -->
    <section class="chart-section">
      <h2 class="section-title">📊 柱状图 (Bar Chart)</h2>
      
      <div class="grid grid--cols-2">
        <!-- 基础柱状图 -->
        <div class="chart-demo">
          <div class="chart-demo__header">
            <h3>基础柱状图</h3>
            <div class="chart-demo__actions">
              <button class="btn btn--text" @click="toggleCode('basicBar')">
                {{ showCode.basicBar ? '隐藏代码' : '查看代码' }}
              </button>
            </div>
          </div>
          
          <div class="chart-demo__chart">
            <LBarChart
              :data="barChartData.basic"
              :config="barChartConfig.basic"
              width="100%"
              height="300px"
            />
          </div>
          
          <div v-if="showCode.basicBar" class="chart-demo__code">
            <div class="code-block">
              <div class="code-block__header">
                <span class="language">vue</span>
                <button class="copy-btn" @click="copyCode(basicBarCode)">复制</button>
              </div>
              <pre><code>{{ basicBarCode }}</code></pre>
            </div>
          </div>
        </div>

        <!-- 水平柱状图 -->
        <div class="chart-demo">
          <div class="chart-demo__header">
            <h3>水平柱状图</h3>
            <div class="chart-demo__actions">
              <button class="btn btn--text" @click="toggleCode('horizontalBar')">
                {{ showCode.horizontalBar ? '隐藏代码' : '查看代码' }}
              </button>
            </div>
          </div>
          
          <div class="chart-demo__chart">
            <LBarChart
              :data="barChartData.horizontal"
              :config="barChartConfig.horizontal"
              width="100%"
              height="300px"
            />
          </div>
          
          <div v-if="showCode.horizontalBar" class="chart-demo__code">
            <div class="code-block">
              <div class="code-block__header">
                <span class="language">vue</span>
                <button class="copy-btn" @click="copyCode(horizontalBarCode)">复制</button>
              </div>
              <pre><code>{{ horizontalBarCode }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 饼图部分 -->
    <section class="chart-section">
      <h2 class="section-title">🥧 饼图 (Pie Chart)</h2>
      
      <div class="grid grid--cols-2">
        <!-- 基础饼图 -->
        <div class="chart-demo">
          <div class="chart-demo__header">
            <h3>基础饼图</h3>
            <div class="chart-demo__actions">
              <button class="btn btn--text" @click="toggleCode('basicPie')">
                {{ showCode.basicPie ? '隐藏代码' : '查看代码' }}
              </button>
            </div>
          </div>
          
          <div class="chart-demo__chart">
            <LPieChart
              :data="pieChartData.basic"
              :config="pieChartConfig.basic"
              width="100%"
              height="300px"
            />
          </div>
          
          <div v-if="showCode.basicPie" class="chart-demo__code">
            <div class="code-block">
              <div class="code-block__header">
                <span class="language">vue</span>
                <button class="copy-btn" @click="copyCode(basicPieCode)">复制</button>
              </div>
              <pre><code>{{ basicPieCode }}</code></pre>
            </div>
          </div>
        </div>

        <!-- 环形图 -->
        <div class="chart-demo">
          <div class="chart-demo__header">
            <h3>环形图</h3>
            <div class="chart-demo__actions">
              <button class="btn btn--text" @click="toggleCode('donutPie')">
                {{ showCode.donutPie ? '隐藏代码' : '查看代码' }}
              </button>
            </div>
          </div>
          
          <div class="chart-demo__chart">
            <LPieChart
              :data="pieChartData.donut"
              :config="pieChartConfig.donut"
              width="100%"
              height="300px"
            />
          </div>
          
          <div v-if="showCode.donutPie" class="chart-demo__code">
            <div class="code-block">
              <div class="code-block__header">
                <span class="language">vue</span>
                <button class="copy-btn" @click="copyCode(donutPieCode)">复制</button>
              </div>
              <pre><code>{{ donutPieCode }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { LLineChart, LBarChart, LPieChart } from '@ldesign/chart/vue'

/**
 * 代码显示状态
 */
const showCode = reactive({
  basicLine: false,
  smoothLine: false,
  areaLine: false,
  stackLine: false,
  basicBar: false,
  horizontalBar: false,
  basicPie: false,
  donutPie: false
})

/**
 * 切换代码显示
 */
const toggleCode = (key: keyof typeof showCode) => {
  showCode[key] = !showCode[key]
}

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

/**
 * 折线图数据
 */
const lineChartData = {
  basic: [
    { name: '1月', value: 120 },
    { name: '2月', value: 200 },
    { name: '3月', value: 150 },
    { name: '4月', value: 300 },
    { name: '5月', value: 250 },
    { name: '6月', value: 400 }
  ],
  smooth: [
    { name: '1月', value: 120 },
    { name: '2月', value: 200 },
    { name: '3月', value: 150 },
    { name: '4月', value: 300 },
    { name: '5月', value: 250 },
    { name: '6月', value: 400 }
  ],
  area: [
    { name: '1月', value: 120 },
    { name: '2月', value: 200 },
    { name: '3月', value: 150 },
    { name: '4月', value: 300 },
    { name: '5月', value: 250 },
    { name: '6月', value: 400 }
  ],
  stack: {
    categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
    series: [
      { name: '产品A', data: [120, 200, 150, 300, 250, 400] },
      { name: '产品B', data: [80, 150, 100, 200, 180, 300] },
      { name: '产品C', data: [60, 100, 80, 150, 120, 200] }
    ]
  }
}

/**
 * 折线图配置
 */
const lineChartConfig = {
  basic: {
    title: '基础折线图示例',
    showSymbol: true
  },
  smooth: {
    title: '平滑折线图示例',
    smooth: true,
    showSymbol: false
  },
  area: {
    title: '面积图示例',
    area: true,
    smooth: true,
    showSymbol: false
  },
  stack: {
    title: '堆叠折线图示例',
    stack: true,
    area: true
  }
}

/**
 * 柱状图数据
 */
const barChartData = {
  basic: [
    { name: '产品A', value: 320 },
    { name: '产品B', value: 240 },
    { name: '产品C', value: 180 },
    { name: '产品D', value: 400 },
    { name: '产品E', value: 280 }
  ],
  horizontal: [
    { name: '产品A', value: 320 },
    { name: '产品B', value: 240 },
    { name: '产品C', value: 180 },
    { name: '产品D', value: 400 },
    { name: '产品E', value: 280 }
  ]
}

/**
 * 柱状图配置
 */
const barChartConfig = {
  basic: {
    title: '基础柱状图示例'
  },
  horizontal: {
    title: '水平柱状图示例',
    horizontal: true
  }
}

/**
 * 饼图数据
 */
const pieChartData = {
  basic: [
    { name: '直接访问', value: 335 },
    { name: '邮件营销', value: 310 },
    { name: '联盟广告', value: 234 },
    { name: '视频广告', value: 135 },
    { name: '搜索引擎', value: 1548 }
  ],
  donut: [
    { name: '直接访问', value: 335 },
    { name: '邮件营销', value: 310 },
    { name: '联盟广告', value: 234 },
    { name: '视频广告', value: 135 },
    { name: '搜索引擎', value: 1548 }
  ]
}

/**
 * 饼图配置
 */
const pieChartConfig = {
  basic: {
    title: '基础饼图示例'
  },
  donut: {
    title: '环形图示例',
    donut: true,
    innerRadius: '40%'
  }
}

/**
 * 代码示例
 */
const basicLineCode = `<template>
  <LLineChart
    :data="lineData"
    :config="{ title: '基础折线图示例', showSymbol: true }"
    width="100%"
    height="300px"
  />
</template>

<script setup>
import { LLineChart } from '@ldesign/chart/vue'

const lineData = [
  { name: '1月', value: 120 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 },
  { name: '4月', value: 300 },
  { name: '5月', value: 250 },
  { name: '6月', value: 400 }
]
</script>`

const smoothLineCode = `<template>
  <LLineChart
    :data="lineData"
    :config="{
      title: '平滑折线图示例',
      smooth: true,
      showSymbol: false
    }"
    width="100%"
    height="300px"
  />
</template>`

const areaLineCode = `<template>
  <LLineChart
    :data="lineData"
    :config="{
      title: '面积图示例',
      area: true,
      smooth: true,
      showSymbol: false
    }"
    width="100%"
    height="300px"
  />
</template>`

const stackLineCode = `<template>
  <LLineChart
    :data="stackData"
    :config="{
      title: '堆叠折线图示例',
      stack: true,
      area: true
    }"
    width="100%"
    height="300px"
  />
</template>

<script setup>
const stackData = {
  categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
  series: [
    { name: '产品A', data: [120, 200, 150, 300, 250, 400] },
    { name: '产品B', data: [80, 150, 100, 200, 180, 300] },
    { name: '产品C', data: [60, 100, 80, 150, 120, 200] }
  ]
}
</script>`

const basicBarCode = `<template>
  <LBarChart
    :data="barData"
    :config="{ title: '基础柱状图示例' }"
    width="100%"
    height="300px"
  />
</template>

<script setup>
import { LBarChart } from '@ldesign/chart/vue'

const barData = [
  { name: '产品A', value: 320 },
  { name: '产品B', value: 240 },
  { name: '产品C', value: 180 },
  { name: '产品D', value: 400 },
  { name: '产品E', value: 280 }
]
</script>`

const horizontalBarCode = `<template>
  <LBarChart
    :data="barData"
    :config="{
      title: '水平柱状图示例',
      horizontal: true
    }"
    width="100%"
    height="300px"
  />
</template>`

const basicPieCode = `<template>
  <LPieChart
    :data="pieData"
    :config="{ title: '基础饼图示例' }"
    width="100%"
    height="300px"
  />
</template>

<script setup>
import { LPieChart } from '@ldesign/chart/vue'

const pieData = [
  { name: '直接访问', value: 335 },
  { name: '邮件营销', value: 310 },
  { name: '联盟广告', value: 234 },
  { name: '视频广告', value: 135 },
  { name: '搜索引擎', value: 1548 }
]
</script>`

const donutPieCode = `<template>
  <LPieChart
    :data="pieData"
    :config="{
      title: '环形图示例',
      donut: true,
      innerRadius: '40%'
    }"
    width="100%"
    height="300px"
  />
</template>`
</script>

<style lang="less" scoped>
.basic-charts-view {
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--ldesign-bg-color-component);

    h3 {
      margin: 0;
      font-size: var(--ls-font-size-lg);
      font-weight: 500;
      color: var(--ldesign-text-color-primary);
    }
  }

  &__actions {
    display: flex;
    gap: var(--ls-spacing-sm);
  }

  &__chart {
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-container);
  }

  &__code {
    border-top: 1px solid var(--ldesign-border-color);
    background: var(--ldesign-bg-color-component);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grid--cols-2 {
    grid-template-columns: 1fr;
  }

  .chart-demo {
    &__header {
      flex-direction: column;
      gap: var(--ls-spacing-sm);
      align-items: flex-start;
    }

    &__actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
}
</style>
