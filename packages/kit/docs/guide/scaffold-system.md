# 脚手架系统

@ldesign/kit 提供了基于 CAC 的完整脚手架解决方案，支持多环境配置、模板管理、插件系统和交互式项目创建。

## 核心功能

### 脚手架管理器 (ScaffoldManager)

脚手架管理器是整个脚手架系统的核心，负责统一管理所有功能模块：

```typescript
import { ScaffoldManager } from '@ldesign/kit/scaffold'

// 创建脚手架管理器
const scaffold = new ScaffoldManager({
  name: 'my-cli',
  version: '1.0.0',
  description: '我的项目脚手架',
  workingDir: process.cwd(),
  configDir: '.scaffold',
  templatesDir: 'templates',
  pluginsDir: 'plugins',
  environments: ['development', 'production', 'staging', 'test'],
  defaultEnvironment: 'development',
  enableHotReload: true,
  enableCache: true,
})

// 初始化脚手架
await scaffold.initialize()

// 创建新项目
const result = await scaffold.createProject({
  name: 'my-project',
  template: 'vue-app',
  environment: 'development',
  interactive: true,
  overwrite: false,
})

console.log('项目创建结果:', result)
```

### 模板管理器 (TemplateManager)

模板管理器负责模板的加载、渲染和管理：

```typescript
import { TemplateManager } from '@ldesign/kit/scaffold'

const templateManager = new TemplateManager({
  templatesDir: './templates',
  logger: console,
})

await templateManager.initialize()

// 获取所有模板
const templates = templateManager.getTemplateNames()
console.log('可用模板:', templates)

// 渲染模板
const files = await templateManager.renderTemplate('vue-app', './output', {
  projectName: 'my-vue-app',
  author: 'John Doe',
  description: 'A Vue.js application',
})

console.log('生成的文件:', files)
```

### 插件管理器 (PluginManager)

插件管理器提供了可扩展的插件机制：

```typescript
import { PluginManager } from '@ldesign/kit/scaffold'

const pluginManager = new PluginManager({
  pluginsDir: './plugins',
  logger: console,
})

await pluginManager.initialize()

// 获取所有插件
const plugins = pluginManager.getPluginNames()
console.log('可用插件:', plugins)

// 安装插件到项目
await pluginManager.installPlugin('eslint-config', './my-project')
```

### 环境管理器 (EnvironmentManager)

环境管理器负责多环境配置的管理和切换：

```typescript
import { EnvironmentManager } from '@ldesign/kit/scaffold'

const envManager = new EnvironmentManager({
  environments: ['development', 'production', 'staging', 'test'],
  defaultEnvironment: 'development',
  logger: console,
})

await envManager.initialize()

// 切换环境
await envManager.setEnvironment('production')

// 获取环境变量
const variables = envManager.getEnvironmentVariables()
console.log('环境变量:', variables)

// 设置环境变量
envManager.setEnvironmentVariable('API_URL', 'https://api.example.com')
```

## CLI 构建器 (CliBuilder)

CLI 构建器基于 CAC 提供友好的命令行接口：

```typescript
import { CliBuilder, ScaffoldManager } from '@ldesign/kit/scaffold'

// 创建脚手架管理器
const scaffold = new ScaffoldManager({
  name: 'my-cli',
  version: '1.0.0',
})

// 创建 CLI 构建器
const cli = new CliBuilder({
  name: 'my-cli',
  version: '1.0.0',
  description: '我的项目脚手架工具',
  scaffoldManager: scaffold,
})

// 解析命令行参数
cli.parse()
```

### 可用命令

CLI 构建器提供了以下内置命令：

#### 创建项目

```bash
# 交互式创建项目
my-cli create my-project

# 指定模板和环境
my-cli create my-project -t vue-app -e production

# 指定目标目录
my-cli create my-project -d ./projects/my-project

# 覆盖已存在的目录
my-cli create my-project -f

# 安装插件
my-cli create my-project -p eslint,prettier,husky
```

#### 列出资源

```bash
# 列出所有模板
my-cli list templates

# 列出所有插件
my-cli list plugins

# 列出所有环境
my-cli list environments

# 显示详细信息
my-cli list templates -d
```

#### 环境管理

```bash
# 显示当前环境
my-cli env current

# 列出所有环境
my-cli env list

# 设置环境
my-cli env -s production
```

#### 插件管理

```bash
# 列出插件
my-cli plugin list

# 安装插件
my-cli plugin install -n eslint-config -p ./my-project
```

#### 配置管理

```bash
# 获取配置
my-cli config get -k database.host

# 设置配置
my-cli config set -k database.host -v localhost
```

## 模板系统

### 模板结构

```
templates/
├── vue-app/
│   ├── template.json          # 模板配置
│   ├── package.json.template  # 模板文件
│   ├── src/
│   │   ├── main.js.template
│   │   └── App.vue.template
│   └── README.md.template
└── react-app/
    ├── template.json
    └── ...
```

### 模板配置 (template.json)

```json
{
  "name": "vue-app",
  "version": "1.0.0",
  "description": "Vue.js 应用模板",
  "author": "LDesign Team",
  "keywords": ["vue", "frontend", "spa"],
  "variables": {
    "projectName": {
      "type": "string",
      "message": "请输入项目名称:",
      "default": "my-vue-app"
    },
    "author": {
      "type": "string",
      "message": "请输入作者:",
      "default": "Anonymous"
    },
    "framework": {
      "type": "select",
      "message": "选择 UI 框架:",
      "choices": [
        { "name": "Element Plus", "value": "element-plus" },
        { "name": "Ant Design Vue", "value": "ant-design-vue" },
        { "name": "Vuetify", "value": "vuetify" }
      ]
    }
  },
  "files": [
    {
      "source": "package.json.template",
      "target": "package.json",
      "template": true
    },
    {
      "source": "src/main.js.template",
      "target": "src/main.js",
      "template": true,
      "condition": "framework === 'element-plus'"
    }
  ],
  "hooks": {
    "afterRender": ["npm install"],
    "afterInstall": ["npm run dev"]
  },
  "dependencies": {
    "vue": "^3.0.0",
    "vue-router": "^4.0.0"
  }
}
```

### 模板语法

模板文件支持变量替换：

```javascript
// package.json.template
{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "author": "{{author}}",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "vue": "^3.0.0"
  }
}
```

## 插件系统

### 插件结构

```
plugins/
├── eslint-config/
│   ├── plugin.json    # 插件配置
│   └── index.js       # 插件主文件
└── prettier-config/
    ├── plugin.json
    └── index.js
```

### 插件配置 (plugin.json)

```json
{
  "name": "eslint-config",
  "version": "1.0.0",
  "description": "ESLint 配置插件",
  "main": "index.js",
  "hooks": ["afterCreate", "beforeInstall"],
  "dependencies": {
    "eslint": "^8.0.0",
    "@typescript-eslint/parser": "^5.0.0"
  },
  "options": {
    "configType": "typescript",
    "rules": "recommended"
  }
}
```

### 插件实现 (index.js)

```javascript
module.exports = {
  name: 'eslint-config',
  version: '1.0.0',

  async install(context) {
    const { projectPath, logger, fileSystem } = context
    logger?.info('安装 ESLint 配置...')

    // 创建 .eslintrc.js
    const eslintConfig = {
      extends: ['@typescript-eslint/recommended'],
      parser: '@typescript-eslint/parser',
      rules: {
        'no-console': 'warn',
        'no-unused-vars': 'error',
      },
    }

    await fileSystem.writeFile(
      `${projectPath}/.eslintrc.js`,
      `module.exports = ${JSON.stringify(eslintConfig, null, 2)}`
    )
  },

  async afterCreate(context) {
    const { projectPath, logger } = context
    logger?.info('ESLint 配置已应用')
  },
}
```

## 环境配置

### 环境变量管理

```typescript
// 设置环境特定的变量
envManager.setEnvironmentVariable('API_URL', 'https://dev-api.example.com', 'development')
envManager.setEnvironmentVariable('API_URL', 'https://api.example.com', 'production')

// 获取当前环境的变量
const apiUrl = envManager.getEnvironmentVariables().API_URL

// 环境继承
envManager.setEnvironmentConfig('staging', {
  name: 'staging',
  extends: 'production',
  variables: {
    DEBUG: true,
  },
})
```

### 环境切换

```typescript
// 监听环境变更
envManager.on('environmentChanged', ({ from, to }) => {
  console.log(`环境已从 ${from} 切换到 ${to}`)
})

// 切换环境
await envManager.setEnvironment('production')
```

## 最佳实践

### 1. 项目结构组织

```
my-cli/
├── templates/           # 模板目录
│   ├── vue-app/
│   ├── react-app/
│   └── node-api/
├── plugins/            # 插件目录
│   ├── eslint-config/
│   ├── prettier-config/
│   └── husky-config/
├── .scaffold/          # 脚手架配置
│   └── scaffold.config.json5
├── bin/               # CLI 入口
│   └── cli.js
└── package.json
```

### 2. 模板设计原则

- **模块化**：将模板拆分为可复用的组件
- **可配置**：通过变量支持不同的配置选项
- **条件渲染**：根据用户选择渲染不同的文件
- **钩子支持**：在关键节点执行自定义逻辑

### 3. 插件开发指南

- **单一职责**：每个插件只负责一个特定功能
- **配置驱动**：通过配置文件控制插件行为
- **错误处理**：妥善处理异常情况
- **文档完善**：提供清晰的使用说明

### 4. 环境管理策略

- **分层配置**：使用环境继承减少重复配置
- **敏感信息**：将敏感信息存储在环境变量中
- **默认值**：为所有配置项提供合理的默认值

## 故障排除

### 常见问题

1. **模板渲染失败**

   ```typescript
   // 检查模板语法
   const validation = templateManager.validateTemplate('vue-app')
   console.log('模板验证结果:', validation)
   ```

2. **插件安装失败**

   ```typescript
   // 检查插件配置
   const plugin = pluginManager.getPlugin('eslint-config')
   console.log('插件信息:', plugin)
   ```

3. **环境切换失败**
   ```typescript
   // 检查环境配置
   const envConfig = envManager.getEnvironmentConfig('production')
   console.log('环境配置:', envConfig)
   ```

### 调试模式

```typescript
// 启用详细日志
const scaffold = new ScaffoldManager({
  name: 'my-cli',
  logLevel: 'debug',
})

// 监听所有事件
scaffold.on('*', (event, data) => {
  console.log(`事件: ${event}`, data)
})
```
