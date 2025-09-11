import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('counter-button')
export class CounterButton extends LitElement {
  @state()
  private count = 0;

  static styles = css`
    button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-primary);
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.1s ease, background 0.2s ease, border-color 0.2s ease;
      user-select: none;
    }

    button:hover {
      background: #eef2ff;
      border-color: #c7d2fe;
    }

    button:active {
      transform: translateY(1px);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.5rem;
      height: 1.5rem;
      padding: 0 0.375rem;
      border-radius: 9999px;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
      font-size: 0.75rem;
    }
  `;

  private increment() {
    this.count += 1;
    this.dispatchEvent(new CustomEvent('count-changed', { detail: { count: this.count }, bubbles: true, composed: true }));
  }

  render() {
    return html`
      <button @click=${this.increment} aria-label="Increase counter">
        <span>点击计数</span>
        <span class="badge">${this.count}</span>
      </button>
    `;
  }
}

