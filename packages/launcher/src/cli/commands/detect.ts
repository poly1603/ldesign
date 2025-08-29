/**
 * 项目检测命令
 */

import chalk from 'chalk'
import { detectProject } from '../../index'

export class DetectCommand {
  async execute(root: string, options: any): Promise<void> {
    try {
      console.log(chalk.cyan('🔍 检测项目类型...'))
      console.log(chalk.gray(`   项目目录: ${root}`))
      
      const startTime = Date.now()
      const result = await detectProject(root)
      const duration = Date.now() - startTime
      
      if (options.json) {
        console.log(JSON.stringify(result, null, 2))
        return
      }
      
      console.log()
      console.log(chalk.green('✅ 项目检测完成!'))
      console.log(chalk.blue(`⏱️  检测耗时: ${duration}ms`))
      console.log()
      console.log(chalk.yellow('📊 检测结果:'))
      console.log(chalk.gray(`   项目类型: ${chalk.white(result.projectType)}`))
      console.log(chalk.gray(`   框架类型: ${chalk.white(result.framework)}`))
      console.log(chalk.gray(`   置信度: ${chalk.white(result.confidence + '%')}`))
      
      if (result.dependencies && Object.keys(result.dependencies).length > 0) {
        console.log(chalk.gray('   主要依赖:'))
        Object.entries(result.dependencies).slice(0, 5).forEach(([name, version]) => {
          console.log(chalk.gray(`     - ${name}: ${version}`))
        })
      }
      
      if (result.detectedFiles && result.detectedFiles.length > 0) {
        console.log(chalk.gray('   特征文件:'))
        result.detectedFiles.slice(0, 5).forEach(file => {
          console.log(chalk.gray(`     - ${file}`))
        })
      }
      
      console.log()
    } catch (error) {
      console.error(chalk.red('❌ 项目检测失败:'))
      console.error(chalk.red(`   ${error instanceof Error ? error.message : String(error)}`))
      process.exit(1)
    }
  }
}
