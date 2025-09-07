/**
 * LDesignInput Lit 组件
 */

import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

declare global {
  interface HTMLElementTagNameMap {
    'ldesign-input': LDesignInput
  }
}

@customElement('ldesign-input')
export class LDesignInput extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `

  @property({ type: String })
  type: string = 'text'

  @property({ type: String })
  placeholder: string = ''

  @property({ type: String })
  value: string = ''

  render() {
    return html`
      <input 
        class="form-input"
        type="${this.type}"
        placeholder="${this.placeholder}"
        .value="${this.value}"
      />
    `
  }
}
