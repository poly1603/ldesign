/**
 * JSX 类型声明
 */

declare namespace _JSX {
  interface IntrinsicElements {
    [elemName: string]: unknown
  }
}

// Vue JSX 类型声明
declare global {
  namespace JSX {
    interface Element {
      // Vue VNode properties
      type: any
      props: any
      children: any
    }
    interface ElementClass {
      // Vue Component properties
      $props: any
    }
    interface ElementAttributesProperty {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      $props: any
    }
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [elem: string]: any
    }
  }
}

export {}
