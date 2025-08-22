/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'pdfjs-dist' {
  export * from 'pdfjs-dist/types/src/pdf'
  export const GlobalWorkerOptions: {
    workerSrc: string
  }
}