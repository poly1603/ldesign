/**
 * LDesignFormItem Lit 组件
 * 
 * @description
 * 基于 Lit 的表单项组件实现
 */

import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

declare global {
  interface HTMLElementTagNameMap {
    'ldesign-form-item': LDesignFormItem
  }
}

@customElement('ldesign-form-item')
export class LDesignFormItem extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-bottom: var(--ls-margin-base, 20px);
    }
  `

  @property({ type: String })
  name: string = ''

  @property({ type: String })
  label: string = ''

  @property({ type: String })
  type: string = 'text'

  render() {
    return html`
      <div class="form-item">
        <slot></slot>
      </div>
    `
  }
}
