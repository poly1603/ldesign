# 依赖关系分析报告

## 📊 总览

- **包总数**: 37
- **依赖关系**: 62
- **循环依赖**: 0

## 📦 包列表

- **@ldesign/api** (0.1.0)
- **@ldesign/builder** (1.0.0)
- **@ldesign/cache** (0.1.0)
- **@ldesign/calendar** (0.1.0)
- **@ldesign/captcha** (1.0.0)
- **@ldesign/chart** (0.1.0)
- **@ldesign/color** (0.1.0)
- **@ldesign/component** (1.0.0)
- **@ldesign/cropper** (0.1.0)
- **@ldesign/crypto** (0.1.0)
- **@ldesign/datepicker** (1.0.0)
- **@ldesign/device** (0.1.0)
- **@ldesign/editor** (1.0.0)
- **@ldesign/engine** (0.1.0)
- **@ldesign/flowchart** (1.0.0)
- **@ldesign/form** (1.0.0)
- **@ldesign/git** (0.1.0)
- **@ldesign/http** (0.1.0)
- **@ldesign/i18n** (2.0.0)
- **@ldesign/icons** (1.0.0)
- **@ldesign/kit** (1.0.0)
- **@ldesign/launcher** (1.0.0)
- **@ldesign/map** (1.0.0)
- **@ldesign/pdf** (0.1.0)
- **@ldesign/progress** (1.0.0)
- **@ldesign/qrcode** (1.0.1)
- **@ldesign/router** (1.0.0)
- **@ldesign/shared** (0.1.0)
- **@ldesign/size** (0.1.0)
- **@ldesign/store** (0.1.0)
- **@ldesign/table** (1.0.0)
- **@ldesign/template** (0.1.0)
- **@ldesign/theme** (0.1.0)
- **@ldesign/tree** (0.1.0)
- **@ldesign/video** (0.1.0)
- **@ldesign/watermark** (0.1.0)
- **@ldesign/websocket** (1.0.0)

## 🔗 依赖关系

### @ldesign/api
- @ldesign/http (dependency)
- @ldesign/builder (devDependency)

### @ldesign/builder
- @ldesign/kit (dependency)

### @ldesign/cache
- @ldesign/builder (devDependency)

### @ldesign/calendar
- @ldesign/shared (dependency)
- @ldesign/builder (devDependency)

### @ldesign/captcha
- @ldesign/builder (devDependency)

### @ldesign/chart
- @ldesign/shared (dependency)
- @ldesign/builder (devDependency)

### @ldesign/color
- @ldesign/shared (dependency)
- @ldesign/builder (devDependency)

### @ldesign/component
- @ldesign/builder (devDependency)
- @ldesign/launcher (devDependency)

### @ldesign/cropper
- @ldesign/shared (dependency)
- @ldesign/builder (devDependency)

### @ldesign/crypto
- @ldesign/builder (devDependency)

### @ldesign/datepicker
- @ldesign/builder (devDependency)
- @ldesign/launcher (devDependency)

### @ldesign/device
- @ldesign/builder (devDependency)

### @ldesign/editor
- @ldesign/builder (devDependency)
- @ldesign/launcher (devDependency)
- @ldesign/shared (devDependency)

### @ldesign/engine
- @ldesign/builder (devDependency)

### @ldesign/flowchart
- @ldesign/shared (dependency)
- @ldesign/builder (devDependency)
- @ldesign/launcher (devDependency)

### @ldesign/form
- @ldesign/builder (devDependency)
- @ldesign/launcher (devDependency)
- @ldesign/shared (devDependency)

### @ldesign/git
- @ldesign/kit (dependency)
- @ldesign/builder (devDependency)

### @ldesign/http
- @ldesign/builder (devDependency)

### @ldesign/i18n
- @ldesign/builder (devDependency)

### @ldesign/icons
无内部依赖

### @ldesign/kit
无内部依赖

### @ldesign/launcher
无内部依赖

### @ldesign/map
- @ldesign/builder (devDependency)
- @ldesign/launcher (devDependency)

### @ldesign/pdf
- @ldesign/builder (devDependency)

### @ldesign/progress
- @ldesign/builder (devDependency)
- @ldesign/launcher (devDependency)

### @ldesign/qrcode
- @ldesign/builder (devDependency)

### @ldesign/router
- @ldesign/device (dependency)
- @ldesign/builder (devDependency)
- @ldesign/engine (devDependency)
- @ldesign/template (devDependency)

### @ldesign/shared
- @ldesign/builder (devDependency)

### @ldesign/size
- @ldesign/builder (devDependency)

### @ldesign/store
- @ldesign/builder (devDependency)

### @ldesign/table
- @ldesign/shared (dependency)
- @ldesign/builder (devDependency)

### @ldesign/template
- @ldesign/cache (dependency)
- @ldesign/device (dependency)
- @ldesign/engine (dependency)
- @ldesign/shared (dependency)
- @ldesign/builder (devDependency)

### @ldesign/theme
- @ldesign/color (dependency)
- @ldesign/builder (devDependency)

### @ldesign/tree
- @ldesign/shared (dependency)
- @ldesign/builder (devDependency)

### @ldesign/video
- @ldesign/builder (devDependency)
- @ldesign/launcher (devDependency)

### @ldesign/watermark
- @ldesign/builder (devDependency)

### @ldesign/websocket
- @ldesign/shared (dependency)
- @ldesign/builder (devDependency)

## ⚠️ 循环依赖

✅ 未发现循环依赖

## 🚀 优化建议

- 📈 高度依赖的包: @ldesign/builder(33), @ldesign/shared(11), @ldesign/launcher(8)
- 💡 考虑将这些包优先构建以提高并行度
- 🏝️ 孤立包: @ldesign/icons
- 💡 这些包可以独立构建，适合并行处理

---
*报告生成时间: 2025-09-15T12:24:22.684Z*
