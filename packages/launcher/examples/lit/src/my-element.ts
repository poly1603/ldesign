import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
      margin: 20px auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333;
      margin-top: 0;
    }

    button {
      background: #007acc;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    button:hover {
      background: #005a9e;
    }

    .counter {
      margin: 16px 0;
      font-size: 18px;
      font-weight: bold;
    }
  `

  @property()
  name = 'World'

  @property({ type: Number })
  count = 0

  render() {
    return html`
      <h1>Hello, ${this.name}!</h1>
      <div class="counter">Count: ${this.count}</div>
      <button @click=${this._onClick} part="button">
        Click me!
      </button>
      <slot></slot>
    `
  }

  private _onClick() {
    this.count++
  }
}
