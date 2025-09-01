import { Component, Prop, h, Event, EventEmitter, State, Element, Watch } from '@stencil/core';
import { classNames, generateId } from '../../utils';

@Component({
  tag: 'ld-input',
  styleUrl: 'ld-input.less',
  shadow: true,
})
export class LdInput {
  @Element() host: HTMLLdInputElement;

  /**
   * Input type
   */
  @Prop() type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' = 'text';

  /**
   * Input value
   */
  @Prop({ mutable: true }) value: string = '';

  /**
   * Placeholder text
   */
  @Prop() placeholder?: string;

  /**
   * Input size
   */
  @Prop() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Whether input is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Whether input is readonly
   */
  @Prop() readonly: boolean = false;

  /**
   * Whether input is required
   */
  @Prop() required: boolean = false;

  /**
   * Maximum length
   */
  @Prop() maxlength?: number;

  /**
   * Minimum length
   */
  @Prop() minlength?: number;

  /**
   * Input pattern for validation
   */
  @Prop() pattern?: string;

  /**
   * Error message
   */
  @Prop() error?: string;

  /**
   * Help text
   */
  @Prop() helpText?: string;

  /**
   * Input label
   */
  @Prop() label?: string;

  /**
   * Icon to display before input
   */
  @Prop() icon?: string;

  /**
   * Icon to display after input
   */
  @Prop() iconEnd?: string;

  /**
   * Whether to show clear button
   */
  @Prop() clearable: boolean = false;

  /**
   * Whether input should take full width
   */
  @Prop() fullWidth: boolean = false;

  /**
   * Input change event
   */
  @Event() ldInput: EventEmitter<{ value: string }>;

  /**
   * Focus event
   */
  @Event() ldFocus: EventEmitter<FocusEvent>;

  /**
   * Blur event
   */
  @Event() ldBlur: EventEmitter<FocusEvent>;

  /**
   * Clear event
   */
  @Event() ldClear: EventEmitter<void>;

  @State() focused: boolean = false;
  @State() hasValue: boolean = false;

  private inputId = generateId('input');
  private inputElement?: HTMLInputElement;

  @Watch('value')
  handleValueChange(newValue: string) {
    this.hasValue = Boolean(newValue);
  }

  componentWillLoad() {
    this.hasValue = Boolean(this.value);
  }

  private handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.ldInput.emit({ value: this.value });
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
    this.ldInput.emit({ value: this.value });
    this.ldClear.emit();
    this.inputElement?.focus();
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && this.type === 'search') {
      event.preventDefault();
      // Emit search event
      this.host.dispatchEvent(new CustomEvent('ldSearch', {
        detail: { value: this.value },
        bubbles: true
      }));
    }
  };

  render() {
    const hasError = Boolean(this.error);
    const showClear = this.clearable && this.hasValue && !this.disabled && !this.readonly;

    const wrapperClasses = classNames(
      'ld-input-wrapper',
      `ld-input-wrapper--${this.size}`,
      {
        'ld-input-wrapper--focused': this.focused,
        'ld-input-wrapper--disabled': this.disabled,
        'ld-input-wrapper--readonly': this.readonly,
        'ld-input-wrapper--error': hasError,
        'ld-input-wrapper--full-width': this.fullWidth,
        'ld-input-wrapper--has-icon': this.icon,
        'ld-input-wrapper--has-icon-end': this.iconEnd || showClear,
      }
    );

    const inputClasses = classNames(
      'ld-input',
      {
        'ld-input--has-icon': this.icon,
        'ld-input--has-icon-end': this.iconEnd || showClear,
      }
    );

    return (
      <div class="ld-input-container">
        {this.label && (
          <label htmlFor={this.inputId} class="ld-input-label">
            {this.label}
            {this.required && <span class="ld-input-required">*</span>}
          </label>
        )}
        
        <div class={wrapperClasses}>
          {this.icon && (
            <ld-icon name={this.icon} class="ld-input-icon ld-input-icon--start" />
          )}
          
          <input
            ref={el => this.inputElement = el}
            id={this.inputId}
            class={inputClasses}
            type={this.type}
            value={this.value}
            placeholder={this.placeholder}
            disabled={this.disabled}
            readonly={this.readonly}
            required={this.required}
            maxlength={this.maxlength}
            minlength={this.minlength}
            pattern={this.pattern}
            onInput={this.handleInput}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onKeyDown={this.handleKeyDown}
            aria-invalid={hasError ? 'true' : null}
            aria-describedby={
              this.error ? `${this.inputId}-error` : 
              this.helpText ? `${this.inputId}-help` : null
            }
          />
          
          {showClear && (
            <button
              type="button"
              class="ld-input-clear"
              onClick={this.handleClear}
              aria-label="Clear input"
            >
              <ld-icon name="close" />
            </button>
          )}
          
          {!showClear && this.iconEnd && (
            <ld-icon name={this.iconEnd} class="ld-input-icon ld-input-icon--end" />
          )}
        </div>
        
        {this.error && (
          <div id={`${this.inputId}-error`} class="ld-input-error">
            <ld-icon name="error" class="ld-input-error-icon" />
            {this.error}
          </div>
        )}
        
        {!this.error && this.helpText && (
          <div id={`${this.inputId}-help`} class="ld-input-help">
            {this.helpText}
          </div>
        )}
      </div>
    );
  }
}