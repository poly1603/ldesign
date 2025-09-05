# Inquirer 交互询问

Inquirer 模块提供了用户输入和选择界面，支持多种输入类型、验证和自动完成功能，帮助构建交互式命令行应用。

## 导入方式

```typescript
// 完整导入
import { InquirerManager, InquirerUtils } from '@ldesign/kit'

// 按需导入
import { InquirerManager } from '@ldesign/kit/inquirer'

// 单独导入
import { InquirerManager, InquirerUtils } from '@ldesign/kit'
```

## InquirerManager

交互询问管理器类，提供完整的用户交互功能。

### 创建实例

#### `create(options?: InquirerOptions): InquirerManager`

创建询问器实例。

```typescript
// 默认配置
const inquirer = InquirerManager.create()

// 自定义配置
const inquirer = InquirerManager.create({
  theme: 'default', // 主题
  clearPromptOnDone: true, // 完成后清除提示
  prefix: '?', // 提示前缀
  suffix: ':', // 提示后缀
  pageSize: 10, // 列表页面大小
  loop: true, // 列表循环
})
```

### 文本输入

#### `input(options: InputOptions): Promise<string>`

文本输入。

```typescript
// 基本输入
const name = await inquirer.input({
  message: '请输入您的姓名:',
})

// 带默认值
const email = await inquirer.input({
  message: '请输入邮箱地址:',
  default: 'user@example.com',
})

// 带验证
const username = await inquirer.input({
  message: '请输入用户名:',
  validate: input => {
    if (input.length < 3) {
      return '用户名至少需要3个字符'
    }
    if (!/^[a-zA-Z0-9_]+$/.test(input)) {
      return '用户名只能包含字母、数字和下划线'
    }
    return true
  },
})

// 带转换
const port = await inquirer.input({
  message: '请输入端口号:',
  default: '3000',
  transform: input => parseInt(input),
  validate: input => {
    const port = parseInt(input)
    return port > 0 && port < 65536 ? true : '端口号必须在1-65535之间'
  },
})
```

### 密码输入

#### `password(options: PasswordOptions): Promise<string>`

密码输入。

```typescript
// 基本密码输入
const password = await inquirer.password({
  message: '请输入密码:',
})

// 自定义掩码
const secret = await inquirer.password({
  message: '请输入密钥:',
  mask: '*',
})

// 带验证
const newPassword = await inquirer.password({
  message: '请输入新密码:',
  validate: input => {
    if (input.length < 8) {
      return '密码至少需要8个字符'
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(input)) {
      return '密码必须包含大小写字母和数字'
    }
    return true
  },
})

// 确认密码
const confirmPassword = await inquirer.password({
  message: '请确认密码:',
  validate: input => {
    return input === newPassword ? true : '两次密码输入不一致'
  },
})
```

### 确认询问

#### `confirm(options: ConfirmOptions): Promise<boolean>`

确认询问。

```typescript
// 基本确认
const confirmed = await inquirer.confirm({
  message: '确定要继续吗?',
})

// 带默认值
const shouldSave = await inquirer.confirm({
  message: '是否保存更改?',
  default: true,
})

// 自定义选项文本
const deleteConfirm = await inquirer.confirm({
  message: '确定要删除这个文件吗?',
  default: false,
  transformer: answer => (answer ? '是的，删除' : '不，保留'),
})
```

### 单选列表

#### `select<T>(options: SelectOptions<T>): Promise<T>`

单选列表。

```typescript
// 基本选择
const framework = await inquirer.select({
  message: '选择前端框架:',
  choices: [
    { name: 'React', value: 'react' },
    { name: 'Vue', value: 'vue' },
    { name: 'Angular', value: 'angular' },
    { name: 'Svelte', value: 'svelte' },
  ],
})

// 带描述
const database = await inquirer.select({
  message: '选择数据库:',
  choices: [
    {
      name: 'PostgreSQL',
      value: 'postgresql',
      description: '功能强大的开源关系型数据库',
    },
    {
      name: 'MySQL',
      value: 'mysql',
      description: '流行的开源关系型数据库',
    },
    {
      name: 'MongoDB',
      value: 'mongodb',
      description: '灵活的文档型数据库',
    },
  ],
})

// 带分组
const tool = await inquirer.select({
  message: '选择开发工具:',
  choices: [
    { type: 'separator', line: '--- 编辑器 ---' },
    { name: 'VS Code', value: 'vscode' },
    { name: 'WebStorm', value: 'webstorm' },
    { type: 'separator', line: '--- 终端 ---' },
    { name: 'iTerm2', value: 'iterm2' },
    { name: 'Windows Terminal', value: 'wt' },
  ],
})
```

### 多选列表

#### `multiSelect<T>(options: MultiSelectOptions<T>): Promise<T[]>`

多选列表。

```typescript
// 基本多选
const features = await inquirer.multiSelect({
  message: '选择需要的功能:',
  choices: [
    { name: 'TypeScript', value: 'typescript' },
    { name: 'ESLint', value: 'eslint' },
    { name: 'Prettier', value: 'prettier' },
    { name: 'Jest', value: 'jest' },
    { name: 'Husky', value: 'husky' },
  ],
})

// 带默认选择
const plugins = await inquirer.multiSelect({
  message: '选择插件:',
  choices: [
    { name: 'Router', value: 'router', checked: true },
    { name: 'State Management', value: 'state' },
    { name: 'UI Library', value: 'ui', checked: true },
    { name: 'Testing', value: 'testing' },
  ],
})

// 带验证
const skills = await inquirer.multiSelect({
  message: '选择技能 (至少选择3项):',
  choices: [
    { name: 'JavaScript', value: 'js' },
    { name: 'TypeScript', value: 'ts' },
    { name: 'React', value: 'react' },
    { name: 'Vue', value: 'vue' },
    { name: 'Node.js', value: 'node' },
    { name: 'Python', value: 'python' },
  ],
  validate: choices => {
    return choices.length >= 3 ? true : '请至少选择3项技能'
  },
})
```

### 数字输入

#### `number(options: NumberOptions): Promise<number>`

数字输入。

```typescript
// 基本数字输入
const age = await inquirer.number({
  message: '请输入年龄:',
})

// 带范围验证
const port = await inquirer.number({
  message: '请输入端口号:',
  default: 3000,
  min: 1,
  max: 65535,
})

// 带小数
const price = await inquirer.number({
  message: '请输入价格:',
  float: true,
  min: 0,
  validate: input => {
    return input > 0 ? true : '价格必须大于0'
  },
})
```

### 自动完成

#### `autocomplete<T>(options: AutocompleteOptions<T>): Promise<T>`

自动完成输入。

```typescript
// 基本自动完成
const country = await inquirer.autocomplete({
  message: '选择国家:',
  source: async input => {
    const countries = ['中国', '美国', '日本', '德国', '法国', '英国']
    return countries.filter(c => c.toLowerCase().includes(input.toLowerCase()))
  },
})

// 异步数据源
const repository = await inquirer.autocomplete({
  message: '选择仓库:',
  source: async input => {
    if (!input) return []

    const response = await fetch(`https://api.github.com/search/repositories?q=${input}`)
    const data = await response.json()

    return data.items.slice(0, 10).map(repo => ({
      name: repo.full_name,
      value: repo.clone_url,
      description: repo.description,
    }))
  },
})
```

### 编辑器输入

#### `editor(options: EditorOptions): Promise<string>`

编辑器输入。

```typescript
// 基本编辑器
const content = await inquirer.editor({
  message: '请输入内容:',
})

// 带默认内容
const config = await inquirer.editor({
  message: '编辑配置文件:',
  default: JSON.stringify(
    {
      name: 'my-app',
      version: '1.0.0',
    },
    null,
    2
  ),
  validate: input => {
    try {
      JSON.parse(input)
      return true
    } catch {
      return '请输入有效的 JSON 格式'
    }
  },
})
```

## InquirerUtils

交互询问工具函数类，提供快速询问方法。

### 快速方法

#### `input(message: string, defaultValue?: string): Promise<string>`

快速文本输入。

```typescript
const name = await InquirerUtils.input('请输入姓名:')
const email = await InquirerUtils.input('请输入邮箱:', 'user@example.com')
```

#### `confirm(message: string, defaultValue?: boolean): Promise<boolean>`

快速确认询问。

```typescript
const confirmed = await InquirerUtils.confirm('确定要继续吗?')
const shouldSave = await InquirerUtils.confirm('是否保存?', true)
```

#### `select<T>(message: string, choices: ChoiceOption<T>[]): Promise<T>`

快速选择。

```typescript
const framework = await InquirerUtils.select('选择框架:', [
  { name: 'React', value: 'react' },
  { name: 'Vue', value: 'vue' },
])
```

#### `multiSelect<T>(message: string, choices: ChoiceOption<T>[]): Promise<T[]>`

快速多选。

```typescript
const features = await InquirerUtils.multiSelect('选择功能:', [
  { name: 'TypeScript', value: 'typescript' },
  { name: 'ESLint', value: 'eslint' },
])
```

### 验证工具

#### `ValidationHelpers`

内置验证助手。

```typescript
const email = await inquirer.input({
  message: '请输入邮箱:',
  validate: InquirerUtils.ValidationHelpers.email(),
})

const url = await inquirer.input({
  message: '请输入网址:',
  validate: InquirerUtils.ValidationHelpers.url(),
})

const phone = await inquirer.input({
  message: '请输入手机号:',
  validate: InquirerUtils.ValidationHelpers.phone('CN'),
})

const required = await inquirer.input({
  message: '必填项:',
  validate: InquirerUtils.ValidationHelpers.required(),
})

const minLength = await inquirer.input({
  message: '用户名:',
  validate: InquirerUtils.ValidationHelpers.minLength(3),
})
```

## 实际应用示例

### 项目初始化向导

```typescript
class ProjectInitWizard {
  private inquirer = InquirerManager.create()

  async run() {
    console.log('🚀 项目初始化向导')
    console.log('请回答以下问题来配置您的项目\n')

    // 基本信息
    const basicInfo = await this.collectBasicInfo()

    // 技术栈选择
    const techStack = await this.selectTechStack()

    // 功能配置
    const features = await this.configureFeatures(techStack)

    // 部署配置
    const deployment = await this.configureDeployment()

    // 确认配置
    const confirmed = await this.confirmConfiguration({
      ...basicInfo,
      ...techStack,
      ...features,
      ...deployment,
    })

    if (confirmed) {
      await this.createProject({
        ...basicInfo,
        ...techStack,
        ...features,
        ...deployment,
      })
    }
  }

  private async collectBasicInfo() {
    const name = await this.inquirer.input({
      message: '项目名称:',
      validate: input => {
        if (!input.trim()) return '项目名称不能为空'
        if (!/^[a-z0-9-_]+$/.test(input)) {
          return '项目名称只能包含小写字母、数字、连字符和下划线'
        }
        return true
      },
    })

    const description = await this.inquirer.input({
      message: '项目描述:',
      default: `${name} 项目`,
    })

    const author = await this.inquirer.input({
      message: '作者:',
      default: process.env.USER || 'Unknown',
    })

    const license = await this.inquirer.select({
      message: '许可证:',
      choices: [
        { name: 'MIT', value: 'MIT' },
        { name: 'Apache-2.0', value: 'Apache-2.0' },
        { name: 'GPL-3.0', value: 'GPL-3.0' },
        { name: 'BSD-3-Clause', value: 'BSD-3-Clause' },
        { name: '其他', value: 'other' },
      ],
      default: 'MIT',
    })

    return { name, description, author, license }
  }

  private async selectTechStack() {
    const projectType = await this.inquirer.select({
      message: '项目类型:',
      choices: [
        { name: 'Web 应用', value: 'web' },
        { name: 'Node.js 库', value: 'library' },
        { name: 'CLI 工具', value: 'cli' },
        { name: 'API 服务', value: 'api' },
      ],
    })

    const language = await this.inquirer.select({
      message: '编程语言:',
      choices: [
        { name: 'TypeScript', value: 'typescript' },
        { name: 'JavaScript', value: 'javascript' },
      ],
      default: 'typescript',
    })

    let framework = null
    if (projectType === 'web') {
      framework = await this.inquirer.select({
        message: '前端框架:',
        choices: [
          { name: 'React', value: 'react' },
          { name: 'Vue', value: 'vue' },
          { name: 'Angular', value: 'angular' },
          { name: 'Svelte', value: 'svelte' },
          { name: '原生 JavaScript', value: 'vanilla' },
        ],
      })
    }

    return { projectType, language, framework }
  }

  private async configureFeatures(techStack: any) {
    const features = await this.inquirer.multiSelect({
      message: '选择需要的功能:',
      choices: [
        { name: 'ESLint (代码检查)', value: 'eslint', checked: true },
        { name: 'Prettier (代码格式化)', value: 'prettier', checked: true },
        { name: 'Jest (单元测试)', value: 'jest' },
        { name: 'Husky (Git 钩子)', value: 'husky' },
        { name: 'Commitizen (提交规范)', value: 'commitizen' },
        { name: 'GitHub Actions (CI/CD)', value: 'github-actions' },
        { name: 'Docker', value: 'docker' },
      ],
    })

    let bundler = null
    if (techStack.projectType === 'web') {
      bundler = await this.inquirer.select({
        message: '构建工具:',
        choices: [
          { name: 'Vite', value: 'vite' },
          { name: 'Webpack', value: 'webpack' },
          { name: 'Rollup', value: 'rollup' },
          { name: 'Parcel', value: 'parcel' },
        ],
        default: 'vite',
      })
    }

    return { features, bundler }
  }

  private async configureDeployment() {
    const needsDeployment = await this.inquirer.confirm({
      message: '是否需要配置部署?',
      default: false,
    })

    if (!needsDeployment) {
      return { deployment: null }
    }

    const platform = await this.inquirer.select({
      message: '部署平台:',
      choices: [
        { name: 'Vercel', value: 'vercel' },
        { name: 'Netlify', value: 'netlify' },
        { name: 'GitHub Pages', value: 'github-pages' },
        { name: 'AWS', value: 'aws' },
        { name: 'Docker', value: 'docker' },
        { name: '自定义', value: 'custom' },
      ],
    })

    return { deployment: platform }
  }

  private async confirmConfiguration(config: any) {
    console.log('\n📋 项目配置预览:')
    console.log(`项目名称: ${config.name}`)
    console.log(`项目类型: ${config.projectType}`)
    console.log(`编程语言: ${config.language}`)
    if (config.framework) {
      console.log(`前端框架: ${config.framework}`)
    }
    console.log(`功能特性: ${config.features.join(', ')}`)
    if (config.deployment) {
      console.log(`部署平台: ${config.deployment}`)
    }

    return await this.inquirer.confirm({
      message: '\n确认创建项目?',
      default: true,
    })
  }

  private async createProject(config: any) {
    console.log('\n🔨 正在创建项目...')

    // 实现项目创建逻辑
    const steps = ['创建项目目录', '生成 package.json', '安装依赖', '创建项目结构', '配置开发工具']

    for (const step of steps) {
      console.log(`✓ ${step}`)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`\n✅ 项目 ${config.name} 创建成功!`)
    console.log('\n下一步:')
    console.log(`  cd ${config.name}`)
    console.log('  npm run dev')
  }
}

// 使用示例
const wizard = new ProjectInitWizard()
wizard.run()
```

### 配置管理工具

```typescript
class ConfigManager {
  private inquirer = InquirerManager.create()

  async manageConfig() {
    const action = await this.inquirer.select({
      message: '选择操作:',
      choices: [
        { name: '查看配置', value: 'view' },
        { name: '修改配置', value: 'edit' },
        { name: '重置配置', value: 'reset' },
        { name: '导出配置', value: 'export' },
        { name: '导入配置', value: 'import' },
      ],
    })

    switch (action) {
      case 'view':
        await this.viewConfig()
        break
      case 'edit':
        await this.editConfig()
        break
      case 'reset':
        await this.resetConfig()
        break
      case 'export':
        await this.exportConfig()
        break
      case 'import':
        await this.importConfig()
        break
    }
  }

  private async editConfig() {
    const config = await this.loadConfig()

    const section = await this.inquirer.select({
      message: '选择要修改的配置节:',
      choices: Object.keys(config).map(key => ({
        name: key,
        value: key,
      })),
    })

    const newValue = await this.inquirer.editor({
      message: `编辑 ${section} 配置:`,
      default: JSON.stringify(config[section], null, 2),
      validate: input => {
        try {
          JSON.parse(input)
          return true
        } catch {
          return '请输入有效的 JSON 格式'
        }
      },
    })

    config[section] = JSON.parse(newValue)
    await this.saveConfig(config)

    console.log('✅ 配置已更新')
  }

  private async loadConfig() {
    // 实现配置加载逻辑
    return {}
  }

  private async saveConfig(config: any) {
    // 实现配置保存逻辑
  }
}
```

## 类型定义

```typescript
interface InquirerOptions {
  theme?: string
  clearPromptOnDone?: boolean
  prefix?: string
  suffix?: string
  pageSize?: number
  loop?: boolean
}

interface InputOptions {
  message: string
  default?: string
  validate?: (input: string) => boolean | string | Promise<boolean | string>
  transform?: (input: string) => any
}

interface SelectOptions<T> {
  message: string
  choices: ChoiceOption<T>[]
  default?: T
  pageSize?: number
}

interface ChoiceOption<T> {
  name: string
  value: T
  description?: string
  checked?: boolean
  disabled?: boolean | string
}

interface ConfirmOptions {
  message: string
  default?: boolean
  transformer?: (answer: boolean) => string
}

interface NumberOptions {
  message: string
  default?: number
  min?: number
  max?: number
  float?: boolean
  validate?: (input: number) => boolean | string
}
```

## 最佳实践

1. **用户体验**: 提供清晰的提示和默认值
2. **输入验证**: 验证用户输入并提供友好的错误消息
3. **进度指示**: 对于多步骤流程提供进度指示
4. **错误处理**: 优雅处理用户中断和错误输入
5. **可访问性**: 支持键盘导航和屏幕阅读器

## 示例应用

查看 [使用示例](/examples/interactive-cli) 了解更多交互式 CLI 的实际应用场景。
