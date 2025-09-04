#!/usr/bin/env node

/**
 * LDesign Builder CLI - Command Line Interface
 * 智能前端库打包工具命令行接口
 */

import { Command } from 'commander'
import chalk from 'chalk'
import { VueBuilder } from '../vue-builder.js'
import { SimpleBuilder } from '../simple-builder.js'
import { resolve, join, dirname } from 'path'
import { existsSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'

const program = new Command()

// 读取版本信息
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJsonPath = resolve(join(__dirname, '../../package.json'))
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

program
  .name('ldesign-builder')
  .description('智能前端库打包工具 - 零配置多格式输出解决方案')
  .version(packageJson.version)

program
  .option('-v, --vue', '启用 Vue SFC 支持')
  .option('-r, --react', '启用 React/JSX 支持')
  .option('-w, --watch', '监听模式')
  .option('-d, --dev', '开发模式（不压缩）')
  .option('--minify', '启用压缩（默认：生产模式启用）')
  .option('--sourcemap', '生成 sourcemap 文件')
  .option('--clean', '构建前清理输出目录')
  .option('--cwd <path>', '工作目录', process.cwd())
  .action(async (options) => {
    try {
      const cwd = resolve(options.cwd)
      
      console.log(chalk.blue('🚀 LDesign Builder'))
      console.log(chalk.gray(`📁 工作目录: ${cwd}`))
      
      // 检查 package.json 是否存在
      const packageJsonPath = join(cwd, 'package.json')
      if (!existsSync(packageJsonPath)) {
        console.error(chalk.red('❌ 未找到 package.json 文件'))
        process.exit(1)
      }
      
      // 构建选项
      const buildOptions = {
        root: cwd,
        watch: options.watch,
        dev: options.dev,
        minify: options.minify ?? !options.dev,
        sourcemap: options.sourcemap ?? options.dev,
        clean: options.clean ?? true
      }
      
      // 选择构建器
      let builder
      if (options.vue) {
        console.log(chalk.green('🔧 使用 Vue Builder (支持 SFC)'))
        builder = new VueBuilder({ ...buildOptions, enableVue: true })
      } else if (options.react) {
        console.log(chalk.green('🔧 使用 Simple Builder (React/JSX)'))
        builder = new SimpleBuilder(buildOptions)
      } else {
        console.log(chalk.green('🔧 使用 Simple Builder (TypeScript)'))
        builder = new SimpleBuilder(buildOptions)
      }
      
      // 执行构建
      await builder.build()
      
      console.log(chalk.green('✅ 构建完成！'))
      
    } catch (error: unknown) {
      console.error(chalk.red('❌ 构建失败:'))
      console.error(chalk.red(error instanceof Error ? error.message : String(error)))
      if (options.debug && error instanceof Error) {
        console.error(error.stack)
      }
      process.exit(1)
    }
  })

export async function runCli() {
  await program.parseAsync(process.argv)
}

// 如果直接运行此文件
if (__filename === process.argv[1]) {
  runCli().catch((error) => {
    console.error(chalk.red('CLI Error:'), error)
    process.exit(1)
  })
}
