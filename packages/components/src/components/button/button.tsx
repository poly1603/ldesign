import type { EventEmitter } from '@stencil/core'
import { Component, Event, Host, Prop } from '@stencil/core'

type ButtonType = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'small' | 'medium' | 'large'

@Component({
  tag: 'ld-button',
  styleUrl: 'button.css',
  shadow: true,
})
export class LdButton {
  @Prop() type: ButtonType = 'secondary'
  @Prop() size: ButtonSize = 'medium'
  @Prop({ reflect: true }) disabled: boolean = false
  @Prop({ reflect: true }) loading: boolean = false

  @Event() ldClick: EventEmitter<MouseEvent>

  private handleClick = (ev: MouseEvent) => {
    if (this.disabled || this.loading) {
      ev.preventDefault()
      ev.stopPropagation()
      return
    }
    this.ldClick.emit(ev)
  }

  render() {
    const classes = [
      'ld-button',
      `ld-button--${this.type}`,
      `ld-button--${this.size}`,
      this.disabled ? 'ld-button--disabled' : '',
      this.loading ? 'ld-button--loading' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <Host>
        <button class={classes} disabled={this.disabled} onClick={this.handleClick}>
          {this.loading
            ? (
                <span class="ld-button__loading" aria-hidden="true">
                  <span class="ld-button__loading-icon" />
                </span>
              )
            : null}
          <span class="ld-button__content">
            <slot />
          </span>
        </button>
      </Host>
    )
  }
}
