# LDesign App - Vite 版本

这是 LDesign 工作空间的演示应用，已成功迁移到 Vite 构建系统。

## 🚀 功能特性

### ✅ 已完成的迁移
- **构建系统**: 从 @ldesign/launcher 迁移到 Vite
- **开发服务器**: 使用 Vite 开发服务器，支持 HMR
- **TypeScript**: 完整的 TypeScript 支持和类型检查
- **路径映射**: 配置了所有工作空间包的 alias
- **Vue 3**: 完整的 Vue 3 + Composition API 支持

### 🔌 集成的插件系统
- **路由系统**: 基于 Vue Router 的路由管理
- **模板引擎**: 动态模板加载和渲染
- **颜色系统**: 主题色彩管理和切换
- **国际化**: 多语言支持和切换
- **尺寸检测**: 响应式尺寸管理
- **HTTP 客户端**: 网络请求处理
- **状态管理**: 全局状态管理
- **加密工具**: 数据加密和解密
- **缓存系统**: 智能缓存管理
- **API 管理**: 统一 API 接口管理
- **设备检测**: 设备类型和状态检测 🆕

### 📦 工作空间包集成

所有工作空间包都已配置好 alias，可以直接导入使用：

```typescript
// 颜色系统
import { generateColorPalette } from '@ldesign/color'
import { useTheme } from '@ldesign/color/vue'

// 缓存系统
import { createCache } from '@ldesign/cache'
import { useCache } from '@ldesign/cache/vue'

// 设备检测
import { detectDevice, createDeviceEnginePlugin } from '@ldesign/device'
import { useDevice } from '@ldesign/device/vue'

// HTTP 客户端
import { createHttpClient } from '@ldesign/http'
import { useHttp } from '@ldesign/http/vue'

// 加密工具
import { hash, encrypt } from '@ldesign/crypto'
import { useCrypto } from '@ldesign/crypto/vue'

// 状态管理
import { createStore } from '@ldesign/store'
import { useStore } from '@ldesign/store/vue'

// 尺寸检测
import { getViewportSize } from '@ldesign/size'
import { useSize } from '@ldesign/size/vue'

// 工具函数
import { isObject, deepClone } from '@ldesign/shared'

// 路由系统
import { createRouter } from '@ldesign/router'
import { useRouter } from '@ldesign/router/vue'

// 模板系统
import { createTemplate } from '@ldesign/template'
import { useTemplate } from '@ldesign/template/vue'

// 主题系统
import { createTheme } from '@ldesign/theme'
import { useTheme } from '@ldesign/theme/vue'

// 水印功能
import { createWatermark } from '@ldesign/watermark'
import { useWatermark } from '@ldesign/watermark/vue'

// 国际化
import { createI18n } from '@ldesign/i18n'
import { useI18n } from '@ldesign/i18n/vue'

// PDF 处理
import { createPDF } from '@ldesign/pdf'
import { usePDF } from '@ldesign/pdf/vue'

// 二维码
import { generateQRCode } from '@ldesign/qrcode'
import { useQRCode } from '@ldesign/qrcode/vue'

// 表单系统
import { createForm } from '@lemonform/form'
import { useForm } from '@lemonform/form/vue'

// Git 工具
import { Git } from '@ldesign/git'

// 引擎核心
import { createEngine } from '@ldesign/engine'
import { useEngine } from '@ldesign/engine/vue'

// API 工具
import { createAPI } from '@ldesign/api'
import { useAPI } from '@ldesign/api/vue'

// 组件库
import { Button, Input } from '@ldesign/component'

// 工具包
import { utils } from '@ldesign/kit'
```

## 🛠️ 开发环境

### 启动开发服务器

```bash
cd app
pnpm dev
```

服务器将在 `http://localhost:3001` 启动。

### 构建生产版本

```bash
cd app
pnpm build
```

### 预览生产构建

```bash
cd app
pnpm preview
```

### 类型检查

```bash
cd app
pnpm type-check
```

## 📁 项目结构

```
app/
├── src/
│   ├── components/          # Vue 组件
│   ├── pages/              # 页面组件
│   ├── router/             # 路由配置
│   ├── styles/             # 样式文件
│   ├── utils/              # 工具函数
│   ├── App.vue             # 根组件
│   ├── bootstrap.ts        # 应用启动逻辑
│   └── main.ts             # 应用入口
├── public/                 # 静态资源
├── index.html              # HTML 模板
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── tsconfig.node.json      # Node.js TypeScript 配置
├── env.d.ts                # 环境类型定义
└── package.json            # 项目配置
```

## ⚙️ 配置说明

### Vite 配置 (vite.config.ts)

- **路径映射**: 配置了所有工作空间包的 alias
- **Vue 插件**: 支持 Vue 3 单文件组件
- **开发服务器**: 端口 3001，自动打开浏览器
- **构建优化**: ES2015 目标，源码映射，资源分离
- **依赖优化**: 预构建 Vue 和 Vue Router

### TypeScript 配置 (tsconfig.json)

- **现代 ES**: 目标 ES2020，支持最新语法
- **模块解析**: Bundler 模式，支持 Vite
- **严格模式**: 启用所有 TypeScript 严格检查
- **路径映射**: 与 Vite 配置保持一致

## 🧪 测试功能

访问 `/packages` 页面可以测试所有工作空间包的功能：

### 测试结果
- ✅ **@ldesign/color**: 颜色系统正常工作
- ✅ **@ldesign/cache**: 缓存功能正常工作
- ✅ **@ldesign/device**: 设备检测正常工作
- ❌ **@ldesign/http**: HTTP 请求受 CORS 限制
- ✅ **@ldesign/crypto**: 加密功能正常工作
- ✅ **@ldesign/store**: 状态管理正常工作
- ✅ **@ldesign/size**: 尺寸检测正常工作
- ✅ **@ldesign/shared**: 工具函数正常工作

**总体成功率: 87.5% (7/8)**

## 🔧 故障排除

### 常见问题

1. **TypeScript 错误**: 确保所有包的 tsconfig.json 配置正确
2. **导入错误**: 检查 vite.config.ts 中的 alias 配置
3. **热更新失败**: 重启开发服务器
4. **构建失败**: 检查依赖是否正确安装

### 解决方案

1. **清理缓存**:
   ```bash
   rm -rf node_modules/.vite
   pnpm dev
   ```

2. **重新安装依赖**:
   ```bash
   rm -rf node_modules
   pnpm install
   ```

3. **检查配置**:
   - 确保 vite.config.ts 中的路径正确
   - 确保 tsconfig.json 中的路径映射正确

## 🚀 部署

### 构建优化

生产构建已优化：
- **代码分割**: 按路由和组件分割
- **资源压缩**: CSS 和 JS 压缩
- **源码映射**: 便于调试
- **现代浏览器**: 支持 ES2015+

### 部署建议

1. **静态托管**: 可部署到 Netlify、Vercel、GitHub Pages
2. **CDN 加速**: 建议使用 CDN 加速静态资源
3. **缓存策略**: 配置适当的缓存头
4. **HTTPS**: 确保使用 HTTPS 协议

## 📝 更新日志

### v1.0.0 (2024-01-01)
- ✅ 完成从 @ldesign/launcher 到 Vite 的迁移
- ✅ 配置所有工作空间包的 alias
- ✅ 实现包功能测试页面
- ✅ 优化开发体验和构建性能
- ✅ 完善 TypeScript 支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 📄 许可证

ISC License
