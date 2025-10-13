/**
 * CropBox - Manages the crop box
 */

import type { CropBoxData, Rectangle } from '../types'
import { clamp } from '../utils/math'
import { createElement, setStyle, addClass } from '../utils/dom'

export interface CropBoxOptions {
  aspectRatio?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  modal?: boolean
  guides?: boolean
  center?: boolean
  highlight?: boolean
  background?: boolean
}

export class CropBox {
  private element: HTMLDivElement
  private container: HTMLElement
  private data: CropBoxData
  private aspectRatio?: number
  private minWidth: number
  private minHeight: number
  private maxWidth?: number
  private maxHeight?: number
  private modal?: boolean
  private guides?: boolean
  private center?: boolean
  private highlight?: boolean
  private background?: boolean

  // UI Elements
  private modalElement?: HTMLDivElement
  private backgroundElement?: HTMLDivElement
  private viewBoxElement?: HTMLDivElement
  private dashedElements?: HTMLDivElement[]
  private centerElement?: HTMLDivElement

  constructor(
    container: HTMLElement,
    options: CropBoxOptions = {}
  ) {
    this.container = container
    this.aspectRatio = options.aspectRatio
    this.minWidth = options.minWidth || 0
    this.minHeight = options.minHeight || 0
    this.maxWidth = options.maxWidth
    this.maxHeight = options.maxHeight
    this.modal = options.modal ?? true
    this.guides = options.guides ?? true
    this.center = options.center ?? true
    this.highlight = options.highlight ?? true
    this.background = options.background ?? false // Background is now handled by Cropper

    this.element = this.createCropBox()
    this.data = {
      left: 0,
      top: 0,
      width: 0,
      height: 0
    }
  }

  /**
   * Create crop box element
   */
  private createCropBox(): HTMLDivElement {
    const cropBox = createElement('div', 'cropper-crop-box')

    // Create view box (inner container)
    this.viewBoxElement = createElement('div', 'cropper-view-box')

    // Create face (center draggable area)
    const face = createElement('div', 'cropper-face')
    if (this.highlight) {
      addClass(face, 'cropper-highlight')
    }

    // Create dashed lines (guides)
    this.dashedElements = []
    if (this.guides) {
      const dashedH = createElement('div', 'cropper-dashed dashed-h')
      const dashedV = createElement('div', 'cropper-dashed dashed-v')
      this.dashedElements.push(dashedH, dashedV)
      this.viewBoxElement.appendChild(dashedH)
      this.viewBoxElement.appendChild(dashedV)
    }

    // Create center indicator
    if (this.center) {
      this.centerElement = createElement('div', 'cropper-center')
      this.viewBoxElement.appendChild(this.centerElement)
    }

    // Create lines (edges for resizing)
    const lineN = createElement('div', 'cropper-line line-n')
    const lineE = createElement('div', 'cropper-line line-e')
    const lineS = createElement('div', 'cropper-line line-s')
    const lineW = createElement('div', 'cropper-line line-w')

    // Create points (corners and midpoints)
    const pointN = createElement('div', 'cropper-point point-n')
    const pointE = createElement('div', 'cropper-point point-e')
    const pointS = createElement('div', 'cropper-point point-s')
    const pointW = createElement('div', 'cropper-point point-w')
    const pointNE = createElement('div', 'cropper-point point-ne')
    const pointNW = createElement('div', 'cropper-point point-nw')
    const pointSE = createElement('div', 'cropper-point point-se')
    const pointSW = createElement('div', 'cropper-point point-sw')

    // Append all elements to view box
    this.viewBoxElement.appendChild(face)

    // Append all elements to crop box
    cropBox.appendChild(this.viewBoxElement)
    cropBox.appendChild(lineN)
    cropBox.appendChild(lineE)
    cropBox.appendChild(lineS)
    cropBox.appendChild(lineW)
    cropBox.appendChild(pointN)
    cropBox.appendChild(pointE)
    cropBox.appendChild(pointS)
    cropBox.appendChild(pointW)
    cropBox.appendChild(pointNE)
    cropBox.appendChild(pointNW)
    cropBox.appendChild(pointSE)
    cropBox.appendChild(pointSW)

    return cropBox
  }

  /**
   * Render crop box to DOM
   */
  render(): void {
    // Create and append modal (overlay)
    if (this.modal) {
      this.modalElement = createElement('div', 'cropper-modal')
      this.container.appendChild(this.modalElement)
    }

    // Append crop box
    this.container.appendChild(this.element)
  }

  /**
   * Set crop box data
   */
  setData(data: Partial<CropBoxData>, constrain = true): void {
    const newData = { ...this.data, ...data }

    if (constrain) {
      // Apply aspect ratio constraint
      if (this.aspectRatio) {
        if (data.width !== undefined) {
          newData.height = newData.width / this.aspectRatio
        } else if (data.height !== undefined) {
          newData.width = newData.height * this.aspectRatio
        }
      }

      // Apply size constraints
      newData.width = clamp(
        newData.width,
        this.minWidth,
        this.maxWidth || Infinity
      )
      newData.height = clamp(
        newData.height,
        this.minHeight,
        this.maxHeight || Infinity
      )

      // Apply position constraints (keep within container)
      const containerRect = this.container.getBoundingClientRect()
      newData.left = clamp(newData.left, 0, containerRect.width - newData.width)
      newData.top = clamp(newData.top, 0, containerRect.height - newData.height)
    }

    this.data = newData
    this.update()
  }

  /**
   * Get crop box data
   */
  getData(): CropBoxData {
    return { ...this.data }
  }

  /**
   * Update crop box visual
   */
  update(): void {
    setStyle(this.element, {
      left: `${this.data.left}px`,
      top: `${this.data.top}px`,
      width: `${this.data.width}px`,
      height: `${this.data.height}px`
    })
  }

  /**
   * Move crop box
   */
  move(deltaX: number, deltaY: number): void {
    this.setData({
      left: this.data.left + deltaX,
      top: this.data.top + deltaY
    })
  }

  /**
   * Resize crop box
   */
  resize(width: number, height: number): void {
    this.setData({ width, height })
  }

  /**
   * Set aspect ratio
   */
  setAspectRatio(aspectRatio?: number): void {
    this.aspectRatio = aspectRatio

    if (aspectRatio && this.data.width) {
      this.setData({ height: this.data.width / aspectRatio })
    }
  }

  /**
   * Get element
   */
  getElement(): HTMLDivElement {
    return this.element
  }

  /**
   * Show crop box
   */
  show(): void {
    setStyle(this.element, { display: 'block' })
  }

  /**
   * Hide crop box
   */
  hide(): void {
    setStyle(this.element, { display: 'none' })
  }

  /**
   * Check if point is inside crop box
   */
  contains(x: number, y: number): boolean {
    return (
      x >= this.data.left &&
      x <= this.data.left + this.data.width &&
      y >= this.data.top &&
      y <= this.data.top + this.data.height
    )
  }

  /**
   * Get rectangle
   */
  getRectangle(): Rectangle {
    return {
      left: this.data.left,
      top: this.data.top,
      width: this.data.width,
      height: this.data.height
    }
  }

  /**
   * Destroy crop box
   */
  destroy(): void {
    // Remove background
    if (this.backgroundElement && this.backgroundElement.parentNode) {
      this.backgroundElement.parentNode.removeChild(this.backgroundElement)
    }

    // Remove modal
    if (this.modalElement && this.modalElement.parentNode) {
      this.modalElement.parentNode.removeChild(this.modalElement)
    }

    // Remove crop box
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
  }
}
