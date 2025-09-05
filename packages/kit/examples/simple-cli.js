#!/usr/bin/env node

/**
 * 简单的 CLI 示例
 * 展示如何使用 @ldesign/kit 创建一个完整的 CLI 工具
 */

const path = require('node:path')
const { StatusIndicator } = require('@ldesign/kit/console')
const { ScaffoldManager, CliBuilder } = require('@ldesign/kit/scaffold')

async function createCLI() {
  const status = StatusIndicator.create({ theme: 'colorful' })

  try {
    // 创建脚手架管理器
    const scaffold = new ScaffoldManager({
      name: 'simple-cli',
      version: '1.0.0',
      description: '简单的项目脚手架工具',
      workingDir: process.cwd(),
      configDir: '.simple-cli',
      templatesDir: path.join(__dirname, 'templates'),
      pluginsDir: path.join(__dirname, 'plugins'),
      environments: ['development', 'production', 'staging', 'test'],
      defaultEnvironment: 'development',
      enableHotReload: true,
      enableCache: true,
    })

    // 初始化脚手架
    status.info('初始化脚手架系统...')
    await scaffold.initialize()
    status.success('脚手架系统初始化完成')

    // 创建 CLI 构建器
    const cli = new CliBuilder({
      name: 'simple-cli',
      version: '1.0.0',
      description: '简单的项目脚手架工具',
      scaffoldManager: scaffold,
    })

    // 添加自定义命令
    const cliInstance = cli.getCli()

    // 添加版本信息命令
    cliInstance.command('version', '显示版本信息').action(() => {
      status.info(`simple-cli v1.0.0`)
      status.info(`基于 @ldesign/kit 构建`)
    })

    // 添加状态检查命令
    cliInstance.command('status', '显示系统状态').action(async () => {
      status.info('检查系统状态...')

      const templates = await scaffold.getTemplates()
      const plugins = await scaffold.getPlugins()
      const environments = scaffold.getEnvironments()
      const currentEnv = scaffold.getCurrentEnvironment()

      status.showTable(
        ['项目', '数量', '状态'],
        [
          [
            { value: '模板', type: 'info' },
            { value: templates.length.toString(), type: 'info' },
            {
              value: templates.length > 0 ? '可用' : '无',
              type: templates.length > 0 ? 'success' : 'warning',
            },
          ],
          [
            { value: '插件', type: 'info' },
            { value: plugins.length.toString(), type: 'info' },
            {
              value: plugins.length > 0 ? '可用' : '无',
              type: plugins.length > 0 ? 'success' : 'warning',
            },
          ],
          [
            { value: '环境', type: 'info' },
            { value: environments.length.toString(), type: 'info' },
            { value: '已配置', type: 'success' },
          ],
        ]
      )

      status.info(`当前环境: ${currentEnv}`)
    })

    // 添加清理命令
    cliInstance.command('clean', '清理缓存和临时文件').action(async () => {
      status.loading('清理中...')

      // 模拟清理过程
      await new Promise(resolve => setTimeout(resolve, 2000))

      status.success('清理完成')
    })

    // 解析命令行参数
    cli.parse()
  } catch (error) {
    status.error(`CLI 创建失败: ${error.message}`)
    process.exit(1)
  }
}

// 如果直接运行此文件
if (require.main === module) {
  createCLI()
}

module.exports = { createCLI }
