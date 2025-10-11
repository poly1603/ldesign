/**
 * HTTP 包简单构建脚本
 * 使用 Rollup 直接构建，绕过 ldesign-builder
 */

import { rollup } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { promises as fs } from 'fs'
import path from 'path'

async function build() {
  console.log('🚀 开始构建 @ldesign/http...')
  
  const input = 'src/index.ts'
  
  // 清理输出目录
  await Promise.all([
    fs.rm('es', { recursive: true, force: true }),
    fs.rm('lib', { recursive: true, force: true }),
    fs.rm('dist', { recursive: true, force: true }),
  ])
  
  console.log('📦 清理输出目录完成')
  
  const external = [
    'vue',
    'axios',
    'alova',
    /^node:/
  ]
  
  const plugins = [
    resolve({
      extensions: ['.ts', '.js'],
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,  // Disable declaration generation for now
      sourceMap: true,
      compilerOptions: {
        allowImportingTsExtensions: false,
        noEmit: false,
      }
    }),
  ]
  
  // 构建 bundle
  const bundle = await rollup({
    input,
    external,
    plugins,
  })
  
  // ESM
  console.log('📝 生成 ESM 格式...')
  await bundle.write({
    dir: 'es',
    format: 'esm',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src',
  })
  
  // CommonJS
  console.log('📝 生成 CommonJS 格式...')
  await bundle.write({
    dir: 'lib',
    format: 'cjs',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src',
    entryFileNames: '[name].cjs',
    chunkFileNames: '[name]-[hash].cjs',
  })
  
  // UMD (for browser)
  console.log('📝 生成 UMD 格式...')
  await bundle.write({
    file: 'dist/index.js',
    format: 'umd',
    name: 'LDesignHttp',
    sourcemap: true,
    globals: {
      vue: 'Vue',
      axios: 'axios',
      alova: 'alova',
    },
  })
  
  await bundle.close()
  
  console.log('✅ 构建完成！')
}

build().catch(error => {
  console.error('❌ 构建失败:', error)
  process.exit(1)
})
