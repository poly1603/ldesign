# 安装

## 包管理器安装

使用你喜欢的包管理器安装 @ldesign/http：

::: code-group

```bash [pnpm]
pnpm add @ldesign/http
```

```bash [npm]
npm install @ldesign/http
```

```bash [yarn]
yarn add @ldesign/http
```

:::

## 依赖要求

- **Node.js**: >= 18.0.0
- **TypeScript**: >= 5.0.0 (可选，但强烈推荐)
- **Vue**: ^3.3.0 (如果使用 Vue 集成)

## 适配器依赖

@ldesign/http 默认包含 Fetch 适配器，无需额外依赖。如果你想使用其他适配器，需要安装对应的依赖：

### Axios 适配器

```bash
pnpm add axios
```

### Alova 适配器

```bash
pnpm add alova
```

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## CDN 使用

如果你想通过 CDN 使用，可以使用以下链接：

```html
<!-- 使用 unpkg -->
<script src="https://unpkg.com/@ldesign/http"></script>

<!-- 使用 jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/http"></script>
```

通过 CDN 使用时，库会暴露为全局变量 `LDesignHttp`：

```html
<script>
  const { createHttpClient } = LDesignHttp

  const client = createHttpClient({
    baseURL: 'https://api.example.com'
  })
</script>
```

## TypeScript 配置

如果你使用 TypeScript，建议在 `tsconfig.json` 中添加以下配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## 验证安装

创建一个简单的测试文件来验证安装：

```typescript
import { createHttpClient } from '@ldesign/http'

const client = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

client.get('/users')
  .then(response => {
    console.log('安装成功！', response.data)
  })
  .catch(error => {
    console.error('请求失败:', error)
  })
```

## 开发环境设置

如果你想参与开发或从源码构建：

```bash
# 克隆仓库
git clone https://github.com/ldesign/http.git
cd http

# 安装依赖
pnpm install

# 运行测试
pnpm test

# 构建项目
pnpm build

# 启动文档
pnpm docs:dev
```

## 下一步

- [快速开始](/guide/getting-started) - 开始使用 @ldesign/http
- [HTTP 客户端](/guide/client) - 了解客户端的详细用法
