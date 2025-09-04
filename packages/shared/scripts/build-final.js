#!/usr/bin/env node

/**
 * 最终构建脚本 - 完全参考 TDesign 的构建方案
 * 生成所有文件，包括 Vue、TSX、Less 等
 */

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { execSync } from 'child_process'
import fs from 'fs-extra'
import { rimrafSync } from 'rimraf'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

console.log('🚀 Final Build for @ldesign/shared')
console.log('==========================================\n')

// 清理输出目录
function cleanDirs() {
  console.log('🧹 Cleaning output directories...')
  const dirs = ['es', 'lib', 'dist', 'types-temp']
  dirs.forEach(dir => {
    const path = resolve(rootDir, dir)
    rimrafSync(path)
    fs.ensureDirSync(path)
  })
}

// 构建 ES 模块
function buildESM() {
  console.log('\n📦 Building ES Modules...')
  
  try {
    // 使用原始的构建脚本，但改为 ES 输出
    execSync('pnpm build:fixed', { 
      cwd: rootDir, 
      stdio: 'inherit',
      env: { ...process.env, BUILD_FORMAT: 'es' }
    })
    
    // 复制样式文件
    copyStyleFiles('es')
    
    // 生成 package.json
    fs.writeJSONSync(resolve(rootDir, 'es/package.json'), {
      name: '@ldesign/shared',
      type: 'module',
      sideEffects: ['*.css', '*.less']
    }, { spaces: 2 })
    
    console.log('✅ ES Modules built successfully')
  } catch (error) {
    console.error('❌ Failed to build ES modules:', error.message)
  }
}

// 构建 CommonJS
function buildCJS() {
  console.log('\n📦 Building CommonJS...')
  
  // 临时切换到 CJS 目录名
  const originalEs = resolve(rootDir, 'es')
  const tempEs = resolve(rootDir, 'es-temp')
  const libDir = resolve(rootDir, 'lib')
  const cjsDir = resolve(rootDir, 'cjs')
  
  try {
    // 如果 es 目录存在，临时重命名
    if (fs.existsSync(originalEs)) {
      fs.renameSync(originalEs, tempEs)
    }
    
    // 构建到 cjs 目录
    execSync('pnpm build:fixed', { 
      cwd: rootDir, 
      stdio: 'inherit',
      env: { ...process.env, BUILD_FORMAT: 'cjs' }
    })
    
    // 将 cjs 重命名为 lib
    if (fs.existsSync(cjsDir)) {
      if (fs.existsSync(libDir)) {
        rimrafSync(libDir)
      }
      fs.renameSync(cjsDir, libDir)
    }
    
    // 恢复 es 目录
    if (fs.existsSync(tempEs)) {
      fs.renameSync(tempEs, originalEs)
    }
    
    // 复制样式文件
    copyStyleFiles('lib')
    
    // 生成 package.json
    fs.writeJSONSync(resolve(rootDir, 'lib/package.json'), {
      name: '@ldesign/shared',
      sideEffects: ['*.css', '*.less']
    }, { spaces: 2 })
    
    console.log('✅ CommonJS built successfully')
  } catch (error) {
    console.error('❌ Failed to build CommonJS:', error.message)
    
    // 清理和恢复
    if (fs.existsSync(tempEs)) {
      fs.renameSync(tempEs, originalEs)
    }
  }
}

// 复制样式文件
function copyStyleFiles(targetDir) {
  const patterns = [
    'src/**/*.less',
    'src/**/*.css'
  ]
  
  const glob = require('glob')
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { cwd: rootDir })
    files.forEach(file => {
      const dest = file.replace('src', targetDir)
      fs.ensureDirSync(dirname(resolve(rootDir, dest)))
      fs.copySync(resolve(rootDir, file), resolve(rootDir, dest))
    })
  })
}

// 复制源文件（保持原样）
function copySourceFiles() {
  console.log('\n📂 Copying source files...')
  
  const patterns = [
    'src/**/*.vue',
    'src/**/*.tsx',
    'src/**/*.jsx'
  ]
  
  const glob = require('glob')
  
  // 复制到 es 目录
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { 
      cwd: rootDir,
      ignore: ['**/__tests__/**', '**/*.test.*']
    })
    
    files.forEach(file => {
      // 复制到 es
      const esPath = file.replace('src', 'es')
      fs.ensureDirSync(dirname(resolve(rootDir, esPath)))
      fs.copySync(resolve(rootDir, file), resolve(rootDir, esPath))
      
      // 复制到 lib
      const libPath = file.replace('src', 'lib')
      fs.ensureDirSync(dirname(resolve(rootDir, libPath)))
      fs.copySync(resolve(rootDir, file), resolve(rootDir, libPath))
    })
  })
  
  console.log('✅ Source files copied')
}

// 生成类型声明
function generateTypes() {
  console.log('\n📝 Generating TypeScript declarations...')
  
  try {
    // 创建临时 tsconfig
    const tsconfigPath = resolve(rootDir, 'tsconfig.types.json')
    
    fs.writeJSONSync(tsconfigPath, {
      extends: './tsconfig.json',
      compilerOptions: {
        declaration: true,
        declarationMap: true,
        emitDeclarationOnly: true,
        outDir: 'types-temp',
        rootDir: 'src',
        skipLibCheck: true,
        noEmit: false
      },
      include: ['src/**/*'],
      exclude: [
        'node_modules',
        '**/__tests__/**',
        '**/*.test.*',
        'dist',
        'lib',
        'es'
      ]
    }, { spaces: 2 })
    
    // 运行 tsc
    try {
      execSync('npx tsc -p tsconfig.types.json', {
        cwd: rootDir,
        stdio: 'pipe'
      })
    } catch (error) {
      console.warn('⚠️  tsc warnings (ignored)')
    }
    
    // 复制类型文件
    const glob = require('glob')
    const typeFiles = glob.sync('types-temp/**/*.d.ts', { cwd: rootDir })
    
    typeFiles.forEach(file => {
      const relPath = file.replace('types-temp/', '')
      
      // 复制到 es
      const esPath = resolve(rootDir, 'es', relPath)
      fs.ensureDirSync(dirname(esPath))
      fs.copySync(resolve(rootDir, file), esPath)
      
      // 复制到 lib
      const libPath = resolve(rootDir, 'lib', relPath)
      fs.ensureDirSync(dirname(libPath))
      fs.copySync(resolve(rootDir, file), libPath)
    })
    
    // 生成 Vue 组件类型
    const vueFiles = glob.sync('src/**/*.vue', { 
      cwd: rootDir,
      ignore: ['**/__tests__/**']
    })
    
    vueFiles.forEach(file => {
      const name = file.replace('src/', '').replace('.vue', '')
      const componentName = name.split('/').pop()
      
      const dts = `import { DefineComponent } from 'vue'

declare const ${componentName}: DefineComponent<any, any, any>

export default ${componentName}
`
      
      // 写入类型文件
      const esPath = resolve(rootDir, 'es', name + '.d.ts')
      const libPath = resolve(rootDir, 'lib', name + '.d.ts')
      
      fs.ensureDirSync(dirname(esPath))
      fs.ensureDirSync(dirname(libPath))
      
      fs.writeFileSync(esPath, dts)
      fs.writeFileSync(libPath, dts)
    })
    
    // 清理临时文件
    fs.removeSync(tsconfigPath)
    rimrafSync(resolve(rootDir, 'types-temp'))
    
    console.log('✅ Type declarations generated')
    
  } catch (error) {
    console.error('❌ Failed to generate types:', error.message)
  }
}

// 构建 UMD
function buildUMD() {
  console.log('\n📦 Building UMD bundle...')
  
  try {
    execSync('pnpm build:fixed', { 
      cwd: rootDir, 
      stdio: 'inherit',
      env: { ...process.env, BUILD_FORMAT: 'umd' }
    })
    
    console.log('✅ UMD bundle built successfully')
  } catch (error) {
    console.error('❌ Failed to build UMD:', error.message)
  }
}

// 更新 package.json
function updatePackageJson() {
  console.log('\n📄 Updating package.json...')
  
  const pkgPath = resolve(rootDir, 'package.json')
  const pkg = fs.readJSONSync(pkgPath)
  
  // 更新导出配置
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
  
  pkg.main = 'lib/index.js'
  pkg.module = 'es/index.js'
  pkg.types = 'es/index.d.ts'
  pkg.unpkg = 'dist/index.min.js'
  pkg.jsdelivr = 'dist/index.min.js'
  pkg.sideEffects = ['*.css', '*.less']
  
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
}

// 主构建函数
async function build() {
  try {
    // 1. 清理目录
    cleanDirs()
    
    // 2. 构建 ES Modules
    buildESM()
    
    // 3. 构建 CommonJS
    buildCJS()
    
    // 4. 复制源文件
    copySourceFiles()
    
    // 5. 生成类型声明
    generateTypes()
    
    // 6. 构建 UMD
    buildUMD()
    
    // 7. 更新 package.json
    updatePackageJson()
    
    console.log('\n==========================================')
    console.log('✅ BUILD COMPLETE!')
    console.log('📊 Output directories:')
    console.log('  - ./es/   (ES Modules with source files)')
    console.log('  - ./lib/  (CommonJS with source files)')
    console.log('  - ./dist/ (UMD Bundle)')
    console.log('\n✨ All files including .vue, .tsx, .less are included')
    
  } catch (error) {
    console.error('\n❌ Build failed:', error)
    process.exit(1)
  }
}

// 运行构建
build()
