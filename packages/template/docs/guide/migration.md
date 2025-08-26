# 迁移指南

本指南帮助你从其他模板管理方案或旧版本迁移到 `@ldesign/template`。

## 🚀 从其他方案迁移

### 从传统组件库迁移

如果你之前使用传统的组件库（如 Element Plus、Ant Design Vue 等），可以按照以下步骤迁移：

#### 1. 分析现有组件结构

```typescript
// 迁移后的模板方式
import { TemplateRenderer } from '@ldesign/template/vue'

// 原有的组件使用方式
import { ElButton, ElForm, ElInput } from 'element-plus'
```

#### 2. 创建对应的模板

```vue
<!-- 原有的组件组合 -->
<template>
  <el-form :model="form" label-width="120px">
    <el-form-item label="用户名">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="密码">
      <el-input v-model="form.password" type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">
        登录
      </el-button>
    </el-form-item>
  </el-form>
</template>

<!-- 迁移后的模板 -->
<template>
  <TemplateRenderer
    template="login-form"
    :template-props="{ formData: form }"
    @submit="handleSubmit"
  />
</template>
```

#### 3. 渐进式迁移策略

```typescript
// 第一阶段：保持原有组件，添加模板系统
const app = createApp(App)
app.use(ElementPlus) // 保持原有
app.use(TemplatePlugin) // 添加新的

// 第二阶段：逐步替换关键页面
// 第三阶段：完全迁移到模板系统
```

### 从自定义组件系统迁移

#### 1. 组件映射

```typescript
// 原有的组件注册
app.component('UserCard', UserCard)
app.component('ProductList', ProductList)

// 迁移到模板系统
const templateMapping = {
  UserCard: 'user-profile',
  ProductList: 'product-list'
}

// 创建迁移助手
function migrateComponent(oldComponentName: string) {
  const templateName = templateMapping[oldComponentName]
  return templateName ? `template="${templateName}"` : oldComponentName
}
```

#### 2. 属性转换

```typescript
// 原有的属性传递
interface UserCardProps {
  user: User
  editable: boolean
  onSave: (user: User) => void
}

// 迁移后的模板属性
interface TemplateProps {
  templateProps: {
    user: User
    editable: boolean
  }
  onTemplateSave: (user: User) => void
}
```

## 📦 版本升级

### 从 0.x 升级到 1.x

#### 重大变更

1. **API 重命名**：
```typescript
// 0.x 版本
import { TemplateEngine } from '@ldesign/template'

// 1.x 版本
import { TemplateManager } from '@ldesign/template'
const engine = new TemplateEngine()
const manager = new TemplateManager()
```

2. **配置格式变更**：
```typescript
// 0.x 版本
const config = {
  scanPath: 'src/templates',
  cacheEnabled: true
}

// 1.x 版本
const config = {
  scanner: {
    scanPaths: ['src/templates/**/*.vue']
  },
  cache: {
    enabled: true
  }
}
```

3. **事件名称变更**：
```typescript
// 0.x 版本
engine.on('templateLoaded', handler)
engine.on('templateError', handler)

// 1.x 版本
manager.on('template:loaded', handler)
manager.on('template:error', handler)
```

#### 自动迁移脚本

```bash
# 运行迁移脚本
npx @ldesign/template-migrate --from=0.x --to=1.x
```

或手动迁移：

```typescript
// migration-helper.ts
export function migrateConfig(oldConfig: any) {
  return {
    scanner: {
      scanPaths: Array.isArray(oldConfig.scanPath)
        ? oldConfig.scanPath
        : [`${oldConfig.scanPath}/**/*.vue`]
    },
    cache: {
      enabled: oldConfig.cacheEnabled ?? true,
      strategy: oldConfig.cacheStrategy ?? 'lru',
      maxSize: oldConfig.maxCacheSize ?? 50
    },
    performance: {
      enabled: oldConfig.performanceMonitoring ?? false
    }
  }
}
```

### 从 1.x 升级到 2.x

#### 新特性

1. **增强的设备检测**：
```typescript
// 1.x 版本
const deviceType = detectDevice()

// 2.x 版本 - 支持自定义检测器
const manager = new TemplateManager({
  deviceAdapter: {
    customDetector: () => {
      // 自定义逻辑
      return 'desktop'
    }
  }
})
```

2. **改进的缓存系统**：
```typescript
// 2.x 新增的缓存策略
const config = {
  cache: {
    strategy: 'lfu', // 新增 LFU 策略
    compression: true, // 新增压缩支持
    persistence: true // 新增持久化支持
  }
}
```

#### 兼容性处理

```typescript
// 兼容性适配器
class CompatibilityAdapter {
  static adaptConfig(config: any) {
    // 处理配置兼容性
    if (config.deviceDetection) {
      config.deviceAdapter = {
        autoDetect: config.deviceDetection.enabled,
        customDetector: config.deviceDetection.customDetector
      }
      delete config.deviceDetection
    }

    return config
  }
}
```

## 🔄 数据迁移

### 模板文件迁移

#### 1. 目录结构调整

```bash
# 旧结构
src/
├── components/
│   ├── mobile/
│   ├── tablet/
│   └── desktop/

# 新结构
src/templates/
├── [category]/
│   ├── mobile/
│   ├── tablet/
│   └── desktop/
```

#### 2. 批量迁移脚本

```typescript
// migrate-templates.ts
import fs from 'node:fs/promises'
import path from 'node:path'

async function migrateTemplates() {
  const oldDir = 'src/components'
  const newDir = 'src/templates'

  const categories = await fs.readdir(oldDir)

  for (const category of categories) {
    const categoryPath = path.join(oldDir, category)
    const stat = await fs.stat(categoryPath)

    if (stat.isDirectory()) {
      // 创建新的分类目录
      const newCategoryPath = path.join(newDir, category)
      await fs.mkdir(newCategoryPath, { recursive: true })

      // 迁移设备类型目录
      const devices = await fs.readdir(categoryPath)
      for (const device of devices) {
        const oldDevicePath = path.join(categoryPath, device)
        const newDevicePath = path.join(newCategoryPath, device)

        await fs.rename(oldDevicePath, newDevicePath)
      }
    }
  }
}
```

### 配置文件迁移

```typescript
// config-migrator.ts
export class ConfigMigrator {
  static migrate(oldConfig: any): any {
    const newConfig: any = {}

    // 扫描器配置迁移
    if (oldConfig.scanPaths || oldConfig.scanPath) {
      newConfig.scanner = {
        scanPaths: oldConfig.scanPaths || [oldConfig.scanPath],
        enableCache: oldConfig.scanCache ?? true,
        watchMode: oldConfig.watchMode ?? false
      }
    }

    // 加载器配置迁移
    if (oldConfig.loader) {
      newConfig.loader = {
        enableCache: oldConfig.loader.cache ?? true,
        maxCacheSize: oldConfig.loader.maxCache ?? 50,
        preloadStrategy: oldConfig.loader.preload ?? 'none'
      }
    }

    // 设备适配器配置迁移
    if (oldConfig.device) {
      newConfig.deviceAdapter = {
        autoDetect: oldConfig.device.autoDetect ?? true,
        watchDeviceChange: oldConfig.device.watchChange ?? true
      }
    }

    return newConfig
  }
}
```

## 🧪 测试迁移

### 测试用例更新

```typescript
// 旧的测试用例
describe('TemplateEngine', () => {
  it('should load template', async () => {
    const engine = new TemplateEngine()
    const template = await engine.load('login')
    expect(template).toBeDefined()
  })
})

// 新的测试用例
describe('TemplateManager', () => {
  it('should load template', async () => {
    const manager = new TemplateManager()
    const template = await manager.loadTemplate('login', 'desktop')
    expect(template).toBeDefined()
  })
})
```

### 测试数据迁移

```typescript
// test-data-migrator.ts
export function migrateTestData(oldData: any) {
  return {
    templates: oldData.templates.map((template: any) => ({
      category: template.name,
      deviceType: template.device || 'desktop',
      path: template.path,
      metadata: template.meta || {}
    })),

    devices: oldData.devices || ['desktop', 'tablet', 'mobile'],

    config: ConfigMigrator.migrate(oldData.config || {})
  }
}
```

## 🔧 工具和脚本

### 迁移检查工具

```typescript
// migration-checker.ts
export class MigrationChecker {
  static async checkCompatibility(projectPath: string) {
    const issues: string[] = []

    // 检查依赖版本
    const packageJson = await this.readPackageJson(projectPath)
    if (packageJson.dependencies['@ldesign/template']) {
      const version = packageJson.dependencies['@ldesign/template']
      if (version.startsWith('0.')) {
        issues.push('需要升级到 1.x 版本')
      }
    }

    // 检查文件结构
    const hasOldStructure = await this.checkOldStructure(projectPath)
    if (hasOldStructure) {
      issues.push('需要迁移目录结构')
    }

    // 检查配置文件
    const configIssues = await this.checkConfig(projectPath)
    issues.push(...configIssues)

    return issues
  }

  private static async checkOldStructure(projectPath: string): Promise<boolean> {
    // 检查是否存在旧的目录结构
    const oldPaths = [
      'src/components/mobile',
      'src/components/tablet',
      'src/components/desktop'
    ]

    for (const oldPath of oldPaths) {
      try {
        await fs.access(path.join(projectPath, oldPath))
        return true
      }
      catch {
        // 路径不存在，继续检查
      }
    }

    return false
  }
}
```

### 自动化迁移脚本

```bash
#!/bin/bash
# migrate.sh

echo "开始迁移 @ldesign/template..."

# 1. 备份项目
echo "创建备份..."
cp -r . ../project-backup

# 2. 更新依赖
echo "更新依赖..."
npm install @ldesign/template@latest

# 3. 运行迁移脚本
echo "迁移配置和文件..."
npx ts-node scripts/migrate-config.ts
npx ts-node scripts/migrate-templates.ts

# 4. 更新测试
echo "更新测试用例..."
npx ts-node scripts/migrate-tests.ts

# 5. 验证迁移
echo "验证迁移结果..."
npm run test
npm run build

echo "迁移完成！"
```

## 📋 迁移检查清单

### 迁移前准备

- [ ] 备份当前项目
- [ ] 记录当前版本和配置
- [ ] 运行现有测试确保功能正常
- [ ] 阅读新版本文档和变更日志

### 迁移过程

- [ ] 更新依赖版本
- [ ] 迁移配置文件
- [ ] 调整目录结构
- [ ] 更新导入语句
- [ ] 修改 API 调用
- [ ] 更新事件监听

### 迁移后验证

- [ ] 运行所有测试用例
- [ ] 验证核心功能
- [ ] 检查性能指标
- [ ] 测试不同设备类型
- [ ] 验证错误处理

### 清理工作

- [ ] 删除旧的配置文件
- [ ] 清理无用的依赖
- [ ] 更新文档
- [ ] 培训团队成员

## 🆘 迁移支持

如果在迁移过程中遇到问题，可以：

1. **查看迁移文档**：详细阅读相关版本的迁移指南
2. **使用迁移工具**：利用提供的自动化迁移脚本
3. **寻求社区帮助**：在 GitHub Issues 中提问
4. **联系技术支持**：获取专业的迁移支持

## 📚 相关资源

- [版本更新日志](./changelog.md)
- [API 参考文档](/api/index.md)
- [最佳实践指南](./best-practices.md)
- [故障排除指南](./troubleshooting.md)
