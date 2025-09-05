/**
 * 控制台 UI 组件演示
 * 展示 @ldesign/kit 的控制台 UI 功能
 */

const {
  ProgressBar,
  LoadingSpinner,
  StatusIndicator,
  MultiProgress,
  ConsoleTheme,
} = require('@ldesign/kit/console')

async function demoThemes() {
  console.log('🎨 主题系统演示\n')

  const themes = ['default', 'minimal', 'colorful']

  for (const themeName of themes) {
    const theme = ConsoleTheme.create(themeName)

    console.log(theme.createTitle(`${themeName.toUpperCase()} 主题`, 1))
    console.log(theme.success('✓ 成功消息'))
    console.log(theme.error('✗ 错误消息'))
    console.log(theme.warning('⚠ 警告消息'))
    console.log(theme.info('ℹ 信息消息'))
    console.log(theme.createSeparator(40, '─'))
    console.log()
  }
}

async function demoSpinners() {
  console.log('🌀 加载动画演示\n')

  const spinnerTypes = [
    { name: 'dots', creator: LoadingSpinner.createDots },
    { name: 'line', creator: LoadingSpinner.createLine },
    { name: 'bounce', creator: LoadingSpinner.createBounce },
    { name: 'circle', creator: LoadingSpinner.createCircle },
    { name: 'arrow', creator: LoadingSpinner.createArrow },
  ]

  for (const { name, creator } of spinnerTypes) {
    console.log(`演示 ${name} 动画:`)

    const spinner = creator(`${name} 加载中...`)
    spinner.start()

    await new Promise(resolve => setTimeout(resolve, 2000))

    spinner.succeed(`${name} 加载完成`)
    console.log()
  }

  // 演示多阶段加载
  console.log('演示多阶段加载:')
  const multiStage = LoadingSpinner.createMultiStage([
    { text: '初始化...', duration: 1000 },
    { text: '加载配置...', duration: 1500 },
    { text: '连接服务器...', duration: 1000 },
    { text: '完成设置...', duration: 500 },
  ])

  multiStage.start()
  await new Promise(resolve => setTimeout(resolve, 4500))
  multiStage.succeed('多阶段加载完成')
  console.log()
}

async function demoProgressBars() {
  console.log('📊 进度条演示\n')

  const progressTypes = [
    { name: '简单进度条', creator: ProgressBar.createSimple },
    { name: '详细进度条', creator: ProgressBar.createDetailed },
    { name: '百分比进度条', creator: ProgressBar.createPercentage },
    { name: '步骤进度条', creator: ProgressBar.createSteps },
  ]

  for (const { name, creator } of progressTypes) {
    console.log(`${name}:`)

    const total = 100
    const progressBar = creator(total)
    progressBar.start()

    for (let i = 0; i <= total; i += 5) {
      progressBar.update(i)
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    progressBar.complete()
    console.log()
  }
}

async function demoStatusIndicator() {
  console.log('📋 状态指示器演示\n')

  const status = StatusIndicator.create({ theme: 'colorful' })

  // 基本状态演示
  console.log('基本状态:')
  status.success('操作成功完成')
  status.error('发生了错误')
  status.warning('这是一个警告')
  status.info('这是一条信息')
  status.loading('正在处理中...')
  status.pending('等待处理...')
  status.skipped('操作已跳过')
  status.custom('自定义状态', '🎉', '#ff6b6b')
  console.log()

  // 状态列表演示
  console.log('状态列表:')
  status.showList('任务执行结果', [
    { message: '编译 TypeScript', type: 'success' },
    { message: '运行单元测试', type: 'success' },
    { message: '代码质量检查', type: 'warning' },
    { message: '构建生产版本', type: 'error' },
    { message: '部署到服务器', type: 'skipped' },
  ])
  console.log()

  // 状态表格演示
  console.log('状态表格:')
  status.showTable(
    ['文件', '状态', '大小', '耗时'],
    [
      [
        { value: 'main.js', type: 'info' },
        { value: '编译成功', type: 'success' },
        { value: '125KB', type: 'info' },
        { value: '1.2s', type: 'info' },
      ],
      [
        { value: 'styles.css', type: 'info' },
        { value: '压缩失败', type: 'error' },
        { value: '45KB', type: 'warning' },
        { value: '0.8s', type: 'info' },
      ],
      [
        { value: 'assets/*', type: 'info' },
        { value: '优化完成', type: 'success' },
        { value: '2.1MB', type: 'info' },
        { value: '3.5s', type: 'info' },
      ],
    ]
  )
  console.log()

  // 进度状态演示
  console.log('进度状态:')
  for (let i = 0; i <= 100; i += 25) {
    status.showProgress(i, 100, '构建进度')
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  console.log()

  // 分组状态演示
  console.log('分组状态:')
  status.showGroup('前端构建', [
    { type: 'success', message: 'TypeScript 编译完成' },
    { type: 'success', message: 'Sass 编译完成' },
    { type: 'warning', message: '发现 3 个 ESLint 警告' },
  ])

  status.showGroup('后端构建', [
    { type: 'success', message: 'API 服务编译完成' },
    { type: 'error', message: '数据库连接测试失败' },
    { type: 'skipped', message: '跳过集成测试' },
  ])

  // 显示摘要
  status.showSummary('构建摘要')
}

async function demoMultiProgress() {
  console.log('🔄 多任务进度演示\n')

  const multiProgress = MultiProgress.createDetailed()
  multiProgress.start()

  // 添加多个任务
  const tasks = [
    { id: 'download1', name: '下载文件1', total: 100 },
    { id: 'download2', name: '下载文件2', total: 150 },
    { id: 'download3', name: '下载文件3', total: 80 },
    { id: 'process', name: '处理数据', total: 200 },
  ]

  tasks.forEach(task => multiProgress.addTask(task))

  // 模拟并行任务执行
  const promises = tasks.map(async (task, index) => {
    // 错开启动时间
    await new Promise(resolve => setTimeout(resolve, index * 500))

    multiProgress.startTask(task.id)

    for (let i = 0; i <= task.total; i++) {
      multiProgress.updateTask(task.id, i)

      // 不同任务有不同的速度
      const delay = 20 + Math.random() * 30
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  })

  await Promise.all(promises)

  const overall = multiProgress.getOverallProgress()
  console.log(`\n所有任务完成！总耗时: ${Math.round(overall.duration / 1000)}s`)
  console.log()
}

async function demoRealWorldScenario() {
  console.log('🌍 真实场景演示 - 项目构建流程\n')

  const status = StatusIndicator.create({ theme: 'colorful' })

  // 1. 初始化阶段
  status.info('开始项目构建...')

  const initSpinner = LoadingSpinner.createDots('初始化构建环境...')
  initSpinner.start()
  await new Promise(resolve => setTimeout(resolve, 2000))
  initSpinner.succeed('构建环境初始化完成')

  // 2. 多任务构建阶段
  const multiProgress = MultiProgress.create({
    showOverall: true,
    showIndividual: true,
    showStatus: false,
  })

  multiProgress.start()

  const buildTasks = [
    { id: 'lint', name: '代码检查', total: 50 },
    { id: 'compile', name: '编译 TypeScript', total: 100 },
    { id: 'bundle', name: '打包资源', total: 80 },
    { id: 'optimize', name: '代码优化', total: 60 },
    { id: 'test', name: '运行测试', total: 120 },
  ]

  buildTasks.forEach(task => multiProgress.addTask(task))

  // 顺序执行某些任务，并行执行其他任务
  // 先执行代码检查
  multiProgress.startTask('lint')
  for (let i = 0; i <= 50; i += 2) {
    multiProgress.updateTask('lint', i)
    await new Promise(resolve => setTimeout(resolve, 40))
  }

  // 并行执行编译和测试
  const parallelTasks = ['compile', 'test'].map(async taskId => {
    const task = buildTasks.find(t => t.id === taskId)
    multiProgress.startTask(taskId)

    for (let i = 0; i <= task.total; i += 3) {
      multiProgress.updateTask(taskId, Math.min(i, task.total))
      await new Promise(resolve => setTimeout(resolve, 30))
    }
  })

  await Promise.all(parallelTasks)

  // 最后执行打包和优化
  for (const taskId of ['bundle', 'optimize']) {
    const task = buildTasks.find(t => t.id === taskId)
    multiProgress.startTask(taskId)

    for (let i = 0; i <= task.total; i += 4) {
      multiProgress.updateTask(taskId, Math.min(i, task.total))
      await new Promise(resolve => setTimeout(resolve, 25))
    }
  }

  // 3. 结果展示
  status.showTable(
    ['任务', '状态', '耗时', '输出'],
    [
      [
        { value: '代码检查', type: 'info' },
        { value: '通过', type: 'success' },
        { value: '2.1s', type: 'info' },
        { value: '0 错误, 3 警告', type: 'warning' },
      ],
      [
        { value: 'TypeScript 编译', type: 'info' },
        { value: '成功', type: 'success' },
        { value: '3.8s', type: 'info' },
        { value: '45 个文件', type: 'info' },
      ],
      [
        { value: '资源打包', type: 'info' },
        { value: '成功', type: 'success' },
        { value: '2.5s', type: 'info' },
        { value: '3 个 chunk', type: 'info' },
      ],
      [
        { value: '代码优化', type: 'info' },
        { value: '成功', type: 'success' },
        { value: '1.9s', type: 'info' },
        { value: '减少 35%', type: 'success' },
      ],
      [
        { value: '单元测试', type: 'info' },
        { value: '成功', type: 'success' },
        { value: '4.2s', type: 'info' },
        { value: '127 个测试', type: 'info' },
      ],
    ]
  )

  const overall = multiProgress.getOverallProgress()

  status.showSummary('构建摘要')
  status.success(`构建完成！总耗时: ${Math.round(overall.duration / 1000)}s`)

  // 4. 部署阶段
  const deploySpinner = LoadingSpinner.createArrow('部署到生产环境...')
  deploySpinner.start()
  await new Promise(resolve => setTimeout(resolve, 3000))
  deploySpinner.succeed('部署完成！🎉')
}

// 主函数
async function main() {
  console.log('🎯 @ldesign/kit 控制台 UI 组件完整演示\n')

  try {
    await demoThemes()
    await demoSpinners()
    await demoProgressBars()
    await demoStatusIndicator()
    await demoMultiProgress()
    await demoRealWorldScenario()

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
  demoThemes,
  demoSpinners,
  demoProgressBars,
  demoStatusIndicator,
  demoMultiProgress,
  demoRealWorldScenario,
}
