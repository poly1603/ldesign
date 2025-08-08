// Vue 兼容性类型声明
declare module '../../vue-compat' {
  export const createApp: (component: any) => {
    use: (plugin: any) => { mount: () => void }
    mount: (selector?: string) => void
    config: {
      errorHandler: any
      warnHandler: any
    }
  }
  export const ref: (value: any) => { value: any }
  export const computed: (fn: () => any) => { value: any }
  export const readonly: (value: any) => any
  export const defineStore: (name: string, setup: () => any) => any
}

declare module '../vue-compat' {
  export const createApp: (component: any) => {
    use: (plugin: any) => { mount: () => void }
    mount: (selector?: string) => void
    config: {
      errorHandler: any
      warnHandler: any
    }
  }
  export const ref: (value: any) => { value: any }
  export const computed: (fn: () => any) => { value: any }
  export const readonly: (value: any) => any
  export const defineStore: (name: string, setup: () => any) => any
}
