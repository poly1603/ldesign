#!/usr/bin/env node

/**
 * 样式构建脚本
 * 编译LESS文件为CSS，支持主题和压缩
 */

const fs = require('fs')
const path = require('path')
const less = require('less')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

const srcDir = path.join(__dirname, '../src/styles')
const distDir = path.join(__dirname, '../dist/styles')

// 确保输出目录存在
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

/**
 * 编译LESS文件
 */
async function compileLess(inputFile, outputFile, options = {}) {
  try {
    const lessContent = fs.readFileSync(inputFile, 'utf8')
    
    const result = await less.render(lessContent, {
      filename: inputFile,
      paths: [srcDir],
      compress: options.compress || false,
      sourceMap: options.sourceMap ? {
        sourceMapFileInline: false,
        outputSourceFiles: true
      } : undefined,
      ...options.lessOptions
    })

    let css = result.css

    // 使用PostCSS处理
    if (options.postcss !== false) {
      const plugins = [
        autoprefixer({
          overrideBrowserslist: [
            '> 1%',
            'last 2 versions',
            'not dead',
            'not ie <= 11'
          ]
        })
      ]

      if (options.compress) {
        plugins.push(cssnano({
          preset: ['default', {
            discardComments: { removeAll: true },
            normalizeWhitespace: true,
            minifySelectors: true
          }]
        }))
      }

      const postcssResult = await postcss(plugins).process(css, {
        from: inputFile,
        to: outputFile,
        map: options.sourceMap ? { inline: false } : false
      })

      css = postcssResult.css

      // 写入source map
      if (options.sourceMap && postcssResult.map) {
        fs.writeFileSync(outputFile + '.map', postcssResult.map.toString())
      }
    }

    // 写入CSS文件
    fs.writeFileSync(outputFile, css)
    
    console.log(`✓ 编译完成: ${path.relative(process.cwd(), outputFile)}`)
    
    return { css, map: result.map }
  } catch (error) {
    console.error(`✗ 编译失败: ${inputFile}`)
    console.error(error.message)
    throw error
  }
}

/**
 * 构建所有样式
 */
async function buildStyles() {
  console.log('开始构建样式文件...\n')

  const builds = [
    // 完整版本
    {
      input: path.join(srcDir, 'index.less'),
      output: path.join(distDir, 'tree.css'),
      options: {
        sourceMap: true,
        postcss: true
      }
    },
    // 压缩版本
    {
      input: path.join(srcDir, 'index.less'),
      output: path.join(distDir, 'tree.min.css'),
      options: {
        compress: true,
        sourceMap: true,
        postcss: true
      }
    },
    // 仅基础样式
    {
      input: path.join(srcDir, 'base.less'),
      output: path.join(distDir, 'tree-base.css'),
      options: {
        sourceMap: true,
        postcss: true
      }
    },
    // 仅主题样式
    {
      input: path.join(srcDir, 'themes.less'),
      output: path.join(distDir, 'tree-themes.css'),
      options: {
        sourceMap: true,
        postcss: true
      }
    }
  ]

  try {
    for (const build of builds) {
      await compileLess(build.input, build.output, build.options)
    }

    console.log('\n✓ 所有样式文件构建完成!')
    
    // 输出文件大小信息
    console.log('\n文件大小:')
    builds.forEach(build => {
      const stats = fs.statSync(build.output)
      const size = (stats.size / 1024).toFixed(2)
      console.log(`  ${path.basename(build.output)}: ${size} KB`)
    })

  } catch (error) {
    console.error('\n✗ 构建失败:', error.message)
    process.exit(1)
  }
}

/**
 * 监听文件变化
 */
function watchStyles() {
  console.log('开始监听样式文件变化...\n')
  
  const chokidar = require('chokidar')
  
  const watcher = chokidar.watch(path.join(srcDir, '**/*.less'), {
    ignored: /node_modules/,
    persistent: true
  })

  watcher.on('change', async (filePath) => {
    console.log(`文件变化: ${path.relative(process.cwd(), filePath)}`)
    try {
      await buildStyles()
    } catch (error) {
      console.error('重新构建失败:', error.message)
    }
  })

  watcher.on('ready', () => {
    console.log('监听已启动，等待文件变化...')
  })

  // 初始构建
  buildStyles()
}

// 命令行参数处理
const args = process.argv.slice(2)
const isWatch = args.includes('--watch') || args.includes('-w')
const isHelp = args.includes('--help') || args.includes('-h')

if (isHelp) {
  console.log(`
样式构建脚本

用法:
  node build-styles.js [选项]

选项:
  --watch, -w    监听文件变化并自动重新构建
  --help, -h     显示帮助信息

示例:
  node build-styles.js          # 构建一次
  node build-styles.js --watch  # 监听模式
`)
  process.exit(0)
}

// 执行构建
if (isWatch) {
  watchStyles()
} else {
  buildStyles()
}
