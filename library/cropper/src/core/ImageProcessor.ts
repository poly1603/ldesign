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
   * @param cropBoxData - The crop box position and size in container coordinates
   * @param options - Canvas options
   */
  getCroppedCanvas(
    cropBoxData: { left: number; top: number; width: number; height: number },
    options: GetCroppedCanvasOptions = {}
  ): HTMLCanvasElement | null {
    if (!this.imageElement || !this.imageData) return null

    const { maxWidth, maxHeight, minWidth, minHeight, fillColor } = options
    let { width, height } = options
    const { fillBackground = false } = options

    const cropWidth = cropBoxData.width
    const cropHeight = cropBoxData.height
    const cropAspectRatio = cropWidth / cropHeight

    // Calculate output dimensions maintaining the EXACT aspect ratio of the crop box
    if (!width && !height) {
      // No size specified, use crop box size
      width = cropWidth
      height = cropHeight
    } else if (width && !height) {
      // Width specified, calculate height to maintain aspect ratio
      height = width / cropAspectRatio
    } else if (!width && height) {
      // Height specified, calculate width to maintain aspect ratio
      width = height * cropAspectRatio
    } else if (width && height) {
      // Both specified, adjust to maintain aspect ratio
      const specifiedRatio = width / height
      if (Math.abs(specifiedRatio - cropAspectRatio) > 0.01) {
        // Aspect ratios don't match, adjust to maintain crop box ratio
        if (width / cropAspectRatio <= height) {
          height = width / cropAspectRatio
        } else {
          width = height * cropAspectRatio
        }
      }
    }

    // Apply constraints while maintaining aspect ratio
    let finalWidth = width!
    let finalHeight = height!
    
    if (maxWidth && finalWidth > maxWidth) {
      finalWidth = maxWidth
      finalHeight = finalWidth / cropAspectRatio
    }
    if (maxHeight && finalHeight > maxHeight) {
      finalHeight = maxHeight
      finalWidth = finalHeight * cropAspectRatio
    }
    if (minWidth && finalWidth < minWidth) {
      finalWidth = minWidth
      finalHeight = finalWidth / cropAspectRatio
    }
    if (minHeight && finalHeight < minHeight) {
      finalHeight = minHeight
      finalWidth = finalHeight * cropAspectRatio
    }

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
    
    // Get the actual display rect of the transformed image
    const displayRect = this.getDisplayRect()
    if (!displayRect) return null
    
    // The displayRect contains the actual position and size of the scaled image
    const imageLeft = displayRect.left
    const imageTop = displayRect.top
    const scaledWidth = displayRect.width 
    const scaledHeight = displayRect.height

    // Calculate crop area relative to the transformed image position
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

    // Calculate what part of the natural image corresponds to the crop box
    // The key here is mapping from the visually scaled coordinates to natural image coordinates
    // displayRect already contains the scaled dimensions (width * scaleX, height * scaleY)
    
    // IMPORTANT FIX: The mapping ratio should use the original display dimensions,
    // not the scaled dimensions. The display dimensions represent the container size
    // that the natural image is fitted into, before any zoom transformations.
    const baseScaleX = displayWidth / naturalWidth
    const baseScaleY = displayHeight / naturalHeight
    
    // The actual display is further scaled by scaleX and scaleY
    // So the total scaling from natural to displayed is baseScale * scale
    const totalScaleX = baseScaleX * Math.abs(scaleX)
    const totalScaleY = baseScaleY * Math.abs(scaleY)
    
    // Map the crop box position and size to natural image coordinates
    // These coordinates are relative to the scaled image display position
    let sourceX = Math.max(0, cropLeft) / totalScaleX
    let sourceY = Math.max(0, cropTop) / totalScaleY
    let sourceWidth = cropWidth / totalScaleX
    let sourceHeight = cropHeight / totalScaleY
    
    // Handle cases where crop box extends beyond image bounds
    if (cropLeft < 0) {
      // Crop box starts before image, adjust source width
      sourceWidth = Math.min(cropWidth + cropLeft, scaledWidth) / totalScaleX
      sourceX = 0
    } else if (cropLeft + cropWidth > scaledWidth) {
      // Crop box extends past image right edge
      sourceWidth = (scaledWidth - cropLeft) / totalScaleX
    }
    
    if (cropTop < 0) {
      // Crop box starts above image, adjust source height
      sourceHeight = Math.min(cropHeight + cropTop, scaledHeight) / totalScaleY
      sourceY = 0
    } else if (cropTop + cropHeight > scaledHeight) {
      // Crop box extends past image bottom edge
      sourceHeight = (scaledHeight - cropTop) / totalScaleY
    }
    
    // Ensure source coordinates are within natural image bounds
    sourceX = Math.max(0, Math.min(sourceX, naturalWidth))
    sourceY = Math.max(0, Math.min(sourceY, naturalHeight))
    sourceWidth = Math.max(0, Math.min(sourceWidth, naturalWidth - sourceX))
    sourceHeight = Math.max(0, Math.min(sourceHeight, naturalHeight - sourceY))
    
    // Calculate destination rectangle
    // If the crop box extends beyond the image, we need to adjust the destination
    let destX = 0
    let destY = 0
    let destWidth = finalWidth
    let destHeight = finalHeight
    
    // Adjust destination if crop box starts outside image bounds
    if (cropLeft < 0) {
      const offsetRatio = -cropLeft / cropWidth
      destX = finalWidth * offsetRatio
      destWidth = finalWidth * (1 - offsetRatio)
    }
    if (cropTop < 0) {
      const offsetRatio = -cropTop / cropHeight
      destY = finalHeight * offsetRatio
      destHeight = finalHeight * (1 - offsetRatio)
    }
    
    // Adjust destination size if crop box extends beyond image
    if (cropLeft >= 0 && cropLeft + cropWidth > scaledWidth) {
      destWidth = finalWidth * ((scaledWidth - cropLeft) / cropWidth)
    }
    if (cropTop >= 0 && cropTop + cropHeight > scaledHeight) {
      destHeight = finalHeight * ((scaledHeight - cropTop) / cropHeight)
    }

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
   * This returns the actual bounding rect after all transformations (scale, rotate, translate)
   */
  getDisplayRect(): { left: number; top: number; width: number; height: number } | null {
    if (!this.imageData) return null
    
    const { left, top, width, height, scaleX, scaleY, rotate, translateX, translateY } = this.imageData
    
    // Calculate the actual dimensions after scaling
    const actualWidth = Math.abs(width * scaleX)
    const actualHeight = Math.abs(height * scaleY)
    
    // For rotation, we need to calculate the bounding box that contains the rotated rectangle
    if (rotate !== 0) {
      // Convert rotation to radians
      const rad = (rotate * Math.PI) / 180
      const cos = Math.abs(Math.cos(rad))
      const sin = Math.abs(Math.sin(rad))
      
      // Calculate bounding box dimensions for rotated rectangle
      const rotatedWidth = actualWidth * cos + actualHeight * sin
      const rotatedHeight = actualWidth * sin + actualHeight * cos
      
      // Calculate the center position considering translation
      // The center is scaled from the original center
      const centerX = left + width / 2 + translateX
      const centerY = top + height / 2 + translateY
      
      return {
        left: centerX - rotatedWidth / 2,
        top: centerY - rotatedHeight / 2,
        width: rotatedWidth,
        height: rotatedHeight
      }
    } else {
      // Without rotation, apply scaling and translation
      // CSS transform scale scales from the center of the element
      // So we need to calculate the new position after scaling from center
      
      // Original center position
      const centerX = left + width / 2
      const centerY = top + height / 2
      
      // After scaling from center, the new top-left position is:
      // center - (scaledSize / 2)
      const scaledLeft = centerX - actualWidth / 2 + translateX
      const scaledTop = centerY - actualHeight / 2 + translateY
      
      return {
        left: scaledLeft,
        top: scaledTop,
        width: actualWidth,
        height: actualHeight
      }
    }
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
