import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('theme-toggle')
export class ThemeToggle extends LitElement {
  @property({ type: Boolean })
  isDark = false;

  static styles = css`
    .toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 9999px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-primary);
      cursor: pointer;
      transition: background 0.2s ease, border-color 0.2s ease;
      user-select: none;
    }

    .toggle:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .dot {
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: currentColor;
      transition: transform 0.2s ease;
    }

    .label {
      font-size: 0.9rem;
    }
  `;

  private toggleTheme() {
    this.isDark = !this.isDark;
    this.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDark: this.isDark }, bubbles: true, composed: true }));
  }

  render() {
    return html`
      <button class="toggle" @click=${this.toggleTheme} aria-pressed=${this.isDark} aria-label="Toggle color theme">
        <span class="dot" style=${`transform: translateX(${this.isDark ? '6px' : '-6px'})`}></span>
        <span class="label">${this.isDark ? '深色模式' : '浅色模式'}</span>
      </button>
    `;
  }
}

