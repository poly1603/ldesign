/**
 * React Hook for Cropper
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import { Cropper } from '../../core/Cropper'
import type { CropperOptions, GetCroppedCanvasOptions } from '../../types'

export interface UseCropperOptions extends Omit<CropperOptions, 'src'> {
  src?: string
  onReady?: (cropper: Cropper) => void
  onCrop?: (data: any) => void
  onZoom?: (event: CustomEvent) => void
}

export function useCropper(options: UseCropperOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cropperRef = useRef<Cropper>()
  const [isReady, setIsReady] = useState(false)
  const [cropData, setCropData] = useState<any>({})
  const [imageData, setImageData] = useState<any>({})
  const [canvasData, setCanvasData] = useState<any>({})

  const initCropper = useCallback(() => {
    if (!containerRef.current || cropperRef.current) return

    const { src, onReady, onCrop, onZoom, ...cropperOptions } = options

    cropperRef.current = new Cropper(containerRef.current, {
      ...cropperOptions,
      src: src || '',
      ready: (e) => {
        setIsReady(true)
        onReady?.(cropperRef.current!)
      },
      crop: (e) => {
        setCropData(e.detail)
        onCrop?.(e.detail)
      },
      zoom: (e) => {
        onZoom?.(e)
      }
    })
  }, [options])

  const destroyCropper = useCallback(() => {
    if (cropperRef.current) {
      cropperRef.current.destroy()
      cropperRef.current = undefined
      setIsReady(false)
    }
  }, [])

  // Methods
  const replace = useCallback((src: string) => {
    return cropperRef.current?.replace(src)
  }, [])

  const getCroppedCanvas = useCallback((canvasOptions?: GetCroppedCanvasOptions) => {
    return cropperRef.current?.getCroppedCanvas(canvasOptions)
  }, [])

  const getData = useCallback((rounded?: boolean) => {
    return cropperRef.current?.getData(rounded)
  }, [])

  const setData = useCallback((data: any) => {
    return cropperRef.current?.setData(data)
  }, [])

  const getImageData = useCallback(() => {
    const data = cropperRef.current?.getImageData()
    setImageData(data || {})
    return data
  }, [])

  const getCanvasData = useCallback(() => {
    // getCanvasData method doesn't exist, use getData instead
    const data = cropperRef.current?.getData()
    setCanvasData(data || {})
    return data
  }, [])

  const rotate = useCallback((degrees: number) => {
    return cropperRef.current?.rotate(degrees)
  }, [])

  const scale = useCallback((scaleX: number, scaleY?: number) => {
    return cropperRef.current?.scale(scaleX, scaleY)
  }, [])

  const scaleX = useCallback((scale: number) => {
    return cropperRef.current?.scaleX(scale)
  }, [])

  const scaleY = useCallback((scale: number) => {
    return cropperRef.current?.scaleY(scale)
  }, [])

  const move = useCallback((offsetX: number, offsetY: number = 0) => {
    return cropperRef.current?.move(offsetX, offsetY)
  }, [])

  const reset = useCallback(() => {
    return cropperRef.current?.reset()
  }, [])

  const clear = useCallback(() => {
    return cropperRef.current?.clear()
  }, [])

  const enable = useCallback(() => {
    return cropperRef.current?.enable()
  }, [])

  const disable = useCallback(() => {
    return cropperRef.current?.disable()
  }, [])

  const setCropBoxStyle = useCallback((style: 'default' | 'rounded' | 'circle' | 'minimal' | 'dotted' | 'solid' | 'gradient') => {
    return cropperRef.current?.setCropBoxStyle(style)
  }, [])

  // Effects
  useEffect(() => {
    initCropper()
    return () => {
      destroyCropper()
    }
  }, [])

  useEffect(() => {
    if (options.src && cropperRef.current && isReady) {
      replace(options.src)
    }
  }, [options.src, isReady, replace])

  useEffect(() => {
    if (options.aspectRatio !== undefined && cropperRef.current && isReady) {
      setData({ width: 0, height: 0 })
    }
  }, [options.aspectRatio, isReady, setData])

  useEffect(() => {
    if (options.cropBoxStyle && cropperRef.current && isReady) {
      setCropBoxStyle(options.cropBoxStyle)
    }
  }, [options.cropBoxStyle, isReady, setCropBoxStyle])

  useEffect(() => {
    if (options.themeColor) {
      document.documentElement.style.setProperty('--cropper-theme-color', options.themeColor)
    }
  }, [options.themeColor])

  return {
    // Refs
    containerRef,
    cropperInstance: cropperRef.current,
    
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