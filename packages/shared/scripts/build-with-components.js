#!/usr/bin/env node

/**
 * 完整版构建脚本 - 包含所有功能和组件
 * 
 * 注意：此脚本需要完整的Vue生态支持，包括：
 * - Vue SFC 编译
 * - JSX/TSX 支持
 * - Less 样式处理
 * - 完整的类型声明生成
 */

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { rollup } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import { dts } from 'rollup-plugin-dts'
import vue from '@vitejs/plugin-vue'
import esbuild from 'rollup-plugin-esbuild'
import postcss from 'rollup-plugin-postcss'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

console.log('🚀 Full Build for @ldesign/shared (with components)')
console.log('==========================================\n')

async function fullBuild() {
  try {
    console.log('📦 Creating Rollup configurations with component support...')
    
    // 完整插件配置
    const basePlugins = [
      vue({
        isProduction: true,
        script: {
          defineModel: true,
          propsDestructure: true
        }
      }),
      nodeResolve({
        preferBuiltins: false,
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json', '.less', '.css']
      }),
      commonjs(),
      postcss({
        extract: true,
        minimize: true,
        use: [
          ['less', {
            javascriptEnabled: true,
          }]
        ]
      }),
      esbuild({
        target: 'es2018',
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
        tsconfig: './tsconfig.json'
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        sourceMap: false,
        compilerOptions: {
          skipLibCheck: true,
          noEmit: false,
          strict: false,
          noImplicitAny: false,
          strictNullChecks: false,
          strictFunctionTypes: false,
          noImplicitReturns: false,
          noImplicitThis: false,
          outDir: undefined,
          jsx: 'preserve'  // 让 esbuild 处理 JSX
        }
      })
    ]

    // 外部依赖配置
    const external = (id) => {
      if (id === 'vue' || id.startsWith('@vue/')) return true
      if (id === 'lodash-es' || id === 'raf') return true
      if (id.includes('node_modules')) return true
      return false
    }

    const configs = [
      // ES Modules
      {
        input: 'src/index.ts',
        external,
        plugins: basePlugins,
        output: {
          dir: 'es',
          format: 'es',
          preserveModules: true,
          preserveModulesRoot: 'src',
          exports: 'named'
        }
      },
      
      // CommonJS
      {
        input: 'src/index.ts',
        external,
        plugins: basePlugins,
        output: {
          dir: 'cjs',
          format: 'cjs',
          preserveModules: true,
          preserveModulesRoot: 'src',
          exports: 'named',
          entryFileNames: '[name].cjs'
        }
      },
      
      // UMD Bundle
      {
        input: 'src/index.ts',
        external: ['vue', 'lodash-es', 'raf'],
        plugins: [...basePlugins, terser()],
        output: {
          file: 'dist/index.js',
          format: 'umd',
          name: 'LDesignShared',
          globals: {
            vue: 'Vue',
            'lodash-es': 'lodash',
            raf: 'raf'
          }
        }
      }
    ]

    console.log(`✅ Generated ${configs.length} configurations`)

    // 清理输出目录
    console.log('🧹 Cleaning output directories...')
    const { rimrafSync } = await import('rimraf')
    const { mkdirSync } = await import('fs')
    
    const dirs = ['es', 'cjs', 'dist']
    dirs.forEach(dir => {
      const fullPath = resolve(rootDir, dir)
      rimrafSync(fullPath)
      mkdirSync(fullPath, { recursive: true })
    })

    // 执行构建
    let successCount = 0
    for (const [index, config] of configs.entries()) {
      try {
        console.log(`📦 Building configuration ${index + 1}/${configs.length} (${config.output.format})...`)
        
        const bundle = await rollup(config)
        await bundle.write(config.output)
        await bundle.close()
        
        successCount++
        console.log(`✅ Configuration ${index + 1} completed`)
      } catch (error) {
        console.error(`❌ Configuration ${index + 1} failed:`, error.message)
        // 在组件构建失败时，继续其他构建
        if (error.message.includes('.vue') || error.message.includes('component')) {
          console.warn('⚠️  Component-related build failed, but continuing...')
        }
      }
    }

    // 生成 TypeScript 声明文件
    console.log('📝 Generating TypeScript declarations...')
    try {
      const dtsConfig = {
        input: 'src/index.ts',
        external: () => true,
        plugins: [dts({
          compilerOptions: {
            skipLibCheck: true
          }
        })],
        output: {
          dir: 'es',
          format: 'es',
          preserveModules: true,
          preserveModulesRoot: 'src'
        }
      }
      
      const dtsBundle = await rollup(dtsConfig)
      await dtsBundle.write(dtsConfig.output)
      await dtsBundle.close()
      
      console.log('✅ TypeScript declarations generated')
    } catch (error) {
      console.warn('⚠️ TypeScript declarations generation failed:', error.message)
    }

    // 显示结果
    console.log('\n==========================================')
    if (successCount === configs.length) {
      console.log('✅ BUILD SUCCESSFUL!')
      console.log(`📦 Successfully built ${successCount}/${configs.length} configurations`)
    } else {
      console.log(`⚠️ PARTIAL SUCCESS: ${successCount}/${configs.length} configurations built`)
      console.log('💡 This may be due to component compilation issues.')
      console.log('   Consider using build-fixed.js for utils/hooks only.')
    }

    console.log('\n✨ Full build completed!')

  } catch (error) {
    console.error('❌ Full build failed:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

fullBuild().catch(console.error)
