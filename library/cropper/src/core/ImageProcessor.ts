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
    if (!this.imageElement) return

    // Create image wrapper
    const wrapper = createElement('div', 'cropper-canvas')
    wrapper.appendChild(this.imageElement)

    // Clear container
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild)
    }

    this.container.appendChild(wrapper)
    this.updateTransform()
  }

  /**
   * Update image transform
   */
  updateTransform(): void {
    if (!this.imageElement || !this.imageData) return

    const { rotate, scaleX, scaleY } = this.imageData

    const transforms = [
      `rotate(${rotate}deg)`,
      `scaleX(${scaleX})`,
      `scaleY(${scaleY})`
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
   * Reset image
   */
  reset(): void {
    if (!this.imageData) return

    this.imageData.rotate = 0
    this.imageData.scaleX = 1
    this.imageData.scaleY = 1
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
    if (!this.imageElement || !this.imageData) return null

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
    // The cropBoxData is in the display coordinate system
    // We need to convert it to the natural image coordinate system
    const naturalWidth = this.imageElement.naturalWidth
    const naturalHeight = this.imageElement.naturalHeight
    const displayWidth = this.imageData.width
    const displayHeight = this.imageData.height

    // Scale factor between display and natural size
    const scaleFactorX = naturalWidth / displayWidth
    const scaleFactorY = naturalHeight / displayHeight

    // Source rectangle in natural coordinates
    const sourceLeft = cropBoxData.left * scaleFactorX
    const sourceTop = cropBoxData.top * scaleFactorY
    const sourceWidth = cropBoxData.width * scaleFactorX
    const sourceHeight = cropBoxData.height * scaleFactorY

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
