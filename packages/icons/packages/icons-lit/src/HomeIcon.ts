import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ld-home-icon')
export class HomeIcon extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    svg {
      width: var(--ld-icon-size, 1em);
      height: var(--ld-icon-size, 1em);
    }
    
    .spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  @property({ type: String }) size = '1em';
  @property({ type: String }) color = 'currentColor';
  @property({ type: Number }) strokeWidth = 2;
  @property({ type: Boolean }) spin = false;

  render() {
    return html`
      <svg
        width="${this.size}"
        height="${this.size}"
        viewBox="0 0 24 24"
        fill="none"
        stroke="${this.color}"
        stroke-width="${this.strokeWidth}"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="${this.spin ? 'spin' : ''}"
        part="svg"
      >
        <!-- SVG content -->
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ld-home-icon': HomeIcon;
  }
}
