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
    options: GetCroppedCanvasOptions = {}
  ): HTMLCanvasElement | null {
    if (!this.imageElement || !this.imageData) {
      return null
    }

    const {
      width = cropBoxData.width,
      height = cropBoxData.height,
      minWidth = 0,
      minHeight = 0,
      maxWidth = Infinity,
      maxHeight = Infinity,
      fillColor = 'transparent',
      imageSmoothingEnabled = true,
      imageSmoothingQuality = 'high'
    } = options

    // Clamp dimensions
    const finalWidth = clamp(width, minWidth, maxWidth)
    const finalHeight = clamp(height, minHeight, maxHeight)

    // Create canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    canvas.width = finalWidth
    canvas.height = finalHeight

    // Set canvas options
    ctx.imageSmoothingEnabled = imageSmoothingEnabled
    ctx.imageSmoothingQuality = imageSmoothingQuality

    // Fill background
    if (fillColor && fillColor !== 'transparent') {
      ctx.fillStyle = fillColor
      ctx.fillRect(0, 0, finalWidth, finalHeight)
    }

    const { rotate, scaleX, scaleY } = this.imageData

    // Calculate the actual source coordinates in the original image
    // The cropBoxData is in the container coordinate system
    // We need to convert it to coordinates relative to the image
    const naturalWidth = this.imageElement.naturalWidth
    const naturalHeight = this.imageElement.naturalHeight
    const displayWidth = this.imageData.width
    const displayHeight = this.imageData.height
    const imageLeft = this.imageData.left
    const imageTop = this.imageData.top

    // Calculate crop box relative to image (not container)
    const cropRelativeToImageLeft = cropBoxData.left - imageLeft
    const cropRelativeToImageTop = cropBoxData.top - imageTop
    const cropRelativeToImageWidth = cropBoxData.width
    const cropRelativeToImageHeight = cropBoxData.height

    // Scale factor between display and natural size
    const scaleFactorX = naturalWidth / displayWidth
    const scaleFactorY = naturalHeight / displayHeight

    // Source rectangle in natural coordinates
    const sourceLeft = Math.max(0, cropRelativeToImageLeft * scaleFactorX)
    const sourceTop = Math.max(0, cropRelativeToImageTop * scaleFactorY)
    const sourceWidth = Math.min(
      cropRelativeToImageWidth * scaleFactorX,
      naturalWidth - sourceLeft
    )
    const sourceHeight = Math.min(
      cropRelativeToImageHeight * scaleFactorY,
      naturalHeight - sourceTop
    )

    // Apply transformations if needed
    if (rotate !== 0 || scaleX !== 1 || scaleY !== 1) {
      ctx.save()
      ctx.translate(finalWidth / 2, finalHeight / 2)
      ctx.rotate((rotate * Math.PI) / 180)
      ctx.scale(scaleX, scaleY)

      // Draw image with transformations
      ctx.drawImage(
        this.imageElement,
        sourceLeft,
        sourceTop,
        sourceWidth,
        sourceHeight,
        -finalWidth / 2,
        -finalHeight / 2,
        finalWidth,
        finalHeight
      )

      ctx.restore()
    } else {
      // Draw image without transformations (faster path)
      ctx.drawImage(
        this.imageElement,
        sourceLeft,
        sourceTop,
        sourceWidth,
        sourceHeight,
        0,
        0,
        finalWidth,
        finalHeight
      )
    }

    return canvas
  }

  /**
   * Get cropped image as blob
   */
  async getCroppedBlob(
    cropBoxData: { left: number; top: number; width: number; height: number },
    options: GetCroppedCanvasOptions & { type?: string; quality?: number } = {}
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
    options: GetCroppedCanvasOptions & { type?: string; quality?: number } = {}
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
