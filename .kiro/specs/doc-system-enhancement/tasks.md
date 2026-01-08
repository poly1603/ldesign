# Implementation Plan: @ldesign/doc 文档系统增强

## Overview

本实现计划将 @ldesign/doc 文档系统的优化和功能增强分解为可执行的开发任务。任务按照优先级和依赖关系组织，确保增量开发和持续可用性。

## Tasks

- [x] 1. 版本管理插件 (versionPlugin)
  - [x] 1.1 创建版本插件基础结构
    - 创建 `src/plugins/version/index.ts`
    - 定义 `VersionPluginOptions` 接口
    - 实现 `versionPlugin` 工厂函数
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 实现版本选择器组件
    - 创建 `src/plugins/version/VersionSelector.vue`
    - 实现版本下拉菜单 UI
    - 添加版本切换导航逻辑
    - _Requirements: 1.1, 1.2_

  - [x] 1.3 编写版本选择器属性测试
    - **Property 1: Version selector rendering**
    - **Property 2: Version navigation correctness**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 1.4 实现版本别名解析
    - 创建别名到版本的映射逻辑
    - 支持 "latest", "stable", "next" 等别名
    - _Requirements: 1.4_

  - [x] 1.5 编写版本别名属性测试
    - **Property 4: Version alias resolution**
    - **Validates: Requirements 1.4**

  - [x] 1.6 实现废弃版本警告
    - 创建 `DeprecationBanner.vue` 组件
    - 在废弃版本页面自动显示警告
    - _Requirements: 1.5_

  - [x] 1.7 编写废弃警告属性测试
    - **Property 5: Deprecation banner display**
    - **Validates: Requirements 1.5**

  - [x] 1.8 实现多版本构建支持
    - 修改构建流程支持多版本输出
    - 生成版本清单文件
    - _Requirements: 1.3_

  - [x] 1.9 编写多版本构建属性测试
    - **Property 3: Multi-version build output**
    - **Validates: Requirements 1.3**

- [x] 2. Checkpoint - 版本管理插件完成
  - 确保所有测试通过，如有问题请询问用户

---

- [x] 3. 增强搜索插件 (enhancedSearchPlugin)
  - [x] 3.1 创建增强搜索插件基础结构
    - 创建 `src/plugins/search-enhanced/index.ts`
    - 扩展现有 `SearchPluginOptions`
    - 保持与现有搜索插件的兼容性
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.2 实现模糊搜索算法
    - 集成 Fuse.js 或实现 Levenshtein 距离算法
    - 支持拼写错误容忍
    - _Requirements: 2.1_

  - [x] 3.3 编写模糊搜索属性测试
    - **Property 6: Fuzzy search matching**
    - **Validates: Requirements 2.1**

  - [x] 3.4 实现搜索结果高亮
    - 在搜索结果中标记匹配文本
    - 生成内容预览片段
    - _Requirements: 2.2_

  - [x] 3.5 编写搜索高亮属性测试
    - **Property 7: Search result highlighting**
    - **Validates: Requirements 2.2**

  - [x] 3.6 实现搜索过滤器
    - 支持按分类、标签过滤
    - 创建过滤器 UI 组件
    - _Requirements: 2.3_

  - [x] 3.7 编写搜索过滤属性测试
    - **Property 8: Search filter application**
    - **Validates: Requirements 2.3**

  - [x] 3.8 实现中文分词支持
    - 集成 jieba 或 nodejieba 分词库
    - 创建中文索引生成器
    - _Requirements: 2.4_

  - [x] 3.9 编写中文分词属性测试
    - **Property 9: CJK word segmentation**
    - **Validates: Requirements 2.4**

  - [x] 3.10 实现搜索建议功能
    - 当无结果时提供相似词建议
    - 基于索引生成建议
    - _Requirements: 2.6_

  - [x] 3.11 编写搜索建议属性测试
    - **Property 10: Empty search suggestions**
    - **Validates: Requirements 2.6**

- [x] 4. Checkpoint - 增强搜索插件完成
  - 确保所有测试通过，如有问题请询问用户

---

- [x] 5. 增强代码块功能
  - [x] 5.1 实现 Diff 高亮支持
    - 修改 `src/markdown/createMarkdown.ts`
    - 识别 `+` 和 `-` 开头的行
    - 应用添加/删除样式类
    - _Requirements: 6.1_

  - [x] 5.2 编写 Diff 高亮属性测试
    - **Property 20: Diff highlighting**
    - **Validates: Requirements 6.1**

  - [x] 5.3 实现代码块标题
    - 支持 `\`\`\`ts title="example.ts"` 语法
    - 渲染标题栏
    - _Requirements: 6.2_

  - [x] 5.4 编写代码块标题属性测试
    - **Property 21: Code block titles**
    - **Validates: Requirements 6.2**

  - [x] 5.5 实现 Playground 链接
    - 支持配置在线编辑器 URL
    - 生成带代码参数的链接
    - _Requirements: 6.3_

  - [x] 5.6 编写 Playground 链接属性测试
    - **Property 22: Playground link generation**
    - **Validates: Requirements 6.3**

  - [x] 5.7 实现代码行聚焦
    - 支持 `{focus:1-3}` 语法
    - 非聚焦行添加淡化样式
    - _Requirements: 6.4_

  - [x] 5.8 编写代码聚焦属性测试
    - **Property 23: Line focus styling**
    - **Validates: Requirements 6.4**

  - [x] 5.9 实现长代码折叠
    - 超过阈值的代码块自动折叠
    - 添加展开/收起按钮
    - _Requirements: 6.5_

  - [x] 5.10 编写代码折叠属性测试
    - **Property 24: Long code collapsing**
    - **Validates: Requirements 6.5**

  - [x] 5.11 实现代码注释标注
    - 支持 `// [!code highlight]` 等注释语法
    - 渲染为可视化标注
    - _Requirements: 6.6_

  - [x] 5.12 编写代码注释属性测试
    - **Property 25: Code annotations**
    - **Validates: Requirements 6.6**

- [x] 6. Checkpoint - 代码块增强完成
  - 确保所有测试通过，如有问题请询问用户

---

- [x] 7. 增强导航功能
  - [x] 7.1 实现面包屑导航
    - 创建 `VPBreadcrumb.vue` 组件
    - 根据页面路径生成面包屑
    - _Requirements: 8.1_

  - [x] 7.2 编写面包屑属性测试
    - **Property 29: Breadcrumb generation**
    - **Validates: Requirements 8.1**

  - [x] 7.3 实现相关页面推荐
    - 基于标签和内容相似度计算
    - 创建 `RelatedPages.vue` 组件
    - _Requirements: 8.2_

  - [x] 7.4 编写相关页面属性测试
    - **Property 30: Related pages computation**
    - **Validates: Requirements 8.2**

  - [x] 7.5 实现标签系统
    - 支持 frontmatter 中的 tags 字段
    - 创建标签索引和标签页面
    - _Requirements: 8.3_

  - [x] 7.6 编写标签系统属性测试
    - **Property 31: Tag indexing**
    - **Validates: Requirements 8.3**

  - [x] 7.7 实现站点地图页面
    - 自动生成所有页面列表
    - 支持分类和搜索
    - _Requirements: 8.4_

  - [x] 7.8 编写站点地图属性测试
    - **Property 32: Sitemap completeness**
    - **Validates: Requirements 8.4**

  - [x] 7.9 增强上下页导航
    - 基于配置的阅读顺序
    - 显示页面标题预览
    - _Requirements: 8.5_

  - [x] 7.10 编写上下页导航属性测试
    - **Property 33: Previous/Next navigation**
    - **Validates: Requirements 8.5**

  - [x] 7.11 实现子页面目录
    - 检测子页面并生成迷你目录
    - 创建 `SubpageTOC.vue` 组件
    - _Requirements: 8.6_
/
  - [x] 7.12 编写子页面目录属性测试
    - **Property 34: Subpage TOC display**
    - **Validates: Requirements 8.6**

- [x] 8. Checkpoint - 导航增强完成
  - 确保所有测试通过，如有问题请询问用户

---

- [-] 9. PWA 插件 (pwaPlugin)
  - [x] 9.1 创建 PWA 插件基础结构
    - 创建 `src/plugins/pwa/index.ts`
    - 定义 `PWAOptions` 接口
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 9.2 实现 Service Worker 生成
    - 使用 Workbox 生成 SW
    - 支持多种缓存策略
    - _Requirements: 5.1, 5.4_

  - [x] 9.3 编写 Service Worker 属性测试
    - **Property 17: Service worker generation**
    - **Property 19: Caching strategy implementation**
    - **Validates: Requirements 5.1, 5.4**

  - [x] 9.4 实现 Web App Manifest 生成
    - 根据配置生成 manifest.json
    - 支持图标和主题色配置
    - _Requirements: 5.2_

  - [x] 9.5 编写 Manifest 属性测试
    - **Property 18: Web manifest generation**
    - **Validates: Requirements 5.2**

  - [x] 9.6 实现更新提示组件
    - 检测新版本可用
    - 显示更新提示 UI
    - _Requirements: 5.5_

- [x] 10. Checkpoint - PWA 插件完成
  - 确保所有测试通过，如有问题请询问用户

---

- [-] 11. 文档分析插件 (analyticsPlugin)
  - [x] 11.1 创建分析插件基础结构
    - 创建 `src/plugins/analytics/index.ts`
    - 定义 `AnalyticsOptions` 接口
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 11.2 实现多平台分析脚本注入
    - 支持 Google Analytics、Plausible、Umami
    - 根据配置注入对应脚本
    - _Requirements: 7.2_

  - [x] 11.3 编写分析脚本注入属性测试
    - **Property 26: Analytics script injection**
    - **Validates: Requirements 7.2**

  - [x] 11.4 实现文档健康检查
    - 检测断链
    - 检测过期内容
    - 生成健康报告
    - _Requirements: 7.3_

  - [x] 11.5 编写健康检查属性测试
    - **Property 27: Health check report generation**
    - **Validates: Requirements 7.3**

  - [x] 11.6 实现搜索查询追踪
    - 记录搜索查询和结果数
    - 识别内容缺口
    - _Requirements: 7.4_

  - [x] 11.7 编写搜索追踪属性测试
    - **Property 28: Search query logging**
    - **Validates: Requirements 7.4**

- [x] 12. Checkpoint - 分析插件完成
  - 确保所有测试通过，如有问题请询问用户

---

- [x] 13. 反馈插件 (feedbackPlugin)
  - [x] 13.1 创建反馈插件基础结构
    - 创建 `src/plugins/feedback/index.ts`
    - 定义 `FeedbackOptions` 接口
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 13.2 实现 "是否有帮助" 组件
    - 创建 `HelpfulWidget.vue`
    - 支持点赞/点踩和后续反馈
    - _Requirements: 4.1, 4.2_

  - [x] 13.3 编写反馈数据持久化属性测试
    - **Property 15: Feedback data persistence**
    - **Validates: Requirements 4.2**

  - [x] 13.4 实现贡献者信息显示
    - 从 Git 历史提取贡献者
    - 创建 `Contributors.vue` 组件
    - _Requirements: 4.5_

  - [x] 13.5 编写贡献者显示属性测试
    - **Property 16: Contributor display**
    - **Validates: Requirements 4.5**

- [x] 14. Checkpoint - 反馈插件完成
  - 确保所有测试通过，如有问题请询问用户

---

- [x] 15. 导出插件 (exportPlugin)
  - [x] 15.1 创建导出插件基础结构
    - 创建 `src/plugins/export/index.ts`
    - 定义 `ExportOptions` 接口
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [x] 15.2 实现打印样式优化
    - 创建打印专用 CSS
    - 优化代码块和图表打印
    - _Requirements: 14.1_

  - [x] 15.3 编写打印样式属性测试
    - **Property 55: Print stylesheet inclusion**
    - **Validates: Requirements 14.1**

  - [x] 15.4 实现 PDF 导出
    - 集成 Puppeteer 或 Playwright
    - 支持页面大小和边距配置
    - _Requirements: 14.2, 14.4_

  - [x] 15.5 编写 PDF 导出属性测试
    - **Property 56: PDF export completeness**
    - **Validates: Requirements 14.2, 14.4**

  - [x] 15.6 实现 EPUB 导出
    - 使用 epub-gen 或类似库
    - 生成有效的 EPUB 结构
    - _Requirements: 14.3, 14.4_

  - [x] 15.7 编写 EPUB 导出属性测试
    - **Property 57: EPUB structure validity**
    - **Validates: Requirements 14.3, 14.4**

  - [x] 15.8 实现单页导出
    - 合并所有页面为单个 HTML
    - 修复内部链接为锚点
    - _Requirements: 14.5_

  - [x] 15.9 编写单页导出属性测试
    - **Property 58: Single-page export completeness**
    - **Validates: Requirements 14.5**

- [x] 16. Checkpoint - 导出插件完成
  - 确保所有测试通过，如有问题请询问用户

---

- [x] 17. API 文档生成插件 (apiDocPlugin)



  - [x] 17.1 创建 API 文档插件基础结构
    - 创建 `src/plugins/api-doc/index.ts`
    - 定义 `ApiDocOptions` 接口
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 17.2 实现 TypeScript 解析器
    - 使用 TypeScript Compiler API
    - 提取导出的类型、函数、类
    - _Requirements: 3.1_

  - [x] 17.3 编写 TypeScript 提取属性测试
    - **Property 11: TypeScript extraction completeness**
    - **Validates: Requirements 3.1**

  - [x] 17.4 实现 JSDoc 解析
    - 解析 JSDoc/TSDoc 注释
    - 提取描述、参数、返回值
    - _Requirements: 3.2_

  - [x] 17.5 编写 JSDoc 解析属性测试

    - **Property 12: JSDoc comment parsing**
    - **Validates: Requirements 3.2**

  - [x] 17.6 实现导航结构生成
    - 根据模块层级生成侧边栏
    - 支持分组配置
    - _Requirements: 3.3_

  - [x] 17.7 编写导航结构属性测试
    - **Property 13: Module hierarchy navigation**
    - **Validates: Requirements 3.3**

  - [x] 17.8 实现类型链接
    - 识别类型引用
    - 生成到类型文档的链接
    - _Requirements: 3.4_

  - [x] 17.9 编写类型链接属性测试
    - **Property 14: Type reference linking**
    - **Validates: Requirements 3.4**

- [x] 18. Checkpoint - API 文档插件完成





  - 确保所有测试通过，如有问题请询问用户

---

- [x] 19. 性能优化





  - [x] 19.1 实现图片自动优化


    - 集成 sharp 进行图片处理
    - 生成 WebP 格式
    - 添加 lazy loading 属性
    - _Requirements: 10.1_

  - [x] 19.2 编写图片优化属性测试


    - **Property 39: Image optimization**
    - **Validates: Requirements 10.1**

  - [x] 19.3 优化代码分割


    - 配置 Vite 分块策略
    - 提取公共依赖
    - _Requirements: 10.2_

  - [x] 19.4 编写代码分割属性测试


    - **Property 40: Code splitting**
    - **Validates: Requirements 10.2**

  - [x] 19.5 实现预加载提示


    - 分析导航链接
    - 添加 preload/prefetch 标签
    - _Requirements: 10.3_

  - [x] 19.6 编写预加载属性测试


    - **Property 41: Preload hints**
    - **Validates: Requirements 10.3**

- [x] 20. Checkpoint - 性能优化完成





  - 确保所有测试通过，如有问题请询问用户

---

- [-] 21. 安全性增强


  - [x] 21.1 实现 RBAC 访问控制


    - 扩展 authPlugin 支持角色
    - 实现页面级权限检查
    - _Requirements: 11.1_

  - [x] 21.2 编写 RBAC 属性测试


    - **Property 42: RBAC enforcement**
    - **Validates: Requirements 11.1**

  - [x] 21.3 实现内容加密


    - 支持敏感内容加密存储
    - 实现客户端解密
    - _Requirements: 11.2_

  - [x] 21.4 编写加密属性测试


    - **Property 43: Content encryption round-trip**
    - **Validates: Requirements 11.2**

  - [x] 21.5 实现 XSS 防护


    - 使用 DOMPurify 清理用户输入
    - 验证所有动态内容
    - _Requirements: 11.5_

  - [x] 21.6 编写 XSS 防护属性测试



    - **Property 46: XSS sanitization**
    - **Validates: Requirements 11.5**

- [x] 22. Checkpoint - 安全性增强完成





  - 确保所有测试通过，如有问题请询问用户

---

- [x] 23. 国际化增强





  - [x] 23.1 实现翻译状态追踪


    - 比较源文件和翻译文件的修改时间
    - 生成翻译状态报告
    - _Requirements: 13.1, 13.2_


  - [x] 23.2 编写翻译状态属性测试

    - **Property 51: Translation status tracking**
    - **Property 52: Outdated translation detection**
    - **Validates: Requirements 13.1, 13.2**


  - [x] 23.3 实现翻译回退




    - 缺失翻译时显示源语言内容
    - 添加翻译缺失提示
    - _Requirements: 13.3_


  - [x] 23.4 编写翻译回退属性测试


    - **Property 53: Fallback content resolution**

    - **Validates: Requirements 13.3**

  - [x] 23.5 实现 RTL 布局支持




    - 检测 RTL 语言

    - 应用 RTL 样式
    - _Requirements: 13.5_

  - [x] 23.6 编写 RTL 布局属性测试


    - **Property 54: RTL layout application**
    - **Validates: Requirements 13.5**

- [x] 24. Checkpoint - 国际化增强完成




  - 确保所有测试通过，如有问题请询问用户

---

- [-] 25. 开发者体验优化


  - [x] 25.1 实现页面脚手架命令


    - 添加 `ldoc new page` 命令
    - 支持模板选择
    - _Requirements: 12.1_

  - [x] 25.2 编写脚手架属性测试



    - **Property 47: Scaffold file generation**
    - **Validates: Requirements 12.1**

  - [x] 25.3 实现文档检查器





    - 检测断链
    - 检测拼写错误
    - 检测样式问题
    - _Requirements: 12.3_

  - [x] 25.4 编写文档检查属性测试





    - **Property 48: Documentation linting**
    - **Validates: Requirements 12.3**

  - [x] 25.5 实现构建报告




    - 输出页面数量、包大小
    - 列出警告和建议
    - _Requirements: 12.4_

  - [x] 25.6 编写构建报告属性测试





    - **Property 49: Build report generation**
    - **Validates: Requirements 12.4**

  - [x] 25.7 实现构建钩子





    - 支持 pre-build 和 post-build 钩子
    - 允许自定义处理逻辑
    - _Requirements: 12.5_

  - [x] 25.8 编写构建钩子属性测试





    - **Property 50: Build hook execution**
    - **Validates: Requirements 12.5**

- [x] 26. Checkpoint - 开发者体验优化完成





  - 确保所有测试通过，如有问题请询问用户

---

- [-] 27. 插件系统增强


  - [x] 27.1 实现插件依赖管理


    - 解析插件依赖声明
    - 按依赖顺序加载插件
    - _Requirements: 15.1_

  - [x] 27.2 编写依赖解析属性测试


    - **Property 59: Plugin dependency resolution**
    - **Validates: Requirements 15.1**

  - [x] 27.3 实现配置验证

    - 验证插件配置格式
    - 提供清晰的错误信息
    - _Requirements: 15.3_

  - [x] 27.4 编写配置验证属性测试

    - **Property 60: Plugin configuration validation**
    - **Validates: Requirements 15.3**

  - [x] 27.5 实现插件组合

    - 支持插件继承和扩展
    - 正确处理钩子执行顺序
    - _Requirements: 15.4_

  - [x] 27.6 编写插件组合属性测试

    - **Property 61: Plugin composition**
    - **Validates: Requirements 15.4**

  - [x] 27.7 实现冲突检测

    - 检测插槽和钩子冲突
    - 提供解决建议
    - _Requirements: 15.6_

  - [x] 27.8 编写冲突检测属性测试

    - **Property 62: Plugin conflict detection**
    - **Validates: Requirements 15.6**

- [x] 28. Checkpoint - 插件系统增强完成


  - 确保所有测试通过，如有问题请询问用户

---

- [-] 29. 内容组件库


  - [x] 29.1 实现时间线组件


    - 创建 `Timeline.vue` 组件
    - 支持 Markdown 中使用
    - _Requirements: 9.1_

  - [x] 29.2 编写时间线属性测试



    - **Property 35: Timeline rendering**
    - **Validates: Requirements 9.1**

  - [x] 29.3 实现对比表组件




    - 创建 `ComparisonTable.vue` 组件
    - 支持特性矩阵展示
    - _Requirements: 9.2_

  - [x] 29.4 编写对比表属性测试





    - **Property 36: Comparison table rendering**
    - **Validates: Requirements 9.2**

  - [x] 29.5 实现视频播放器组件
    - 创建 `VideoPlayer.vue` 组件
    - 支持章节标记
    - _Requirements: 9.4_

  - [x] 29.6 编写视频播放器属性测试
    - **Property 37: Video player chapters**
    - **Validates: Requirements 9.4**

  - [x] 29.7 实现 FAQ 组件
    - 创建 `FAQ.vue` 组件
    - 支持折叠和搜索
    - _Requirements: 9.6_

  - [x] 29.8 编写 FAQ 属性测试
    - **Property 38: FAQ structure**
    - **Validates: Requirements 9.6**

- [x] 30. Final Checkpoint - 所有功能完成
  - 确保所有测试通过
  - 更新文档和示例
  - 准备发布

## Notes

- 每个 Checkpoint 是验证点，确保阶段性功能完整
- 属性测试使用 fast-check 库，每个测试至少运行 100 次迭代
- 所有新插件都应保持与现有插件 API 的一致性
- 所有测试任务都是必须完成的，确保代码质量和正确性
