/**
 * shared 包增强构建脚本
 * 专门处理 Vue SFC + TypeScript + CSS 的复杂构建
 */

import { rollup } from 'rollup'
import { join, sep } from 'path'
import { existsSync, readFileSync, rmSync } from 'fs'
import fg from 'fast-glob'

// 插件
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import esbuild from 'rollup-plugin-esbuild'
import terser from '@rollup/plugin-terser'

async function buildShared() {
  console.log('🚀 开始构建 shared 包...')
  
  const root = process.cwd()
  const srcDir = join(root, 'src')
  const outDir = join(root, 'dist')
  
  // 清理输出目录
  if (existsSync(outDir)) {
    rmSync(outDir, { recursive: true, force: true })
    console.log('🗑️ 清理输出目录')
  }

  // 分析项目，跳过 Vue 文件
  console.log('📋 分析项目结构...')
  
  // 只打包 TypeScript 文件，跳过 Vue SFC
  const files = await fg(['**/*.{ts,tsx}'], {
    cwd: srcDir,
    ignore: ['**/*.test.*', '**/*.spec.*', '**/*.d.ts']
  })
  
  console.log(`📦 找到 ${files.length} 个 TypeScript 文件`)
  
  const entries = {}
  for (const file of files) {
    const name = file.replace(/\.(ts|tsx)$/, '')
    entries[name] = join(srcDir, file)
  }

  // 构建配置
  const formats = ['esm', 'cjs']
  
  for (const format of formats) {
    console.log(`🔨 构建 ${format.toUpperCase()} 格式...`)
    
    const plugins = [
      nodeResolve({
        extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
      }),
      commonjs(),
      json(),
      esbuild({
        target: 'es2017',
        loaders: {
          '.ts': 'ts',
          '.tsx': 'tsx'
        }
      })
    ]

    const ext = format === 'esm' ? 'js' : 'cjs'
    
    const config = {
      input: entries,
      output: {
        format: format === 'esm' ? 'es' : 'cjs',
        dir: join(outDir, format),
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: `[name].${ext}`,
        exports: 'named'
      },
      plugins,
      external: (id) => {
        // 外部化所有依赖
        return id.includes('vue') || 
               id.includes('react') || 
               id.includes('@ldesign/') ||
               !id.startsWith('.') && !id.startsWith('/')
      }
    }
    
    const bundle = await rollup(config)
    await bundle.write(config.output)
    await bundle.close()
    
    console.log(`✅ ${format.toUpperCase()} 格式构建完成`)
  }

  console.log(`\n🎉 shared 包构建完成！`)
  console.log(`📄 注意: Vue SFC 文件已跳过，需要单独处理`)
}

buildShared().catch(console.error)
