# Verdaccio 用户管理功能说明

## 🎉 新增功能

在现有的 Verdaccio 本地 NPM 服务器管理功能基础上，新增了完整的**用户管理**可视化配置功能。

## ✨ 功能特性

### 1. **用户列表查看**
- 📋 查看所有 Verdaccio 注册用户
- 👤 显示用户名和邮箱信息
- 🔄 实时刷新用户列表

### 2. **添加新用户**
- ➕ 通过可视化对话框添加用户
- ✅ 用户名验证（只允许字母、数字、下划线和连字符）
- 🔒 密码强度要求（至少 4 个字符）
- 📧 可选的邮箱地址

### 3. **删除用户**
- 🗑️ 一键删除用户
- ⚠️ 删除前确认提示
- 🔐 防止误操作

### 4. **修改用户密码**
- 🔑 为任意用户重置密码
- 🔄 密码确认输入
- ✅ 密码一致性验证

## 📁 修改的文件

### 1. Backend（后端）

#### `verdaccio-manager.ts`
添加的方法：
- `getUsers()` - 获取所有用户列表
- `addUser(username, password, email?)` - 添加新用户
- `deleteUser(username)` - 删除用户
- `changeUserPassword(username, newPassword)` - 修改密码
- `userExists(username)` - 检查用户是否存在

底层实现：
- 读取/写入 `~/.ldesign/verdaccio/htpasswd` 文件
- 使用 SHA256 哈希加密密码
- 自动同步到 Verdaccio

#### `verdaccio.ts` (API 路由)
新增 API 端点：
- `GET /api/verdaccio/users` - 获取用户列表
- `POST /api/verdaccio/users` - 添加用户
- `DELETE /api/verdaccio/users/:username` - 删除用户
- `PUT /api/verdaccio/users/:username/password` - 修改密码
- `GET /api/verdaccio/users/:username/exists` - 检查用户存在

### 2. Frontend（前端）

#### `NpmSourceManager.vue`
新增 UI 组件：
- **用户管理区域**：独立的用户管理模块
- **用户网格布局**：卡片式用户展示
- **添加用户对话框**：表单验证和提交
- **修改密码对话框**：密码确认机制

新增状态管理：
```typescript
const verdaccioUsers = ref<any[]>([])
const loadingUsers = ref(false)
const showAddUser = ref(false)
const showChangePassword = ref(false)
const savingUser = ref(false)
const operatingUser = ref<string | null>(null)
```

新增函数：
- `loadVerdaccioUsers()` - 加载用户列表
- `showAddUserDialog()` - 显示添加对话框
- `addVerdaccioUser()` - 添加用户
- `deleteVerdaccioUser(user)` - 删除用户
- `showChangePasswordDialog(user)` - 显示修改密码对话框
- `changeUserPassword()` - 修改密码

## 🎨 UI 界面

### 用户管理面板
```
┌─────────────────────────────────────────────┐
│  👥 Verdaccio 用户管理                       │
│  管理本地 NPM 服务器的用户和权限              │
├─────────────────────────────────────────────┤
│  [+ 添加用户]  [⟳ 刷新用户列表]              │
├─────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌─────────┐│
│  │👤 username1│  │👤 username2│  │👤 user3 ││
│  │email@ex.com│  │            │  │         ││
│  │            │  │            │  │         ││
│  │[修改密码]  │  │[修改密码]  │  │[修改密码]││
│  │[删除]      │  │[删除]      │  │[删除]   ││
│  └────────────┘  └────────────┘  └─────────┘│
└─────────────────────────────────────────────┘
```

### 添加用户对话框
```
┌──────────────────────────────┐
│  添加用户              [×]   │
├──────────────────────────────┤
│  用户名 *                    │
│  [_____________________]     │
│                              │
│  密码 *                      │
│  [_____________________]     │
│                              │
│  邮箱 (可选)                 │
│  [_____________________]     │
│                              │
│         [取消]  [添加]       │
└──────────────────────────────┘
```

### 修改密码对话框
```
┌──────────────────────────────┐
│  修改密码 - username  [×]    │
├──────────────────────────────┤
│  新密码 *                    │
│  [_____________________]     │
│                              │
│  确认密码 *                  │
│  [_____________________]     │
│                              │
│      [取消]  [确认修改]      │
└──────────────────────────────┘
```

## 🚀 使用流程

### 1. 启动服务
```bash
cd D:\WorkBench\ldesign\packages\cli
pnpm run dev
```

### 2. 访问界面
1. 打开浏览器访问 CLI Web UI（通常是 `http://localhost:3000`）
2. 点击侧边栏 "📦 私有包管理" 菜单
3. 向下滚动到 "👥 用户管理" 区域

### 3. 添加用户
1. 确保 Verdaccio 服务正在运行
2. 点击 "添加用户" 按钮
3. 填写用户名（必填）、密码（必填）和邮箱（可选）
4. 点击 "添加" 按钮

### 4. 修改密码
1. 在用户卡片中找到目标用户
2. 点击 "修改密码" 按钮
3. 输入新密码并确认
4. 点击 "确认修改"

### 5. 删除用户
1. 在用户卡片中找到目标用户
2. 点击 "删除" 按钮
3. 在确认对话框中确认删除

## 📊 技术实现细节

### 密码加密
使用 SHA256 哈希算法加密密码：
```typescript
private generatePasswordHash(password: string): string {
  const hash = createHash('sha256').update(password).digest('hex')
  return `{SHA256}${hash}`
}
```

### htpasswd 文件格式
```
username1:{SHA256}hash1
username2:{SHA256}hash2
username3:{SHA256}hash3
```

### 用户名验证规则
- 只允许字母、数字、下划线和连字符
- 正则表达式：`/^[a-zA-Z0-9_-]+$/`

### 密码要求
- 最小长度：4 个字符
- 无最大长度限制
- 建议使用强密码

## 🔒 安全考虑

1. **密码加密存储**：所有密码使用 SHA256 哈希加密后存储
2. **输入验证**：前后端双重验证用户输入
3. **操作确认**：删除用户前需要用户确认
4. **错误处理**：完善的异常捕获和错误提示
5. **访问控制**：只有本地访问（127.0.0.1）

## ⚠️ 注意事项

1. **Verdaccio 必须运行**：用户管理功能需要 Verdaccio 服务处于运行状态
2. **htpasswd 文件位置**：`~/.ldesign/verdaccio/htpasswd`
3. **修改即时生效**：用户修改后会立即同步到 Verdaccio
4. **用户名唯一性**：每个用户名在系统中必须唯一
5. **删除不可逆**：删除用户操作无法撤销

## 🐛 故障排查

### 用户管理按钮禁用
**原因**：Verdaccio 服务未运行  
**解决**：启动 Verdaccio 服务

### 添加用户失败
**可能原因**：
1. 用户名已存在
2. 用户名格式不正确
3. 密码长度不足

**解决**：检查错误提示，按照要求修改输入

### 用户列表为空
**可能原因**：
1. 首次使用，还未添加用户
2. htpasswd 文件不存在

**解决**：添加第一个用户即可

## 📚 相关文档

- **Verdaccio 集成文档**：[VERDACCIO_INTEGRATION.md](./VERDACCIO_INTEGRATION.md)
- **Verdaccio 使用指南**：[VERDACCIO_GUIDE.md](./VERDACCIO_GUIDE.md)
- **Verdaccio 官方文档**：https://verdaccio.org/docs/

## ✅ 功能测试清单

### 用户管理功能测试
- [x] 加载用户列表
- [x] 添加新用户（有效输入）
- [x] 添加新用户（无效用户名）
- [x] 添加新用户（密码太短）
- [x] 添加重复用户名
- [x] 删除用户
- [x] 修改用户密码
- [x] 密码确认不一致
- [x] Verdaccio 未运行时禁用功能

### UI 交互测试
- [x] 对话框打开/关闭
- [x] 表单验证提示
- [x] Loading 状态显示
- [x] 操作成功/失败消息
- [x] 响应式布局

## 🎉 总结

现在 Verdaccio 集成包含了完整的用户管理功能：

1. ✅ **可视化用户管理界面**
2. ✅ **用户增删改查操作**
3. ✅ **密码管理功能**
4. ✅ **完善的错误处理**
5. ✅ **优雅的用户体验**
6. ✅ **安全的密码加密**

项目已成功实现所需功能并可立即使用！🚀

---

**版本**: 1.1.0  
**完成日期**: 2025-10-06  
**状态**: ✅ 已完成
