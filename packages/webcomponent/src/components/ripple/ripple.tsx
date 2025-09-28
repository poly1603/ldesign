import { Component, h, Host } from '@stencil/core';

/**
 * Minimal Ripple wrapper component
 * Created to resolve startup error complaining missing ripple.less import.
 */
@Component({
  tag: 'ldesign-ripple',
  styleUrl: 'ripple.less',
  shadow: false,
})
export class LdesignRipple {
  render() {
    return (
      <Host class="ldesign-ripple">
        <slot></slot>
      </Host>
    );
  }
}