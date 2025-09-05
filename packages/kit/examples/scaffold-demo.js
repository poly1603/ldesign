/**
 * 脚手架系统演示
 * 展示如何使用 @ldesign/kit 的脚手架功能
 */

const path = require('node:path')

const {
  ProgressBar,
  LoadingSpinner,
  StatusIndicator,
  MultiProgress,
  ConsoleTheme,
} = require('@ldesign/kit/console')

const {
  ScaffoldManager,
  TemplateManager,
  PluginManager,
  EnvironmentManager,
  CliBuilder,
} = require('@ldesign/kit/scaffold')

async function demoScaffoldSystem() {
  console.log('🚀 脚手架系统演示\n')

  // 创建状态指示器
  const status = StatusIndicator.create({ theme: 'colorful' })

  status.info('初始化脚手架系统...')

  try {
    // 1. 创建脚手架管理器
    const scaffold = new ScaffoldManager({
      name: 'demo-cli',
      version: '1.0.0',
      description: '演示脚手架工具',
      workingDir: process.cwd(),
      configDir: '.scaffold-demo',
      templatesDir: path.join(__dirname, 'templates'),
      pluginsDir: path.join(__dirname, 'plugins'),
      environments: ['development', 'production', 'staging', 'test'],
      defaultEnvironment: 'development',
    })

    // 2. 初始化脚手架
    const spinner = LoadingSpinner.createDots('初始化中...')
    spinner.start()

    await scaffold.initialize()

    spinner.succeed('脚手架初始化完成')

    // 3. 演示环境管理
    status.info('演示环境管理功能')

    const envManager = scaffold.getEnvironmentManager()

    // 设置环境变量
    envManager.setEnvironmentVariable('API_URL', 'http://localhost:3000/api', 'development')
    envManager.setEnvironmentVariable('API_URL', 'https://api.example.com', 'production')
    envManager.setEnvironmentVariable('DEBUG', true, 'development')
    envManager.setEnvironmentVariable('DEBUG', false, 'production')

    // 显示环境信息
    const environments = envManager.getAvailableEnvironments()
    const currentEnv = envManager.getCurrentEnvironment()

    status.showList('环境配置', [
      { message: `当前环境: ${currentEnv}`, type: 'info' },
      { message: `可用环境: ${environments.join(', ')}`, type: 'info' },
    ])

    // 4. 演示模板管理
    status.info('演示模板管理功能')

    const templateManager = scaffold.getTemplateManager()

    // 模拟创建模板
    await createDemoTemplate()

    const templates = await templateManager.getTemplates()
    if (templates.length > 0) {
      status.showList(
        '可用模板',
        templates.map(template => ({
          message: `${template.name} - ${template.description}`,
          type: 'success',
        }))
      )
    } else {
      status.warning('没有找到可用的模板')
    }

    // 5. 演示插件管理
    status.info('演示插件管理功能')

    const pluginManager = scaffold.getPluginManager()

    // 模拟创建插件
    await createDemoPlugin()

    const plugins = await pluginManager.getPlugins()
    if (plugins.length > 0) {
      status.showList(
        '可用插件',
        plugins.map(plugin => ({
          message: `${plugin.name} - ${plugin.description}`,
          type: 'success',
        }))
      )
    } else {
      status.warning('没有找到可用的插件')
    }

    // 6. 演示项目创建（模拟）
    status.info('演示项目创建流程')

    await demoProjectCreation()

    status.success('脚手架系统演示完成！')
  } catch (error) {
    status.error(`演示失败: ${error.message}`)
    console.error(error)
  }
}

async function demoConsoleUI() {
  console.log('\n🎨 控制台 UI 组件演示\n')

  const status = StatusIndicator.create({ theme: 'colorful' })

  // 1. 演示主题系统
  status.info('演示主题系统')

  const theme = ConsoleTheme.create('colorful')
  console.log(theme.createTitle('主题演示', 1))
  console.log(theme.success('成功消息'))
  console.log(theme.error('错误消息'))
  console.log(theme.warning('警告消息'))
  console.log(theme.info('信息消息'))
  console.log(theme.createSeparator(50, '─'))

  // 2. 演示加载动画
  status.info('演示加载动画')

  const spinner = LoadingSpinner.createDots('加载中...')
  spinner.start()
  await new Promise(resolve => setTimeout(resolve, 2000))
  spinner.succeed('加载完成')

  // 3. 演示进度条
  status.info('演示进度条')

  const progressBar = ProgressBar.createDetailed(100)
  progressBar.start()

  for (let i = 0; i <= 100; i += 5) {
    progressBar.update(i)
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  progressBar.complete()

  // 4. 演示多任务进度
  status.info('演示多任务进度')

  const multiProgress = MultiProgress.createDetailed()
  multiProgress.start()

  // 添加任务
  const tasks = [
    { id: 'task1', name: '任务1', total: 50 },
    { id: 'task2', name: '任务2', total: 30 },
    { id: 'task3', name: '任务3', total: 70 },
  ]

  tasks.forEach(task => multiProgress.addTask(task))

  // 并行执行任务
  const promises = tasks.map(async task => {
    multiProgress.startTask(task.id)

    for (let i = 0; i <= task.total; i += 2) {
      multiProgress.updateTask(task.id, i)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  })

  await Promise.all(promises)

  // 5. 演示状态指示器功能
  status.info('演示状态指示器功能')

  status.showTable(
    ['任务', '状态', '耗时'],
    [
      [
        { value: '编译', type: 'info' },
        { value: '成功', type: 'success' },
        { value: '2.3s', type: 'info' },
      ],
      [
        { value: '测试', type: 'info' },
        { value: '失败', type: 'error' },
        { value: '1.8s', type: 'info' },
      ],
      [
        { value: '打包', type: 'info' },
        { value: '成功', type: 'success' },
        { value: '5.1s', type: 'info' },
      ],
    ]
  )

  status.showSummary('演示摘要')
}

async function demoProjectCreation() {
  const multiProgress = MultiProgress.create({
    showOverall: true,
    showIndividual: true,
    showStatus: false,
  })

  multiProgress.start()

  // 模拟项目创建步骤
  const steps = [
    { id: 'validate', name: '验证参数', total: 10 },
    { id: 'template', name: '渲染模板', total: 50 },
    { id: 'files', name: '创建文件', total: 30 },
    { id: 'install', name: '安装依赖', total: 100 },
    { id: 'plugins', name: '应用插件', total: 20 },
  ]

  steps.forEach(step => multiProgress.addTask(step))

  // 顺序执行步骤
  for (const step of steps) {
    multiProgress.startTask(step.id)

    for (let i = 0; i <= step.total; i += Math.ceil(step.total / 10)) {
      multiProgress.updateTask(step.id, Math.min(i, step.total))
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const overall = multiProgress.getOverallProgress()
  console.log(`\n项目创建完成！总耗时: ${Math.round(overall.duration / 1000)}s`)
}

async function createDemoTemplate() {
  // 这里只是模拟，实际应用中会创建真实的模板文件
  console.log('  创建演示模板...')
}

async function createDemoPlugin() {
  // 这里只是模拟，实际应用中会创建真实的插件文件
  console.log('  创建演示插件...')
}

async function demoCLIBuilder() {
  console.log('\n⚡ CLI 构建器演示\n')

  const status = StatusIndicator.create({ theme: 'colorful' })

  status.info('CLI 构建器功能演示')

  // 创建脚手架管理器
  const scaffold = new ScaffoldManager({
    name: 'demo-cli',
    version: '1.0.0',
  })

  // 创建 CLI 构建器
  const cli = new CliBuilder({
    name: 'demo-cli',
    version: '1.0.0',
    description: '演示 CLI 工具',
    scaffoldManager: scaffold,
  })

  status.showList('可用命令', [
    { message: 'create <project-name> - 创建新项目', type: 'info' },
    { message: 'list [type] - 列出资源', type: 'info' },
    { message: 'env [action] - 环境管理', type: 'info' },
    { message: 'plugin <action> - 插件管理', type: 'info' },
    { message: 'config [action] - 配置管理', type: 'info' },
    { message: 'info - 显示系统信息', type: 'info' },
  ])

  status.info('CLI 构建器演示完成')
}

// 主函数
async function main() {
  try {
    console.log('🎯 @ldesign/kit 新功能演示\n')

    // 演示脚手架系统
    await demoScaffoldSystem()

    // 演示控制台 UI 组件
    await demoConsoleUI()

    // 演示 CLI 构建器
    await demoCLIBuilder()

    console.log('\n✨ 所有演示完成！')
  } catch (error) {
    console.error('演示过程中发生错误:', error)
    process.exit(1)
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main()
}

module.exports = {
  demoScaffoldSystem,
  demoConsoleUI,
  demoCLIBuilder,
}
