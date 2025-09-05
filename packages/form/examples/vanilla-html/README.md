# LDesign Form - 原生 HTML 示例

这个示例项目展示了如何在原生 HTML 和 JavaScript 环境中使用 LDesign Form 的核心 API。

## 🚀 快速开始

### 安装依赖

```bash
# 在项目根目录安装依赖
pnpm install

# 进入示例目录
cd packages/form/examples/vanilla-html

# 安装示例项目依赖
pnpm install
```

### 运行示例

```bash
# 启动开发服务器
pnpm dev

# 或者使用 start 命令
pnpm start
```

服务器将在 `http://localhost:3000` 启动，自动打开浏览器。

## 📁 项目结构

```
vanilla-html/
├── index.html              # 主页面 - 示例导航
├── basic-form.html         # 基础表单示例
├── dynamic-fields.html     # 动态字段示例
├── validation.html         # 验证示例
├── css/
│   └── styles.css         # 通用样式文件
├── js/
│   ├── main.js            # 主要逻辑和工具函数
│   ├── basic-form.js      # 基础表单逻辑
│   ├── dynamic-fields.js  # 动态字段逻辑
│   └── validation.js      # 验证逻辑
├── package.json           # 项目配置
└── README.md              # 说明文档
```

## 🎯 示例说明

### 1. 基础表单示例 (`basic-form.html`)

展示如何使用 LDesign Form 的核心 API 创建和管理表单：

- 创建表单实例
- 注册字段
- 处理表单提交
- 基础验证

### 2. 动态字段示例 (`dynamic-fields.html`)

展示如何动态添加和删除字段：

- 动态添加字段
- 动态删除字段
- 数组字段管理
- 字段状态同步

### 3. 验证示例 (`validation.html`)

展示各种验证功能：

- 内置验证器使用
- 自定义验证器
- 异步验证
- 验证结果显示

## 🔧 核心 API 使用

### 创建表单

```javascript
import { createForm } from '@ldesign/form';

const form = createForm({
  initialValues: {
    name: '',
    email: ''
  }
});
```

### 注册字段

```javascript
const nameField = form.registerField({
  name: 'name',
  rules: [
    { required: true, message: '姓名是必填项' }
  ]
});
```

### 处理表单提交

```javascript
form.onSubmit((event) => {
  if (event.valid) {
    console.log('表单数据:', event.data);
  } else {
    console.log('验证失败:', event.errors);
  }
});
```

## 🎨 样式说明

项目使用了 LDesign 设计系统的 CSS 变量，确保与整个设计系统的一致性。主要样式包括：

- 表单布局样式
- 字段样式
- 验证错误样式
- 按钮和交互样式

## 📝 注意事项

1. **依赖关系**: 确保 `@ldesign/form` 已经构建完成
2. **浏览器兼容性**: 支持现代浏览器（ES2020+）
3. **开发服务器**: 使用 http-server 提供本地开发环境
4. **模块导入**: 使用 ES6 模块语法导入 LDesign Form

## 🤝 贡献

如果您发现问题或有改进建议，欢迎提交 Issue 或 Pull Request。

## 📄 许可证

MIT © LDesign Team
