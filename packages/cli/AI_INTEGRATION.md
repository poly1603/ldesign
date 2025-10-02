# CLI Web UI - AI 功能集成完成 ✅

## 🎉 已完成的工作

### 1. 创建 AI 模块
```
packages/cli/src/web/src/ai/
├── types.ts              # AI 类型定义
├── config.ts             # 配置管理（API 密钥存储）
├── deepseek-client.ts    # DeepSeek 客户端
└── index.ts              # 模块导出
```

### 2. 创建页面组件
```
packages/cli/src/web/src/views/
├── AISettings.vue        # AI 设置页面
└── AIDemo.vue           # AI 对话页面
```

### 3. 配置路由
- ✅ `/ai-settings` - AI 设置
- ✅ `/ai-demo` - AI 对话

### 4. 添加菜单
- ✅ 左侧菜单已添加 "AI 助手" 选项（Bot 图标）

## 🚀 使用步骤

### 第一步：启动 CLI Web UI

```bash
cd D:\WorkBench\ldesign\packages\cli

# 启动开发服务器
npm run dev:web

# 或者如果是生产环境
npm run build:web
npm start
```

### 第二步：访问 AI 功能

打开浏览器访问：`http://192.168.31.42:3001`（或你的实际地址）

在左侧菜单中点击 **"AI 助手"** (🤖 图标)

### 第三步：配置 API 密钥

1. 首次访问会提示配置密钥
2. 点击"前往设置"或直接访问：`http://192.168.31.42:3001/ai-settings`
3. 输入你的 DeepSeek API Key
4. 配置其他选项（可选）：
   - API 地址（默认：`https://api.deepseek.com/v1`）
   - 模型（`deepseek-chat` 或 `deepseek-coder`）
   - 超时时间
   - 最大重试次数
5. 点击"保存配置"
6. 点击"测试连接"验证配置

### 第四步：开始对话

1. 返回 AI 助手页面或访问：`http://192.168.31.42:3001/ai-demo`
2. 在输入框输入问题
3. 按 Enter 或点击"发送"
4. 享受 AI 对话！

## 🔑 获取 DeepSeek API 密钥

1. 访问：https://platform.deepseek.com/api_keys
2. 注册/登录账号
3. 创建新的 API Key
4. 复制密钥（格式：`sk-xxxxxxxxxxxxxx`）

## ✨ 功能特性

### 对话功能
- ✅ 智能问答
- ✅ 代码生成
- ✅ 多轮对话
- ✅ 流式响应（实时显示）

### 设置选项
- ⚙️ 温度控制（0-2）
- 📏 Token 限制（100-4000）
- 💭 系统提示词自定义
- 🔄 流式/非流式切换

### 其他功能
- 💡 示例问题快捷输入
- 📊 对话统计信息
- 🗑️ 清空对话历史
- 💾 配置持久化存储

## 🎯 示例问题

### 1. 代码生成
```
用 TypeScript 写一个防抖函数
```

### 2. 技术问答
```
什么是闭包？请举例说明
```

### 3. 代码审查
```
帮我审查这段代码：
function add(a, b) {
  return a + b
}
```

### 4. 文档生成
```
为 createDeepSeekClient 函数生成 JSDoc 注释
```

## 📁 菜单结构

```
左侧菜单
├── 📊 仪表盘 (/)
├── 📁 项目管理 (/projects)
├── ⭕ Node 管理 (/node)
├── 📦 NPM 源管理 (/npm-sources)
├── 🤖 AI 助手 (/ai-demo)      ← 新增！
└── ⚙️ 设置 (/settings)
```

## 🔧 配置文件位置

配置存储在浏览器的 localStorage 中：
- Key: `ldesign_cli_ai_config`
- 包含：API 密钥、模型、超时等设置

## 🐛 常见问题

### Q1: 点击 AI 助手后显示 404
**A:** 确保：
1. 已重启开发服务器（`npm run dev:web`）
2. 浏览器已刷新页面
3. 检查路由配置是否正确

### Q2: 无法保存配置
**A:** 检查：
1. 浏览器是否允许 localStorage
2. 是否在无痕模式下（无痕模式可能限制存储）
3. 浏览器存储空间是否充足

### Q3: API 连接失败
**A:** 验证：
1. API 密钥是否正确
2. 网络是否能访问 DeepSeek API
3. 是否有防火墙或代理限制

### Q4: 流式响应不工作
**A:** 尝试：
1. 关闭流式响应选项
2. 检查网络是否稳定
3. 确认浏览器支持 Stream API

## 📊 技术细节

### 存储方案
- 使用 localStorage 存储配置
- 密钥在本地加密存储
- 支持配置导入/导出（可扩展）

### API 集成
- 支持 DeepSeek Chat API
- 支持流式和非流式响应
- 自动重试机制
- 超时控制

### UI 框架
- Vue 3 Composition API
- TypeScript
- Vue Router
- Lucide Icons

## 🎨 界面说明

### AI 设置页面
- **左侧**：配置表单
  - API 密钥输入（可显示/隐藏）
  - API 地址配置
  - 模型选择
  - 高级设置
- **右侧**：状态显示
  - 配置状态
  - 测试结果

### AI 对话页面
- **左侧**：聊天区域
  - 消息列表
  - 输入框
  - 发送按钮
- **右侧**：设置面板
  - 对话参数设置
  - 示例问题
  - 统计信息

## 🚧 未来扩展

可以考虑添加的功能：
- [ ] 对话历史持久化
- [ ] 多模型切换
- [ ] 自定义提示词模板
- [ ] 对话导出功能
- [ ] 语音输入支持
- [ ] Markdown 渲染
- [ ] 代码高亮显示

## 📞 支持

如有问题，请检查：
1. 控制台错误信息
2. 网络请求状态
3. DeepSeek API 服务状态

---

**现在你可以在 CLI Web UI 中愉快地使用 AI 功能了！🎉**
