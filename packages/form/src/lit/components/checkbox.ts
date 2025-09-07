/**
 * LDesignCheckbox Lit 组件
 */

import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

declare global {
  interface HTMLElementTagNameMap {
    'ldesign-checkbox': LDesignCheckbox
  }
}

@customElement('ldesign-checkbox')
export class LDesignCheckbox extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `

  @property({ type: Boolean })
  checked: boolean = false

  @property({ type: String })
  label: string = ''

  render() {
    return html`
      <div class="checkbox-field">
        <input 
          type="checkbox"
          class="form-checkbox"
          .checked="${this.checked}"
        />
        <label class="checkbox-label">${this.label}</label>
      </div>
    `
  }
}
