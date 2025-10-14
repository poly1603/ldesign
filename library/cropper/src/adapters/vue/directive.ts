/**
 * Vue Directive for Cropper
 */

import type { Directive, DirectiveBinding } from 'vue'
import { Cropper } from '../../core/Cropper'
import type { CropperOptions } from '../../types'

const cropperMap = new WeakMap<HTMLElement, Cropper>()

export interface CropperDirectiveValue extends CropperOptions {
  onReady?: (cropper: Cropper) => void
  onCrop?: (data: any) => void
  onZoom?: (event: CustomEvent) => void
}

export const vCropper: Directive<HTMLElement, CropperDirectiveValue> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<CropperDirectiveValue>) {
    const options = binding.value || {}
    const { onReady, onCrop, onZoom, ...cropperOptions } = options

    const cropper = new Cropper(el, {
      ...cropperOptions,
      ready: (e) => {
        onReady?.(cropper)
        // Emit event on element
        el.dispatchEvent(new CustomEvent('cropper:ready', { detail: cropper }))
      },
      crop: (e) => {
        onCrop?.(e.detail)
        // Emit event on element
        el.dispatchEvent(new CustomEvent('cropper:crop', { detail: e.detail }))
      },
      zoom: (e) => {
        onZoom?.(e)
        // Emit event on element
        el.dispatchEvent(new CustomEvent('cropper:zoom', { detail: e.detail }))
      }
    })

    cropperMap.set(el, cropper)
    
    // Expose cropper instance on element
    ;(el as any).__cropper__ = cropper
  },

  updated(el: HTMLElement, binding: DirectiveBinding<CropperDirectiveValue>) {
    const cropper = cropperMap.get(el)
    if (!cropper) return

    const newOptions = binding.value || {}
    const oldOptions = binding.oldValue || {}

    // Update src if changed
    if (newOptions.src !== oldOptions.src && newOptions.src) {
      cropper.replace(newOptions.src)
    }

    // Update aspect ratio if changed
    if (newOptions.aspectRatio !== oldOptions.aspectRatio) {
      cropper.setData({ width: 0, height: 0 })
    }

    // Update crop box style if changed
    if (newOptions.cropBoxStyle !== oldOptions.cropBoxStyle && newOptions.cropBoxStyle) {
      cropper.setCropBoxStyle(newOptions.cropBoxStyle)
    }

    // Update theme color if changed
    if (newOptions.themeColor !== oldOptions.themeColor && newOptions.themeColor) {
      document.documentElement.style.setProperty('--cropper-theme-color', newOptions.themeColor)
    }
  },

  unmounted(el: HTMLElement) {
    const cropper = cropperMap.get(el)
    if (cropper) {
      cropper.destroy()
      cropperMap.delete(el)
      delete (el as any).__cropper__
    }
  }
}

// Alias for v-cropper
export const cropperDirective = vCropper

// Helper function to get cropper instance from element
export function getCropperInstance(el: HTMLElement): Cropper | undefined {
  return cropperMap.get(el) || (el as any).__cropper__
}