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
  initialAspectRatio: NaN,
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
  autoCropArea: 0.8,
  movable: true,
  rotatable: true,
  scalable: true,
  zoomable: true,
  zoomOnTouch: true,
  zoomOnWheel: true,
  wheelZoomRatio: 0.1,
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
  crossorigin: ''
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

    // Create crop box
    this.cropBox = new CropBox(this.wrapper, {
      aspectRatio: this.options.aspectRatio || undefined,
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
      const area = this.options.autoCropArea || 0.8
      const width = imageData.width * area
      const height = this.options.aspectRatio
        ? width / this.options.aspectRatio
        : imageData.height * area

      this.cropBox.setData({
        left: (imageData.width - width) / 2,
        top: (imageData.height - height) / 2,
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
        }
        break

      case 'crop':
        // Move entire canvas
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
   * Handle zoom
   */
  private handleZoom(delta: number, point: Point, event: WheelEvent | TouchEvent): void {
    if (!this.options.zoomable) return

    const newZoom = clamp(this.zoom + delta, 0.1, 10)
    this.zoom = newZoom

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
      return { x: 0, y: 0, width: 0, height: 0, rotate: 0, scaleX: 1, scaleY: 1 }
    }

    const cropBoxData = this.cropBox.getData()
    const imageData = this.imageProcessor.getImageData()

    if (!imageData) {
      return { x: 0, y: 0, width: 0, height: 0, rotate: 0, scaleX: 1, scaleY: 1 }
    }

    const data: CropData = {
      x: cropBoxData.left,
      y: cropBoxData.top,
      width: cropBoxData.width,
      height: cropBoxData.height,
      rotate: imageData.rotate,
      scaleX: imageData.scaleX,
      scaleY: imageData.scaleY
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
