/**
 * Vue 3 Adapter - Complete implementation with Component, Composable, and Directive
 */

import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  h,
  type PropType
} from 'vue'
import { Cropper } from '../../core/Cropper'
import type { CropperOptions, GetCroppedCanvasOptions, ToolbarOptions } from '../../types'
import '../../styles/cropper.css'

// Export composable and directive
export { useCropper } from './useCropper'
export type { UseCropperOptions } from './useCropper'
export { vCropper, cropperDirective, getCropperInstance } from './directive'
export type { CropperDirectiveValue } from './directive'

export const VueCropper = defineComponent({
  name: 'VueCropper',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: String,
    aspectRatio: Number,
    viewMode: {
      type: Number as PropType<0 | 1 | 2 | 3>,
      default: 0
    },
    dragMode: {
      type: String as PropType<'crop' | 'move' | 'none'>,
      default: 'crop'
    },
    autoCrop: {
      type: Boolean,
      default: true
    },
    autoCropArea: {
      type: Number,
      default: 0.8
    },
    movable: {
      type: Boolean,
      default: true
    },
    rotatable: {
      type: Boolean,
      default: true
    },
    scalable: {
      type: Boolean,
      default: true
    },
    zoomable: {
      type: Boolean,
      default: true
    },
    zoomOnTouch: {
      type: Boolean,
      default: true
    },
    zoomOnWheel: {
      type: Boolean,
      default: true
    },
    cropBoxMovable: {
      type: Boolean,
      default: true
    },
    cropBoxResizable: {
      type: Boolean,
      default: true
    },
    background: {
      type: Boolean,
      default: true
    },
    guides: {
      type: Boolean,
      default: true
    },
    center: {
      type: Boolean,
      default: true
    },
    highlight: {
      type: Boolean,
      default: true
    },
    responsive: {
      type: Boolean,
      default: true
    },
    cropBoxStyle: {
      type: String as PropType<'default' | 'rounded' | 'circle' | 'minimal' | 'dotted' | 'solid' | 'gradient'>,
      default: 'default'
    },
    themeColor: {
      type: String,
      default: '#39f'
    },
    skewable: {
      type: Boolean,
      default: true
    },
    translatable: {
      type: Boolean,
      default: true
    },
  scaleStep: {
    type: Number,
    default: 0.1
  },
  toolbar: {
    type: [Boolean, Object] as PropType<boolean | ToolbarOptions>,
    default: true
  },
  onToolbarCrop: {
    type: Function as PropType<(canvas: HTMLCanvasElement) => void>
  }
  },
  emits: ['ready', 'cropstart', 'cropmove', 'cropend', 'crop', 'zoom'],
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLDivElement>()
    const cropperInstance = ref<Cropper>()

    const initCropper = () => {
      if (!containerRef.value) return

      const options: CropperOptions = {
        src: props.src,
        alt: props.alt,
        aspectRatio: props.aspectRatio,
        viewMode: props.viewMode,
        dragMode: props.dragMode,
        autoCrop: props.autoCrop,
        autoCropArea: props.autoCropArea,
        movable: props.movable,
        rotatable: props.rotatable,
        scalable: props.scalable,
        zoomable: props.zoomable,
        zoomOnTouch: props.zoomOnTouch,
        zoomOnWheel: props.zoomOnWheel,
        cropBoxMovable: props.cropBoxMovable,
        cropBoxResizable: props.cropBoxResizable,
        background: props.background,
        guides: props.guides,
        center: props.center,
        highlight: props.highlight,
        responsive: props.responsive,
        cropBoxStyle: props.cropBoxStyle,
        themeColor: props.themeColor,
        skewable: props.skewable,
        translatable: props.translatable,
        scaleStep: props.scaleStep,
        toolbar: props.toolbar,
        onToolbarCrop: props.onToolbarCrop,
        ready: (e) => emit('ready', e),
        cropstart: (e) => emit('cropstart', e),
        cropmove: (e) => emit('cropmove', e),
        cropend: (e) => emit('cropend', e),
        crop: (e) => emit('crop', e),
        zoom: (e) => emit('zoom', e)
      }

      cropperInstance.value = new Cropper(containerRef.value, options)
    }

    onMounted(() => {
      initCropper()
    })

    onBeforeUnmount(() => {
      if (cropperInstance.value) {
        cropperInstance.value.destroy()
      }
    })

    // Watch src changes
    watch(
      () => props.src,
      (newSrc) => {
        if (cropperInstance.value && newSrc) {
          cropperInstance.value.replace(newSrc)
        }
      }
    )

    // Watch aspectRatio changes
    watch(
      () => props.aspectRatio,
      (newRatio) => {
        if (cropperInstance.value) {
          cropperInstance.value.setData({ width: 0, height: 0 })
        }
      }
    )

    // Watch cropBoxStyle changes
    watch(
      () => props.cropBoxStyle,
      (newStyle) => {
        if (cropperInstance.value) {
          cropperInstance.value.setCropBoxStyle(newStyle)
        }
      }
    )

    // Watch themeColor changes
    watch(
      () => props.themeColor,
      (newColor) => {
        if (newColor) {
          document.documentElement.style.setProperty('--cropper-theme-color', newColor)
        }
      }
    )

    // Expose methods
    expose({
      getCropper: () => cropperInstance.value,
      getCroppedCanvas: (options?: GetCroppedCanvasOptions) =>
        cropperInstance.value?.getCroppedCanvas(options),
      getData: (rounded?: boolean) => cropperInstance.value?.getData(rounded),
      setData: (data: any) => cropperInstance.value?.setData(data),
      rotate: (degrees: number) => cropperInstance.value?.rotate(degrees),
      scale: (scaleX: number, scaleY?: number) =>
        cropperInstance.value?.scale(scaleX, scaleY),
      scaleX: (scaleX: number) => cropperInstance.value?.scaleX(scaleX),
      scaleY: (scaleY: number) => cropperInstance.value?.scaleY(scaleY),
      reset: () => cropperInstance.value?.reset(),
      clear: () => cropperInstance.value?.clear(),
      enable: () => cropperInstance.value?.enable(),
      disable: () => cropperInstance.value?.disable(),
      destroy: () => cropperInstance.value?.destroy()
    })

    return () =>
      h('div', {
        ref: containerRef,
        class: 'vue-cropper-container',
        style: {
          width: '100%',
          height: '100%'
        }
      })
  }
})

export default VueCropper
