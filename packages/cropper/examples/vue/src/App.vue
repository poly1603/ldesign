<template>
  <div class="container">
    <!-- 头部 -->
    <div class="header">
      <h1>🎨 LDESIGN Cropper</h1>
      <p>Vue 3 集成示例 - 功能强大的现代图片裁剪器</p>
    </div>

    <div class="content">
      <!-- 图片上传区域 -->
      <div class="section">
        <h2 class="section-title">📁 选择图片</h2>
        
        <div 
          class="upload-area"
          :class="{ dragover: isDragOver }"
          @click="triggerFileInput"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
        >
          <div style="font-size: 48px; margin-bottom: 15px;">📷</div>
          <button class="upload-btn">选择图片文件</button>
          <p>或拖拽图片到此区域</p>
          <p style="color: #999; font-size: 14px; margin-top: 10px;">
            支持 JPG、PNG、WebP 格式
          </p>
        </div>
        
        <input 
          ref="fileInput"
          type="file" 
          class="upload-input"
          accept="image/*"
          @change="handleFileChange"
        >

        <!-- 示例图片 -->
        <div class="demo-images">
          <div 
            v-for="(demo, index) in demoImages" 
            :key="index"
            class="demo-image"
            @click="loadDemoImage(demo.url)"
          >
            <img :src="demo.thumb" :alt="demo.name">
          </div>
        </div>
      </div>

      <!-- 裁剪器区域 -->
      <div class="section">
        <h2 class="section-title">✂️ 图片裁剪</h2>

        <!-- 裁剪器组件 -->
        <div class="cropper-container">
          <!-- 真实的裁剪器容器 -->
          <div ref="cropperContainer" class="real-cropper">
            
          </div>
        </div>

        <!-- 内置工具栏将自动显示在裁剪器内部 -->
        <div class="info-panel">
          <p class="info-text">
            💡 使用内置工具栏进行裁剪操作：
          </p>
          <ul class="info-list">
            <li>🔍 滚轮缩放：在图片上滚动鼠标滚轮</li>
            <li>✂️ 形状切换：点击工具栏中的形状按钮</li>
            <li>📐 宽高比：使用下拉选择器调整比例</li>
            <li>🔄 变换操作：旋转、翻转、重置等</li>
            <li>💾 导出结果：裁剪并下载图片</li>
          </ul>
        </div>
      </div>

      <!-- 结果展示区域 -->
      <div v-if="croppedResult" class="section result-section">
        <h2 class="section-title">🖼️ 裁剪结果</h2>
        
        <div class="result-preview">
          <img :src="croppedResult.dataURL" alt="裁剪结果">
        </div>

        <div class="result-info">
          <strong>裁剪信息:</strong><br>
          尺寸: {{ croppedResult.width }} × {{ croppedResult.height }}<br>
          格式: {{ croppedResult.format }}<br>
          大小: {{ croppedResult.size }}<br>
          裁剪数据: {{ JSON.stringify(cropData, null, 2) }}
        </div>

        <div class="result-actions">
          <button class="control-btn primary" @click="downloadResult">
            💾 下载图片
          </button>
          <button class="control-btn" @click="copyToClipboard">
            📋 复制到剪贴板
          </button>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      <p>
        Built with ❤️ by LDESIGN Team | 
        <a href="https://github.com/ldesign/cropper" target="_blank">GitHub</a> |
        <a href="/docs" target="_blank">文档</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Cropper, useVueCropper, type CropperOptions } from '../../../src/index'

// 响应式数据
const fileInput = ref<HTMLInputElement>()
const cropperContainer = ref<HTMLElement>()
const isDragOver = ref(false)
const imageSrc = ref('')
const currentShape = ref('rectangle')
const currentAspectRatio = ref<number | null>(16/9)
const cropData = ref(null)
const croppedResult = ref<any>(null)

// 使用真实的LDESIGN Cropper
let cropper = ref<any>(null)
let isReady = ref(false)

// 初始化和销毁方法
const init = async () => {
  if (!cropperContainer.value) {
    throw new Error('Container element is required')
  }

  const cropperInstance = new Cropper({
    container: cropperContainer.value,
    aspectRatio: currentAspectRatio.value,
    shape: currentShape.value as any,
    resizable: true,
    movable: true,
    rotatable: true,
    scalable: true,
    zoomable: true,
    showGrid: true,
    toolbar: {
      show: true,
      position: 'bottom',
      tools: [
        'zoom-in',
        'zoom-out',
        'rotate-left',
        'rotate-right',
        'flip-horizontal',
        'flip-vertical',
        'reset',
        'shape-selector',
        'aspect-ratio',
        'crop-style-selector',
        'background-selector',
        'move-up',
        'move-down',
        'move-left',
        'move-right',
        'filter-selector',
        'mask-opacity',
        'export-format',
        'crop',
        'download'
      ],
      theme: 'light'
    },
    debug: true
  })

  cropper.value = cropperInstance
  isReady.value = true
  return cropperInstance
}

const destroy = () => {
  if (cropper.value) {
    cropper.value.destroy()
    cropper.value = null
    isReady.value = false
  }
}

// 示例图片数据
const demoImages = [
  {
    name: '风景图片',
    thumb: 'https://picsum.photos/150/100?random=1',
    url: 'https://picsum.photos/800/600?random=1'
  },
  {
    name: '人物图片',
    thumb: 'https://picsum.photos/150/100?random=2',
    url: 'https://picsum.photos/800/600?random=2'
  },
  {
    name: '建筑图片',
    thumb: 'https://picsum.photos/150/100?random=3',
    url: 'https://picsum.photos/800/600?random=3'
  },
  {
    name: '自然图片',
    thumb: 'https://picsum.photos/150/100?random=4',
    url: 'https://picsum.photos/800/600?random=4'
  }
]

// 裁剪器配置
const cropperOptions = computed((): Partial<CropperOptions> => ({
  aspectRatio: currentAspectRatio.value,
  shape: currentShape.value as any,
  viewMode: 1,
  dragMode: 'crop',
  resizable: true,
  movable: true,
  rotatable: true,
  scalable: true,
  zoomable: true,
  showGrid: true,
  toolbar: {
    show: true,
    position: 'bottom',
    tools: [
      'zoom-in',
      'zoom-out',
      'rotate-left',
      'rotate-right',
      'flip-horizontal',
      'flip-vertical',
      'reset',
      'shape-selector',
      'aspect-ratio',
      'crop-style-selector',
      'background-selector',
      'move-up',
      'move-down',
      'move-left',
      'move-right',
      'filter-selector',
      'mask-opacity',
      'export-format',
      'crop',
      'download'
    ],
    theme: 'light'
  }
}))

// 文件处理方法
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      imageSrc.value = e.target?.result as string
      croppedResult.value = null

      // 如果裁剪器已初始化，加载新图片
      if (cropper.value && isReady.value) {
        try {
          await cropper.value.setImage(file)
        } catch (error) {
          console.error('加载图片失败:', error)
        }
      }
    }
    reader.readAsDataURL(file)
  }
}

const handleDrop = async (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        imageSrc.value = e.target?.result as string
        croppedResult.value = null

        // 如果裁剪器已初始化，加载新图片
        if (cropper.value && isReady.value) {
          try {
            await cropper.value.setImage(file)
          } catch (error) {
            console.error('加载图片失败:', error)
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }
}

const loadDemoImage = async (url: string) => {
  imageSrc.value = url
  croppedResult.value = null

  // 如果裁剪器已初始化，加载新图片
  if (cropper.value && isReady.value) {
    try {
      await cropper.value.setImage(url)
    } catch (error) {
      console.error('加载图片失败:', error)
    }
  }
}

// 裁剪器操作方法
const zoomIn = () => {
  if (cropper.value && isReady.value) {
    cropper.value.zoom(1.1)
  }
}

const zoomOut = () => {
  if (cropper.value && isReady.value) {
    cropper.value.zoom(0.9)
  }
}

const rotateLeft = () => {
  if (cropper.value && isReady.value) {
    cropper.value.rotate(-90)
  }
}

const rotateRight = () => {
  if (cropper.value && isReady.value) {
    cropper.value.rotate(90)
  }
}

const flipHorizontal = () => {
  if (cropper.value && isReady.value) {
    cropper.value.flip(true, false)
  }
}

const flipVertical = () => {
  if (cropper.value && isReady.value) {
    cropper.value.flip(false, true)
  }
}

const resetCropper = () => {
  if (cropper.value && isReady.value) {
    cropper.value.reset()
  }
}

const getCroppedResult = async () => {
  if (!cropper.value || !isReady.value) {
    console.warn('裁剪器未准备就绪')
    return
  }

  try {
    console.log('=== 开始获取裁剪结果 ===')
    console.log('裁剪器实例:', cropper.value)
    console.log('裁剪器核心:', cropper.value.core)
    console.log('当前图片:', cropper.value.currentImage)

    // 获取裁剪数据
    const data = cropper.value.getCropData?.() || null
    cropData.value = data
    console.log('裁剪数据:', data)

    // 检查裁剪区域是否有效
    if (!data || data.width <= 0 || data.height <= 0) {
      console.error('裁剪区域无效:', data)
      alert('裁剪区域无效，请先设置裁剪区域')
      return
    }

    // 获取裁剪后的Canvas
    console.log('开始获取裁剪Canvas...')
    const canvas = cropper.value.getCroppedCanvas()
    if (!canvas) {
      console.error('无法获取裁剪Canvas')
      return
    }
    console.log('获取到Canvas:', canvas)
    console.log('Canvas尺寸:', canvas.width, 'x', canvas.height)

    // 检查Canvas内容
    const ctx = canvas.getContext('2d')
    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
    console.log('Canvas ImageData:', imageData)

    // 检查是否有像素数据
    let hasContent = false
    if (imageData) {
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] > 0) { // 检查alpha通道
          hasContent = true
          break
        }
      }
    }
    console.log('Canvas是否有内容:', hasContent)

    // 获取工具栏选择的导出格式
    const toolbar = cropper.value.toolbar
    const exportFormat = toolbar?.currentExportFormat || 'png'
    console.log('导出格式:', exportFormat)

    // 根据格式设置MIME类型和扩展名
    const formatMap = {
      'png': { mimeType: 'image/png', extension: 'PNG', quality: 1 },
      'jpeg': { mimeType: 'image/jpeg', extension: 'JPEG', quality: 0.9 },
      'webp': { mimeType: 'image/webp', extension: 'WEBP', quality: 0.9 }
    }

    const formatInfo = formatMap[exportFormat as keyof typeof formatMap] || formatMap['png']

    // 获取裁剪后的DataURL
    const dataURL = cropper.value.getCroppedDataURL({
      format: formatInfo.mimeType,
      quality: formatInfo.quality
    })
    console.log('生成DataURL长度:', dataURL.length)
    console.log('DataURL前100字符:', dataURL.substring(0, 100))

    // 获取文件大小
    const blob = await cropper.value.getCroppedBlob({
      format: formatInfo.mimeType,
      quality: formatInfo.quality
    })
    const sizeInBytes = blob?.size || 0
    console.log('生成Blob大小:', sizeInBytes, 'bytes')

    croppedResult.value = {
      dataURL,
      width: canvas.width,
      height: canvas.height,
      format: formatInfo.extension,
      size: `${Math.round(sizeInBytes / 1024)} KB`
    }

    console.log('裁剪结果设置完成:', croppedResult.value)
    console.log('=== 裁剪结果获取完成 ===')
  } catch (error) {
    console.error('获取裁剪结果失败:', error)
    console.error('错误堆栈:', (error as Error).stack)
    alert('裁剪失败，请重试: ' + (error as Error).message)
  }
}

const downloadResult = () => {
  if (croppedResult.value) {
    const a = document.createElement('a')
    a.href = croppedResult.value.dataURL
    a.download = `cropped-image-${Date.now()}.png`
    a.click()
  }
}

const copyToClipboard = async () => {
  if (croppedResult.value) {
    try {
      const response = await fetch(croppedResult.value.dataURL)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      alert('图片已复制到剪贴板！')
    } catch (error) {
      console.error('复制失败:', error)
      alert('复制失败，请手动保存图片')
    }
  }
}

// 事件处理
const onCropChange = (data: any) => {
  console.log('裁剪数据变化:', data)
  cropData.value = data
}

const onImageLoad = () => {
  console.log('图片加载完成')
}

const onError = (error: Error) => {
  console.error('裁剪器错误:', error)
  alert('图片加载失败，请重试')
}

// 生命周期钩子
onMounted(async () => {
  // 等待DOM更新完成
  await nextTick()

  try {
    // 检查容器元素是否存在
    if (!cropperContainer.value) {
      console.error('裁剪器容器元素未找到，DOM元素:', cropperContainer.value)
      // 再等待一下
      await new Promise(resolve => setTimeout(resolve, 200))
      if (!cropperContainer.value) {
        console.error('延迟后仍未找到容器元素')
        return
      }
    }

    console.log('找到裁剪器容器元素:', cropperContainer.value)

    // 初始化真实的LDESIGN Cropper
    await init()
    console.log('LDESIGN Cropper初始化成功')

    // 暴露到全局变量用于调试
    ;(window as any).cropperInstance = cropper.value

    // 手动触发一次渲染
    setTimeout(() => {
      if (cropper.value && cropper.value.core && typeof cropper.value.core.render === 'function') {
        console.log('手动触发渲染')
        cropper.value.core.render()
      }
    }, 100)

    // 设置事件监听器
    if (cropper.value) {
      cropper.value.on('cropend', (data: any) => {
        console.log('裁剪数据变化:', data)
        cropData.value = data
      })

      cropper.value.on('ready', () => {
        console.log('图片加载完成')
      })

      cropper.value.on('error', (error: Error) => {
        console.error('裁剪器错误:', error)
        alert('图片加载失败，请重试')
      })

      // 监听工具栏的裁剪事件
      if (cropperContainer.value) {
        cropperContainer.value.addEventListener('crop', (event: any) => {
          console.log('工具栏裁剪事件触发:', event.detail)
          getCroppedResult()
        })
      }
    }
  } catch (error) {
    console.error('LDESIGN Cropper初始化失败:', error)
  }
})

onUnmounted(() => {
  // 销毁裁剪器
  destroy()
})

// 监听配置变化
watch(currentShape, (newShape) => {
  if (cropper.value && isReady.value) {
    cropper.value.setShape(newShape)
    console.log('裁剪形状已更新:', newShape)
  }
})

watch(currentAspectRatio, (newRatio) => {
  if (cropper.value && isReady.value) {
    cropper.value.setAspectRatio(newRatio)
    console.log('宽高比已更新:', newRatio)
  }
})
</script>

<style scoped>
.real-cropper {
  width: 100%;
  height: 500px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

/* 裁剪器占位符样式 */
.cropper-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.placeholder-content {
  text-align: center;
  color: var(--ldesign-text-color-placeholder, #999);
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.placeholder-text {
  font-size: 16px;
  font-weight: 500;
}

/* 裁剪器容器样式 */
.cropper-container {
  width: 100%;
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 确保裁剪器内容正确显示 */
:deep(.l-cropper-container) {
  width: 100%;
  height: 100%;
  background: #000;
}

:deep(.l-cropper-canvas) {
  max-width: 100%;
  max-height: 100%;
}

/* 优化裁剪框样式 */
:deep(.l-cropper-crop-box) {
  border: 2px solid var(--ldesign-brand-color, #722ED1);
  background: rgba(114, 46, 209, 0.1);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

/* 裁剪框控制点样式 */
:deep(.l-cropper-control-point) {
  width: 12px;
  height: 12px;
  background: var(--ldesign-brand-color, #722ED1);
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

:deep(.l-cropper-control-point:hover) {
  transform: scale(1.2);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* 裁剪框边框线条 */
:deep(.l-cropper-crop-box::before) {
  content: '';
  position: absolute;
  top: 33.33%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
}

:deep(.l-cropper-crop-box::after) {
  content: '';
  position: absolute;
  top: 66.66%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
}

/* 垂直网格线 */
:deep(.l-cropper-crop-box .grid-line-v1) {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 33.33%;
  width: 1px;
  background: rgba(255, 255, 255, 0.5);
}

:deep(.l-cropper-crop-box .grid-line-v2) {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 66.66%;
  width: 1px;
  background: rgba(255, 255, 255, 0.5);
}

/* 信息面板样式 */
.info-panel {
  flex: 0 0 300px;
  padding: 24px;
  background: var(--ldesign-bg-color-container);
  border-left: 1px solid var(--ldesign-border-color);
  overflow-y: auto;
}

.info-text {
  margin: 0 0 16px 0;
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-primary);
  font-weight: 500;
}

.info-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.info-list li {
  margin-bottom: 12px;
  padding: 12px;
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-xs);
  color: var(--ldesign-text-color-secondary);
  line-height: 1.5;
}

/* 工具栏样式优化 */
:deep(.ldesign-cropper__toolbar) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff, #f8f9fa);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 16px;
}

:deep(.ldesign-cropper__toolbar-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--ldesign-border-color);
  border-radius: 6px;
  background: white;
  color: var(--ldesign-text-color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

:deep(.ldesign-cropper__toolbar-button:hover) {
  background: var(--ldesign-brand-color-focus);
  border-color: var(--ldesign-brand-color);
  color: var(--ldesign-brand-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(114, 46, 209, 0.2);
}

:deep(.ldesign-cropper__toolbar-button:active) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(114, 46, 209, 0.2);
}

:deep(.ldesign-cropper__toolbar-button--active) {
  background: var(--ldesign-brand-color);
  border-color: var(--ldesign-brand-color);
  color: white;
}

:deep(.ldesign-cropper__toolbar-button--active:hover) {
  background: var(--ldesign-brand-color-hover);
  border-color: var(--ldesign-brand-color-hover);
  color: white;
}

:deep(.ldesign-cropper__toolbar-button svg) {
  width: 18px;
  height: 18px;
  stroke-width: 1.5;
}

:deep(.ldesign-cropper__toolbar-select) {
  min-width: 100px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--ldesign-border-color);
  border-radius: 6px;
  background: white;
  color: var(--ldesign-text-color-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.ldesign-cropper__toolbar-select:hover) {
  border-color: var(--ldesign-brand-color);
  box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
}

:deep(.ldesign-cropper__toolbar-select:focus) {
  outline: none;
  border-color: var(--ldesign-brand-color);
  box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
}
</style>
