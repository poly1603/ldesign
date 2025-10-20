/**
 * Drag Manager - Handles external drag sources and drag operations
 */

import type { DragSourceOptions, DragEventData, GridItemOptions, IGridInstance } from '../types'
import { generateId, normalizeItemOptions } from '../utils/grid-utils'

export class DragManager {
  private grid: IGridInstance
  private dragSources = new WeakMap<HTMLElement, DragSourceOptions>()
  private activeDrag: DragEventData | null = null
  private placeholder: HTMLElement | null = null
  private isDragging = false

  constructor(grid: IGridInstance) {
    this.grid = grid
    this.init()
  }

  /**
   * Initialize drag manager
   */
  private init(): void {
    // Setup drop zone on grid container
    this.setupDropZone()
  }

  /**
   * Setup drop zone
   */
  private setupDropZone(): void {
    const container = this.grid.container

    container.addEventListener('dragover', this.handleDragOver)
    container.addEventListener('drop', this.handleDrop)
    container.addEventListener('dragleave', this.handleDragLeave)
  }

  /**
   * Register external drag source
   */
  registerDragSource(element: HTMLElement, options: DragSourceOptions): () => void {
    // Store options
    this.dragSources.set(element, options)

    // Make element draggable
    element.setAttribute('draggable', 'true')
    element.classList.add('grid-drag-source')

    // Add drag start listener
    const handleDragStart = (e: DragEvent) => {
      this.handleDragStart(e, element, options)
    }

    const handleDragEnd = (e: DragEvent) => {
      this.handleDragEnd(e)
    }

    element.addEventListener('dragstart', handleDragStart)
    element.addEventListener('dragend', handleDragEnd)

    // Return cleanup function
    return () => {
      this.dragSources.delete(element)
      element.removeAttribute('draggable')
      element.classList.remove('grid-drag-source')
      element.removeEventListener('dragstart', handleDragStart)
      element.removeEventListener('dragend', handleDragEnd)
    }
  }

  /**
   * Unregister drag source
   */
  unregisterDragSource(element: HTMLElement): void {
    this.dragSources.delete(element)
    element.removeAttribute('draggable')
    element.classList.remove('grid-drag-source')
  }

  /**
   * Handle drag start
   */
  private handleDragStart = (e: DragEvent, element: HTMLElement, options: DragSourceOptions): void => {
    if (!e.dataTransfer) return

    this.isDragging = true

    // Set drag data
    const dragData = {
      source: element,
      data: options.data,
      itemOptions: options.itemOptions,
      event: e
    }

    this.activeDrag = dragData

    // Set data transfer
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('application/json', JSON.stringify({
      data: options.data,
      itemOptions: options.itemOptions
    }))

    // Set drag image
    if (options.preview) {
      const preview = typeof options.preview === 'string'
        ? this.createPreviewFromHTML(options.preview)
        : options.preview.cloneNode(true) as HTMLElement

      preview.style.position = 'absolute'
      preview.style.top = '-1000px'
      document.body.appendChild(preview)
      e.dataTransfer.setDragImage(preview, 0, 0)

      setTimeout(() => document.body.removeChild(preview), 0)
    } else if (options.helper === 'clone') {
      const clone = element.cloneNode(true) as HTMLElement
      clone.style.position = 'absolute'
      clone.style.top = '-1000px'
      document.body.appendChild(clone)
      e.dataTransfer.setDragImage(clone, 0, 0)

      setTimeout(() => document.body.removeChild(clone), 0)
    }

    // Add dragging class
    element.classList.add('dragging')

    // Emit event
    this.grid.container.dispatchEvent(
      new CustomEvent('drag-start', { detail: dragData })
    )
  }

  /**
   * Handle drag over
   */
  private handleDragOver = (e: DragEvent): void => {
    if (!this.isDragging && !e.dataTransfer?.types.includes('application/json')) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }

    // Calculate grid position
    const rect = this.grid.container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Show placeholder
    this.showPlaceholder(x, y)
  }

  /**
   * Handle drop
   */
  private handleDrop = (e: DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()

    if (!e.dataTransfer) return

    // Get drop data
    let dropData: any
    try {
      const jsonData = e.dataTransfer.getData('application/json')
      if (jsonData) {
        dropData = JSON.parse(jsonData)
      }
    } catch (error) {
      console.error('Failed to parse drop data:', error)
    }

    // Calculate grid position
    const rect = this.grid.container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const gridPos = this.calculateGridPosition(x, y)

    // Create item options
    const itemOptions: GridItemOptions = {
      ...normalizeItemOptions(dropData?.itemOptions || {}),
      x: gridPos.x,
      y: gridPos.y,
      autoPosition: true
    }

    // Create new grid item
    const element = this.createItemElement(dropData?.data)
    const item = this.grid.addItem(element, itemOptions)

    // Remove placeholder
    this.removePlaceholder()

    // Emit event
    this.grid.container.dispatchEvent(
      new CustomEvent('item-dropped', {
        detail: {
          item,
          data: this.activeDrag
        }
      })
    )

    this.isDragging = false
    this.activeDrag = null
  }

  /**
   * Handle drag leave
   */
  private handleDragLeave = (e: DragEvent): void => {
    // Check if really leaving the container
    const rect = this.grid.container.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (
      x < rect.left ||
      x > rect.right ||
      y < rect.top ||
      y > rect.bottom
    ) {
      this.removePlaceholder()
    }
  }

  /**
   * Handle drag end
   */
  private handleDragEnd = (e: DragEvent): void => {
    if (this.activeDrag) {
      this.activeDrag.source.classList.remove('dragging')
    }

    this.isDragging = false
    this.activeDrag = null
    this.removePlaceholder()
  }

  /**
   * Show placeholder at position
   */
  private showPlaceholder(x: number, y: number): void {
    if (!this.placeholder) {
      this.placeholder = document.createElement('div')
      this.placeholder.className = 'grid-stack-placeholder'
      this.placeholder.style.position = 'absolute'
      this.placeholder.style.border = '2px dashed #ccc'
      this.placeholder.style.background = 'rgba(0, 0, 0, 0.05)'
      this.placeholder.style.pointerEvents = 'none'
      this.placeholder.style.zIndex = '100'
    }

    const gridPos = this.calculateGridPosition(x, y)
    const itemOptions = this.activeDrag?.itemOptions || { w: 1, h: 1 }

    const cellWidth = this.grid.container.clientWidth / (this.grid.options.column || 12)
    const cellHeight = this.grid.options.cellHeight || 70

    this.placeholder.style.left = `${gridPos.x * cellWidth}px`
    this.placeholder.style.top = `${gridPos.y * cellHeight}px`
    this.placeholder.style.width = `${(itemOptions.w || 1) * cellWidth}px`
    this.placeholder.style.height = `${(itemOptions.h || 1) * cellHeight}px`

    if (!this.placeholder.parentNode) {
      this.grid.container.appendChild(this.placeholder)
    }
  }

  /**
   * Remove placeholder
   */
  private removePlaceholder(): void {
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.parentNode.removeChild(this.placeholder)
    }
  }

  /**
   * Calculate grid position from pixel position
   */
  private calculateGridPosition(x: number, y: number): { x: number; y: number } {
    const columns = this.grid.options.column || 12
    const cellWidth = this.grid.container.clientWidth / columns
    const cellHeight = this.grid.options.cellHeight || 70

    return {
      x: Math.floor(x / cellWidth),
      y: Math.floor(y / cellHeight)
    }
  }

  /**
   * Create item element from data
   */
  private createItemElement(data: any): HTMLElement {
    const element = document.createElement('div')
    element.className = 'grid-stack-item'

    const content = document.createElement('div')
    content.className = 'grid-stack-item-content'

    if (data) {
      if (typeof data === 'string') {
        content.innerHTML = data
      } else if (data.content) {
        content.innerHTML = data.content
      } else {
        content.textContent = JSON.stringify(data)
      }
    }

    element.appendChild(content)
    return element
  }

  /**
   * Create preview element from HTML
   */
  private createPreviewFromHTML(html: string): HTMLElement {
    const template = document.createElement('template')
    template.innerHTML = html.trim()
    return template.content.firstChild as HTMLElement
  }

  /**
   * Get active drag data
   */
  getActiveDrag(): DragEventData | null {
    return this.activeDrag
  }

  /**
   * Check if dragging
   */
  isDraggingActive(): boolean {
    return this.isDragging
  }

  /**
   * Destroy drag manager
   */
  destroy(): void {
    const container = this.grid.container
    container.removeEventListener('dragover', this.handleDragOver)
    container.removeEventListener('drop', this.handleDrop)
    container.removeEventListener('dragleave', this.handleDragLeave)

    this.removePlaceholder()
    this.isDragging = false
    this.activeDrag = null
  }
}













