# LDesign 工具包集合

## 📦 工具包概览

LDesign 提供了一套完整的开发工具链，帮助开发者提高开发效率、保证代码质量、优化性能表现。

## 🛠️ 工具包详细说明

### 1. @ldesign/formatter - 代码格式化工具

**功能特性：**
- 🎨 **统一配置管理**：集中管理 Prettier、ESLint、Stylelint 配置
- 🔄 **批量格式化**：一键格式化整个项目或指定目录
- 🪝 **Git Hooks 集成**：自动配置 pre-commit/pre-push hooks
- ⚙️ **自定义规则**：支持项目级规则覆盖
- 📈 **增量格式化**：只格式化变更的文件，提高效率

**使用场景：**
- 团队代码风格统一
- CI/CD 流程中的代码检查
- IDE 集成自动格式化

---

### 2. @ldesign/translator - 国际化翻译管理

**功能特性：**
- 🔍 **文本提取**：自动扫描代码中的中文文本
- 🌐 **翻译管理**：批量翻译、翻译审核、版本控制
- 🔗 **多平台对接**：支持百度/谷歌/DeepL 等翻译 API
- 📊 **Excel 导入导出**：方便非技术人员参与翻译
- 👁️ **实时预览**：翻译结果实时预览

**使用场景：**
- 多语言项目国际化
- 翻译资源管理
- 翻译质量审核

---

### 3. @ldesign/mock - Mock 数据管理

**功能特性：**
- 🖥️ **Mock Server**：本地 Mock 服务器，支持 RESTful/GraphQL
- 🎲 **数据生成器**：基于 faker.js 的智能数据生成
- 🎭 **场景管理**：多场景 Mock 数据切换
- ⏱️ **延迟模拟**：模拟网络延迟和错误状态
- 💾 **数据持久化**：Mock 数据本地存储和版本管理

**使用场景：**
- 前后端并行开发
- 接口测试
- 演示环境搭建

---

### 4. @ldesign/performance - 性能优化工具

**功能特性：**
- 📊 **构建分析**：webpack-bundle-analyzer 集成
- 📈 **性能监控**：Core Web Vitals 指标追踪
- 🚀 **资源优化**：图片懒加载、代码分割建议
- 📋 **性能报告**：生成详细的性能优化报告
- 🤖 **CI 集成**：性能预算控制，自动化性能测试

**使用场景：**
- 性能瓶颈分析
- 构建产物优化
- 性能监控告警

---

### 5. @ldesign/env - 环境配置管理

**功能特性：**
- 🔧 **多环境管理**：dev/test/staging/prod 环境配置
- ✅ **配置验证**：环境变量类型和必填项验证
- 🔒 **配置加密**：敏感信息加密存储
- 🔄 **动态切换**：运行时环境配置切换
- 🧬 **配置继承**：基础配置和环境配置合并

**使用场景：**
- 多环境部署管理
- 配置安全管理
- 环境变量验证

---

### 6. @ldesign/changelog - 版本管理工具

**功能特性：**
- 📝 **自动生成**：基于 commit 信息自动生成 CHANGELOG
- 📌 **版本标记**：自动版本号管理和 Git tag 创建
- 📑 **多格式输出**：支持 Markdown/JSON/HTML 格式
- 🎨 **模板定制**：自定义 CHANGELOG 模板
- 🔗 **Issue 关联**：自动关联 Issue 和 PR 链接

**使用场景：**
- 版本发布管理
- 变更日志维护
- 版本追踪

---

### 7. @ldesign/docs - 文档生成工具

**功能特性：**
- 📚 **API 文档生成**：从代码注释自动生成 API 文档
- 🎨 **组件文档**：React/Vue 组件文档和示例生成
- 📖 **Markdown 支持**：支持 Markdown 文档编写和预览
- 🔍 **文档搜索**：全文搜索功能
- 🌐 **静态站点**：一键生成文档静态站点

**使用场景：**
- API 文档维护
- 组件库文档
- 技术文档管理

---

### 8. @ldesign/testing - 测试工具集

**功能特性：**
- 🧪 **单元测试**：Jest/Vitest 配置和工具函数
- 🎭 **E2E 测试**：Playwright/Cypress 集成
- 📸 **快照测试**：组件快照测试管理
- 📊 **覆盖率报告**：测试覆盖率统计和报告
- 🤖 **测试生成**：基于 AI 的测试用例生成

**使用场景：**
- 自动化测试
- 测试覆盖率管理
- 回归测试

---

### 9. @ldesign/deployer - 部署自动化工具

**功能特性：**
- 🚀 **一键部署**：支持多种部署目标（服务器/CDN/容器）
- 🔄 **回滚机制**：版本回滚和灰度发布
- 📝 **部署脚本**：自定义部署流程脚本
- 🔔 **通知集成**：部署状态通知（钉钉/企业微信/Slack）
- 📊 **部署日志**：详细的部署日志和历史记录

**使用场景：**
- CI/CD 流程集成
- 多环境部署
- 自动化发布

---

### 10. @ldesign/analyzer - 代码分析工具

**功能特性：**
- 🔍 **代码质量分析**：复杂度、重复代码、代码异味检测
- 📊 **依赖分析**：依赖关系图、循环依赖检测
- 🐛 **安全扫描**：依赖漏洞扫描和安全建议
- 📈 **趋势分析**：代码质量趋势图表
- 📋 **自定义规则**：可配置的分析规则

**使用场景：**
- 代码审查
- 技术债务管理
- 安全审计

---

## 🚀 快速开始

### 安装

```bash
# 安装所有工具包
npm install @ldesign/formatter @ldesign/translator @ldesign/mock ... --save-dev

# 或者按需安装
npm install @ldesign/formatter --save-dev
```

### 配置

在项目根目录创建 `.ldesign.config.js`：

```javascript
module.exports = {
  formatter: {
    // formatter 配置
  },
  translator: {
    // translator 配置
  },
  // ... 其他工具配置
}
```

### 使用

```bash
# 格式化代码
npx ldesign format

# 启动 Mock 服务
npx ldesign mock

# 生成文档
npx ldesign docs

# 运行测试
npx ldesign test
```

## 📦 工具包关系图

```mermaid
graph TD
    A[LDesign Tools] --> B[开发工具]
    A --> C[质量保证]
    A --> D[部署运维]
    
    B --> B1[@ldesign/formatter]
    B --> B2[@ldesign/translator]
    B --> B3[@ldesign/mock]
    B --> B4[@ldesign/env]
    B --> B5[@ldesign/docs]
    
    C --> C1[@ldesign/testing]
    C --> C2[@ldesign/analyzer]
    C --> C3[@ldesign/performance]
    
    D --> D1[@ldesign/deployer]
    D --> D2[@ldesign/changelog]
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License