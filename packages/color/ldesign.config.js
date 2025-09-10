import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  // 指定库类型为 Vue3
  libraryType: 'vue3',
  
  // 基础配置
  root: __dirname,
  outDir: 'dist',

  // 入口文件
  entry: 'src/index.ts',

  // 输出格式：ESM、CJS、UMD
  formats: ['esm', 'cjs', 'umd'],

  // 生成类型声明文件
  typescript: true,
  dts: true,

  // 生产环境压缩代码
  minify: true,

  // 生成 source map
  sourcemap: true,

  // 外部依赖（不打包进最终产物）
  external: [
    'vue',
    '@arco-design/color',
    'chroma-js',
    'lucide-vue-next',
  ],

  // UMD 格式的全局变量映射
  globals: {
    'vue': 'Vue',
    '@arco-design/color': 'ArcoColor',
    'chroma-js': 'chroma',
    'lucide-vue-next': 'LucideVueNext',
  },

  // UMD 格式的库名称
  name: 'LDesignColor',

  // Vue 特定配置
  vue: {
    // 处理 Vue SFC 文件
    preprocessStyles: true,
    cssCodeSplit: false,
    isProduction: true,
  },

  // CSS 处理配置
  css: {
    // 启用 CSS 处理
    extract: false,
    modules: false,
    preprocessor: 'less',
  },
}
