#!/usr/bin/env node

/**
 * 完整构建脚本 - 支持所有文件类型
 * 参考 TDesign 的构建方案
 */

import { fileURLToPath } from 'url'
import { dirname, resolve, relative, extname } from 'path'
import { rollup } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import postcss from 'rollup-plugin-postcss'
import { glob } from 'glob'
import fs from 'fs-extra'
import { rimrafSync } from 'rimraf'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

console.log('🚀 Complete Build for @ldesign/shared')
console.log('==========================================\n')

// 获取所有源文件
async function getAllSourceFiles() {
  const patterns = [
    'src/**/*.ts',
    'src/**/*.tsx', 
    'src/**/*.js',
    'src/**/*.jsx',
    'src/**/*.vue',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
    '!src/**/__tests__/**'
  ]
  
  const files = await glob(patterns, {
    cwd: rootDir,
    absolute: false
  })
  
  return files
}

// 获取所有样式文件
async function getAllStyleFiles() {
  const patterns = [
    'src/**/*.less',
    'src/**/*.css',
    '!src/**/__tests__/**'
  ]
  
  const files = await glob(patterns, {
    cwd: rootDir,
    absolute: false
  })
  
  return files
}

// 构建单个文件
async function buildFile(file, format) {
  const ext = extname(file)
  const isVue = ext === '.vue'
  const isTsx = ext === '.tsx'
  const isStyle = ext === '.less' || ext === '.css'
  
  // 样式文件单独处理
  if (isStyle) {
    return buildStyleFile(file, format)
  }
  
  try {
    const inputOptions = {
      input: file,
      external: (id) => {
        // 外部依赖
        if (id === 'vue' || id.startsWith('@vue/')) return true
        if (id === 'lodash-es' || id === 'raf') return true
        // 样式文件作为外部依赖
        if (id.endsWith('.less') || id.endsWith('.css')) return true
        // node_modules 中的依赖（排除相对路径）
        if (!id.startsWith('.') && !id.startsWith('/') && !resolve(id).includes(file)) {
          return true
        }
        return false
      },
      plugins: [
        vue({
          isProduction: true,
          template: {
            compilerOptions: {
              whitespace: 'condense'
            }
          }
        }),
        vueJsx(),
        nodeResolve({
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json']
        }),
        commonjs(),
        esbuild({
          target: 'es2015',
          loaders: {
            '.vue': 'ts',
            '.ts': 'ts', 
            '.tsx': 'tsx',
            '.js': 'js',
            '.jsx': 'jsx'
          },
          jsxFactory: 'h',
          jsxFragment: 'Fragment',
          jsxInject: `import { h, Fragment } from 'vue'`
        }),
        postcss({
          extract: false,
          inject: false,
          modules: false
        })
      ]
    }
    
    const bundle = await rollup(inputOptions)
    
    // 计算输出路径
    const relPath = relative('src', file)
    const outDir = format === 'es' ? 'es' : format === 'cjs' ? 'lib' : 'dist'
    let outFile = resolve(rootDir, outDir, relPath)
    
    // 修改扩展名
    if (isVue || isTsx) {
      outFile = outFile.replace(/\.(vue|tsx)$/, '.js')
    } else if (ext === '.ts') {
      outFile = outFile.replace(/\.ts$/, '.js')
    }
    
    if (format === 'cjs') {
      outFile = outFile.replace(/\.js$/, '.cjs')
    }
    
    const outputOptions = {
      file: outFile,
      format: format,
      exports: 'auto',
      sourcemap: false
    }
    
    await bundle.write(outputOptions)
    await bundle.close()
    
    return outFile
  } catch (error) {
    console.warn(`⚠️  Failed to build ${file}: ${error.message}`)
    return null
  }
}

// 构建样式文件
async function buildStyleFile(file, format) {
  const relPath = relative('src', file)
  const outDir = format === 'es' ? 'es' : format === 'cjs' ? 'lib' : 'dist'
  const outFile = resolve(rootDir, outDir, relPath)
  
  // 确保目录存在
  await fs.ensureDir(dirname(outFile))
  
  // 直接复制样式文件
  await fs.copy(file, outFile)
  
  // 如果是 Less 文件，也生成对应的 CSS
  if (extname(file) === '.less') {
    try {
      const less = await import('less')
      const content = await fs.readFile(file, 'utf8')
      const result = await less.default.render(content, {
        filename: file,
        paths: [dirname(file)]
      })
      
      const cssFile = outFile.replace(/\.less$/, '.css')
      await fs.writeFile(cssFile, result.css)
    } catch (error) {
      console.warn(`⚠️  Failed to compile Less file ${file}: ${error.message}`)
    }
  }
  
  return outFile
}

// 生成入口文件
async function buildEntryFile(format) {
  const entryFile = 'src/index.ts'
  
  const inputOptions = {
    input: entryFile,
    external: (id) => {
      if (id === 'vue' || id.startsWith('@vue/')) return true
      if (id === 'lodash-es' || id === 'raf') return true
      return !id.startsWith('.') && !id.startsWith('/')
    },
    plugins: [
      vue({
        isProduction: true
      }),
      vueJsx(),
      nodeResolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json']
      }),
      commonjs(),
      esbuild({
        target: 'es2015',
        loaders: {
          '.ts': 'ts',
          '.tsx': 'tsx'
        }
      }),
      postcss({
        extract: false,
        inject: false
      })
    ]
  }
  
  try {
    const bundle = await rollup(inputOptions)
    
    const outDir = format === 'es' ? 'es' : format === 'cjs' ? 'lib' : 'dist'
    const outFile = resolve(rootDir, outDir, format === 'cjs' ? 'index.cjs' : 'index.js')
    
    await bundle.write({
      file: outFile,
      format: format,
      exports: 'auto',
      sourcemap: false
    })
    
    await bundle.close()
    console.log(`✅ Built entry file for ${format}`)
  } catch (error) {
    console.error(`❌ Failed to build entry file for ${format}: ${error.message}`)
  }
}

// 生成 package.json 文件
async function generatePackageJson(dir) {
  const pkg = {
    name: '@ldesign/shared',
    version: '0.1.0',
    sideEffects: false
  }
  
  if (dir === 'es') {
    pkg.type = 'module'
  }
  
  await fs.writeJSON(resolve(rootDir, dir, 'package.json'), pkg, { spaces: 2 })
}

// 主构建函数
async function build() {
  try {
    // 清理输出目录
    console.log('🧹 Cleaning output directories...')
    const dirs = ['es', 'lib', 'dist']
    dirs.forEach(dir => {
      rimrafSync(resolve(rootDir, dir))
      fs.ensureDirSync(resolve(rootDir, dir))
    })
    
    // 获取所有文件
    console.log('📂 Scanning source files...')
    const sourceFiles = await getAllSourceFiles()
    const styleFiles = await getAllStyleFiles()
    
    console.log(`  Found ${sourceFiles.length} source files`)
    console.log(`  Found ${styleFiles.length} style files`)
    
    // 构建 ES modules
    console.log('\n📦 Building ES modules...')
    let esCount = 0
    for (const file of sourceFiles) {
      const result = await buildFile(file, 'es')
      if (result) esCount++
    }
    for (const file of styleFiles) {
      const result = await buildStyleFile(file, 'es')
      if (result) esCount++
    }
    await buildEntryFile('es')
    await generatePackageJson('es')
    console.log(`  ✅ Built ${esCount} ES module files`)
    
    // 构建 CommonJS
    console.log('\n📦 Building CommonJS modules...')
    let cjsCount = 0
    for (const file of sourceFiles) {
      const result = await buildFile(file, 'cjs')
      if (result) cjsCount++
    }
    for (const file of styleFiles) {
      const result = await buildStyleFile(file, 'cjs')
      if (result) cjsCount++
    }
    await buildEntryFile('cjs')
    await generatePackageJson('lib')
    console.log(`  ✅ Built ${cjsCount} CommonJS files`)
    
    // 构建 UMD bundle
    console.log('\n📦 Building UMD bundle...')
    await buildUmdBundle()
    
    console.log('\n==========================================')
    console.log('✅ BUILD COMPLETE!')
    console.log('📊 Output directories:')
    console.log('  - ./es/   (ES Modules)')
    console.log('  - ./lib/  (CommonJS)')
    console.log('  - ./dist/ (UMD Bundle)')
    
  } catch (error) {
    console.error('❌ Build failed:', error)
    console.error(error.stack)
    process.exit(1)
  }
}

// 构建 UMD bundle
async function buildUmdBundle() {
  try {
    const inputOptions = {
      input: 'src/index.ts',
      external: ['vue'],
      plugins: [
        vue({
          isProduction: true
        }),
        vueJsx(),
        nodeResolve({
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json']
        }),
        commonjs(),
        esbuild({
          target: 'es2015',
          minify: true
        }),
        postcss({
          extract: 'index.css',
          minimize: true
        })
      ]
    }
    
    const bundle = await rollup(inputOptions)
    
    await bundle.write({
      file: resolve(rootDir, 'dist/ldesign-shared.min.js'),
      format: 'umd',
      name: 'LDesignShared',
      exports: 'named',
      globals: {
        vue: 'Vue'
      },
      sourcemap: true
    })
    
    await bundle.close()
    console.log('  ✅ Built UMD bundle')
  } catch (error) {
    console.error('  ❌ Failed to build UMD bundle:', error.message)
  }
}

// 运行构建
build().catch(console.error)
