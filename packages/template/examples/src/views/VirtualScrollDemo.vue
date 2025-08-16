<script setup lang="ts">
import { useSimpleVirtualScroll, useVirtualScroll } from '@ldesign/template/vue'
import { computed, ref } from 'vue'

// 生成大量模板数据
function generateTemplates(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `模板 ${i + 1}`,
    category: ['login', 'dashboard', 'profile'][i % 3],
    device: ['desktop', 'tablet', 'mobile'][i % 3],
    template: ['default', 'modern', 'classic'][i % 3],
    description: `这是第 ${i + 1} 个模板的描述信息，展示了模板的基本功能和特性。`,
    tags: ['响应式', '现代化', '易用'][Math.floor(Math.random() * 3)],
    rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
    downloads: Math.floor(Math.random() * 10000),
  }))
}

// 模板数据
const allTemplates = ref(generateTemplates(10000))
const filteredTemplates = ref(allTemplates.value)

// 搜索和过滤
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedDevice = ref('all')

// 过滤模板
function filterTemplates() {
  let result = allTemplates.value

  if (searchQuery.value) {
    result = result.filter(
      t =>
        t.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedCategory.value !== 'all') {
    result = result.filter(t => t.category === selectedCategory.value)
  }

  if (selectedDevice.value !== 'all') {
    result = result.filter(t => t.device === selectedDevice.value)
  }

  filteredTemplates.value = result
}

// 虚拟滚动配置
const containerHeight = 600
const itemHeight = 120

// 使用虚拟滚动
const {
  containerRef,
  visibleItems,
  visibleRange,
  totalHeight,
  offsetY,
  handleScroll,
  scrollToItem,
  scrollToTop,
  scrollToBottom,
} = useVirtualScroll(filteredTemplates, {
  containerHeight,
  itemHeight,
  buffer: 5,
})

// 简单虚拟滚动示例
const simpleTemplates = ref(generateTemplates(1000))
const {
  containerRef: simpleContainerRef,
  visibleItems: simpleVisibleItems,
  totalHeight: simpleTotalHeight,
  handleScroll: simpleHandleScroll,
} = useSimpleVirtualScroll(simpleTemplates, 80, 400)

// 性能统计
const performanceStats = computed(() => ({
  totalItems: filteredTemplates.value.length,
  visibleItems: visibleItems.value.length,
  renderRatio: ((visibleItems.value.length / filteredTemplates.value.length) * 100).toFixed(2),
  startIndex: visibleRange.value.start,
  endIndex: visibleRange.value.end,
}))

// 跳转到指定项目
const jumpToIndex = ref(0)
function jumpToItem() {
  const index = Math.max(0, Math.min(jumpToIndex.value - 1, filteredTemplates.value.length - 1))
  scrollToItem(index)
}

// 监听搜索和过滤变化
function handleSearch() {
  filterTemplates()
  scrollToTop()
}

function handleCategoryChange() {
  filterTemplates()
  scrollToTop()
}

function handleDeviceChange() {
  filterTemplates()
  scrollToTop()
}
</script>

<template>
  <div class="virtual-scroll-demo">
    <div class="demo-header">
      <h1>📜 虚拟滚动演示</h1>
      <p>体验虚拟滚动技术，高效渲染大量模板列表，提升页面性能。</p>
    </div>

    <!-- 性能统计 -->
    <div class="stats-panel">
      <div class="stat-item">
        <span class="stat-label">总数量:</span>
        <span class="stat-value">{{ performanceStats.totalItems.toLocaleString() }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">可见数量:</span>
        <span class="stat-value">{{ performanceStats.visibleItems }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">渲染比例:</span>
        <span class="stat-value">{{ performanceStats.renderRatio }}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">可见范围:</span>
        <span class="stat-value">{{ performanceStats.startIndex }} - {{ performanceStats.endIndex }}</span>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="controls-panel">
      <div class="control-group">
        <label>搜索:</label>
        <input v-model="searchQuery" placeholder="搜索模板..." class="search-input" @input="handleSearch" />
      </div>

      <div class="control-group">
        <label>分类:</label>
        <select v-model="selectedCategory" class="select" @change="handleCategoryChange">
          <option value="all">全部</option>
          <option value="login">登录</option>
          <option value="dashboard">仪表板</option>
          <option value="profile">个人资料</option>
        </select>
      </div>

      <div class="control-group">
        <label>设备:</label>
        <select v-model="selectedDevice" class="select" @change="handleDeviceChange">
          <option value="all">全部</option>
          <option value="desktop">桌面</option>
          <option value="tablet">平板</option>
          <option value="mobile">手机</option>
        </select>
      </div>

      <div class="control-group">
        <label>跳转到:</label>
        <input v-model.number="jumpToIndex" type="number" min="1" :max="filteredTemplates.length" class="jump-input" />
        <button class="btn" @click="jumpToItem">跳转</button>
      </div>

      <div class="control-group">
        <button class="btn" @click="scrollToTop">顶部</button>
        <button class="btn" @click="scrollToBottom">底部</button>
      </div>
    </div>

    <!-- 主要虚拟滚动演示 -->
    <div class="demo-section">
      <h2>🎯 高级虚拟滚动</h2>
      <p>支持搜索、过滤、跳转等功能的虚拟滚动列表。</p>

      <div
        ref="containerRef"
        class="virtual-container"
        :style="{ height: `${containerHeight}px` }"
        @scroll="handleScroll"
      >
        <div class="virtual-content" :style="{ height: `${totalHeight}px`, position: 'relative' }">
          <div
            v-for="item in visibleItems"
            :key="item.id"
            class="template-item"
            :style="{
              position: 'absolute',
              top: `${item.top}px`,
              height: `${itemHeight}px`,
              width: '100%',
              left: 0,
            }"
          >
            <div class="template-card">
              <div class="template-header">
                <h3 class="template-name">
                  {{ item.name }}
                </h3>
                <div class="template-meta">
                  <span class="template-category">{{ item.category }}</span>
                  <span class="template-device">{{ item.device }}</span>
                </div>
              </div>
              <p class="template-description">
                {{ item.description }}
              </p>
              <div class="template-footer">
                <span class="template-tag">{{ item.tags }}</span>
                <div class="template-stats">
                  <span class="rating">⭐ {{ item.rating }}</span>
                  <span class="downloads">📥 {{ item.downloads.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 简单虚拟滚动演示 -->
    <div class="demo-section">
      <h2>⚡ 简单虚拟滚动</h2>
      <p>轻量级虚拟滚动实现，适用于简单列表场景。</p>

      <div
        ref="simpleContainerRef"
        class="simple-virtual-container"
        :style="{ height: '400px' }"
        @scroll="simpleHandleScroll"
      >
        <div class="virtual-content" :style="{ height: `${simpleTotalHeight}px`, position: 'relative' }">
          <div
            v-for="item in simpleVisibleItems"
            :key="item.id"
            class="simple-item"
            :style="{
              position: 'absolute',
              top: `${item.top}px`,
              height: '80px',
              width: '100%',
              left: 0,
            }"
          >
            <div class="simple-card">
              <div class="simple-icon">🎨</div>
              <div class="simple-content">
                <h4>{{ item.name }}</h4>
                <p>{{ item.category }} - {{ item.device }}</p>
              </div>
              <div class="simple-rating">⭐ {{ item.rating }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="demo-section">
      <h2>📖 使用说明</h2>
      <div class="usage-code">
        <h3>基本用法</h3>
        <pre><code>import { useVirtualScroll } from '@ldesign/template/vue'

const {
  containerRef,
  visibleItems,
  totalHeight,
  handleScroll,
  scrollToItem,
} = useVirtualScroll(items, {
  containerHeight: 600,
  itemHeight: 120,
  buffer: 5,
})</code></pre>

        <h3>简单用法</h3>
        <pre><code>import { useSimpleVirtualScroll } from '@ldesign/template/vue'

const {
  containerRef,
  visibleItems,
  totalHeight,
  handleScroll,
} = useSimpleVirtualScroll(items, 80, 400)</code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.virtual-scroll-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;

  h1 {
    font-size: 36px;
    color: #333;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    color: #666;
    line-height: 1.6;
  }
}

.stats-panel {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  .stat-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: bold;
    color: #667eea;
  }
}

.controls-panel {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  align-items: end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 12px;
    color: #666;
    font-weight: 500;
  }
}

.search-input,
.jump-input,
.select {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
}

.search-input {
  width: 200px;
}

.jump-input {
  width: 80px;
}

.btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    border-color: #667eea;
  }
}

.demo-section {
  margin-bottom: 40px;

  h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #666;
    margin-bottom: 20px;
  }
}

.virtual-container,
.simple-virtual-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: auto;
  background: white;
}

.template-item {
  padding: 8px;
}

.template-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.template-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.template-meta {
  display: flex;
  gap: 8px;
}

.template-category,
.template-device {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
  background: #f1f3f4;
  color: #666;
}

.template-description {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin: 0 0 8px 0;
  flex: 1;
}

.template-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
  background: #667eea;
  color: white;
}

.template-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.simple-item {
  padding: 4px 8px;
}

.simple-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #eee;
  border-radius: 6px;
  height: 100%;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
    border-color: #667eea;
  }
}

.simple-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.simple-content {
  flex: 1;

  h4 {
    font-size: 14px;
    margin: 0 0 4px 0;
    color: #333;
  }

  p {
    font-size: 12px;
    color: #666;
    margin: 0;
  }
}

.simple-rating {
  font-size: 12px;
  color: #666;
}

.usage-code {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;

  h3 {
    margin-bottom: 12px;
    color: #333;
  }

  pre {
    background: #2d3748;
    color: #e2e8f0;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 20px;

    code {
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}
</style>
