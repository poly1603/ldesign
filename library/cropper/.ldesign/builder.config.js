import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
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
    'react',
    'react-dom',
    '@angular/core',
    '@angular/common',
    '@ldesign/shared',
  ],

  // UMD 格式的全局变量映射
  globals: {
    'vue': 'Vue',
    'react': 'React',
    'react-dom': 'ReactDOM',
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@ldesign/shared': 'LDesignShared',
  },

  // UMD 格式的库名称
  name: 'LDesignCropper',

  // 开发配置
  dev: {
    // 开发服务器端口
    port: 3001,
    // 自动打开浏览器
    open: true,
    // 热更新
    hmr: true,
  },
}
