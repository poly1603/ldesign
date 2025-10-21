/**
 * Lit Web Component
 */

import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { Chart } from '../../../core/chart'
import type { ChartConfig, ChartData } from '../../../types'

@customElement('ldesign-chart')
export class ChartElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      min-height: 200px;
    }

    .chart-container {
      width: 100%;
      height: 100%;
    }

    .loading,
    .error {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .error {
      color: #f56c6c;
    }
  `

  @property() type!: string
  @property({ type: Object }) data!: ChartData
  @property() title?: string
  @property() theme?: string
  @property({ type: Boolean }) darkMode = false
  @property({ type: Number }) fontSize?: number
  @property({ type: Boolean }) lazy = false
  @property({ type: Boolean }) virtual = false
  @property({ type: Boolean }) worker = false
  @property({ type: Boolean }) cache = true
  @property({ type: Object }) echarts?: any

  @state() private isLoading = true
  @state() private error: Error | null = null

  private chart?: Chart
  private container?: HTMLDivElement

  async firstUpdated() {
    await this.initChart()
  }

  async updated(changed: Map<string, any>) {
    if (changed.has('data') && this.chart) {
      await this.chart.updateData(this.data)
    }

    if (changed.has('theme') && this.chart && this.theme) {
      this.chart.setTheme(this.theme)
    }

    if (changed.has('darkMode') && this.chart) {
      this.chart.setDarkMode(this.darkMode)
    }

    if (changed.has('fontSize') && this.chart && this.fontSize) {
      this.chart.setFontSize(this.fontSize)
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.chart?.dispose()
  }

  private async initChart() {
    const container = this.shadowRoot?.querySelector('.chart-container') as HTMLDivElement
    if (!container) return

    try {
      this.isLoading = true
      this.error = null

      if (this.chart) {
        this.chart.dispose()
      }

      const config: ChartConfig = {
        type: this.type as any,
        data: this.data,
        title: this.title,
        theme: this.theme,
        darkMode: this.darkMode,
        fontSize: this.fontSize,
        lazy: this.lazy,
        virtual: this.virtual,
        worker: this.worker,
        cache: this.cache,
        echarts: this.echarts,
      }

      this.chart = new Chart(container, config)

      this.isLoading = false
      this.dispatchEvent(new CustomEvent('ready', { detail: this.chart }))
    } catch (err) {
      this.error = err as Error
      this.isLoading = false
      this.dispatchEvent(new CustomEvent('error', { detail: err }))
    }
  }

  public refresh() {
    this.chart?.refresh()
  }

  public resize() {
    this.chart?.resize()
  }

  public getDataURL() {
    return this.chart?.getDataURL() || ''
  }

  render() {
    return html`
      ${this.isLoading ? html`<div class="loading">加载中...</div>` : ''}
      ${this.error ? html`<div class="error">${this.error.message}</div>` : ''}
      <div class="chart-container"></div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ldesign-chart': ChartElement
  }
}

