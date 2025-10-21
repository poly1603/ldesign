/**
 * @ldesign/form - Lit Form Component
 * Lit 表单 Web Component
 */

import { LitElement, html, css, type CSSResultGroup } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { FormController } from '../controllers/form-controller'
import type { FormOptions } from '../../../utils/types'

/**
 * l-form Web Component
 */
@customElement('l-form')
export class LForm extends LitElement {
  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-family: var(--ldesign-font-family, -apple-system, sans-serif);
    }

    .ldesign-form__container {
      display: grid;
      gap: var(--form-space, 16px);
    }

    .ldesign-form__buttons {
      display: flex;
      gap: 8px;
    }

    .ldesign-form__buttons--inline {
      align-self: flex-end;
    }

    .ldesign-form__buttons--block {
      width: 100%;
    }

    .ldesign-form__buttons--left {
      justify-content: flex-start;
    }

    .ldesign-form__buttons--center {
      justify-content: center;
    }

    .ldesign-form__buttons--right {
      justify-content: flex-end;
    }

    .ldesign-form__button {
      padding: 8px 16px;
      border: 1px solid var(--ldesign-border-color, #d9d9d9);
      border-radius: var(--ldesign-border-radius-base, 4px);
      background: var(--ldesign-bg-color, #fff);
      color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.85));
      cursor: pointer;
      transition: all 0.3s;
    }

    .ldesign-form__button:hover {
      border-color: var(--ldesign-brand-color, #722ED1);
      color: var(--ldesign-brand-color, #722ED1);
    }

    .ldesign-form__button--submit {
      background: var(--ldesign-brand-color, #722ED1);
      border-color: var(--ldesign-brand-color, #722ED1);
      color: #fff;
    }

    .ldesign-form__button--submit:hover {
      background: var(--ldesign-brand-color-hover, #5c24a8);
      border-color: var(--ldesign-brand-color-hover, #5c24a8);
    }

    .ldesign-form__button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `

  @query('.ldesign-form__container')
  private containerEl?: HTMLElement

  @property({ type: Number, attribute: 'span-width' })
  spanWidth = 200

  @property({ type: Number, attribute: 'max-span' })
  maxSpan = 4

  @property({ type: Number })
  space = 16

  @property({ type: Number })
  gap = 8

  @property({ type: String, attribute: 'label-align' })
  labelAlign: 'left' | 'right' | 'top' = 'right'

  @property({ type: Number, attribute: 'preview-rows' })
  previewRows = 1

  @property({ type: String, attribute: 'expand-mode' })
  expandMode: 'visible' | 'popup' = 'visible'

  @property({ type: Boolean })
  collapsible = false

  @property({ type: String, attribute: 'button-position' })
  buttonPosition: 'inline' | 'block' = 'inline'

  @property({ type: String, attribute: 'button-align' })
  buttonAlign: 'left' | 'center' | 'right' = 'right'

  @property({ type: Number, attribute: 'button-span' })
  buttonSpan = 1

  @property({ type: Boolean, attribute: 'show-submit' })
  showSubmit = true

  @property({ type: String, attribute: 'submit-text' })
  submitText = '查询'

  @property({ type: Boolean, attribute: 'show-reset' })
  showReset = true

  @property({ type: String, attribute: 'reset-text' })
  resetText = '重置'

  @property({ type: Boolean, attribute: 'show-expand' })
  showExpand = true

  @property({ type: String, attribute: 'expand-text' })
  expandText = '展开'

  @property({ type: String, attribute: 'collapse-text' })
  collapseText = '收起'

  @state()
  private expanded = true

  @state()
  private submitting = false

  private formController: FormController

  constructor() {
    super()
    
    const options: FormOptions = {
      layout: {
        spanWidth: this.spanWidth,
        maxSpan: this.maxSpan,
        space: this.space,
        gap: this.gap,
        labelAlign: this.labelAlign
      },
      expand: {
        previewRows: this.previewRows,
        expandMode: this.expandMode,
        defaultExpanded: !this.collapsible,
        expandText: this.expandText,
        collapseText: this.collapseText
      },
      button: {
        buttonPosition: this.buttonPosition,
        buttonAlign: this.buttonAlign,
        buttonSpan: this.buttonSpan,
        showSubmit: this.showSubmit,
        submitText: this.submitText,
        showReset: this.showReset,
        resetText: this.resetText,
        showExpand: this.showExpand
      },
      onSubmit: (values) => {
        this.dispatchEvent(new CustomEvent('submit', { detail: values }))
      },
      onReset: () => {
        this.dispatchEvent(new CustomEvent('reset'))
      },
      onChange: (field, value, values) => {
        this.dispatchEvent(new CustomEvent('change', { 
          detail: { field, value, values }
        }))
      },
      onExpandChange: (exp) => {
        this.expanded = exp
        this.dispatchEvent(new CustomEvent('expand-change', { detail: exp }))
      }
    }

    this.formController = new FormController(this, options)
  }

  protected firstUpdated(): void {
    if (this.containerEl) {
      this.formController.getForm().getLayoutEngine().init(this.containerEl)
    }
  }

  private handleSubmit(e: Event) {
    e.preventDefault()
    this.formController.submit()
  }

  private handleReset(e: Event) {
    e.preventDefault()
    this.formController.reset()
  }

  private handleToggleExpand() {
    this.formController.toggleExpand()
  }

  render() {
    const showButtons = this.showSubmit || this.showReset || (this.showExpand && this.collapsible)
    const columns = this.formController.getForm().getLayoutEngine().getColumns()

    const buttonClasses = [
      'ldesign-form__buttons',
      `ldesign-form__buttons--${this.buttonPosition}`,
      `ldesign-form__buttons--${this.buttonAlign}`
    ].join(' ')

    const buttonStyles = `
      grid-column: ${this.buttonPosition === 'block' ? `span ${columns}` : `span ${this.buttonSpan}`};
    `

    return html`
      <form @submit=${this.handleSubmit} @reset=${this.handleReset}>
        <div 
          class="ldesign-form__container"
          style="--form-space: ${this.space}px; --form-gap: ${this.gap}px;"
        >
          <slot></slot>

          ${showButtons ? html`
            <div class="${buttonClasses}" style="${buttonStyles}">
              ${this.showSubmit ? html`
                <button
                  type="submit"
                  class="ldesign-form__button ldesign-form__button--submit"
                  ?disabled=${this.submitting}
                >
                  ${this.submitText}
                </button>
              ` : ''}

              ${this.showReset ? html`
                <button
                  type="reset"
                  class="ldesign-form__button ldesign-form__button--reset"
                >
                  ${this.resetText}
                </button>
              ` : ''}

              ${this.showExpand && this.collapsible ? html`
                <button
                  type="button"
                  class="ldesign-form__button ldesign-form__button--expand"
                  @click=${this.handleToggleExpand}
                >
                  ${this.expanded ? this.collapseText : this.expandText}
                </button>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </form>
    `
  }

  /**
   * 获取表单实例
   */
  getForm() {
    return this.formController.getForm()
  }

  /**
   * 提交表单
   */
  async submit() {
    return this.formController.submit()
  }

  /**
   * 重置表单
   */
  reset() {
    this.formController.reset()
  }

  /**
   * 验证表单
   */
  async validate() {
    return this.formController.validate()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-form': LForm
  }
}



