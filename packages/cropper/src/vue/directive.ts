/**
 * @ldesign/cropper - Vue 指令
 * 
 * 提供 Vue 3 指令的裁剪器集成
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { CropperConfig, ImageSource, CropData } from '../types'
import { Cropper } from '../core/Cropper'
import { DEFAULT_CONFIG } from '../constants'

/**
 * 指令绑定值类型
 */
export interface CropperDirectiveValue {
  /** 图像源 */
  src?: ImageSource
  /** 配置选项 */
  config?: Partial<CropperConfig>
  /** 初始裁剪数据 */
  cropData?: Partial<CropData>
  /** 事件回调 */
  onReady?: (cropper: Cropper, data: any) => void
  onCropStart?: (cropper: Cropper, data: any) => void
  onCropMove?: (cropper: Cropper, data: any) => void
  onCropEnd?: (cropper: Cropper, data: any) => void
  onCropChange?: (cropper: Cropper, data: any) => void
  onImageLoad?: (cropper: Cropper, data: any) => void
  onImageError?: (cropper: Cropper, data: any) => void
  onError?: (cropper: Cropper, error: Error) => void
}

/**
 * 存储裁剪器实例的 WeakMap
 */
const cropperInstances = new WeakMap<HTMLElement, Cropper>()

/**
 * 创建裁剪器实例
 */
const createCropper = async (
  el: HTMLElement, 
  binding: DirectiveBinding<CropperDirectiveValue>
) => {
  const {
    src,
    config = {},
    cropData,
    onReady,
    onCropStart,
    onCropMove,
    onCropEnd,
    onCropChange,
    onImageLoad,
    onImageError,
    onError
  } = binding.value || {}

  try {
    // 合并配置
    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...config
    }

    // 创建裁剪器实例
    const cropper = new Cropper(el, mergedConfig)

    // 设置事件监听器
    if (onReady) {
      cropper.on('ready', (data) => onReady(cropper, data))
    }

    if (onCropStart) {
      cropper.on('cropStart', (data) => onCropStart(cropper, data))
    }

    if (onCropMove) {
      cropper.on('cropMove', (data) => onCropMove(cropper, data))
    }

    if (onCropEnd) {
      cropper.on('cropEnd', (data) => onCropEnd(cropper, data))
    }

    if (onCropChange) {
      cropper.on('cropChange', (data) => onCropChange(cropper, data))
    }

    if (onImageLoad) {
      cropper.on('imageLoad', (data) => onImageLoad(cropper, data))
    }

    if (onImageError) {
      cropper.on('imageError', (data) => onImageError(cropper, data))
    }

    // 设置图像源
    if (src) {
      await cropper.setImageSource(src)
    }

    // 设置初始裁剪数据
    if (cropData) {
      if (cropData.area) {
        cropper.setCropArea(cropData.area)
      }
      if (cropData.aspectRatio) {
        cropper.setAspectRatio(cropData.aspectRatio)
      }
    }

    // 存储实例
    cropperInstances.set(el, cropper)

  } catch (error) {
    console.error('Failed to create cropper:', error)
    if (onError) {
      const cropper = cropperInstances.get(el)
      if (cropper) {
        onError(cropper, error as Error)
      }
    }
  }
}

/**
 * 更新裁剪器
 */
const updateCropper = async (
  el: HTMLElement,
  binding: DirectiveBinding<CropperDirectiveValue>,
  oldBinding: DirectiveBinding<CropperDirectiveValue>
) => {
  const cropper = cropperInstances.get(el)
  if (!cropper) return

  const newValue = binding.value || {}
  const oldValue = oldBinding.value || {}

  try {
    // 更新图像源
    if (newValue.src && newValue.src !== oldValue.src) {
      await cropper.setImageSource(newValue.src)
    }

    // 更新配置
    if (newValue.config && newValue.config !== oldValue.config) {
      cropper.updateConfig(newValue.config)
    }

    // 更新裁剪数据
    if (newValue.cropData && newValue.cropData !== oldValue.cropData) {
      if (newValue.cropData.area) {
        cropper.setCropArea(newValue.cropData.area)
      }
      if (newValue.cropData.aspectRatio) {
        cropper.setAspectRatio(newValue.cropData.aspectRatio)
      }
    }

  } catch (error) {
    console.error('Failed to update cropper:', error)
    if (newValue.onError) {
      newValue.onError(cropper, error as Error)
    }
  }
}

/**
 * 销毁裁剪器
 */
const destroyCropper = (el: HTMLElement) => {
  const cropper = cropperInstances.get(el)
  if (cropper) {
    cropper.destroy()
    cropperInstances.delete(el)
  }
}

/**
 * Vue 3 裁剪器指令
 * 
 * 使用方式：
 * ```vue
 * <template>
 *   <div v-cropper="cropperOptions"></div>
 * </template>
 * 
 * <script setup>
 * import { ref } from 'vue'
 * 
 * const cropperOptions = ref({
 *   src: '/path/to/image.jpg',
 *   config: {
 *     theme: 'dark',
 *     responsive: true
 *   },
 *   onReady: (cropper, data) => {
 *     console.log('Cropper ready:', data)
 *   },
 *   onCropChange: (cropper, data) => {
 *     console.log('Crop changed:', data.cropData)
 *   }
 * })
 * </script>
 * ```
 */
export const vCropper: Directive<HTMLElement, CropperDirectiveValue> = {
  // 元素被插入到 DOM 中时调用
  mounted(el, binding) {
    // 确保元素有合适的样式
    if (!el.style.position || el.style.position === 'static') {
      el.style.position = 'relative'
    }
    
    if (!el.style.width) {
      el.style.width = '100%'
    }
    
    if (!el.style.height) {
      el.style.height = '400px'
    }

    // 创建裁剪器
    createCropper(el, binding)
  },

  // 绑定值更新时调用
  updated(el, binding, vnode, oldVnode) {
    const oldBinding = oldVnode.dirs?.find(dir => dir.dir === vCropper)
    if (oldBinding) {
      updateCropper(el, binding, oldBinding as DirectiveBinding<CropperDirectiveValue>)
    }
  },

  // 元素从 DOM 中移除时调用
  unmounted(el) {
    destroyCropper(el)
  }
}

/**
 * 获取指令绑定的裁剪器实例
 */
export const getCropperInstance = (el: HTMLElement): Cropper | undefined => {
  return cropperInstances.get(el)
}

/**
 * 指令安装函数
 */
export const install = (app: any) => {
  app.directive('cropper', vCropper)
}

// 默认导出指令
export default vCropper
