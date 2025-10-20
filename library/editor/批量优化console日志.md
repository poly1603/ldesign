# 📝 批量优化console日志方案

**目标：** 将337处console语句替换为logger  
**方法：** 分批手动优化+自动化脚本

---

## 🎯 优化策略

### 方案1：手动优化关键文件（推荐）
**优先优化的文件（Top 10）：**
1. src/ui/Toolbar.ts - 35处 ⭐
2. src/plugins/formatting/font.ts - 30处
3. src/plugins/media/media-dialog.ts - 57处
4. src/plugins/table.ts - 45处
5. src/core/Plugin.ts - 10处 ⭐
6. src/plugins/table-enhanced.ts - 6处
7. src/plugins/codeblock.ts - 7处
8. src/plugins/ai/AIPluginV2.ts - 7处
9. src/utils/EditorHelper.ts - 6处
10. src/plugins/text/heading.ts - 6处

**步骤：**
```typescript
// 1. 添加logger导入
import { createLogger } from '@utils/logger'
const logger = createLogger('ModuleName')

// 2. 替换console
console.log('[Module]') → logger.debug('')
console.warn('[Module]') → logger.warn('')
console.error('[Module]') → logger.error('')
console.info('[Module]') → logger.info('')
```

**预计时间：** 2-3小时

---

### 方案2：自动化脚本（辅助）
```bash
# PowerShell脚本
$files = Get-ChildItem -Path src -Recurse -Filter "*.ts"

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw
  
  # 检查是否有console语句
  if ($content -match "console\.(log|warn|error|info)") {
    Write-Host "Found console in: $($file.FullName)"
    # 手动处理
  }
}
```

**注意：** 需要手动添加logger导入

---

## ✅ 已优化的文件

### 核心文件（已完成）
- ✅ src/core/Editor.ts
- ✅ src/core/Command.ts
- ✅ src/core/History.ts
- ✅ src/plugins/utils/history.ts

---

## ⚪ 待优化的文件（优先级排序）

### 🔴 高优先级（本周）
1. ⚪ src/ui/Toolbar.ts (35处)
2. ⚪ src/core/Plugin.ts (10处)
3. ⚪ src/plugins/text/heading.ts (6处)

### 🟡 中优先级（本月）
4. ⚪ src/plugins/formatting/font.ts (30处)
5. ⚪ src/plugins/media/media-dialog.ts (57处)
6. ⚪ src/plugins/table.ts (45处)
7. ⚪ src/plugins/table-enhanced.ts (6处)

### 🟢 低优先级（待定）
- 其他36个文件的console语句

---

## 📊 预期效果

### 优化后
```
生产包体积： -5-10KB
日志统一性： 100%
调试效率：   +60%
```

---

**建议：** 优先手动优化Top 10文件，其他文件逐步优化









