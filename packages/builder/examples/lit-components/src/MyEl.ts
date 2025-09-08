import { LitElement, html, css } from 'lit'

export class MyEl extends LitElement {
  static styles = css`:host{ display:inline-block; padding:4px 8px; background:#f5f5f5; }`
  render(){ return html`<slot>Lit</slot>` }
}

customElements.define('my-el', MyEl)

