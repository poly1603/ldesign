<template>
  <div
    ref="containerRef"
    :class="[
      'ldesign-cropper',
      {
        'ldesign-cropper--loading': loading,
        'ldesign-cropper--error': error
      }
    ]"
    :data-theme="theme"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="ldesign-cropper__loading">
      <div class="loading-spinner"></div>
      <span>{{ loadingText }}</span>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="ldesign-cropper__error">
      <div class="error-icon">⚠️</div>
      <span>{{ error }}</span>
      <button @click="retry" class="error-retry">重试</button>
    </div>

    <!-- 工具栏 -->
    <div
      v-if="showToolbar && !loading && !error"
      ref="toolbarRef"
      class="ldesign-cropper__toolbar-container"
    />

    <!-- 控制面板 -->
    <div
      v-if="showControlPanel && !loading && !error"
      ref="controlPanelRef"
      class="ldesign-cropper__control-panel-container"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import type { 
  ImageSource, 
  CropData, 
  CropperConfig, 
  ExportOptions, 
  ExportResult,
  CropperEventData,
  AspectRatio
} from '../types'
import { Cropper } from '../core/Cropper'
import { Toolbar } from '../ui/Toolbar'
import { ControlPanel } from '../ui/ControlPanel'
import { DEFAULT_CONFIG } from '../constants'

// Props 定义
interface Props {
  src?: ImageSource
  cropData?: Partial<CropData>
  config?: Partial<CropperConfig>
  theme?: 'light' | 'dark' | 'auto'
  showToolbar?: boolean
  showControlPanel?: boolean
  loadingText?: string
  aspectRatio?: AspectRatio
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  showToolbar: true,
  showControlPanel: false,
  loadingText: '加载中...',
  aspectRatio: 'free',
  disabled: false
})

// Emits 定义
interface Emits {
  (e: 'ready', data: CropperEventData): void
  (e: 'cropStart', data: CropperEventData): void
  (e: 'cropMove', data: CropperEventData): void
  (e: 'cropEnd', data: CropperEventData): void
  (e: 'cropChange', data: CropperEventData): void
  (e: 'imageLoad', data: CropperEventData): void
  (e: 'imageError', data: CropperEventData): void
  (e: 'update:cropData', data: CropData): void
  (e: 'export', result: ExportResult): void
  (e: 'error', error: Error): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const containerRef = ref<HTMLElement>()
const toolbarRef = ref<HTMLElement>()
const controlPanelRef = ref<HTMLElement>()
const loading = ref(false)
const error = ref<string | null>(null)

// 实例
let cropperInstance: Cropper | null = null
let toolbarInstance: Toolbar | null = null
let controlPanelInstance: ControlPanel | null = null

// 计算属性
const mergedConfig = computed(() => ({
  ...DEFAULT_CONFIG,
  ...props.config,
  theme: props.theme
}))

// 初始化裁剪器
const initializeCropper = async () => {
  if (!containerRef.value) return

  try {
    loading.value = true
    error.value = null

    // 创建裁剪器实例
    cropperInstance = new Cropper(containerRef.value, mergedConfig.value)

    // 设置事件监听器
    setupEventListeners()

    // 初始化UI组件
    await nextTick()
    initializeUI()

    // 设置图像源
    if (props.src) {
      await cropperInstance.setImageSource(props.src)
    }

    // 设置初始裁剪数据
    if (props.cropData) {
      updateCropData(props.cropData)
    }

    // 设置宽高比
    if (props.aspectRatio !== 'free') {
      cropperInstance.setAspectRatio(props.aspectRatio)
    }

  } catch (err) {
    error.value = err instanceof Error ? err.message : '初始化失败'
    emit('error', err as Error)
  } finally {
    loading.value = false
  }
}

// 设置事件监听器
const setupEventListeners = () => {
  if (!cropperInstance) return

  cropperInstance.on('ready', (data) => {
    emit('ready', data)
  })

  cropperInstance.on('cropStart', (data) => {
    emit('cropStart', data)
  })

  cropperInstance.on('cropMove', (data) => {
    emit('cropMove', data)
    emit('update:cropData', data.cropData!)
  })

  cropperInstance.on('cropEnd', (data) => {
    emit('cropEnd', data)
    emit('update:cropData', data.cropData!)
  })

  cropperInstance.on('cropChange', (data) => {
    emit('cropChange', data)
    emit('update:cropData', data.cropData!)
    
    // 更新控制面板
    if (controlPanelInstance && data.cropData) {
      controlPanelInstance.updateData(data.cropData)
    }
  })

  cropperInstance.on('imageLoad', (data) => {
    emit('imageLoad', data)
  })

  cropperInstance.on('imageError', (data) => {
    error.value = data.error?.message || '图像加载失败'
    emit('imageError', data)
  })
}

// 初始化UI组件
const initializeUI = () => {
  // 初始化工具栏
  if (props.showToolbar && toolbarRef.value && mergedConfig.value.toolbar.show) {
    toolbarInstance = new Toolbar(toolbarRef.value, mergedConfig.value.toolbar)
    
    toolbarInstance.on('toolbarAction', ({ toolId }) => {
      handleToolbarAction(toolId)
    })
  }

  // 初始化控制面板
  if (props.showControlPanel && controlPanelRef.value) {
    const controlPanelConfig = {
      show: true,
      position: 'right' as const,
      collapsible: true,
      sections: ['crop', 'transform', 'image-process', 'export']
    }
    
    controlPanelInstance = new ControlPanel(controlPanelRef.value, controlPanelConfig)
    
    controlPanelInstance.on('controlPanelChange', ({ property, value }) => {
      handleControlPanelChange(property, value)
    })
  }
}

// 处理工具栏操作
const handleToolbarAction = (toolId: string) => {
  if (!cropperInstance) return

  switch (toolId) {
    case 'zoom-in':
      cropperInstance.scale(1.1)
      break
    case 'zoom-out':
      cropperInstance.scale(0.9)
      break
    case 'rotate-left':
      cropperInstance.rotate(-90)
      break
    case 'rotate-right':
      cropperInstance.rotate(90)
      break
    case 'flip-horizontal':
      cropperInstance.flip(true, false)
      break
    case 'flip-vertical':
      cropperInstance.flip(false, true)
      break
    case 'reset':
      cropperInstance.reset()
      break
    case 'download':
      exportImage()
      break
  }
}

// 处理控制面板变化
const handleControlPanelChange = (property: string, value: any) => {
  if (!cropperInstance) return

  switch (property) {
    case 'aspectRatio':
      cropperInstance.setAspectRatio(value)
      break
    case 'rotation':
      const currentData = cropperInstance.getCropData()
      cropperInstance.rotate(value - currentData.rotation)
      break
    case 'scale':
      cropperInstance.scale(value / cropperInstance.getCropData().scale)
      break
    case 'flipHorizontal':
      cropperInstance.flip(value, cropperInstance.getCropData().flip.vertical)
      break
    case 'flipVertical':
      cropperInstance.flip(cropperInstance.getCropData().flip.horizontal, value)
      break
  }
}

// 更新裁剪数据
const updateCropData = (data: Partial<CropData>) => {
  if (!cropperInstance) return

  if (data.area) {
    cropperInstance.setCropArea(data.area)
  }
  
  if (data.aspectRatio) {
    cropperInstance.setAspectRatio(data.aspectRatio)
  }
}

// 导出图像
const exportImage = async (options?: ExportOptions) => {
  if (!cropperInstance) return

  try {
    const result = await cropperInstance.export(options)
    emit('export', result)
    return result
  } catch (err) {
    emit('error', err as Error)
    throw err
  }
}

// 重试
const retry = () => {
  error.value = null
  initializeCropper()
}

// 获取裁剪数据
const getCropData = (): CropData | null => {
  return cropperInstance?.getCropData() || null
}

// 设置图像源
const setImageSource = async (src: ImageSource) => {
  if (!cropperInstance) return
  
  try {
    loading.value = true
    await cropperInstance.setImageSource(src)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '图像加载失败'
    throw err
  } finally {
    loading.value = false
  }
}

// 暴露方法
defineExpose({
  getCropData,
  setImageSource,
  exportImage,
  reset: () => cropperInstance?.reset(),
  rotate: (angle: number) => cropperInstance?.rotate(angle),
  scale: (factor: number) => cropperInstance?.scale(factor),
  flip: (horizontal?: boolean, vertical?: boolean) => cropperInstance?.flip(horizontal, vertical)
})

// 监听属性变化
watch(() => props.src, (newSrc) => {
  if (newSrc && cropperInstance) {
    setImageSource(newSrc)
  }
})

watch(() => props.aspectRatio, (newRatio) => {
  if (cropperInstance) {
    cropperInstance.setAspectRatio(newRatio)
  }
})

watch(() => props.disabled, (disabled) => {
  if (cropperInstance) {
    // 这里可以禁用/启用交互
  }
})

// 生命周期
onMounted(() => {
  initializeCropper()
})

onUnmounted(() => {
  cropperInstance?.destroy()
  toolbarInstance?.destroy()
  controlPanelInstance?.destroy()
})
</script>

<style scoped>
.ldesign-cropper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.ldesign-cropper__loading,
.ldesign-cropper__error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 32px;
}

.error-retry {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-retry:hover {
  background: #40a9ff;
}

.ldesign-cropper__toolbar-container,
.ldesign-cropper__control-panel-container {
  position: absolute;
  z-index: 10;
}
</style>
