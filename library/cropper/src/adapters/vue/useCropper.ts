/**
 * Vue Composable for Cropper
 */

import { ref, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'
import { Cropper } from '../../core/Cropper'
import type { CropperOptions, GetCroppedCanvasOptions } from '../../types'

export interface UseCropperOptions extends Omit<CropperOptions, 'src'> {
  src?: string
  onReady?: (cropper: Cropper) => void
  onCrop?: (data: any) => void
  onZoom?: (event: CustomEvent) => void
}

export function useCropper(
  containerRef: Ref<HTMLElement | undefined>,
  options: UseCropperOptions = {}
) {
  const cropperInstance = ref<Cropper>()
  const cropData = ref<any>({})
  const imageData = ref<any>({})
  const canvasData = ref<any>({})
  const isReady = ref(false)

  const initCropper = () => {
    if (!containerRef.value) return

    const { src, onReady, onCrop, onZoom, ...cropperOptions } = options

    cropperInstance.value = new Cropper(containerRef.value, {
      ...cropperOptions,
      src: src || '',
      ready: (e) => {
        isReady.value = true
        onReady?.(cropperInstance.value!)
      },
      crop: (e) => {
        cropData.value = e.detail
        onCrop?.(e.detail)
      },
      zoom: (e) => {
        onZoom?.(e)
      }
    })
  }

  const destroyCropper = () => {
    if (cropperInstance.value) {
      cropperInstance.value.destroy()
      cropperInstance.value = undefined
      isReady.value = false
    }
  }

  // Methods
  const replace = (src: string) => {
    return cropperInstance.value?.replace(src)
  }

  const getCroppedCanvas = (options?: GetCroppedCanvasOptions) => {
    return cropperInstance.value?.getCroppedCanvas(options)
  }

  const getData = (rounded?: boolean) => {
    return cropperInstance.value?.getData(rounded)
  }

  const setData = (data: any) => {
    return cropperInstance.value?.setData(data)
  }

  const getImageData = () => {
    imageData.value = cropperInstance.value?.getImageData()
    return imageData.value
  }

  const getCanvasData = () => {
    // getCanvasData method doesn't exist, use getData instead
    const data = cropperInstance.value?.getData()
    canvasData.value = data
    return data
  }

  const rotate = (degrees: number) => {
    return cropperInstance.value?.rotate(degrees)
  }

  const scale = (scaleX: number, scaleY?: number) => {
    return cropperInstance.value?.scale(scaleX, scaleY)
  }

  const scaleX = (scale: number) => {
    return cropperInstance.value?.scaleX(scale)
  }

  const scaleY = (scale: number) => {
    return cropperInstance.value?.scaleY(scale)
  }

  const move = (offsetX: number, offsetY: number = 0) => {
    return cropperInstance.value?.move(offsetX, offsetY)
  }

  const reset = () => {
    return cropperInstance.value?.reset()
  }

  const clear = () => {
    return cropperInstance.value?.clear()
  }

  const enable = () => {
    return cropperInstance.value?.enable()
  }

  const disable = () => {
    return cropperInstance.value?.disable()
  }

  const setCropBoxStyle = (style: 'default' | 'rounded' | 'circle' | 'minimal' | 'dotted' | 'solid' | 'gradient') => {
    return cropperInstance.value?.setCropBoxStyle(style)
  }

  // Lifecycle
  onMounted(() => {
    initCropper()
  })

  onBeforeUnmount(() => {
    destroyCropper()
  })

  // Watch for src changes
  watch(
    () => options.src,
    (newSrc) => {
      if (newSrc && cropperInstance.value) {
        replace(newSrc)
      }
    }
  )

  return {
    // Instance
    cropperInstance,
    
    // State
    isReady,
    cropData,
    imageData,
    canvasData,
    
    // Methods
    replace,
    getCroppedCanvas,
    getData,
    setData,
    getImageData,
    getCanvasData,
    rotate,
    scale,
    scaleX,
    scaleY,
    move,
    reset,
    clear,
    enable,
    disable,
    setCropBoxStyle,
    
    // Lifecycle
    destroy: destroyCropper
  }
}