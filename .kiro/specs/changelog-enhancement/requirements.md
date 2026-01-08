# Requirements Document

## Introduction

本文档定义了 @ldesign/changelog 工具的功能增强需求。基于现有的 changelog 生成、版本管理、多平台发布等功能，新增更多实用特性以提升开发者体验和工作效率。

## Glossary

- **Changelog_Generator**: 变更日志生成器，负责解析 Git 提交并生成格式化的变更日志
- **Commit_Parser**: 提交解析器，解析 Git 提交信息并提取结构化数据
- **Release_Manager**: 发布管理器，负责创建和管理各平台的 Release
- **Version_Analyzer**: 版本分析器，基于提交内容推荐下一个版本号
- **Template_Engine**: 模板引擎，渲染自定义 changelog 模板
- **Plugin_Manager**: 插件管理器，管理和执行插件生命周期
- **Diff_Analyzer**: 差异分析器，对比不同版本之间的变更
- **Dependency_Tracker**: 依赖追踪器，追踪和分析项目依赖变更
- **Security_Scanner**: 安全扫描器，检测提交中的安全相关变更
- **Migration_Generator**: 迁移指南生成器，自动生成版本迁移文档
- **Changelog_Merger**: 变更日志合并器，合并多个 changelog 文件
- **Interactive_CLI**: 交互式命令行界面，提供引导式操作体验

## Requirements

### Requirement 1: 依赖变更追踪

**User Story:** As a developer, I want to automatically track dependency changes in my changelog, so that I can easily see what packages were added, updated, or removed between versions.

#### Acceptance Criteria

1. WHEN the Changelog_Generator processes commits, THE Dependency_Tracker SHALL detect package.json changes and extract dependency modifications
2. WHEN dependencies are added, THE Dependency_Tracker SHALL record the package name and version
3. WHEN dependencies are updated, THE Dependency_Tracker SHALL record the package name, old version, and new version
4. WHEN dependencies are removed, THE Dependency_Tracker SHALL record the package name and previous version
5. WHEN generating changelog, THE Changelog_Generator SHALL include a dedicated "Dependencies" section listing all dependency changes
6. IF no dependency changes are detected, THEN THE Changelog_Generator SHALL omit the Dependencies section

### Requirement 2: 安全变更高亮

**User Story:** As a security-conscious developer, I want security-related changes to be highlighted in my changelog, so that users can quickly identify security fixes and updates.

#### Acceptance Criteria

1. WHEN the Commit_Parser parses commits, THE Security_Scanner SHALL identify security-related commits by keywords (security, vulnerability, CVE, XSS, SQL injection, etc.)
2. WHEN a security fix is detected, THE Changelog_Generator SHALL add a security badge/icon to the commit entry
3. WHEN generating changelog, THE Changelog_Generator SHALL create a dedicated "Security" section for security-related changes
4. WHEN security changes exist, THE Changelog_Generator SHALL place the Security section at the top of the changelog
5. IF the commit references a CVE, THEN THE Changelog_Generator SHALL include a link to the CVE database

### Requirement 3: 自动迁移指南生成

**User Story:** As a library maintainer, I want to automatically generate migration guides for breaking changes, so that users can easily upgrade to new versions.

#### Acceptance Criteria

1. WHEN a breaking change is detected, THE Migration_Generator SHALL create a migration guide entry
2. WHEN generating migration guide, THE Migration_Generator SHALL extract the breaking change description from commit body
3. WHEN AI enhancement is enabled, THE Migration_Generator SHALL use AI to generate detailed migration steps
4. THE Migration_Generator SHALL output migration guides in Markdown format
5. WHEN multiple breaking changes exist, THE Migration_Generator SHALL organize them by affected component/scope
6. THE Migration_Generator SHALL include code examples showing before/after changes when available

### Requirement 4: Changelog 合并功能

**User Story:** As a monorepo maintainer, I want to merge multiple package changelogs into a unified changelog, so that I can provide a comprehensive view of all changes.

#### Acceptance Criteria

1. WHEN the merge command is executed, THE Changelog_Merger SHALL read changelog files from specified paths
2. THE Changelog_Merger SHALL parse and normalize different changelog formats (Markdown, JSON)
3. WHEN merging changelogs, THE Changelog_Merger SHALL group entries by version and date
4. THE Changelog_Merger SHALL preserve package/scope information in merged entries
5. WHEN duplicate entries are detected, THE Changelog_Merger SHALL deduplicate based on commit hash
6. THE Changelog_Merger SHALL support configurable merge strategies (by-date, by-version, by-package)

### Requirement 5: 交互式 CLI 向导

**User Story:** As a new user, I want an interactive CLI wizard to guide me through changelog generation and release, so that I can easily use the tool without memorizing commands.

#### Acceptance Criteria

1. WHEN the user runs the interactive command, THE Interactive_CLI SHALL display a menu of available actions
2. THE Interactive_CLI SHALL guide users through version selection with smart suggestions
3. THE Interactive_CLI SHALL allow users to preview changes before generating changelog
4. THE Interactive_CLI SHALL provide step-by-step release workflow with confirmations
5. WHEN errors occur, THE Interactive_CLI SHALL provide clear error messages and recovery options
6. THE Interactive_CLI SHALL support keyboard navigation and selection

### Requirement 6: 变更影响分析

**User Story:** As a project manager, I want to see the impact analysis of changes, so that I can understand the scope and risk of each release.

#### Acceptance Criteria

1. WHEN analyzing changes, THE Diff_Analyzer SHALL calculate the number of files changed, lines added, and lines removed
2. THE Diff_Analyzer SHALL identify affected modules/packages based on file paths
3. THE Diff_Analyzer SHALL calculate a risk score based on change type and scope
4. WHEN generating reports, THE Diff_Analyzer SHALL include visual indicators for change impact (low/medium/high)
5. THE Diff_Analyzer SHALL identify potentially risky changes (large refactors, core module changes)
6. THE Diff_Analyzer SHALL generate a summary of affected areas for release notes

### Requirement 7: 提交消息模板和校验增强

**User Story:** As a team lead, I want to enforce commit message templates and provide better validation feedback, so that our team maintains consistent commit quality.

#### Acceptance Criteria

1. THE Commit_Parser SHALL support custom commit message templates
2. WHEN validating commits, THE Commit_Parser SHALL check against configured templates
3. IF a commit message is invalid, THEN THE Commit_Parser SHALL provide specific feedback on what is wrong
4. THE Commit_Parser SHALL support scope validation against a predefined list
5. THE Commit_Parser SHALL detect and warn about overly long commit subjects (configurable limit)
6. WHEN the fix flag is provided, THE Commit_Parser SHALL suggest corrections for common mistakes

### Requirement 8: 历史 Changelog 导入

**User Story:** As a developer migrating to this tool, I want to import existing changelog files, so that I can maintain a complete history.

#### Acceptance Criteria

1. WHEN the import command is executed, THE Changelog_Generator SHALL parse existing changelog files
2. THE Changelog_Generator SHALL support importing from Keep a Changelog format
3. THE Changelog_Generator SHALL support importing from conventional-changelog format
4. THE Changelog_Generator SHALL support importing from plain Markdown with version headers
5. WHEN importing, THE Changelog_Generator SHALL preserve original dates and version numbers
6. IF parsing errors occur, THEN THE Changelog_Generator SHALL report specific issues and continue with valid entries

### Requirement 9: 定时自动生成

**User Story:** As a CI/CD engineer, I want to schedule automatic changelog generation, so that changelogs are always up-to-date.

#### Acceptance Criteria

1. THE Changelog_Generator SHALL support a watch mode for continuous changelog updates
2. WHEN in watch mode, THE Changelog_Generator SHALL detect new commits and update changelog
3. THE Changelog_Generator SHALL support cron-style scheduling configuration
4. WHEN scheduled generation runs, THE Changelog_Generator SHALL only process new commits since last run
5. THE Changelog_Generator SHALL maintain a state file to track last processed commit
6. IF no new commits are found, THEN THE Changelog_Generator SHALL skip generation and log the status

### Requirement 10: 多语言 Changelog 生成

**User Story:** As an international project maintainer, I want to generate changelogs in multiple languages simultaneously, so that I can serve users in different regions.

#### Acceptance Criteria

1. THE Changelog_Generator SHALL support generating changelogs in multiple languages in a single run
2. WHEN AI enhancement is enabled, THE Changelog_Generator SHALL translate commit messages to target languages
3. THE Changelog_Generator SHALL use language-specific date and number formats
4. THE Changelog_Generator SHALL support language-specific output file naming (e.g., CHANGELOG.zh-CN.md)
5. THE Changelog_Generator SHALL maintain consistent structure across all language versions
6. WHEN translation fails, THE Changelog_Generator SHALL fall back to original language and log warning

### Requirement 11: Changelog 搜索和过滤 API

**User Story:** As a developer building a documentation site, I want to search and filter changelog entries programmatically, so that I can display relevant changes to users.

#### Acceptance Criteria

1. THE Changelog_Generator SHALL provide a search API to find entries by keyword
2. THE Changelog_Generator SHALL provide filtering by version range, date range, type, and scope
3. THE Changelog_Generator SHALL support pagination for large changelogs
4. THE Changelog_Generator SHALL return results in a structured format (JSON)
5. THE Changelog_Generator SHALL support full-text search across commit messages and descriptions
6. THE Changelog_Generator SHALL provide sorting options (by date, by type, by relevance)

### Requirement 12: 可视化仪表板增强

**User Story:** As a project stakeholder, I want a visual dashboard to explore changelog history and statistics, so that I can understand project evolution at a glance.

#### Acceptance Criteria

1. THE UI_Server SHALL display an interactive timeline of releases
2. THE UI_Server SHALL show contribution statistics with charts (commits by author, by type, by time)
3. THE UI_Server SHALL provide a searchable changelog viewer
4. THE UI_Server SHALL display dependency change history
5. THE UI_Server SHALL show release frequency and velocity metrics
6. THE UI_Server SHALL support exporting dashboard data and charts

