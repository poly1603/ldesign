import { Component, Prop, Event, EventEmitter, h, Host, State, Watch } from '@stencil/core';
import { TextareaSize, TextareaResize } from './types';

export
@Component({
  tag: 'ld-textarea',
  styleUrl: 'textarea.less',
  shadow: true,
})
class Textarea {
  private textareaElement?: HTMLTextAreaElement;

  /**
   * Textarea size
   */
  @Prop() size: TextareaSize = 'medium';

  /**
   * Textarea value
   */
  @Prop({ mutable: true }) value?: string = '';

  /**
   * Placeholder text
   */
  @Prop() placeholder?: string;

  /**
   * Whether the textarea is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Whether the textarea is readonly
   */
  @Prop() readonly: boolean = false;

  /**
   * Whether the textarea is required
   */
  @Prop() required: boolean = false;

  /**
   * Maximum length of textarea
   */
  @Prop() maxlength?: number;

  /**
   * Minimum length of textarea
   */
  @Prop() minlength?: number;

  /**
   * Number of rows
   */
  @Prop() rows: number = 3;

  /**
   * Number of columns
   */
  @Prop() cols?: number;

  /**
   * Resize behavior
   */
  @Prop() resize: TextareaResize = 'vertical';

  /**
   * Whether to show character count
   */
  @Prop() showCount: boolean = false;

  /**
   * Whether to auto resize height
   */
  @Prop() autosize: boolean = false;

  /**
   * Min rows for autosize
   */
  @Prop() minRows?: number;

  /**
   * Max rows for autosize
   */
  @Prop() maxRows?: number;

  /**
   * Textarea state for focused styling
   */
  @State() focused: boolean = false;

  /**
   * Input event
   */
  @Event() ldInput!: EventEmitter<string>;

  /**
   * Change event
   */
  @Event() ldChange!: EventEmitter<string>;

  /**
   * Focus event
   */
  @Event() ldFocus!: EventEmitter<FocusEvent>;

  /**
   * Blur event
   */
  @Event() ldBlur!: EventEmitter<FocusEvent>;

  @Watch('value')
  watchValue(newValue: string) {
    if (this.textareaElement && this.textareaElement.value !== newValue) {
      this.textareaElement.value = newValue || '';
    }
    if (this.autosize) {
      this.adjustHeight();
    }
  }

  componentDidLoad() {
    if (this.autosize) {
      this.adjustHeight();
    }
  }

  private adjustHeight = () => {
    if (!this.textareaElement || !this.autosize) return;

    const textarea = this.textareaElement;
    textarea.style.height = 'auto';
    
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10);
    const paddingTop = parseInt(getComputedStyle(textarea).paddingTop, 10);
    const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom, 10);
    const borderTop = parseInt(getComputedStyle(textarea).borderTopWidth, 10);
    const borderBottom = parseInt(getComputedStyle(textarea).borderBottomWidth, 10);

    let minHeight = 0;
    let maxHeight = Infinity;

    if (this.minRows) {
      minHeight = this.minRows * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
    }

    if (this.maxRows) {
      maxHeight = this.maxRows * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
    }

    const height = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${height}px`;
  };

  private handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.ldInput.emit(target.value);
    
    if (this.autosize) {
      this.adjustHeight();
    }
  };

  private handleChange = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    this.ldChange.emit(target.value);
  };

  private handleFocus = (event: FocusEvent) => {
    this.focused = true;
    this.ldFocus.emit(event);
  };

  private handleBlur = (event: FocusEvent) => {
    this.focused = false;
    this.ldBlur.emit(event);
  };

  private getCharacterCount = (): string => {
    const currentLength = this.value ? this.value.length : 0;
    if (this.maxlength) {
      return `${currentLength}/${this.maxlength}`;
    }
    return `${currentLength}`;
  };

  render() {
    const wrapperClasses = {
      'ld-textarea': true,
      [`ld-textarea--${this.size}`]: true,
      'ld-textarea--disabled': this.disabled,
      'ld-textarea--readonly': this.readonly,
      'ld-textarea--focused': this.focused,
      'ld-textarea--autosize': this.autosize,
      'ld-textarea--show-count': this.showCount,
    };

    const textareaStyle = {
      resize: this.resize,
    };

    return (
      <Host>
        <div class={wrapperClasses}>
          <textarea
            ref={(el) => (this.textareaElement = el)}
            class="ld-textarea__inner"
            style={textareaStyle}
            value={this.value}
            placeholder={this.placeholder}
            disabled={this.disabled}
            readonly={this.readonly}
            required={this.required}
            maxlength={this.maxlength}
            minlength={this.minlength}
            rows={this.rows}
            cols={this.cols}
            onInput={this.handleInput}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          />
          
          {this.showCount && (
            <div class="ld-textarea__count">
              {this.getCharacterCount()}
            </div>
          )}
        </div>
      </Host>
    );
  }
}