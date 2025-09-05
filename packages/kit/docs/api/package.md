# Package 包管理

Package 模块提供了 NPM 包管理工具，支持依赖管理、脚本执行和版本控制，帮助自动化包管理工作流程。

## 导入方式

```typescript
// 完整导入
import { PackageManager, PackageUtils } from '@ldesign/kit'

// 按需导入
import { PackageManager } from '@ldesign/kit/package'

// 单独导入
import { PackageManager } from '@ldesign/kit'
```

## PackageManager

包管理器类，提供完整的 NPM 包管理功能。

### 创建实例

#### `new PackageManager(projectPath?: string, options?: PackageOptions)`

创建包管理器实例。

```typescript
// 使用当前目录
const pkg = new PackageManager()

// 指定项目路径
const pkg = new PackageManager('./my-project')

// 使用配置选项
const pkg = new PackageManager('./my-project', {
  packageManager: 'npm', // npm | yarn | pnpm
  registry: 'https://registry.npmjs.org/',
  timeout: 30000,
  verbose: true,
})
```

### package.json 操作

#### `readPackageJson(): Promise<PackageJson>`

读取 package.json 文件。

```typescript
const packageJson = await pkg.readPackageJson()

console.log('项目名称:', packageJson.name)
console.log('版本:', packageJson.version)
console.log('依赖:', packageJson.dependencies)
console.log('开发依赖:', packageJson.devDependencies)
```

#### `writePackageJson(packageJson: PackageJson): Promise<void>`

写入 package.json 文件。

```typescript
const packageJson = await pkg.readPackageJson()
packageJson.version = '1.1.0'
packageJson.description = '更新的描述'

await pkg.writePackageJson(packageJson)
```

#### `updatePackageJson(updates: Partial<PackageJson>): Promise<void>`

更新 package.json 部分内容。

```typescript
await pkg.updatePackageJson({
  version: '1.2.0',
  keywords: ['typescript', 'nodejs', 'utility'],
  author: 'Your Name <your.email@example.com>',
  license: 'MIT',
})
```

### 依赖管理

#### `addDependency(name: string, version?: string, options?: AddDependencyOptions): Promise<void>`

添加依赖。

```typescript
// 添加生产依赖
await pkg.addDependency('lodash')
await pkg.addDependency('express', '^4.18.0')

// 添加开发依赖
await pkg.addDependency('typescript', '^5.0.0', { dev: true })
await pkg.addDependency('@types/node', '^20.0.0', { dev: true })

// 添加可选依赖
await pkg.addDependency('fsevents', '*', { optional: true })

// 添加 peer 依赖
await pkg.addDependency('react', '^18.0.0', { peer: true })
```

#### `removeDependency(name: string): Promise<void>`

移除依赖。

```typescript
await pkg.removeDependency('lodash')
await pkg.removeDependency('@types/jest')
```

#### `updateDependency(name: string, version?: string): Promise<void>`

更新依赖版本。

```typescript
await pkg.updateDependency('express', '^4.19.0')
await pkg.updateDependency('typescript') // 更新到最新版本
```

#### `listDependencies(type?: DependencyType): Promise<Record<string, string>>`

列出依赖。

```typescript
// 列出所有生产依赖
const dependencies = await pkg.listDependencies('dependencies')

// 列出开发依赖
const devDependencies = await pkg.listDependencies('devDependencies')

// 列出所有依赖
const allDependencies = await pkg.listDependencies()
```

#### `checkOutdated(): Promise<OutdatedInfo[]>`

检查过时的依赖。

```typescript
const outdated = await pkg.checkOutdated()

outdated.forEach(dep => {
  console.log(`${dep.name}: ${dep.current} -> ${dep.latest}`)
})
```

### 脚本管理

#### `addScript(name: string, command: string): Promise<void>`

添加脚本。

```typescript
await pkg.addScript('build', 'tsc')
await pkg.addScript('test', 'jest')
await pkg.addScript('dev', 'nodemon src/index.ts')
await pkg.addScript('lint', 'eslint src --ext .ts')
```

#### `removeScript(name: string): Promise<void>`

移除脚本。

```typescript
await pkg.removeScript('old-script')
```

#### `runScript(name: string, args?: string[]): Promise<void>`

运行脚本。

```typescript
// 运行基本脚本
await pkg.runScript('build')
await pkg.runScript('test')

// 传递参数
await pkg.runScript('test', ['--watch'])
await pkg.runScript('lint', ['--fix'])
```

#### `listScripts(): Promise<Record<string, string>>`

列出所有脚本。

```typescript
const scripts = await pkg.listScripts()

Object.entries(scripts).forEach(([name, command]) => {
  console.log(`${name}: ${command}`)
})
```

### 版本管理

#### `getVersion(): Promise<string>`

获取当前版本。

```typescript
const currentVersion = await pkg.getVersion()
console.log('当前版本:', currentVersion)
```

#### `setVersion(version: string): Promise<void>`

设置版本。

```typescript
await pkg.setVersion('1.2.0')
```

#### `bumpVersion(type: VersionBumpType, prerelease?: string): Promise<string>`

版本号递增。

```typescript
// 补丁版本递增 (1.0.0 -> 1.0.1)
const newPatch = await pkg.bumpVersion('patch')

// 次版本递增 (1.0.0 -> 1.1.0)
const newMinor = await pkg.bumpVersion('minor')

// 主版本递增 (1.0.0 -> 2.0.0)
const newMajor = await pkg.bumpVersion('major')

// 预发布版本 (1.0.0 -> 1.0.1-alpha.0)
const newPrerelease = await pkg.bumpVersion('prerelease', 'alpha')
```

### 包信息

#### `getPackageInfo(name: string): Promise<PackageInfo>`

获取包信息。

```typescript
const info = await pkg.getPackageInfo('lodash')

console.log('包名:', info.name)
console.log('最新版本:', info.version)
console.log('描述:', info.description)
console.log('作者:', info.author)
console.log('许可证:', info.license)
console.log('主页:', info.homepage)
```

#### `searchPackages(query: string, options?: SearchOptions): Promise<SearchResult[]>`

搜索包。

```typescript
const results = await pkg.searchPackages('typescript utility', {
  limit: 10,
  quality: 0.8,
  popularity: 0.1,
  maintenance: 0.1,
})

results.forEach(result => {
  console.log(`${result.name}: ${result.description}`)
})
```

### 安装和发布

#### `install(options?: InstallOptions): Promise<void>`

安装依赖。

```typescript
// 安装所有依赖
await pkg.install()

// 仅安装生产依赖
await pkg.install({ production: true })

// 清理安装
await pkg.install({ clean: true })
```

#### `publish(options?: PublishOptions): Promise<void>`

发布包。

```typescript
// 基本发布
await pkg.publish()

// 发布到指定 registry
await pkg.publish({
  registry: 'https://npm.company.com/',
  tag: 'beta',
  access: 'public',
})
```

#### `unpublish(version?: string): Promise<void>`

撤销发布。

```typescript
// 撤销指定版本
await pkg.unpublish('1.0.0')

// 撤销整个包
await pkg.unpublish()
```

## PackageUtils

包工具函数类，提供常用的包管理工具。

### 工具方法

#### `isValidPackageName(name: string): boolean`

验证包名是否有效。

```typescript
console.log(PackageUtils.isValidPackageName('my-package')) // true
console.log(PackageUtils.isValidPackageName('My Package')) // false
console.log(PackageUtils.isValidPackageName('@scope/package')) // true
```

#### `isValidVersion(version: string): boolean`

验证版本号是否有效。

```typescript
console.log(PackageUtils.isValidVersion('1.0.0')) // true
console.log(PackageUtils.isValidVersion('1.0.0-alpha')) // true
console.log(PackageUtils.isValidVersion('invalid')) // false
```

#### `compareVersions(version1: string, version2: string): number`

比较版本号。

```typescript
console.log(PackageUtils.compareVersions('1.0.0', '1.0.1')) // -1
console.log(PackageUtils.compareVersions('1.1.0', '1.0.0')) // 1
console.log(PackageUtils.compareVersions('1.0.0', '1.0.0')) // 0
```

#### `parsePackageName(name: string): ParsedPackageName`

解析包名。

```typescript
const parsed = PackageUtils.parsePackageName('@scope/package-name')
console.log('作用域:', parsed.scope) // 'scope'
console.log('名称:', parsed.name) // 'package-name'
console.log('完整名称:', parsed.fullName) // '@scope/package-name'
```

#### `generatePackageJson(options: GenerateOptions): PackageJson`

生成 package.json 模板。

```typescript
const packageJson = PackageUtils.generatePackageJson({
  name: 'my-awesome-package',
  version: '1.0.0',
  description: 'An awesome package',
  author: 'Your Name',
  license: 'MIT',
  type: 'library',
})
```

## 实际应用示例

### 项目初始化工具

```typescript
class ProjectInitializer {
  private pkg = new PackageManager()

  async initializeProject(options: InitOptions) {
    // 1. 创建 package.json
    const packageJson = PackageUtils.generatePackageJson({
      name: options.name,
      version: '1.0.0',
      description: options.description,
      author: options.author,
      license: options.license || 'MIT',
      type: options.type || 'library',
    })

    await this.pkg.writePackageJson(packageJson)

    // 2. 添加基础依赖
    if (options.typescript) {
      await this.pkg.addDependency('typescript', '^5.0.0', { dev: true })
      await this.pkg.addDependency('@types/node', '^20.0.0', { dev: true })
    }

    if (options.eslint) {
      await this.pkg.addDependency('eslint', '^8.0.0', { dev: true })
      if (options.typescript) {
        await this.pkg.addDependency('@typescript-eslint/parser', '^6.0.0', { dev: true })
        await this.pkg.addDependency('@typescript-eslint/eslint-plugin', '^6.0.0', { dev: true })
      }
    }

    if (options.prettier) {
      await this.pkg.addDependency('prettier', '^3.0.0', { dev: true })
    }

    if (options.jest) {
      await this.pkg.addDependency('jest', '^29.0.0', { dev: true })
      if (options.typescript) {
        await this.pkg.addDependency('ts-jest', '^29.0.0', { dev: true })
      }
    }

    // 3. 添加脚本
    await this.addScripts(options)

    // 4. 安装依赖
    await this.pkg.install()

    console.log(`✅ 项目 ${options.name} 初始化完成`)
  }

  private async addScripts(options: InitOptions) {
    if (options.typescript) {
      await this.pkg.addScript('build', 'tsc')
      await this.pkg.addScript('dev', 'tsc --watch')
    }

    if (options.jest) {
      await this.pkg.addScript('test', 'jest')
      await this.pkg.addScript('test:watch', 'jest --watch')
      await this.pkg.addScript('test:coverage', 'jest --coverage')
    }

    if (options.eslint) {
      await this.pkg.addScript('lint', 'eslint src --ext .ts,.js')
      await this.pkg.addScript('lint:fix', 'eslint src --ext .ts,.js --fix')
    }

    if (options.prettier) {
      await this.pkg.addScript('format', 'prettier --write "src/**/*.{ts,js,json}"')
    }

    await this.pkg.addScript('clean', 'rimraf dist')
    await this.pkg.addScript('prepublishOnly', 'npm run clean && npm run build')
  }
}
```

### 依赖管理工具

```typescript
class DependencyManager {
  private pkg = new PackageManager()

  async auditDependencies() {
    console.log('🔍 检查过时的依赖...')
    const outdated = await this.pkg.checkOutdated()

    if (outdated.length === 0) {
      console.log('✅ 所有依赖都是最新的')
      return
    }

    console.log('📦 发现过时的依赖:')
    outdated.forEach(dep => {
      console.log(`  ${dep.name}: ${dep.current} -> ${dep.latest}`)
    })

    // 询问是否更新
    const shouldUpdate = await this.promptForUpdate()
    if (shouldUpdate) {
      await this.updateOutdatedDependencies(outdated)
    }
  }

  async cleanupDependencies() {
    console.log('🧹 清理未使用的依赖...')

    const packageJson = await this.pkg.readPackageJson()
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }

    const unusedDeps = await this.findUnusedDependencies(Object.keys(allDeps))

    if (unusedDeps.length === 0) {
      console.log('✅ 没有发现未使用的依赖')
      return
    }

    console.log('📦 发现未使用的依赖:')
    unusedDeps.forEach(dep => console.log(`  ${dep}`))

    const shouldRemove = await this.promptForRemoval()
    if (shouldRemove) {
      for (const dep of unusedDeps) {
        await this.pkg.removeDependency(dep)
        console.log(`  ❌ 已移除 ${dep}`)
      }
    }
  }

  async securityAudit() {
    console.log('🔒 执行安全审计...')

    // 这里可以集成 npm audit 或其他安全工具
    // 实际实现会调用相应的安全检查工具

    console.log('✅ 安全审计完成')
  }

  private async updateOutdatedDependencies(outdated: OutdatedInfo[]) {
    for (const dep of outdated) {
      try {
        await this.pkg.updateDependency(dep.name, dep.latest)
        console.log(`  ✅ 已更新 ${dep.name} 到 ${dep.latest}`)
      } catch (error) {
        console.log(`  ❌ 更新 ${dep.name} 失败: ${error.message}`)
      }
    }
  }

  private async findUnusedDependencies(dependencies: string[]): Promise<string[]> {
    // 实现依赖使用分析逻辑
    // 这里可以扫描源代码文件，检查哪些依赖没有被使用
    return []
  }

  private async promptForUpdate(): Promise<boolean> {
    // 实现用户确认逻辑
    return true
  }

  private async promptForRemoval(): Promise<boolean> {
    // 实现用户确认逻辑
    return true
  }
}
```

### 发布自动化工具

```typescript
class PublishManager {
  private pkg = new PackageManager()

  async performRelease(versionType: VersionBumpType) {
    try {
      console.log('🚀 开始发布流程...')

      // 1. 运行测试
      console.log('🧪 运行测试...')
      await this.pkg.runScript('test')

      // 2. 运行构建
      console.log('🔨 构建项目...')
      await this.pkg.runScript('build')

      // 3. 更新版本号
      console.log('📝 更新版本号...')
      const newVersion = await this.pkg.bumpVersion(versionType)
      console.log(`版本更新为: ${newVersion}`)

      // 4. 生成变更日志
      console.log('📋 生成变更日志...')
      await this.generateChangelog(newVersion)

      // 5. 提交更改
      console.log('💾 提交更改...')
      await this.commitChanges(newVersion)

      // 6. 创建标签
      console.log('🏷️ 创建标签...')
      await this.createTag(newVersion)

      // 7. 发布到 npm
      console.log('📦 发布到 npm...')
      await this.pkg.publish()

      // 8. 推送到 Git
      console.log('⬆️ 推送到 Git...')
      await this.pushToGit()

      console.log(`✅ 版本 ${newVersion} 发布成功!`)
    } catch (error) {
      console.error('❌ 发布失败:', error.message)
      throw error
    }
  }

  async publishBeta() {
    const currentVersion = await this.pkg.getVersion()
    const betaVersion = await this.pkg.bumpVersion('prerelease', 'beta')

    await this.pkg.publish({
      tag: 'beta',
      access: 'public',
    })

    console.log(`✅ Beta 版本 ${betaVersion} 发布成功`)
  }

  private async generateChangelog(version: string) {
    // 实现变更日志生成逻辑
  }

  private async commitChanges(version: string) {
    // 实现 Git 提交逻辑
  }

  private async createTag(version: string) {
    // 实现 Git 标签创建逻辑
  }

  private async pushToGit() {
    // 实现 Git 推送逻辑
  }
}
```

## 类型定义

```typescript
interface PackageOptions {
  packageManager?: 'npm' | 'yarn' | 'pnpm'
  registry?: string
  timeout?: number
  verbose?: boolean
}

interface PackageJson {
  name: string
  version: string
  description?: string
  main?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  author?: string
  license?: string
  keywords?: string[]
  homepage?: string
  repository?: string | object
  bugs?: string | object
}

interface OutdatedInfo {
  name: string
  current: string
  wanted: string
  latest: string
  location: string
}

interface PackageInfo {
  name: string
  version: string
  description: string
  author: string
  license: string
  homepage: string
  repository: string
  keywords: string[]
}

type VersionBumpType = 'major' | 'minor' | 'patch' | 'prerelease'
type DependencyType =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies'
```

## 错误处理

```typescript
try {
  await pkg.addDependency('some-package')
} catch (error) {
  if (error.code === 'ENOTFOUND') {
    console.log('包不存在或网络连接问题')
  } else if (error.message.includes('version')) {
    console.log('版本号格式错误')
  } else {
    console.error('添加依赖失败:', error.message)
  }
}
```

## 最佳实践

1. **版本管理**: 使用语义化版本控制
2. **依赖锁定**: 使用 lock 文件锁定依赖版本
3. **安全审计**: 定期检查依赖的安全漏洞
4. **清理依赖**: 定期清理未使用的依赖
5. **自动化发布**: 使用自动化工具进行发布

## 示例应用

查看 [使用示例](/examples/package-management) 了解更多包管理的实际应用场景。
