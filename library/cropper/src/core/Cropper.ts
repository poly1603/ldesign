/**
 * Cropper - Main cropper class
 */

import type {
  CropperOptions,
  CropBoxData,
  ImageData,
  CanvasData,
  ContainerData,
  CropData,
  GetCroppedCanvasOptions,
  Action,
  Point,
  DragMode
} from '../types'
import { CropBox } from './CropBox'
import { ImageProcessor } from './ImageProcessor'
import { InteractionManager } from './InteractionManager'
import { getElement, createElement, addClass, removeClass, setStyle } from '../utils/dom'
import { dispatch } from '../utils/events'
import { clamp } from '../utils/math'

const DEFAULTS = {
  viewMode: 0 as const,
  dragMode: 'crop' as const,
  initialAspectRatio: 1, // Default to square
  aspectRatio: NaN,
  responsive: true,
  restore: true,
  checkCrossOrigin: true,
  checkOrientation: true,
  modal: true,
  guides: true,
  center: true,
  highlight: true,
  background: true,
  autoCrop: true,
  autoCropArea: 0.8, // Deprecated, use initialCropBoxSize instead
  initialCropBoxSize: 0.5, // Default to 50% of the smaller dimension
  movable: true,
  rotatable: true,
  scalable: true,
  skewable: true,
  translatable: true,
  zoomable: true,
  zoomOnTouch: true,
  zoomOnWheel: true,
  wheelZoomRatio: 0.1,
  scaleStep: 0.1,
  cropBoxMovable: true,
  cropBoxResizable: true,
  toggleDragModeOnDblclick: true,
  minContainerWidth: 200,
  minContainerHeight: 100,
  minCanvasWidth: 0,
  minCanvasHeight: 0,
  minCropBoxWidth: 0,
  minCropBoxHeight: 0,
  maxCropBoxWidth: Infinity,
  maxCropBoxHeight: Infinity,
  alt: '',
  crossorigin: '',
  themeColor: '#39f'
}

export class Cropper {
  private element: string | Element
  private container: HTMLElement | null = null
  private wrapper: HTMLElement | null = null
  private options: CropperOptions
  private cropBox: CropBox | null = null
  private imageProcessor: ImageProcessor | null = null
  private interactionManager: InteractionManager | null = null
  private ready = false
  private disabled = false
  private currentAction: Action = 'crop'
  private dragMode: DragMode = 'crop'
  private zoom = 1

  constructor(element: string | Element, options: CropperOptions = {}) {
    this.element = element
    this.options = { ...DEFAULTS, ...options }
    this.dragMode = this.options.dragMode || 'crop'

    this.init()
  }

  /**
   * Initialize cropper
   */
  private async init(): Promise<void> {
    // Get container element
    const el = getElement(this.element)
    if (!el) {
      throw new Error('Container element not found')
    }

    this.container = el as HTMLElement

    // Create wrapper
    this.wrapper = createElement('div', 'cropper-container')
    this.container.appendChild(this.wrapper)
    
    // Add background immediately if enabled
    if (this.options.background) {
      this.addBackground()
    }

    // Create image processor
    this.imageProcessor = new ImageProcessor(this.wrapper)

    // Load image if src provided
    if (this.options.src) {
      await this.replace(this.options.src)
    }
  }

  /**
   * Replace image
   */
  async replace(src: string): Promise<void> {
    if (!this.imageProcessor || !this.wrapper) return

    try {
      // Load image
      await this.imageProcessor.load(
        src,
        this.options.checkCrossOrigin ? this.options.crossorigin : undefined
      )

      // Initialize crop box
      this.initCropBox()

      // Initialize interaction manager
      this.initInteractionManager()

      // Mark as ready
      this.ready = true

      // Dispatch ready event
      if (this.container) {
        dispatch(this.container, 'ready', { cropper: this })
      }

      // Call ready callback
      if (this.options.ready) {
        this.options.ready(new CustomEvent('ready', { detail: { cropper: this } }))
      }
    } catch (error) {
      console.error('Failed to load image:', error)
      throw error
    }
  }

  /**
   * Initialize crop box
   */
  private initCropBox(): void {
    if (!this.wrapper || !this.imageProcessor) return

    const imageData = this.imageProcessor.getImageData()
    if (!imageData) return

    // Get the display rectangle of the image (including its offset in the container)
    const displayRect = this.imageProcessor.getDisplayRect()
    if (!displayRect) return

    // Create crop box
    this.cropBox = new CropBox(this.wrapper, {
      aspectRatio: this.options.aspectRatio || this.options.initialAspectRatio || undefined,
      minWidth: this.options.minCropBoxWidth,
      minHeight: this.options.minCropBoxHeight,
      maxWidth: this.options.maxCropBoxWidth,
      maxHeight: this.options.maxCropBoxHeight,
      modal: this.options.modal,
      guides: this.options.guides,
      center: this.options.center,
      highlight: this.options.highlight,
      background: this.options.background
    })

    // Render crop box
    this.cropBox.render()

    // Auto crop
    if (this.options.autoCrop) {
      // Use initialCropBoxSize if provided, otherwise use autoCropArea for backwards compatibility
      const sizeRatio = this.options.initialCropBoxSize ?? this.options.autoCropArea ?? 0.5
      
      // Use aspect ratio if provided, otherwise use initialAspectRatio (default to 1 for square)
      const aspectRatio = this.options.aspectRatio || this.options.initialAspectRatio || 1
      
      let width, height

      // Calculate initial crop box size based on the smaller dimension of the image
      const minImageDimension = Math.min(displayRect.width, displayRect.height)
      
      if (aspectRatio === 1) {
        // For square crop box
        width = minImageDimension * sizeRatio
        height = width
      } else if (aspectRatio > 1) {
        // Landscape orientation
        // Start with the smaller dimension and calculate based on aspect ratio
        height = minImageDimension * sizeRatio
        width = height * aspectRatio
        
        // If width exceeds the image width, scale down
        if (width > displayRect.width * 0.9) {
          width = displayRect.width * sizeRatio
          height = width / aspectRatio
        }
      } else {
        // Portrait orientation
        width = minImageDimension * sizeRatio
        height = width / aspectRatio
        
        // If height exceeds the image height, scale down
        if (height > displayRect.height * 0.9) {
          height = displayRect.height * sizeRatio
          width = height * aspectRatio
        }
      }

      // Ensure crop box doesn't exceed image boundaries
      width = Math.min(width, displayRect.width * 0.95)
      height = Math.min(height, displayRect.height * 0.95)

      // Center the crop box relative to the actual image position in the container
      const left = displayRect.left + (displayRect.width - width) / 2
      const top = displayRect.top + (displayRect.height - height) / 2

      this.cropBox.setData({
        left,
        top,
        width,
        height
      })
    }
  }

  /**
   * Initialize interaction manager
   */
  private initInteractionManager(): void {
    if (!this.wrapper) return

    this.interactionManager = new InteractionManager(
      this.wrapper,
      {
        onStart: this.handleInteractionStart.bind(this),
        onMove: this.handleInteractionMove.bind(this),
        onEnd: this.handleInteractionEnd.bind(this),
        onZoom: this.handleZoom.bind(this)
      },
      {
        movable: this.options.movable,
        zoomable: this.options.zoomable,
        zoomOnTouch: this.options.zoomOnTouch,
        zoomOnWheel: this.options.zoomOnWheel,
        wheelZoomRatio: this.options.wheelZoomRatio
      }
    )
  }

  /**
   * Handle interaction start
   */
  private handleInteractionStart(action: Action, point: Point, event: MouseEvent | TouchEvent): void {
    this.currentAction = action

    if (this.container) {
      dispatch(this.container, 'cropstart', {
        action,
        originalEvent: event
      })
    }

    if (this.options.cropstart) {
      this.options.cropstart(new CustomEvent('cropstart', { detail: { action, originalEvent: event } }))
    }
  }

  /**
   * Handle interaction move
   */
  private handleInteractionMove(
    action: Action,
    point: Point,
    deltaX: number,
    deltaY: number,
    event: MouseEvent | TouchEvent
  ): void {
    if (!this.cropBox) return

    // Handle different actions
    switch (action) {
      case 'move':
        if (this.options.cropBoxMovable) {
          this.cropBox.move(deltaX, deltaY)
          this.applyViewModeConstraints()
        }
        break

      case 'crop':
        // Move entire image (not the crop box)
        if (this.options.movable && this.imageProcessor) {
          this.imageProcessor.move(deltaX, deltaY)
        }
        break

      // Handle resize actions
      case 'e':
      case 'w':
      case 's':
      case 'n':
      case 'se':
      case 'sw':
      case 'ne':
      case 'nw':
        if (this.options.cropBoxResizable) {
          this.handleResize(action, deltaX, deltaY)
          this.applyViewModeConstraints()
        }
        break
    }

    // Dispatch crop event
    if (this.container) {
      dispatch(this.container, 'crop', this.getData())
    }

    if (this.options.crop) {
      this.options.crop(new CustomEvent('crop', { detail: this.getData() }))
    }
  }

  /**
   * Handle interaction end
   */
  private handleInteractionEnd(action: Action, point: Point, event: MouseEvent | TouchEvent): void {
    if (this.container) {
      dispatch(this.container, 'cropend', {
        action,
        originalEvent: event
      })
    }

    if (this.options.cropend) {
      this.options.cropend(new CustomEvent('cropend', { detail: { action, originalEvent: event } }))
    }
  }

  /**
   * Handle resize
   */
  private handleResize(action: Action, deltaX: number, deltaY: number): void {
    if (!this.cropBox) return

    const data = this.cropBox.getData()
    const newData = { ...data }

    switch (action) {
      case 'e':
        newData.width = data.width + deltaX
        break
      case 'w':
        newData.width = data.width - deltaX
        newData.left = data.left + deltaX
        break
      case 's':
        newData.height = data.height + deltaY
        break
      case 'n':
        newData.height = data.height - deltaY
        newData.top = data.top + deltaY
        break
      case 'se':
        newData.width = data.width + deltaX
        newData.height = data.height + deltaY
        break
      case 'sw':
        newData.width = data.width - deltaX
        newData.height = data.height + deltaY
        newData.left = data.left + deltaX
        break
      case 'ne':
        newData.width = data.width + deltaX
        newData.height = data.height - deltaY
        newData.top = data.top + deltaY
        break
      case 'nw':
        newData.width = data.width - deltaX
        newData.height = data.height - deltaY
        newData.left = data.left + deltaX
        newData.top = data.top + deltaY
        break
    }

    this.cropBox.setData(newData)
  }

  /**
   * Apply view mode constraints
   */
  private applyViewModeConstraints(): void {
    if (!this.cropBox || !this.imageProcessor) return

    const viewMode = this.options.viewMode || 0
    if (viewMode === 0) return // No restrictions

    const imageRect = this.imageProcessor.getDisplayRect()
    if (!imageRect) return

    const cropBoxData = this.cropBox.getData()

    if (viewMode >= 1) {
      // Restrict crop box to not exceed the image boundaries
      const newData = { ...cropBoxData }

      // Constrain position
      newData.left = clamp(cropBoxData.left, imageRect.left, imageRect.left + imageRect.width - cropBoxData.width)
      newData.top = clamp(cropBoxData.top, imageRect.top, imageRect.top + imageRect.height - cropBoxData.height)

      // Constrain size
      if (cropBoxData.left < imageRect.left || cropBoxData.left + cropBoxData.width > imageRect.left + imageRect.width) {
        newData.width = Math.min(cropBoxData.width, imageRect.width)
        newData.left = Math.max(imageRect.left, Math.min(cropBoxData.left, imageRect.left + imageRect.width - newData.width))
      }

      if (cropBoxData.top < imageRect.top || cropBoxData.top + cropBoxData.height > imageRect.top + imageRect.height) {
        newData.height = Math.min(cropBoxData.height, imageRect.height)
        newData.top = Math.max(imageRect.top, Math.min(cropBoxData.top, imageRect.top + imageRect.height - newData.height))
      }

      this.cropBox.setData(newData, false)
    }
  }

  /**
   * Handle zoom
   */
  private handleZoom(delta: number, point: Point, event: WheelEvent | TouchEvent): void {
    if (!this.options.zoomable || !this.imageProcessor) return

    const imageData = this.imageProcessor.getImageData()
    if (!imageData) return

    // Calculate new scale based on delta
    const ratio = 1 + delta
    const newScaleX = imageData.scaleX * ratio
    const newScaleY = imageData.scaleY * ratio

    // Apply the new scale
    this.imageProcessor.scale(newScaleX, newScaleY)

    // Update zoom tracking
    this.zoom = (newScaleX + newScaleY) / 2

    if (this.container) {
      dispatch(this.container, 'zoom', { zoom: this.zoom, originalEvent: event })
    }

    if (this.options.zoom) {
      this.options.zoom(new CustomEvent('zoom', { detail: { zoom: this.zoom, originalEvent: event } }))
    }
  }

  /**
   * Get crop data
   */
  getData(rounded = false): CropData {
    if (!this.cropBox || !this.imageProcessor) {
      return {
        x: 0, y: 0, width: 0, height: 0,
        rotate: 0, scaleX: 1, scaleY: 1,
        skewX: 0, skewY: 0,
        translateX: 0, translateY: 0
      }
    }

    const cropBoxData = this.cropBox.getData()
    const imageData = this.imageProcessor.getImageData()

    if (!imageData) {
      return {
        x: 0, y: 0, width: 0, height: 0,
        rotate: 0, scaleX: 1, scaleY: 1,
        skewX: 0, skewY: 0,
        translateX: 0, translateY: 0
      }
    }

    const data: CropData = {
      x: cropBoxData.left,
      y: cropBoxData.top,
      width: cropBoxData.width,
      height: cropBoxData.height,
      rotate: imageData.rotate,
      scaleX: imageData.scaleX,
      scaleY: imageData.scaleY,
      skewX: imageData.skewX,
      skewY: imageData.skewY,
      translateX: imageData.translateX,
      translateY: imageData.translateY
    }

    if (rounded) {
      data.x = Math.round(data.x)
      data.y = Math.round(data.y)
      data.width = Math.round(data.width)
      data.height = Math.round(data.height)
    }

    return data
  }

  /**
   * Get image data
   */
  getImageData(): ImageData | null {
    if (!this.imageProcessor) return null
    return this.imageProcessor.getImageData()
  }

  /**
   * Set crop box data
   */
  setData(data: Partial<CropBoxData>): void {
    if (!this.ready || !this.cropBox) return
    this.cropBox.setData(data)
  }

  /**
   * Get cropped canvas
   */
  getCroppedCanvas(options?: GetCroppedCanvasOptions): HTMLCanvasElement | null {
    if (!this.ready || !this.cropBox || !this.imageProcessor) return null

    const cropBoxData = this.cropBox.getData()
    return this.imageProcessor.getCroppedCanvas(cropBoxData, options)
  }

  /**
   * Rotate image
   */
  rotate(degrees: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.rotatable) return
    this.imageProcessor.rotate(degrees)
  }

  /**
   * Scale image
   */
  scale(scaleX: number, scaleY?: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.scalable) return
    this.imageProcessor.scale(scaleX, scaleY)
  }

  /**
   * Flip horizontal
   */
  scaleX(scaleX: number): void {
    this.scale(scaleX, undefined)
  }

  /**
   * Flip vertical
   */
  scaleY(scaleY: number): void {
    if (!this.ready || !this.imageProcessor) return
    const imageData = this.imageProcessor.getImageData()
    if (imageData) {
      this.scale(imageData.scaleX, scaleY)
    }
  }

  /**
   * Skew image
   */
  skew(skewX: number, skewY?: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.skewable) return
    this.imageProcessor.skew(skewX, skewY)
  }

  /**
   * Skew horizontal
   */
  skewX(skewX: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.skewable) return
    this.imageProcessor.skewX(skewX)
  }

  /**
   * Skew vertical
   */
  skewY(skewY: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.skewable) return
    this.imageProcessor.skewY(skewY)
  }

  /**
   * Translate image
   */
  translate(x: number, y: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.translatable) return
    this.imageProcessor.translate(x, y)
  }

  /**
   * Move image
   */
  move(deltaX: number, deltaY: number): void {
    if (!this.ready || !this.imageProcessor || !this.options.translatable) return
    this.imageProcessor.move(deltaX, deltaY)
  }

  /**
   * Add background to the container
   */
  private addBackground(): void {
    if (!this.wrapper) return
    
    // Check if background already exists
    const existingBg = this.wrapper.querySelector('.cropper-bg')
    if (!existingBg) {
      const backgroundElement = createElement('div', 'cropper-bg')
      // Insert as first child to ensure it's at the bottom
      this.wrapper.insertBefore(backgroundElement, this.wrapper.firstChild)
    }
  }

  /**
   * Reset
   */
  reset(): void {
    if (!this.ready) return

    if (this.imageProcessor) {
      this.imageProcessor.reset()
    }

    if (this.cropBox) {
      this.initCropBox()
    }

    this.zoom = 1
  }

  /**
   * Clear
   */
  clear(): void {
    if (!this.ready || !this.cropBox) return
    this.cropBox.hide()
  }

  /**
   * Disable
   */
  disable(): void {
    this.disabled = true
    if (this.interactionManager) {
      this.interactionManager.disable()
    }
  }

  /**
   * Enable
   */
  enable(): void {
    this.disabled = false
    if (this.interactionManager) {
      this.interactionManager.enable()
    }
  }

  /**
   * Destroy
   */
  destroy(): void {
    if (!this.container) return

    if (this.interactionManager) {
      this.interactionManager.destroy()
    }

    if (this.cropBox) {
      this.cropBox.destroy()
    }

    if (this.imageProcessor) {
      this.imageProcessor.destroy()
    }

    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper)
    }

    this.container = null
    this.wrapper = null
    this.cropBox = null
    this.imageProcessor = null
    this.interactionManager = null
    this.ready = false
  }
}
