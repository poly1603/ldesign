import { HTMLStencilElement } from '@stencil/core/internal';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ld-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLLdButtonElement>, HTMLLdButtonElement>;
      'ld-input': React.DetailedHTMLProps<React.HTMLAttributes<HTMLLdInputElement>, HTMLLdInputElement>;
      'ld-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLLdCardElement>, HTMLLdCardElement>;
      'ld-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLLdIconElement>, HTMLLdIconElement>;
    }
  }
}

export interface HTMLLdButtonElement extends HTMLStencilElement {}
export interface HTMLLdInputElement extends HTMLStencilElement {}
export interface HTMLLdCardElement extends HTMLStencilElement {}
export interface HTMLLdIconElement extends HTMLStencilElement {}