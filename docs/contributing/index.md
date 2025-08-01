# 贡献指南

感谢您对 LDesign 项目的关注！我们欢迎所有形式的贡献，包括但不限于代码、文档、测试、反馈和建议。

## 🤝 参与方式

### 代码贡献

<div class="contribution-section">
  <div class="contribution-card">
    <h4>🐛 Bug 修复</h4>
    <p>发现并修复项目中的问题</p>
    <ul>
      <li>在 Issues 中报告 Bug</li>
      <li>提供复现步骤</li>
      <li>提交修复的 Pull Request</li>
    </ul>
  </div>
  
  <div class="contribution-card">
    <h4>✨ 新功能</h4>
    <p>为项目添加新的功能特性</p>
    <ul>
      <li>先在 Issues 中讨论需求</li>
      <li>获得维护者确认后开发</li>
      <li>确保功能完整且有测试</li>
    </ul>
  </div>
  
  <div class="contribution-card">
    <h4>📚 文档改进</h4>
    <p>完善项目文档和示例</p>
    <ul>
      <li>修正文档错误</li>
      <li>添加使用示例</li>
      <li>翻译多语言文档</li>
    </ul>
  </div>
  
  <div class="contribution-card">
    <h4>🧪 测试增强</h4>
    <p>提高代码测试覆盖率</p>
    <ul>
      <li>编写单元测试</li>
      <li>添加集成测试</li>
      <li>性能测试优化</li>
    </ul>
  </div>
</div>

### 非代码贡献

<div class="non-code-contributions">
  <div class="contrib-item">
    <h4>💬 社区支持</h4>
    <p>在 GitHub Discussions、Discord 或其他平台帮助其他用户解决问题</p>
  </div>
  
  <div class="contrib-item">
    <h4>🎨 设计建议</h4>
    <p>提供 UI/UX 设计建议，改善用户体验</p>
  </div>
  
  <div class="contrib-item">
    <h4>📢 推广宣传</h4>
    <p>在博客、社交媒体或技术会议上分享 LDesign</p>
  </div>
  
  <div class="contrib-item">
    <h4>🔍 问题反馈</h4>
    <p>报告使用过程中遇到的问题和改进建议</p>
  </div>
</div>

## 🚀 快速开始

### 环境准备

<div class="setup-section">
  <h4>1. 克隆项目</h4>
  <div class="code-block">
    <pre><code># 克隆仓库
git clone https://github.com/ldesign-org/ldesign.git
cd ldesign

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 运行测试
pnpm test</code></pre>
  </div>
</div>

<div class="setup-section">
  <h4>2. 开发环境要求</h4>
  <div class="requirements">
    <div class="req-item">
      <strong>Node.js:</strong> >= 16.0.0
    </div>
    <div class="req-item">
      <strong>pnpm:</strong> >= 7.0.0
    </div>
    <div class="req-item">
      <strong>Git:</strong> >= 2.20.0
    </div>
    <div class="req-item">
      <strong>编辑器:</strong> VS Code (推荐)
    </div>
  </div>
</div>

<div class="setup-section">
  <h4>3. 推荐的 VS Code 扩展</h4>
  <div class="code-block">
    <pre><code># .vscode/extensions.json
{
  "recommendations": [
    "vue.volar",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "vitest.explorer"
  ]
}</code></pre>
  </div>
</div>

## 📋 开发流程

### 分支策略

<div class="branch-strategy">
  <div class="branch-item">
    <h4>🌟 main</h4>
    <p>主分支，包含最新的稳定代码</p>
    <div class="branch-rules">
      <span class="rule">只接受来自 develop 的合并</span>
      <span class="rule">每次合并都会触发发布</span>
    </div>
  </div>
  
  <div class="branch-item">
    <h4>🚧 develop</h4>
    <p>开发分支，包含最新的开发代码</p>
    <div class="branch-rules">
      <span class="rule">功能开发的目标分支</span>
      <span class="rule">定期合并到 main</span>
    </div>
  </div>
  
  <div class="branch-item">
    <h4>🔧 feature/*</h4>
    <p>功能分支，用于开发新功能</p>
    <div class="branch-rules">
      <span class="rule">从 develop 创建</span>
      <span class="rule">完成后合并回 develop</span>
    </div>
  </div>
  
  <div class="branch-item">
    <h4>🐛 fix/*</h4>
    <p>修复分支，用于修复问题</p>
    <div class="branch-rules">
      <span class="rule">可从 main 或 develop 创建</span>
      <span class="rule">紧急修复可直接合并到 main</span>
    </div>
  </div>
</div>

### 提交规范

<div class="commit-convention">
  <h4>Conventional Commits 格式</h4>
  <div class="code-block">
    <pre><code>&lt;type&gt;[optional scope]: &lt;description&gt;

[optional body]

[optional footer(s)]</code></pre>
  </div>
  
  <div class="commit-types">
    <div class="commit-type">
      <strong>feat:</strong> 新功能
    </div>
    <div class="commit-type">
      <strong>fix:</strong> 问题修复
    </div>
    <div class="commit-type">
      <strong>docs:</strong> 文档更新
    </div>
    <div class="commit-type">
      <strong>style:</strong> 代码格式调整
    </div>
    <div class="commit-type">
      <strong>refactor:</strong> 代码重构
    </div>
    <div class="commit-type">
      <strong>perf:</strong> 性能优化
    </div>
    <div class="commit-type">
      <strong>test:</strong> 测试相关
    </div>
    <div class="commit-type">
      <strong>build:</strong> 构建相关
    </div>
    <div class="commit-type">
      <strong>ci:</strong> CI/CD 相关
    </div>
    <div class="commit-type">
      <strong>chore:</strong> 其他杂项
    </div>
  </div>
  
  <div class="commit-examples">
    <h5>提交示例</h5>
    <div class="code-block">
      <pre><code># 新功能
feat(router): 添加动态路由支持

# 问题修复
fix(http): 修复请求超时问题

# 文档更新
docs: 更新安装指南

# 重大变更
feat!: 重构核心 API

BREAKING CHANGE: Engine.init() 方法签名已更改</code></pre>
    </div>
  </div>
</div>

### Pull Request 流程

<div class="pr-workflow">
  <div class="workflow-step">
    <div class="step-number">1</div>
    <div class="step-content">
      <h4>创建 Issue</h4>
      <p>在开始开发前，先创建 Issue 描述要解决的问题或要添加的功能</p>
    </div>
  </div>
  
  <div class="workflow-step">
    <div class="step-number">2</div>
    <div class="step-content">
      <h4>Fork 项目</h4>
      <p>将项目 Fork 到您的 GitHub 账户下</p>
    </div>
  </div>
  
  <div class="workflow-step">
    <div class="step-number">3</div>
    <div class="step-content">
      <h4>创建分支</h4>
      <p>从 develop 分支创建新的功能分支</p>
      <div class="code-block">
        <pre><code>git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name</code></pre>
      </div>
    </div>
  </div>
  
  <div class="workflow-step">
    <div class="step-number">4</div>
    <div class="step-content">
      <h4>开发和测试</h4>
      <p>编写代码、添加测试、确保所有检查通过</p>
      <div class="code-block">
        <pre><code># 运行测试
pnpm test

# 代码检查
pnpm lint

# 类型检查
pnpm type-check</code></pre>
      </div>
    </div>
  </div>
  
  <div class="workflow-step">
    <div class="step-number">5</div>
    <div class="step-content">
      <h4>提交代码</h4>
      <p>使用规范的提交信息提交代码</p>
      <div class="code-block">
        <pre><code>git add .
git commit -m "feat(scope): 添加新功能描述"</code></pre>
      </div>
    </div>
  </div>
  
  <div class="workflow-step">
    <div class="step-number">6</div>
    <div class="step-content">
      <h4>创建 PR</h4>
      <p>推送分支并创建 Pull Request</p>
      <div class="code-block">
        <pre><code>git push origin feature/your-feature-name</code></pre>
      </div>
    </div>
  </div>
</div>

## 📝 PR 模板

<div class="pr-template">
  <h4>Pull Request 描述模板</h4>
  <div class="code-block">
    <pre><code>## 📋 变更描述

简要描述此 PR 的变更内容

## 🔗 相关 Issue

Closes #issue_number

## 📸 截图/演示

如果有 UI 变更，请提供截图或 GIF

## ✅ 检查清单

- [ ] 代码遵循项目规范
- [ ] 已添加必要的测试
- [ ] 所有测试都通过
- [ ] 文档已更新
- [ ] 变更日志已更新（如需要）

## 🧪 测试说明

描述如何测试此变更

## 📚 其他说明

任何其他相关信息</code></pre>
  </div>
</div>

## 🧪 测试指南

### 测试类型

<div class="test-types">
  <div class="test-type">
    <h4>🔬 单元测试</h4>
    <p>测试单个函数或组件的功能</p>
    <div class="code-block">
      <pre><code># 运行单元测试
pnpm test:unit

# 监听模式
pnpm test:unit --watch

# 覆盖率报告
pnpm test:unit --coverage</code></pre>
    </div>
  </div>
  
  <div class="test-type">
    <h4>🔗 集成测试</h4>
    <p>测试多个模块之间的交互</p>
    <div class="code-block">
      <pre><code># 运行集成测试
pnpm test:integration

# 特定包的测试
pnpm test --filter @ldesign/engine</code></pre>
    </div>
  </div>
  
  <div class="test-type">
    <h4>🌐 E2E 测试</h4>
    <p>端到端的用户场景测试</p>
    <div class="code-block">
      <pre><code># 运行 E2E 测试
pnpm test:e2e

# 可视化模式
pnpm test:e2e --ui</code></pre>
    </div>
  </div>
</div>

### 测试编写规范

<div class="test-guidelines">
  <div class="guideline">
    <h4>📁 文件组织</h4>
    <ul>
      <li>测试文件与源文件同目录</li>
      <li>使用 <code>.test.ts</code> 或 <code>.spec.ts</code> 后缀</li>
      <li>E2E 测试放在 <code>tests/e2e</code> 目录</li>
    </ul>
  </div>
  
  <div class="guideline">
    <h4>✍️ 命名规范</h4>
    <ul>
      <li>测试描述使用中文，清晰表达测试意图</li>
      <li>使用 <code>describe</code> 分组相关测试</li>
      <li>使用 <code>it</code> 或 <code>test</code> 描述具体测试用例</li>
    </ul>
  </div>
  
  <div class="guideline">
    <h4>🎯 测试原则</h4>
    <ul>
      <li>每个测试应该独立且可重复</li>
      <li>测试应该快速执行</li>
      <li>优先测试公共 API 而非实现细节</li>
      <li>使用有意义的断言信息</li>
    </ul>
  </div>
</div>

## 📚 文档贡献

### 文档类型

<div class="doc-types">
  <div class="doc-type">
    <h4>📖 API 文档</h4>
    <p>详细的 API 接口说明</p>
    <ul>
      <li>参数类型和说明</li>
      <li>返回值描述</li>
      <li>使用示例</li>
      <li>注意事项</li>
    </ul>
  </div>
  
  <div class="doc-type">
    <h4>📝 指南文档</h4>
    <p>使用教程和最佳实践</p>
    <ul>
      <li>快速开始指南</li>
      <li>详细使用教程</li>
      <li>常见问题解答</li>
      <li>最佳实践建议</li>
    </ul>
  </div>
  
  <div class="doc-type">
    <h4>💡 示例项目</h4>
    <p>完整的使用示例</p>
    <ul>
      <li>基础功能演示</li>
      <li>高级特性展示</li>
      <li>实际应用场景</li>
      <li>性能优化案例</li>
    </ul>
  </div>
</div>

### 文档编写规范

<div class="doc-guidelines">
  <div class="doc-guideline">
    <h4>📋 内容结构</h4>
    <ul>
      <li>使用清晰的标题层级</li>
      <li>提供目录导航</li>
      <li>包含代码示例</li>
      <li>添加相关链接</li>
    </ul>
  </div>
  
  <div class="doc-guideline">
    <h4>✍️ 写作风格</h4>
    <ul>
      <li>使用简洁明了的语言</li>
      <li>避免技术术语堆砌</li>
      <li>提供实际使用场景</li>
      <li>保持内容更新</li>
    </ul>
  </div>
  
  <div class="doc-guideline">
    <h4>🎨 格式规范</h4>
    <ul>
      <li>使用 Markdown 格式</li>
      <li>代码块指定语言</li>
      <li>图片使用相对路径</li>
      <li>链接使用描述性文本</li>
    </ul>
  </div>
</div>

## 🏷️ 发布流程

### 版本管理

<div class="version-management">
  <div class="version-info">
    <h4>📦 语义化版本</h4>
    <p>我们遵循 <a href="https://semver.org/">Semantic Versioning</a> 规范</p>
    <div class="version-format">
      <code>MAJOR.MINOR.PATCH</code>
    </div>
    <ul>
      <li><strong>MAJOR:</strong> 不兼容的 API 变更</li>
      <li><strong>MINOR:</strong> 向后兼容的功能新增</li>
      <li><strong>PATCH:</strong> 向后兼容的问题修复</li>
    </ul>
  </div>
  
  <div class="version-info">
    <h4>🔄 发布周期</h4>
    <ul>
      <li><strong>主版本:</strong> 每年 1-2 次</li>
      <li><strong>次版本:</strong> 每月 1-2 次</li>
      <li><strong>补丁版本:</strong> 根据需要随时发布</li>
      <li><strong>预发布版本:</strong> 用于测试新功能</li>
    </ul>
  </div>
</div>

### Changesets 工作流

<div class="changesets-workflow">
  <h4>使用 Changesets 管理变更</h4>
  
  <div class="changeset-step">
    <h5>1. 添加变更记录</h5>
    <div class="code-block">
      <pre><code># 添加变更记录
pnpm changeset

# 选择变更的包
# 选择变更类型（major/minor/patch）
# 编写变更描述</code></pre>
    </div>
  </div>
  
  <div class="changeset-step">
    <h5>2. 版本更新</h5>
    <div class="code-block">
      <pre><code># 更新版本号
pnpm changeset version

# 提交版本变更
git add .
git commit -m "chore: release packages"</code></pre>
    </div>
  </div>
  
  <div class="changeset-step">
    <h5>3. 发布包</h5>
    <div class="code-block">
      <pre><code># 构建所有包
pnpm build

# 发布到 npm
pnpm changeset publish</code></pre>
    </div>
  </div>
</div>

## 🎯 贡献者指南

### 成为核心贡献者

<div class="contributor-path">
  <div class="path-step">
    <h4>🌱 新手贡献者</h4>
    <ul>
      <li>修复文档错误</li>
      <li>添加测试用例</li>
      <li>修复简单 Bug</li>
      <li>参与社区讨论</li>
    </ul>
  </div>
  
  <div class="path-step">
    <h4>🚀 活跃贡献者</h4>
    <ul>
      <li>开发新功能</li>
      <li>代码审查</li>
      <li>帮助其他贡献者</li>
      <li>维护文档</li>
    </ul>
  </div>
  
  <div class="path-step">
    <h4>⭐ 核心贡献者</h4>
    <ul>
      <li>架构设计决策</li>
      <li>发布管理</li>
      <li>社区管理</li>
      <li>导师新贡献者</li>
    </ul>
  </div>
</div>

### 贡献者权益

<div class="contributor-benefits">
  <div class="benefit">
    <h4>🏆 认可奖励</h4>
    <ul>
      <li>贡献者名单展示</li>
      <li>GitHub 徽章</li>
      <li>年度贡献者奖</li>
    </ul>
  </div>
  
  <div class="benefit">
    <h4>📚 学习机会</h4>
    <ul>
      <li>技术分享会</li>
      <li>代码审查反馈</li>
      <li>开源项目经验</li>
    </ul>
  </div>
  
  <div class="benefit">
    <h4>🤝 社区网络</h4>
    <ul>
      <li>技术交流群</li>
      <li>线下聚会</li>
      <li>职业发展机会</li>
    </ul>
  </div>
</div>

## 📞 联系我们

<div class="contact-info">
  <div class="contact-item">
    <h4>💬 GitHub Discussions</h4>
    <p>技术讨论和问题求助</p>
    <a href="https://github.com/ldesign-org/ldesign/discussions">加入讨论</a>
  </div>
  
  <div class="contact-item">
    <h4>🐛 GitHub Issues</h4>
    <p>Bug 报告和功能请求</p>
    <a href="https://github.com/ldesign-org/ldesign/issues">提交 Issue</a>
  </div>
  
  <div class="contact-item">
    <h4>💬 Discord 社区</h4>
    <p>实时聊天和社区交流</p>
    <a href="https://discord.gg/ldesign">加入 Discord</a>
  </div>
  
  <div class="contact-item">
    <h4>📧 邮件联系</h4>
    <p>商务合作和其他事务</p>
    <a href="mailto:contact@ldesign.org">发送邮件</a>
  </div>
</div>

## 📜 行为准则

我们致力于为所有人提供友好、安全和欢迎的环境。请阅读我们的 [行为准则](./code-of-conduct.md) 了解详情。

### 核心原则

<div class="code-of-conduct">
  <div class="principle">
    <h4>🤝 尊重包容</h4>
    <p>尊重不同背景和观点的贡献者</p>
  </div>
  
  <div class="principle">
    <h4>🎯 建设性沟通</h4>
    <p>提供有建设性的反馈和建议</p>
  </div>
  
  <div class="principle">
    <h4>🚀 共同成长</h4>
    <p>帮助他人学习和成长</p>
  </div>
  
  <div class="principle">
    <h4>🌟 质量优先</h4>
    <p>追求代码和文档的高质量</p>
  </div>
</div>

---

<div class="thank-you">
  <h3>🙏 感谢您的贡献！</h3>
  <p>每一个贡献都让 LDesign 变得更好。无论大小，我们都深表感谢！</p>
</div>

<style>
.contribution-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.contribution-card {
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.contribution-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.contribution-card h4 {
  margin: 0 0 12px 0;
  color: #1890ff;
  font-size: 1.1rem;
}

.contribution-card p {
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.5;
}

.contribution-card ul {
  margin: 0;
  padding: 0 0 0 16px;
  list-style-type: disc;
}

.contribution-card li {
  margin: 4px 0;
  color: #666;
  line-height: 1.4;
}

.non-code-contributions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.contrib-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #1890ff;
}

.contrib-item h4 {
  margin: 0 0 8px 0;
  color: #1890ff;
  font-size: 1rem;
}

.contrib-item p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.setup-section {
  margin: 24px 0;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
}

.setup-section h4 {
  margin: 0 0 16px 0;
  color: #1890ff;
}

.code-block {
  margin: 12px 0;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.code-block pre {
  margin: 0;
  padding: 16px;
  background: #fafafa;
  overflow-x: auto;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

.requirements {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin: 16px 0;
}

.req-item {
  padding: 12px;
  background: #f0f7ff;
  border-radius: 4px;
  font-size: 0.9rem;
}

.branch-strategy {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.branch-item {
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
}

.branch-item h4 {
  margin: 0 0 8px 0;
  color: #1890ff;
}

.branch-item p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 0.9rem;
}

.branch-rules {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rule {
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 3px;
  font-size: 0.8rem;
  color: #666;
}

.commit-convention {
  margin: 24px 0;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
}

.commit-convention h4 {
  margin: 0 0 16px 0;
  color: #1890ff;
}

.commit-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin: 16px 0;
}

.commit-type {
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9rem;
}

.commit-examples {
  margin: 20px 0;
}

.commit-examples h5 {
  margin: 0 0 12px 0;
  color: #333;
}

.pr-workflow {
  margin: 24px 0;
}

.workflow-step {
  display: flex;
  gap: 16px;
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #1890ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.step-content p {
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.5;
}

.pr-template {
  margin: 24px 0;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
}

.pr-template h4 {
  margin: 0 0 16px 0;
  color: #1890ff;
}

.test-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.test-type {
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
}

.test-type h4 {
  margin: 0 0 12px 0;
  color: #1890ff;
}

.test-type p {
  margin: 0 0 16px 0;
  color: #666;
}

.test-guidelines {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.guideline {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #52c41a;
}

.guideline h4 {
  margin: 0 0 12px 0;
  color: #52c41a;
}

.guideline ul {
  margin: 0;
  padding: 0 0 0 16px;
}

.guideline li {
  margin: 4px 0;
  color: #666;
  line-height: 1.4;
}

.guideline code {
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 2px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.85rem;
}

.doc-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.doc-type {
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
}

.doc-type h4 {
  margin: 0 0 12px 0;
  color: #1890ff;
}

.doc-type p {
  margin: 0 0 12px 0;
  color: #666;
}

.doc-type ul {
  margin: 0;
  padding: 0 0 0 16px;
}

.doc-type li {
  margin: 4px 0;
  color: #666;
  line-height: 1.4;
}

.doc-guidelines {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.doc-guideline {
  padding: 16px;
  background: #f0f7ff;
  border-radius: 6px;
  border-left: 4px solid #1890ff;
}

.doc-guideline h4 {
  margin: 0 0 12px 0;
  color: #1890ff;
}

.doc-guideline ul {
  margin: 0;
  padding: 0 0 0 16px;
}

.doc-guideline li {
  margin: 4px 0;
  color: #666;
  line-height: 1.4;
}

.version-management {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.version-info {
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
}

.version-info h4 {
  margin: 0 0 12px 0;
  color: #1890ff;
}

.version-info p {
  margin: 0 0 12px 0;
  color: #666;
}

.version-format {
  text-align: center;
  margin: 16px 0;
  padding: 12px;
  background: #f0f7ff;
  border-radius: 6px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 1.2rem;
  color: #1890ff;
}

.version-info ul {
  margin: 0;
  padding: 0 0 0 16px;
}

.version-info li {
  margin: 6px 0;
  color: #666;
  line-height: 1.4;
}

.changesets-workflow {
  margin: 24px 0;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
}

.changesets-workflow h4 {
  margin: 0 0 20px 0;
  color: #1890ff;
}

.changeset-step {
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.changeset-step h5 {
  margin: 0 0 12px 0;
  color: #333;
}

.contributor-path {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.path-step {
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
  position: relative;
}

.path-step h4 {
  margin: 0 0 16px 0;
  color: #1890ff;
}

.path-step ul {
  margin: 0;
  padding: 0 0 0 16px;
}

.path-step li {
  margin: 6px 0;
  color: #666;
  line-height: 1.4;
}

.contributor-benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.benefit {
  padding: 16px;
  background: #f0f7ff;
  border-radius: 6px;
  border-left: 4px solid #1890ff;
}

.benefit h4 {
  margin: 0 0 12px 0;
  color: #1890ff;
}

.benefit ul {
  margin: 0;
  padding: 0 0 0 16px;
}

.benefit li {
  margin: 4px 0;
  color: #666;
  line-height: 1.4;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.contact-item {
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: white;
  text-align: center;
}

.contact-item h4 {
  margin: 0 0 8px 0;
  color: #1890ff;
}

.contact-item p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 0.9rem;
}

.contact-item a {
  display: inline-block;
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.contact-item a:hover {
  background: #40a9ff;
}

.code-of-conduct {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.principle {
  padding: 16px;
  background: #f6ffed;
  border-radius: 6px;
  border-left: 4px solid #52c41a;
}

.principle h4 {
  margin: 0 0 8px 0;
  color: #52c41a;
}

.principle p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.thank-you {
  text-align: center;
  padding: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin: 32px 0;
}

.thank-you h3 {
  margin: 0 0 12px 0;
  font-size: 1.5rem;
}

.thank-you p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .contribution-section {
    grid-template-columns: 1fr;
  }
  
  .non-code-contributions {
    grid-template-columns: 1fr;
  }
  
  .requirements {
    grid-template-columns: 1fr;
  }
  
  .branch-strategy {
    grid-template-columns: 1fr;
  }
  
  .commit-types {
    grid-template-columns: 1fr;
  }
  
  .workflow-step {
    flex-direction: column;
    text-align: center;
  }
  
  .test-types {
    grid-template-columns: 1fr;
  }
  
  .test-guidelines {
    grid-template-columns: 1fr;
  }
  
  .doc-types {
    grid-template-columns: 1fr;
  }
  
  .doc-guidelines {
    grid-template-columns: 1fr;
  }
  
  .version-management {
    grid-template-columns: 1fr;
  }
  
  .contributor-path {
    grid-template-columns: 1fr;
  }
  
  .contributor-benefits {
    grid-template-columns: 1fr;
  }
  
  .contact-info {
    grid-template-columns: 1fr;
  }
  
  .code-of-conduct {
    grid-template-columns: 1fr;
  }
}
</style>