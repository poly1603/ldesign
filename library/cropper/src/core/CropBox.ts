/**
 * CropBox - Manages the crop box
 */

import type { CropBoxData, Rectangle } from '../types'
import { clamp } from '../utils/math'
import { createElement, setStyle, addClass, removeClass } from '../utils/dom'

export interface CropBoxOptions {
  aspectRatio?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  modal?: boolean
  modalOpacity?: number
  guides?: boolean
  center?: boolean
  highlight?: boolean
  highlightOpacity?: number
  background?: boolean
  style?: 'default' | 'rounded' | 'circle' | 'minimal' | 'dotted' | 'solid' | 'gradient'
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
  private modalOpacity: number
  private guides?: boolean
  private center?: boolean
  private highlight?: boolean
  private highlightOpacity: number
  private background?: boolean
  private style: string

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
    this.modalOpacity = options.modalOpacity ?? 0.3  // Lighter default opacity
    this.guides = options.guides ?? true
    this.center = options.center ?? true
    this.highlight = options.highlight ?? true
    this.highlightOpacity = options.highlightOpacity ?? 0.03
    this.background = options.background ?? false // Background is now handled by Cropper
    this.style = options.style || 'default'

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
    addClass(cropBox, `style-${this.style}`)

    // Create view box (inner container)
    this.viewBoxElement = createElement('div', 'cropper-view-box')

    // Create face (center draggable area)
    const face = createElement('div', 'cropper-face')
    // Remove highlight background as it creates unwanted white overlay

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
      // Apply modal opacity
      setStyle(this.modalElement, {
        backgroundColor: `rgba(0, 0, 0, ${this.modalOpacity})`
      })
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
   * Get data
   */
  getData(): CropBoxData {
    return { ...this.data }
  }

  /**
   * Set aspect ratio
   */
  setAspectRatio(aspectRatio: number, adjustSize: boolean = true): void {
    this.aspectRatio = aspectRatio
    
    // Only update the current crop box size if adjustSize is true
    if (adjustSize && !isNaN(aspectRatio) && aspectRatio > 0) {
      const currentRatio = this.data.width / this.data.height
      
      // Only adjust if the difference is significant (more than 1%)
      if (Math.abs(currentRatio - aspectRatio) > 0.01) {
        const containerRect = this.container.getBoundingClientRect()
        const maxWidth = containerRect.width * 0.9
        const maxHeight = containerRect.height * 0.9
        
        let newWidth = this.data.width
        let newHeight = this.data.height
        
        if (currentRatio > aspectRatio) {
          // Current box is wider than new ratio, adjust width
          newWidth = this.data.height * aspectRatio
          if (newWidth > maxWidth) {
            newWidth = maxWidth
            newHeight = newWidth / aspectRatio
          }
        } else {
          // Current box is taller than new ratio, adjust height
          newHeight = this.data.width / aspectRatio
          if (newHeight > maxHeight) {
            newHeight = maxHeight
            newWidth = newHeight * aspectRatio
          }
        }
        
        // Center the adjusted crop box
        const left = Math.max(0, (containerRect.width - newWidth) / 2)
        const top = Math.max(0, (containerRect.height - newHeight) / 2)
        
        this.setData({ 
          left,
          top,
          width: newWidth,
          height: newHeight 
        })
      }
    }
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
   * Set crop box style
   */
  setStyle(style: string): void {
    // Remove old style class
    removeClass(this.element, `style-${this.style}`)
    
    // Update style
    this.style = style
    
    // Add new style class
    addClass(this.element, `style-${this.style}`)
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
