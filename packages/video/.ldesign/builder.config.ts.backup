import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  // 入口文件配置
  input: ['src/**/*.ts'],
  
  // 库类型
  libraryType: LibraryType.TYPESCRIPT,
  
  // 打包工具
  bundler: 'rolldown',
  
  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    name: 'LDesignVideo' // UMD格式需要全局变量名
  },
  
  // UMD 构建配置
  umd: {
    enabled: true,
    entry: 'src/index.ts',
    name: 'LDesignVideo',
    minify: false
  },
  
  // TypeScript 配置
  typescript: {
    declaration: true,
    declarationMap: true
  },
  
  // 外部依赖（不打包进最终产物）
  external: [
    'vue',
    'react',
    'react-dom',
    '@angular/core',
    '@angular/common'
  ],
  
  // 全局变量映射（用于 UMD 格式）
  globals: {
    'vue': 'Vue',
    'react': 'React',
    'react-dom': 'ReactDOM',
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common'
  },
  
  // 输出目录配置
  outDir: {
    esm: 'es',
    cjs: 'cjs',
    umd: 'dist'
  },
  
  // 压缩配置
  minify: {
    umd: true,  // 只压缩 UMD 格式
    esm: false,
    cjs: false
  },
  
  // Banner 配置
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
  
  // 构建钩子
  hooks: {
    'build:start': () => {
      console.log('🚀 开始构建 @ldesign/video...')
    },
    'build:end': () => {
      console.log('✅ @ldesign/video 构建完成!')
    }
  }
})
