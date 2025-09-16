import { defineConfig } from '@ldesign/builder';

export default defineConfig({
  // 构建入口
  entry: 'src/index.ts',
  
  // 输出配置
  output: {
    // CommonJS 输出
    cjs: {
      dir: 'lib',
      format: 'cjs'
    },
    // ES Module 输出
    esm: {
      dir: 'es',
      format: 'esm'
    },
    // UMD 输出（用于浏览器直接引用）
    umd: {
      dir: 'dist',
      format: 'umd',
      name: 'LDesignDatePicker',
      fileName: 'ldesign-datepicker'
    }
  },
  
  // 外部依赖（不打包进最终产物）
  external: [],
  
  // 样式处理
  styles: {
    // 处理 Less 文件
    less: {
      enabled: true,
      // 输出 CSS 文件
      extract: true,
      // 压缩 CSS
      minimize: true
    }
  },
  
  // TypeScript 配置
  typescript: {
    // 生成类型声明文件
    declaration: true,
    // 生成 source map
    sourceMap: true,
    // 严格模式
    strict: true
  },
  
  // 代码压缩
  minify: {
    // 生产环境压缩
    enabled: process.env.NODE_ENV === 'production',
    // 保留类名（便于调试）
    keepClassNames: true,
    // 保留函数名（便于调试）
    keepFnames: true
  },
  
  // 开发服务器配置
  devServer: {
    port: 3000,
    open: true,
    // 热更新
    hmr: true
  },
  
  // 构建优化
  optimization: {
    // 代码分割
    splitChunks: false,
    // Tree shaking
    treeShaking: true,
    // 移除死代码
    deadCodeElimination: true
  },
  
  // 插件配置
  plugins: [
    // 可以在这里添加自定义插件
  ]
});
