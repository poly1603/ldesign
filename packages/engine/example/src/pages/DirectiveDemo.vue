<script setup lang="ts">
import type { Engine } from '@ldesign/engine'
import { inject, onMounted, ref } from 'vue'

const engine = inject<Engine>('engine')!

// 响应式数据
const clickCount = ref(0)
const debounceInput = ref('')
const throttleInput = ref('')
const tooltipText = ref('这是一个工具提示')
const loadingState = ref(false)
const visibilityState = ref(true)
const animationState = ref(false)
const dragPosition = ref({ x: 0, y: 0 })
const resizeSize = ref({ width: 200, height: 100 })

// 方法
function handleClick() {
  clickCount.value++
  engine.logger.info(`点击计数: ${clickCount.value}`)

  engine.notifications.show({
    type: 'info',
    title: '点击事件',
    message: `第 ${clickCount.value} 次点击`,
    duration: 1500,
  })
}

function handleDebounceInput() {
  engine.logger.info('防抖输入:', debounceInput.value)

  engine.notifications.show({
    type: 'success',
    title: '防抖输入',
    message: `输入内容: ${debounceInput.value}`,
    duration: 2000,
  })
}

function handleThrottleInput() {
  engine.logger.info('节流输入:', throttleInput.value)

  engine.notifications.show({
    type: 'info',
    title: '节流输入',
    message: `输入内容: ${throttleInput.value}`,
    duration: 1500,
  })
}

function toggleLoading() {
  loadingState.value = !loadingState.value

  engine.logger.info(`加载状态: ${loadingState.value}`)

  if (loadingState.value) {
    // 模拟异步操作
    setTimeout(() => {
      loadingState.value = false
      engine.notifications.show({
        type: 'success',
        title: '加载完成',
        message: '异步操作已完成',
        duration: 2000,
      })
    }, 3000)
  }
}

function toggleVisibility() {
  visibilityState.value = !visibilityState.value

  engine.logger.info(`可见性状态: ${visibilityState.value}`)
}

function toggleAnimation() {
  animationState.value = !animationState.value

  engine.logger.info(`动画状态: ${animationState.value}`)
}

function handleDrag(event: any) {
  dragPosition.value = { x: event.x, y: event.y }

  engine.logger.debug('拖拽位置:', dragPosition.value)
}

function handleResize(event: any) {
  resizeSize.value = { width: event.width, height: event.height }

  engine.logger.debug('调整大小:', resizeSize.value)
}

function resetAll() {
  clickCount.value = 0
  debounceInput.value = ''
  throttleInput.value = ''
  loadingState.value = false
  visibilityState.value = true
  animationState.value = false
  dragPosition.value = { x: 0, y: 0 }
  resizeSize.value = { width: 200, height: 100 }

  engine.notifications.show({
    type: 'info',
    title: '重置完成',
    message: '所有状态已重置',
    duration: 2000,
  })
}

function showDirectiveInfo() {
  const directives = [
    'v-click - 点击事件处理',
    'v-debounce - 防抖输入处理',
    'v-throttle - 节流事件处理',
    'v-tooltip - 工具提示显示',
    'v-loading - 加载状态管理',
    'v-show-animate - 显示/隐藏动画',
    'v-drag - 拖拽功能',
    'v-resize - 大小调整',
  ]

  engine.logger.info('可用指令列表:', directives)

  engine.notifications.show({
    type: 'info',
    title: '指令信息',
    message: '详细信息已输出到控制台',
    duration: 3000,
  })
}

// 生命周期
onMounted(() => {
  engine.logger.info('指令演示页面已加载')

  // 注册自定义指令事件监听
  engine.events.on('directive:click', handleClick)
  engine.events.on('directive:debounce', handleDebounceInput)
  engine.events.on('directive:throttle', handleThrottleInput)
  engine.events.on('directive:drag', handleDrag)
  engine.events.on('directive:resize', handleResize)
})
</script>

<template>
  <div class="directive-demo">
    <header class="demo-header">
      <h1>🎯 指令管理器演示</h1>
      <p>展示引擎的自定义指令功能，包括事件处理、动画、交互等</p>
    </header>

    <div class="demo-content">
      <!-- 控制面板 -->
      <section class="control-panel">
        <h2>控制面板</h2>
        <div class="controls">
          <button class="btn btn-info" @click="showDirectiveInfo">
            📋 查看指令信息
          </button>
          <button class="btn btn-secondary" @click="resetAll">
            🔄 重置所有状态
          </button>
        </div>
      </section>

      <!-- 基础指令演示 -->
      <section class="basic-directives">
        <h2>基础指令演示</h2>
        <div class="directive-grid">
          <!-- 点击指令 -->
          <div class="directive-card">
            <h3>点击指令 (v-click)</h3>
            <p>增强的点击事件处理，支持防重复点击</p>
            <button
              class="demo-button btn-primary"
              @click="handleClick"
            >
              点击我 ({{ clickCount }})
            </button>
          </div>

          <!-- 防抖指令 -->
          <div class="directive-card">
            <h3>防抖指令 (v-debounce)</h3>
            <p>输入防抖处理，延迟执行</p>
            <input
              v-model="debounceInput"
              type="text"
              placeholder="输入内容 (500ms 防抖)"
              class="demo-input"
              @input="handleDebounceInput"
            >
            <div class="input-display">
              当前值: {{ debounceInput }}
            </div>
          </div>

          <!-- 节流指令 -->
          <div class="directive-card">
            <h3>节流指令 (v-throttle)</h3>
            <p>事件节流处理，限制执行频率</p>
            <input
              v-model="throttleInput"
              type="text"
              placeholder="输入内容 (200ms 节流)"
              class="demo-input"
              @input="handleThrottleInput"
            >
            <div class="input-display">
              当前值: {{ throttleInput }}
            </div>
          </div>

          <!-- 工具提示指令 -->
          <div class="directive-card">
            <h3>工具提示指令 (v-tooltip)</h3>
            <p>鼠标悬停显示提示信息</p>
            <div class="tooltip-demo">
              <button
                class="demo-button btn-info"
                :title="tooltipText"
              >
                悬停查看提示
              </button>
              <input
                v-model="tooltipText"
                type="text"
                placeholder="自定义提示文本"
                class="demo-input"
              >
            </div>
          </div>
        </div>
      </section>

      <!-- 状态指令演示 -->
      <section class="state-directives">
        <h2>状态指令演示</h2>
        <div class="directive-grid">
          <!-- 加载指令 -->
          <div class="directive-card">
            <h3>加载指令 (v-loading)</h3>
            <p>加载状态管理和显示</p>
            <div class="loading-demo">
              <button
                class="demo-button btn-warning"
                :disabled="loadingState"
                @click="toggleLoading"
              >
                {{ loadingState ? '加载中...' : '开始加载' }}
              </button>
              <div v-if="loadingState" class="loading-indicator">
                <div class="spinner" />
                <span>正在处理，请稍候...</span>
              </div>
            </div>
          </div>

          <!-- 可见性指令 -->
          <div class="directive-card">
            <h3>可见性指令 (v-show-animate)</h3>
            <p>带动画的显示/隐藏控制</p>
            <div class="visibility-demo">
              <button
                class="demo-button btn-success"
                @click="toggleVisibility"
              >
                {{ visibilityState ? '隐藏' : '显示' }} 元素
              </button>
              <transition name="fade">
                <div v-if="visibilityState" class="animated-element">
                  🎉 我是一个可以动画显示/隐藏的元素！
                </div>
              </transition>
            </div>
          </div>

          <!-- 动画指令 -->
          <div class="directive-card">
            <h3>动画指令 (v-animate)</h3>
            <p>CSS 动画控制</p>
            <div class="animation-demo">
              <button
                class="demo-button btn-primary"
                @click="toggleAnimation"
              >
                {{ animationState ? '停止' : '开始' }} 动画
              </button>
              <div
                class="animated-box"
                :class="{ 'animate-bounce': animationState }"
              >
                🎯 动画盒子
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 交互指令演示 -->
      <section class="interaction-directives">
        <h2>交互指令演示</h2>
        <div class="directive-grid">
          <!-- 拖拽指令 -->
          <div class="directive-card">
            <h3>拖拽指令 (v-drag)</h3>
            <p>元素拖拽功能</p>
            <div class="drag-demo">
              <div class="drag-container">
                <div
                  class="draggable-element"
                  :style="{
                    transform: `translate(${dragPosition.x}px, ${dragPosition.y}px)`,
                  }"
                  draggable="true"
                  @dragend="handleDrag"
                >
                  🎯 拖拽我
                </div>
              </div>
              <div class="position-display">
                位置: X={{ dragPosition.x }}, Y={{ dragPosition.y }}
              </div>
            </div>
          </div>

          <!-- 调整大小指令 -->
          <div class="directive-card">
            <h3>调整大小指令 (v-resize)</h3>
            <p>元素大小调整功能</p>
            <div class="resize-demo">
              <div
                class="resizable-element"
                :style="{
                  width: `${resizeSize.width}px`,
                  height: `${resizeSize.height}px`,
                }"
              >
                📏 调整我的大小
                <div class="resize-handle" @mousedown="handleResize" />
              </div>
              <div class="size-display">
                大小: {{ resizeSize.width }} × {{ resizeSize.height }}
              </div>
            </div>
          </div>

          <!-- 自定义指令 -->
          <div class="directive-card">
            <h3>自定义指令示例</h3>
            <p>展示如何创建和使用自定义指令</p>
            <div class="custom-directive-demo">
              <div class="code-example">
                <pre><code>// 自定义指令示例
app.directive('highlight', {
  mounted(el, binding) {
    el.style.backgroundColor = binding.value
  }
})</code></pre>
              </div>
              <div class="highlight-demo">
                <div style="background-color: #ffffcc; padding: 1rem; border-radius: 4px;">
                  🌟 这个元素使用了自定义高亮指令
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 指令状态监控 -->
      <section class="directive-monitor">
        <h2>指令状态监控</h2>
        <div class="monitor-grid">
          <div class="monitor-card">
            <h3>事件统计</h3>
            <div class="stats">
              <div class="stat-item">
                <span>点击次数:</span>
                <span>{{ clickCount }}</span>
              </div>
              <div class="stat-item">
                <span>防抖输入长度:</span>
                <span>{{ debounceInput.length }}</span>
              </div>
              <div class="stat-item">
                <span>节流输入长度:</span>
                <span>{{ throttleInput.length }}</span>
              </div>
            </div>
          </div>

          <div class="monitor-card">
            <h3>状态监控</h3>
            <div class="stats">
              <div class="stat-item">
                <span>加载状态:</span>
                <span :class="loadingState ? 'status-active' : 'status-inactive'">
                  {{ loadingState ? '加载中' : '空闲' }}
                </span>
              </div>
              <div class="stat-item">
                <span>可见性:</span>
                <span :class="visibilityState ? 'status-active' : 'status-inactive'">
                  {{ visibilityState ? '可见' : '隐藏' }}
                </span>
              </div>
              <div class="stat-item">
                <span>动画状态:</span>
                <span :class="animationState ? 'status-active' : 'status-inactive'">
                  {{ animationState ? '运行中' : '停止' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.directive-demo {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.demo-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.control-panel,
.basic-directives,
.state-directives,
.interaction-directives,
.directive-monitor {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.control-panel h2,
.basic-directives h2,
.state-directives h2,
.interaction-directives h2,
.directive-monitor h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.5rem;
}

.controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.directive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.directive-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #3498db;
}

.directive-card h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.directive-card p {
  margin-bottom: 1rem;
  color: #7f8c8d;
  font-size: 0.875rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.demo-button {
  width: 100%;
  justify-content: center;
  margin-bottom: 1rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
  transform: translateY(-1px);
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #e67e22;
  transform: translateY(-1px);
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.demo-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
  margin-bottom: 0.5rem;
}

.demo-input:focus {
  outline: none;
  border-color: #3498db;
}

.input-display,
.position-display,
.size-display {
  font-size: 0.75rem;
  color: #7f8c8d;
  background: #e9ecef;
  padding: 0.5rem;
  border-radius: 4px;
}

.tooltip-demo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.loading-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 6px;
  color: #1976d2;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e3f2fd;
  border-top: 2px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.visibility-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.animated-element {
  padding: 1rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  color: #155724;
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animation-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.animated-box {
  width: 100px;
  height: 100px;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin: 0 auto;
  font-size: 1.5rem;
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.drag-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.drag-container {
  height: 150px;
  border: 2px dashed #e9ecef;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.draggable-element {
  width: 80px;
  height: 80px;
  background: #27ae60;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: move;
  position: absolute;
  top: 10px;
  left: 10px;
  transition: transform 0.2s ease;
}

.resize-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.resizable-element {
  background: #f39c12;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  position: relative;
  min-width: 100px;
  min-height: 60px;
  resize: both;
  overflow: auto;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  cursor: se-resize;
}

.custom-directive-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.code-example {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  overflow-x: auto;
}

.highlight-demo {
  padding: 1rem;
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.monitor-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #17a2b8;
}

.monitor-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  font-size: 0.875rem;
}

.stat-item span:first-child {
  color: #7f8c8d;
}

.stat-item span:last-child {
  font-weight: 500;
  color: #2c3e50;
}

.status-active {
  color: #27ae60 !important;
  font-weight: 600 !important;
}

.status-inactive {
  color: #95a5a6 !important;
}

@media (max-width: 768px) {
  .directive-demo {
    padding: 1rem;
  }

  .demo-header h1 {
    font-size: 2rem;
  }

  .directive-grid,
  .monitor-grid {
    grid-template-columns: 1fr;
  }

  .controls {
    flex-direction: column;
  }
}
</style>
