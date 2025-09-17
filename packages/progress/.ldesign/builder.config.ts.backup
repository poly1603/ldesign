import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.ts',
  
  // 输出格式
  formats: ['esm', 'cjs', 'umd'],
  
  // UMD 全局变量名
  name: 'LDesignProgress',
  
  // 生成类型定义文件
  dts: true,
  
  // 生成 source map
  sourcemap: true,
  
  // 构建前清理输出目录
  clean: true,
  
  // 外部依赖（不打包进最终产物）
  external: [],
  
  // 全局变量映射（用于 UMD 格式）
  globals: {},
  
  // 输出目录配置
  outDir: {
    esm: 'es',
    cjs: 'lib', 
    umd: 'dist'
  },
  
  // TypeScript 配置
  typescript: {
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationMap: true
  },
  
  // 压缩配置
  minify: {
    umd: true,  // 只压缩 UMD 格式
    esm: false,
    cjs: false
  },
  
  // 插件配置
  plugins: [],
  
  // 构建钩子
  hooks: {
    'build:start': () => {
      console.log('🚀 开始构建 @ldesign/progress...')
    },
    'build:end': () => {
      console.log('✅ @ldesign/progress 构建完成!')
    }
  }
})
