import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.ts',

  // TypeScript 配置
  tsconfig: 'tsconfig.build.json',

  // 输出配置
  output: {
    dir: 'dist',
    format: ['esm', 'cjs', 'umd'],
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true,
      input: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts'
      ]
    },
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true,
      input: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts'
      ]
    },
    umd: {
      dir: 'dist',
      format: 'umd',
      minify: true,
      sourcemap: true,
      input: 'src/index.ts'
    }
  },

  // 禁用构建后验证（库项目不需要运行测试验证）
  postBuildValidation: {
    enabled: false
  },

  // 生成类型声明文件
  dts: false,

  // 生成 source map
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 不压缩代码（开发阶段）
  minify: false,

  // UMD 构建配置
  umd: {
    enabled: true,
    minify: true, // UMD版本启用压缩
    fileName: 'index.js' // 去掉 .umd 后缀
  },

  // 外部依赖配置
  external: [
    'vue',
    'node:fs',
    'node:path',
    'node:os',
    'node:util',
    'node:events',
    'node:stream',
    'node:crypto',
    'node:http',
    'node:https',
    'node:url',
    'node:buffer',
    'node:child_process',
    'node:worker_threads'
],

  // 全局变量配置
  globals: {
    'vue': 'Vue'
},

  // 日志级别设置为 silent，只显示错误信息
  logLevel: 'silent',

  // 构建选项
  build: {
    // 禁用构建警告
    rollupOptions: {
      onwarn: () => {
        // 完全静默，不输出任何警告
      }
    },
    // TypeScript 配置
    tsconfig: 'tsconfig.build.json'
  }
})
