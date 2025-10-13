# 图片裁剪器 - 占位符和上传功能

## 新增功能

### 1. 自定义占位符文字

当没有图片加载时，裁剪器会显示一个占位符界面，您可以自定义显示的文字：

```javascript
const cropper = new Cropper('container', {
  placeholder: {
    text: '点击或拖拽图片到这里',          // 主文字
    subtext: '支持 JPG、PNG、GIF、WEBP 格式（最大 10MB）', // 副标题
    icon: '<svg>...</svg>',               // 自定义图标（可选）
    className: 'my-custom-placeholder'     // 自定义CSS类名（可选）
  }
});
```

### 2. 点击选择图片

用户可以点击占位符区域来选择图片文件：

```javascript
const cropper = new Cropper('container', {
  placeholder: {
    clickToUpload: true,        // 启用点击上传（默认: true）
    acceptedFiles: 'image/*',   // 接受的文件类型
  }
});
```

### 3. 拖拽上传图片

支持将图片文件拖拽到裁剪器区域进行上传：

```javascript
const cropper = new Cropper('container', {
  placeholder: {
    dragAndDrop: true,          // 启用拖拽上传（默认: true）
    maxFileSize: 10             // 最大文件大小（MB）
  }
});
```

## 完整配置示例

```javascript
const cropper = new Cropper('cropper-container', {
  // 裁剪相关配置
  aspectRatio: 16 / 9,
  viewMode: 1,
  
  // 占位符和上传配置
  placeholder: {
    // 文字配置
    text: '点击或拖拽图片到这里',
    subtext: '支持 JPG、PNG、GIF、WEBP 格式（最大 10MB）',
    
    // 上传配置
    clickToUpload: true,
    dragAndDrop: true,
    acceptedFiles: 'image/*',
    maxFileSize: 10,
    
    // 样式配置
    icon: '', // 留空使用默认图标
    className: '' // 自定义CSS类
  },
  
  // 事件处理
  ready: (event) => {
    console.log('裁剪器已就绪');
  },
  
  upload: (event) => {
    const { file, url } = event.detail;
    console.log(`已上传图片: ${file.name}`);
  },
  
  uploadError: (event) => {
    const { message } = event.detail;
    console.error(`上传错误: ${message}`);
  },
  
  crop: (event) => {
    console.log('图片已裁剪', event.detail);
  }
});
```

## 新增事件

### upload 事件

当用户成功上传图片时触发：

```javascript
cropper.on('upload', (event) => {
  const { file, url } = event.detail;
  console.log('文件名:', file.name);
  console.log('文件大小:', file.size);
  console.log('文件类型:', file.type);
  console.log('临时URL:', url);
});
```

### uploadError 事件

当上传失败时触发：

```javascript
cropper.on('uploadError', (event) => {
  const { message } = event.detail;
  alert('上传失败: ' + message);
});
```

## CSS 样式定制

新增的占位符相关CSS类：

```css
/* 占位符容器 */
.cropper-placeholder {
  /* 自定义占位符样式 */
}

/* 占位符图标 */
.cropper-placeholder-icon {
  /* 自定义图标样式 */
}

/* 主文字 */
.cropper-placeholder-text {
  /* 自定义主文字样式 */
}

/* 副标题 */
.cropper-placeholder-subtext {
  /* 自定义副标题样式 */
}

/* 拖拽悬停状态 */
.cropper-placeholder-dragover {
  /* 拖拽时的样式 */
}
```

## 使用场景

### 场景1：用户头像上传

```javascript
new Cropper('avatar-container', {
  aspectRatio: 1, // 正方形
  placeholder: {
    text: '上传您的头像',
    subtext: '建议尺寸 200x200，支持 JPG/PNG',
    maxFileSize: 2
  }
});
```

### 场景2：产品图片编辑

```javascript
new Cropper('product-image', {
  aspectRatio: 4/3,
  placeholder: {
    text: '添加产品图片',
    subtext: '拖拽图片或点击浏览',
    maxFileSize: 5
  }
});
```

### 场景3：Banner 图片裁剪

```javascript
new Cropper('banner-editor', {
  aspectRatio: 16/9,
  placeholder: {
    text: 'Drop banner image here',
    subtext: 'Recommended size: 1920x1080',
    maxFileSize: 10
  }
});
```

## 注意事项

1. **文件大小限制**：默认限制为10MB，可通过 `maxFileSize` 配置调整
2. **文件类型验证**：默认只接受图片文件（`image/*`）
3. **浏览器兼容性**：需要支持 File API 和 Drag & Drop API 的现代浏览器
4. **错误处理**：建议监听 `uploadError` 事件以处理上传失败的情况

## 测试文件

项目中包含以下测试文件：

- `test-simple-upload.html` - 简单的上传功能测试
- `test-upload-placeholder.html` - 完整的占位符配置测试

打开这些文件即可测试新功能。