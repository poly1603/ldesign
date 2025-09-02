/**
 * 构建命令
 */

import chalk from 'chalk'
import { createLauncher } from '../../index'
import type { BuildOptions } from '../../types'

export class BuildCommand {
  async execute(root: string, options: any): Promise<void> {
    try {
      console.log(chalk.cyan('🔨 开始构建项目...'))
      console.log(chalk.gray(`   项目目录: ${root}`))
      console.log(chalk.gray(`   输出目录: ${options.outDir || 'dist'}`))

      const launcher = createLauncher({
        logLevel: options.verbose ? 'info' : options.silent ? 'error' : 'warn',
        mode: options.mode || 'production'
      })

      const buildOptions: BuildOptions = {
        outDir: options.outDir || 'dist',
        mode: options.mode || 'production',
        minify: options.minify !== false,
        sourcemap: options.sourcemap === true
      }

      const startTime = Date.now()
      const result = await launcher.build(root, buildOptions)
      const duration = Date.now() - startTime

      console.log()
      console.log(chalk.green('✅ 项目构建成功!'))
      console.log(chalk.blue(`📦 构建耗时: ${duration}ms`))
      console.log(chalk.blue(`📁 输出目录: ${buildOptions.outDir}`))

      if (result.outputFiles && result.outputFiles.length > 0) {
        console.log(chalk.gray('   输出文件:'))
        result.outputFiles.forEach(file => {
          console.log(chalk.gray(`   - ${file}`))
        })
      }

      console.log()
    } catch (error) {
      console.error(chalk.red('❌ 项目构建失败:'))
      console.error(chalk.red(`   ${error instanceof Error ? error.message : String(error)}`))
      process.exit(1)
    }
  }
}
