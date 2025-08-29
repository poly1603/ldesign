/**
 * 创建项目命令
 */

import chalk from 'chalk'
import path from 'path'
import { createLauncher } from '../../index'
import type { ProjectType } from '../../types'

export class CreateCommand {
  async execute(name: string, options: any): Promise<void> {
    try {
      const projectType = options.type as ProjectType || 'vue3'
      const projectDir = options.dir ? path.resolve(options.dir, name) : path.resolve(name)
      
      console.log(chalk.cyan('🎨 创建新项目...'))
      console.log(chalk.gray(`   项目名称: ${name}`))
      console.log(chalk.gray(`   项目类型: ${projectType}`))
      console.log(chalk.gray(`   项目目录: ${projectDir}`))
      
      const launcher = createLauncher({
        logLevel: options.verbose ? 'info' : options.silent ? 'error' : 'warn',
        mode: 'development'
      })

      const startTime = Date.now()
      await launcher.create(projectDir, projectType)
      const duration = Date.now() - startTime
      
      console.log()
      console.log(chalk.green('✅ 项目创建成功!'))
      console.log(chalk.blue(`⏱️  创建耗时: ${duration}ms`))
      console.log(chalk.blue(`📁 项目目录: ${projectDir}`))
      console.log()
      console.log(chalk.yellow('📋 下一步操作:'))
      console.log(chalk.gray(`   cd ${name}`))
      console.log(chalk.gray('   npm install'))
      console.log(chalk.gray('   npm run dev'))
      console.log()
    } catch (error) {
      console.error(chalk.red('❌ 项目创建失败:'))
      console.error(chalk.red(`   ${error instanceof Error ? error.message : String(error)}`))
      process.exit(1)
    }
  }
}
