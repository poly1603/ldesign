/**
 * @file React 适配器
 * @description 为 React 提供的裁剪器组件
 */

import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
  type CSSProperties,
  type ForwardedRef,
} from 'react'

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
 * React 裁剪器组件的 Props 类型
 */
export interface ReactCropperProps extends Omit<CropperOptions, 'container'> {
  /** 图片源 */
  src?: ImageSource
  /** 是否立即初始化 */
  immediate?: boolean
  /** 容器类名 */
  className?: string
  /** 容器样式 */
  style?: CSSProperties
  
  // 事件回调
  onReady?: () => void
  onImageLoaded?: (imageInfo: ImageInfo) => void
  onImageError?: (error: Error) => void
  onCropChange?: (cropData: CropData) => void
  onCropStart?: () => void
  onCropMove?: (cropData: CropData) => void
  onCropEnd?: (cropData: CropData) => void
  onZoomChange?: (scale: number) => void
  onRotationChange?: (rotation: number) => void
  onFlipChange?: (flipX: boolean, flipY: boolean) => void
  onDragStart?: () => void
  onDragMove?: (cropData: CropData) => void
  onDragEnd?: (cropData: CropData) => void
  onReset?: () => void
  onDestroy?: () => void
}

/**
 * React 裁剪器组件的 Ref 类型
 */
export interface ReactCropperRef {
  cropper: Cropper | null
  isReady: boolean
  initCropper: () => Promise<void>
  setImage: (src: ImageSource) => Promise<void>
  getCropData: () => CropData | null
  setCropData: (data: Partial<CropData>) => void
  getCroppedCanvas: (options?: CropOutputOptions) => HTMLCanvasElement | null
  getCroppedDataURL: (options?: CropOutputOptions) => string | null
  getCroppedBlob: (options?: CropOutputOptions) => Promise<Blob | null>
  zoom: (scale: number) => void
  zoomIn: (delta?: number) => void
  zoomOut: (delta?: number) => void
  rotate: (angle: number) => void
  rotateLeft: () => void
  rotateRight: () => void
  flip: (horizontal: boolean, vertical: boolean) => void
  flipHorizontal: () => void
  flipVertical: () => void
  reset: () => void
  destroy: () => void
}

/**
 * React 裁剪器组件
 */
export const ReactCropper = forwardRef<ReactCropperRef, ReactCropperProps>(
  (props, ref: ForwardedRef<ReactCropperRef>) => {
    const {
      src,
      immediate = true,
      className = '',
      style = {},
      
      // 裁剪器配置
      shape = 'rectangle',
      aspectRatio = 0,
      initialCrop,
      minCropSize,
      maxCropSize,
      movable = true,
      resizable = true,
      zoomable = true,
      rotatable = true,
      zoomRange = [0.1, 10],
      backgroundColor = '#000000',
      maskOpacity = 0.6,
      guides = true,
      centerLines = false,
      responsive = true,
      touchEnabled = true,
      autoCrop = true,
      preview,
      
      // 事件回调
      onReady,
      onImageLoaded,
      onImageError,
      onCropChange,
      onCropStart,
      onCropMove,
      onCropEnd,
      onZoomChange,
      onRotationChange,
      onFlipChange,
      onDragStart,
      onDragMove,
      onDragEnd,
      onReset,
      onDestroy,
      
      ...restProps
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const cropperRef = useRef<Cropper | null>(null)
    const [isReady, setIsReady] = useState(false)

    /**
     * 绑定事件
     */
    const bindEvents = useCallback(() => {
      if (!cropperRef.current) return

      const cropper = cropperRef.current

      cropper.on('ready' as CropperEventType, () => {
        setIsReady(true)
        onReady?.()
      })

      cropper.on('imageLoaded' as CropperEventType, (event) => {
        onImageLoaded?.(event.imageInfo!)
      })

      cropper.on('imageError' as CropperEventType, (event) => {
        onImageError?.(event.error)
      })

      cropper.on('cropChange' as CropperEventType, (event) => {
        onCropChange?.(event.cropData!)
      })

      cropper.on('cropStart' as CropperEventType, () => {
        onCropStart?.()
      })

      cropper.on('cropMove' as CropperEventType, (event) => {
        onCropMove?.(event.cropData!)
      })

      cropper.on('cropEnd' as CropperEventType, (event) => {
        onCropEnd?.(event.cropData!)
      })

      cropper.on('zoomChange' as CropperEventType, (event) => {
        onZoomChange?.(event.scale || 1)
      })

      cropper.on('rotationChange' as CropperEventType, (event) => {
        onRotationChange?.(event.rotation || 0)
      })

      cropper.on('flipChange' as CropperEventType, (event) => {
        onFlipChange?.(event.flipX || false, event.flipY || false)
      })

      cropper.on('dragStart' as CropperEventType, () => {
        onDragStart?.()
      })

      cropper.on('dragMove' as CropperEventType, (event) => {
        onDragMove?.(event.cropData!)
      })

      cropper.on('dragEnd' as CropperEventType, (event) => {
        onDragEnd?.(event.cropData!)
      })

      cropper.on('reset' as CropperEventType, () => {
        onReset?.()
      })

      cropper.on('destroy' as CropperEventType, () => {
        onDestroy?.()
      })
    }, [
      onReady,
      onImageLoaded,
      onImageError,
      onCropChange,
      onCropStart,
      onCropMove,
      onCropEnd,
      onZoomChange,
      onRotationChange,
      onFlipChange,
      onDragStart,
      onDragMove,
      onDragEnd,
      onReset,
      onDestroy,
    ])

    /**
     * 初始化裁剪器
     */
    const initCropper = useCallback(async () => {
      if (!containerRef.current) return

      try {
        const options: CropperOptions = {
          container: containerRef.current,
          shape,
          aspectRatio,
          initialCrop,
          minCropSize,
          maxCropSize,
          movable,
          resizable,
          zoomable,
          rotatable,
          zoomRange,
          backgroundColor,
          maskOpacity,
          guides,
          centerLines,
          responsive,
          touchEnabled,
          autoCrop,
          preview,
        }

        cropperRef.current = new Cropper(options)
        bindEvents()

        // 如果有初始图片源，加载它
        if (src) {
          await setImage(src)
        }
      } catch (error) {
        console.error('初始化裁剪器失败:', error)
        onImageError?.(error as Error)
      }
    }, [
      shape,
      aspectRatio,
      initialCrop,
      minCropSize,
      maxCropSize,
      movable,
      resizable,
      zoomable,
      rotatable,
      zoomRange,
      backgroundColor,
      maskOpacity,
      guides,
      centerLines,
      responsive,
      touchEnabled,
      autoCrop,
      preview,
      src,
      bindEvents,
      onImageError,
    ])

    /**
     * 设置图片
     */
    const setImage = useCallback(async (imageSrc: ImageSource) => {
      if (!cropperRef.current) return
      await cropperRef.current.setImage(imageSrc)
    }, [])

    /**
     * 获取裁剪数据
     */
    const getCropData = useCallback((): CropData | null => {
      return cropperRef.current?.getCropData() || null
    }, [])

    /**
     * 设置裁剪数据
     */
    const setCropData = useCallback((data: Partial<CropData>) => {
      cropperRef.current?.setCropData(data)
    }, [])

    /**
     * 获取裁剪后的 Canvas
     */
    const getCroppedCanvas = useCallback((options?: CropOutputOptions): HTMLCanvasElement | null => {
      return cropperRef.current?.getCroppedCanvas(options) || null
    }, [])

    /**
     * 获取裁剪后的 DataURL
     */
    const getCroppedDataURL = useCallback((options?: CropOutputOptions): string | null => {
      return cropperRef.current?.getCroppedDataURL(options) || null
    }, [])

    /**
     * 获取裁剪后的 Blob
     */
    const getCroppedBlob = useCallback(async (options?: CropOutputOptions): Promise<Blob | null> => {
      if (!cropperRef.current) return null
      return await cropperRef.current.getCroppedBlob(options)
    }, [])

    /**
     * 缩放
     */
    const zoom = useCallback((scale: number) => {
      cropperRef.current?.zoom(scale)
    }, [])

    /**
     * 放大
     */
    const zoomIn = useCallback((delta?: number) => {
      cropperRef.current?.zoomIn(delta)
    }, [])

    /**
     * 缩小
     */
    const zoomOut = useCallback((delta?: number) => {
      cropperRef.current?.zoomOut(delta)
    }, [])

    /**
     * 旋转
     */
    const rotate = useCallback((angle: number) => {
      cropperRef.current?.rotate(angle)
    }, [])

    /**
     * 向左旋转
     */
    const rotateLeft = useCallback(() => {
      cropperRef.current?.rotateLeft()
    }, [])

    /**
     * 向右旋转
     */
    const rotateRight = useCallback(() => {
      cropperRef.current?.rotateRight()
    }, [])

    /**
     * 翻转
     */
    const flip = useCallback((horizontal: boolean, vertical: boolean) => {
      cropperRef.current?.flip(horizontal, vertical)
    }, [])

    /**
     * 水平翻转
     */
    const flipHorizontal = useCallback(() => {
      cropperRef.current?.flipHorizontal()
    }, [])

    /**
     * 垂直翻转
     */
    const flipVertical = useCallback(() => {
      cropperRef.current?.flipVertical()
    }, [])

    /**
     * 重置
     */
    const reset = useCallback(() => {
      cropperRef.current?.reset()
    }, [])

    /**
     * 销毁
     */
    const destroy = useCallback(() => {
      cropperRef.current?.destroy()
      cropperRef.current = null
      setIsReady(false)
    }, [])

    // 监听 src 变化
    useEffect(() => {
      if (src && cropperRef.current) {
        setImage(src)
      }
    }, [src, setImage])

    // 组件挂载时初始化
    useEffect(() => {
      if (immediate) {
        initCropper()
      }

      // 组件卸载时销毁
      return () => {
        destroy()
      }
    }, [immediate, initCropper, destroy])

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      cropper: cropperRef.current,
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
    }), [
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
    ])

    const containerClass = [
      'react-cropper-container',
      className,
    ].filter(Boolean).join(' ')

    const containerStyle: CSSProperties = {
      width: '100%',
      height: '400px',
      ...style,
    }

    return (
      <div
        ref={containerRef}
        className={containerClass}
        style={containerStyle}
        {...restProps}
      />
    )
  }
)

ReactCropper.displayName = 'ReactCropper'

export default ReactCropper

// 类型导出
export type { ReactCropperProps, ReactCropperRef }
