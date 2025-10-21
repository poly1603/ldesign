/**
 * Lit DatePicker Component
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { DatePickerCore } from '@ldesign/datepicker-core';
import { formatDate } from '@ldesign/datepicker-shared';
import type { PickerType, PickerValue } from '@ldesign/datepicker-shared';

@customElement('ldate-picker')
export class LDatePicker extends LitElement {
  static styles = css`
    @import '@ldesign/datepicker-core/dist/style.css';

    :host {
      display: inline-block;
    }
  `;

  @property({ type: String })
  type: PickerType = 'date';

  @property({ type: String })
  format = 'YYYY-MM-DD';

  @property({ type: String })
  placeholder = '选择日期';

  @property({ type: String, attribute: 'start-placeholder' })
  startPlaceholder = '开始日期';

  @property({ type: String, attribute: 'end-placeholder' })
  endPlaceholder = '结束日期';

  @property({ type: String, attribute: 'range-separator' })
  rangeSeparator = '至';

  @property({ type: Boolean })
  clearable = true;

  @property({ type: Boolean })
  editable = true;

  @property({ type: Boolean })
  disabled = false;

  @property({ attribute: false })
  value: PickerValue = null;

  @state()
  private visible = false;

  @state()
  private core?: DatePickerCore;

  @query('.ldate-picker')
  private pickerEl?: HTMLElement;

  @query('.ldate-popper')
  private popperEl?: HTMLElement;

  connectedCallback() {
    super.connectedCallback();
    this.initCore();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.core?.destroy();
  }

  private initCore() {
    this.core = new DatePickerCore({
      type: this.type,
      format: this.format,
      placeholder: this.placeholder,
      clearable: this.clearable,
      editable: this.editable,
      onChange: (value) => {
        this.value = value;
        this.dispatchEvent(new CustomEvent('change', { detail: value }));
      },
      onVisibleChange: (vis) => {
        this.visible = vis;
        this.dispatchEvent(new CustomEvent('visible-change', { detail: vis }));
      },
      onFocus: () => this.dispatchEvent(new Event('focus')),
      onBlur: () => this.dispatchEvent(new Event('blur')),
      onClear: () => this.dispatchEvent(new Event('clear')),
    });
  }

  private get isRange() {
    return this.type.endsWith('range');
  }

  private getDisplayValue(): string {
    if (!this.value) return '';
    if (this.value instanceof Date) {
      return formatDate(this.value, this.format);
    }
    return '';
  }

  private getDisplayStartValue(): string {
    if (!this.value || !Array.isArray(this.value)) return '';
    const [start] = this.value;
    return start ? formatDate(start, this.format) : '';
  }

  private getDisplayEndValue(): string {
    if (!this.value || !Array.isArray(this.value)) return '';
    const [, end] = this.value;
    return end ? formatDate(end, this.format) : '';
  }

  private handleInputClick() {
    if (!this.disabled) {
      this.core?.setVisible(!this.visible);
    }
  }

  private handleClear(e: Event) {
    e.stopPropagation();
    this.core?.clear();
  }

  private handleClickOutside = (e: MouseEvent) => {
    if (
      this.pickerEl &&
      this.popperEl &&
      !this.pickerEl.contains(e.target as Node) &&
      !this.popperEl.contains(e.target as Node)
    ) {
      this.core?.setVisible(false);
    }
  };

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('visible')) {
      if (this.visible) {
        document.addEventListener('click', this.handleClickOutside);
      } else {
        document.removeEventListener('click', this.handleClickOutside);
      }
    }
  }

  render() {
    return html`
      <div class="ldate-picker">
        <div class="ldate-input" @click=${this.handleInputClick}>
          ${!this.isRange
            ? html`
                <input
                  class="ldate-input__inner"
                  .value=${this.getDisplayValue()}
                  placeholder=${this.placeholder}
                  ?disabled=${this.disabled}
                  ?readonly=${!this.editable}
                />
              `
            : html`
                <div class="ldate-range-input">
                  <input
                    class="ldate-range-input__inner"
                    .value=${this.getDisplayStartValue()}
                    placeholder=${this.startPlaceholder}
                    ?disabled=${this.disabled}
                    ?readonly=${!this.editable}
                  />
                  <span class="ldate-range-separator">${this.rangeSeparator}</span>
                  <input
                    class="ldate-range-input__inner"
                    .value=${this.getDisplayEndValue()}
                    placeholder=${this.endPlaceholder}
                    ?disabled=${this.disabled}
                    ?readonly=${!this.editable}
                  />
                </div>
              `}
          ${this.clearable && this.value && !this.disabled
            ? html`
                <span class="ldate-input__suffix" @click=${this.handleClear}>✕</span>
              `
            : ''}
        </div>

        ${this.visible
          ? html`
              <div class="ldate-popper ldate-zoom-enter">
                <!-- 面板内容将根据视图类型渲染 -->
                <div class="ldate-panel">DatePicker Panel (Lit)</div>
              </div>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ldate-picker': LDatePicker;
  }
}





