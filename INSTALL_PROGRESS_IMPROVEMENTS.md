# Node.js 安装进度改进说明

## 改进概述

本次改进针对 Node.js 版本管理界面进行了以下优化：

### 1. **独立的安装进度管理**
   - 每个版本有独立的安装进度跟踪
   - 支持同时查看多个版本的安装状态
   - 安装进度包括：百分比、当前步骤、详细日志

### 2. **安装进度弹窗组件**
   - 新增 `InstallProgressModal.vue` 组件
   - 实时显示安装进度条和百分比
   - 终端风格的日志输出窗口
   - 支持清空日志功能
   - 安装完成前可取消安装

### 3. **改进的当前版本显示**
   - 新增系统 Node 版本检测 API (`/api/system/node-version`)
   - 优先显示版本管理工具（FNM/Volta）管理的版本
   - 若无管理工具版本，则显示系统全局 Node 版本
   - 显示"(系统)"标记区分来源

### 4. **推荐版本卡片增强**
   - 安装中状态：显示实时进度百分比
   - "查看详情"按钮：点击打开安装进度弹窗
   - 按钮状态自动切换：未安装 → 安装中 → 已安装/当前版本

## 文件变更清单

### 新增文件
- `packages/cli/src/web/src/components/InstallProgressModal.vue` - 安装进度弹窗组件

### 修改文件
- `packages/cli/src/web/src/views/NodeManager.vue` - Node 管理主页面
  - 新增安装进度数据结构 `InstallProgress`
  - 新增进度管理 Map 存储每个版本的安装状态
  - 集成进度弹窗组件
  - 改进 WebSocket 消息处理，更新进度数据
  - 优化当前版本显示逻辑

- `packages/cli/src/server/routes/api.ts` - API 路由
  - 新增 `/api/system/node-version` 端点获取系统 Node 版本

## 数据结构

### InstallProgress 接口
```typescript
interface InstallProgress {
  version: string                                    // 版本号
  progress: number                                   // 安装进度 0-100
  step: string                                       // 当前步骤描述
  logs: Array<{                                      // 安装日志
    time: string                                     // 时间戳
    message: string                                  // 日志消息
    type: string                                     // 日志类型: info/success/warning/error
  }>
  isComplete: boolean                                // 是否完成
}
```

## 功能特性

### 安装进度弹窗
- **标题**: 显示正在安装的版本
- **进度条**: 视觉化展示安装进度
- **进度百分比**: 数字显示当前进度
- **当前步骤**: 文字描述当前操作
- **日志区域**: 
  - 终端风格的黑色背景
  - 彩色日志（info/success/warning/error）
  - 自动滚动到最新日志
  - 支持清空日志
- **操作按钮**:
  - 安装中：显示"取消安装"按钮
  - 安装完成：显示"关闭"按钮

### 推荐版本卡片状态
1. **未安装**: 显示蓝色"安装"按钮
2. **安装中**: 
   - 显示黄色"安装中 XX%"按钮（禁用状态）
   - 显示"查看详情"图标按钮
3. **已安装但非当前**: 显示绿色"切换"按钮
4. **当前版本**: 显示绿色"当前版本"标签

### 当前版本显示逻辑
```
优先级：
1. FNM/Volta 管理的当前版本
2. 系统全局 Node 版本 + "(系统)"标记
3. "N/A"
```

## WebSocket 消息增强

安装相关消息现在会携带更多信息：
- `node-install-start`: 携带 `version` 字段
- `node-install-progress`: 携带 `version`、`step`、`progress` 字段
- `node-install-complete`: 携带 `version` 字段
- `node-install-error`: 携带 `version` 字段

## UI/UX 改进

### 样式增强
- 安装中按钮：黄色背景 + 旋转加载图标
- 查看详情按钮：边框样式 + hover 效果
- 系统版本标记：灰色背景小标签
- 进度弹窗：毛玻璃背景遮罩 + 阴影

### 交互体验
- 点击安装后立即显示安装状态
- 可随时打开弹窗查看详细进度
- 安装完成后弹窗可点击遮罩层或按钮关闭
- 日志自动滚动到底部

## API 端点

### 新增
- `GET /api/system/node-version` - 获取系统 Node 版本
  - 响应: `{ success: true, data: { version, fromProcess, platform, arch } }`

### 现有
- `GET /api/fnm/status` - FNM 状态
- `GET /api/fnm/versions` - 已安装版本列表
- `GET /api/fnm/recommended-versions` - 推荐版本列表
- `POST /api/fnm/install-node` - 安装 Node 版本
- `POST /api/fnm/use` - 切换 Node 版本

## 使用指南

### 查看安装进度
1. 在推荐版本区域找到想要安装的版本
2. 点击"安装"按钮开始安装
3. 按钮变为"安装中 X%"状态
4. 点击右侧的"查看详情"按钮（眼睛图标）打开进度弹窗
5. 在弹窗中实时查看安装进度和日志
6. 安装完成后可关闭弹窗

### 取消安装
- 在进度弹窗中点击"取消安装"按钮（需要后端支持）

### 清空日志
- 在进度弹窗中点击日志区域右上角的垃圾桶图标

## 技术栈

- **前端框架**: Vue 3 Composition API
- **图标库**: lucide-vue-next
- **样式**: Less (Scoped)
- **通信**: WebSocket + HTTP REST API

## 待优化项

1. **取消安装功能**: 需要在后端实现进程终止逻辑
2. **历史安装记录**: 可保存历史安装记录供查看
3. **并发安装**: 支持同时安装多个版本
4. **下载速度显示**: 显示下载速度和预计剩余时间
5. **版本列表选择器**: 在自定义版本输入框下方提供版本选择列表

## 测试建议

1. 测试安装一个推荐版本
2. 测试在安装过程中打开/关闭进度弹窗
3. 测试安装失败的情况（错误日志显示）
4. 测试切换到已安装的版本
5. 测试当前版本显示（有 FNM 版本 vs 只有系统版本）
6. 测试清空日志功能
7. 测试同时安装多个版本（如果支持）

## 兼容性

- 浏览器: 现代浏览器（Chrome、Firefox、Safari、Edge）
- Node.js: >= 16.x
- 操作系统: Windows、macOS、Linux
- 版本管理工具: FNM、Volta

---

**创建日期**: 2024
**作者**: LDesign Team
**版本**: 1.0.0