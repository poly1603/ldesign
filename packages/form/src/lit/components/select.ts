/**
 * LDesignSelect Lit 组件
 */

import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

declare global {
  interface HTMLElementTagNameMap {
    'ldesign-select': LDesignSelect
  }
}

@customElement('ldesign-select')
export class LDesignSelect extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `

  @property({ type: Array })
  options: Array<{ label: string; value: string }> = []

  @property({ type: String })
  value: string = ''

  render() {
    return html`
      <select class="form-input">
        ${this.options.map(option => html`
          <option value="${option.value}" ?selected="${this.value === option.value}">
            ${option.label}
          </option>
        `)}
      </select>
    `
  }
}
