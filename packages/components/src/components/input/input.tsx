import { Component, Prop, Event, EventEmitter, h, Host, State, Watch } from '@stencil/core';
import { InputType, InputSize } from './types';

export
@Component({
  tag: 'ld-input',
  styleUrl: 'input.less',
  shadow: true,
})
class Input {
  private inputElement?: HTMLInputElement;

  /**
   * Input type
   */
  @Prop() type: InputType = 'text';

  /**
   * Input size
   */
  @Prop() size: InputSize = 'medium';

  /**
   * Input value
   */
  @Prop({ mutable: true }) value?: string = '';

  /**
   * Placeholder text
   */
  @Prop() placeholder?: string;

  /**
   * Whether the input is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Whether the input is readonly
   */
  @Prop() readonly: boolean = false;

  /**
   * Whether the input is required
   */
  @Prop() required: boolean = false;

  /**
   * Maximum length of input
   */
  @Prop() maxlength?: number;

  /**
   * Minimum length of input
   */
  @Prop() minlength?: number;

  /**
   * Input pattern for validation
   */
  @Prop() pattern?: string;

  /**
   * Whether to show clear button
   */
  @Prop() clearable: boolean = false;

  /**
   * Whether to show password toggle (only for password type)
   */
  @Prop() showPassword: boolean = false;

  /**
   * Input state for focused styling
   */
  @State() focused: boolean = false;

  /**
   * Password visibility state
   */
  @State() passwordVisible: boolean = false;

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

  /**
   * Clear event
   */
  @Event() ldClear!: EventEmitter<void>;

  @Watch('value')
  watchValue(newValue: string) {
    if (this.inputElement && this.inputElement.value !== newValue) {
      this.inputElement.value = newValue || '';
    }
  }

  private handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.ldInput.emit(target.value);
  };

  private handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
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

  private handleClear = () => {
    this.value = '';
    if (this.inputElement) {
      this.inputElement.value = '';
      this.inputElement.focus();
    }
    this.ldInput.emit('');
    this.ldChange.emit('');
    this.ldClear.emit();
  };

  private togglePasswordVisibility = () => {
    this.passwordVisible = !this.passwordVisible;
  };

  private getInputType = (): string => {
    if (this.type === 'password' && this.showPassword) {
      return this.passwordVisible ? 'text' : 'password';
    }
    return this.type;
  };

  render() {
    const wrapperClasses = {
      'ld-input': true,
      [`ld-input--${this.size}`]: true,
      'ld-input--disabled': this.disabled,
      'ld-input--readonly': this.readonly,
      'ld-input--focused': this.focused,
      'ld-input--clearable': this.clearable,
      'ld-input--password': this.type === 'password' && this.showPassword,
    };

    const showClearButton = this.clearable && this.value && this.value.length > 0 && !this.disabled && !this.readonly;
    const showPasswordToggle = this.type === 'password' && this.showPassword && !this.disabled && !this.readonly;

    return (
      <Host>
        <div class={wrapperClasses}>
          <input
            ref={(el) => (this.inputElement = el)}
            class="ld-input__inner"
            type={this.getInputType()}
            value={this.value}
            placeholder={this.placeholder}
            disabled={this.disabled}
            readonly={this.readonly}
            required={this.required}
            maxlength={this.maxlength}
            minlength={this.minlength}
            pattern={this.pattern}
            onInput={this.handleInput}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          />
          
          {(showClearButton || showPasswordToggle) && (
            <div class="ld-input__suffix">
              {showClearButton && (
                <button
                  class="ld-input__clear"
                  type="button"
                  onClick={this.handleClear}
                  tabindex="-1"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              )}
              
              {showPasswordToggle && (
                <button
                  class="ld-input__password-toggle"
                  type="button"
                  onClick={this.togglePasswordVisibility}
                  tabindex="-1"
                >
                  {this.passwordVisible ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.88 9.88a3 3 0 1 0 4.24 4.24"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <line
                        x1="2"
                        y1="2"
                        x2="22"
                        y2="22"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </Host>
    );
  }
}