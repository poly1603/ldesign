/**
 * ImageProcessor - Handles image processing operations
 */

import type { ImageData, CanvasData, GetCroppedCanvasOptions } from '../types'
import { loadImage, createCanvas, canvasToBlob, canvasToDataURL } from '../utils/image'
import { createElement, setStyle } from '../utils/dom'
import { getAspectRatio, clamp } from '../utils/math'

export class ImageProcessor {
  private container: HTMLElement
  private imageElement: HTMLImageElement | null = null
  private canvasElement: HTMLCanvasElement | null = null
  private imageData: ImageData | null = null
  private src: string = ''

  constructor(container: HTMLElement) {
    this.container = container
  }

  /**
   * Load image from URL
   */
  async load(src: string, crossOrigin?: string): Promise<void> {
    this.src = src

    try {
      const image = await loadImage(src, crossOrigin)
      this.imageElement = image

      this.imageData = {
        left: 0,
        top: 0,
        width: image.naturalWidth,
        height: image.naturalHeight,
        rotate: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
        translateX: 0,
        translateY: 0,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        aspectRatio: getAspectRatio(image.naturalWidth, image.naturalHeight)
      }

      this.render()
    } catch (error) {
      throw new Error(`Failed to load image: ${error}`)
    }
  }

  /**
   * Render image to container
   */
  render(): void {
    if (!this.imageElement || !this.imageData) return

    // Clear only the canvas element, not the entire container
    const existingCanvas = this.container.querySelector('.cropper-canvas')
    if (existingCanvas) {
      this.container.removeChild(existingCanvas)
    }

    // Create image wrapper
    const wrapper = createElement('div', 'cropper-canvas')
    
    // Calculate the container size
    const containerRect = this.container.getBoundingClientRect()
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height
    
    // Calculate the display size to fit the container (contain mode)
    const imageAspect = this.imageData.naturalWidth / this.imageData.naturalHeight
    const containerAspect = containerWidth / containerHeight
    
    let displayWidth, displayHeight
    
    // Use contain mode to ensure the entire image is visible
    if (imageAspect > containerAspect) {
      // Image is wider - fit width and adjust height
      displayWidth = containerWidth
      displayHeight = containerWidth / imageAspect
    } else {
      // Image is taller - fit height and adjust width
      displayHeight = containerHeight
      displayWidth = containerHeight * imageAspect
    }
    
    // Update image data with display dimensions
    this.imageData.width = displayWidth
    this.imageData.height = displayHeight
    this.imageData.left = (containerWidth - displayWidth) / 2
    this.imageData.top = (containerHeight - displayHeight) / 2
    
    // Style the wrapper to position the image
    setStyle(wrapper, {
      position: 'absolute',
      left: `${this.imageData.left}px`,
      top: `${this.imageData.top}px`,
      width: `${displayWidth}px`,
      height: `${displayHeight}px`
    })
    
    // Style the image element
    setStyle(this.imageElement, {
      display: 'block',
      width: '100%',
      height: '100%',
      maxWidth: 'none',
      maxHeight: 'none'
    })
    
    wrapper.appendChild(this.imageElement)
    
    // Insert canvas after background but before other elements
    const bgElement = this.container.querySelector('.cropper-bg')
    if (bgElement && bgElement.nextSibling) {
      this.container.insertBefore(wrapper, bgElement.nextSibling)
    } else {
      this.container.appendChild(wrapper)
    }
    
    this.updateTransform()
  }

  /**
   * Update image transform
   */
  updateTransform(): void {
    if (!this.imageElement || !this.imageData) return

    const { rotate, scaleX, scaleY, skewX, skewY, translateX, translateY } = this.imageData

    const transforms = [
      `translate(${translateX}px, ${translateY}px)`,
      `rotate(${rotate}deg)`,
      `scaleX(${scaleX})`,
      `scaleY(${scaleY})`,
      `skew(${skewX}deg, ${skewY}deg)`
    ]

    setStyle(this.imageElement, {
      transform: transforms.join(' ')
    })
  }

  /**
   * Rotate image
   */
  rotate(degrees: number): void {
    if (!this.imageData) return

    this.imageData.rotate = (this.imageData.rotate + degrees) % 360
    this.updateTransform()
  }

  /**
   * Scale image
   */
  scale(scaleX: number, scaleY?: number): void {
    if (!this.imageData) return

    this.imageData.scaleX = scaleX
    this.imageData.scaleY = scaleY ?? scaleX
    this.updateTransform()
  }

  /**
   * Flip horizontal
   */
  flipHorizontal(): void {
    if (!this.imageData) return

    this.imageData.scaleX *= -1
    this.updateTransform()
  }

  /**
   * Flip vertical
   */
  flipVertical(): void {
    if (!this.imageData) return

    this.imageData.scaleY *= -1
    this.updateTransform()
  }

  /**
   * Skew image
   */
  skew(skewX: number, skewY?: number): void {
    if (!this.imageData) return

    this.imageData.skewX = skewX
    this.imageData.skewY = skewY ?? skewX
    this.updateTransform()
  }

  /**
   * Skew X
   */
  skewX(skewX: number): void {
    if (!this.imageData) return

    this.imageData.skewX = skewX
    this.updateTransform()
  }

  /**
   * Skew Y
   */
  skewY(skewY: number): void {
    if (!this.imageData) return

    this.imageData.skewY = skewY
    this.updateTransform()
  }

  /**
   * Translate image
   */
  translate(x: number, y: number): void {
    if (!this.imageData) return

    this.imageData.translateX = x
    this.imageData.translateY = y
    this.updateTransform()
  }

  /**
   * Move image (relative)
   */
  move(deltaX: number, deltaY: number): void {
    if (!this.imageData) return

    this.imageData.translateX += deltaX
    this.imageData.translateY += deltaY
    this.updateTransform()
  }

  /**
   * Reset image
   */
  reset(): void {
    if (!this.imageData) return

    this.imageData.rotate = 0
    this.imageData.scaleX = 1
    this.imageData.scaleY = 1
    this.imageData.skewX = 0
    this.imageData.skewY = 0
    this.imageData.translateX = 0
    this.imageData.translateY = 0
    this.updateTransform()
  }

  /**
   * Get image data
   */
  getImageData(): ImageData | null {
    return this.imageData ? { ...this.imageData } : null
  }

  /**
   * Get cropped canvas
   */
  getCroppedCanvas(
    cropBoxData: { left: number; top: number; width: number; height: number },
    options: GetCroppedCanvasOptions & { cropShape?: string; fillBackground?: boolean } = {}
  ): HTMLCanvasElement | null {
    if (!this.imageElement || !this.imageData) return null

    const { maxWidth, maxHeight, minWidth, minHeight, fillColor } = options
    let { width, height } = options
    const { fillBackground = false } = options

    const cropWidth = cropBoxData.width
    const cropHeight = cropBoxData.height

    // Calculate dimensions maintaining aspect ratio
    if (!width && !height) {
      width = cropWidth
      height = cropHeight
    } else if (!width) {
      width = (height! * cropWidth) / cropHeight
    } else if (!height) {
      height = (width * cropHeight) / cropWidth
    }

    // Apply constraints
    const finalWidth = Math.min(Math.max(width!, minWidth || 0), maxWidth || Infinity)
    const finalHeight = Math.min(Math.max(height!, minHeight || 0), maxHeight || Infinity)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = finalWidth
    canvas.height = finalHeight

    // Apply crop shape if specified
    const cropShape = options.cropShape || 'default'
    
    // Save the context state
    ctx.save()
    
    // For shaped exports, fill white background first (outside the clipping path)
    if (fillBackground && (cropShape === 'circle' || cropShape === 'rounded')) {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, finalWidth, finalHeight)
    }
    
    // Create clipping path based on shape
    if (cropShape === 'circle') {
      // Circle shape
      const centerX = finalWidth / 2
      const centerY = finalHeight / 2
      const radius = Math.min(finalWidth, finalHeight) / 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.clip()
    } else if (cropShape === 'rounded') {
      // Rounded rectangle
      const radius = Math.min(finalWidth, finalHeight) * 0.1 // 10% radius
      ctx.beginPath()
      ctx.moveTo(radius, 0)
      ctx.lineTo(finalWidth - radius, 0)
      ctx.quadraticCurveTo(finalWidth, 0, finalWidth, radius)
      ctx.lineTo(finalWidth, finalHeight - radius)
      ctx.quadraticCurveTo(finalWidth, finalHeight, finalWidth - radius, finalHeight)
      ctx.lineTo(radius, finalHeight)
      ctx.quadraticCurveTo(0, finalHeight, 0, finalHeight - radius)
      ctx.lineTo(0, radius)
      ctx.quadraticCurveTo(0, 0, radius, 0)
      ctx.closePath()
      ctx.clip()
    }
    
    // Fill background inside clipping path (if specified and not using fillBackground)
    if (!fillBackground && fillColor && fillColor !== 'transparent') {
      ctx.fillStyle = fillColor
      ctx.fillRect(0, 0, finalWidth, finalHeight)
    }

    const { rotate, scaleX, scaleY, translateX, translateY } = this.imageData

    // Get image dimensions
    const naturalWidth = this.imageElement.naturalWidth
    const naturalHeight = this.imageElement.naturalHeight
    const displayWidth = this.imageData.width
    const displayHeight = this.imageData.height
    
    // Calculate the actual displayed position and size
    // When scaling, the image scales from its center, so we need to account for that
    const scaledWidth = displayWidth * Math.abs(scaleX)
    const scaledHeight = displayHeight * Math.abs(scaleY)
    
    // The scaling happens from the center, so we need to adjust the position
    const scaleOffsetX = (displayWidth - scaledWidth) / 2
    const scaleOffsetY = (displayHeight - scaledHeight) / 2
    
    // Final image position after scaling and translation
    const imageLeft = this.imageData.left + translateX + scaleOffsetX
    const imageTop = this.imageData.top + translateY + scaleOffsetY

    // Calculate crop area relative to the scaled image
    const cropLeft = cropBoxData.left - imageLeft
    const cropTop = cropBoxData.top - imageTop

    // Check if we need to fill background (crop area extends beyond image)
    const needsBackground = cropLeft < 0 || cropTop < 0 || 
                          cropLeft + cropWidth > scaledWidth || 
                          cropTop + cropHeight > scaledHeight

    if (needsBackground) {
      if (fillColor && fillColor !== 'transparent') {
        ctx.fillStyle = fillColor
        ctx.fillRect(0, 0, finalWidth, finalHeight)
      } else if (fillBackground) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, finalWidth, finalHeight)
      }
    }

    // Calculate the source rectangle in the natural image
    // We need to map from display coordinates to natural image coordinates
    // First, get the unscaled crop coordinates
    const unscaledCropLeft = cropLeft / Math.abs(scaleX)
    const unscaledCropTop = cropTop / Math.abs(scaleY)
    const unscaledCropWidth = cropWidth / Math.abs(scaleX)
    const unscaledCropHeight = cropHeight / Math.abs(scaleY)
    
    // Then map to natural image coordinates
    const sourceX = Math.max(0, unscaledCropLeft) * (naturalWidth / displayWidth)
    const sourceY = Math.max(0, unscaledCropTop) * (naturalHeight / displayHeight)
    const sourceWidth = Math.min(unscaledCropWidth, displayWidth - Math.max(0, unscaledCropLeft)) * (naturalWidth / displayWidth)
    const sourceHeight = Math.min(unscaledCropHeight, displayHeight - Math.max(0, unscaledCropTop)) * (naturalHeight / displayHeight)

    // Calculate destination rectangle  
    const destX = Math.max(0, -cropLeft) / cropWidth * finalWidth
    const destY = Math.max(0, -cropTop) / cropHeight * finalHeight
    const destWidth = Math.min(scaledWidth - Math.max(0, cropLeft), cropWidth) / cropWidth * finalWidth
    const destHeight = Math.min(scaledHeight - Math.max(0, cropTop), cropHeight) / cropHeight * finalHeight

    // Only draw if there's something to draw
    if (sourceWidth > 0 && sourceHeight > 0 && destWidth > 0 && destHeight > 0) {
      // Handle rotation and flipping
      if (rotate !== 0 || scaleX < 0 || scaleY < 0) {
        ctx.save()
        ctx.translate(destX + destWidth / 2, destY + destHeight / 2)
        ctx.rotate((rotate * Math.PI) / 180)
        if (scaleX < 0) ctx.scale(-1, 1)
        if (scaleY < 0) ctx.scale(1, -1)

        ctx.drawImage(
          this.imageElement,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          -destWidth / 2,
          -destHeight / 2,
          destWidth,
          destHeight
        )

        ctx.restore()
      } else {
        // Direct drawing without transformations
        ctx.drawImage(
          this.imageElement,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          destX,
          destY,
          destWidth,
          destHeight
        )
      }
    }

    // Restore the context state that was saved at the beginning
    ctx.restore()
    
    return canvas
  }

  /**
   * Get cropped image as blob
   */
  async getCroppedBlob(
    cropBoxData: { left: number; top: number; width: number; height: number },
    options: GetCroppedCanvasOptions & { type?: string; quality?: number; cropShape?: string; fillBackground?: boolean } = {}
  ): Promise<Blob | null> {
    const canvas = this.getCroppedCanvas(cropBoxData, options)
    if (!canvas) return null

    const { type = 'image/png', quality = 1 } = options
    return await canvasToBlob(canvas, type, quality)
  }

  /**
   * Get cropped image as data URL
   */
  getCroppedDataURL(
    cropBoxData: { left: number; top: number; width: number; height: number },
    options: GetCroppedCanvasOptions & { type?: string; quality?: number; cropShape?: string; fillBackground?: boolean } = {}
  ): string | null {
    const canvas = this.getCroppedCanvas(cropBoxData, options)
    if (!canvas) return null

    const { type = 'image/png', quality = 1 } = options
    return canvasToDataURL(canvas, type, quality)
  }

  /**
   * Get image element
   */
  getImageElement(): HTMLImageElement | null {
    return this.imageElement
  }

  /**
   * Get current display rect of the image within container
   */
  getDisplayRect(): { left: number; top: number; width: number; height: number } | null {
    if (!this.imageData) return null
    const { left, top, width, height } = this.imageData
    return { left, top, width, height }
  }

  /**
   * Get source URL
   */
  getSrc(): string {
    return this.src
  }

  /**
   * Destroy
   */
  destroy(): void {
    this.imageElement = null
    this.canvasElement = null
    this.imageData = null
    this.src = ''
  }
}
