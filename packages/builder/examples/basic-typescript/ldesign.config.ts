import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 单入口配置 - 使用 src/index.ts 作为入口
  input: 'src/index.ts',

  libraryType: LibraryType.TYPESCRIPT,
  bundler: 'rollup',

  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    name: 'BasicTypescript' // UMD格式需要全局变量名
  },

  // UMD 构建配置
  umd: {
    enabled: true,
    entry: 'src/index.ts',
    name: 'BasicTypescript',
    minify: false // 默认不压缩
  },

  // Babel 转换配置（可选）
  babel: {
    enabled: false, // 默认不启用
    targets: 'defaults'
  },

  // Banner 和 Footer 配置
  banner: {
    copyright: {
      owner: 'LDesign Team',
      license: 'MIT'
    },
    buildInfo: {
      version: true,
      buildTime: true
    }
  },

  typescript: {
    declaration: true
  },

  // 默认不压缩
  minify: false,

  clean: true
})
