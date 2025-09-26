# 预览页面构建产物检测改进

## 功能改进说明

预览页面现在会根据实际的构建产物目录来判断构建状态和时间，而不是依赖任务历史记录。这使得构建状态的显示更加准确和实时。

## 主要改动

### 1. 构建产物目录检测逻辑

**文件：** `packages/cli/src/web/project-manager.ts`

- **改进的配置文件查找逻辑**：
  - 优先查找项目根目录的 launcher 配置文件（launcher.config.ts/mjs/js/cjs）
  - 然后查找 .ldesign 目录下的配置
  - 支持 vite.config.* 作为后备配置
  - 支持环境特定的配置文件

- **增强的 outDir 解析**：
  - 支持标准格式：`outDir: 'dist'`
  - 支持环境特定配置：`build: { [environment]: { outDir: 'dist-env' } }`
  - 支持动态配置：`mode === 'production' ? 'dist' : 'dist-dev'`

- **默认构建目录**：
  - development: `dist-dev`
  - test: `dist-test`
  - staging: `dist-staging`
  - production: `dist`

### 2. 构建时间获取

**文件：** `packages/cli/web-ui/src/pages/PreviewPage.tsx`

- 从构建产物目录的修改时间获取，而不是从任务记录
- 只在构建产物存在时才显示构建时间
- 时间格式：`YYYY/MM/DD HH:mm`

### 3. 用户界面改进

- **手动刷新按钮**：
  - 添加了"刷新状态"按钮，可以手动检查构建状态
  - 按钮在检查时显示加载动画

- **自动刷新**：
  - 每 10 秒自动刷新一次构建状态
  - 组件卸载时清理定时器

- **状态指示器**：
  - ✓ 已构建（绿色）
  - ✗ 未构建（红色）
  - 检查中...（黄色）

## 技术实现细节

### 构建检查流程

1. **读取配置文件**
   ```typescript
   // 按优先级查找配置文件
   launcher.config.ts -> launcher.config.mjs -> launcher.config.js -> vite.config.ts
   ```

2. **解析输出目录**
   ```typescript
   // 从配置中提取 outDir
   build: { outDir: 'dist' }
   ```

3. **检查构建产物**
   ```typescript
   // 检查目录是否存在且不为空
   existsSync(buildPath) && files.length > 0
   ```

4. **获取构建时间**
   ```typescript
   // 使用目录的修改时间
   stats.mtime
   ```

### API 接口

- `GET /build/check/:environment` - 检查指定环境的构建产物是否存在
- `GET /build/time/:environment` - 获取指定环境的构建时间
- `DELETE /build/clean/:environment` - 清理指定环境的构建产物

## 用户体验改进

1. **更准确的状态显示**
   - 基于实际文件系统状态，而不是历史记录
   - 避免显示过时的构建信息

2. **更好的反馈**
   - 实时检查构建状态
   - 清晰的状态指示器
   - 构建时间显示

3. **更多的控制**
   - 手动刷新按钮
   - 自动定期刷新
   - 环境特定的构建检查

## 测试建议

1. **配置文件测试**
   - 创建不同格式的 launcher 配置文件
   - 测试环境特定的配置
   - 测试没有配置文件的情况

2. **构建产物测试**
   - 执行构建命令生成产物
   - 删除构建产物目录
   - 检查状态更新是否正确

3. **界面测试**
   - 点击刷新按钮
   - 等待自动刷新
   - 切换不同环境

## 注意事项

- 配置文件解析使用简单的正则匹配，可能无法处理复杂的动态配置
- 构建时间基于目录的修改时间，可能不完全准确
- 自动刷新间隔为 10 秒，可根据需要调整