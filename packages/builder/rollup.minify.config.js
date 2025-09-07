/**
 * 带压缩功能的 Rollup 配置文件
 */

import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
import fs from 'fs'

// 压缩配置
const MINIFY_CONFIG = {
  enabled: process.env.NODE_ENV === 'production' || process.env.MINIFY === 'true',
  level: process.env.MINIFY_LEVEL || 'basic' // none, whitespace, basic, advanced
}

// Banner 生成函数
async function generateBanner() {
  try {
    const packageJson = JSON.parse(await fs.promises.readFile('package.json', 'utf-8'))
    const rollupPkg = JSON.parse(await fs.promises.readFile('node_modules/rollup/package.json', 'utf-8'))
    
    const buildTime = new Date().toISOString()
    const lines = [
      `${packageJson.name} v${packageJson.version}`,
      `Built with Rollup v${rollupPkg.version}`,
      `Build time: ${buildTime}`,
      `Build mode: ${MINIFY_CONFIG.enabled ? 'production (minified)' : 'development'}`
    ]
    
    const maxLength = Math.max(...lines.map(line => line.length))
    const border = '*'.repeat(maxLength + 4)
    
    return [
      `/*!`,
      ` * ${border}`,
      ...lines.map(line => ` * ${line.padEnd(maxLength)} *`),
      ` * ${border}`,
      ` */`
    ].join('\n')
  } catch (error) {
    return `/*! Built with Rollup | ${new Date().toISOString()} */`
  }
}

// 外部依赖
const external = [
  // Node.js 内置模块
  'path', 'fs', 'url', 'process', 'module', 'os', 'util', 'events', 'stream', 'child_process',
  // 第三方依赖
  'rollup', 'rolldown', 'chalk', 'commander', 'ora', 'fast-glob', 'fs-extra', 'glob', 
  'gzip-size', 'pretty-bytes', 'tslib', 'typescript', 'jiti', 'rimraf',
  // 插件
  /@rollup\/plugin-.*/,
  /@vitejs\/plugin-.*/,
  /rollup-plugin-.*/,
  /unplugin-.*/,
  // CSS 处理
  'autoprefixer', 'clean-css', 'postcss', 'less', 'cssnano',
  // 工作区依赖
  '@ldesign/kit'
]

// 创建插件列表
function createPlugins() {
  const plugins = [
    nodeResolve({
      preferBuiltins: true,
      extensions: ['.ts', '.js', '.json']
    }),
    commonjs({
      include: /node_modules/
    }),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'src/__tests__/**/*']
    })
  ]

  // 添加压缩插件
  if (MINIFY_CONFIG.enabled) {
    if (MINIFY_CONFIG.level === 'advanced') {
      // 完全压缩
      plugins.push(terser({
        mangle: true,
        compress: {
          drop_console: true,
          drop_debugger: true,
          dead_code: true,
          inline: true
        },
        format: {
          comments: false
        }
      }))
    } else if (MINIFY_CONFIG.level === 'basic') {
      // 基本压缩
      plugins.push(terser({
        mangle: false,
        compress: {
          drop_console: false,
          drop_debugger: true,
          dead_code: true,
          inline: false
        },
        format: {
          comments: 'some'
        }
      }))
    } else if (MINIFY_CONFIG.level === 'whitespace') {
      // 仅压缩空格
      plugins.push(terser({
        mangle: false,
        compress: false,
        format: {
          beautify: false,
          comments: true
        }
      }))
    }
  }

  return plugins
}

export default defineConfig([
  // 主入口 - ESM
  {
    input: 'src/index.ts',
    external,
    plugins: createPlugins(),
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
      banner: generateBanner
    }
  },
  
  // 主入口 - CJS
  {
    input: 'src/index.ts',
    external,
    plugins: createPlugins(),
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
      banner: generateBanner
    }
  }
])
