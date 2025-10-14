# 预设功能集成指南

## 概述
Cropper 库提供了预设模板功能，允许用户快速应用预定义的裁剪比例和尺寸。这对于需要固定规格输出的场景非常有用，如社交媒体图片、文档尺寸等。

## 初始化配置

### 基本配置
```javascript
const cropper = new Cropper('container-id', {
  src: 'image-url',
  presets: true  // 启用预设功能，使用默认配置
});
```

### 高级配置
```javascript
const cropper = new Cropper('container-id', {
  src: 'image-url',
  presets: {
    includeDefaults: true,  // 包含默认预设
    customPresets: [        // 添加自定义预设
      {
        id: 'my-custom',
        name: '自定义尺寸',
        category: 'custom',
        aspectRatio: 16/10,
        width: 1600,
        height: 1000
      }
    ]
  }
});
```

## 使用预设

### 获取预设管理器
```javascript
const presetManager = cropper.getPresetManager();
if (!presetManager) {
  console.error('预设管理器未初始化');
  return;
}
```

### 应用预设
```javascript
// 应用特定预设
presetManager.applyPreset('instagram-post');

// 检查应用结果
const success = presetManager.applyPreset('facebook-cover');
if (success) {
  console.log('预设应用成功');
}
```

### 获取预设列表
```javascript
// 获取所有预设
const allPresets = presetManager.getAllPresets();

// 按类别获取
const socialPresets = presetManager.getPresetsByCategory('social');
const aspectPresets = presetManager.getPresetsByCategory('aspect');
```

## 默认预设类别

### 1. 纵横比预设 (aspect)
- **Free** - 自由比例
- **Square (1:1)** - 正方形
- **Landscape (4:3)** - 横向4:3
- **Landscape (16:9)** - 横向16:9
- **Portrait (3:4)** - 竖向3:4
- **Portrait (9:16)** - 竖向9:16

### 2. 社交媒体预设 (social)
- **Instagram Post** - 1080×1080 (1:1)
- **Instagram Story** - 1080×1920 (9:16)
- **Facebook Post** - 1200×630
- **Facebook Cover** - 1640×859
- **Twitter Post** - 1200×675
- **Twitter Header** - 1500×500
- **YouTube Thumbnail** - 1280×720
- **LinkedIn Post** - 1200×1200

### 3. 文档预设 (document)
- **A4 Portrait** - 210×297
- **A4 Landscape** - 297×210
- **Letter Portrait** - 216×279
- **Letter Landscape** - 279×216

### 4. 常用尺寸 (size)
- **Passport Photo** - 35×45
- **Small Thumbnail** - 150×150
- **HD 720p** - 1280×720
- **Full HD 1080p** - 1920×1080
- **4K UHD** - 3840×2160

## UI 集成示例

### HTML 结构
```html
<div class="container">
  <div id="cropper-container"></div>
  <div class="preset-panel">
    <select id="preset-select">
      <option value="">选择预设</option>
    </select>
  </div>
</div>
```

### JavaScript 集成
```javascript
// 初始化裁剪器
const cropper = new Cropper('cropper-container', {
  src: 'path/to/image.jpg',
  presets: true
});

// 等待初始化完成
setTimeout(() => {
  const presetManager = cropper.getPresetManager();
  if (!presetManager) return;
  
  // 填充预设选择器
  const select = document.getElementById('preset-select');
  const presets = presetManager.getAllPresets();
  
  const categories = {
    'aspect': '纵横比',
    'social': '社交媒体',
    'document': '文档',
    'size': '常用尺寸'
  };
  
  // 按类别分组
  const grouped = {};
  presets.forEach(preset => {
    if (!grouped[preset.category]) {
      grouped[preset.category] = [];
    }
    grouped[preset.category].push(preset);
  });
  
  // 创建选项组
  Object.keys(grouped).forEach(category => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = categories[category] || category;
    
    grouped[category].forEach(preset => {
      const option = document.createElement('option');
      option.value = preset.id;
      option.textContent = preset.name;
      if (preset.width && preset.height) {
        option.textContent += ` (${preset.width}×${preset.height})`;
      }
      optgroup.appendChild(option);
    });
    
    select.appendChild(optgroup);
  });
  
  // 监听选择变化
  select.addEventListener('change', (e) => {
    const presetId = e.target.value;
    if (presetId) {
      presetManager.applyPreset(presetId);
    } else {
      presetManager.clearPreset();
    }
  });
}, 500);
```

## 自定义预设

### 创建自定义预设
```javascript
const presetManager = cropper.getPresetManager();

// 创建基于当前裁剪的预设
const customPreset = presetManager.createCustomPreset({
  name: '我的模板',
  description: '保存的自定义裁剪',
  saveCurrentCrop: true  // 保存当前裁剪设置
});

// 手动添加预设
presetManager.addPreset({
  id: 'custom-banner',
  name: '网站横幅',
  category: 'custom',
  aspectRatio: 3,
  width: 1200,
  height: 400,
  description: '网站头部横幅尺寸'
});
```

### 导出和导入预设
```javascript
// 导出自定义预设
const customPresetsJson = presetManager.exportCustomPresets();
localStorage.setItem('myCustomPresets', customPresetsJson);

// 导入预设
const savedPresets = localStorage.getItem('myCustomPresets');
if (savedPresets) {
  presetManager.importCustomPresets(savedPresets);
}
```

## 事件监听

```javascript
// 监听预设应用事件
cropper.element.addEventListener('preset:applied', (event) => {
  const preset = event.detail.preset;
  console.log(`应用预设: ${preset.name}`);
});

// 监听预设清除事件
cropper.element.addEventListener('preset:cleared', () => {
  console.log('预设已清除');
});
```

## 常见问题

### 1. 预设没有生效
确保在 Cropper 初始化时启用了预设功能：
```javascript
const cropper = new Cropper('container', {
  presets: true  // 或 presets: { ... }
});
```

### 2. 获取不到预设管理器
预设管理器需要在 Cropper 完全初始化后才能访问：
```javascript
// 方法1: 使用 ready 事件
cropper.on('ready', () => {
  const presetManager = cropper.getPresetManager();
  // 使用 presetManager
});

// 方法2: 使用延时
setTimeout(() => {
  const presetManager = cropper.getPresetManager();
  // 使用 presetManager
}, 500);
```

### 3. 裁剪框超出容器
预设会自动缩放以适应容器大小。如果需要调整缩放比例，可以修改预设的应用逻辑。

## 最佳实践

1. **预加载预设**: 在页面加载时初始化预设，避免用户操作时的延迟
2. **分类显示**: 将预设按类别分组显示，便于用户查找
3. **视觉反馈**: 应用预设后提供视觉反馈，如高亮当前选中的预设
4. **保存用户偏好**: 记住用户最常用的预设，下次优先显示
5. **响应式适配**: 确保预设在不同屏幕尺寸下都能正常工作

## 完整示例

查看 `test-presets.html` 文件获取完整的实现示例。