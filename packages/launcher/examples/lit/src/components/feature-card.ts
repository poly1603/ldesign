import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('feature-card')
export class FeatureCard extends LitElement {
  @property({ type: String }) icon = '✨';
  @property({ type: String }) title = '';
  @property({ type: String }) description = '';

  static styles = css`
    .card {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      padding: 1.25rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    }

    .card:hover {
      transform: translateY(-2px);
      border-color: #cbd5e1;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
    }

    .icon {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
    }

    .title {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0.25rem 0 0.5rem;
    }

    .desc {
      color: var(--text-secondary);
      line-height: 1.6;
      font-size: 0.95rem;
    }
  `;

  render() {
    return html`
      <div class="card" role="article">
        <div class="icon" aria-hidden="true">${this.icon}</div>
        <div class="title">${this.title}</div>
        <div class="desc">${this.description}</div>
      </div>
    `;
  }
}

