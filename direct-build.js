/**
 * 直接使用 Rollup 构建 shared 包
 */

import { rollup } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import vue from 'rollup-plugin-vue'

async function directBuild() {
  console.log('🚀 开始直接构建 shared 包...')
  
  try {
    // 输入配置
    const inputOptions = {
      input: 'src/index.ts',
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
        vue({
          target: 'browser',
          preprocessStyles: true,
          compilerOptions: {
            isTS: false  // 禁用 TypeScript 类型解析
          }
        }),
        terser()
      ]
    }
    
    console.log('🔧 创建 bundle...')
    const bundle = await rollup(inputOptions)
    
    console.log('📝 写入 ESM 格式...')
    await bundle.write({
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true
    })
    
    console.log('📝 写入 CJS 格式...')
    await bundle.write({
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    })
    
    console.log('📝 写入 UMD 格式...')
    await bundle.write({
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'LDesignShared',
      sourcemap: true,
      globals: {
        vue: 'Vue',
        'lodash-es': 'lodashEs',
        raf: 'raf'
      }
    })
    
    await bundle.close()
    
    console.log('✅ 构建完成！')
    console.log('📦 生成的文件:')
    console.log('  - dist/index.js (ESM)')
    console.log('  - dist/index.cjs (CJS)')
    console.log('  - dist/index.umd.js (UMD)')
    console.log('  - dist/index.d.ts (类型声明)')
    
    // 显示文件大小
    const fs = await import('fs')
    const stats = {
      esm: fs.statSync('dist/index.js').size,
      cjs: fs.statSync('dist/index.cjs').size,
      umd: fs.statSync('dist/index.umd.js').size
    }
    
    console.log('\n📊 文件大小:')
    console.log(`  - ESM: ${(stats.esm / 1024).toFixed(2)} KB`)
    console.log(`  - CJS: ${(stats.cjs / 1024).toFixed(2)} KB`)
    console.log(`  - UMD: ${(stats.umd / 1024).toFixed(2)} KB`)
    
  } catch (error) {
    console.error('❌ 构建失败:', error)
    console.error(error.stack)
    process.exit(1)
  }
}

directBuild()
