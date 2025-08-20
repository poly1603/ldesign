import { Component, Prop, Event, EventEmitter, h, Host } from '@stencil/core';
import { ButtonType, ButtonSize } from './types';

export
@Component({
  tag: 'ld-button',
  styleUrl: 'button.less',
  shadow: true,
})
class Button {
  /**
   * Button type
   */
  @Prop() type: ButtonType = 'primary';

  /**
   * Button size
   */
  @Prop() size: ButtonSize = 'medium';

  /**
   * Whether the button is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Whether the button is loading
   */
  @Prop() loading: boolean = false;

  /**
   * Button click event
   */
  @Event() ldClick!: EventEmitter<MouseEvent>;

  private handleClick = (event: MouseEvent) => {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.ldClick.emit(event);
  };

  render() {
    const classes = {
      'ld-button': true,
      [`ld-button--${this.type}`]: true,
      [`ld-button--${this.size}`]: true,
      'ld-button--disabled': this.disabled,
      'ld-button--loading': this.loading,
    };

    return (
      <Host>
        <button
          class={classes}
          disabled={this.disabled || this.loading}
          onClick={this.handleClick}
          type="button"
        >
          {this.loading && (
            <span class="ld-button__loading">
              <svg
                class="ld-button__loading-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-dasharray="31.416"
                  stroke-dashoffset="31.416"
                >
                  <animate
                    attributeName="stroke-dasharray"
                    dur="2s"
                    values="0 31.416;15.708 15.708;0 31.416;0 31.416"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-dashoffset"
                    dur="2s"
                    values="0;-15.708;-31.416;-31.416"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </span>
          )}
          <span class="ld-button__content">
            <slot></slot>
          </span>
        </button>
      </Host>
    );
  }
}