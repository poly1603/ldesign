import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';
import { classNames } from '../../utils';

@Component({
  tag: 'ld-card',
  styleUrl: 'ld-card.less',
  shadow: true,
})
export class LdCard {
  /**
   * Card title
   */
  @Prop() title?: string;

  /**
   * Card subtitle
   */
  @Prop() subtitle?: string;

  /**
   * Whether card has shadow
   */
  @Prop() shadow: boolean = true;

  /**
   * Shadow level (1-4)
   */
  @Prop() shadowLevel: 1 | 2 | 3 | 4 = 1;

  /**
   * Whether card is hoverable
   */
  @Prop() hoverable: boolean = false;

  /**
   * Whether card has border
   */
  @Prop() bordered: boolean = true;

  /**
   * Card size
   */
  @Prop() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Whether card is loading
   */
  @Prop() loading: boolean = false;

  /**
   * Card click event (only when hoverable)
   */
  @Event() ldClick: EventEmitter<MouseEvent>;

  /**
   * Card hover event
   */
  @Event() ldHover: EventEmitter<MouseEvent>;

  /**
   * Card leave event
   */
  @Event() ldLeave: EventEmitter<MouseEvent>;

  private handleClick = (event: MouseEvent) => {
    if (this.hoverable) {
      this.ldClick.emit(event);
    }
  };

  private handleMouseEnter = (event: MouseEvent) => {
    this.ldHover.emit(event);
  };

  private handleMouseLeave = (event: MouseEvent) => {
    this.ldLeave.emit(event);
  };

  render() {
    const classes = classNames(
      'ld-card',
      `ld-card--${this.size}`,
      {
        'ld-card--shadow': this.shadow,
        [`ld-card--shadow-${this.shadowLevel}`]: this.shadow,
        'ld-card--hoverable': this.hoverable,
        'ld-card--bordered': this.bordered,
        'ld-card--loading': this.loading,
      }
    );

    const hasHeader = this.title || this.subtitle || this.hasHeaderSlot();
    const hasFooter = this.hasFooterSlot();

    return (
      <div
        class={classes}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        role={this.hoverable ? 'button' : null}
        tabindex={this.hoverable ? '0' : null}
        aria-busy={this.loading ? 'true' : null}
      >
        {this.loading && (
          <div class="ld-card__loading">
            <ld-icon name="loading" class="ld-card__loading-icon" />
          </div>
        )}

        {hasHeader && (
          <div class="ld-card__header">
            <slot name="header">
              {(this.title || this.subtitle) && (
                <div class="ld-card__header-content">
                  {this.title && (
                    <h3 class="ld-card__title">{this.title}</h3>
                  )}
                  {this.subtitle && (
                    <p class="ld-card__subtitle">{this.subtitle}</p>
                  )}
                </div>
              )}
            </slot>
            
            <div class="ld-card__actions">
              <slot name="actions" />
            </div>
          </div>
        )}

        <div class="ld-card__body">
          <slot />
        </div>

        {hasFooter && (
          <div class="ld-card__footer">
            <slot name="footer" />
          </div>
        )}
      </div>
    );
  }

  private hasHeaderSlot(): boolean {
    return Boolean(this.getSlotElement('header'));
  }

  private hasFooterSlot(): boolean {
    return Boolean(this.getSlotElement('footer'));
  }

  private getSlotElement(name: string): Element | null {
    return this.host?.querySelector(`[slot="${name}"]`) || null;
  }

  private get host(): HTMLElement {
    return this as any;
  }
}