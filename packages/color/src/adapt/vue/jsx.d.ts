/**
 * Vue JSX 类型声明
 */

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass extends ComponentRenderProxy {}
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
