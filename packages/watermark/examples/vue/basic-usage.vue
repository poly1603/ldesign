<template>
  <div class="demo-container">
    <h1>Vue3 水印系统示例</h1>
    
    <!-- Provider 示例 -->
    <section class="demo-section">
      <h2>1. Provider 模式</h2>
      <WatermarkProvider 
        :config="providerConfig"
        :global-security="true"
        :global-responsive="true"
      >
        <div class="content-box">
          <p>这个区域使用了 Provider 提供的全局配置</p>
          <Watermark content="Provider 水印" />
        </div>
      </WatermarkProvider>
    </section>

    <!-- 组件示例 -->
    <section class="demo-section">
      <h2>2. 组件模式</h2>
      <Watermark 
        :config="componentConfig"
        :security="true"
        :responsive="true"
        @created="onWatermarkCreated"
        @error="onWatermarkError"
      >
        <div class="content-box">
          <p>这个区域使用了 Watermark 组件</p>
          <button @click="updateComponentConfig">更新配置</button>
        </div>
      </Watermark>
    </section>

    <!-- Hook 示例 -->
    <section class="demo-section">
      <h2>3. Hook 模式</h2>
      <div ref="hookContainer" class="content-box">
        <p>这个区域使用了 useWatermark Hook</p>
        <div class="controls">
          <button @click="createHookWatermark" :disabled="hookLoading">创建水印</button>
          <button @click="updateHookWatermark" :disabled="!hookCreated || hookLoading">更新水印</button>
          <button @click="destroyHookWatermark" :disabled="!hookCreated || hookLoading">销毁水印</button>
        </div>
        <div v-if="hookError" class="error">{{ hookError.message }}</div>
      </div>
    </section>

    <!-- 指令示例 -->
    <section class="demo-section">
      <h2>4. 指令模式</h2>
      <div class="controls">
        <label>
          <input v-model="directiveText" placeholder="输入水印文字" />
        </label>
        <label>
          <input type="checkbox" v-model="directiveSecure" /> 安全模式
        </label>
        <label>
          <input type="checkbox" v-model="directiveResponsive" /> 响应式
        </label>
      </div>
      <div 
        v-watermark="directiveConfig"
        :class="{ secure: directiveSecure, responsive: directiveResponsive }"
        class="content-box"
      >
        <p>这个区域使用了 v-watermark 指令</p>
        <p>当前配置: {{ JSON.stringify(directiveConfig, null, 2) }}</p>
      </div>
    </section>

    <!-- 动画示例 -->
    <section class="demo-section">
      <h2>5. 动画效果</h2>
      <div class="controls">
        <select v-model="animationType">
          <option value="none">无动画</option>
          <option value="rotate">旋转</option>
          <option value="fade">淡入淡出</option>
          <option value="move">移动</option>
          <option value="pulse">脉冲</option>
        </select>
      </div>
      <Watermark :config="animationConfig">
        <div class="content-box">
          <p>这个区域展示了动画效果</p>
        </div>
      </Watermark>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Watermark, 
  WatermarkProvider, 
  useWatermark,
  type WatermarkConfig,
  type WatermarkInstance
} from '@ldesign/watermark/vue'

// Provider 配置
const providerConfig = ref<Partial<WatermarkConfig>>({
  style: {
    fontSize: 16,
    color: '#000000',
    opacity: 0.1
  },
  layout: {
    gapX: 100,
    gapY: 100
  }
})

// 组件配置
const componentConfig = ref<Partial<WatermarkConfig>>({
  content: '组件水印',
  style: {
    fontSize: 18,
    color: '#1890ff',
    opacity: 0.15
  }
})

// Hook 相关
const hookContainer = ref<HTMLElement>()
const {
  instance: hookInstance,
  loading: hookLoading,
  error: hookError,
  isCreated: hookCreated,
  create: createHook,
  update: updateHook,
  destroy: destroyHook
} = useWatermark(hookContainer)

// 指令相关
const directiveText = ref('指令水印')
const directiveSecure = ref(false)
const directiveResponsive = ref(true)

const directiveConfig = computed(() => ({
  content: directiveText.value,
  style: {
    fontSize: 14,
    color: '#52c41a',
    opacity: 0.2
  }
}))

// 动画相关
const animationType = ref<'none' | 'rotate' | 'fade' | 'move' | 'pulse'>('none')

const animationConfig = computed((): Partial<WatermarkConfig> => ({
  content: '动画水印',
  style: {
    fontSize: 20,
    color: '#722ed1',
    opacity: 0.3
  },
  animation: animationType.value !== 'none' ? {
    type: animationType.value,
    duration: 3000,
    iteration: 'infinite'
  } : undefined
}))

// 事件处理
const onWatermarkCreated = (instance: WatermarkInstance) => {
  console.log('水印创建成功:', instance)
}

const onWatermarkError = (error: Error) => {
  console.error('水印错误:', error)
}

const updateComponentConfig = () => {
  componentConfig.value = {
    ...componentConfig.value,
    content: `更新时间: ${new Date().toLocaleTimeString()}`,
    style: {
      ...componentConfig.value.style,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    }
  }
}

const createHookWatermark = async () => {
  await createHook({
    content: 'Hook 水印',
    style: {
      fontSize: 16,
      color: '#fa541c',
      opacity: 0.25
    }
  })
}

const updateHookWatermark = async () => {
  await updateHook({
    content: `Hook 更新: ${new Date().toLocaleTimeString()}`,
    style: {
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    }
  })
}

const destroyHookWatermark = async () => {
  await destroyHook()
}
</script>

<style scoped>
.demo-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 40px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 20px;
}

.demo-section h2 {
  margin-top: 0;
  color: #1890ff;
}

.content-box {
  min-height: 200px;
  background: #f5f5f5;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  padding: 20px;
  position: relative;
}

.controls {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.controls button {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.controls button:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.controls input[type="text"],
.controls input[type="placeholder"],
.controls select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.error {
  color: #ff4d4f;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;
}

pre {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
  font-size: 12px;
}
</style>