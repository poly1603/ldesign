/**
 * 简化的 Rolldown 配置文件 - 用于测试
 */

import fs from 'fs'

// 压缩配置
const MINIFY_CONFIG = {
  enabled: process.env.NODE_ENV === 'production' || process.env.MINIFY === 'true',
  level: process.env.MINIFY_LEVEL || 'basic' // none, whitespace, basic, advanced
}

// Banner 生成函数 - 同步版本用于 Rolldown
function generateBanner() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))

    const buildTime = new Date().toISOString()
    const lines = [
      `${packageJson.name} v${packageJson.version}`,
      `Built with Rolldown v1.0.0-beta.35`,
      `Build time: ${buildTime}`,
      `Build mode: production`
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
    return `/*! Built with Rolldown | ${new Date().toISOString()} */`
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

// 创建基础配置
function createBaseConfig(format, filename) {
  return {
    input: 'src/index.ts',
    external,
    output: {
      file: `dist/${filename}`,
      format,
      sourcemap: true,
      inlineDynamicImports: true,
      banner: generateBanner
    },
    resolve: {
      extensions: ['.ts', '.js', '.json']
    },
    // Rolldown 内置压缩支持
    minify: MINIFY_CONFIG.enabled ? {
      // 根据压缩级别设置不同的选项
      mangle: MINIFY_CONFIG.level === 'advanced',
      compress: MINIFY_CONFIG.level !== 'whitespace',
      format: {
        comments: MINIFY_CONFIG.level === 'advanced' ? false : 'some'
      }
    } : false
  }
}

export default [
  // 主入口 - ESM
  createBaseConfig('es', 'index.js'),

  // 主入口 - CJS
  createBaseConfig('cjs', 'index.cjs')
]
