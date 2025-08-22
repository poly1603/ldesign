# 模板选择缓存功能实现总结

## 🎯 需求分析

用户提出的需求：

1. **选中状态显示**：当设备类型改变或初始化时，模板选择器要给当前模板渲染选中样式
2. **用户选择缓存**：当用户在当前设备类型下切换了其他模板，要缓存起来
3. **自动恢复选择**：下次刷新或下次切换到当前设备类型时，要渲染上次选择的模板

## ✅ 实现方案

### 1. 启用存储功能

在 `useTemplate` 组合函数中自动启用存储功能：

```typescript
// 创建管理器实例，启用存储功能
const manager = new TemplateManager({
  ...options,
  storage: {
    key: 'ldesign-template-selections',
    storage: 'localStorage',
    ...options.storage,
  },
})
```

**特点：**

- 默认使用 localStorage 存储
- 存储键名为 `ldesign-template-selections`
- 支持用户自定义存储配置

### 2. 保存用户选择

修改 `switchTemplate` 函数，在模板切换时自动保存用户选择：

```typescript
const switchTemplate = async (
  category: string,
  device: DeviceType,
  template: string
): Promise<void> => {
  await render({ category, device, template })

  // 保存用户的模板选择到存储
  if (manager.storageManager) {
    manager.storageManager.saveSelection(category, device, template)

    if (options.debug) {
      console.log(`💾 保存模板选择: ${category}:${device} -> ${template}`)
    }
  }
}
```

**存储格式：**

```json
{
  "selections": {
    "login:desktop": {
      "category": "login",
      "device": "desktop",
      "template": "modern",
      "timestamp": 1703123456789
    },
    "login:mobile": {
      "category": "login",
      "device": "mobile",
      "template": "simple",
      "timestamp": 1703123456790
    }
  },
  "lastUpdated": 1703123456790,
  "version": "1.0.0"
}
```

### 3. 智能模板选择策略

增强 `autoSwitchDeviceTemplate` 函数，实现智能的模板选择策略：

```typescript
// 1. 优先使用用户之前保存的选择
if (manager.storageManager) {
  const savedSelection = manager.storageManager.getSelection(category, newDevice)
  if (savedSelection) {
    targetTemplate = deviceTemplates.find(t => t.template === savedSelection.template)
  }
}

// 2. 如果没有保存的选择，优先选择当前模板在新设备上的对应版本
if (!targetTemplate) {
  targetTemplate = deviceTemplates.find(t => t.template === currentTemplate.value?.template)
}

// 3. 如果当前模板在新设备上不存在，选择第一个可用模板
if (!targetTemplate) {
  targetTemplate = deviceTemplates[0]
}
```

**选择优先级：**

1. **用户保存的选择**（最高优先级）
2. **当前模板的对应版本**
3. **设备的默认模板**（兜底策略）

### 4. 初始化时恢复选择

添加 `initializeTemplate` 函数，在组件初始化时恢复用户之前的选择：

```typescript
const initializeTemplate = async () => {
  // 1. 优先使用 initialTemplate 配置
  if (options.initialTemplate) {
    // 使用配置的初始模板
  }

  // 2. 尝试恢复用户之前保存的选择
  if (manager.storageManager) {
    const savedSelection = manager.storageManager.getSelection(category, device)
    if (savedSelection && isTemplateAvailable) {
      await switchTemplate(category, device, savedSelection.template)
      return
    }
  }

  // 3. 使用第一个可用模板作为默认选择
  if (availableForDevice.length > 0) {
    await switchTemplate(category, device, availableForDevice[0].template)
  }
}
```

### 5. 选中状态同步

修改 `TemplateSelector` 组件，确保选中状态能正确响应 `currentTemplate` 属性变化：

```typescript
// 监听 currentTemplate 属性变化，同步更新选中状态
watch(
  () => props.currentTemplate,
  newTemplate => {
    if (newTemplate !== selectedTemplate.value) {
      selectedTemplate.value = newTemplate || ''
    }
  },
  { immediate: true }
)
```

**效果：**

- 当 `currentTemplate` 属性变化时，选择器会自动更新选中状态
- 确保视觉反馈与实际状态保持一致

## 🎮 使用体验

### 用户操作流程

1. **首次访问**：

   - 系统自动选择默认模板
   - 模板选择器显示选中状态

2. **切换模板**：

   - 用户点击其他模板
   - 系统立即切换并保存选择
   - 选择器更新选中状态

3. **切换设备**：

   - 窗口缩放触发设备变化
   - 系统优先恢复该设备的保存选择
   - 如无保存选择，使用智能策略选择

4. **页面刷新**：
   - 系统自动恢复所有保存的选择
   - 用户看到与离开前一致的状态

### 调试信息

启用 `debug: true` 后，控制台会显示：

```
💾 保存模板选择: login:desktop -> modern
📋 使用保存的模板选择: modern
🔄 自动切换到 mobile 设备模板: simple
🎯 使用默认模板: classic
```

## 🧪 测试验证

### 测试页面

创建了 `test-template-cache.html` 测试页面，可以：

1. **模拟设备切换**：测试不同设备间的模板选择缓存
2. **查看存储数据**：实时查看 localStorage 中的缓存内容
3. **清空缓存**：测试清空缓存后的默认行为
4. **刷新页面**：验证页面刷新后的状态恢复

### 测试场景

- ✅ 用户选择模板后，选择被正确保存
- ✅ 切换设备时，优先恢复保存的选择
- ✅ 页面刷新后，状态正确恢复
- ✅ 模板选择器正确显示选中状态
- ✅ 清空缓存后，使用默认模板

## 🔧 技术细节

### 存储管理

- **存储引擎**：使用 `TemplateStorageManager` 类
- **存储位置**：localStorage（可配置）
- **数据格式**：JSON 格式，包含版本信息
- **错误处理**：存储失败时的降级处理

### 性能优化

- **按需保存**：只在用户主动选择时保存
- **缓存验证**：恢复时验证模板是否仍然可用
- **内存缓存**：避免重复读取 localStorage

### 兼容性

- **向后兼容**：支持旧版本数据格式
- **降级处理**：存储不可用时的备用方案
- **类型安全**：完整的 TypeScript 类型定义

## 🎉 功能特点

### 用户体验

- **无感知缓存**：用户无需手动保存，系统自动记忆
- **智能恢复**：根据上下文智能选择最合适的模板
- **视觉一致**：选中状态与实际状态始终同步

### 开发体验

- **零配置**：默认启用，无需额外配置
- **可定制**：支持自定义存储配置
- **调试友好**：详细的日志信息

### 系统稳定性

- **错误容错**：存储失败不影响核心功能
- **数据验证**：恢复时验证数据有效性
- **版本管理**：支持数据格式升级

---

**总结**：通过这次实现，我们成功为模板系统添加了完整的选择缓存功能，大大提升了用户体验。用户的每次选
择都会被智能记忆，在设备切换或页面刷新时能够无缝恢复，真正实现了"记住用户偏好"的目标。
