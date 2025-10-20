/**
 * Lit GridItem Web Component
 */

import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { GridItemOptions, GridItem } from '../../types'

@customElement('grid-item')
export class GridItemElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .item-content {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  `

  @property({ type: String })
  id!: string

  @property({ type: Number })
  x?: number

  @property({ type: Number })
  y?: number

  @property({ type: Number })
  w?: number

  @property({ type: Number })
  h?: number

  @property({ type: Number })
  minW?: number

  @property({ type: Number })
  maxW?: number

  @property({ type: Number })
  minH?: number

  @property({ type: Number })
  maxH?: number

  @property({ type: Boolean })
  locked?: boolean

  @property({ type: Boolean })
  noResize?: boolean

  @property({ type: Boolean })
  noMove?: boolean

  @property({ type: Object })
  data?: any

  private gridItem?: GridItem

  connectedCallback() {
    super.connectedCallback()
    this.classList.add('grid-stack-item')
    this.addToGrid()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeFromGrid()
  }

  private addToGrid() {
    // Find parent grid
    const gridElement = this.closest('grid-stack') as any

    if (!gridElement || !gridElement.getGridInstance) return

    const gridInstance = gridElement.getGridInstance()
    if (!gridInstance) return

    // Add this element to grid
    const options: GridItemOptions = {
      id: this.id,
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      minW: this.minW,
      maxW: this.maxW,
      minH: this.minH,
      maxH: this.maxH,
      locked: this.locked,
      noResize: this.noResize,
      noMove: this.noMove,
      data: this.data
    }

    this.gridItem = gridInstance.addItem(this, options)
  }

  private removeFromGrid() {
    if (!this.gridItem) return

    const gridElement = this.closest('grid-stack') as any
    if (!gridElement || !gridElement.getGridInstance) return

    const gridInstance = gridElement.getGridInstance()
    if (!gridInstance) return

    gridInstance.removeItem(this.gridItem.id!)
  }

  render() {
    return html`
      <div class="item-content grid-stack-item-content">
        <slot></slot>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'grid-item': GridItemElement
  }
}













