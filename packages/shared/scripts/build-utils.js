#!/usr/bin/env node

/**
 * Utils Build Script - Build only utils and hooks without components
 */

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { rollup } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'
import { rimrafSync } from 'rimraf'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

console.log('🚀 Utils Build for @ldesign/shared')
console.log('==========================================\n')

async function build() {
  try {
    // Clean output directories
    console.log('🧹 Cleaning output directories...')
    const dirs = ['es', 'lib', 'dist']
    for (const dir of dirs) {
      const fullPath = resolve(rootDir, dir)
      if (fs.existsSync(fullPath)) {
        rimrafSync(fullPath)
      }
      fs.ensureDirSync(fullPath)
    }

    // Base plugin configuration
    const basePlugins = [
      nodeResolve({
        extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx'],
        preferBuiltins: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: false,
        sourceMap: false,
        noEmitOnError: false
      })
    ]

    // External dependencies
    const external = (id) => {
      if (id === 'vue' || id.startsWith('@vue/')) return true
      if (id === 'lodash-es' || id === 'raf') return true
      if (id.includes('node_modules')) return true
      return false
    }

    // Build ES Modules
    console.log('\n📦 Building ES Modules...')
    try {
      const esBundle = await rollup({
        input: 'src/index-no-components.ts',
        external,
        plugins: basePlugins
      })
      
      await esBundle.write({
        dir: 'es',
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src',
        exports: 'named'
      })
      
      await esBundle.close()
      console.log('✅ ES Modules built successfully')
    } catch (error) {
      console.error('❌ Failed to build ES modules:', error.message)
    }

    // Build CommonJS
    console.log('\n📦 Building CommonJS...')
    try {
      const cjsBundle = await rollup({
        input: 'src/index-no-components.ts',
        external,
        plugins: basePlugins
      })
      
      await cjsBundle.write({
        dir: 'lib',
        format: 'cjs',
        preserveModules: true,
        preserveModulesRoot: 'src',
        exports: 'named'
      })
      
      await cjsBundle.close()
      console.log('✅ CommonJS built successfully')
    } catch (error) {
      console.error('❌ Failed to build CommonJS:', error.message)
    }

    // Build UMD Bundle
    console.log('\n📦 Building UMD Bundle...')
    try {
      const umdBundle = await rollup({
        input: 'src/index-no-components.ts',
        external: ['vue', 'lodash-es', 'raf'],
        plugins: [...basePlugins, terser()]
      })
      
      await umdBundle.write({
        file: 'dist/index.min.js',
        format: 'umd',
        name: 'LDesignShared',
        globals: {
          vue: 'Vue',
          'lodash-es': 'lodash',
          raf: 'raf'
        }
      })
      
      await umdBundle.close()
      console.log('✅ UMD bundle built successfully')
    } catch (error) {
      console.error('❌ Failed to build UMD:', error.message)
    }

    // Generate TypeScript declarations
    console.log('\n📝 Generating TypeScript declarations...')
    try {
      const dtsBundle = await rollup({
        input: 'src/index-no-components.ts',
        external: () => true,
        plugins: [
          dts({
            compilerOptions: {
              skipLibCheck: true
            }
          })
        ]
      })
      
      // Generate for ES
      await dtsBundle.write({
        dir: 'es',
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src'
      })
      
      // Copy to lib
      const glob = await import('glob')
      const dtsFiles = await glob.glob('es/**/*.d.ts', { cwd: rootDir })
      
      for (const file of dtsFiles) {
        const libPath = file.replace('es/', 'lib/')
        fs.ensureDirSync(dirname(resolve(rootDir, libPath)))
        fs.copySync(resolve(rootDir, file), resolve(rootDir, libPath))
      }
      
      await dtsBundle.close()
      console.log('✅ TypeScript declarations generated')
    } catch (error) {
      console.warn('⚠️ TypeScript declarations generation failed:', error.message)
    }

    // Update package.json with correct entry points
    console.log('\n📄 Updating package.json...')
    const pkgPath = resolve(rootDir, 'package.json')
    const pkg = fs.readJSONSync(pkgPath)
    
    pkg.main = 'lib/index-no-components.js'
    pkg.module = 'es/index-no-components.js'
    pkg.types = 'es/index-no-components.d.ts'
    pkg.unpkg = 'dist/index.min.js'
    pkg.jsdelivr = 'dist/index.min.js'
    pkg.sideEffects = false
    
    pkg.exports = {
      '.': {
        types: './es/index-no-components.d.ts',
        import: './es/index-no-components.js',
        require: './lib/index-no-components.js'
      },
      './hooks': {
        types: './es/hooks/index.d.ts',
        import: './es/hooks/index.js',
        require: './lib/hooks/index.js'
      },
      './utils': {
        types: './es/utils/index.d.ts',
        import: './es/utils/index.js',
        require: './lib/utils/index.js'
      },
      './types': {
        types: './es/types/index.d.ts',
        import: './es/types/index.js',
        require: './lib/types/index.js'
      },
      './es/*': './es/*',
      './lib/*': './lib/*',
      './dist/*': './dist/*'
    }
    
    pkg.files = [
      'dist',
      'es',
      'lib',
      'README.md',
      'LICENSE',
      'package.json'
    ]
    
    fs.writeJSONSync(pkgPath, pkg, { spaces: 2 })
    console.log('✅ package.json updated')

    // Final summary
    console.log('\n==========================================')
    console.log('✅ BUILD COMPLETE!')
    console.log('📊 Output directories:')
    console.log('  - ./es/   (ES Modules)')
    console.log('  - ./lib/  (CommonJS)') 
    console.log('  - ./dist/ (UMD Bundle)')
    
    // Count files
    const glob2 = await import('glob')
    const esFiles = await glob2.glob('es/**/*', { cwd: rootDir })
    const libFiles = await glob2.glob('lib/**/*', { cwd: rootDir })
    const distFiles = await glob2.glob('dist/**/*', { cwd: rootDir })
    
    console.log('\n📊 File counts:')
    console.log(`  - ES:   ${esFiles.length} files`)
    console.log(`  - Lib:  ${libFiles.length} files`)
    console.log(`  - Dist: ${distFiles.length} files`)
    
    console.log('\n✨ Utils and hooks build completed successfully!')
    console.log('ℹ️  Components are excluded from this build')
    
  } catch (error) {
    console.error('\n❌ Build failed:', error)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run the build
build().catch(console.error)
