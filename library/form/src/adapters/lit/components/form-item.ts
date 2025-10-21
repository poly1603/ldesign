/**
 * @ldesign/form - Lit FormItem Component
 * Lit 表单项 Web Component
 */

import { LitElement, html, css, type CSSResultGroup } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { ValidationRule, FieldSpan } from '../../../utils/types'

/**
 * l-form-item Web Component
 */
@customElement('l-form-item')
export class LFormItem extends LitElement {
  static styles: CSSResultGroup = css`
    :host {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--form-gap, 8px);
      margin-bottom: var(--form-item-margin-bottom, 16px);
    }

    :host(:last-child) {
      margin-bottom: 0;
    }

    :host([label-align='top']) {
      grid-template-columns: 1fr;
    }

    .ldesign-form-item__label {
      display: flex;
      align-items: center;
      min-height: 32px;
      font-size: 14px;
      color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.85));
    }

    .ldesign-form-item__label--right {
      justify-content: flex-end;
      text-align: right;
    }

    .ldesign-form-item__label--left {
      justify-content: flex-start;
      text-align: left;
    }

    .ldesign-form-item__required {
      color: var(--ldesign-error-color, #ff4d4f);
      margin-right: 4px;
      font-family: SimSun, sans-serif;
    }

    .ldesign-form-item__tooltip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      margin-left: 4px;
      font-size: 12px;
      color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.65));
      border: 1px solid var(--ldesign-border-color, #d9d9d9);
      border-radius: 50%;
      cursor: help;
    }

    .ldesign-form-item__content {
      min-height: 32px;
    }

    .ldesign-form-item__control {
      width: 100%;
    }

    .ldesign-form-item__error {
      margin-top: 4px;
      font-size: 12px;
      color: var(--ldesign-error-color, #ff4d4f);
      line-height: 1.5;
    }

    .ldesign-form-item__help {
      margin-top: 4px;
      font-size: 12px;
      color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.65));
      line-height: 1.5;
    }

    :host([error]) .ldesign-form-item__label {
      color: var(--ldesign-error-color, #ff4d4f);
    }

    :host([disabled]) {
      opacity: 0.6;
      pointer-events: none;
    }
  `

  @property({ type: String })
  name = ''

  @property({ type: String })
  label = ''

  @property({ type: Boolean })
  required = false

  @property({ type: Array })
  rules: ValidationRule[] = []

  @property({ type: [Number, String] })
  span: FieldSpan = 1

  @property({ type: String })
  tooltip = ''

  @property({ type: String })
  help = ''

  @property({ type: Boolean, attribute: 'show-error' })
  showError = true

  @property({ type: [Number, String], attribute: 'label-width' })
  labelWidth?: number | string

  @property({ type: String, attribute: 'label-align' })
  labelAlign?: 'left' | 'right' | 'top'

  @property({ type: Boolean })
  disabled = false

  @property({ type: Boolean })
  readonly = false

  @state()
  private error = ''

  @state()
  private touched = false

  @state()
  private validating = false

  private computedRequired() {
    return this.required || this.rules.some(rule => rule.type === 'required')
  }

  private getSpanStyle() {
    if (typeof this.span === 'number') {
      return `span ${this.span}`
    } else if (this.span === '-1' || this.span === '100%') {
      return '1 / -1'
    }
    return 'span 1'
  }

  render() {
    const labelClasses = [
      'ldesign-form-item__label',
      this.labelAlign ? `ldesign-form-item__label--${this.labelAlign}` : ''
    ].filter(Boolean).join(' ')

    const labelStyle = this.labelWidth 
      ? `width: ${typeof this.labelWidth === 'number' ? this.labelWidth + 'px' : this.labelWidth}` 
      : ''

    return html`
      <style>
        :host {
          grid-column: ${this.getSpanStyle()};
        }
      </style>

      ${this.label || this.tooltip ? html`
        <div class="${labelClasses}" style="${labelStyle}">
          ${this.computedRequired() ? html`
            <span class="ldesign-form-item__required">*</span>
          ` : ''}
          ${this.label ? html`<label for="${this.name}">${this.label}</label>` : ''}
          ${this.tooltip ? html`
            <span class="ldesign-form-item__tooltip" title="${this.tooltip}">?</span>
          ` : ''}
        </div>
      ` : ''}

      <div class="ldesign-form-item__content">
        <div class="ldesign-form-item__control">
          <slot></slot>
        </div>

        ${this.showError && this.error && this.touched ? html`
          <div class="ldesign-form-item__error">${this.error}</div>
        ` : ''}

        ${this.help ? html`
          <div class="ldesign-form-item__help">${this.help}</div>
        ` : ''}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-form-item': LFormItem
  }
}



