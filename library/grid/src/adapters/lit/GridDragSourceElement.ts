/**
 * Lit GridDragSource Web Component
 */

import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { DragSourceOptions } from '../../types'

@customElement('grid-drag-source')
export class GridDragSourceElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      cursor: move;
      user-select: none;
    }

    :host([dragging]) {
      opacity: 0.5;
    }

    :host(:hover) {
      background-color: rgba(0, 0, 0, 0.05);
    }
  `

  @property({ type: Object })
  data?: any

  @property({ type: Object })
  itemOptions?: any

  @property({ type: String })
  preview?: string

  @property({ type: String })
  helper?: 'clone' | 'original' = 'clone'

  @property({ type: Boolean })
  revert?: boolean = false

  @state()
  private isDragging = false

  private cleanup?: () => void

  connectedCallback() {
    super.connectedCallback()
    this.setAttribute('draggable', 'true')
    this.registerDragSource()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.cleanup?.()
  }

  private registerDragSource() {
    // Find parent grid
    const gridElement = this.closest('grid-stack') as any

    if (!gridElement || !gridElement.getGridInstance) {
      console.warn('grid-drag-source must be used within a grid-stack element')
      return
    }

    const gridInstance = gridElement.getGridInstance()
    if (!gridInstance) return

    const dragManager = gridInstance.getDragManager()

    const options: DragSourceOptions = {
      data: this.data,
      itemOptions: this.itemOptions,
      preview: this.preview,
      helper: this.helper,
      revert: this.revert
    }

    // Register drag source
    this.cleanup = dragManager.registerDragSource(this, options)

    // Add event listeners
    this.addEventListener('dragstart', this.handleDragStart)
    this.addEventListener('dragend', this.handleDragEnd)
  }

  private handleDragStart = () => {
    this.isDragging = true
    this.setAttribute('dragging', '')
    this.dispatchEvent(new CustomEvent('drag-source-start', {
      bubbles: true,
      composed: true
    }))
  }

  private handleDragEnd = () => {
    this.isDragging = false
    this.removeAttribute('dragging')
    this.dispatchEvent(new CustomEvent('drag-source-end', {
      bubbles: true,
      composed: true
    }))
  }

  render() {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'grid-drag-source': GridDragSourceElement
  }
}













