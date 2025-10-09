# 文件重组执行计划

## 📁 新的目录结构

按照 OPTIMIZATION_PLAN.md 的建议，将 core 目录重组为：

```
src/core/
├── launcher/           # 启动器核心
│   ├── ViteLauncher.ts
│   └── index.ts
├── config/             # 配置管理
│   ├── ConfigManager.ts
│   ├── ConfigPresets.ts
│   ├── SmartPresetManager.ts
│   └── index.ts
├── plugin/             # 插件系统
│   ├── PluginManager.ts
│   ├── SmartPluginManager.ts (合并功能)
│   ├── PluginMarket.ts
│   └── index.ts
├── performance/        # 性能系统
│   ├── PerformanceMonitor.ts
│   ├── PerformanceOptimizer.ts
│   └── index.ts
├── cache/              # 缓存系统
│   ├── CacheManager.ts
│   └── index.ts
├── tools/              # 工具管理
│   ├── ToolsManager.ts
│   ├── AliasManager.ts
│   ├── DevExperience.ts
│   ├── TestIntegration.ts
│   ├── ProjectTemplates.ts
│   └── index.ts
└── index.ts            # 主导出文件
```

## 🔄 文件移动映射

### 1. launcher 目录
- `ViteLauncher.ts` → `launcher/ViteLauncher.ts`

### 2. config 目录
- `ConfigManager.ts` → `config/ConfigManager.ts`
- `ConfigPresets.ts` → `config/ConfigPresets.ts`
- `SmartPresetManager.ts` → `config/SmartPresetManager.ts`

### 3. plugin 目录
- `PluginManager.ts` → `plugin/PluginManager.ts`
- `SmartPluginManager.ts` → `plugin/SmartPluginManager.ts` (待合并)
- `PluginMarket.ts` → `plugin/PluginMarket.ts`

### 4. performance 目录
- `PerformanceMonitor.ts` → `performance/PerformanceMonitor.ts`
- `PerformanceOptimizer.ts` → `performance/PerformanceOptimizer.ts`

### 5. cache 目录
- `CacheManager.ts` → `cache/CacheManager.ts`

### 6. tools 目录
- `ToolsManager.ts` → `tools/ToolsManager.ts`
- `AliasManager.ts` → `tools/AliasManager.ts`
- `DevExperience.ts` → `tools/DevExperience.ts`
- `TestIntegration.ts` → `tools/TestIntegration.ts`
- `ProjectTemplates.ts` → `tools/ProjectTemplates.ts`

## ✅ 重组后的优势

1. **更清晰的模块职责** - 每个目录都有明确的功能范围
2. **更好的可维护性** - 相关功能集中在一起
3. **更容易查找** - 目录结构一目了然
4. **便于扩展** - 新功能可以轻松添加到对应目录

## 📝 注意事项

由于这是大规模的文件移动，建议：
1. 先完成测试修复（已完成 ✅）
2. 逐个目录移动文件并更新导入路径
3. 每个目录移动完成后运行测试确认
4. 最后更新主 index.ts 导出文件

## 🎯 当前状态

- ✅ 测试修复完成 (238 passed | 29 skipped)
- ✅ 目录结构创建完成
- 🔄 准备移动文件和更新导入路径
