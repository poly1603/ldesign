# 设计文档

## 概述

Flutter Toolbox 是一个基于 Flutter 构建的跨平台前端开发工具箱应用。本设计文档详细描述了应用的架构、组件、数据模型和实现策略。

### 技术栈

- **框架**: Flutter 3.x (Dart)
- **状态管理**: Riverpod 2.x
- **本地存储**: shared_preferences + path_provider
- **国际化**: flutter_localizations + intl
- **路由**: go_router
- **UI 组件**: Material Design 3
- **系统命令执行**: process_run
- **文件选择**: file_picker

### 目标平台

- Windows (x64)
- Linux (x64)
- macOS (x64, arm64)

## 架构

### 整体架构

采用分层架构设计，遵循关注点分离原则：

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  Pages  │ │ Widgets │ │ Dialogs │ │  Shell  │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
├─────────────────────────────────────────────────────────┤
│                    Application Layer                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │  Providers  │ │  Notifiers  │ │  Services   │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
├─────────────────────────────────────────────────────────┤
│                      Domain Layer                        │
│  ┌─────────┐ ┌─────────────┐ ┌─────────────────┐       │
│  │ Models  │ │ Repositories│ │ Use Cases       │       │
│  └─────────┘ └─────────────┘ └─────────────────┘       │
├─────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │   Storage   │ │   System    │ │   Platform  │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### 目录结构

```
tools/app/
├── lib/
│   ├── main.dart                 # 应用入口
│   ├── app.dart                  # 应用配置
│   ├── core/                     # 核心模块
│   │   ├── constants/            # 常量定义
│   │   ├── extensions/           # Dart 扩展
│   │   ├── theme/                # 主题配置
│   │   ├── router/               # 路由配置
│   │   └── utils/                # 工具函数
│   ├── l10n/                     # 国际化
│   │   ├── app_en.arb            # 英文
│   │   └── app_zh.arb            # 中文
│   ├── data/                     # 数据层
│   │   ├── models/               # 数据模型
│   │   ├── repositories/         # 数据仓库
│   │   └── services/             # 数据服务
│   ├── providers/                # 状态管理
│   │   ├── app_providers.dart    # 应用级 Provider
│   │   ├── project_providers.dart
│   │   ├── node_providers.dart
│   │   ├── git_providers.dart
│   │   ├── svg_providers.dart
│   │   ├── font_providers.dart
│   │   └── settings_providers.dart
│   └── presentation/             # 表现层
│       ├── shell/                # 应用外壳
│       ├── pages/                # 页面
│       │   ├── home/
│       │   ├── projects/
│       │   ├── node/
│       │   ├── git/
│       │   ├── svg/
│       │   ├── fonts/
│       │   └── settings/
│       └── widgets/              # 通用组件
├── assets/                       # 静态资源
│   ├── icons/
│   └── images/
├── test/                         # 测试
│   ├── unit/
│   ├── widget/
│   └── integration/
├── pubspec.yaml                  # 依赖配置
└── README.md
```

## 组件与接口

### 1. 应用外壳 (AppShell)

负责整体布局和导航管理。

```dart
/// 应用外壳组件
/// 提供左侧导航菜单和右侧内容区域的布局
class AppShell extends ConsumerWidget {
  final Widget child;
  
  /// 导航菜单项列表
  List<NavigationItem> get menuItems;
  
  /// 当前选中的菜单索引
  int get selectedIndex;
  
  /// 处理菜单项点击
  void onMenuItemTap(int index);
}

/// 导航菜单项模型
class NavigationItem {
  final String title;
  final IconData icon;
  final String route;
}
```

### 2. 项目服务 (ProjectService)

负责项目的分析和管理。

```dart
/// 项目服务接口
abstract class ProjectService {
  /// 分析项目目录，提取项目信息
  Future<Project> analyzeProject(String path);
  
  /// 获取所有已保存的项目
  Future<List<Project>> getAllProjects();
  
  /// 保存项目到持久化存储
  Future<void> saveProject(Project project);
  
  /// 删除项目
  Future<void> deleteProject(String id);
  
  /// 检测项目框架类型
  FrameworkType detectFramework(Map<String, dynamic> packageJson);
}
```

### 3. 系统环境服务 (SystemService)

负责检测系统环境信息。

```dart
/// 系统服务接口
abstract class SystemService {
  /// 获取 Node.js 版本
  Future<String?> getNodeVersion();
  
  /// 获取 npm 版本
  Future<String?> getNpmVersion();
  
  /// 获取 pnpm 版本
  Future<String?> getPnpmVersion();
  
  /// 获取 yarn 版本
  Future<String?> getYarnVersion();
  
  /// 获取 Node.js 安装路径
  Future<String?> getNodePath();
  
  /// 获取全局 npm 包列表
  Future<List<NpmPackage>> getGlobalPackages();
  
  /// 获取 Git 版本
  Future<String?> getGitVersion();
  
  /// 获取 Git 安装路径
  Future<String?> getGitPath();
  
  /// 获取 Git 全局配置
  Future<GitConfig> getGitConfig();
}
```

### 4. 资源服务 (AssetService)

负责 SVG 和字体资源的管理。

```dart
/// SVG 资源服务接口
abstract class SvgAssetService {
  /// 导入 SVG 文件或目录
  Future<List<SvgAsset>> importAssets(String path);
  
  /// 获取所有 SVG 资源
  Future<List<SvgAsset>> getAllAssets();
  
  /// 搜索 SVG 资源
  Future<List<SvgAsset>> searchAssets(String query);
  
  /// 删除 SVG 资源
  Future<void> deleteAsset(String id);
  
  /// 导出 SVG 内容到剪贴板
  Future<void> exportToClipboard(SvgAsset asset);
}

/// 字体资源服务接口
abstract class FontAssetService {
  /// 导入字体文件或目录
  Future<List<FontAsset>> importAssets(String path);
  
  /// 获取所有字体资源
  Future<List<FontAsset>> getAllAssets();
  
  /// 搜索字体资源
  Future<List<FontAsset>> searchAssets(String query);
  
  /// 删除字体资源
  Future<void> deleteAsset(String id);
}
```

### 5. 设置服务 (SettingsService)

负责应用设置的管理。

```dart
/// 设置服务接口
abstract class SettingsService {
  /// 获取当前设置
  Future<AppSettings> getSettings();
  
  /// 保存设置
  Future<void> saveSettings(AppSettings settings);
  
  /// 重置为默认设置
  Future<void> resetToDefaults();
  
  /// 获取单个设置项
  Future<T?> getSetting<T>(String key);
  
  /// 设置单个设置项
  Future<void> setSetting<T>(String key, T value);
}
```

### 6. 存储服务 (StorageService)

负责数据的持久化存储。

```dart
/// 存储服务接口
abstract class StorageService {
  /// 保存 JSON 数据
  Future<void> saveJson(String key, Map<String, dynamic> data);
  
  /// 读取 JSON 数据
  Future<Map<String, dynamic>?> loadJson(String key);
  
  /// 保存字符串列表
  Future<void> saveStringList(String key, List<String> data);
  
  /// 读取字符串列表
  Future<List<String>?> loadStringList(String key);
  
  /// 删除数据
  Future<void> delete(String key);
  
  /// 清空所有数据
  Future<void> clear();
}
```

## 数据模型

### Project 模型

```dart
/// 项目模型
class Project {
  final String id;
  final String name;
  final String path;
  final String? version;
  final String? description;
  final FrameworkType framework;
  final List<Dependency> dependencies;
  final List<Dependency> devDependencies;
  final Map<String, String> scripts;
  final DateTime createdAt;
  final DateTime lastAccessedAt;
  
  /// 从 JSON 反序列化
  factory Project.fromJson(Map<String, dynamic> json);
  
  /// 序列化为 JSON
  Map<String, dynamic> toJson();
}

/// 框架类型枚举
enum FrameworkType {
  vue,
  react,
  angular,
  svelte,
  nextjs,
  nuxt,
  node,
  unknown,
}

/// 依赖模型
class Dependency {
  final String name;
  final String version;
  
  factory Dependency.fromJson(Map<String, dynamic> json);
  Map<String, dynamic> toJson();
}
```

### 系统环境模型

```dart
/// Node 环境信息
class NodeEnvironment {
  final String? nodeVersion;
  final String? nodePath;
  final String? npmVersion;
  final String? pnpmVersion;
  final String? yarnVersion;
  final List<NpmPackage> globalPackages;
  final bool isInstalled;
  
  factory NodeEnvironment.fromJson(Map<String, dynamic> json);
  Map<String, dynamic> toJson();
}

/// npm 包模型
class NpmPackage {
  final String name;
  final String version;
  
  factory NpmPackage.fromJson(Map<String, dynamic> json);
  Map<String, dynamic> toJson();
}

/// Git 环境信息
class GitEnvironment {
  final String? gitVersion;
  final String? gitPath;
  final GitConfig config;
  final bool isInstalled;
  
  factory GitEnvironment.fromJson(Map<String, dynamic> json);
  Map<String, dynamic> toJson();
}

/// Git 配置
class GitConfig {
  final String? userName;
  final String? userEmail;
  
  factory GitConfig.fromJson(Map<String, dynamic> json);
  Map<String, dynamic> toJson();
}
```

### 资源模型

```dart
/// SVG 资源模型
class SvgAsset {
  final String id;
  final String name;
  final String path;
  final String content;
  final int fileSize;
  final DateTime importedAt;
  
  factory SvgAsset.fromJson(Map<String, dynamic> json);
  Map<String, dynamic> toJson();
}

/// 字体资源模型
class FontAsset {
  final String id;
  final String name;
  final String path;
  final String fontFamily;
  final FontWeight weight;
  final FontStyle style;
  final int fileSize;
  final DateTime importedAt;
  
  factory FontAsset.fromJson(Map<String, dynamic> json);
  Map<String, dynamic> toJson();
}
```

### 设置模型

```dart
/// 应用设置模型
class AppSettings {
  final ThemeMode themeMode;
  final Color primaryColor;
  final Locale locale;
  final bool followSystemTheme;
  final String defaultProjectPath;
  final String previewText;
  
  factory AppSettings.fromJson(Map<String, dynamic> json);
  Map<String, dynamic> toJson();
  
  AppSettings copyWith({...});
}
```



## 正确性属性

*属性是系统在所有有效执行中应保持为真的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

基于验收标准的测试性分析，以下是本系统需要验证的正确性属性：

### 属性 1：项目数据往返一致性

*对于任意*有效的 Project 对象，将其序列化为 JSON 然后反序列化，应产生与原始对象等效的 Project 对象。

**验证: 需求 3.4, 11.4**

### 属性 2：项目分析提取完整元数据

*对于任意*包含有效 package.json 的项目目录，分析结果应包含 package.json 中定义的 name、version、dependencies 和 scripts 字段。

**验证: 需求 3.2**

### 属性 3：项目删除后不可访问

*对于任意*已保存的项目，删除操作完成后，该项目不应出现在项目列表中，且从存储中读取应返回空。

**验证: 需求 3.6**

### 属性 4：SVG 搜索结果匹配性

*对于任意*搜索查询字符串和 SVG 资源集合，搜索结果中的每个资源的文件名都应包含查询字符串（不区分大小写）。

**验证: 需求 6.4**

### 属性 5：字体搜索结果匹配性

*对于任意*搜索查询字符串和字体资源集合，搜索结果中的每个资源的名称或文件名都应包含查询字符串（不区分大小写）。

**验证: 需求 7.4**

### 属性 6：设置数据往返一致性

*对于任意*有效的 AppSettings 对象，将其序列化为 JSON 然后反序列化，应产生与原始对象等效的 AppSettings 对象。

**验证: 需求 8.3, 9.3, 11.4**

### 属性 7：设置重置恢复默认值

*对于任意*已修改的设置状态，执行重置操作后，所有设置项应等于预定义的默认值。

**验证: 需求 10.4**

### 属性 8：损坏数据优雅降级

*对于任意*无效或损坏的 JSON 字符串，反序列化操作应返回默认值而不是抛出异常。

**验证: 需求 11.2**

### 属性 9：资源导入后可检索

*对于任意*有效的 SVG 或字体文件，导入操作完成后，该资源应出现在对应的资源列表中。

**验证: 需求 6.1, 7.1**

### 属性 10：npm 包列表解析正确性

*对于任意*有效的 `npm list -g --json` 输出，解析结果应包含输出中列出的所有包名和版本。

**验证: 需求 4.4**

### 属性 11：Git 配置解析正确性

*对于任意*有效的 Git 配置输出，解析结果应正确提取 user.name 和 user.email 值。

**验证: 需求 5.2**

### 属性 12：预览文本更新传播

*对于任意*自定义预览文本，设置后所有字体预览组件应使用该文本进行渲染。

**验证: 需求 7.5**

## 错误处理

### 系统命令执行错误

```dart
/// 命令执行结果
class CommandResult {
  final bool success;
  final String? output;
  final String? error;
  final int exitCode;
}

/// 错误处理策略
/// - 命令不存在：返回 null 版本，设置 isInstalled = false
/// - 命令超时：返回错误信息，使用缓存数据
/// - 解析失败：记录日志，返回空列表或默认值
```

### 文件操作错误

```dart
/// 文件操作错误类型
enum FileErrorType {
  notFound,      // 文件不存在
  accessDenied,  // 权限不足
  invalidFormat, // 格式无效
  ioError,       // IO 错误
}

/// 错误处理策略
/// - 文件不存在：显示友好提示，允许重新选择
/// - 权限不足：显示权限提示
/// - 格式无效：跳过无效文件，继续处理其他文件
```

### 数据持久化错误

```dart
/// 存储错误处理
/// - 读取失败：返回默认值，记录日志
/// - 写入失败：重试一次，失败则显示错误提示
/// - JSON 解析失败：返回默认值，备份损坏数据
```

## 测试策略

### 测试框架

- **单元测试**: flutter_test (内置)
- **属性测试**: glados (Dart 属性测试库)
- **Widget 测试**: flutter_test
- **集成测试**: integration_test

### 单元测试

单元测试覆盖以下核心逻辑：

1. **数据模型序列化/反序列化**
   - Project.fromJson / toJson
   - AppSettings.fromJson / toJson
   - 各资源模型的 JSON 转换

2. **业务逻辑**
   - 框架类型检测
   - 版本号解析
   - 搜索过滤逻辑

3. **服务层**
   - 命令输出解析
   - 文件内容解析

### 属性测试

使用 glados 库进行属性测试，每个属性测试运行至少 100 次迭代。

属性测试覆盖：

1. **往返一致性测试**
   - Project 序列化往返
   - AppSettings 序列化往返
   - SvgAsset 序列化往返
   - FontAsset 序列化往返

2. **搜索功能测试**
   - SVG 搜索结果匹配性
   - 字体搜索结果匹配性

3. **数据完整性测试**
   - 项目删除后不可访问
   - 资源导入后可检索

4. **错误处理测试**
   - 损坏数据优雅降级

### Widget 测试

Widget 测试覆盖：

1. **布局测试**
   - AppShell 左右布局
   - 响应式布局适配

2. **导航测试**
   - 菜单项点击导航
   - 路由状态同步

3. **组件渲染测试**
   - 首页仪表盘卡片
   - 项目列表项
   - 设置页面分组

### 测试文件结构

```
test/
├── unit/
│   ├── models/
│   │   ├── project_test.dart
│   │   ├── settings_test.dart
│   │   └── asset_test.dart
│   ├── services/
│   │   ├── project_service_test.dart
│   │   ├── system_service_test.dart
│   │   └── storage_service_test.dart
│   └── utils/
│       └── parser_test.dart
├── property/
│   ├── project_property_test.dart
│   ├── settings_property_test.dart
│   ├── search_property_test.dart
│   └── storage_property_test.dart
├── widget/
│   ├── shell_test.dart
│   ├── home_page_test.dart
│   ├── project_page_test.dart
│   └── settings_page_test.dart
└── integration/
    └── app_test.dart
```

### 测试标注格式

每个属性测试必须使用以下格式标注：

```dart
/// **Feature: flutter-toolbox-app, Property 1: 项目数据往返一致性**
/// **Validates: Requirements 3.4, 11.4**
test('Project serialization round trip', () {
  // 测试实现
});
```
