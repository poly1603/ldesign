# LDesign 包结构审查与优化建议

## 1. 当前项目结构概览

```
packages/
├── auth/           # 认证授权
├── bookmark/       # 书签/标签页
├── cache/          # 缓存管理
├── color/          # 主题颜色
├── crypto/         # 加密功能
├── device/         # 设备检测
├── engine/         # 核心引擎
├── error/          # 错误处理
├── http/           # HTTP 请求
├── i18n/           # 国际化
├── logger/         # 日志系统
├── menu/           # 菜单组件
├── notification/   # 通知系统
├── permission/     # 权限管理
├── router/         # 路由管理
├── shared/         # 共享工具
├── size/           # 尺寸管理
├── store/          # 状态管理
├── template/       # 模板系统
└── tracker/        # 埋点追踪
```

## 2. 发现的问题

### 2.1 ❌ 已修复：useRouteTabs 错误放置

**问题**：`useRouteTabs`（路由页签管理）被放在 `template` 包中，但它应该属于 `bookmark` 包。

**原因分析**：
- `useRouteTabs` 是管理浏览器标签页的功能
- `bookmark` 包的职责是"书签/标签页"
- `template` 包的职责是"布局模板管理"

**已完成修复**：
- ✅ 将 `useRouteTabs.ts` 从 `template` 迁移到 `bookmark`
- ✅ 更新相关导出和导入

### 2.2 ⚠️ 待处理：LayoutTabs 组件重复（926行）

**问题**：`template` 包中存在 `LayoutTabs.vue`（926行），与 `bookmark` 包中的 `ChromeTabs.vue`（741行）功能**完全重复**。

**位置**：
- `packages/template/packages/vue/src/components/layout/LayoutTabs.vue` (926行)
- `packages/bookmark/packages/vue/src/components/ChromeTabs.vue` (741行)

**功能对比**：
| 功能 | LayoutTabs | ChromeTabs |
|------|------------|------------|
| Chrome 风格 | ✅ | ✅ |
| 右键菜单 | ✅ | ✅ |
| 锁定/解锁 | ✅ | ✅ |
| lucide 图标 | ✅ | ✅ |
| 动画效果 | ✅ | ✅ |
| 滚动支持 | ✅ | ✅ |

**结论**：两个组件功能几乎相同，必须删除 LayoutTabs.vue。

**建议**：
- ✅ 保留 `ChromeTabs.vue` 作为主要标签页组件（在 bookmark 包）
- ❌ 删除 `LayoutTabs.vue`（重复代码）
- 或者将 `LayoutTabs` 改为从 `@ldesign/bookmark-vue` 重导出

### 2.3 ⚠️ 待处理：RouterTabs 组件（636行）

**问题**：`router` 包中存在 `RouterTabs.vue`（636行），与 `bookmark` 包中的标签页功能**大部分重复**。

**位置**：
- `packages/router/packages/vue/src/components/RouterTabs.vue` (636行)

**功能对比**：
| 功能 | RouterTabs | ChromeTabs |
|------|------------|------------|
| 基础样式 | 普通按钮样式 | Chrome 风格 |
| 右键菜单 | ✅ | ✅ |
| 关闭标签 | ✅ | ✅ |
| 刷新标签 | ✅ | ✅ |
| lucide 图标 | ❌（使用 emoji） | ✅ |
| mask 遮罩 | ❌ | ✅ |
| 动画效果 | ❌ | ✅ |

**结论**：RouterTabs 是较早期的实现，功能和样式都不如 ChromeTabs。

**建议**（二选一）：
1. **删除 RouterTabs**：将其从 router 包中删除，统一使用 bookmark 包的 ChromeTabs
2. **职责分离**：RouterTabs 只负责路由逻辑（不含 UI），ChromeTabs 负责 UI 渲染

### 2.4 ⚠️ 待审查：Layout 组件归属

**问题**：`template` 包中包含布局组件（LayoutHeader, LayoutSider, LayoutContent, LayoutFooter），这些是否应该独立成一个 `layout` 包？

**当前位置**：
```
packages/template/packages/vue/src/components/layout/
├── LayoutContent.vue
├── LayoutFooter.vue
├── LayoutHeader.vue
├── LayoutSider.vue
├── LayoutTabs.vue  # 应该移除，使用 bookmark 包的 ChromeTabs
└── types.ts
```

**建议方案**：

**方案 A（推荐）**：保持在 template 包
- Layout 组件是模板系统的一部分
- 模板 = 布局框架 + 组件组合
- 职责清晰：template 负责整体布局结构

**方案 B**：独立 layout 包
- 创建 `packages/layout/` 专门管理布局组件
- template 包仅负责模板切换逻辑
- 更细粒度的包划分

## 3. 包职责明确定义

| 包名 | 职责 | 包含内容 |
|------|------|----------|
| **engine** | 核心引擎 | 插件系统、生命周期、依赖注入 |
| **router** | 路由管理 | 路由配置、导航守卫、RouterView、RouterLink、RouterBreadcrumb |
| **template** | 模板系统 | 布局模板、模板切换、LayoutHeader/Sider/Content/Footer |
| **bookmark** | 书签/标签页 | ChromeTabs、useRouteTabs、书签管理 |
| **menu** | 菜单组件 | LMenu、LMenuItem、LSubMenu |
| **auth** | 认证授权 | 登录、登出、Token 管理 |
| **permission** | 权限管理 | 权限指令、权限判断 |
| **i18n** | 国际化 | 多语言切换、翻译函数 |
| **color** | 主题颜色 | 主题切换、颜色变量 |
| **size** | 尺寸管理 | 组件尺寸、响应式尺寸 |
| **device** | 设备检测 | 设备类型、屏幕信息 |
| **http** | HTTP 请求 | 请求封装、拦截器 |
| **cache** | 缓存管理 | 本地存储、内存缓存 |
| **store** | 状态管理 | 全局状态、持久化 |
| **logger** | 日志系统 | 日志记录、日志级别 |
| **error** | 错误处理 | 错误捕获、错误上报 |
| **tracker** | 埋点追踪 | 用户行为追踪 |
| **notification** | 通知系统 | 消息通知、提示 |
| **crypto** | 加密功能 | 加密、解密、哈希 |
| **shared** | 共享工具 | 通用工具函数、类型定义 |

## 4. 待执行的修改任务

### 4.1 高优先级

#### 任务 1：清理 template 包中的重复代码 ✅ 已完成

- [x] 删除 `useRouteTabs.ts`（已迁移到 bookmark）
- [x] 更新 composables/index.ts 导出
- [x] 更新 index.ts 导出

#### 任务 2：处理 LayoutTabs 组件

- [ ] 评估 `LayoutTabs.vue` 是否还在使用
- [ ] 如果 App.vue 已改用 ChromeTabs，可以删除 LayoutTabs
- [ ] 或保留为 ChromeTabs 的别名导出

#### 任务 3：清理 template/types.ts 中的 TabItem

- [ ] `packages/template/packages/vue/src/components/layout/types.ts` 中的 `TabItem` 类型
- [ ] 已在 bookmark 包中定义，template 包可以从 bookmark 导入或删除

### 4.2 中优先级

#### 任务 4：审查 RouterTabs 组件

- [ ] 检查 `packages/router/packages/vue/src/components/RouterTabs.vue` 的功能
- [ ] 确定与 ChromeTabs 的关系
- [ ] 决定保留、合并还是明确区分职责

#### 任务 5：文档更新

- [ ] 更新各包的 README.md，明确职责范围
- [ ] 添加包依赖关系图
- [ ] 添加使用指南

### 4.3 低优先级

#### 任务 6：考虑创建 layout 包（可选）

- [ ] 评估是否需要将 Layout 组件独立成包
- [ ] 如果独立，需要更新所有依赖

## 5. 包依赖关系图

```
                    ┌─────────┐
                    │ engine  │
                    └────┬────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │ router  │    │ template │    │  其他   │
    └────┬────┘    └────┬────┘    │  插件   │
         │               │         └─────────┘
         │          ┌────▼────┐
         │          │ bookmark │ ◄── 标签页组件
         │          └─────────┘
         │
    ┌────▼────┐
    │  menu   │ ◄── 菜单组件
    └─────────┘
```

## 6. 命名规范建议

### 组件命名

| 包 | 组件前缀 | 示例 |
|---|---|---|
| menu | L | LMenu, LMenuItem, LSubMenu |
| bookmark | L | LChromeTabs, LBookmarkBar |
| template | Layout | LayoutHeader, LayoutSider |
| router | Router | RouterView, RouterLink |

### Composable 命名

| 包 | 前缀 | 示例 |
|---|---|---|
| bookmark | useRoute/useBookmark | useRouteTabs, useBookmarkStore |
| template | useTemplate/useLayout | useTemplate, useLayout, useSider |
| router | useRouter | useRouter, useRoute |
| i18n | useI18n | useI18n |
| color | useColor/useTheme | useColor, useThemeMode |

## 7. 总结

### 已完成
1. ✅ useRouteTabs 已从 template 迁移到 bookmark
2. ✅ App.vue 已更新导入路径

### 待处理
1. ⏳ 删除或废弃 template 包中的 LayoutTabs.vue
2. ⏳ 清理 template/types.ts 中的重复类型
3. ⏳ 审查 router 包中的 RouterTabs 组件
4. ⏳ 更新各包的文档

### 原则
- **单一职责**：每个包只负责一个功能域
- **避免重复**：相同功能只在一个包中实现
- **明确依赖**：包之间的依赖关系要清晰
- **统一命名**：遵循命名规范

---

## 8. 具体修改任务（可执行）

### 任务清单

#### ✅ 任务 1：useRouteTabs 迁移（已完成）

```bash
# 已完成的操作
# 1. 创建 packages/bookmark/packages/vue/src/composables/useRouteTabs.ts
# 2. 更新 packages/bookmark/packages/vue/src/types/index.ts
# 3. 更新 packages/bookmark/packages/vue/src/composables/index.ts
# 4. 更新 apps/app-vue/src/App.vue 导入
# 5. 删除 packages/template/packages/vue/src/composables/useRouteTabs.ts
```

#### ⏳ 任务 2：删除 LayoutTabs.vue（高优先级）

**文件路径**：`packages/template/packages/vue/src/components/layout/LayoutTabs.vue`

**操作步骤**：
```bash
# 步骤 1: 确认 App.vue 已使用 ChromeTabs
# 检查 apps/app-vue/src/App.vue 导入语句

# 步骤 2: 检查其他引用
# 搜索项目中所有 LayoutTabs 的引用

# 步骤 3: 删除文件
rm packages/template/packages/vue/src/components/layout/LayoutTabs.vue

# 步骤 4: 更新 layout/index.ts
# 移除 LayoutTabs 的导出
```

**修改文件**：
- `packages/template/packages/vue/src/components/layout/index.ts`

#### ⏳ 任务 3：清理 template/types.ts（中优先级）

**文件路径**：`packages/template/packages/vue/src/components/layout/types.ts`

**当前内容**（需要删除或修改）：
```typescript
// 这些类型已在 @ldesign/bookmark-vue 中定义
export interface TabItem { ... }           // 删除
export interface TabContextMenuItem { ... } // 删除
export type TabContextAction = ...         // 删除
export type TabVariant = ...               // 删除
```

**操作**：删除整个 `types.ts` 文件，或改为重导出：
```typescript
// 重导出 bookmark 包的类型
export type {
  TabItem,
  TabContextMenuItem,
  TabContextAction,
  TabVariant,
} from '@ldesign/bookmark-vue'
```

#### ⏳ 任务 4：处理 RouterTabs（低优先级）

**文件路径**：`packages/router/packages/vue/src/components/RouterTabs.vue`

**决策**：RouterTabs 是早期实现，功能不如 ChromeTabs 完善。

**建议操作**：
1. 标记为废弃（@deprecated）
2. 在文档中说明推荐使用 `@ldesign/bookmark-vue` 的 ChromeTabs
3. 保留一段时间后删除

---

## 9. 问题决策记录

| 问题 | 决策 | 原因 |
|------|------|------|
| useRouteTabs 放哪个包？ | bookmark | 标签页管理是 bookmark 的核心功能 |
| ChromeTabs 放哪个包？ | bookmark | 标签页组件属于 bookmark 职责 |
| Layout 组件放哪个包？ | template | 布局是模板系统的一部分 |
| LayoutTabs 是否删除？ | 删除 | 与 ChromeTabs 功能重复 |

---

## 10. 变更日志

### 2024-XX-XX
- ✅ 迁移 useRouteTabs 到 bookmark 包
- ✅ 添加 TabItem 类型到 bookmark 包
- ✅ 更新 App.vue 导入路径
- ✅ 删除 template 包中的 useRouteTabs.ts

