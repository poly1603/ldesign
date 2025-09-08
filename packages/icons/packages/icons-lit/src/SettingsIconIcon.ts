import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('settings-icon-icon')
export class SettingsIconIcon extends LitElement {
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
        
  <circle cx="12" cy="12" r="3"/>
  <path d="M12 1v6m0 6v6m4.22-13.22 4.24 4.24m-2.1-4.38 4.24 4.24M20.66 12H21m-6 0h6M7.76 7.76 3.52 3.52m2.82 14.84L2.1 22.6m9.9.4v-6m0-6V5M7.76 16.24l-4.24 4.24M5.64 5.64 1.4 1.4"/>

      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-icon-icon': SettingsIconIcon;
  }
}
