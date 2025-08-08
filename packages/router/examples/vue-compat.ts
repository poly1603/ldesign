// Vue 兼容性模拟
export function createApp(_component: any) {
  return {
    use: (_plugin: any) => ({ mount: () => {} }),
    mount: (_selector?: string) => {},
    config: {
      errorHandler: null as any,
      warnHandler: null as any,
    },
  }
}

export const ref = (value: any) => ({ value })
export const computed = (fn: () => any) => ({ value: fn() })
export const readonly = (value: any) => value
export const defineStore = (_name: string, setup: () => any) => setup
