<script setup lang="ts">
import type {
  QRCodeError,
  QRCodeOptions,
  QRCodeResult,
} from '../types'
import type {
  QRCodeProps,
  QRCodeEmits,
  QRCodeInstance,
} from './types'
import {
  computed,
  type CSSProperties,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import { useQRCode } from './useQRCode'

// Props定义
const props = withDefaults(defineProps<QRCodeProps>(), {
  data: '',
  text: '',
  format: 'canvas',
  size: 200,
  width: 200,
  height: undefined,
  errorCorrectionLevel: 'M',
  margin: 1,
  showDownloadButton: false,
  downloadButtonText: 'Download',
  downloadFilename: 'qrcode',
  autoGenerate: true,
})

// Emits定义
const emit = defineEmits<QRCodeEmits>()

// 响应式引用
const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()
const svgRef = ref<HTMLDivElement>()
const imageRef = ref<HTMLImageElement>()

// 计算属性
const qrCodeOptions = computed<QRCodeOptions>(() => ({
  data: props.data || props.text || '',
  format: props.format,
  size: props.size || props.width,
  errorCorrectionLevel: props.errorCorrectionLevel,
  margin: props.margin,
  logo: props.logo,
  style: props.style,
}))

const actualWidth = computed(() => props.width)
const actualHeight = computed(() => props.height || props.width)

const containerStyle = computed<CSSProperties>(() => ({
  width: `${actualWidth.value}px`,
  height: `${actualHeight.value}px`,
  position: 'relative',
  display: 'inline-block',
}))

// 使用QRCode Hook
const {
  result,
  loading,
  error,
  generate,
  download,
  clearCache,
  getMetrics,
  getCacheStats,
  reset,
  destroy,
  generator,
} = useQRCode()

// 计算属性：获取不同格式的元素
const canvasElement = computed(() => {
  return result.value?.format === 'canvas' ? result.value.element as HTMLCanvasElement : null
})

const svgElement = computed(() => {
  return result.value?.format === 'svg' ? result.value.element as SVGElement : null
})

const imageElement = computed(() => {
  return result.value?.format === 'image' ? result.value.element as HTMLImageElement : null
})

const svgHTML = computed(() => {
  if (!svgElement.value)
    return ''
  return new XMLSerializer().serializeToString(svgElement.value)
})

// 方法
async function generateQRCode() {
  const dataText = props.data || props.text || ''

  try {
    const qrResult = await generate(dataText, qrCodeOptions.value)

    // 如果 Hook 记录了错误，则触发错误事件
    if (error.value) {
      emit('error', error.value)
      return
    }

    const toEmit = qrResult || result.value
    if (toEmit) {
      // 先发出事件，确保测试能捕捉到
      emit('generated', toEmit)
      // 然后渲染到 DOM
      await nextTick()
      await renderToDom(toEmit)
    }
  }
  catch (err) {
    const qrError = err as QRCodeError
    emit('error', qrError)
  }
}

async function renderToDom(qrResult: QRCodeResult) {
  switch (qrResult.format) {
    case 'canvas':
      await renderCanvas(qrResult.element as HTMLCanvasElement)
      break
    case 'svg':
      // SVG通过v-html渲染，无需额外处理
      break
    case 'image':
      // Image通过src属性渲染，无需额外处理
      break
  }
}

async function renderCanvas(sourceCanvas: HTMLCanvasElement) {
  if (!canvasRef.value)
    return

  const targetCanvas = canvasRef.value
  const ctx = targetCanvas.getContext('2d')
  if (!ctx)
    return

  // 清除画布
  ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height)

  // 绘制源画布内容
  ctx.drawImage(sourceCanvas, 0, 0, targetCanvas.width, targetCanvas.height)
}

async function handleDownload() {
  if (!result.value)
    return

  try {
    await download(result.value, props.downloadFilename)
    emit('download', result.value)
  }
  catch (err) {
    const qrError = err as QRCodeError
    emit('error', qrError)
  }
}

// 重新生成二维码
async function regenerate() {
  return await generateQRCode()
}

// 暴露方法给父组件
defineExpose<QRCodeInstance>({
  regenerate,
  download: handleDownload,
  getMetrics,
  getCacheStats,
  clearCache,
  reset,
})

// 监听器
watch(
  [() => props.data || props.text, qrCodeOptions],
  () => {
    if (props.autoGenerate) {
      generateQRCode()
    }
  },
  { deep: true, immediate: true },
)

// 同步错误事件：当 Hook 的 error 状态变化为非空时，向外发出 error 事件，
// 以避免某些异步时序下事件丢失
watch(error, (val) => {
  if (val) emit('error', val)
})

// 生命周期
onMounted(() => {
  if (props.autoGenerate) {
    generateQRCode()
  }
})

onUnmounted(() => {
  destroy()
})
</script>

<template>
  <div
    ref="containerRef"
    class="qrcode-container l-qrcode" :class="[
      {
        'l-qrcode--loading': loading,
        'l-qrcode--error': !!error,
      },
    ]"
    :style="containerStyle"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="l-qrcode__loading">
      <slot name="loading">
        <div class="l-qrcode__spinner" />
      </slot>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="l-qrcode__error">
      <slot name="error" :error="error">
        <div class="l-qrcode__error-message">
          {{ error.message }}
        </div>
      </slot>
    </div>

    <!-- 二维码内容 -->
    <div v-else class="l-qrcode__content">
      <!-- Canvas渲染 -->
      <canvas
        v-if="props.format === 'canvas' && result"
        ref="canvasRef"
        :width="actualWidth"
        :height="actualHeight"
        class="l-qrcode__canvas"
      />

      <!-- SVG渲染 -->
      <div
        v-else-if="props.format === 'svg' && result"
        ref="svgRef"
        class="l-qrcode__svg qrcode-svg"
        v-html="svgHTML"
      />

      <!-- Image渲染 -->
      <img
        v-else-if="props.format === 'image' && result"
        ref="imageRef"
        :src="result?.dataURL || ''"
        :width="actualWidth"
        :height="actualHeight"
        :alt="`QR Code: ${props.data || props.text}`"
        class="l-qrcode__image"
      >
    </div>

    <!-- 下载按钮 -->
    <button
      v-if="props.showDownloadButton && !loading && !error"
      class="l-qrcode__download-btn"
      type="button"
      @click="handleDownload"
    >
      <slot name="download-icon">
        📥
      </slot>
      {{ props.downloadButtonText }}
    </button>
  </div>
</template>

<style scoped>
.l-qrcode {
  position: relative;
  display: inline-block;
  border-radius: 4px;
  overflow: hidden;
}

.l-qrcode--loading {
  background-color: #f5f5f5;
}

.l-qrcode--error {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
}

.l-qrcode__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.l-qrcode__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1890ff;
  border-radius: 50%;
  animation: l-qrcode-spin 1s linear infinite;
}

@keyframes l-qrcode-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.l-qrcode__error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.l-qrcode__error-message {
  color: #ff4d4f;
  font-size: 12px;
  text-align: center;
  padding: 8px;
}

.l-qrcode__content {
  width: 100%;
  height: 100%;
}

.l-qrcode__canvas,
.l-qrcode__svg,
.l-qrcode__image {
  width: 100%;
  height: 100%;
  display: block;
}

.l-qrcode__download-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
}

.l-qrcode:hover .l-qrcode__download-btn {
  opacity: 1;
}

.l-qrcode__download-btn:hover {
  background-color: rgba(0, 0, 0, 0.9);
}
</style>
