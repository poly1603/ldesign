# @ldesign/color Changelog

All notable changes to this package will be documented in this file.

## [0.1.0] - 2024-09-24 🎉

### ✨ 新增功能

#### 类型系统完善
- **新增** 精确的颜色类型定义（HexColor、RgbColor、HslColor 等）
- **新增** 层次化的配置接口（BaseColorConfig、ColorConfig、StrictColorConfig）
- **新增** 高级类型系统和工具类型库
- **新增** 强类型事件系统

#### 错误处理机制
- **新增** 自定义错误类型（ColorError、ValidationError、ConversionError）
- **新增** 颜色验证函数和安全操作函数
- **新增** 完善的错误恢复策略

#### 类型守卫系统
- **新增** 运行时类型检查函数（isHexColor、isRgbColor 等）
- **新增** 类型断言和格式检测功能

#### 构建配置优化
- **新增** 开发/生产环境专用配置
- **新增** 构建性能监控和依赖分析脚本

### 🔧 性能优化
- **优化** Bundle 大小减少 58.5%（481KB → 199.8KB）
- **优化** 实现 LRU 缓存机制
- **优化** Tree-shaking 支持

### 🐛 问题修复
- Fix: Guard `window.matchMedia` usage in DarkModeToggle to support JSDOM/test environments
- Fix: Division-by-zero and count=1 edge cases in palette generation utilities
- Fix: CSS style element creation in test environments
- Fix: Vue plugin default theme and ThemeSelector UX improvements
- Fix: 修复所有测试失败问题，实现 100% 测试通过率

### 📚 文档更新
- **新增** 错误处理和类型守卫 API 文档
- **更新** README 和 API 索引文档
- **新增** 代码风格指南

### 📊 性能指标
- **测试通过率**: 100% (338/338)
- **Bundle 大小**: 所有模块都在目标限制内
- **构建时间**: ~8s (标准构建)

## Unreleased

### 🔄 开发中
- 进一步提升测试覆盖率
- 添加更多颜色空间支持
- WebAssembly 加速计算
