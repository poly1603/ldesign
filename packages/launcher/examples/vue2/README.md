# Vue 2 + @ldesign/launcher 示例

这是一个使用 Vue 2.x 和 @ldesign/launcher 构建的完整示例项目。

## 项目特性

- 🚀 **Vue 2.7+** - 使用最新版本的 Vue 2，支持 Composition API
- ⚡ **Vite 驱动** - 基于 Vite 的快速构建工具
- 🛠️ **TypeScript** - 完整的 TypeScript 支持
- 🎨 **SCSS 样式** - 内置 SCSS 预处理器支持
- 🌙 **主题系统** - 内置浅色/深色主题切换
- 📱 **响应式设计** - 移动端友好的响应式布局
- 🎯 **零配置** - 开箱即用，无需复杂配置

## 技术栈

- **前端框架**: Vue 2.7 with Composition API
- **构建工具**: Vite + @ldesign/launcher
- **开发语言**: TypeScript
- **样式预处理**: SCSS
- **代码规范**: ESLint + TypeScript ESLint

## 项目结构

```
vue2/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── CounterButton.vue    # 计数器组件
│   │   ├── ThemeToggle.vue      # 主题切换组件
│   │   └── FeatureCard.vue      # 特性卡片组件
│   ├── styles/             # 样式文件
│   │   └── main.scss           # 全局样式和主题变量
│   ├── App.vue             # 根组件
│   └── main.ts             # 应用入口文件
├── public/                 # 静态资源
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── launcher.config.ts      # @ldesign/launcher 配置
├── tsconfig.json           # TypeScript 配置
└── README.md               # 项目文档
```

## 开发指南

### 安装依赖

```bash
# 在项目根目录下安装依赖
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

开发服务器将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

构建产物将输出到 `dist` 目录。

### 预览构建结果

```bash
npm run preview
# 或
yarn preview
# 或
pnpm preview
```

## 核心功能展示

### 1. Composition API 使用

项目展示了如何在 Vue 2.7 中使用 Composition API：

```vue
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';

export default defineComponent({
  setup() {
    const count = ref(0);
    
    const increment = () => {
      count.value++;
    };
    
    return {
      count,
      increment,
    };
  },
});
</script>
```

### 2. TypeScript 集成

完整的 TypeScript 支持，包括：

- Vue SFC 的类型检查
- Props 和 Emits 类型定义
- 响应式数据的类型推导

### 3. 响应式主题系统

使用 CSS 变量实现的主题切换系统：

```scss
// 浅色主题
:root {
  --primary-color: #3b82f6;
  --background-color: #ffffff;
  --text-primary: #1f2937;
}

// 深色主题
[data-theme="dark"] {
  --primary-color: #60a5fa;
  --background-color: #111827;
  --text-primary: #f9fafb;
}
```

### 4. 组件化开发

项目包含了多个可复用的组件：

- **CounterButton** - 展示状态管理和用户交互
- **ThemeToggle** - 主题切换功能
- **FeatureCard** - 展示项目特性的卡片组件

## 配置说明

### launcher.config.ts

```typescript
import { defineConfig } from '@ldesign/launcher';
import vue2Plugin from '@vitejs/plugin-vue2';

export default defineConfig({
  plugins: [vue2Plugin()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### 主要配置特性

- **Vue 2 插件**: 使用 `@vitejs/plugin-vue2` 支持 Vue 2 单文件组件
- **开发服务器**: 配置端口和主机设置
- **构建选项**: 输出目录和 source map 设置
- **TypeScript**: 完整的 TypeScript 编译支持

## 浏览器支持

- Chrome ≥ 64
- Firefox ≥ 69
- Safari ≥ 12
- Edge ≥ 79

## 学习资源

- [Vue 2 官方文档](https://v2.vuejs.org/)
- [Vue 2.7 发布说明](https://blog.vuejs.org/posts/vue-2-7-naruto.html)
- [Vite 官方文档](https://vitejs.dev/)
- [@ldesign/launcher 文档](https://github.com/ldesign/launcher)

## 许可证

MIT License
