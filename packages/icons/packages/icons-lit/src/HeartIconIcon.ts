import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('heart-icon-icon')
export class HeartIconIcon extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      width: var(--icon-size, 1em);
      height: var(--icon-size, 1em);
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `;

  @property({ type: String }) size = '1em';
  @property({ type: String }) color = 'currentColor';

  render() {
    return html`
      <svg
        style="width: ${this.size}; height: ${this.size};"
        viewBox="0 0 24 24"
        fill="${this.color}"
        xmlns="http://www.w3.org/2000/svg"
        part="icon"
      >
        
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78"/>

      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'heart-icon-icon': HeartIconIcon;
  }
}
