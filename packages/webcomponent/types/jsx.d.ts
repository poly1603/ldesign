import { JSX as LocalJSX } from '@stencil/core';

declare global {
  export namespace JSX {
    interface IntrinsicElements extends LocalJSX.IntrinsicElements { }
  }
}
