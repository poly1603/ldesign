# 更新日志

所有重要的项目变更都会记录在这个文件中。

本项目遵循 [语义化版本控制](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- 初始版本发布
- 核心表单引擎
- Vue 3 组件支持
- TypeScript 类型定义
- 响应式布局系统
- 验证引擎
- 条件渲染引擎
- 调试面板
- 完整的文档和示例

### 字段类型
- input - 文本输入框
- textarea - 多行文本
- select - 下拉选择
- radio - 单选框
- checkbox - 复选框
- switch - 开关
- date-picker - 日期选择器
- time-picker - 时间选择器
- upload - 文件上传

### 验证规则
- required - 必填验证
- minLength/maxLength - 长度验证
- min/max - 数值范围验证
- pattern - 正则表达式验证
- email - 邮箱格式验证
- phone - 手机号验证
- url - URL 格式验证
- custom - 自定义验证器

### 组合式函数
- useForm - 主表单逻辑
- useFormField - 字段逻辑
- useFormValidation - 验证逻辑
- useFormLayout - 布局逻辑

### 工具函数
- form-utils - 表单工具函数
- validation-utils - 验证工具函数
- layout-utils - 布局工具函数
- type-guards - 类型守卫函数

## [1.0.0] - 2024-01-XX

### 新增
- 🎉 首次发布
- ✨ 完整的动态表单解决方案
- 🚀 Vue 3 + TypeScript 支持
- 📱 响应式布局
- ✅ 强大的验证系统
- 🔄 条件渲染
- 🛠 调试工具
- 📖 完整的文档

---

## 版本说明

### 版本格式
本项目使用 [语义化版本控制](https://semver.org/lang/zh-CN/)：

- **主版本号**：当你做了不兼容的 API 修改
- **次版本号**：当你做了向下兼容的功能性新增
- **修订号**：当你做了向下兼容的问题修正

### 变更类型
- **新增** - 新功能
- **变更** - 对现有功能的变更
- **废弃** - 即将移除的功能
- **移除** - 已移除的功能
- **修复** - 问题修复
- **安全** - 安全相关的修复

### 重大变更
重大变更会在版本号中体现，并在变更日志中详细说明迁移指南。
