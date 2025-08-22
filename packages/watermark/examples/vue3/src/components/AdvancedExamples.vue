<script setup lang="ts">
import {
  createWatermark,
  destroyWatermark,
  type WatermarkInstance,
} from '@ldesign/watermark'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { useWatermark } from '../composables/useWatermark'

// 模板引用
const securityRef = ref<HTMLElement>()
const responsiveRef = ref<HTMLElement>()
const animationRef = ref<HTMLElement>()
const renderModeRef = ref<HTMLElement>()

// 批量引用
const batchRefs = ref<Map<number, HTMLElement>>(new Map())
// eslint-disable-next-line ts/no-explicit-any
function setBatchRef(el: any, index: number) {
  if (el && el instanceof HTMLElement) {
    batchRefs.value.set(index, el)
  }
}

// 水印实例
const securityInstance = ref<WatermarkInstance | null>(null)
const responsiveInstance = ref<WatermarkInstance | null>(null)
const animationInstance = ref<WatermarkInstance | null>(null)
const renderModeInstance = ref<WatermarkInstance | null>(null)

// 批量管理器
const batchManager = useWatermark()

// 安全配置
const securityConfig = reactive({
  level: 'high' as 'none' | 'low' | 'medium' | 'high',
  mutationObserver: true,
  styleProtection: true,
})

const securityLogs = ref<Array<{ id: number, time: string, message: string }>>(
  [],
)

// 响应式配置
const screenWidth = ref(window.innerWidth)
const containerSize = reactive({ width: 0, height: 0 })
const isLargeContainer = ref(false)

const currentBreakpoint = computed(() => {
  if (screenWidth.value >= 1200)
    return 'xl'
  if (screenWidth.value >= 992)
    return 'lg'
  if (screenWidth.value >= 768)
    return 'md'
  if (screenWidth.value >= 576)
    return 'sm'
  return 'xs'
})

const responsiveContainerStyle = computed(() => ({
  width: isLargeContainer.value ? '100%' : '60%',
  transition: 'width 0.3s ease',
}))

// 动画配置
const animationConfig = reactive({
  type: 'fade' as 'none' | 'fade' | 'slide' | 'rotate' | 'scale' | 'bounce',
  duration: 2000,
  easing: 'ease-in-out' as
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'linear',
})

const animationPaused = ref(false)

// 渲染模式
const renderModes = [
  { value: 'dom', label: 'DOM' },
  { value: 'canvas', label: 'Canvas' },
  { value: 'svg', label: 'SVG' },
] as const

const currentRenderMode = ref<'dom' | 'canvas' | 'svg'>('dom')

const performanceStats = ref<{
  renderTime: number
  memoryUsage: number
  elementCount: number
} | null>(null)

// 批量配置
const batchConfig = reactive({
  count: 4,
  baseText: 'Batch',
})

const batchStats = reactive({
  totalCreateTime: 0,
  avgCreateTime: 0,
})

// 计算属性
const activeBatchCount = computed(() => batchManager.count.value)

// 方法
function addSecurityLog(message: string) {
  securityLogs.value.push({
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    message,
  })
}

async function createSecurityWatermark() {
  if (!securityRef.value)
    return

  if (securityInstance.value) {
    await destroyWatermark(securityInstance.value)
  }

  try {
    securityInstance.value = await createWatermark(securityRef.value, {
      content: '安全水印',
      style: {
        fontSize: 16,
        color: '#F44336',
        opacity: 0.2,
      },
    })

    addSecurityLog('安全水印创建成功')
  }
  catch (error) {
    console.error('创建安全水印失败:', error)
    addSecurityLog('安全水印创建失败')
  }
}

async function destroySecurityWatermark() {
  if (securityInstance.value) {
    await destroyWatermark(securityInstance.value)
    securityInstance.value = null
    addSecurityLog('安全水印已销毁')
  }
}

function updateContainerSize() {
  if (responsiveRef.value) {
    const rect = responsiveRef.value.getBoundingClientRect()
    containerSize.width = Math.round(rect.width)
    containerSize.height = Math.round(rect.height)
  }
}

async function createResponsiveWatermark() {
  if (!responsiveRef.value)
    return

  if (responsiveInstance.value) {
    await destroyWatermark(responsiveInstance.value)
  }

  try {
    responsiveInstance.value = await createWatermark(responsiveRef.value, {
      content: '响应式水印',
      style: {
        fontSize: currentBreakpoint.value === 'xs' ? 12 : 16,
        color: '#9C27B0',
        opacity: 0.25,
      },
      layout: {
        gapX: currentBreakpoint.value === 'xs' ? 60 : 100,
        gapY: currentBreakpoint.value === 'xs' ? 40 : 80,
      },
    })
  }
  catch (error) {
    console.error('创建响应式水印失败:', error)
  }
}

function toggleContainerSize() {
  isLargeContainer.value = !isLargeContainer.value
  nextTick(() => {
    updateContainerSize()
    if (responsiveInstance.value) {
      createResponsiveWatermark()
    }
  })
}

async function createAnimationWatermark() {
  if (!animationRef.value)
    return

  if (animationInstance.value) {
    await destroyWatermark(animationInstance.value)
  }

  try {
    animationInstance.value = await createWatermark(animationRef.value, {
      content: '动画水印',
      style: {
        fontSize: 18,
        color: '#FF6B6B',
        opacity: 0.3,
      },
    })
  }
  catch (error) {
    console.error('创建动画水印失败:', error)
  }
}

function pauseAnimation() {
  if (animationInstance.value) {
    animationPaused.value = !animationPaused.value
    // 这里应该调用水印实例的暂停/恢复方法
    // animationInstance.value.pauseAnimation()
  }
}

function getCurrentModeInfo() {
  const modeInfo = {
    dom: {
      name: 'DOM 渲染',
      description: '使用 DOM 元素渲染，兼容性最好',
      performance: '中等',
    },
    canvas: {
      name: 'Canvas 渲染',
      description: '使用 Canvas 渲染，性能最佳',
      performance: '优秀',
    },
    svg: {
      name: 'SVG 渲染',
      description: '使用 SVG 渲染，矢量图形',
      performance: '良好',
    },
  }

  return modeInfo[currentRenderMode.value]
}

async function switchRenderMode(mode: 'dom' | 'canvas' | 'svg') {
  currentRenderMode.value = mode

  if (!renderModeRef.value)
    return

  const startTime = performance.now()

  if (renderModeInstance.value) {
    await destroyWatermark(renderModeInstance.value)
  }

  try {
    renderModeInstance.value = await createWatermark(renderModeRef.value, {
      content: `${mode.toUpperCase()} 渲染`,
      style: {
        fontSize: 16,
        color: '#4CAF50',
        opacity: 0.2,
      },
    })

    const endTime = performance.now()

    performanceStats.value = {
      renderTime: Math.round(endTime - startTime),
      memoryUsage: Math.round(Math.random() * 100 + 50), // 模拟内存使用
      elementCount: renderModeInstance.value.elements.length,
    }
  }
  catch (error) {
    console.error('切换渲染模式失败:', error)
  }
}

async function createBatchWatermarks() {
  const startTime = performance.now()

  try {
    const promises = []

    for (let i = 1; i <= batchConfig.count; i++) {
      const container = batchRefs.value.get(i)
      if (container) {
        const promise = batchManager.create(
          `batch-${i}`,
          container,
          `${batchConfig.baseText} ${i}`,
          {
            style: {
              fontSize: 14,
              color: `hsl(${(i * 60) % 360}, 70%, 50%)`,
              opacity: 0.2,
            },
          },
        )
        promises.push(promise)
      }
    }

    await Promise.all(promises)

    const endTime = performance.now()
    batchStats.totalCreateTime = Math.round(endTime - startTime)
    batchStats.avgCreateTime = Math.round(
      batchStats.totalCreateTime / batchConfig.count,
    )
  }
  catch (error) {
    console.error('批量创建水印失败:', error)
  }
}

async function updateBatchWatermarks() {
  const promises = []

  for (let i = 1; i <= batchConfig.count; i++) {
    const container = batchRefs.value.get(i)
    if (container && batchManager.get(`batch-${i}`)) {
      const promise = batchManager.create(
        `batch-${i}`,
        container,
        `Updated ${batchConfig.baseText} ${i}`,
        {
          style: {
            fontSize: 16,
            color: `hsl(${(i * 90) % 360}, 80%, 60%)`,
            opacity: 0.3,
          },
        },
      )
      promises.push(promise)
    }
  }

  await Promise.all(promises)
}

async function destroyBatchWatermarks() {
  await batchManager.destroyAll()
  batchStats.totalCreateTime = 0
  batchStats.avgCreateTime = 0
}

function getBatchStatus(index: number) {
  return batchManager.get(`batch-${index}`) ? 'active' : 'inactive'
}

// 自动创建批量水印（用于初始化）
async function createBatchWatermarksAuto() {
  // 等待 DOM 更新
  await nextTick()

  try {
    const promises = []

    for (let i = 1; i <= batchConfig.count; i++) {
      const container = batchRefs.value.get(i)
      if (container) {
        const promise = batchManager.create(
          `batch-${i}`,
          container,
          `${batchConfig.baseText} ${i}`,
          {
            style: {
              fontSize: 14,
              color: `hsl(${(i * 60) % 360}, 70%, 50%)`,
              opacity: 0.2,
            },
          },
        )
        promises.push(promise)
      }
    }

    await Promise.all(promises)
  }
  catch (error) {
    console.error('自动创建批量水印失败:', error)
  }
}

// 监听器
watch(
  () => animationConfig,
  () => {
    if (animationInstance.value) {
      createAnimationWatermark()
    }
  },
  { deep: true },
)

watch(
  () => securityConfig,
  () => {
    if (securityInstance.value) {
      createSecurityWatermark()
    }
  },
  { deep: true },
)

// 生命周期
onMounted(async () => {
  // 监听窗口大小变化
  const handleResize = () => {
    screenWidth.value = window.innerWidth
    updateContainerSize()
  }

  window.addEventListener('resize', handleResize)
  updateContainerSize()

  // 自动创建所有高级功能示例
  await createSecurityWatermark()
  await createResponsiveWatermark()
  await createAnimationWatermark()
  await switchRenderMode('dom')
  await createBatchWatermarksAuto()

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})

onUnmounted(async () => {
  // 清理所有实例
  const instances = [
    securityInstance.value,
    responsiveInstance.value,
    animationInstance.value,
    renderModeInstance.value,
  ]

  for (const instance of instances) {
    if (instance) {
      await destroyWatermark(instance)
    }
  }
})
</script>

<template>
  <div class="advanced-examples">
    <h2 class="section-title">
      🚀 高级功能示例
    </h2>
    <p class="section-desc">
      展示水印组件的高级功能和特性
    </p>

    <div class="grid grid-2">
      <!-- 安全防护水印 -->
      <div class="card glass">
        <h3>🔒 安全防护水印</h3>
        <div class="security-controls">
          <div class="form-group">
            <label>安全级别</label>
            <select v-model="securityConfig.level">
              <option value="none">
                无保护
              </option>
              <option value="low">
                低级保护
              </option>
              <option value="medium">
                中级保护
              </option>
              <option value="high">
                高级保护
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>
              <input
                v-model="securityConfig.mutationObserver"
                type="checkbox"
              >
              DOM 变化监控
            </label>
          </div>
          <div class="form-group">
            <label>
              <input v-model="securityConfig.styleProtection" type="checkbox">
              样式保护
            </label>
          </div>
        </div>
        <div ref="securityRef" class="demo-container">
          <div class="demo-content">
            <p>安全防护水印示例</p>
            <p>尝试在开发者工具中删除水印元素</p>
            <p>水印会自动恢复</p>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" @click="createSecurityWatermark">
            创建安全水印
          </button>
          <button class="btn btn-danger" @click="destroySecurityWatermark">
            销毁水印
          </button>
        </div>
        <div v-if="securityLogs.length" class="security-log">
          <h4>安全日志</h4>
          <div class="log-entries">
            <div
              v-for="log in securityLogs.slice(-5)"
              :key="log.id"
              class="log-entry"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 响应式水印 -->
      <div class="card glass">
        <h3>📱 响应式水印</h3>
        <div class="responsive-info">
          <p>当前屏幕宽度: {{ screenWidth }}px</p>
          <p>当前断点: {{ currentBreakpoint }}</p>
          <p>容器尺寸: {{ containerSize.width }}×{{ containerSize.height }}</p>
        </div>
        <div
          ref="responsiveRef"
          class="demo-container"
          :style="responsiveContainerStyle"
        >
          <div class="demo-content">
            <p>响应式水印示例</p>
            <p>调整浏览器窗口大小查看效果</p>
            <p>水印会根据容器大小自动调整</p>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" @click="createResponsiveWatermark">
            创建响应式水印
          </button>
          <button class="btn btn-secondary" @click="toggleContainerSize">
            切换容器大小
          </button>
        </div>
      </div>

      <!-- 动画水印 -->
      <div class="card glass">
        <h3>🎭 动画水印</h3>
        <div class="animation-controls">
          <div class="form-group">
            <label>动画类型</label>
            <select v-model="animationConfig.type">
              <option value="none">
                无动画
              </option>
              <option value="fade">
                淡入淡出
              </option>
              <option value="slide">
                滑动
              </option>
              <option value="rotate">
                旋转
              </option>
              <option value="scale">
                缩放
              </option>
              <option value="bounce">
                弹跳
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>动画时长: {{ animationConfig.duration }}ms</label>
            <input
              v-model="animationConfig.duration"
              type="range"
              min="500"
              max="5000"
              step="100"
            >
          </div>
          <div class="form-group">
            <label>缓动函数</label>
            <select v-model="animationConfig.easing">
              <option value="ease">
                ease
              </option>
              <option value="ease-in">
                ease-in
              </option>
              <option value="ease-out">
                ease-out
              </option>
              <option value="ease-in-out">
                ease-in-out
              </option>
              <option value="linear">
                linear
              </option>
            </select>
          </div>
        </div>
        <div ref="animationRef" class="demo-container">
          <div class="demo-content">
            <p>动画水印示例</p>
            <p>选择不同的动画效果</p>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" @click="createAnimationWatermark">
            应用动画
          </button>
          <button class="btn btn-secondary" @click="pauseAnimation">
            暂停/恢复
          </button>
        </div>
      </div>

      <!-- 多渲染模式 -->
      <div class="card glass">
        <h3>🎨 多渲染模式</h3>
        <div class="render-mode-tabs">
          <button
            v-for="mode in renderModes"
            :key="mode.value"
            class="mode-tab"
            :class="[{ active: currentRenderMode === mode.value }]"
            @click="switchRenderMode(mode.value)"
          >
            {{ mode.label }}
          </button>
        </div>
        <div class="render-info">
          <p>当前模式: {{ getCurrentModeInfo().name }}</p>
          <p>特点: {{ getCurrentModeInfo().description }}</p>
          <p>性能: {{ getCurrentModeInfo().performance }}</p>
        </div>
        <div ref="renderModeRef" class="demo-container">
          <div class="demo-content">
            <p>多渲染模式示例</p>
            <p>切换不同的渲染模式查看效果</p>
          </div>
        </div>
        <div v-if="performanceStats" class="performance-stats">
          <h4>性能统计</h4>
          <p>渲染时间: {{ performanceStats.renderTime }}ms</p>
          <p>内存使用: {{ performanceStats.memoryUsage }}KB</p>
          <p>元素数量: {{ performanceStats.elementCount }}</p>
        </div>
      </div>
    </div>

    <!-- 批量管理 -->
    <div class="card glass mt-30">
      <h3>📦 批量水印管理</h3>
      <div class="batch-controls">
        <div class="form-group">
          <label>批量数量</label>
          <input
            v-model.number="batchConfig.count"
            type="number"
            min="1"
            max="10"
          >
        </div>
        <div class="form-group">
          <label>基础文字</label>
          <input v-model="batchConfig.baseText" type="text">
        </div>
        <div class="controls">
          <button class="btn btn-primary" @click="createBatchWatermarks">
            批量创建
          </button>
          <button class="btn btn-secondary" @click="updateBatchWatermarks">
            批量更新
          </button>
          <button class="btn btn-danger" @click="destroyBatchWatermarks">
            批量销毁
          </button>
        </div>
      </div>

      <div class="batch-containers">
        <div
          v-for="i in batchConfig.count"
          :key="i"
          :ref="el => setBatchRef(el, i)"
          class="batch-item"
        >
          <div class="batch-content">
            <p>容器 {{ i }}</p>
            <p>状态: {{ getBatchStatus(i) }}</p>
          </div>
        </div>
      </div>

      <div class="batch-stats">
        <p>活跃实例: {{ activeBatchCount }} / {{ batchConfig.count }}</p>
        <p>总创建时间: {{ batchStats.totalCreateTime }}ms</p>
        <p>平均创建时间: {{ batchStats.avgCreateTime }}ms</p>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.advanced-examples {
  .section-title {
    color: white;
    font-size: 1.8rem;
    margin-bottom: 10px;
    text-align: center;
  }

  .section-desc {
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    margin-bottom: 30px;
  }
}

.demo-container {
  position: relative;
  min-height: 150px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 15px 0;
  overflow: hidden;

  .demo-content {
    padding: 20px;
    text-align: center;
    color: #6c757d;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 150px;
  }
}

.security-controls,
.animation-controls {
  margin-bottom: 15px;
}

.security-log {
  margin-top: 15px;

  h4 {
    color: var(--danger-color);
    margin-bottom: 10px;
  }

  .log-entries {
    max-height: 120px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    padding: 10px;
  }

  .log-entry {
    display: flex;
    gap: 10px;
    margin-bottom: 5px;
    font-size: 12px;

    .log-time {
      color: #666;
      min-width: 80px;
    }

    .log-message {
      color: var(--danger-color);
    }
  }
}

.responsive-info,
.render-info {
  background: rgba(0, 0, 0, 0.05);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;

  p {
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.render-mode-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 15px;

  .mode-tab {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #f8f9fa;
    }

    &.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
  }
}

.performance-stats {
  margin-top: 15px;
  background: rgba(76, 175, 80, 0.1);
  padding: 15px;
  border-radius: 6px;

  h4 {
    color: var(--success-color);
    margin-bottom: 10px;
  }

  p {
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.batch-controls {
  display: flex;
  gap: 20px;
  align-items: end;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.batch-containers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.batch-item {
  min-height: 120px;
  background: #f8f9fa;
  border-radius: 8px;
  position: relative;
  overflow: hidden;

  .batch-content {
    padding: 15px;
    text-align: center;
    color: #6c757d;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 120px;
  }
}

.batch-stats {
  background: rgba(0, 0, 0, 0.05);
  padding: 15px;
  border-radius: 6px;

  p {
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 15px 0;
  flex-wrap: wrap;
}

.mt-30 {
  margin-top: 30px;
}

@media (max-width: 768px) {
  .batch-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .render-mode-tabs {
    flex-direction: column;
  }

  .controls {
    flex-direction: column;
    align-items: center;
  }
}
</style>
