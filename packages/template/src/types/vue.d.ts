/**
 * Vue 组件类型声明
 * 为 Vue 单文件组件提供 TypeScript 支持
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    TemplateRenderer: typeof import('../vue/components/TemplateRenderer.vue').default
    TemplateSelector: typeof import('../vue/components/TemplateSelector.vue').default
  }
}

// 扩展 Vue 实例类型
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $templateManager: import('../core/manager').TemplateManager
    $loadTemplate: (template: string, deviceType?: string) => Promise<any>
    $preloadTemplate: (template: string, deviceType?: string) => Promise<void>
    $clearTemplateCache: (template?: string, deviceType?: string) => void
  }
}

export {}
