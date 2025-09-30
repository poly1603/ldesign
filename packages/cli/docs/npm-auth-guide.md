# NPM 官方源登录方式指南

本文档介绍了多种官方可靠的 NPM 登录方式，帮助您选择最适合的认证方案。

## 🎯 推荐方案对比

| 方式 | 安全性 | 易用性 | 适用场景 | 推荐度 |
|------|--------|--------|----------|--------|
| **Access Token** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | CI/CD、自动化工具、长期使用 | ⭐⭐⭐⭐⭐ |
| **交互式登录** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 开发环境、个人使用 | ⭐⭐⭐⭐ |
| **npm-cli-login** | ⭐⭐⭐ | ⭐⭐⭐ | 非交互式脚本、批量操作 | ⭐⭐⭐ |
| **.npmrc 配置** | ⭐⭐⭐⭐ | ⭐⭐⭐ | 团队共享配置、Docker 环境 | ⭐⭐⭐⭐ |

---

## 方式 1: 使用 Access Token（⭐ 最推荐）

### 优点
- ✅ 最安全：不需要暴露密码
- ✅ 易管理：可随时在网站上撤销
- ✅ 细粒度权限：可设置只读、发布等不同权限
- ✅ 适合自动化：非交互式操作

### 获取 Token

#### 1. npmjs.com 官方源
1. 登录 [https://www.npmjs.com/](https://www.npmjs.com/)
2. 点击头像 → **Access Tokens**
3. 点击 **Generate New Token**
4. 选择 Token 类型：
   - **Automation**: 适用于 CI/CD（只读 + 发布）
   - **Publish**: 适用于发布包
   - **Read-only**: 只读访问
5. 复制生成的 Token

#### 2. 私有 NPM 源（如 Verdaccio）
- 通常在源的 Web 界面上生成
- 或使用 CLI 命令生成（具体命令因源而异）

### 使用方式

#### 方式 A: 通过代码使用
```typescript
import { loginWithToken } from './services/npm-auth'

const result = await loginWithToken({
  registry: 'https://registry.npmjs.org/',
  token: 'npm_xxxxxxxxxxxxxxxx'
})

if (result.success) {
  console.log(`登录成功，用户: ${result.username}`)
}
```

#### 方式 B: 手动配置到 .npmrc
```bash
# 方法 1: 使用命令行
npm config set //registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxxxxx

# 方法 2: 直接编辑 ~/.npmrc 文件
echo "//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxxxxx" >> ~/.npmrc
```

### 验证登录状态
```bash
npm whoami --registry=https://registry.npmjs.org/
```

---

## 方式 2: 交互式登录（最简单）

### 优点
- ✅ 官方推荐方式
- ✅ 操作简单，无需额外配置
- ✅ 支持双因素认证（2FA）

### 使用方式

#### 方式 A: 直接使用命令行
```bash
npm login --registry=https://registry.npmjs.org/
```

按提示输入：
1. **Username**: 您的 npm 用户名
2. **Password**: 您的密码
3. **Email**: 您的邮箱
4. **OTP**: 如果启用了 2FA，输入一次性密码

#### 方式 B: 通过代码调用
```typescript
import { loginInteractive } from './services/npm-auth'

const result = await loginInteractive('https://registry.npmjs.org/')

if (result.success) {
  console.log(`登录成功，用户: ${result.username}`)
}
```

---

## 方式 3: 使用 npm-cli-login（非交互式）

### 优点
- ✅ 非交互式操作
- ✅ 适合脚本化
- ✅ 不需要手动输入

### 缺点
- ⚠️ 需要额外安装
- ⚠️ 不支持 2FA
- ⚠️ 安全性相对较低（需要暴露密码）

### 安装
```bash
npm install -g npm-cli-login
```

### 使用方式

#### 方式 A: 命令行使用
```bash
npm-cli-login \
  -u your-username \
  -p your-password \
  -e your-email@example.com \
  -r https://registry.npmjs.org/
```

#### 方式 B: 通过代码调用
```typescript
import { loginWithCredentials } from './services/npm-auth'

const result = await loginWithCredentials({
  registry: 'https://registry.npmjs.org/',
  username: 'your-username',
  password: 'your-password',
  email: 'your-email@example.com'
})

if (result.success) {
  console.log(`登录成功，用户: ${result.username}`)
}
```

---

## 方式 4: 直接配置 .npmrc

### 优点
- ✅ 完全控制配置
- ✅ 适合团队共享
- ✅ 适合 Docker/CI 环境

### 使用方式

#### Token 方式（推荐）
```bash
# ~/.npmrc
//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxxxxx
```

#### Base64 编码方式
```bash
# 1. 生成 base64 编码
echo -n "username:password" | base64
# 输出: dXNlcm5hbWU6cGFzc3dvcmQ=

# 2. 配置到 ~/.npmrc
//registry.npmjs.org/:_auth=dXNlcm5hbWU6cGFzc3dvcmQ=
//registry.npmjs.org/:email=your-email@example.com
```

#### 通过代码配置
```typescript
import { loginWithNpmrc } from './services/npm-auth'

// 使用 Token
const result1 = await loginWithNpmrc({
  registry: 'https://registry.npmjs.org/',
  authConfig: {
    _authToken: 'npm_xxxxxxxxxxxxxxxx'
  }
})

// 使用用户名密码
const result2 = await loginWithNpmrc({
  registry: 'https://registry.npmjs.org/',
  authConfig: {
    username: 'your-username',
    password: 'your-password',
    email: 'your-email@example.com'
  }
})
```

---

## 🔒 安全最佳实践

### 1. Token 管理
- ✅ 定期轮换 Token
- ✅ 为不同场景使用不同 Token
- ✅ 及时撤销不再使用的 Token
- ❌ 不要将 Token 提交到 Git 仓库

### 2. 密码安全
- ✅ 使用强密码
- ✅ 启用双因素认证（2FA）
- ❌ 不要在脚本中硬编码密码
- ❌ 不要在日志中输出密码

### 3. 环境变量
```bash
# 推荐：使用环境变量存储敏感信息
export NPM_TOKEN="npm_xxxxxxxxxxxxxxxx"

# 在代码中使用
const token = process.env.NPM_TOKEN
```

### 4. CI/CD 配置
```yaml
# GitHub Actions 示例
- name: NPM Login
  run: |
    echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 🛠️ 智能登录方案

我们提供了一个智能登录函数，会根据提供的信息自动选择最合适的登录方式：

```typescript
import { smartLogin } from './services/npm-auth'

// 场景 1: 有 Token（优先使用）
const result1 = await smartLogin({
  registry: 'https://registry.npmjs.org/',
  token: 'npm_xxxxxxxxxxxxxxxx'
})

// 场景 2: 有完整凭据
const result2 = await smartLogin({
  registry: 'https://registry.npmjs.org/',
  username: 'your-username',
  password: 'your-password',
  email: 'your-email@example.com'
})

// 场景 3: 什么都没有（使用交互式登录）
const result3 = await smartLogin({
  registry: 'https://registry.npmjs.org/'
})
```

**优先级**:
1. Token 登录（如果提供了 `token`）
2. 凭据登录（如果提供了 `username`、`password`、`email`）
3. 交互式登录（默认）

---

## 📋 常见问题

### Q1: Token 过期了怎么办？
**A**: 在 npmjs.com 上重新生成一个新 Token，并更新 `.npmrc` 配置。

### Q2: 如何支持多个 NPM 源？
**A**: 在 `.npmrc` 中为每个源配置不同的 Token：
```bash
//registry.npmjs.org/:_authToken=token1
//my-registry.com/:_authToken=token2
```

### Q3: 如何在 Docker 中使用？
**A**: 使用构建参数传递 Token：
```dockerfile
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
RUN npm install
RUN rm ~/.npmrc
```

### Q4: 私有源登录失败怎么办？
**A**: 
1. 检查源的 URL 是否正确
2. 确认是否需要特殊的认证方式
3. 查看源的文档或联系管理员

---

## 📚 参考资料

- [NPM 官方文档 - Authentication](https://docs.npmjs.com/about-authentication-tokens)
- [NPM CLI 命令文档](https://docs.npmjs.com/cli/v9/commands/npm-login)
- [npm-cli-login GitHub](https://github.com/postmanlabs/npm-cli-login)
- [.npmrc 配置详解](https://docs.npmjs.com/cli/v9/configuring-npm/npmrc)