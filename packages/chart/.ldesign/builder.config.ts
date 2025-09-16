import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  // 指定库类型为通用库（框架无关）
  libraryType: 'vue3',

  // 基础配置
  root: __dirname,
  outDir: 'dist',

  // 入口文件
  entry: 'src/index.ts',

  // 输出格式：ESM、CJS（暂时移除 UMD 避免代码分割问题）
  formats: ['esm', 'cjs'],

  // 生成类型声明文件
  typescript: true,
  dts: true,

  // 生产环境压缩代码
  minify: true,

  // 生成 source map
  sourcemap: true,

  // 外部依赖（不打包进最终产物）
  external: [
    'echarts',
    'echarts/core',
    'echarts/charts',
    'echarts/components',
    'echarts/renderers',
    'echarts/features',
  ],

  // UMD 格式的全局变量映射
  globals: {
    'echarts': 'echarts',
    'echarts/core': 'echarts',
    'echarts/charts': 'echarts',
    'echarts/components': 'echarts',
    'echarts/renderers': 'echarts',
    'echarts/features': 'echarts',
  },

  // UMD 格式的库名称
  name: 'LDesignChart',

  // CSS 处理配置
  css: {
    // 启用 CSS 处理
    extract: true,
    modules: false,
    preprocessor: 'less',
  },

  // 优化配置
  optimization: {
    // 启用 tree-shaking
    treeshake: true,
    // 代码分割
    codeSplit: false,
  },

  // 构建配置
  build: {
    // 目标环境
    target: 'es2020',
    // 库模式
    lib: true,
    // 清理输出目录
    emptyOutDir: true,
  },
}
