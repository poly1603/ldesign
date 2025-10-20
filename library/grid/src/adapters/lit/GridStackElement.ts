/**
 * Lit GridStack Web Component
 */

import { LitElement, html, css } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import type { GridOptions, IGridInstance, GridItemOptions } from '../../types'
import { GridManager } from '../../core/GridManager'

@customElement('grid-stack')
export class GridStackElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .grid-container {
      width: 100%;
      height: 100%;
    }
  `

  @property({ type: Object })
  options?: GridOptions

  @query('.grid-container')
  private container!: HTMLDivElement

  private gridInstance?: IGridInstance

  firstUpdated() {
    if (!this.container) return

    const manager = GridManager.getInstance()
    this.gridInstance = manager.create(this.container, this.options || {})

    // Setup event listeners
    this.gridInstance.on('added', (item: GridItemOptions) => {
      this.dispatchEvent(new CustomEvent('grid-added', {
        detail: { item },
        bubbles: true,
        composed: true
      }))
    })

    this.gridInstance.on('removed', (item: GridItemOptions) => {
      this.dispatchEvent(new CustomEvent('grid-removed', {
        detail: { item },
        bubbles: true,
        composed: true
      }))
    })

    this.gridInstance.on('change', (items: GridItemOptions[]) => {
      this.dispatchEvent(new CustomEvent('grid-change', {
        detail: { items },
        bubbles: true,
        composed: true
      }))
    })

    this.dispatchEvent(new CustomEvent('grid-ready', {
      detail: { gridInstance: this.gridInstance },
      bubbles: true,
      composed: true
    }))
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.gridInstance) {
      this.gridInstance.destroy()
    }
  }

  render() {
    return html`
      <div class="grid-container grid-stack">
        <slot></slot>
      </div>
    `
  }

  // Public API
  public addItem(element: HTMLElement, options: GridItemOptions) {
    if (!this.gridInstance) return
    return this.gridInstance.addItem(element, options)
  }

  public removeItem(id: string) {
    if (!this.gridInstance) return
    this.gridInstance.removeItem(id)
  }

  public clear() {
    if (!this.gridInstance) return
    this.gridInstance.clear()
  }

  public save() {
    if (!this.gridInstance) return
    return this.gridInstance.save()
  }

  public load(layout: any) {
    if (!this.gridInstance) return
    this.gridInstance.load(layout)
  }

  public getGridInstance() {
    return this.gridInstance
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'grid-stack': GridStackElement
  }
}













