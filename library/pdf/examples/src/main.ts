import { createPDFReader } from '@ldesign/pdf-reader'

// 最小示例：只创建实例并加载一个示例PDF（所有功能逻辑都在 src 内部）
const pdfReader = createPDFReader({
  container: '#pdf-container',
  showToolbar: true,
  showThumbnails: true,
  readingMode: 'single',
  // 为避免 dev 环境下 worker 解析问题，指向示例内置 worker 文件
  workerSrc: './pdf.worker.min.js',
  // 默认加载一个本地示例，可按需移除或更换
  src: './assets/sample.pdf'
})

// 暴露到全局用于调试（非必须）
;(window as any).pdfReader = pdfReader
