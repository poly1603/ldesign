# NPM 登录快速参考

## 🚀 最快上手（推荐）

### 方式 1: Access Token（⭐ 最推荐）
```bash
# 1. 登录 https://www.npmjs.com/ 获取 Token
# 2. 配置 Token
npm config set //registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxxxxx

# 3. 验证
npm whoami --registry=https://registry.npmjs.org/
```

### 方式 2: 交互式登录（最简单）
```bash
npm login --registry=https://registry.npmjs.org/
# 按提示输入：用户名、密码、邮箱
```

---

## 📋 所有方式速查表

| 命令 | 说明 | 场景 |
|------|------|------|
| `npm login --registry=URL` | 交互式登录 | 个人开发 |
| `npm config set //URL/:_authToken=TOKEN` | Token 登录 | CI/CD |
| `npm whoami --registry=URL` | 检查登录状态 | 验证 |
| `npm logout --registry=URL` | 退出登录 | 清理 |
| `npm config get registry` | 查看当前源 | 调试 |
| `npm config set registry URL` | 切换源 | 切换 |

---

## 💻 代码集成

### 基础使用
```typescript
import { smartLogin, checkLoginStatus, logout } from './services/npm-auth'

// 登录（自动选择最佳方式）
const result = await smartLogin({
  registry: 'https://registry.npmjs.org/',
  token: 'npm_xxx' // 或 username + password + email
})

// 检查状态
const status = await checkLoginStatus('https://registry.npmjs.org/')

// 退出
await logout('https://registry.npmjs.org/')
```

### 具体方式
```typescript
// Token 登录
import { loginWithToken } from './services/npm-auth'
await loginWithToken({ registry: 'URL', token: 'TOKEN' })

// 交互式登录
import { loginInteractive } from './services/npm-auth'
await loginInteractive('URL')

// 凭据登录
import { loginWithCredentials } from './services/npm-auth'
await loginWithCredentials({
  registry: 'URL',
  username: 'USER',
  password: 'PASS',
  email: 'EMAIL'
})
```

---

## 🔐 .npmrc 配置示例

### Token 方式（推荐）
```ini
//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxxxxx
```

### Base64 方式
```bash
# 生成编码
echo -n "username:password" | base64

# 配置
//registry.npmjs.org/:_auth=BASE64_STRING
//registry.npmjs.org/:email=your@email.com
```

### 多源配置
```ini
# 官方源
//registry.npmjs.org/:_authToken=token1

# 私有源
//my-registry.com/:_authToken=token2
```

---

## 🛡️ 安全要点

✅ **应该做的**
- 使用 Access Token 代替密码
- 定期轮换 Token
- 使用环境变量存储敏感信息
- 为不同环境使用不同 Token

❌ **不应该做的**
- 将 Token 提交到 Git
- 在日志中输出密码/Token
- 共享个人 Token
- 使用弱密码

---

## 📱 常用场景

### CI/CD（GitHub Actions）
```yaml
- name: Setup NPM Auth
  run: echo "//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}" > ~/.npmrc
```

### Docker
```dockerfile
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc && \
    npm install && \
    rm ~/.npmrc
```

### 环境变量
```bash
export NPM_TOKEN="npm_xxxxxxxxxxxxxxxx"
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
```

---

## 🐛 故障排查

### 问题：401 Unauthorized
```bash
# 1. 检查登录状态
npm whoami --registry=https://registry.npmjs.org/

# 2. 重新登录
npm logout --registry=https://registry.npmjs.org/
npm login --registry=https://registry.npmjs.org/
```

### 问题：Token 无效
```bash
# 1. 在 npmjs.com 上生成新 Token
# 2. 更新配置
npm config set //registry.npmjs.org/:_authToken=NEW_TOKEN

# 3. 验证
npm whoami --registry=https://registry.npmjs.org/
```

### 问题：多个源冲突
```bash
# 查看所有配置
npm config list

# 删除特定配置
npm config delete //old-registry.com/:_authToken

# 查看 .npmrc 文件
cat ~/.npmrc
```

---

## 📞 获取帮助

- 📖 [完整文档](./npm-auth-guide.md)
- 🌐 [NPM 官方文档](https://docs.npmjs.com/)
- 💬 [项目 Issues](https://github.com/your-repo/issues)