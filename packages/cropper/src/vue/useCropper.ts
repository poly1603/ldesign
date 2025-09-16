/**
 * @ldesign/cropper - Vue Composition API Hook
 * 
 * 提供 Vue 3 Composition API 的裁剪器 Hook
 */

import { ref, onMounted, onUnmounted, watch, computed, nextTick, type Ref } from 'vue'
import type { 
  ImageSource, 
  CropData, 
  CropperConfig, 
  ExportOptions, 
  ExportResult,
  CropperEventData,
  AspectRatio,
  ImageMetadata
} from '../types'
import { Cropper } from '../core/Cropper'
import { DEFAULT_CONFIG } from '../constants'

/**
 * useCropper Hook 选项
 */
export interface UseCropperOptions {
  /** 初始配置 */
  config?: Partial<CropperConfig>
  /** 初始图像源 */
  src?: ImageSource
  /** 初始裁剪数据 */
  initialCropData?: Partial<CropData>
  /** 宽高比 */
  aspectRatio?: AspectRatio
  /** 是否自动初始化 */
  autoInit?: boolean
  /** 事件回调 */
  onReady?: (data: CropperEventData) => void
  onCropStart?: (data: CropperEventData) => void
  onCropMove?: (data: CropperEventData) => void
  onCropEnd?: (data: CropperEventData) => void
  onCropChange?: (data: CropperEventData) => void
  onImageLoad?: (data: CropperEventData) => void
  onImageError?: (data: CropperEventData) => void
  onError?: (error: Error) => void
}

/**
 * useCropper Hook 返回值
 */
export interface UseCropperReturn {
  /** 容器元素引用 */
  containerRef: Ref<HTMLElement | undefined>
  /** 裁剪器实例 */
  cropperInstance: Ref<Cropper | null>
  /** 当前裁剪数据 */
  cropData: Ref<CropData | null>
  /** 图像元数据 */
  imageMetadata: Ref<ImageMetadata | null>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<string | null>
  /** 是否就绪 */
  isReady: Ref<boolean>
  
  // 方法
  /** 初始化裁剪器 */
  initialize: (container: HTMLElement) => Promise<void>
  /** 设置图像源 */
  setImageSource: (src: ImageSource) => Promise<void>
  /** 获取裁剪数据 */
  getCropData: () => CropData | null
  /** 设置裁剪区域 */
  setCropArea: (area: { x: number; y: number; width: number; height: number }) => void
  /** 设置宽高比 */
  setAspectRatio: (ratio: AspectRatio) => void
  /** 旋转 */
  rotate: (angle: number) => void
  /** 缩放 */
  scale: (factor: number) => void
  /** 翻转 */
  flip: (horizontal?: boolean, vertical?: boolean) => void
  /** 重置 */
  reset: () => void
  /** 导出图像 */
  exportImage: (options?: ExportOptions) => Promise<ExportResult>
  /** 销毁 */
  destroy: () => void
  /** 更新配置 */
  updateConfig: (config: Partial<CropperConfig>) => void
}

/**
 * Vue 3 Composition API Hook for Image Cropper
 * 
 * @param options Hook 选项
 * @returns Hook 返回值
 */
export function useCropper(options: UseCropperOptions = {}): UseCropperReturn {
  const {
    config = {},
    src,
    initialCropData,
    aspectRatio = 'free',
    autoInit = true,
    onReady,
    onCropStart,
    onCropMove,
    onCropEnd,
    onCropChange,
    onImageLoad,
    onImageError,
    onError
  } = options

  // 响应式状态
  const containerRef = ref<HTMLElement>()
  const cropperInstance = ref<Cropper | null>(null)
  const cropData = ref<CropData | null>(null)
  const imageMetadata = ref<ImageMetadata | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isReady = ref(false)

  // 合并配置
  const mergedConfig = computed(() => ({
    ...DEFAULT_CONFIG,
    ...config
  }))

  // 初始化裁剪器
  const initialize = async (container?: HTMLElement) => {
    const targetContainer = container || containerRef.value
    if (!targetContainer) {
      throw new Error('Container element is required')
    }

    try {
      loading.value = true
      error.value = null
      isReady.value = false

      // 创建裁剪器实例
      cropperInstance.value = new Cropper(targetContainer, mergedConfig.value)

      // 设置事件监听器
      setupEventListeners()

      // 设置图像源
      if (src) {
        await cropperInstance.value.setImageSource(src)
      }

      // 设置初始裁剪数据
      if (initialCropData) {
        updateCropDataInternal(initialCropData)
      }

      // 设置宽高比
      if (aspectRatio !== 'free') {
        cropperInstance.value.setAspectRatio(aspectRatio)
      }

      isReady.value = true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '初始化失败'
      error.value = errorMessage
      onError?.(err as Error)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 设置事件监听器
  const setupEventListeners = () => {
    if (!cropperInstance.value) return

    cropperInstance.value.on('ready', (data) => {
      isReady.value = true
      imageMetadata.value = data.imageMetadata || null
      cropData.value = data.cropData || null
      onReady?.(data)
    })

    cropperInstance.value.on('cropStart', (data) => {
      onCropStart?.(data)
    })

    cropperInstance.value.on('cropMove', (data) => {
      cropData.value = data.cropData || null
      onCropMove?.(data)
    })

    cropperInstance.value.on('cropEnd', (data) => {
      cropData.value = data.cropData || null
      onCropEnd?.(data)
    })

    cropperInstance.value.on('cropChange', (data) => {
      cropData.value = data.cropData || null
      onCropChange?.(data)
    })

    cropperInstance.value.on('imageLoad', (data) => {
      imageMetadata.value = data.imageMetadata || null
      onImageLoad?.(data)
    })

    cropperInstance.value.on('imageError', (data) => {
      error.value = data.error?.message || '图像加载失败'
      onImageError?.(data)
    })
  }

  // 设置图像源
  const setImageSource = async (newSrc: ImageSource) => {
    if (!cropperInstance.value) {
      throw new Error('Cropper not initialized')
    }

    try {
      loading.value = true
      error.value = null
      await cropperInstance.value.setImageSource(newSrc)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '图像加载失败'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取裁剪数据
  const getCropData = (): CropData | null => {
    return cropperInstance.value?.getCropData() || null
  }

  // 设置裁剪区域
  const setCropArea = (area: { x: number; y: number; width: number; height: number }) => {
    if (!cropperInstance.value) return
    cropperInstance.value.setCropArea(area)
    cropData.value = cropperInstance.value.getCropData()
  }

  // 设置宽高比
  const setAspectRatio = (ratio: AspectRatio) => {
    if (!cropperInstance.value) return
    cropperInstance.value.setAspectRatio(ratio)
    cropData.value = cropperInstance.value.getCropData()
  }

  // 旋转
  const rotate = (angle: number) => {
    if (!cropperInstance.value) return
    cropperInstance.value.rotate(angle)
    cropData.value = cropperInstance.value.getCropData()
  }

  // 缩放
  const scale = (factor: number) => {
    if (!cropperInstance.value) return
    cropperInstance.value.scale(factor)
    cropData.value = cropperInstance.value.getCropData()
  }

  // 翻转
  const flip = (horizontal?: boolean, vertical?: boolean) => {
    if (!cropperInstance.value) return
    cropperInstance.value.flip(horizontal, vertical)
    cropData.value = cropperInstance.value.getCropData()
  }

  // 重置
  const reset = () => {
    if (!cropperInstance.value) return
    cropperInstance.value.reset()
    cropData.value = cropperInstance.value.getCropData()
  }

  // 导出图像
  const exportImage = async (exportOptions?: ExportOptions): Promise<ExportResult> => {
    if (!cropperInstance.value) {
      throw new Error('Cropper not initialized')
    }

    try {
      return await cropperInstance.value.export(exportOptions)
    } catch (err) {
      onError?.(err as Error)
      throw err
    }
  }

  // 销毁
  const destroy = () => {
    if (cropperInstance.value) {
      cropperInstance.value.destroy()
      cropperInstance.value = null
    }
    
    // 重置状态
    cropData.value = null
    imageMetadata.value = null
    loading.value = false
    error.value = null
    isReady.value = false
  }

  // 更新配置
  const updateConfig = (newConfig: Partial<CropperConfig>) => {
    if (!cropperInstance.value) return
    cropperInstance.value.updateConfig(newConfig)
  }

  // 内部更新裁剪数据
  const updateCropDataInternal = (data: Partial<CropData>) => {
    if (!cropperInstance.value) return

    if (data.area) {
      cropperInstance.value.setCropArea(data.area)
    }
    
    if (data.aspectRatio) {
      cropperInstance.value.setAspectRatio(data.aspectRatio)
    }

    cropData.value = cropperInstance.value.getCropData()
  }

  // 监听容器变化，自动初始化
  watch(containerRef, (newContainer) => {
    if (newContainer && autoInit && !cropperInstance.value) {
      nextTick(() => {
        initialize(newContainer)
      })
    }
  })

  // 生命周期
  onMounted(() => {
    if (autoInit && containerRef.value) {
      nextTick(() => {
        initialize()
      })
    }
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    // 响应式状态
    containerRef,
    cropperInstance,
    cropData,
    imageMetadata,
    loading,
    error,
    isReady,

    // 方法
    initialize,
    setImageSource,
    getCropData,
    setCropArea,
    setAspectRatio,
    rotate,
    scale,
    flip,
    reset,
    exportImage,
    destroy,
    updateConfig
  }
}
