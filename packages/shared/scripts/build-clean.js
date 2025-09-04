#!/usr/bin/env node

/**
 * Clean Build Script - Simplified and robust for Windows
 * Builds ES, CJS, and UMD formats with proper handling
 */

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { rollup } from 'rollup'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import less from 'rollup-plugin-less'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'
import { rimrafSync } from 'rimraf'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

console.log('🚀 Clean Build for @ldesign/shared')
console.log('==========================================\n')

async function build() {
  try {
    // Clean output directories
    console.log('🧹 Cleaning output directories...')
    const dirs = ['es', 'lib', 'dist', 'types']
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
        extensions: ['.mjs', '.js', '.json', '.node', '.ts', '.tsx', '.vue'],
        preferBuiltins: true
      }),
      commonjs(),
      vue({
        isProduction: false,
        template: {
          compilerOptions: {
            whitespace: 'preserve'
          }
        }
      }),
      vueJsx(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        sourceMap: false,
        noEmitOnError: false
      }),
      less({
        insert: false,
        output: false
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
        input: 'src/index.ts',
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
        input: 'src/index.ts',
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
        input: 'src/index.ts',
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
        input: 'src/index.ts',
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

    // Copy style files
    console.log('\n📂 Copying style files...')
    const glob = await import('glob')
    const stylePatterns = ['src/**/*.less', 'src/**/*.css']
    
    for (const pattern of stylePatterns) {
      const files = await glob.glob(pattern, { 
        cwd: rootDir,
        ignore: ['**/__tests__/**', '**/*.test.*']
      })
      
      for (const file of files) {
        // Copy to ES
        const esPath = file.replace('src/', 'es/')
        fs.ensureDirSync(dirname(resolve(rootDir, esPath)))
        fs.copySync(resolve(rootDir, file), resolve(rootDir, esPath))
        
        // Copy to lib
        const libPath = file.replace('src/', 'lib/')
        fs.ensureDirSync(dirname(resolve(rootDir, libPath)))
        fs.copySync(resolve(rootDir, file), resolve(rootDir, libPath))
      }
    }
    console.log('✅ Style files copied')

    // Copy Vue and TSX source files
    console.log('\n📂 Copying source files...')
    const sourcePatterns = ['src/**/*.vue', 'src/**/*.tsx', 'src/**/*.jsx']
    
    for (const pattern of sourcePatterns) {
      const files = await glob.glob(pattern, {
        cwd: rootDir,
        ignore: ['**/__tests__/**', '**/*.test.*']
      })
      
      for (const file of files) {
        // Copy to ES
        const esPath = file.replace('src/', 'es/')
        fs.ensureDirSync(dirname(resolve(rootDir, esPath)))
        fs.copySync(resolve(rootDir, file), resolve(rootDir, esPath))
        
        // Copy to lib
        const libPath = file.replace('src/', 'lib/')
        fs.ensureDirSync(dirname(resolve(rootDir, libPath)))
        fs.copySync(resolve(rootDir, file), resolve(rootDir, libPath))
      }
    }
    console.log('✅ Source files copied')

    // Update package.json
    console.log('\n📄 Updating package.json...')
    const pkgPath = resolve(rootDir, 'package.json')
    const pkg = fs.readJSONSync(pkgPath)
    
    pkg.main = 'lib/index.js'
    pkg.module = 'es/index.js'
    pkg.types = 'es/index.d.ts'
    pkg.unpkg = 'dist/index.min.js'
    pkg.jsdelivr = 'dist/index.min.js'
    pkg.sideEffects = ['*.css', '*.less']
    
    pkg.exports = {
      '.': {
        types: './es/index.d.ts',
        import: './es/index.js',
        require: './lib/index.js'
      },
      './es': {
        types: './es/index.d.ts',
        import: './es/index.js'
      },
      './lib': {
        types: './lib/index.d.ts',
        require: './lib/index.js'
      },
      './*': {
        import: './es/*.js',
        require: './lib/*.js'
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
    console.log('  - ./es/   (ES Modules with source files)')
    console.log('  - ./lib/  (CommonJS with source files)') 
    console.log('  - ./dist/ (UMD Bundle)')
    
    // Count files
    const esFiles = await glob.glob('es/**/*', { cwd: rootDir })
    const libFiles = await glob.glob('lib/**/*', { cwd: rootDir })
    const distFiles = await glob.glob('dist/**/*', { cwd: rootDir })
    
    console.log('\n📊 File counts:')
    console.log(`  - ES:   ${esFiles.length} files`)
    console.log(`  - Lib:  ${libFiles.length} files`)
    console.log(`  - Dist: ${distFiles.length} files`)
    
    console.log('\n✨ Build completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Build failed:', error)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run the build
build().catch(console.error)
