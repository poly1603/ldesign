import { DefineComponent } from 'vue'

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass extends ComponentRenderProxy {}
    interface ElementAttributesProperty {
      $props: any
    }
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {}
}

export {}
