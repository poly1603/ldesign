import { Component, Prop, h, Event, EventEmitter, State } from '@stencil/core';
import { classNames } from '../../utils';

@Component({
  tag: 'ld-button',
  styleUrl: 'ld-button.less',
  shadow: true,
})
export class LdButton {
  /**
   * Button variant/type
   */
  @Prop() variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost' | 'link' = 'primary';

  /**
   * Button size
   */
  @Prop() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Whether button is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Whether button is in loading state
   */
  @Prop() loading: boolean = false;

  /**
   * Button type for form submission
   */
  @Prop() type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * Icon to display before text
   */
  @Prop() icon?: string;

  /**
   * Icon to display after text
   */
  @Prop() iconEnd?: string;

  /**
   * Whether button should take full width
   */
  @Prop() fullWidth: boolean = false;

  /**
   * Click event
   */
  @Event() ldClick: EventEmitter<MouseEvent>;

  /**
   * Focus event
   */
  @Event() ldFocus: EventEmitter<FocusEvent>;

  /**
   * Blur event
   */
  @Event() ldBlur: EventEmitter<FocusEvent>;

  @State() pressed: boolean = false;

  private handleClick = (event: MouseEvent) => {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.ldClick.emit(event);
  };

  private handleFocus = (event: FocusEvent) => {
    this.ldFocus.emit(event);
  };

  private handleBlur = (event: FocusEvent) => {
    this.ldBlur.emit(event);
  };

  private handleMouseDown = () => {
    this.pressed = true;
  };

  private handleMouseUp = () => {
    this.pressed = false;
  };

  private handleMouseLeave = () => {
    this.pressed = false;
  };

  render() {
    const classes = classNames(
      'ld-button',
      `ld-button--${this.variant}`,
      `ld-button--${this.size}`,
      {
        'ld-button--disabled': this.disabled,
        'ld-button--loading': this.loading,
        'ld-button--full-width': this.fullWidth,
        'ld-button--pressed': this.pressed,
        'ld-button--has-icon': this.icon || this.iconEnd,
      }
    );

    return (
      <button
        class={classes}
        type={this.type}
        disabled={this.disabled || this.loading}
        onClick={this.handleClick}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseLeave={this.handleMouseLeave}
        aria-busy={this.loading ? 'true' : null}
        aria-disabled={this.disabled ? 'true' : null}
      >
        {this.loading && (
          <span class="ld-button__loading">
            <ld-icon name="loading" class="ld-button__loading-icon" />
          </span>
        )}
        
        {!this.loading && this.icon && (
          <ld-icon name={this.icon} class="ld-button__icon ld-button__icon--start" />
        )}
        
        <span class="ld-button__text">
          <slot />
        </span>
        
        {!this.loading && this.iconEnd && (
          <ld-icon name={this.iconEnd} class="ld-button__icon ld-button__icon--end" />
        )}
      </button>
    );
  }
}