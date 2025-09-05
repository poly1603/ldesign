# 控制台 UI 组件

@ldesign/kit 提供了丰富的控制台 UI 组件，包括进度条、加载动画、状态指示器和多任务进度管理器，支持自定义主题和样式。

## 核心组件

### 进度条 (ProgressBar)

进度条组件提供多种样式的进度显示功能：

```typescript
import { ProgressBar } from '@ldesign/kit/console'

// 创建简单进度条
const progressBar = ProgressBar.createSimple(100)

// 启动进度条
progressBar.start()

// 更新进度
for (let i = 0; i <= 100; i++) {
  progressBar.update(i)
  await new Promise(resolve => setTimeout(resolve, 50))
}

// 完成进度条
progressBar.complete()
```

#### 进度条类型

```typescript
// 简单进度条
const simple = ProgressBar.createSimple(100)

// 详细进度条
const detailed = ProgressBar.createDetailed(100)

// 百分比进度条
const percentage = ProgressBar.createPercentage(100)

// 步骤式进度条
const steps = ProgressBar.createSteps(10)

// 自定义进度条
const custom = ProgressBar.create({
  total: 100,
  format: '{bar} {percentage}% | {value}/{total} | ETA: {eta}s',
  theme: 'colorful',
  showEta: true,
  showRate: true,
})
```

### 加载动画 (LoadingSpinner)

加载动画组件提供多种样式的加载效果：

```typescript
import { LoadingSpinner } from '@ldesign/kit/console'

// 创建简单加载动画
const spinner = LoadingSpinner.createSimple('加载中...')

// 启动动画
spinner.start()

// 模拟异步操作
setTimeout(() => {
  spinner.succeed('加载完成！')
}, 3000)
```

#### 动画类型

```typescript
// 点状动画
const dots = LoadingSpinner.createDots('处理中...')

// 线条动画
const line = LoadingSpinner.createLine('工作中...')

// 弹跳动画
const bounce = LoadingSpinner.createBounce('加载中...')

// 圆形动画
const circle = LoadingSpinner.createCircle('请稍候...')

// 箭头动画
const arrow = LoadingSpinner.createArrow('处理中...')

// 自定义动画
const custom = LoadingSpinner.createCustom(['🌍', '🌎', '🌏'], 200, '地球转动中...')

// 主题化动画
const themed = LoadingSpinner.createThemed('colorful', '彩色加载中...')
```

#### 多阶段加载

```typescript
const multiStage = LoadingSpinner.createMultiStage([
  { text: '初始化...', duration: 1000 },
  { text: '加载配置...', duration: 2000 },
  { text: '连接服务器...', duration: 1500 },
  { text: '完成设置...', duration: 500 },
])

multiStage.start()
```

### 状态指示器 (StatusIndicator)

状态指示器提供成功、失败、警告、信息等状态的可视化显示：

```typescript
import { StatusIndicator } from '@ldesign/kit/console'

const status = StatusIndicator.create()

// 显示不同状态
status.success('操作成功完成')
status.error('发生错误')
status.warning('警告信息')
status.info('提示信息')
status.loading('正在处理...')
status.pending('等待中...')
status.skipped('已跳过')

// 自定义状态
status.custom('自定义消息', '🎉', '#ff6b6b')
```

#### 高级功能

```typescript
// 显示状态列表
status.showList('任务列表', [
  { message: '任务1', type: 'success' },
  { message: '任务2', type: 'error' },
  { message: '任务3', type: 'warning' },
])

// 显示状态表格
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
  ]
)

// 显示进度状态
status.showProgress(75, 100, '构建进度')

// 显示分组状态
status.showGroup('构建任务', [
  { type: 'success', message: '编译完成' },
  { type: 'success', message: '打包完成' },
  { type: 'error', message: '测试失败' },
])

// 显示摘要
status.showSummary('构建摘要')
```

### 多任务进度 (MultiProgress)

多任务进度管理器支持并行任务的进度显示和管理：

```typescript
import { MultiProgress } from '@ldesign/kit/console'

const multiProgress = MultiProgress.create({
  showOverall: true,
  showIndividual: true,
  showStatus: true,
})

// 启动多任务进度
multiProgress.start()

// 添加任务
multiProgress.addTask({
  id: 'task1',
  name: '下载文件1',
  total: 100,
})

multiProgress.addTask({
  id: 'task2',
  name: '下载文件2',
  total: 200,
})

// 启动任务
multiProgress.startTask('task1')
multiProgress.startTask('task2')

// 更新任务进度
for (let i = 0; i <= 100; i++) {
  multiProgress.updateTask('task1', i)
  await new Promise(resolve => setTimeout(resolve, 50))
}

for (let i = 0; i <= 200; i++) {
  multiProgress.updateTask('task2', i)
  await new Promise(resolve => setTimeout(resolve, 25))
}
```

#### 任务管理

```typescript
// 获取任务信息
const task = multiProgress.getTask('task1')
console.log('任务状态:', task?.status)

// 获取所有任务
const allTasks = multiProgress.getAllTasks()

// 获取指定状态的任务
const runningTasks = multiProgress.getTasksByStatus('running')
const completedTasks = multiProgress.getTasksByStatus('completed')

// 获取整体进度
const overall = multiProgress.getOverallProgress()
console.log('整体进度:', overall.percentage + '%')

// 任务失败
multiProgress.failTask('task1', new Error('网络错误'))

// 取消任务
multiProgress.cancelTask('task2')
```

## 主题系统 (ConsoleTheme)

主题系统提供了丰富的样式自定义功能：

```typescript
import { ConsoleTheme } from '@ldesign/kit/console'

// 创建主题
const theme = ConsoleTheme.create('colorful')

// 获取可用主题
const themes = theme.getAvailableThemes()
console.log('可用主题:', themes) // ['default', 'minimal', 'colorful']

// 切换主题
theme.setTheme('minimal')

// 使用主题颜色
console.log(theme.success('成功消息'))
console.log(theme.error('错误消息'))
console.log(theme.warning('警告消息'))
console.log(theme.info('信息消息'))
```

### 预定义主题

#### Default 主题

- 标准的控制台样式
- 支持完整的颜色和符号
- 适合大多数使用场景

#### Minimal 主题

- 简化的样式
- 使用基本的 ASCII 字符
- 适合兼容性要求高的环境

#### Colorful 主题

- 丰富的颜色和 Emoji
- 现代化的视觉效果
- 适合现代终端环境

### 自定义主题

```typescript
// 创建自定义主题
const customTheme = ConsoleTheme.createCustomTheme('my-theme', 'default', {
  colors: {
    primary: '#ff6b6b',
    success: '#51cf66',
    error: '#ff6b6b',
    warning: '#ffd43b',
  },
  symbols: {
    success: '✨',
    error: '💥',
    warning: '⚡',
    info: '💡',
  },
})

// 添加自定义主题
theme.addTheme('my-theme', customTheme)
theme.setTheme('my-theme')
```

### 主题工具函数

```typescript
// 创建进度条
const progressBar = theme.createProgressBar(75, 100, 40)
console.log(progressBar)

// 格式化进度信息
const progressInfo = theme.formatProgress(75, 100, {
  showPercentage: true,
  showEta: true,
  eta: 30,
})
console.log(progressInfo)

// 创建分隔线
console.log(theme.createSeparator(50, '='))

// 创建标题
console.log(theme.createTitle('主标题', 1))
console.log(theme.createTitle('副标题', 2))

// 创建列表项
console.log(theme.createListItem('列表项1'))
console.log(theme.createListItem('子项', 1))

// 创建状态徽章
console.log(theme.createBadge('成功', 'success'))
console.log(theme.createBadge('失败', 'error'))
```

## 使用示例

### 文件下载进度

```typescript
import { ProgressBar, StatusIndicator } from '@ldesign/kit/console'

async function downloadFile(url: string, filename: string) {
  const status = StatusIndicator.create()
  const progressBar = ProgressBar.createDetailed(100)

  status.info(`开始下载: ${filename}`)
  progressBar.start()

  try {
    // 模拟下载过程
    for (let i = 0; i <= 100; i++) {
      progressBar.update(i, {
        filename,
        speed: `${Math.random() * 10 + 1}MB/s`,
      })
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    progressBar.complete()
    status.success(`下载完成: ${filename}`)
  } catch (error) {
    progressBar.stop()
    status.error(`下载失败: ${error.message}`)
  }
}
```

### 构建任务管理

```typescript
import { MultiProgress, StatusIndicator } from '@ldesign/kit/console'

async function buildProject() {
  const multiProgress = MultiProgress.createDetailed()
  const status = StatusIndicator.create()

  status.info('开始构建项目...')
  multiProgress.start()

  // 添加构建任务
  const tasks = [
    { id: 'compile', name: '编译 TypeScript', total: 50 },
    { id: 'bundle', name: '打包资源', total: 30 },
    { id: 'optimize', name: '优化代码', total: 20 },
    { id: 'test', name: '运行测试', total: 40 },
  ]

  tasks.forEach(task => multiProgress.addTask(task))

  // 并行执行任务
  const promises = tasks.map(async task => {
    multiProgress.startTask(task.id)

    for (let i = 0; i <= task.total; i++) {
      multiProgress.updateTask(task.id, i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  })

  await Promise.all(promises)

  const overall = multiProgress.getOverallProgress()
  status.success(`构建完成！总耗时: ${Math.round(overall.duration / 1000)}s`)
}
```

### 交互式安装向导

```typescript
import { LoadingSpinner, StatusIndicator, ProgressBar } from '@ldesign/kit/console'

async function installPackages(packages: string[]) {
  const status = StatusIndicator.create()
  const spinner = LoadingSpinner.createDots('检查依赖...')

  // 检查阶段
  spinner.start()
  await new Promise(resolve => setTimeout(resolve, 2000))
  spinner.succeed('依赖检查完成')

  // 安装阶段
  const progressBar = ProgressBar.createDetailed(packages.length)
  progressBar.start()

  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i]
    status.loading(`安装 ${pkg}...`)

    // 模拟安装过程
    await new Promise(resolve => setTimeout(resolve, 1000))

    progressBar.update(i + 1)
    status.success(`${pkg} 安装完成`)
  }

  progressBar.complete()
  status.showSummary('安装摘要')
}
```

## 最佳实践

### 1. 选择合适的组件

- **短时间操作**：使用 LoadingSpinner
- **可量化进度**：使用 ProgressBar
- **多个并行任务**：使用 MultiProgress
- **状态反馈**：使用 StatusIndicator

### 2. 主题一致性

```typescript
// 在应用中统一使用一个主题
const theme = ConsoleTheme.create('colorful')

// 将主题传递给所有组件
const progressBar = ProgressBar.create({ theme: 'colorful' })
const spinner = LoadingSpinner.create({ theme: 'colorful' })
const status = StatusIndicator.create({ theme: 'colorful' })
```

### 3. 错误处理

```typescript
const status = StatusIndicator.create()

try {
  // 执行操作
  status.loading('执行操作...')
  await someOperation()
  status.success('操作成功')
} catch (error) {
  status.error(`操作失败: ${error.message}`)
  // 显示详细错误信息
  if (error.details) {
    status.showList(
      '错误详情',
      error.details.map(detail => ({
        message: detail,
        type: 'error',
      }))
    )
  }
}
```

### 4. 性能优化

```typescript
// 避免过于频繁的更新
let lastUpdate = 0
const updateThrottle = 100 // 100ms

function updateProgress(current: number, total: number) {
  const now = Date.now()
  if (now - lastUpdate > updateThrottle) {
    progressBar.update(current)
    lastUpdate = now
  }
}
```
