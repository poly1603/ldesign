/**
 * @file Vue 3 适配器
 * @description 为 Vue 3 提供的裁剪器组件
 */

import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
  type PropType,
  type Ref,
} from 'vue'

import { Cropper } from '../../core/Cropper'
import type {
  CropperOptions,
  CropData,
  ImageInfo,
  ImageSource,
  CropperEventType,
  CropOutputOptions,
} from '../../types'

/**
 * Vue 裁剪器组件的 Props 类型
 */
export interface VueCropperProps extends Omit<CropperOptions, 'container'> {
  /** 图片源 */
  src?: ImageSource
  /** 是否立即初始化 */
  immediate?: boolean
  /** 容器类名 */
  containerClass?: string
  /** 容器样式 */
  containerStyle?: Record<string, any>
}

/**
 * Vue 裁剪器组件的 Emits 类型
 */
export interface VueCropperEmits {
  ready: []
  imageLoaded: [imageInfo: ImageInfo]
  imageError: [error: Error]
  cropChange: [cropData: CropData]
  cropStart: []
  cropMove: [cropData: CropData]
  cropEnd: [cropData: CropData]
  zoomChange: [scale: number]
  rotationChange: [rotation: number]
  flipChange: [flipX: boolean, flipY: boolean]
  dragStart: []
  dragMove: [cropData: CropData]
  dragEnd: [cropData: CropData]
  reset: []
  destroy: []
}

/**
 * Vue 裁剪器组件
 */
export const VueCropper = defineComponent({
  name: 'VueCropper',
  props: {
    // 图片源
    src: {
      type: [String, File, HTMLImageElement] as PropType<ImageSource>,
      default: undefined,
    },
    
    // 裁剪器配置
    shape: {
      type: String as PropType<CropperOptions['shape']>,
      default: 'rectangle',
    },
    aspectRatio: {
      type: Number,
      default: 0,
    },
    initialCrop: {
      type: Object as PropType<CropperOptions['initialCrop']>,
      default: undefined,
    },
    minCropSize: {
      type: Object as PropType<CropperOptions['minCropSize']>,
      default: undefined,
    },
    maxCropSize: {
      type: Object as PropType<CropperOptions['maxCropSize']>,
      default: undefined,
    },
    movable: {
      type: Boolean,
      default: true,
    },
    resizable: {
      type: Boolean,
      default: true,
    },
    zoomable: {
      type: Boolean,
      default: true,
    },
    rotatable: {
      type: Boolean,
      default: true,
    },
    zoomRange: {
      type: Array as PropType<[number, number]>,
      default: () => [0.1, 10],
    },
    backgroundColor: {
      type: String,
      default: '#000000',
    },
    maskOpacity: {
      type: Number,
      default: 0.6,
    },
    guides: {
      type: Boolean,
      default: true,
    },
    centerLines: {
      type: Boolean,
      default: false,
    },
    responsive: {
      type: Boolean,
      default: true,
    },
    touchEnabled: {
      type: Boolean,
      default: true,
    },
    autoCrop: {
      type: Boolean,
      default: true,
    },
    preview: {
      type: Object as PropType<CropperOptions['preview']>,
      default: undefined,
    },
    
    // Vue 特有配置
    immediate: {
      type: Boolean,
      default: true,
    },
    containerClass: {
      type: String,
      default: '',
    },
    containerStyle: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
  },

  emits: {
    ready: () => true,
    imageLoaded: (imageInfo: ImageInfo) => true,
    imageError: (error: Error) => true,
    cropChange: (cropData: CropData) => true,
    cropStart: () => true,
    cropMove: (cropData: CropData) => true,
    cropEnd: (cropData: CropData) => true,
    zoomChange: (scale: number) => true,
    rotationChange: (rotation: number) => true,
    flipChange: (flipX: boolean, flipY: boolean) => true,
    dragStart: () => true,
    dragMove: (cropData: CropData) => true,
    dragEnd: (cropData: CropData) => true,
    reset: () => true,
    destroy: () => true,
  },

  setup(props, { emit, expose }) {
    const containerRef: Ref<HTMLElement | null> = ref(null)
    const cropperInstance: Ref<Cropper | null> = ref(null)
    const isReady = ref(false)

    /**
     * 初始化裁剪器
     */
    const initCropper = async () => {
      if (!containerRef.value) return

      try {
        const options: CropperOptions = {
          container: containerRef.value,
          shape: props.shape,
          aspectRatio: props.aspectRatio,
          initialCrop: props.initialCrop,
          minCropSize: props.minCropSize,
          maxCropSize: props.maxCropSize,
          movable: props.movable,
          resizable: props.resizable,
          zoomable: props.zoomable,
          rotatable: props.rotatable,
          zoomRange: props.zoomRange,
          backgroundColor: props.backgroundColor,
          maskOpacity: props.maskOpacity,
          guides: props.guides,
          centerLines: props.centerLines,
          responsive: props.responsive,
          touchEnabled: props.touchEnabled,
          autoCrop: props.autoCrop,
          preview: props.preview,
          
          // 事件回调
          onReady: () => {
            isReady.value = true
            emit('ready')
          },
        }

        cropperInstance.value = new Cropper(options)
        bindEvents()

        // 如果有初始图片源，加载它
        if (props.src) {
          await setImage(props.src)
        }
      } catch (error) {
        console.error('初始化裁剪器失败:', error)
        emit('imageError', error as Error)
      }
    }

    /**
     * 绑定事件
     */
    const bindEvents = () => {
      if (!cropperInstance.value) return

      const cropper = cropperInstance.value

      cropper.on('imageLoaded' as CropperEventType, (event) => {
        emit('imageLoaded', event.imageInfo!)
      })

      cropper.on('imageError' as CropperEventType, (event) => {
        emit('imageError', event.error)
      })

      cropper.on('cropChange' as CropperEventType, (event) => {
        emit('cropChange', event.cropData!)
      })

      cropper.on('cropStart' as CropperEventType, () => {
        emit('cropStart')
      })

      cropper.on('cropMove' as CropperEventType, (event) => {
        emit('cropMove', event.cropData!)
      })

      cropper.on('cropEnd' as CropperEventType, (event) => {
        emit('cropEnd', event.cropData!)
      })

      cropper.on('zoomChange' as CropperEventType, (event) => {
        emit('zoomChange', event.scale || 1)
      })

      cropper.on('rotationChange' as CropperEventType, (event) => {
        emit('rotationChange', event.rotation || 0)
      })

      cropper.on('flipChange' as CropperEventType, (event) => {
        emit('flipChange', event.flipX || false, event.flipY || false)
      })

      cropper.on('dragStart' as CropperEventType, () => {
        emit('dragStart')
      })

      cropper.on('dragMove' as CropperEventType, (event) => {
        emit('dragMove', event.cropData!)
      })

      cropper.on('dragEnd' as CropperEventType, (event) => {
        emit('dragEnd', event.cropData!)
      })

      cropper.on('reset' as CropperEventType, () => {
        emit('reset')
      })

      cropper.on('destroy' as CropperEventType, () => {
        emit('destroy')
      })
    }

    /**
     * 设置图片
     */
    const setImage = async (src: ImageSource) => {
      if (!cropperInstance.value) return
      await cropperInstance.value.setImage(src)
    }

    /**
     * 获取裁剪数据
     */
    const getCropData = (): CropData | null => {
      return cropperInstance.value?.getCropData() || null
    }

    /**
     * 设置裁剪数据
     */
    const setCropData = (data: Partial<CropData>) => {
      cropperInstance.value?.setCropData(data)
    }

    /**
     * 获取裁剪后的 Canvas
     */
    const getCroppedCanvas = (options?: CropOutputOptions): HTMLCanvasElement | null => {
      return cropperInstance.value?.getCroppedCanvas(options) || null
    }

    /**
     * 获取裁剪后的 DataURL
     */
    const getCroppedDataURL = (options?: CropOutputOptions): string | null => {
      return cropperInstance.value?.getCroppedDataURL(options) || null
    }

    /**
     * 获取裁剪后的 Blob
     */
    const getCroppedBlob = async (options?: CropOutputOptions): Promise<Blob | null> => {
      if (!cropperInstance.value) return null
      return await cropperInstance.value.getCroppedBlob(options)
    }

    /**
     * 缩放
     */
    const zoom = (scale: number) => {
      cropperInstance.value?.zoom(scale)
    }

    /**
     * 放大
     */
    const zoomIn = (delta?: number) => {
      cropperInstance.value?.zoomIn(delta)
    }

    /**
     * 缩小
     */
    const zoomOut = (delta?: number) => {
      cropperInstance.value?.zoomOut(delta)
    }

    /**
     * 旋转
     */
    const rotate = (angle: number) => {
      cropperInstance.value?.rotate(angle)
    }

    /**
     * 向左旋转
     */
    const rotateLeft = () => {
      cropperInstance.value?.rotateLeft()
    }

    /**
     * 向右旋转
     */
    const rotateRight = () => {
      cropperInstance.value?.rotateRight()
    }

    /**
     * 翻转
     */
    const flip = (horizontal: boolean, vertical: boolean) => {
      cropperInstance.value?.flip(horizontal, vertical)
    }

    /**
     * 水平翻转
     */
    const flipHorizontal = () => {
      cropperInstance.value?.flipHorizontal()
    }

    /**
     * 垂直翻转
     */
    const flipVertical = () => {
      cropperInstance.value?.flipVertical()
    }

    /**
     * 重置
     */
    const reset = () => {
      cropperInstance.value?.reset()
    }

    /**
     * 销毁
     */
    const destroy = () => {
      cropperInstance.value?.destroy()
      cropperInstance.value = null
      isReady.value = false
    }

    // 监听 src 变化
    watch(
      () => props.src,
      async (newSrc) => {
        if (newSrc && cropperInstance.value) {
          await setImage(newSrc)
        }
      }
    )

    // 组件挂载
    onMounted(async () => {
      if (props.immediate) {
        await nextTick()
        await initCropper()
      }
    })

    // 组件卸载
    onUnmounted(() => {
      destroy()
    })

    // 暴露方法给父组件
    expose({
      cropper: cropperInstance,
      isReady,
      initCropper,
      setImage,
      getCropData,
      setCropData,
      getCroppedCanvas,
      getCroppedDataURL,
      getCroppedBlob,
      zoom,
      zoomIn,
      zoomOut,
      rotate,
      rotateLeft,
      rotateRight,
      flip,
      flipHorizontal,
      flipVertical,
      reset,
      destroy,
    })

    return {
      containerRef,
      isReady,
    }
  },

  render() {
    const containerClass = [
      'vue-cropper-container',
      this.containerClass,
    ].filter(Boolean).join(' ')

    return (
      <div
        ref="containerRef"
        class={containerClass}
        style={{
          width: '100%',
          height: '400px',
          ...this.containerStyle,
        }}
      />
    )
  },
})

export default VueCropper

// 类型导出
export type VueCropperInstance = InstanceType<typeof VueCropper>
