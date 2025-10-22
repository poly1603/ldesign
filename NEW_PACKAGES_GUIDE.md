# LDesign 新增包使用指南

> 25 个新包的快速上手指南

## 📦 安装新包

所有新包已添加到 monorepo 中，使用 workspace protocol 管理。

### 安装依赖

```bash
# 在根目录执行
cd d:\WorkBench\ldesign
pnpm install
```

### 构建新包

```bash
# 构建单个包
pnpm --filter "@ldesign/icons" build

# 构建所有包
pnpm build:all
```

## 🎯 快速使用示例

### @ldesign/icons - 图标系统

```typescript
// Vue 3
import { HomeIcon, SearchIcon } from '@ldesign/icons/vue'

// React
import { HomeIcon, SearchIcon } from '@ldesign/icons/react'
```

### @ldesign/logger - 日志系统

```typescript
import { logger } from '@ldesign/logger'

logger.info('用户登录', { userId: 123 })
logger.error('操作失败', new Error('Network error'))
```

### @ldesign/validator - 验证库

```typescript
import { createValidator, rules } from '@ldesign/validator'

const emailValidator = createValidator()
  .rule({ validator: rules.required })
  .rule({ validator: rules.email })

const result = await emailValidator.validate('user@example.com')
```

### @ldesign/auth - 认证授权

```typescript
import { auth } from '@ldesign/auth'

await auth.login({
  username: 'user@example.com',
  password: 'password123'
})

const user = auth.getUser()
const token = auth.getAccessToken()
```

### @ldesign/notification - 通知系统

```typescript
import { notification } from '@ldesign/notification'

notification.success('操作成功！')
notification.error('操作失败')
notification.warning('警告信息')
```

### @ldesign/websocket - WebSocket 客户端

```typescript
import { createWebSocket } from '@ldesign/websocket'

const ws = createWebSocket({
  url: 'wss://api.example.com',
  autoReconnect: true,
  heartbeat: true
})

ws.connect()
ws.send({ type: 'message', content: 'Hello' })
```

### @ldesign/permission - 权限管理

```typescript
import { createPermissionManager } from '@ldesign/permission'

const permission = createPermissionManager()

permission.addPermission('users', 'read')
permission.addPermission('users', 'write')

if (permission.hasPermission('users', 'write')) {
  // 允许写操作
}
```

### @ldesign/animation - 动画库

```typescript
import { animate } from '@ldesign/animation'

const element = document.querySelector('.box')
animate(element, { duration: 500 })
  .fadeIn()
```

### @ldesign/file - 文件处理

```typescript
import { createUploader } from '@ldesign/file'

const uploader = createUploader({
  url: '/api/upload',
  chunkSize: 1024 * 1024, // 1MB
  onProgress: (percent) => console.log(`${percent}%`)
})

await uploader.upload(file)
```

### @ldesign/storage - 统一存储

```typescript
import { createStorage } from '@ldesign/storage'

const storage = createStorage(localAdapter)

await storage.set('key', value)
const data = await storage.get('key')
```

## 🔧 组件库使用示例

### @ldesign/gantt - 甘特图

```typescript
import { createGantt } from '@ldesign/gantt'

const gantt = createGantt(containerElement)
gantt.render()
```

### @ldesign/mindmap - 思维导图

```typescript
import { createMindMap } from '@ldesign/mindmap'

const mindmap = createMindMap(containerElement)
mindmap.render()
```

### @ldesign/signature - 手写签名

```typescript
import { createSignaturePad } from '@ldesign/signature'

const signature = createSignaturePad(canvasElement)
signature.clear()
const dataURL = signature.toDataURL()
```

### @ldesign/calendar - 完整日历

```typescript
import { createCalendar } from '@ldesign/calendar'

const calendar = createCalendar(containerElement)
calendar.addEvent({
  title: '会议',
  start: new Date(),
  end: new Date()
})
```

### @ldesign/timeline - 时间轴

```typescript
import { createTimeline } from '@ldesign/timeline'

const timeline = createTimeline(containerElement)
timeline.render()
```

### @ldesign/tree - 高级树

```typescript
import { createTree } from '@ldesign/tree'

const tree = createTree(containerElement)
tree.render(treeData)
```

### @ldesign/upload - 上传组件

```typescript
import { createUploader } from '@ldesign/upload'

const uploader = createUploader()
await uploader.upload(file)
```

### @ldesign/player - 音频播放器

```typescript
import { createPlayer } from '@ldesign/player'

const player = createPlayer()
player.play('audio.mp3')
```

### @ldesign/markdown - Markdown 编辑器

```typescript
import { createMarkdownEditor } from '@ldesign/markdown'

const editor = createMarkdownEditor(containerElement)
editor.setValue('# Hello World')
```

## 🛠️ 开发工具使用

### @ldesign/tester - 测试工具

```typescript
import { createTestGenerator } from '@ldesign/tester'

const generator = createTestGenerator()
const unitTest = generator.generateUnitTest('MyComponent')
const e2eTest = generator.generateE2ETest('login')
```

### @ldesign/deployer - 部署工具

```typescript
import { createDeployer } from '@ldesign/deployer'

const deployer = createDeployer()
await deployer.deploy('production')
await deployer.rollback('v1.0.0')
```

### @ldesign/docs-generator - 文档生成

```typescript
import { createDocsGenerator } from '@ldesign/docs-generator'

const generator = createDocsGenerator()
await generator.generateAPI('./src')
await generator.generateComponents('./components')
```

### @ldesign/monitor - 监控系统

```typescript
import { createMonitor } from '@ldesign/monitor'

const monitor = createMonitor()
monitor.trackPerformance('page-load', 1200)
monitor.trackError(new Error('Something went wrong'))
```

### @ldesign/analyzer - 分析工具

```typescript
import { createAnalyzer } from '@ldesign/analyzer'

const analyzer = createAnalyzer()
const report = analyzer.analyze('./dist/bundle.js')
```

## 📝 下一步工作

### 1. 为每个包添加完整实现

当前所有包都是基础框架，需要补充：
- 完整的功能实现
- 单元测试
- E2E 测试
- 详细文档
- 使用示例

### 2. 优化现有包

根据计划需要优化的包：
- @ldesign/shared - 扩展工具函数
- @ldesign/color - 增加主题预设
- @ldesign/http - GraphQL 支持
- @ldesign/device - 手势识别
- @ldesign/router - 路由动画
- @ldesign/webcomponent - Storybook 文档
- @ldesign/form - 表单设计器
- @ldesign/lowcode - 实时协作
- @ldesign/chart - D3.js 支持

### 3. 集成测试

确保所有包之间的依赖关系正确：
```bash
pnpm install
pnpm type-check
pnpm lint
pnpm build:all
```

### 4. 发布准备

为发布做准备：
- [ ] 添加 CHANGELOG.md
- [ ] 完善 README.md
- [ ] 添加 LICENSE
- [ ] 配置 package.json
- [ ] 编写文档
- [ ] 添加测试

## 📊 包依赖关系

```
@ldesign/shared (基础)
  ├─→ @ldesign/icons
  ├─→ @ldesign/notification
  ├─→ @ldesign/animation
  ├─→ @ldesign/logger → @ldesign/cache, @ldesign/http
  ├─→ @ldesign/validator → @ldesign/i18n
  ├─→ @ldesign/auth → @ldesign/http, @ldesign/crypto, @ldesign/router, @ldesign/cache
  ├─→ @ldesign/websocket → @ldesign/http, @ldesign/logger
  ├─→ @ldesign/permission → @ldesign/auth, @ldesign/router, @ldesign/cache
  ├─→ @ldesign/file → @ldesign/http
  └─→ @ldesign/storage → @ldesign/cache, @ldesign/http
```

## 🎓 学习资源

- [完善计划](./ldesign---------.plan.md) - 详细的完善计划
- [扩展总结](./PACKAGE_EXPANSION_SUMMARY.md) - 扩展完成总结
- [README.md](./README.md) - 项目总览
- 各包 README - 查看每个包的详细文档

---

**文档版本**: 1.0  
**更新时间**: 2025-10-22  
**状态**: ✅ 25 个新包基础结构已完成

