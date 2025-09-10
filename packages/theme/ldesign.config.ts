import { defineConfig } from '@ldesign/builder'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import vue from 'unplugin-vue/rollup'
import vueJsx from 'unplugin-vue-jsx/rollup'
import jsx from 'acorn-jsx'

export default defineConfig({
  // 基础配置
  root: process.cwd(),
  input: 'src/index.ts',
  outDir: 'dist',
  
  // 输出格式：ESM、CJS、UMD
  formats: ['esm', 'cjs', 'umd'],
  
  // 生成类型声明文件
  dts: true,
  
  // 生产环境压缩代码
  minify: true,
  
  // 生成 source map
  sourcemap: true,

  // Vue 支持（SFC/TSX）
  rollupOptions: {
    // 让 Rollup 能够解析 JSX 语法（在 transform 前的解析阶段）
    acornInjectPlugins: [jsx()],
    plugins: [
      // 确保解析 .ts/.tsx 扩展名
      resolve({
        extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx']
      }),
      commonjs(),
      vue(),
      // 先让 TS 编译器处理 TS/TSX（保留 JSX），再由 JSX 插件转译 JSX
      typescript({
        tsconfig: './tsconfig.json',
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        // 只做转译，避免与 dts 生成冲突
        declaration: false,
        emitDeclarationOnly: false
      }),
      vueJsx()
    ]
  },
  
  // 外部依赖（不打包进最终产物）
  external: [
    'vue',
    '@ldesign/shared',
    '@ldesign/color'
  ],
  
  // UMD 格式的全局变量映射
  globals: {
    'vue': 'Vue',
    '@ldesign/shared': 'LDesignShared',
    '@ldesign/color': 'LDesignColor'
  },
  
  // UMD 格式的库名称
  name: 'LDesignTheme',

  // 指定 UMD 为单文件，匹配 browser 字段
  output: {
    umd: {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'LDesignTheme',
      sourcemap: true,
      minify: true
    }
  }
})
