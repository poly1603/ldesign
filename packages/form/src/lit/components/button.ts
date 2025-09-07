/**
 * LDesignButton Lit 组件
 */

import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

declare global {
  interface HTMLElementTagNameMap {
    'ldesign-button': LDesignButton
  }
}

@customElement('ldesign-button')
export class LDesignButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
  `

  @property({ type: String })
  variant: 'primary' | 'secondary' | 'outline' = 'primary'

  render() {
    return html`
      <button class="form-button ${this.variant}">
        <slot></slot>
      </button>
    `
  }
}
