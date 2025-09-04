/**
 * @ldesign/shared - 基础功能构建脚本
 * 
 * 只构建hooks、types和utils，不构建组件
 */

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { RollupBuilder } from '../../builder/dist/index.js'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'
import replace from '@rollup/plugin-replace'
import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '..')

async function build() {
  console.log('🚀 Building @ldesign/shared (basic features)...')
  
  // 创建基础入口文件
  const basicEntry = `
// 导出类型定义
export * from './types'

// 导出工具函数  
export * from './utils'

// 导出 Vue 组合式函数
export * from './hooks'
  `.trim()
  
  const { writeFile } = await import('node:fs/promises')
  const entryPath = resolve(rootDir, 'src/index-basic.ts')
  await writeFile(entryPath, basicEntry)
  
  const builder = new RollupBuilder({
    root: rootDir,
    input: entryPath,
    output: [
      {
        format: 'es',
        dir: 'es',
        entryFileNames: 'index.mjs',
        chunkFileNames: '[name].mjs',
        preserveModules: false,
        exports: 'named'
      },
      {
        format: 'cjs',
        dir: 'cjs',
        entryFileNames: 'index.js',
        chunkFileNames: '[name].js',
        preserveModules: false,
        exports: 'named'
      }
    ],
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
    plugins: [
      // Node 解析插件
      nodeResolve({
        extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx'],
        preferBuiltins: false,
        browser: true,
        mainFields: ['module', 'jsnext:main', 'main'],
        dedupe: ['vue']
      }),
      
      // 别名插件
      alias({
        entries: [
          { find: '@', replacement: resolve(rootDir, 'src') }
        ]
      }),
      
      // 替换插件
      replace({
        values: {
          'process.env.NODE_ENV': JSON.stringify('production'),
          '__VUE_OPTIONS_API__': JSON.stringify(true),
          '__VUE_PROD_DEVTOOLS__': JSON.stringify(false),
          '__VERSION__': JSON.stringify('0.1.0')
        },
        preventAssignment: true
      }),
      
      // ESBuild 插件
      esbuild({
        include: /\\.[jt]s?$/,
        exclude: /node_modules/,
        sourceMap: true,
        target: 'es2020',
        format: 'esm',
        loader: {
          '.ts': 'ts',
          '.tsx': 'tsx'
        },
        tsconfig: resolve(rootDir, 'tsconfig.json')
      }),
      
      // CommonJS 插件
      commonjs({
        include: /node_modules/,
        sourceMap: false
      }),
      
      // JSON 插件
      json({
        compact: true,
        preferConst: true
      })
    ],
    sourcemap: true,
    clean: true,
    hooks: {
      beforeBuild: async (config) => {
        console.log('📦 Configuration:')
        console.log('  Input:', config.input)
        console.log('  Plugins:', config.plugins?.length || 0)
        console.log('')
      },
      afterBuild: async (result) => {
        if (result.success) {
          console.log('✅ Build successful!')
          console.log(`   Duration: ${result.duration.toFixed(2)}ms`)
          console.log(`   Outputs: ${result.outputs.length}`)
          
          result.outputs.forEach(output => {
            console.log(`\\n   📁 ${output.format.toUpperCase()}:`)
            console.log(`      Path: ${output.path}`)
            console.log(`      Files: ${output.files.length}`)
            console.log(`      Size: ${(output.size / 1024).toFixed(2)} KB`)
          })
          
          // 构建 TypeScript 声明文件
          await buildDeclarations()
          
          // 创建 package.json 文件
          await createPackageJsonFiles()
          
          console.log('\\n🎉 Build completed!')
        } else {
          console.error('❌ Build failed!')
          result.errors.forEach(error => console.error(error))
        }
      }
    }
  })
  
  try {
    await builder.build()
    await builder.destroy()
  } catch (error) {
    console.error('❌ Error:', error)
    await builder.destroy()
    process.exit(1)
  }
}

/**
 * 构建 TypeScript 声明文件
 */
async function buildDeclarations() {
  console.log('\\n📝 Building TypeScript declarations...')
  
  const dtsBuilder = new RollupBuilder({
    root: rootDir,
    input: resolve(rootDir, 'src/index-basic.ts'),
    output: {
      format: 'es',
      dir: 'dist'
    },
    external: [
      'vue',
      'lodash-es',
      'raf',
      /^vue\//,
      /^lodash-es\//,
      /^@vue\//
    ],
    plugins: [
      dts({
        respectExternal: true,
        compilerOptions: {
          baseUrl: rootDir,
          paths: {
            '@/*': ['src/*']
          }
        }
      })
    ]
  })
  
  try {
    await dtsBuilder.build()
    await dtsBuilder.destroy()
    console.log('✅ TypeScript declarations built successfully!')
  } catch (error) {
    console.error('❌ DTS build error:', error)
    await dtsBuilder.destroy()
  }
}

async function createPackageJsonFiles() {
  const { existsSync } = await import('node:fs')
  const { writeFile } = await import('node:fs/promises')
  
  const esPackage = { type: 'module', sideEffects: false }
  const cjsPackage = { type: 'commonjs', sideEffects: false }
  
  if (existsSync(resolve(rootDir, 'es'))) {
    await writeFile(
      resolve(rootDir, 'es/package.json'),
      JSON.stringify(esPackage, null, 2)
    )
    console.log('   ✅ Created es/package.json')
  }
  
  if (existsSync(resolve(rootDir, 'cjs'))) {
    await writeFile(
      resolve(rootDir, 'cjs/package.json'),
      JSON.stringify(cjsPackage, null, 2)
    )
    console.log('   ✅ Created cjs/package.json')
  }
}

build().catch(console.error)
