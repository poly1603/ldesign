/**
 * @ldesign/shared - 使用RollupBuilder构建脚本
 * 
 * 使用新的RollupBuilder打包shared包
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createTDesignBuilder } from '../../builder/dist/index.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '..')

/**
 * 主构建函数
 */
async function build() {
  console.log('🚀 Starting build for @ldesign/shared...')
  
  // 创建构建器
  const builder = createTDesignBuilder({
    root: rootDir,
    input: resolve(rootDir, 'src/index.ts'),
    external: [
      'vue',
      'lodash-es',
      'raf',
      /^vue\//,
      /^lodash-es\//,
      /^@vue\//
    ],
    globals: {
      'vue': 'Vue',
      'lodash-es': '_',
      'raf': 'raf'
    },
    presetOptions: {
      typescript: {
        enabled: true,
        tsconfig: resolve(rootDir, 'tsconfig.json'),
        declaration: true,
        declarationDir: resolve(rootDir, 'dist')
      },
      vue: {
        enabled: true,
        style: true,
        jsx: false
      },
      style: {
        extract: true,
        minimize: false,
        less: {
          enabled: true,
          options: {
            javascriptEnabled: true,
            math: 'always'
          }
        }
      },
      alias: {
        '@': resolve(rootDir, 'src')
      },
      replace: {
        '__VERSION__': JSON.stringify('0.1.0')
      },
      minify: {
        enabled: false // 开发阶段不压缩，便于调试
      }
    },
    hooks: {
      beforeBuild: async (config) => {
        console.log('📦 Build configuration:')
        console.log('  Input:', config.input)
        console.log('  Environment:', config.environment)
        console.log('  Source maps:', config.sourcemap)
        console.log('')
      },
      afterBuild: async (result) => {
        if (result.success) {
          console.log('✅ Build completed successfully!')
          console.log('📊 Build statistics:')
          console.log(`   Duration: ${result.duration.toFixed(2)}ms`)
          console.log(`   Outputs: ${result.outputs.length} formats`)
          
          result.outputs.forEach(output => {
            console.log(`\n   📁 ${output.format.toUpperCase()} Format:`)
            console.log(`      Path: ${output.path}`)
            console.log(`      Files: ${output.files.length}`)
            console.log(`      Total size: ${(output.size / 1024).toFixed(2)} KB`)
            if (output.gzipSize) {
              console.log(`      Gzip size: ${(output.gzipSize / 1024).toFixed(2)} KB`)
            }
            
            // 列出主要文件
            const mainFiles = output.files.filter(f => f.isEntry || f.fileName.endsWith('.js') || f.fileName.endsWith('.mjs'))
            if (mainFiles.length > 0) {
              console.log(`      Main files: ${mainFiles.map(f => f.fileName).join(', ')}`)
            }
          })
          
          if (result.warnings.length > 0) {
            console.log(`\n⚠️  ${result.warnings.length} warnings found`)
          }
        } else {
          console.error('❌ Build failed!')
          result.errors.forEach(error => {
            console.error('   Error:', error.message || error)
          })
        }
      },
      onWarning: (warning) => {
        // 过滤一些不重要的警告
        if (
          warning.code === 'CIRCULAR_DEPENDENCY' ||
          warning.code === 'UNUSED_EXTERNAL_IMPORT'
        ) {
          return
        }
        console.warn('⚠️ Warning:', warning.message || warning)
      },
      onError: async (error) => {
        console.error('💥 Build error:', error.message || error)
      }
    }
  })
  
  try {
    // 执行构建
    const result = await builder.build()
    
    if (result.success) {
      // 创建package.json文件用于不同模块系统
      await createPackageJsonFiles()
      
      console.log('\n🎉 Build completed successfully!')
      console.log('\n📂 Generated directory structure:')
      console.log('   ├── es/          # ES Module format')
      console.log('   ├── cjs/         # CommonJS format')
      console.log('   └── dist/        # TypeScript declarations')
    } else {
      console.error('\n❌ Build failed with errors')
      process.exit(1)
    }
    
    // 销毁构建器
    await builder.destroy()
    
  } catch (error) {
    console.error('❌ Build error:', error)
    await builder.destroy()
    process.exit(1)
  }
}

/**
 * 为不同格式创建package.json文件
 */
async function createPackageJsonFiles() {
  const { existsSync } = await import('node:fs')
  const { writeFile } = await import('node:fs/promises')
  
  console.log('\n📝 Creating package.json files for different formats...')
  
  // ES模块的package.json
  const esPackageJson = {
    type: 'module',
    sideEffects: false
  }
  
  // CommonJS的package.json
  const cjsPackageJson = {
    type: 'commonjs',
    sideEffects: false
  }
  
  try {
    // 写入ES模块的package.json
    const esDir = resolve(rootDir, 'es')
    if (existsSync(esDir)) {
      await writeFile(
        resolve(esDir, 'package.json'),
        JSON.stringify(esPackageJson, null, 2)
      )
      console.log('   ✅ Created es/package.json')
    }
    
    // 写入CommonJS的package.json
    const cjsDir = resolve(rootDir, 'cjs')
    if (existsSync(cjsDir)) {
      await writeFile(
        resolve(cjsDir, 'package.json'),
        JSON.stringify(cjsPackageJson, null, 2)
      )
      console.log('   ✅ Created cjs/package.json')
    }
  } catch (error) {
    console.warn('   ⚠️ Failed to create package.json files:', error.message)
  }
}

// 运行构建
build().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
