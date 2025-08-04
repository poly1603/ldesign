<template>
  <div class="composition-examples">
    <h2 class="section-title">🔧 Composition API 示例</h2>
    <p class="section-desc">展示如何使用 Composition API 管理水印状态和生命周期</p>

    <div class="grid grid-2">
      <!-- 响应式水印 -->
      <div class="card glass">
        <h3>响应式水印配置</h3>
        <div class="form-group">
          <label>水印文字</label>
          <input v-model="reactiveConfig.text" type="text">
        </div>
        <div class="form-group">
          <label>是否启用: {{ reactiveConfig.enabled ? '是' : '否' }}</label>
          <input v-model="reactiveConfig.enabled" type="checkbox">
        </div>
        <div class="demo-container" ref="reactiveRef">
          <div class="demo-content">
            <p>响应式水印示例</p>
            <p>修改上方配置会自动更新水印</p>
          </div>
        </div>
        <div class="code-preview">
          <details>
            <summary>查看代码</summary>
            <pre><code>{{ reactiveCode }}</code></pre>
          </details>
        </div>
      </div>

      <!-- 生命周期管理 -->
      <div class="card glass">
        <h3>生命周期管理</h3>
        <div class="status-info">
          <p>水印状态: <span :class="lifecycleStatus.class">{{ lifecycleStatus.text }}</span></p>
          <p>创建时间: {{ lifecycleInfo.createdAt || '未创建' }}</p>
          <p>更新次数: {{ lifecycleInfo.updateCount }}</p>
        </div>
        <div class="demo-container" ref="lifecycleRef">
          <div class="demo-content">
            <p>生命周期管理示例</p>
            <p>展示水印的创建、更新、销毁过程</p>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" @click="createLifecycleWatermark">创建</button>
          <button class="btn btn-secondary" @click="updateLifecycleWatermark">更新</button>
          <button class="btn btn-danger" @click="destroyLifecycleWatermark">销毁</button>
        </div>
        <div class="code-preview">
          <details>
            <summary>查看代码</summary>
            <pre><code>{{ lifecycleCode }}</code></pre>
          </details>
        </div>
      </div>

      <!-- 条件渲染 -->
      <div class="card glass">
        <h3>条件渲染</h3>
        <div class="form-group">
          <label>显示条件</label>
          <select v-model="conditionalConfig.condition">
            <option value="always">始终显示</option>
            <option value="hover">鼠标悬停</option>
            <option value="focus">获得焦点</option>
            <option value="never">从不显示</option>
          </select>
        </div>
        <div 
          class="demo-container" 
          ref="conditionalRef"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
          @focusin="onFocusIn"
          @focusout="onFocusOut"
          tabindex="0"
        >
          <div class="demo-content">
            <p>条件渲染示例</p>
            <p>根据不同条件显示/隐藏水印</p>
            <p v-if="conditionalConfig.condition === 'hover'">鼠标悬停显示水印</p>
            <p v-if="conditionalConfig.condition === 'focus'">点击获得焦点显示水印</p>
          </div>
        </div>
        <div class="code-preview">
          <details>
            <summary>查看代码</summary>
            <pre><code>{{ conditionalCode }}</code></pre>
          </details>
        </div>
      </div>

      <!-- 动态内容 -->
      <div class="card glass">
        <h3>动态内容更新</h3>
        <div class="form-group">
          <label>内容类型</label>
          <select v-model="dynamicConfig.type">
            <option value="time">当前时间</option>
            <option value="counter">计数器</option>
            <option value="random">随机文字</option>
          </select>
        </div>
        <div class="form-group">
          <label>自动更新: {{ dynamicConfig.autoUpdate ? '开启' : '关闭' }}</label>
          <input v-model="dynamicConfig.autoUpdate" type="checkbox">
        </div>
        <div class="demo-container" ref="dynamicRef">
          <div class="demo-content">
            <p>动态内容示例</p>
            <p>水印内容会根据选择自动更新</p>
            <p>当前内容: {{ dynamicContent }}</p>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" @click="updateDynamicContent">手动更新</button>
        </div>
        <div class="code-preview">
          <details>
            <summary>查看代码</summary>
            <pre><code>{{ dynamicCode }}</code></pre>
          </details>
        </div>
      </div>
    </div>

    <!-- 自定义 Hook 示例 -->
    <div class="card glass mt-30">
      <h3>🪝 自定义 Hook 示例</h3>
      <p>使用自定义 Hook 封装水印逻辑，提高代码复用性</p>
      
      <div class="grid grid-2">
        <div>
          <h4>useWatermark Hook</h4>
          <div class="demo-container" ref="hookRef1">
            <div class="demo-content">
              <p>使用 useWatermark Hook</p>
              <p>状态: {{ hookWatermark1.isActive ? '活跃' : '未激活' }}</p>
            </div>
          </div>
          <div class="controls">
            <button class="btn btn-primary" @click="hookWatermark1.create('Hook 水印 1')">创建</button>
            <button class="btn btn-secondary" @click="hookWatermark1.toggle">切换</button>
            <button class="btn btn-danger" @click="hookWatermark1.destroy">销毁</button>
          </div>
        </div>
        
        <div>
          <h4>useAdvancedWatermark Hook</h4>
          <div class="demo-container" ref="hookRef2">
            <div class="demo-content">
              <p>使用 useAdvancedWatermark Hook</p>
              <p>状态: {{ hookWatermark2.status }}</p>
              <p>更新次数: {{ hookWatermark2.updateCount }}</p>
            </div>
          </div>
          <div class="controls">
            <button class="btn btn-primary" @click="() => hookWatermark2.create()">创建</button>
            <button class="btn btn-secondary" @click="() => hookWatermark2.update()">更新</button>
            <button class="btn btn-danger" @click="() => hookWatermark2.destroy()">销毁</button>
          </div>
        </div>
      </div>
      
      <div class="code-preview">
        <details>
          <summary>查看 Hook 代码</summary>
          <pre><code>{{ hookCode }}</code></pre>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { createWatermark, destroyWatermark, type WatermarkInstance } from '../mock/watermark'
import { useWatermark, useAdvancedWatermark } from '../composables/useWatermark'

// 模板引用
const reactiveRef = ref<HTMLElement>()
const lifecycleRef = ref<HTMLElement>()
const conditionalRef = ref<HTMLElement>()
const dynamicRef = ref<HTMLElement>()
const hookRef1 = ref<HTMLElement>()
const hookRef2 = ref<HTMLElement>()

// 响应式配置
const reactiveConfig = reactive({
  text: 'Reactive Watermark',
  enabled: true
})

// 生命周期信息
const lifecycleInfo = reactive({
  createdAt: null as string | null,
  updateCount: 0
})

const lifecycleInstance = ref<WatermarkInstance | null>(null)

const lifecycleStatus = computed(() => {
  if (!lifecycleInstance.value) {
    return { text: '未创建', class: 'status-inactive' }
  }
  return { text: '已创建', class: 'status-active' }
})

// 条件渲染配置
const conditionalConfig = reactive({
  condition: 'always' as 'always' | 'hover' | 'focus' | 'never'
})

const conditionalInstance = ref<WatermarkInstance | null>(null)
const isHovered = ref(false)
const isFocused = ref(false)

// 动态内容配置
const dynamicConfig = reactive({
  type: 'time' as 'time' | 'counter' | 'random',
  autoUpdate: true
})

const dynamicInstance = ref<WatermarkInstance | null>(null)
const counter = ref(0)

const dynamicContent = computed(() => {
  switch (dynamicConfig.type) {
    case 'time':
      return new Date().toLocaleTimeString()
    case 'counter':
      return `计数: ${counter.value}`
    case 'random':
      return `随机: ${Math.random().toString(36).substr(2, 5)}`
    default:
      return 'Dynamic Content'
  }
})

// 自定义 Hook 实例
const hookWatermark1 = useWatermark(hookRef1)
const hookWatermark2 = useAdvancedWatermark(hookRef2, {
  content: 'Advanced Hook',
  style: { color: '#FF6B6B', opacity: 0.3 }
})

// 响应式水印实例
const reactiveInstance = ref<WatermarkInstance | null>(null)

// 监听响应式配置变化
watch(reactiveConfig, async () => {
  if (!reactiveRef.value) return
  
  if (reactiveConfig.enabled) {
    if (reactiveInstance.value) {
      await destroyWatermark(reactiveInstance.value)
    }
    
    reactiveInstance.value = await createWatermark(reactiveRef.value, {
      content: reactiveConfig.text,
      style: {
        fontSize: 16,
        color: 'rgba(102, 126, 234, 0.2)'
      }
    })
  } else {
    if (reactiveInstance.value) {
      await destroyWatermark(reactiveInstance.value)
      reactiveInstance.value = null
    }
  }
}, { immediate: true })

// 生命周期管理方法
const createLifecycleWatermark = async () => {
  if (!lifecycleRef.value) return
  
  if (lifecycleInstance.value) {
    await destroyWatermark(lifecycleInstance.value)
  }
  
  lifecycleInstance.value = await createWatermark(lifecycleRef.value, {
    content: 'Lifecycle Watermark',
    style: {
      fontSize: 14,
      color: 'rgba(76, 175, 80, 0.2)'
    }
  })
  
  lifecycleInfo.createdAt = new Date().toLocaleTimeString()
  lifecycleInfo.updateCount = 0
}

const updateLifecycleWatermark = async () => {
  if (!lifecycleInstance.value || !lifecycleRef.value) return
  
  await destroyWatermark(lifecycleInstance.value)
  
  lifecycleInstance.value = await createWatermark(lifecycleRef.value, {
    content: `Updated ${lifecycleInfo.updateCount + 1}`,
    style: {
      fontSize: 16 + lifecycleInfo.updateCount * 2,
      color: `hsl(${120 + lifecycleInfo.updateCount * 30}, 70%, 50%)`,
      opacity: 0.3
    }
  })
  
  lifecycleInfo.updateCount++
}

const destroyLifecycleWatermark = async () => {
  if (lifecycleInstance.value) {
    await destroyWatermark(lifecycleInstance.value)
    lifecycleInstance.value = null
    lifecycleInfo.createdAt = null
    lifecycleInfo.updateCount = 0
  }
}

// 条件渲染方法
const updateConditionalWatermark = async () => {
  if (!conditionalRef.value) return
  
  const shouldShow = 
    conditionalConfig.condition === 'always' ||
    (conditionalConfig.condition === 'hover' && isHovered.value) ||
    (conditionalConfig.condition === 'focus' && isFocused.value)
  
  if (shouldShow && !conditionalInstance.value) {
    conditionalInstance.value = await createWatermark(conditionalRef.value, {
      content: 'Conditional Watermark',
      style: {
        fontSize: 14,
        color: 'rgba(156, 39, 176, 0.2)'
      }
    })
  } else if (!shouldShow && conditionalInstance.value) {
    await destroyWatermark(conditionalInstance.value)
    conditionalInstance.value = null
  }
}

const onMouseEnter = () => {
  isHovered.value = true
  updateConditionalWatermark()
}

const onMouseLeave = () => {
  isHovered.value = false
  updateConditionalWatermark()
}

const onFocusIn = () => {
  isFocused.value = true
  updateConditionalWatermark()
}

const onFocusOut = () => {
  isFocused.value = false
  updateConditionalWatermark()
}

// 监听条件变化
watch(() => conditionalConfig.condition, updateConditionalWatermark)

// 动态内容方法
const updateDynamicWatermark = async () => {
  if (!dynamicRef.value) return
  
  if (dynamicInstance.value) {
    await destroyWatermark(dynamicInstance.value)
  }
  
  dynamicInstance.value = await createWatermark(dynamicRef.value, {
    content: dynamicContent.value,
    style: {
      fontSize: 14,
      color: 'rgba(244, 67, 54, 0.2)'
    }
  })
}

const updateDynamicContent = () => {
  if (dynamicConfig.type === 'counter') {
    counter.value++
  }
  updateDynamicWatermark()
}

// 监听动态内容变化
watch(dynamicContent, () => {
  if (dynamicConfig.autoUpdate) {
    updateDynamicWatermark()
  }
})

// 自动更新定时器
let autoUpdateTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  // 自动创建生命周期水印
  await createLifecycleWatermark()

  // 初始化条件渲染水印
  updateConditionalWatermark()

  // 初始化动态内容水印
  updateDynamicWatermark()

  // 自动创建 Hook 示例水印
  await hookWatermark1.create('Hook 水印 1')
  await hookWatermark2.create()

  // 启动自动更新定时器
  autoUpdateTimer = setInterval(() => {
    if (dynamicConfig.autoUpdate && dynamicConfig.type === 'time') {
      updateDynamicWatermark()
    }
  }, 1000)
})

onUnmounted(async () => {
  // 清理定时器
  if (autoUpdateTimer) {
    clearInterval(autoUpdateTimer)
  }
  
  // 清理所有水印实例
  const instances = [
    reactiveInstance.value,
    lifecycleInstance.value,
    conditionalInstance.value,
    dynamicInstance.value
  ]
  
  for (const instance of instances) {
    if (instance) {
      await destroyWatermark(instance)
    }
  }
})

// 代码示例
const reactiveCode = `const reactiveConfig = reactive({
  text: 'Reactive Watermark',
  enabled: true
})

watch(reactiveConfig, async () => {
  if (reactiveConfig.enabled) {
    instance.value = await createWatermark(container, {
      content: reactiveConfig.text
    })
  } else {
    if (instance.value) {
      await destroyWatermark(instance.value)
    }
  }
}, { immediate: true })`

const lifecycleCode = `const createWatermark = async () => {
  instance.value = await createWatermark(container, config)
  info.createdAt = new Date().toLocaleTimeString()
}

const updateWatermark = async () => {
  await destroyWatermark(instance.value)
  instance.value = await createWatermark(container, newConfig)
  info.updateCount++
}

const destroyWatermark = async () => {
  await destroyWatermark(instance.value)
  instance.value = null
}`

const conditionalCode = `const shouldShow = computed(() => 
  condition === 'always' ||
  (condition === 'hover' && isHovered.value) ||
  (condition === 'focus' && isFocused.value)
)

watch(shouldShow, async (show) => {
  if (show && !instance.value) {
    instance.value = await createWatermark(container, config)
  } else if (!show && instance.value) {
    await destroyWatermark(instance.value)
  }
})`

const dynamicCode = `const dynamicContent = computed(() => {
  switch (type) {
    case 'time': return new Date().toLocaleTimeString()
    case 'counter': return \`计数: \${counter.value}\`
    case 'random': return \`随机: \${Math.random()}\`
  }
})

watch(dynamicContent, async () => {
  if (autoUpdate) {
    await updateWatermark()
  }
})`

const hookCode = `// useWatermark Hook
export function useWatermark(containerRef) {
  const instance = ref(null)
  const isActive = computed(() => !!instance.value)
  
  const create = async (content) => {
    if (instance.value) await destroy()
    instance.value = await createWatermark(containerRef.value, { content })
  }
  
  const destroy = async () => {
    if (instance.value) {
      await destroyWatermark(instance.value)
      instance.value = null
    }
  }
  
  const toggle = async () => {
    if (isActive.value) await destroy()
    else await create('Default Content')
  }
  
  return { instance, isActive, create, destroy, toggle }
}`
</script>

<style lang="less" scoped>
.composition-examples {
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
  transition: all 0.3s ease;
  
  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  
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

.status-info {
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

.status-active {
  color: var(--success-color);
  font-weight: 500;
}

.status-inactive {
  color: var(--danger-color);
  font-weight: 500;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 15px 0;
  flex-wrap: wrap;
}

.code-preview {
  margin-top: 15px;
  
  details {
    summary {
      cursor: pointer;
      padding: 8px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      font-weight: 500;
    }
    
    pre {
      margin-top: 10px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
      overflow-x: auto;
      
      code {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
      }
    }
  }
}

.mt-30 {
  margin-top: 30px;
}

h4 {
  color: var(--primary-color);
  margin-bottom: 15px;
  text-align: center;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: center;
  }
}
</style>
