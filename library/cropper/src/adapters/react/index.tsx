/**
 * React Adapter - Complete implementation with Component and Hook
 */

import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  type CSSProperties
} from 'react'
import { Cropper } from '../../core/Cropper'
import type { CropperOptions, GetCroppedCanvasOptions, CropData } from '../../types'
import '../../styles/cropper.css'

// Export hook
export { useCropper } from './useCropper'
export type { UseCropperOptions } from './useCropper'

export interface ReactCropperProps extends Omit<CropperOptions, 'ready' | 'crop' | 'cropstart' | 'cropmove' | 'cropend' | 'zoom'> {
  style?: CSSProperties
  className?: string
  onReady?: (cropper: Cropper) => void
  onCropStart?: (event: CustomEvent) => void
  onCropMove?: (event: CustomEvent) => void
  onCropEnd?: (event: CustomEvent) => void
  onCrop?: (event: CustomEvent) => void
  onZoom?: (event: CustomEvent) => void
}

export interface ReactCropperRef {
  getCropper: () => Cropper | undefined
  getCroppedCanvas: (options?: GetCroppedCanvasOptions) => HTMLCanvasElement | null
  getData: (rounded?: boolean) => CropData
  setData: (data: any) => void
  rotate: (degrees: number) => void
  scale: (scaleX: number, scaleY?: number) => void
  scaleX: (scaleX: number) => void
  scaleY: (scaleY: number) => void
  reset: () => void
  clear: () => void
  enable: () => void
  disable: () => void
  destroy: () => void
}

export const ReactCropper = forwardRef<ReactCropperRef, ReactCropperProps>(
  (props, ref) => {
    const {
      src,
      alt,
      style,
      className,
      onReady,
      onCropStart,
      onCropMove,
      onCropEnd,
      onCrop,
      onZoom,
      ...cropperOptions
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const cropperRef = useRef<Cropper>()

    // Initialize cropper
    useEffect(() => {
      if (!containerRef.current || !src) return

      const options: CropperOptions = {
        ...cropperOptions,
        src,
        alt,
        ready: (e) => {
          if (onReady && cropperRef.current) {
            onReady(cropperRef.current)
          }
        },
        cropstart: onCropStart,
        cropmove: onCropMove,
        cropend: onCropEnd,
        crop: onCrop,
        zoom: onZoom
      }

      cropperRef.current = new Cropper(containerRef.current, options)

      return () => {
        if (cropperRef.current) {
          cropperRef.current.destroy()
        }
      }
    }, [])

    // Update src
    useEffect(() => {
      if (cropperRef.current && src) {
        cropperRef.current.replace(src)
      }
    }, [src])

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getCropper: () => cropperRef.current,
      getCroppedCanvas: (options?: GetCroppedCanvasOptions) =>
        cropperRef.current?.getCroppedCanvas(options) || null,
      getData: (rounded?: boolean) =>
        cropperRef.current?.getData(rounded) || {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          rotate: 0,
          scaleX: 1,
          scaleY: 1,
          skewX: 0,
          skewY: 0,
          translateX: 0,
          translateY: 0
        },
      setData: (data: any) => cropperRef.current?.setData(data),
      rotate: (degrees: number) => cropperRef.current?.rotate(degrees),
      scale: (scaleX: number, scaleY?: number) =>
        cropperRef.current?.scale(scaleX, scaleY),
      scaleX: (scaleX: number) => cropperRef.current?.scaleX(scaleX),
      scaleY: (scaleY: number) => cropperRef.current?.scaleY(scaleY),
      reset: () => cropperRef.current?.reset(),
      clear: () => cropperRef.current?.clear(),
      enable: () => cropperRef.current?.enable(),
      disable: () => cropperRef.current?.disable(),
      destroy: () => cropperRef.current?.destroy()
    }))

    return (
      <div
        ref={containerRef}
        className={`react-cropper-container ${className || ''}`}
        style={{
          width: '100%',
          height: '100%',
          ...style
        }}
      />
    )
  }
)

ReactCropper.displayName = 'ReactCropper'

export default ReactCropper
