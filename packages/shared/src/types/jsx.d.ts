/**
 * Vue JSX 类型声明
 */

import type { VNode } from 'vue'

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass {
      $props: {}
    }
    interface ElementAttributesProperty {
      $props: {}
    }
    interface IntrinsicElements {
      [elem: string]: any
    }
    interface IntrinsicAttributes {
      key?: string | number
      ref?: any
    }
  }
}

export {}
