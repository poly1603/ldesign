<!-- ddc78117-7576-4a69-ad1b-cb715fceb24c 7cbe580f-5b4c-4e0d-863c-3dab7482f8a7 -->
# NPM 发布管理插件实施计划

## 核心功能设计

### 1. 项目结构与类型定义

创建 `tools/publisher` 目录，包含以下核心模块:

- **类型系统** (`src/types/`):
  - `config.ts` - 发布配置接口 (registry、auth、version 策略等)
  - `package.ts` - 包信息和依赖关系类型
  - `version.ts` - 版本管理类型 (semver 策略、prerelease 标签)
  - `changelog.ts` - 变更日志类型
  - `publish.ts` - 发布流程和结果类型

- **核心管理器** (`src/core/`):
  - `PublishManager.ts` - 主发布流程编排
  - `RegistryManager.ts` - 多 registry 管理和切换
  - `VersionManager.ts` - 版本号管理和自动递增
  - `ChangelogGenerator.ts` - 基于 git commits 生成 changelog
  - `DependencyResolver.ts` - Monorepo 依赖拓扑排序
  - `PackageValidator.ts` - 发布前验证 (文件完整性、构建产物等)

### 2. 版本管理策略

实现智能版本管理:

- **自动版本号生成**:
  - 基于 conventional commits 自动判断版本类型 (major/minor/patch)
  - 支持 prerelease 版本 (alpha、beta、rc)
  - 支持工作空间版本联动 (fixed/independent 模式)

- **版本策略**:
  - Fixed: 所有包统一版本号 (类似 Babel)
  - Independent: 每个包独立版本 (类似 Lerna)
  - 支持版本号前缀和后缀自定义

### 3. Registry 管理

实现多 registry 支持:

- **Registry 配置**:
  - npm 官方 registry
  - 私有 registry (verdaccio/nexus/artifactory)
  - 多 registry 并行发布
  - 支持 scope 级别的 registry 映射

- **认证管理**:
  - `.npmrc` 配置管理
  - Token 安全存储和注入
  - 2FA (Two-Factor Authentication) 支持
  - 临时凭证生成和清理

### 4. Changelog 自动生成

基于 git 历史生成规范化 changelog:

- **Commit 解析**:
  - 支持 conventional commits 规范
  - 自定义 commit 模板和规则
  - 自动分类 (Features、Bug Fixes、Breaking Changes)

- **格式化输出**:
  - Markdown 格式
  - 多语言支持
  - 包含作者和 PR 链接
  - 自动更新 CHANGELOG.md

### 5. 发布前验证

实现完整的发布前检查:

- **代码验证**:
  - Git 工作区清洁检查
  - 必须在指定分支发布 (如 main/master)
  - 依赖版本冲突检查
  - 构建产物存在性验证

- **包验证**:
  - package.json 字段完整性
  - README、LICENSE 文件检查
  - 文件大小限制
  - 敏感信息扫描 (如 .env 文件)

### 6. 发布流程编排

完整的发布工作流:

1. **Pre-publish**:

   - 运行测试 (可选)
   - 代码 lint (可选)
   - 构建包 (调用 @ldesign/builder)
   - 生成类型声明

2. **Version Management**:

   - 自动或手动版本号递增
   - 更新 package.json
   - 更新依赖包版本引用 (workspace 内部)
   - 生成 changelog

3. **Publish**:

   - 按拓扑顺序发布 (Monorepo)
   - 并行或串行发布
   - 实时进度显示
   - 错误处理和重试

4. **Post-publish**:

   - 创建 Git tag
   - 提交版本更新 commit
   - 推送到远程仓库
   - 发送通知 (可选)

### 7. 回滚机制

实现安全的发布回滚:

- **版本回滚**:
  - npm deprecate 标记废弃版本
  - npm unpublish 撤销发布 (24小时内)
  - 自动恢复 package.json 版本

- **状态追踪**:
  - 发布历史记录
  - 失败原因分析
  - 回滚操作日志

### 8. CLI 交互设计

提供友好的命令行界面:

```bash
# 基础命令
ldesign-publisher publish             # 发布
ldesign-publisher version <type>      # 版本管理
ldesign-publisher changelog           # 生成 changelog
ldesign-publisher validate            # 验证包

# 高级功能
ldesign-publisher publish --dry-run   # 模拟发布
ldesign-publisher publish --tag beta  # 发布为 beta tag
ldesign-publisher rollback <version>  # 回滚版本
ldesign-publisher registry list       # 查看 registry 配置
```

### 9. 与 Builder 集成

与 `@ldesign/builder` 深度集成:

- 发布前自动调用 builder 构建
- 共享配置和缓存
- 统一的错误处理
- 构建产物验证

### 10. 配置文件

支持灵活的配置方式:

**publisher.config.ts**:

```typescript
export default {
  // 版本策略
  versionStrategy: 'independent', // 'fixed' | 'independent'
  
  // Registry 配置
  registries: {
    public: 'https://registry.npmjs.org',
    private: 'https://npm.example.com'
  },
  
  // 发布选项
  publish: {
    registry: 'public',
    access: 'public', // 'public' | 'restricted'
    tag: 'latest',
    otp: false, // 2FA
  },
  
  // Changelog 配置
  changelog: {
    enabled: true,
    conventional: true,
    output: 'CHANGELOG.md'
  },
  
  // 验证规则
  validation: {
    requireCleanWorkingDirectory: true,
    allowedBranches: ['main', 'master'],
    requireTests: true,
    requireBuild: true
  },
  
  // 生命周期钩子
  hooks: {
    prePublish: 'pnpm test && pnpm build',
    postPublish: 'echo "Published successfully"'
  }
}
```

## 技术实现要点

1. **依赖库选择**:

   - `execa` - 执行 npm 命令
   - `semver` - 版本号解析和比较
   - `conventional-changelog` - Changelog 生成
   - `inquirer` - 交互式 CLI
   - `ora` - 进度显示
   - `chalk` - 彩色输出

2. **Monorepo 支持**:

   - 使用 pnpm workspace 协议
   - 拓扑排序确保发布顺序
   - 支持过滤和选择包发布

3. **错误处理**:

   - 详细的错误信息和建议
   - 自动重试机制
   - 事务性发布 (全部成功或回滚)

4. **安全性**:

   - Token 加密存储
   - 敏感文件扫描
   - 发布确认机制

## 文件结构

```
tools/publisher/
├── src/
│   ├── core/
│   │   ├── PublishManager.ts          # 主发布管理器
│   │   ├── RegistryManager.ts         # Registry 管理
│   │   ├── VersionManager.ts          # 版本管理
│   │   ├── ChangelogGenerator.ts      # Changelog 生成
│   │   ├── DependencyResolver.ts      # 依赖解析
│   │   ├── PackageValidator.ts        # 包验证
│   │   └── RollbackManager.ts         # 回滚管理
│   ├── cli/
│   │   ├── commands/
│   │   │   ├── publish.ts             # 发布命令
│   │   │   ├── version.ts             # 版本命令
│   │   │   ├── changelog.ts           # Changelog 命令
│   │   │   ├── validate.ts            # 验证命令
│   │   │   ├── registry.ts            # Registry 命令
│   │   │   └── rollback.ts            # 回滚命令
│   │   └── index.ts
│   ├── types/
│   │   ├── config.ts
│   │   ├── package.ts
│   │   ├── version.ts
│   │   ├── changelog.ts
│   │   ├── publish.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── npm-client.ts              # npm 命令封装
│   │   ├── git-utils.ts               # Git 操作
│   │   ├── workspace-utils.ts         # Monorepo 工具
│   │   ├── logger.ts                  # 日志
│   │   ├── error-handler.ts           # 错误处理
│   │   └── security.ts                # 安全工具
│   ├── validators/
│   │   ├── package-validator.ts       # 包验证
│   │   ├── git-validator.ts           # Git 验证
│   │   └── version-validator.ts       # 版本验证
│   └── index.ts
├── bin/
│   └── cli.js                         # CLI 入口
├── __tests__/                         # 测试文件
├── docs/                              # 文档
├── templates/                         # 配置模板
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

### To-dos

- [ ] 创建 publisher 项目结构，配置 package.json、tsconfig.json、tsup.config.ts
- [ ] 定义核心类型系统 (config、package、version、changelog、publish)
- [ ] 实现 RegistryManager - 多 registry 管理和认证
- [ ] 实现 VersionManager - 智能版本号管理和 semver 策略
- [ ] 实现 DependencyResolver - Monorepo 依赖拓扑排序
- [ ] 实现 ChangelogGenerator - 基于 conventional commits 生成 changelog
- [ ] 实现验证器 - 包验证、Git 验证、版本验证
- [ ] 实现 PublishManager - 完整发布流程编排和生命周期管理
- [ ] 实现 RollbackManager - 发布回滚和状态恢复
- [ ] 实现 CLI 命令 (publish、version、changelog、validate、registry、rollback)
- [ ] 与 @ldesign/builder 集成 - 自动构建和产物验证
- [ ] 编写单元测试和集成测试
- [ ] 编写完整文档和使用示例