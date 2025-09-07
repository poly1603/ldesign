/**
 * LDesignTextarea Lit 组件
 */

import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

declare global {
  interface HTMLElementTagNameMap {
    'ldesign-textarea': LDesignTextarea
  }
}

@customElement('ldesign-textarea')
export class LDesignTextarea extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `

  @property({ type: String })
  placeholder: string = ''

  @property({ type: String })
  value: string = ''

  render() {
    return html`
      <textarea 
        class="form-input"
        placeholder="${this.placeholder}"
        .value="${this.value}"
      ></textarea>
    `
  }
}
