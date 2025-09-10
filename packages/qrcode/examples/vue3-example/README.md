# Vue3 QR码示例项目

这是一个完整的Vue3 + TypeScript QR码生成示例项目，展示了@ldesign/qrcode库的所有功能特性。

## 🚀 快速开始

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm run dev
```

访问 http://localhost:3008/ 查看示例。

## 📋 功能特性

### 🎯 5个完整的功能模块

#### 1. 基础示例
- 基本二维码生成
- 文本输入和格式选择
- 尺寸调整
- 快速示例模板
- 下载功能

#### 2. 高级功能
- **Logo嵌入**: 支持图片上传、大小调整、形状选择（圆形/方形）
- **批量生成**: 多个二维码同时生成
- **缓存管理**: 性能优化和缓存控制

#### 3. 样式定制
- **实时颜色调整**: 前景色、背景色
- **渐变效果**: 支持渐变色二维码
- **预设样式**: 多种预设样式模板
- **尺寸和边距**: 动态调整

#### 4. 数据类型
支持8种常用数据类型：
- 🌐 URL链接
- 📶 WiFi网络
- 👤 联系人信息
- 📧 邮件地址
- 💬 短信内容
- 📞 电话号码
- 📍 地理位置
- 📝 纯文本

#### 5. 性能测试
- 生成速度测试
- 缓存性能测试
- 批量处理测试
- 内存使用监控
- 性能图表展示

## 🔧 技术实现

### 核心技术栈
- **Vue 3.4+**: 组合式API
- **TypeScript**: 完整类型支持
- **Vite**: 快速开发和构建
- **@ldesign/qrcode**: 核心QR码生成库

### 关键特性
- ✅ **响应式设计**: 适配桌面和移动端
- ✅ **实时更新**: 用户输入即时生成二维码
- ✅ **错误处理**: 完善的错误提示机制
- ✅ **性能优化**: 高效的渲染和缓存
- ✅ **类型安全**: 完整的TypeScript类型定义

## 🧪 测试

### E2E自动化测试
项目包含完整的Playwright E2E测试套件：

```bash
# 安装测试浏览器
pnpm run test:install

# 运行所有测试
pnpm run test:e2e

# 运行特定测试
npx playwright test tests/e2e/smoke.spec.ts

# 交互式测试UI
pnpm run test:e2e:ui

# 调试模式
pnpm run test:e2e:debug
```

### 测试覆盖
- **6个测试套件**: 覆盖所有功能模块
- **50+个测试用例**: 详细的功能验证
- **性能基准**: 加载和生成时间验证
- **错误处理**: 边界情况和异常处理
- **兼容性**: 多浏览器和设备测试

## 📁 项目结构

```
vue3-example/
├── src/
│   ├── components/          # Vue组件
│   ├── views/              # 页面视图
│   ├── App.vue             # 主应用组件
│   └── main.ts             # 应用入口
├── tests/
│   └── e2e/                # E2E测试
│       ├── page-objects/   # 页面对象模型
│       ├── basic-example.spec.ts
│       ├── advanced-example.spec.ts
│       ├── style-example.spec.ts
│       ├── datatype-example.spec.ts
│       ├── performance-example.spec.ts
│       ├── integration.spec.ts
│       └── smoke.spec.ts   # 冒烟测试
├── playwright.config.ts    # Playwright配置
├── vite.config.ts          # Vite配置
└── package.json
```

## 🎨 使用示例

### 基本用法
```typescript
import { generateQRCode } from '@ldesign/qrcode'

// 生成基本二维码
const result = await generateQRCode('https://www.ldesign.com', {
  size: 200,
  format: 'canvas'
})

// 添加到DOM
document.getElementById('qr-container')?.appendChild(result.element)
```

### 带Logo的二维码
```typescript
const result = await generateQRCode('https://www.ldesign.com', {
  size: 300,
  logo: {
    src: 'path/to/logo.png',
    size: 60,
    shape: 'circle'
  }
})
```

### 样式定制
```typescript
const result = await generateQRCode('Hello World', {
  size: 250,
  foregroundColor: '#722ED1',
  backgroundColor: '#f1ecf9',
  margin: 10
})
```

## 🔍 功能验证

### 手动测试检查清单
- [ ] 页面正常加载，显示5个标签页
- [ ] 基础示例：文本输入、格式选择、尺寸调整
- [ ] 高级功能：Logo上传、批量生成
- [ ] 样式定制：颜色调整、预设样式、实时更新
- [ ] 数据类型：8种类型切换、示例数据填充
- [ ] 性能测试：测试执行、结果显示
- [ ] 响应式：移动端适配
- [ ] 错误处理：空输入、无效数据
- [ ] 控制台：无JavaScript错误

## 📈 性能指标

- **页面加载时间**: < 3秒
- **二维码生成时间**: < 1秒
- **实时更新响应**: < 500ms
- **内存使用**: 稳定，无泄漏
- **包大小**: 优化后的构建产物

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [@ldesign/qrcode 文档](../../README.md)
- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Playwright 测试文档](https://playwright.dev/)

---

**注意**: 这是一个示例项目，展示了@ldesign/qrcode库的完整功能。在生产环境中使用时，请根据实际需求进行适当的配置和优化。
