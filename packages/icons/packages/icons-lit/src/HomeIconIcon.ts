import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('home-icon-icon')
export class HomeIconIcon extends LitElement {
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
        
  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  <path d="M9 22V12h6v10"/>

      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'home-icon-icon': HomeIconIcon;
  }
}
