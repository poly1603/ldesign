#!/usr/bin/env node

/**
 * 类型声明生成脚本
 * 参考 TDesign 的类型生成方案
 */

import { fileURLToPath } from 'url'
import { dirname, resolve, relative, basename } from 'path'
import { glob } from 'glob'
import fs from 'fs-extra'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

console.log('📝 Generating TypeScript declarations...')
console.log('==========================================\n')

// 生成类型声明
async function generateTypes() {
  try {
    // 使用 vue-tsc 生成类型声明
    console.log('🔧 Running vue-tsc...')
    
    // 创建临时 tsconfig 文件用于生成类型
    const tsconfigBuild = {
      extends: './tsconfig.json',
      compilerOptions: {
        declaration: true,
        declarationMap: true,
        emitDeclarationOnly: true,
        outDir: 'types-temp',
        rootDir: 'src',
        skipLibCheck: true,
        noEmit: false,
        allowJs: false,
        checkJs: false
      },
      include: [
        'src/**/*.ts',
        'src/**/*.tsx',
        'src/**/*.vue',
        'src/**/*.d.ts'
      ],
      exclude: [
        'node_modules',
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        'dist',
        'lib',
        'es',
        'types-temp'
      ]
    }
    
    await fs.writeJSON(resolve(rootDir, 'tsconfig.build.json'), tsconfigBuild, { spaces: 2 })
    
    try {
      // 运行 vue-tsc
      const { stdout, stderr } = await execAsync('npx vue-tsc -p tsconfig.build.json', {
        cwd: rootDir
      })
      
      if (stderr && !stderr.includes('warning')) {
        console.warn('⚠️  vue-tsc warnings:', stderr)
      }
      
      console.log('✅ Type declarations generated in types-temp/')
      
    } catch (error) {
      console.error('❌ vue-tsc failed:', error.message)
      
      // 降级使用 tsc
      console.log('🔧 Falling back to tsc...')
      
      try {
        const { stdout, stderr } = await execAsync('npx tsc -p tsconfig.build.json', {
          cwd: rootDir
        })
        
        if (stderr) {
          console.warn('⚠️  tsc warnings:', stderr)
        }
        
        console.log('✅ Type declarations generated with tsc')
      } catch (tscError) {
        console.error('❌ tsc also failed:', tscError.message)
        
        // 最后的备选方案：使用 rollup-plugin-dts
        console.log('🔧 Using rollup-plugin-dts as fallback...')
        await generateTypesWithRollup()
      }
    }
    
    // 复制类型文件到目标目录
    await copyTypesToOutput()
    
    // 清理临时文件
    await fs.remove(resolve(rootDir, 'tsconfig.build.json'))
    await fs.remove(resolve(rootDir, 'types-temp'))
    
    console.log('\n✅ Type declarations generated successfully!')
    
  } catch (error) {
    console.error('❌ Failed to generate types:', error)
    process.exit(1)
  }
}

// 使用 rollup 生成类型声明
async function generateTypesWithRollup() {
  const { rollup } = await import('rollup')
  const { dts } = await import('rollup-plugin-dts')
  
  const sourceFiles = await glob('src/**/*.{ts,tsx}', {
    cwd: rootDir,
    ignore: ['**/__tests__/**', '**/*.test.{ts,tsx}']
  })
  
  for (const file of sourceFiles) {
    try {
      const bundle = await rollup({
        input: file,
        external: () => true,
        plugins: [
          dts({
            respectExternal: true,
            compilerOptions: {
              skipLibCheck: true,
              allowSyntheticDefaultImports: true
            }
          })
        ]
      })
      
      const relPath = relative('src', file).replace(/\.(ts|tsx)$/, '.d.ts')
      const outputPath = resolve(rootDir, 'types-temp', relPath)
      
      await fs.ensureDir(dirname(outputPath))
      
      await bundle.write({
        file: outputPath,
        format: 'es'
      })
      
      await bundle.close()
      
    } catch (error) {
      console.warn(`⚠️  Failed to generate types for ${file}`)
    }
  }
}

// 复制类型文件到输出目录
async function copyTypesToOutput() {
  const typeFiles = await glob('types-temp/**/*.d.ts', {
    cwd: rootDir
  })
  
  console.log(`\n📋 Copying ${typeFiles.length} type files...`)
  
  // 复制到 es 目录
  for (const file of typeFiles) {
    const relPath = relative('types-temp', file)
    const esPath = resolve(rootDir, 'es', relPath)
    const libPath = resolve(rootDir, 'lib', relPath)
    
    await fs.ensureDir(dirname(esPath))
    await fs.ensureDir(dirname(libPath))
    
    await fs.copy(file, esPath)
    await fs.copy(file, libPath)
  }
  
  // 生成组件的类型声明文件（针对 .vue 文件）
  await generateVueTypes()
}

// 为 Vue 组件生成类型声明
async function generateVueTypes() {
  const vueFiles = await glob('src/**/*.vue', {
    cwd: rootDir,
    ignore: ['**/__tests__/**']
  })
  
  console.log(`\n🖼️  Generating types for ${vueFiles.length} Vue components...`)
  
  for (const file of vueFiles) {
    const relPath = relative('src', file)
    const baseName = basename(file, '.vue')
    const dirPath = dirname(relPath)
    
    // 简单的 Vue 组件类型声明模板
    const dts = `import { DefineComponent } from 'vue'

declare const ${baseName}: DefineComponent<any, any, any>

export default ${baseName}
`
    
    const esPath = resolve(rootDir, 'es', dirPath, `${baseName}.vue.d.ts`)
    const libPath = resolve(rootDir, 'lib', dirPath, `${baseName}.vue.d.ts`)
    
    await fs.ensureDir(dirname(esPath))
    await fs.ensureDir(dirname(libPath))
    
    await fs.writeFile(esPath, dts)
    await fs.writeFile(libPath, dts)
  }
}

// 生成主入口的类型声明
async function generateMainTypes() {
  const mainDts = `export * from './types'
export * from './utils'
export * from './hooks'
export * from './components'
`
  
  await fs.writeFile(resolve(rootDir, 'es/index.d.ts'), mainDts)
  await fs.writeFile(resolve(rootDir, 'lib/index.d.ts'), mainDts)
}

// 主函数
async function main() {
  await generateTypes()
  await generateMainTypes()
}

main().catch(console.error)
