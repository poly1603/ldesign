<!-- e4529aed-15d0-4bd0-89e4-3c6efca826a6 5949be28-f028-40bb-94ec-8ab76b68fb37 -->
# LDesign 项目核心功能缺失分析与规划

## 📋 现状确认

### 已有核心能力

- ✅ **@ldesign/webcomponent** (78个组件) - 完整的Stencil基础组件库
  - Button, Input, Select, Checkbox, Radio等所有基础UI组件
  - VirtualList, Table, Form等高性能组件
  - 性能优异,支持所有框架

- ✅ **@ldesign/flowchart** - 工作流/流程图组件
  - 审批流程图
  - 可视化流程设计
  - 智能连线系统

- ✅ **@ldesign/file** - 文件处理库(规划中)
  - 文件上传、下载
  - 分片、断点续传
  - 图片/视频处理

---

## 🎯 核心缺失功能(高优先级)

### 1. **系统菜单组件** ⭐⭐⭐⭐⭐

**建议独立为**: `@ldesign/menu` 或 `packages/menu`

**原因**:

- 你提到"系统菜单挺复杂的"，确实如此
- 菜单系统是企业应用的核心基础设施
- 复杂度体现在:权限控制、动态路由、多级嵌套、图标管理、收缩展开等

**应包含功能**:

```typescript
// 1. 基础菜单组件
- MenuContainer - 菜单容器
- MenuItem - 菜单项
- SubMenu - 子菜单
- MenuGroup - 菜单分组

// 2. 布局模式
- 顶部水平菜单
- 侧边垂直菜单
- 混合布局(顶部+侧边)

// 3. 核心功能
- 多级嵌套(无限层级)
- 权限控制(显示/隐藏)
- 动态菜单(从后端加载)
- 图标支持(集成@ldesign/icons)
- 徽章/Badge(消息提示)
- 菜单搜索
- 收缩/展开
- 固定/浮动
- 面包屑联动

// 4. 与现有包集成
- 与@ldesign/router深度集成
- 与@ldesign/permission权限集成
- 使用@ldesign/icons图标
- 使用@ldesign/store状态管理
```

**技术实现**:

- 基于@ldesign/webcomponent组件
- 支持配置式(JSON)和组件式使用
- 完整的TypeScript类型
- 响应式设计

---

### 2. **虚拟滚动/列表增强** ⭐⭐⭐⭐⭐

**建议**: 补充到 `@ldesign/webcomponent` 或独立为 `packages/virtual-list`

**现状**: webcomponent已有VirtualList,但可能需要:

- ✅ 检查是否支持无限滚动
- ✅ 检查是否支持下拉刷新
- ✅ 检查是否支持吸顶/吸底
- ⚠️ 可能需要增加:树形虚拟滚动、瀑布流虚拟滚动

**建议增强**:

```typescript
// 补充功能
- VirtualTree - 虚拟树形列表
- VirtualWaterfall - 虚拟瀑布流
- InfiniteScroll - 无限滚动容器
- PullRefresh - 下拉刷新
- StickyHeader - 吸顶头部
```

---

### 3. **通用拖拽系统** ⭐⭐⭐⭐

**建议新增**: `packages/draggable`

**原因**:

- flowchart有拖拽,但是业务特定的
- 需要通用的拖拽能力供其他组件使用

**核心功能**:

```typescript
// 1. 基础拖拽
- useDraggable() - 可拖拽hook
- useDroppable() - 可放置hook
- DragContainer - 拖拽容器

// 2. 拖拽场景
- 拖拽排序(列表)
- 拖拽到目标(上传)
- 拖拽调整大小(分屏)
- 拖拽移动位置(画布)
- 拖拽复制/移动

// 3. 高级功能
- 拖拽预览
- 拖拽约束(轴向/区域)
- 拖拽吸附(网格/参考线)
- 拖拽事件(start/move/end)
- 拖拽数据传递

// 4. 集成能力
- 与文件上传集成
- 与表单集成
- 与看板集成
```

---

### 4. **搜索/筛选组件** ⭐⭐⭐⭐

**建议新增**: `packages/search`

**核心功能**:

```typescript
// 1. 搜索组件
- SearchBox - 搜索框
- SearchSuggest - 搜索建议
- AdvancedSearch - 高级搜索
- FilterPanel - 筛选面板

// 2. 功能特性
- 实时搜索(防抖)
- 搜索历史
- 热门搜索
- 搜索高亮
- 多条件筛选
- 筛选器组
- 保存筛选方案
- 导出筛选结果

// 3. 数据源
- 本地搜索
- 远程搜索
- 全文搜索(集成)
```

---

### 5. **响应式布局系统** ⭐⭐⭐⭐

**建议新增**: `packages/layout`

**原因**:

- 目前缺少统一的布局组件
- webcomponent有基础组件,但缺少布局容器

**核心组件**:

```typescript
// 1. 容器组件
- Container - 容器(max-width)
- Row - 行
- Col - 列
- Grid - 网格
- Flex - 弹性布局

// 2. 布局组件
- Layout - 基础布局
- Header - 页头
- Sider - 侧边栏
- Content - 内容区
- Footer - 页脚

// 3. 分割组件
- Split - 分割面板
- Divider - 分割线
- Space - 间距

// 4. 响应式
- 断点系统(xs/sm/md/lg/xl/xxl)
- 响应式工具类
- 响应式hook
```

---

### 6. **操作历史/撤销重做** ⭐⭐⭐⭐

**建议新增**: `packages/history`

**核心功能**:

```typescript
// 1. 历史管理
- HistoryManager - 历史管理器
- useHistory() - 历史hook
- 状态快照
- 时间旅行

// 2. 撤销/重做
- undo() - 撤销
- redo() - 重做
- 历史栈管理
- 快捷键支持(Ctrl+Z/Ctrl+Y)

// 3. 高级功能
- 历史记录查看
- 历史对比
- 批量撤销
- 分支历史

// 4. 集成场景
- 表单编辑器
- 画布编辑器
- 富文本编辑器
- 配置编辑器
```

---

## 🟡 中优先级功能

### 7. **Mock数据工具** ⭐⭐⭐

**建议新增**: `tools/mock` 或 `packages/mock`

```typescript
// 核心功能
- Mock服务器
- Mock数据生成
- API拦截
- 请求/响应模拟
- 延迟模拟
- 错误模拟
```

---

### 8. **PWA工具包** ⭐⭐⭐

**建议新增**: `packages/pwa`

```typescript
// 核心功能
- Service Worker管理
- 离线策略
- 缓存策略
- 更新提示
- 安装提示
- 推送通知
- 后台同步
```

---

### 9. **打印功能** ⭐⭐⭐

**建议新增**: `packages/print`

```typescript
// 核心功能
- 打印预览
- 打印模板
- 页面设置
- 批量打印
- PDF导出
- 打印样式控制
```

---

## ❌ 暂不考虑(可暂缓或剔除)

### 不相关/低优先级功能

- ❌ AI集成 - 太超前,不是核心需求
- ❌ 视频会议 - 专业需求,有专门方案
- ❌ 微前端 - 架构层面,不是组件库职责
- ❌ SSR/SSG - 框架层面,不是组件库职责
- ❌ 工作流引擎 - 已有@ldesign/flowchart
- ❌ 报表系统 - 已有@ldesign/chart足够强大
- ❌ 实时协作 - 复杂度太高,可选功能

---

## 📊 优先级总结

### 立即开发(1-2个月)

1. **@ldesign/menu** - 系统菜单(最重要!)
2. 增强 **@ldesign/webcomponent/virtual-list** 
3. **packages/layout** - 布局系统

### 短期计划(3-6个月)

4. **packages/draggable** - 拖拽系统
5. **packages/search** - 搜索筛选
6. **packages/history** - 历史管理

### 中期计划(6-12个月)

7. **tools/mock** - Mock工具
8. **packages/pwa** - PWA工具
9. **packages/print** - 打印功能

---

## 💡 特别说明

### 关于 @ldesign/file

根据项目计划,file包已规划:

- 文件上传/下载
- 分片、断点续传
- 图片/视频压缩
- 云存储集成

**建议**: 按原计划实施,这是完整且必要的功能。

### 关于 @ldesign/webcomponent

已经非常完善(78个组件),只需:

1. 确保虚拟滚动功能完整
2. 可能补充一些布局容器
3. 保持现有质量继续完善

### 关于 系统菜单

**强烈建议独立为包**,原因:

1. 复杂度高(权限、路由、动态加载)
2. 使用频率极高
3. 需要深度集成多个包
4. 是企业应用的核心基础设施

---

## 🎯 核心原则

1. **聚焦基础设施** - 只做最核心、最通用的功能
2. **避免重复造轮** - 专业领域(视频会议等)用专业方案
3. **保持一致性** - 新包要与现有生态一致
4. **类型安全** - 完整的TypeScript支持
5. **性能优先** - 每个包都要考虑性能
6. **文档完善** - 每个包都要有完整文档

---

**总结**: 最需要补充的是 **系统菜单(独立包)** + **布局系统** + **拖拽系统** 这三个核心基础设施,其他高级功能可以按需逐步补充。