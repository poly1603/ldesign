import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('search-icon-icon')
export class SearchIconIcon extends LitElement {
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
        
  <circle cx="11" cy="11" r="8"/>
  <path d="m21 21-4.35-4.35"/>

      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'search-icon-icon': SearchIconIcon;
  }
}
