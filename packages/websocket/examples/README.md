# @ldesign/websocket 示例代码

本目录包含了 @ldesign/websocket 的各种使用示例，帮助你快速了解和使用这个强大的WebSocket客户端库。

## 📁 示例目录

### 基础示例

#### [simple-chat](./simple-chat/) - 简单聊天室
一个完整的聊天室应用，展示了WebSocket的基本使用方法。

**特性：**
- 实时消息发送和接收
- 用户加入/离开通知
- 连接状态显示
- 消息历史记录
- 响应式设计

**技术栈：**
- 原生HTML/CSS/JavaScript
- WebSocket Echo服务器演示

**运行方式：**
```bash
# 直接在浏览器中打开
open simple-chat/index.html
```

#### [real-time-data](./real-time-data/) - 实时数据展示
一个实时数据监控面板，展示如何处理高频数据流。

**特性：**
- 实时数据图表
- 多种数据源切换
- 性能监控指标
- 数据导出功能
- 异常值告警

**技术栈：**
- Chart.js 图表库
- 模拟数据流
- 响应式仪表板

**运行方式：**
```bash
# 直接在浏览器中打开
open real-time-data/index.html
```

### 框架集成示例

#### [vue-example](./vue-example/) - Vue 3 集成
展示如何在Vue 3项目中使用WebSocket。

**特性：**
- Composition API集成
- 响应式状态管理
- 组件化设计
- 配置动态更新
- 性能监控

**运行方式：**
```bash
cd vue-example
npm install
npm run dev
```

#### [react-example](./react-example/) - React 集成
展示如何在React项目中使用WebSocket。

**特性：**
- React Hooks集成
- 状态管理
- 组件生命周期处理
- TypeScript支持
- 性能优化

**运行方式：**
```bash
cd react-example
npm install
npm start
```

#### [angular-example](./angular-example/) - Angular 集成
展示如何在Angular项目中使用WebSocket。

**特性：**
- Angular服务集成
- RxJS Observable支持
- 依赖注入
- 组件通信
- 路由守卫

**运行方式：**
```bash
cd angular-example
npm install
ng serve
```

### 高级示例

#### [multi-connection](./multi-connection/) - 多连接管理
展示如何管理多个WebSocket连接，实现负载均衡和故障转移。

**特性：**
- 连接池管理
- 负载均衡策略
- 故障转移
- 健康检查
- 动态连接管理

**运行方式：**
```bash
cd multi-connection
npm install
npm run build
node dist/index.js
```

#### [custom-protocol](./custom-protocol/) - 自定义协议
展示如何实现自定义的WebSocket协议。

**特性：**
- 协议定义
- 消息编解码
- 协议版本管理
- 兼容性处理
- 协议扩展

#### [performance-monitoring](./performance-monitoring/) - 性能监控
展示如何监控WebSocket连接的性能指标。

**特性：**
- 连接延迟监控
- 消息吞吐量统计
- 内存使用监控
- 错误率统计
- 性能报告生成

### Web Worker示例

#### [worker-example](./worker-example/) - Web Worker集成
展示如何在Web Worker中使用WebSocket。

**特性：**
- Worker线程通信
- 主线程代理
- 消息传递优化
- 错误处理
- 资源管理

## 🚀 快速开始

### 1. 克隆仓库
```bash
git clone https://github.com/ldesign/websocket.git
cd websocket/packages/websocket/examples
```

### 2. 选择示例
根据你的需求选择相应的示例目录。

### 3. 安装依赖（如果需要）
```bash
# 对于需要构建的示例
cd example-directory
npm install
```

### 4. 运行示例
按照各示例目录中的说明运行。

## 📖 学习路径

### 初学者
1. **simple-chat** - 了解基本概念和API
2. **vue-example** 或 **react-example** - 学习框架集成
3. **real-time-data** - 理解数据处理

### 进阶用户
1. **multi-connection** - 学习连接管理
2. **custom-protocol** - 了解协议定制
3. **performance-monitoring** - 掌握性能优化

### 高级用户
1. **worker-example** - 学习Worker集成
2. 结合多个示例创建复杂应用
3. 贡献新的示例

## 🛠️ 开发环境要求

### 基础要求
- Node.js 16+
- 现代浏览器（Chrome 80+, Firefox 75+, Safari 13+）

### 框架示例要求
- **Vue示例**: Vue 3.0+, Vite
- **React示例**: React 18+, Create React App
- **Angular示例**: Angular 15+, Angular CLI

### 开发工具推荐
- VS Code + WebSocket扩展
- Chrome DevTools
- WebSocket测试工具

## 🔧 自定义示例

### 创建新示例
1. 在examples目录下创建新文件夹
2. 添加README.md说明文档
3. 实现示例代码
4. 添加到主README.md中

### 示例结构建议
```
your-example/
├── README.md          # 示例说明
├── package.json       # 依赖配置（如果需要）
├── src/              # 源代码
├── public/           # 静态资源
└── dist/             # 构建输出
```

## 🧪 测试WebSocket服务器

大部分示例使用公共的WebSocket Echo服务器进行演示：
- `ws://echo.websocket.org` - 基础echo服务器
- `wss://echo.websocket.org` - 安全echo服务器

### 本地测试服务器
你也可以运行本地WebSocket服务器：

```bash
# 使用Node.js和ws库
npm install ws
node -e "
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', ws => {
  ws.on('message', data => ws.send(data));
});
console.log('WebSocket服务器运行在 ws://localhost:8080');
"
```

## 📚 相关文档

- [API文档](../docs/api/) - 完整的API参考
- [使用指南](../docs/guide/) - 详细的使用说明
- [最佳实践](../docs/guide/best-practices.md) - 开发建议
- [故障排除](../docs/guide/troubleshooting.md) - 常见问题解决

## 🤝 贡献示例

我们欢迎社区贡献新的示例！

### 贡献流程
1. Fork仓库
2. 创建示例分支
3. 实现示例代码
4. 添加文档说明
5. 提交Pull Request

### 示例要求
- 代码清晰易懂
- 包含详细注释
- 提供README说明
- 遵循项目代码规范
- 包含错误处理

## 📄 许可证

所有示例代码遵循MIT许可证，可自由使用和修改。

## 🔗 相关链接

- [GitHub仓库](https://github.com/ldesign/websocket)
- [NPM包](https://www.npmjs.com/package/@ldesign/websocket)
- [问题反馈](https://github.com/ldesign/websocket/issues)
- [讨论区](https://github.com/ldesign/websocket/discussions)

---

如果你有任何问题或建议，请随时在GitHub上提出Issue或参与讨论！
