import { defineConfig, LibraryType } from '@ldesign/builder'
import alias from '@rollup/plugin-alias'
import { resolve } from 'path'

export default defineConfig({
  // 使用 BASIC 策略以获得最简单的插件配置
  libraryType: LibraryType.BASIC,

  // 入口改为简单测试入口，避免样式编译问题
  input: 'src/main-simple.ts',

  // 输出到单独目录，避免影响 Vite 的 dist
  output: {
    dir: 'dist-builder',
    format: ['esm', 'umd'],
    sourcemap: true,
    name: 'LDesignApp'
  },

  // 库模式：外部化所有 @ldesign 包和 vue 相关依赖
  external: [
    'vue',
    'vue-router',
    'pinia',
    /^@ldesign\//,
    /^@vue\//
  ],

  // 完全禁用 TypeScript 插件，避免声明文件路径问题
  typescript: false,

  // 暂时关闭样式处理，避免编译错误
  style: {
    extract: false,
    minimize: false,
    autoprefixer: false
  },

  // 不使用别名，直接从 node_modules 解析已链接的包
  plugins: [
    alias({
      entries: [
        { find: '@', replacement: resolve(__dirname, './src') },
        { find: '~', replacement: resolve(__dirname, './') }
      ]
    })
  ]
})
