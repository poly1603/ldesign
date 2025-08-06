declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: unknown
  }
}

// Vite 类型声明
interface ImportMeta {
  glob: (pattern: string, options?: { eager?: boolean }) => Record<string, () => Promise<unknown>>
}
