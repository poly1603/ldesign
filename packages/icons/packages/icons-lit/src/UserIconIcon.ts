import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('user-icon-icon')
export class UserIconIcon extends LitElement {
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
        
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>

      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'user-icon-icon': UserIconIcon;
  }
}
