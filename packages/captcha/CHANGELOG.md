# 更新日志

所有重要的更改都将记录在此文件中。

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

## [1.0.0] - 2024-09-13

### 🎉 首次发布

#### ✨ 新功能

- **核心功能**
  - 实现了完整的验证码基础架构
  - 支持事件驱动的架构设计
  - 提供统一的 API 接口

- **验证码类型**
  - 🧩 滑动拼图验证 - 支持自定义图片和难度设置
  - 📝 按顺序点击文字验证 - 支持自定义文字内容和样式
  - 🔄 滑动滑块图片回正验证 - 支持圆形和线性滑块样式
  - 👆 点击验证 - 支持多个目标区域和自定义容错范围

- **主题系统**
  - 内置 5 种预设主题（默认、暗色、简约、彩色、高对比度）
  - 支持自定义主题注册
  - 支持 CSS 变量定制
  - 响应式主题适配

- **框架支持**
  - 原生 JavaScript 实现
  - Vue 3 组件和组合式 API
  - React 组件和 Hooks
  - Angular 组件和服务

- **开发体验**
  - 完整的 TypeScript 类型定义
  - 智能代码提示和类型检查
  - 详细的 JSDoc 注释
  - 完善的错误处理

#### 🎨 样式和主题

- 使用 LESS 预处理器
- 基于 LDesign 设计系统的 CSS 变量
- 支持深色模式和高对比度模式
- 响应式设计，适配移动端

#### 📱 用户体验

- 流畅的动画效果
- 触摸设备支持
- 键盘导航支持
- 屏幕阅读器友好

#### 🔧 工具和配置

- 基于 @ldesign/builder 的构建系统
- 支持 ESM、CJS、UMD 多种格式
- 自动生成 TypeScript 声明文件
- 样式提取和压缩

#### 📚 文档和示例

- 完整的 VitePress 文档站点
- 详细的 API 参考文档
- 丰富的使用示例
- 最佳实践指南

#### 🧪 测试

- 基于 Vitest 的单元测试
- 完整的测试覆盖率
- Mock 环境支持
- 自动化测试流程

#### 📦 发布

- NPM 包发布配置
- 多入口点支持
- Peer Dependencies 配置
- 发布前自动化检查

### 🔧 技术栈

- **核心**: TypeScript + Canvas API
- **构建**: @ldesign/builder + Rollup
- **样式**: LESS + CSS Variables
- **测试**: Vitest + Happy-DOM
- **文档**: VitePress
- **代码质量**: ESLint + TypeScript

### 📊 包大小

- **ESM**: ~45KB (gzipped: ~12KB)
- **CJS**: ~48KB (gzipped: ~13KB)
- **UMD**: ~52KB (gzipped: ~14KB)
- **CSS**: ~8KB (gzipped: ~2KB)

### 🌐 浏览器支持

- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79
- iOS Safari >= 12
- Android Chrome >= 60

### 📝 API 概览

#### 核心类

- `BaseCaptcha` - 验证码基类
- `CaptchaManager` - 验证码管理器
- `EventEmitter` - 事件发射器

#### 验证码类型

- `SlidePuzzleCaptcha` - 滑动拼图验证
- `ClickTextCaptcha` - 点击文字验证
- `RotateSliderCaptcha` - 旋转滑块验证
- `ClickCaptcha` - 点击验证

#### 框架适配器

- `@ldesign/captcha/vue` - Vue 3 适配器
- `@ldesign/captcha/react` - React 适配器
- `@ldesign/captcha/angular` - Angular 适配器

#### 工具函数

- 数学工具函数
- DOM 操作工具
- 主题管理器
- 类型定义

### 🎯 使用场景

- 用户注册和登录
- 表单提交验证
- 防止机器人攻击
- 敏感操作确认
- API 访问控制

### 🔮 未来计划

- 更多验证码类型
- 国际化支持
- 性能优化
- 更多框架适配器
- 服务端 SDK

---

## 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与贡献。

## 许可证

[MIT License](./LICENSE)

## 致谢

感谢所有为这个项目做出贡献的开发者们！

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/ldesign-team">LDesign Team</a></sub>
</div>
