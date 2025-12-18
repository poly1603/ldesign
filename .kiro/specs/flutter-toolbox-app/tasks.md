# 实现计划

## 1. 项目初始化与基础配置

- [x] 1.1 创建 Flutter 项目并配置依赖
  - 在 `tools/app` 目录创建 Flutter 项目
  - 配置 pubspec.yaml 添加核心依赖：flutter_riverpod, go_router, shared_preferences, path_provider, file_picker, process_run, flutter_svg
  - 配置多平台支持（Windows、Linux、macOS）
  - _需求: 1.3, 12.1-12.4_

- [x] 1.2 创建目录结构和基础文件
  - 按设计文档创建 lib/ 下的目录结构
  - 创建核心常量文件 `lib/core/constants/`
  - 创建基础扩展文件 `lib/core/extensions/`
  - _需求: 1.1_

## 2. 核心基础设施层

- [x] 2.1 实现存储服务
  - 创建 `lib/data/services/storage_service.dart`
  - 实现 JSON 数据的保存和读取
  - 实现错误处理和默认值回退
  - _需求: 11.1, 11.2, 11.3_

- [x] 2.2 编写存储服务属性测试
  - **属性 1: 项目数据往返一致性**
  - **属性 6: 设置数据往返一致性**
  - **属性 8: 损坏数据优雅降级**
  - **验证: 需求 3.4, 8.3, 9.3, 11.2, 11.4**

- [x] 2.3 实现平台工具类
  - 创建 `lib/core/utils/platform_utils.dart`
  - 实现跨平台命令执行封装
  - 实现平台特定路径处理
  - _需求: 12.1-12.4_

## 3. 数据模型层

- [x] 3.1 实现项目相关数据模型
  - 创建 `lib/data/models/project.dart`
  - 实现 Project, Dependency, FrameworkType 模型
  - 实现 fromJson/toJson 序列化方法
  - _需求: 3.2, 3.3_

- [x] 3.2 编写项目模型属性测试
  - **属性 1: 项目数据往返一致性**
  - **验证: 需求 3.4, 11.4**

- [x] 3.3 实现系统环境数据模型
  - 创建 `lib/data/models/node_environment.dart`
  - 创建 `lib/data/models/git_environment.dart`
  - 实现 NodeEnvironment, NpmPackage, GitEnvironment, GitConfig 模型
  - _需求: 4.1-4.4, 5.1-5.3_

- [x] 3.4 实现资源数据模型
  - 创建 `lib/data/models/svg_asset.dart`
  - 创建 `lib/data/models/font_asset.dart`
  - 实现 SvgAsset, FontAsset 模型
  - _需求: 6.1, 7.1_

- [x] 3.5 实现设置数据模型
  - 创建 `lib/data/models/app_settings.dart`
  - 实现 AppSettings 模型及 copyWith 方法
  - 定义默认设置值
  - _需求: 8.1-8.4, 9.1-9.3, 10.1-10.4_

- [x] 3.6 编写设置模型属性测试
  - **属性 6: 设置数据往返一致性**
  - **验证: 需求 8.3, 9.3, 11.4**

## 4. 检查点 - 确保所有测试通过

- [x] 4. 检查点
  - 确保所有测试通过，如有问题请询问用户

## 5. 服务层实现

- [x] 5.1 实现项目服务
  - 创建 `lib/data/services/project_service.dart`
  - 实现项目目录分析逻辑
  - 实现 package.json 解析
  - 实现框架类型检测
  - 实现项目 CRUD 操作
  - _需求: 3.1-3.7_

- [x] 5.2 编写项目服务属性测试
  - **属性 2: 项目分析提取完整元数据**
  - **属性 3: 项目删除后不可访问**
  - **验证: 需求 3.2, 3.6**

- [x] 5.3 实现系统服务
  - 创建 `lib/data/services/system_service.dart`
  - 实现 Node.js 版本检测
  - 实现 npm/pnpm/yarn 版本检测
  - 实现全局包列表获取
  - 实现 Git 版本和配置检测
  - _需求: 4.1-4.5, 5.1-5.4_

- [x] 5.4 编写系统服务属性测试
  - **属性 10: npm 包列表解析正确性**
  - **属性 11: Git 配置解析正确性**
  - **验证: 需求 4.4, 5.2**

- [x] 5.5 实现 SVG 资源服务
  - 创建 `lib/data/services/svg_asset_service.dart`
  - 实现 SVG 文件导入
  - 实现搜索过滤
  - 实现剪贴板导出
  - _需求: 6.1-6.5_

- [x] 5.6 编写 SVG 服务属性测试
  - **属性 4: SVG 搜索结果匹配性**
  - **属性 9: 资源导入后可检索**
  - **验证: 需求 6.1, 6.4**

- [x] 5.7 实现字体资源服务
  - 创建 `lib/data/services/font_asset_service.dart`
  - 实现字体文件导入
  - 实现搜索过滤
  - _需求: 7.1-7.5_

- [x] 5.8 编写字体服务属性测试
  - **属性 5: 字体搜索结果匹配性**
  - **属性 9: 资源导入后可检索**
  - **验证: 需求 7.1, 7.4**

- [x] 5.9 实现设置服务
  - 创建 `lib/data/services/settings_service.dart`
  - 实现设置读取和保存
  - 实现重置为默认值
  - _需求: 10.1-10.4_

- [x] 5.10 编写设置服务属性测试
  - **属性 7: 设置重置恢复默认值**
  - **验证: 需求 10.4**

## 6. 检查点 - 确保所有测试通过

- [x] 6. 检查点
  - 确保所有测试通过，如有问题请询问用户

## 7. 状态管理层

- [x] 7.1 实现应用级 Provider
  - 创建 `lib/providers/app_providers.dart`
  - 实现主题状态管理
  - 实现语言状态管理
  - _需求: 8.1-8.4, 9.1-9.3_

- [x] 7.2 实现项目 Provider
  - 创建 `lib/providers/project_providers.dart`
  - 实现项目列表状态管理
  - 实现当前项目状态管理
  - _需求: 3.1-3.7_

- [x] 7.3 实现系统环境 Provider
  - 创建 `lib/providers/node_providers.dart`
  - 创建 `lib/providers/git_providers.dart`
  - 实现环境信息状态管理
  - _需求: 4.1-4.5, 5.1-5.4_

- [x] 7.4 实现资源 Provider
  - 创建 `lib/providers/svg_providers.dart`
  - 创建 `lib/providers/font_providers.dart`
  - 实现资源列表和搜索状态管理
  - _需求: 6.1-6.5, 7.1-7.5_

- [x] 7.5 编写预览文本更新属性测试
  - **属性 12: 预览文本更新传播**
  - **验证: 需求 7.5**

- [x] 7.6 实现设置 Provider
  - 创建 `lib/providers/settings_providers.dart`
  - 实现设置状态管理
  - _需求: 10.1-10.4_

## 8. 主题与国际化

- [x] 8.1 实现主题系统
  - 创建 `lib/core/theme/app_theme.dart`
  - 实现亮色主题
  - 实现暗色主题
  - 实现主题色动态切换
  - _需求: 8.1-8.4_

- [x] 8.2 实现国际化
  - 创建 `lib/l10n/app_en.arb` 英文翻译
  - 创建 `lib/l10n/app_zh.arb` 中文翻译
  - 配置 flutter_localizations
  - _需求: 9.1-9.4_

## 9. 路由配置

- [x] 9.1 实现路由系统
  - 创建 `lib/core/router/app_router.dart`
  - 配置所有页面路由
  - 实现嵌套路由（Shell 路由）
  - _需求: 1.2_

## 10. 表现层 - 应用外壳

- [x] 10.1 实现应用外壳
  - 创建 `lib/presentation/shell/app_shell.dart`
  - 实现左侧导航菜单
  - 实现右侧内容区域
  - 实现菜单项高亮
  - _需求: 1.1, 1.2, 1.4_

- [x] 10.2 编写应用外壳 Widget 测试
  - 测试布局结构
  - 测试导航功能
  - _需求: 1.1, 1.2_

## 11. 表现层 - 首页

- [x] 11.1 实现首页仪表盘
  - 创建 `lib/presentation/pages/home/home_page.dart`
  - 实现摘要卡片组件
  - 实现卡片点击导航
  - _需求: 2.1-2.3_

- [x] 11.2 编写首页 Widget 测试
  - 测试卡片渲染
  - 测试导航功能
  - _需求: 2.1, 2.3_

## 12. 表现层 - 项目管理

- [x] 12.1 实现项目列表页面
  - 创建 `lib/presentation/pages/projects/projects_page.dart`
  - 实现项目列表展示
  - 实现添加项目按钮
  - 实现删除项目功能
  - _需求: 3.1, 3.6, 3.7_

- [x] 12.2 实现项目详情页面
  - 创建 `lib/presentation/pages/projects/project_detail_page.dart`
  - 展示项目完整信息
  - 展示依赖列表
  - 展示脚本列表
  - _需求: 3.5_

- [x] 12.3 编写项目页面 Widget 测试
  - 测试列表渲染
  - 测试详情展示
  - _需求: 3.5, 3.7_

## 13. 表现层 - Node 管理

- [x] 13.1 实现 Node 管理页面
  - 创建 `lib/presentation/pages/node/node_page.dart`
  - 展示 Node.js 版本信息
  - 展示包管理器版本
  - 展示全局包列表
  - 实现未安装提示
  - _需求: 4.1-4.5_

- [x] 13.2 编写 Node 页面 Widget 测试
  - 测试信息展示
  - 测试未安装状态
  - _需求: 4.1, 4.5_

## 14. 表现层 - Git 管理

- [x] 14.1 实现 Git 管理页面
  - 创建 `lib/presentation/pages/git/git_page.dart`
  - 展示 Git 版本信息
  - 展示全局配置
  - 实现未安装提示
  - _需求: 5.1-5.4_

- [x] 14.2 编写 Git 页面 Widget 测试
  - 测试信息展示
  - 测试未安装状态
  - _需求: 5.1, 5.4_

## 15. 表现层 - SVG 管理

- [x] 15.1 实现 SVG 管理页面
  - 创建 `lib/presentation/pages/svg/svg_page.dart`
  - 实现 SVG 网格展示
  - 实现搜索功能
  - 实现导入功能
  - _需求: 6.1-6.4_

- [x] 15.2 实现 SVG 详情对话框
  - 创建 `lib/presentation/pages/svg/svg_detail_dialog.dart`
  - 展示完整预览
  - 展示文件信息
  - 实现导出到剪贴板
  - _需求: 6.3, 6.5_

- [x] 15.3 编写 SVG 页面 Widget 测试
  - 测试网格渲染
  - 测试搜索功能
  - _需求: 6.2, 6.4_

## 16. 表现层 - 字体管理

- [x] 16.1 实现字体管理页面
  - 创建 `lib/presentation/pages/fonts/fonts_page.dart`
  - 实现字体列表展示
  - 实现搜索功能
  - 实现导入功能
  - 实现预览文本自定义
  - _需求: 7.1-7.5_

- [x] 16.2 实现字体详情对话框
  - 创建 `lib/presentation/pages/fonts/font_detail_dialog.dart`
  - 展示字体元数据
  - 展示字符预览
  - _需求: 7.3_

- [x] 16.3 编写字体页面 Widget 测试
  - 测试列表渲染
  - 测试搜索功能
  - _需求: 7.2, 7.4_

## 17. 表现层 - 设置页面

- [x] 17.1 实现设置页面
  - 创建 `lib/presentation/pages/settings/settings_page.dart`
  - 实现分类设置展示
  - 实现主题色选择
  - 实现暗黑模式切换
  - 实现语言选择
  - 实现重置功能
  - _需求: 10.1-10.4, 8.1-8.2, 9.1_

- [x] 17.2 编写设置页面 Widget 测试
  - 测试设置分组
  - 测试设置修改
  - _需求: 10.1, 10.3_

## 18. 应用入口与集成

- [x] 18.1 实现应用入口
  - 更新 `lib/main.dart`
  - 配置 ProviderScope
  - 配置主题和国际化
  - 配置路由
  - _需求: 1.1, 8.3, 9.2_

- [x] 18.2 实现应用配置
  - 创建 `lib/app.dart`
  - 整合所有配置
  - _需求: 1.1_

## 19. 最终检查点 - 确保所有测试通过

- [x] 19. 最终检查点
  - 确保所有测试通过，如有问题请询问用户
