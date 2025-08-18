<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from '@ldesign/router'
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Props {
  routeInfo?: {
    path: string
    name?: string
    params: Record<string, any>
    query: Record<string, any>
    hash: string
  }
}

defineProps<Props>()

const router = useRouter()
const route = useRoute()

// 从子路由 1 传递的数据
const fromChild1 = computed(() => route.value?.query?.fromChild1 === 'true')
const receivedCounter = computed(() => route.value?.query?.counter || '0')
const receivedInput = computed(() => route.value?.query?.input || '')
const receivedTimestamp = computed(() => {
  const timestamp = route.value?.query?.timestamp
  return timestamp
    ? new Date(Number.parseInt(timestamp as string)).toLocaleString()
    : ''
})

// 图表数据
const chartData = ref([65, 45, 80, 30, 95, 40, 75])

// 时钟
const currentTime = ref('')
const currentDate = ref('')
const clockRunning = ref(true)
let clockInterval: number | null = null

// 主题
const themes = [
  { name: '蓝色', primary: '#4299e1', secondary: '#bee3f8' },
  { name: '绿色', primary: '#48bb78', secondary: '#c6f6d5' },
  { name: '紫色', primary: '#9f7aea', secondary: '#e9d8fd' },
  { name: '红色', primary: '#f56565', secondary: '#fed7d7' },
]
const selectedTheme = ref(themes[0])

// 拖拽排序
const sortableItems = ref([
  { id: 1, text: '项目 1' },
  { id: 2, text: '项目 2' },
  { id: 3, text: '项目 3' },
  { id: 4, text: '项目 4' },
])
let draggedItem: any = null

// 进度条
const progress = ref(0)
let progressInterval: number | null = null

// 计算属性
const themeStyles = computed(() => ({
  backgroundColor: selectedTheme.value.secondary,
  borderColor: selectedTheme.value.primary,
}))

// 方法
function getBarColor(index: number) {
  const colors = [
    '#4299e1',
    '#48bb78',
    '#9f7aea',
    '#f56565',
    '#ed8936',
    '#38b2ac',
    '#805ad5',
  ]
  return colors[index % colors.length]
}

function refreshChart() {
  chartData.value = chartData.value.map(() => Math.floor(Math.random() * 100))
}

function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString()
  currentDate.value = now.toLocaleDateString()
}

function toggleClock() {
  clockRunning.value = !clockRunning.value
  if (clockRunning.value) {
    clockInterval = window.setInterval(updateClock, 1000)
  } else {
    if (clockInterval) {
      clearInterval(clockInterval)
      clockInterval = null
    }
  }
}

function selectTheme(theme: (typeof themes)[0]) {
  selectedTheme.value = theme
}

function handleDragStart(event: DragEvent, item: any) {
  draggedItem = item
}

function handleDrop(event: DragEvent, targetItem: any) {
  if (draggedItem && draggedItem.id !== targetItem.id) {
    const draggedIndex = sortableItems.value.findIndex(
      item => item.id === draggedItem.id
    )
    const targetIndex = sortableItems.value.findIndex(
      item => item.id === targetItem.id
    )

    // 交换位置
    const temp = sortableItems.value[draggedIndex]
    sortableItems.value[draggedIndex] = sortableItems.value[targetIndex]
    sortableItems.value[targetIndex] = temp
  }
  draggedItem = null
}

function startProgress() {
  if (progressInterval) return

  progress.value = 0
  progressInterval = window.setInterval(() => {
    progress.value += 2
    if (progress.value >= 100) {
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
    }
  }, 100)
}

function resetProgress() {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  progress.value = 0
}

function navigateToParent() {
  router.push('/nested')
}

// 生命周期
onMounted(() => {
  updateClock()
  clockInterval = window.setInterval(updateClock, 1000)
  // Child2 组件已挂载
})

onUnmounted(() => {
  if (clockInterval) {
    clearInterval(clockInterval)
  }
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  // Child2 组件已卸载
})
</script>

<template>
  <div class="nested-child2">
    <div class="header-section">
      <h3>🚀 子路由 2</h3>
      <p>这是第二个子路由组件，展示更复杂的嵌套路由功能。</p>
    </div>

    <div v-if="fromChild1" class="state-section">
      <div class="alert alert-info">
        <h4>📨 来自子路由 1 的数据</h4>
        <div class="received-data">
          <div class="data-item">
            <strong>计数器值:</strong> {{ receivedCounter }}
          </div>
          <div class="data-item">
            <strong>输入内容:</strong> {{ receivedInput || '无' }}
          </div>
          <div class="data-item">
            <strong>传递时间:</strong> {{ receivedTimestamp }}
          </div>
        </div>
      </div>
    </div>

    <div class="feature-showcase">
      <h4>功能展示</h4>
      <div class="showcase-grid">
        <div class="showcase-card">
          <h5>📊 数据图表</h5>
          <div class="chart-container">
            <div
              v-for="(value, index) in chartData"
              :key="index"
              class="chart-bar"
            >
              <div
                class="bar"
                :style="{
                  height: `${value}%`,
                  backgroundColor: getBarColor(index),
                }"
              />
              <span class="bar-label">{{ value }}%</span>
            </div>
          </div>
          <button class="btn btn-sm btn-primary" @click="refreshChart">
            刷新数据
          </button>
        </div>

        <div class="showcase-card">
          <h5>⏱️ 实时时钟</h5>
          <div class="clock-display">
            <div class="time">
              {{ currentTime }}
            </div>
            <div class="date">
              {{ currentDate }}
            </div>
          </div>
          <div class="clock-controls">
            <button class="btn btn-sm btn-secondary" @click="toggleClock">
              {{ clockRunning ? '暂停' : '启动' }}
            </button>
          </div>
        </div>

        <div class="showcase-card">
          <h5>🎨 主题切换</h5>
          <div class="theme-selector">
            <div class="theme-options">
              <button
                v-for="theme in themes"
                :key="theme.name"
                class="theme-option"
                :class="{ active: selectedTheme.name === theme.name }"
                :style="{ backgroundColor: theme.primary }"
                @click="selectTheme(theme)"
              >
                {{ theme.name }}
              </button>
            </div>
            <div class="theme-preview" :style="themeStyles">
              <div class="preview-header">预览</div>
              <div class="preview-content">当前主题效果</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="interaction-section">
      <h4>交互测试</h4>
      <div class="interaction-demos">
        <div class="demo-item">
          <label>拖拽排序:</label>
          <div class="sortable-list">
            <div
              v-for="item in sortableItems"
              :key="item.id"
              class="sortable-item"
              draggable="true"
              @dragstart="handleDragStart($event, item)"
              @dragover.prevent
              @drop="handleDrop($event, item)"
            >
              {{ item.text }}
            </div>
          </div>
        </div>

        <div class="demo-item">
          <label>进度条:</label>
          <div class="progress-demo">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${progress}%` }" />
            </div>
            <div class="progress-controls">
              <button class="btn btn-sm btn-success" @click="startProgress">
                开始
              </button>
              <button class="btn btn-sm btn-warning" @click="resetProgress">
                重置
              </button>
            </div>
            <span class="progress-text">{{ progress }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="navigation-section">
      <h4>导航操作</h4>
      <div class="nav-actions">
        <RouterLink to="/nested" class="btn btn-primary">
          返回默认页面
        </RouterLink>
        <RouterLink to="/nested/child1" class="btn btn-secondary">
          前往子路由 1
        </RouterLink>
        <button class="btn btn-info" @click="navigateToParent">
          返回父路由
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.nested-child2 {
  padding: @spacing-lg;
}

.header-section {
  text-align: center;
  margin-bottom: @spacing-xl;

  h3 {
    color: @info-color;
    margin-bottom: @spacing-md;
    font-size: @font-size-xl;
  }

  p {
    color: @gray-600;
    line-height: 1.6;
  }
}

.alert {
  padding: @spacing-md;
  border-radius: @border-radius-md;
  margin-bottom: @spacing-xl;

  &-info {
    background: fade(@info-color, 10%);
    border: 1px solid fade(@info-color, 30%);
    color: @info-color;
  }

  h4 {
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }
}

.received-data {
  font-size: @font-size-sm;
}

.data-item {
  margin-bottom: @spacing-sm;

  &:last-child {
    margin-bottom: 0;
  }

  strong {
    margin-right: @spacing-sm;
  }
}

.feature-showcase {
  margin-bottom: @spacing-xl;

  h4 {
    color: @gray-800;
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: @spacing-lg;
}

.showcase-card {
  background: @gray-50;
  padding: @spacing-md;
  border-radius: @border-radius-md;
  border-left: 4px solid @info-color;

  h5 {
    color: @gray-800;
    margin-bottom: @spacing-md;
    font-size: @font-size-base;
  }
}

.chart-container {
  display: flex;
  align-items: end;
  height: 120px;
  gap: @spacing-xs;
  margin-bottom: @spacing-md;
  padding: @spacing-sm;
  background: white;
  border-radius: @border-radius-sm;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar {
  width: 100%;
  min-height: 10px;
  border-radius: @border-radius-sm @border-radius-sm 0 0;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: @font-size-sm;
  color: @gray-600;
  margin-top: @spacing-xs;
}

.clock-display {
  text-align: center;
  margin-bottom: @spacing-md;

  .time {
    font-size: @font-size-2xl;
    font-weight: 600;
    color: @gray-800;
    font-family: monospace;
  }

  .date {
    font-size: @font-size-sm;
    color: @gray-600;
  }
}

.theme-options {
  display: flex;
  gap: @spacing-xs;
  margin-bottom: @spacing-md;
}

.theme-option {
  padding: @spacing-xs @spacing-sm;
  border: none;
  border-radius: @border-radius-sm;
  color: white;
  cursor: pointer;
  font-size: @font-size-sm;
  transition: all @transition-base;

  &:hover {
    transform: translateY(-1px);
  }

  &.active {
    box-shadow: 0 0 0 2px @gray-800;
  }
}

.theme-preview {
  padding: @spacing-sm;
  border-radius: @border-radius-sm;
  border: 2px solid;

  .preview-header {
    font-weight: 600;
    margin-bottom: @spacing-xs;
  }

  .preview-content {
    font-size: @font-size-sm;
    opacity: 0.8;
  }
}

.interaction-section {
  margin-bottom: @spacing-xl;

  h4 {
    color: @gray-800;
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }
}

.interaction-demos {
  display: grid;
  gap: @spacing-lg;
}

.demo-item {
  label {
    display: block;
    font-weight: 500;
    color: @gray-700;
    margin-bottom: @spacing-sm;
  }
}

.sortable-list {
  display: flex;
  gap: @spacing-sm;
  flex-wrap: wrap;
}

.sortable-item {
  padding: @spacing-sm @spacing-md;
  background: @primary-color;
  color: white;
  border-radius: @border-radius-md;
  cursor: move;
  user-select: none;
  transition: all @transition-base;

  &:hover {
    transform: translateY(-2px);
    box-shadow: @shadow-md;
  }
}

.progress-demo {
  display: flex;
  align-items: center;
  gap: @spacing-md;
}

.progress-bar {
  flex: 1;
  height: 20px;
  background: @gray-200;
  border-radius: @border-radius-md;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, @success-color, @info-color);
  transition: width 0.1s ease;
}

.progress-controls {
  display: flex;
  gap: @spacing-xs;
}

.progress-text {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: @gray-700;
}

.navigation-section {
  h4 {
    color: @gray-800;
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }
}

.nav-actions {
  display: flex;
  gap: @spacing-md;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .showcase-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 80px;
  }

  .progress-demo {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-actions {
    flex-direction: column;
  }

  .nav-actions .btn {
    width: 100%;
  }
}
</style>
