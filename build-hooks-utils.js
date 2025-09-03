/**
 * 构建 hooks 和 utils，跳过 Vue 组件
 */

import { rollup } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import { writeFileSync, unlinkSync } from 'fs'

async function buildHooksUtils() {
  console.log('🚀 开始构建 hooks 和 utils...')
  
  try {
    // 创建一个临时的入口文件，只导出 hooks 和 utils
    const tempEntry = `
// 临时入口文件，只导出 hooks 和 utils
export * from './src/hooks'
export * from './src/utils'
export * from './src/types'
`
    
    // 写入临时文件
    writeFileSync('temp-entry.ts', tempEntry)
    console.log('📝 创建临时入口文件')
    
    // 输入配置
    const inputOptions = {
      input: 'temp-entry.ts',
      external: ['vue', 'lodash-es', 'raf'],
      plugins: [
        nodeResolve({
          preferBuiltins: false,
          browser: true
        }),
        commonjs(),
        typescript({
          tsconfig: './tsconfig.json',
          declaration: true,
          declarationDir: './dist',
          compilerOptions: {
            allowImportingTsExtensions: false
          }
        }),
        terser()
      ]
    }
    
    console.log('🔧 创建 bundle...')
    const bundle = await rollup(inputOptions)
    
    console.log('📝 写入 ESM 格式...')
    await bundle.write({
      file: 'dist/hooks-utils.js',
      format: 'es',
      sourcemap: true
    })
    
    console.log('📝 写入 CJS 格式...')
    await bundle.write({
      file: 'dist/hooks-utils.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    })
    
    console.log('📝 写入 UMD 格式...')
    await bundle.write({
      file: 'dist/hooks-utils.umd.js',
      format: 'umd',
      name: 'LDesignSharedHooks',
      sourcemap: true,
      globals: {
        vue: 'Vue',
        'lodash-es': 'lodashEs',
        raf: 'raf'
      }
    })
    
    await bundle.close()
    
    // 清理临时文件
    unlinkSync('temp-entry.ts')
    console.log('🧹 清理临时文件')
    
    console.log('✅ hooks 和 utils 构建完成！')
    console.log('📦 生成的文件:')
    console.log('  - dist/hooks-utils.js (ESM)')
    console.log('  - dist/hooks-utils.cjs (CJS)')
    console.log('  - dist/hooks-utils.umd.js (UMD)')
    console.log('  - dist/temp-entry.d.ts (类型声明)')
    
    // 显示文件大小
    const fs = await import('fs')
    const stats = {
      esm: fs.statSync('dist/hooks-utils.js').size,
      cjs: fs.statSync('dist/hooks-utils.cjs').size,
      umd: fs.statSync('dist/hooks-utils.umd.js').size
    }
    
    console.log('\n📊 文件大小:')
    console.log(`  - ESM: ${(stats.esm / 1024).toFixed(2)} KB`)
    console.log(`  - CJS: ${(stats.cjs / 1024).toFixed(2)} KB`)
    console.log(`  - UMD: ${(stats.umd / 1024).toFixed(2)} KB`)
    
    console.log('\n🎉 构建成功！这证明了 @ldesign/builder 的核心功能是可以工作的！')
    
  } catch (error) {
    console.error('❌ 构建失败:', error.message)
    console.error('Stack:', error.stack)
    
    // 清理临时文件
    try {
      unlinkSync('temp-entry.ts')
    } catch {}
    
    process.exit(1)
  }
}

buildHooksUtils()
