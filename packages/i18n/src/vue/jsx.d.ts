/**
 * Vue JSX 类型声明
 */

declare module '@vue/runtime-core' {
  interface HTMLAttributes {
    children?: any
  }

  interface ButtonHTMLAttributes {
    children?: any
  }

  interface StyleHTMLAttributes {
    children?: any
  }
}

declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    children?: any
  }

  interface ButtonHTMLAttributes {
    children?: any
  }

  interface StyleHTMLAttributes {
    children?: any
  }
}

// 全局 JSX 类型增强
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}

export { }
