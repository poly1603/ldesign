# Image 图片

功能丰富的图片组件，提供懒加载、占位/回退、响应式、预览、下载、旋转等全面功能。

## 核心特性

- 🖼 **智能尺寸控制** - 支持固定/响应式宽高，自动比例计算
- ⚡ **高性能加载** - 懒加载、进度显示、智能重试
- 🎨 **丰富的展示模式** - 多种裁剪模式、形状、圆角
- 🔍 **强大的预览功能** - 缩放、旋转、拖拽、全屏、下载
- 📱 **响应式支持** - srcset/sizes、多格式源（AVIF/WebP）
- 🛡 **容错机制** - 占位图、错误处理、回退图片
- ♿ **无障碍支持** - 完整的 ARIA 标签和键盘操作

## 基础用法

### 固定尺寸

<div class="demo-block">
  <ldesign-image
    src="https://picsum.photos/800/600"
    width="320"
    height="240"
    radius="8"
    fit="cover"
    alt="固定尺寸示例"
  />
</div>

```html
<ldesign-image
  src="https://picsum.photos/800/600"
  width="320"         <!-- 数字自动转换为 px -->
  height="240"        <!-- 数字自动转换为 px -->
  radius="8"          <!-- 圆角半径 -->
  fit="cover"         <!-- 裁剪模式 -->
  alt="固定尺寸示例"
/>
```

### 响应式尺寸

<div class="demo-block">
  <ldesign-image
    src="https://picsum.photos/800/600?random=1"
    width="100%"        
    height="200"
    fit="cover"
    alt="响应式宽度"
  />
</div>

```html
<ldesign-image
  src="image.jpg"
  width="100%"         <!-- 百分比宽度 -->
  height="200"         <!-- 固定高度 -->
  fit="cover"
/>

<!-- 或者只设置宽度，高度自动计算 -->
<ldesign-image
  src="image.jpg"
  width="100%"
  ratio="16/9"         <!-- 使用宽高比 -->
/>
```

## 尺寸与比例控制

### 宽高属性的工作机制

1. **width/height 生效原理**：
   - 这些属性设置的是图片容器（wrapper）的尺寸
   - 内部的 `<img>` 元素始终是 `width: 100%; height: 100%`
   - 通过 `object-fit` 控制图片在容器内的展示方式

2. **三种尺寸设置方式**：
   - **固定尺寸**：同时设置 width 和 height
   - **自适应高度**：只设置 width + ratio（推荐）
   - **完全响应式**：width="100%" + ratio

### 使用 ratio 避免布局抖动

<div class="demo-block" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
  <div>
    <p style="font-size: 12px; color: #666; margin: 0 0 8px;">16:9 横屏</p>
    <ldesign-image
      src="https://picsum.photos/800/450?random=2"
      width="100%"
      ratio="16/9"
      fit="cover"
      alt="16:9"
    />
  </div>
  <div>
    <p style="font-size: 12px; color: #666; margin: 0 0 8px;">4:3 标准</p>
    <ldesign-image
      src="https://picsum.photos/800/600?random=3"
      width="100%"
      ratio="4/3"
      fit="cover"
      alt="4:3"
    />
  </div>
  <div>
    <p style="font-size: 12px; color: #666; margin: 0 0 8px;">1:1 正方形</p>
    <ldesign-image
      src="https://picsum.photos/600/600?random=4"
      width="100%"
      ratio="1/1"
      fit="cover"
      alt="1:1"
    />
  </div>
</div>

```html
<!-- ratio 支持多种格式 -->
<ldesign-image ratio="16/9" />     <!-- 斜杠分隔 -->
<ldesign-image ratio="16:9" />     <!-- 冒号分隔 -->
<ldesign-image ratio="1.777" />    <!-- 小数形式 -->
<ldesign-image ratio={16/9} />     <!-- JSX 中可以直接计算 -->
```

## 懒加载

### 懒加载演示（滚动查看效果）

<div class="demo-block">
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">懒加载（默认200px阈值）</p>
      <ldesign-image
        src="https://picsum.photos/600/400?random=100"
        width="100%"
        ratio="3/2"
        fit="cover"
        lazy
        placeholder-color="#e6f7ff"
        alt="懒加载1"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">提前加载（300px阈值）</p>
      <ldesign-image
        src="https://picsum.photos/600/400?random=101"
        width="100%"
        ratio="3/2"
        fit="cover"
        lazy
        intersection-root-margin="300px"
        placeholder-color="#f6ffed"
        alt="懒加载2"
      />
    </div>
  </div>
</div>

### 多图懒加载

<div class="demo-block" style="height: 300px; overflow-y: auto; border: 1px solid #d9d9d9; padding: 16px;">
  <p style="font-size: 14px; color: #666; margin: 0 0 16px;">滚动以加载更多图片 ↓</p>
  <div style="display: grid; gap: 16px;">
    <ldesign-image
      src="https://picsum.photos/600/400?random=102"
      width="100%"
      ratio="3/2"
      lazy
      placeholder-color="#fff1f0"
      alt="滚动加载1"
    />
    <ldesign-image
      src="https://picsum.photos/600/400?random=103"
      width="100%"
      ratio="3/2"
      lazy
      placeholder-color="#e6f7ff"
      alt="滚动加载2"
    />
    <ldesign-image
      src="https://picsum.photos/600/400?random=104"
      width="100%"
      ratio="3/2"
      lazy
      placeholder-color="#f6ffed"
      alt="滚动加载3"
    />
    <ldesign-image
      src="https://picsum.photos/600/400?random=105"
      width="100%"
      ratio="3/2"
      lazy
      placeholder-color="#fff7e6"
      alt="滚动加载4"
    />
  </div>
</div>

```html
<ldesign-image
  src="image.jpg"
  lazy                             <!-- 启用懒加载 -->
  intersection-root-margin="300px" <!-- 预加载距离 -->
/>
```

## 占位与回退

### 占位图示例

<div class="demo-block">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">默认骨架屏</p>
      <ldesign-image
        src="https://picsum.photos/800/600?random=90&delay=2"
        width="250"
        height="180"
        show-loading
        placeholder-color="#f5f5f5"
        alt="默认骨架"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">自定义占位图</p>
      <ldesign-image
        src="https://picsum.photos/800/600?random=91&delay=2"
        placeholder="https://picsum.photos/80/60?random=91&blur=5"
        width="250"
        height="180"
        alt="自定义占位"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">回退图片</p>
      <ldesign-image
        src="https://invalid-url.example/image.jpg"
        fallback="https://picsum.photos/250/180?random=92"
        width="250"
        height="180"
        alt="回退图片"
      />
    </div>
  </div>
</div>

```html
<!-- 默认骨架屏 -->
<ldesign-image
  src="image.jpg"
  show-loading
  placeholder-color="#f5f5f5"
/>

<!-- 自定义占位图 -->
<ldesign-image
  src="image.jpg"
  placeholder="blur-thumbnail.jpg"
/>

<!-- 回退图片 -->
<ldesign-image
  src="unreliable.jpg"
  fallback="backup.jpg"
/>
```

## 响应式图片

### srcset/sizes 响应式图片

<div class="demo-block">
  <ldesign-image
    src="https://picsum.photos/1200/800?random=80"
    srcset="https://picsum.photos/480/320?random=80 480w, 
            https://picsum.photos/800/533?random=80 800w, 
            https://picsum.photos/1200/800?random=80 1200w"
    sizes="(max-width: 600px) 480px, 
           (max-width: 900px) 800px, 
           1200px"
    width="100%"
    ratio="3/2"
    fit="cover"
    alt="响应式图片示例"
  />
</div>

```html
<ldesign-image
  src="fallback.jpg"
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
  width="100%"
  fit="cover"
/>
```

## 裁剪与定位

### fit 属性效果对比

<div class="demo-block">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">fit="contain" (保持比例，完整显示)</p>
      <div style="background: #f0f0f0; border: 1px solid #d9d9d9;">
        <ldesign-image
          src="https://picsum.photos/300/200?random=30"
          width="200"
          height="150"
          fit="contain"
          alt="contain示例"
        />
      </div>
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">fit="cover" (覆盖容器，可能裁剪)</p>
      <ldesign-image
        src="https://picsum.photos/300/200?random=31"
        width="200"
        height="150"
        fit="cover"
        alt="cover示例"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">fit="fill" (拉伸填充，可能变形)</p>
      <ldesign-image
        src="https://picsum.photos/300/200?random=32"
        width="200"
        height="150"
        fit="fill"
        alt="fill示例"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">fit="none" (原始尺寸)</p>
      <div style="overflow: hidden; width: 200px; height: 150px; border: 1px solid #d9d9d9;">
        <ldesign-image
          src="https://picsum.photos/300/200?random=33"
          width="200"
          height="150"
          fit="none"
          alt="none示例"
        />
      </div>
    </div>
  </div>
</div>

### position 定位控制

<div class="demo-block">
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">position="top center"</p>
      <ldesign-image
        src="https://picsum.photos/400/600?random=34"
        width="200"
        height="150"
        fit="cover"
        position="top center"
        alt="顶部居中"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">position="center center"</p>
      <ldesign-image
        src="https://picsum.photos/400/600?random=35"
        width="200"
        height="150"
        fit="cover"
        position="center center"
        alt="完全居中"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">position="bottom center"</p>
      <ldesign-image
        src="https://picsum.photos/400/600?random=36"
        width="200"
        height="150"
        fit="cover"
        position="bottom center"
        alt="底部居中"
      />
    </div>
  </div>
</div>

```html
<!-- fit 属性示例 -->
<ldesign-image src="image.jpg" width="200" height="150" fit="contain" />
<ldesign-image src="image.jpg" width="200" height="150" fit="cover" />
<ldesign-image src="image.jpg" width="200" height="150" fit="fill" />
<ldesign-image src="image.jpg" width="200" height="150" fit="none" />

<!-- position 属性示例 -->
<ldesign-image src="image.jpg" fit="cover" position="top center" />
<ldesign-image src="image.jpg" fit="cover" position="center center" />
<ldesign-image src="image.jpg" fit="cover" position="bottom center" />
```


## 形状与圆角

### 预设形状

<div class="demo-block">
  <div style="display: flex; gap: 20px; align-items: center;">
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">shape="square" (默认)</p>
      <ldesign-image 
        src="https://picsum.photos/200/200?random=40"
        width="120"
        height="120"
        shape="square"
        fit="cover"
        alt="方形"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">shape="rounded"</p>
      <ldesign-image 
        src="https://picsum.photos/200/200?random=41"
        width="120"
        height="120"
        shape="rounded"
        fit="cover"
        alt="圆角"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">shape="circle"</p>
      <ldesign-image 
        src="https://picsum.photos/200/200?random=42"
        width="120"
        height="120"
        shape="circle"
        fit="cover"
        alt="圆形"
      />
    </div>
  </div>
</div>

### 自定义圆角

<div class="demo-block">
  <div style="display: flex; gap: 20px; align-items: center;">
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">radius="4"</p>
      <ldesign-image 
        src="https://picsum.photos/200/200?random=43"
        width="120"
        height="120"
        radius="4"
        fit="cover"
        alt="4px圆角"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">radius="16"</p>
      <ldesign-image 
        src="https://picsum.photos/200/200?random=44"
        width="120"
        height="120"
        radius="16"
        fit="cover"
        alt="16px圆角"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">radius="50%"</p>
      <ldesign-image 
        src="https://picsum.photos/200/200?random=45"
        width="120"
        height="120"
        radius="50%"
        fit="cover"
        alt="50%圆角"
      />
    </div>
  </div>
</div>

```html
<!-- 预设形状 -->
<ldesign-image src="image.jpg" shape="square" />
<ldesign-image src="image.jpg" shape="rounded" />
<ldesign-image src="image.jpg" shape="circle" />

<!-- 自定义圆角 -->
<ldesign-image src="image.jpg" radius="4" />
<ldesign-image src="image.jpg" radius="16" />
<ldesign-image src="image.jpg" radius="50%" />
```

## 图集展示（ImageGroup）

### 基础图集

<div class="demo-block">
  <ldesign-image-group columns="4" gap="12" shape="rounded">
    <ldesign-image 
      src="https://picsum.photos/300/300?random=50" 
      ratio="1/1"
      fit="cover"
      preview
      alt="图片1"
    />
    <ldesign-image 
      src="https://picsum.photos/300/300?random=51" 
      ratio="1/1"
      fit="cover"
      preview
      alt="图片2"
    />
    <ldesign-image 
      src="https://picsum.photos/300/300?random=52" 
      ratio="1/1"
      fit="cover"
      preview
      alt="图片3"
    />
    <ldesign-image 
      src="https://picsum.photos/300/300?random=53" 
      ratio="1/1"
      fit="cover"
      preview
      alt="图片4"
    />
  </ldesign-image-group>
</div>

### 不同列数

<div class="demo-block">
  <p style="font-size: 14px; color: #666; margin: 0 0 12px;">columns="3" gap="16"</p>
  <ldesign-image-group columns="3" gap="16">
    <ldesign-image src="https://picsum.photos/300/200?random=54" ratio="3/2" fit="cover" />
    <ldesign-image src="https://picsum.photos/300/200?random=55" ratio="3/2" fit="cover" />
    <ldesign-image src="https://picsum.photos/300/200?random=56" ratio="3/2" fit="cover" />
    <ldesign-image src="https://picsum.photos/300/200?random=57" ratio="3/2" fit="cover" />
    <ldesign-image src="https://picsum.photos/300/200?random=58" ratio="3/2" fit="cover" />
    <ldesign-image src="https://picsum.photos/300/200?random=59" ratio="3/2" fit="cover" />
  </ldesign-image-group>
</div>

```html
<ldesign-image-group columns="4" gap="12" shape="rounded">
  <ldesign-image src="..." ratio="1/1" preview />
  <ldesign-image src="..." ratio="1/1" preview />
  <!-- ... -->
</ldesign-image-group>
```

## 强大的预览功能

### 基础预览

开启 `preview` 属性后，点击图片即可进入预览模式。

<div class="demo-block">
  <ldesign-image
    src="https://picsum.photos/400/300?random=10"
    preview-src="https://picsum.photos/1600/1200?random=10"
    width="300"
    height="200"
    fit="cover"
    preview
    downloadable
    rotatable
    fullscreenable
    show-info
    alt="点击查看完整预览功能"
  />
</div>

```html
<ldesign-image
  src="thumbnail.jpg"              <!-- 缩略图 -->
  preview-src="high-res.jpg"       <!-- 高清大图 -->
  preview                           <!-- 开启预览 -->
  downloadable                      <!-- 显示下载按钮 -->
  rotatable                         <!-- 显示旋转按钮 -->
  fullscreenable                    <!-- 显示全屏按钮 -->
  show-info                         <!-- 显示图片信息 -->
/>
```

### 预览功能演示

<div class="demo-block">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">完整预览功能</p>
      <ldesign-image
        src="https://picsum.photos/400/300?random=70"
        preview-src="https://picsum.photos/1600/1200?random=70"
        width="200"
        height="150"
        fit="cover"
        preview
        downloadable
        rotatable
        fullscreenable
        show-info
        radius="8"
        alt="完整预览功能"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">仅缩放功能</p>
      <ldesign-image
        src="https://picsum.photos/400/300?random=71"
        width="200"
        height="150"
        fit="cover"
        preview
        zoomable
        :rotatable="false"
        :downloadable="false"
        :fullscreenable="false"
        radius="8"
        alt="仅缩放"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">亮色遮罩</p>
      <ldesign-image
        src="https://picsum.photos/400/300?random=72"
        width="200"
        height="150"
        fit="cover"
        preview
        preview-backdrop="light"
        radius="8"
        alt="亮色遮罩"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">显示图片信息</p>
      <ldesign-image
        src="https://picsum.photos/800/600?random=73"
        width="200"
        height="150"
        fit="cover"
        preview
        show-info
        radius="8"
        alt="显示信息"
      />
    </div>
  </div>
</div>

### 预览功能说明

#### 工具栏操作
- **缩放**：`-`/`+` 按钮或键盘快捷键，显示当前缩放百分比
- **旋转**：左转/右转 90°，支持键盘方向键
- **下载**：下载原图到本地
- **复制链接**：复制图片URL到剪贴板
- **全屏**：进入/退出全屏模式
- **关闭**：ESC键或点击关闭按钮

#### 鼠标操作
- **滚轮**：缩放图片
- **双击**：在 1x 和 2x 之间切换
- **拖拽**：移动图片位置

#### 键盘快捷键
- `ESC`：退出预览/全屏
- `+`/`-`：放大/缩小
- `0`：重置缩放和位置
- `←`/`→`：向左/向右旋转
- `F`：切换全屏

## 加载优化

### 加载进度显示

<div class="demo-block">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">带进度条的加载</p>
      <ldesign-image
        src="https://picsum.photos/1200/800?random=60&t=${Date.now()}"
        width="250"
        height="180"
        show-progress
        placeholder-color="#e6f7ff"
        alt="显示加载进度"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">自定义占位背景色</p>
      <ldesign-image
        src="https://picsum.photos/800/600?random=61&t=${Date.now()}"
        width="250"
        height="180"
        placeholder-color="#f6ffed"
        show-loading
        alt="自定义占位色"
      />
    </div>
  </div>
</div>

```html
<ldesign-image
  src="large-image.jpg"
  show-progress              <!-- 显示加载进度条 -->
  placeholder-color="#e6f7ff" <!-- 自定义占位背景色 -->
/>
```

### 错误处理与重试

<div class="demo-block">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">错误状态（带重试按钮）</p>
      <ldesign-image
        src="https://invalid-url-test.example.com/image.jpg"
        width="250"
        height="180"
        retryable
        max-retries="3"
        show-error
        alt="错误重试示例"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">带回退图的错误处理</p>
      <ldesign-image
        src="https://invalid-url-test2.example.com/image.jpg"
        width="250"
        height="180"
        fallback="https://picsum.photos/250/180?random=62"
        alt="回退图示例"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">自定义占位图</p>
      <ldesign-image
        src="https://picsum.photos/800/600?random=63&delay=3"
        width="250"
        height="180"
        placeholder="https://picsum.photos/50/38?random=63&blur=2"
        alt="自定义占位图"
      />
    </div>
  </div>
</div>

```html
<!-- 错误重试 -->
<ldesign-image
  src="unreliable-image.jpg"
  retryable            <!-- 显示重试按钮 -->
  max-retries="3"      <!-- 最大自动重试次数 -->
/>

<!-- 回退图片 -->
<ldesign-image
  src="unreliable-image.jpg"
  fallback="backup.jpg" <!-- 错误时显示回退图 -->
/>

<!-- 自定义占位图 -->
<ldesign-image
  src="image.jpg"
  placeholder="blur-thumbnail.jpg" <!-- 加载时显示占位图 -->
/>
```

### 禁用状态

<div class="demo-block">
  <div style="display: flex; gap: 20px;">
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">正常状态</p>
      <ldesign-image
        src="https://picsum.photos/200/200?random=120"
        width="150"
        height="150"
        preview
        fit="cover"
        alt="正常状态"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">禁用状态（不可预览）</p>
      <ldesign-image
        src="https://picsum.photos/200/200?random=121"
        width="150"
        height="150"
        preview
        disabled
        fit="cover"
        style="opacity: 0.6; cursor: not-allowed;"
        alt="禁用状态"
      />
    </div>
  </div>
</div>

## 无障碍支持

### 内置无障碍特性

<div class="demo-block">
  <ldesign-image
    src="https://picsum.photos/400/300?random=130"
    width="300"
    height="200"
    alt="这是一张风景照片，展示了美丽的山川和湖泊"
    img-title="点击查看大图"
    preview
    fit="cover"
  />
</div>

组件内置完整的无障碍支持：

- ✅ **语义化 alt 属性** - 为屏幕阅读器提供图片描述
- ✅ **ARIA 标签** - 所有交互元素都有适当的 aria-label
- ✅ **键盘导航** - 完全支持键盘操作
- ✅ **焦点管理** - 正确的焦点顺序和状态
- ✅ **高对比度** - 错误状态和提示信息清晰可读

```html
<ldesign-image
  src="image.jpg"
  alt="详细的图片描述，帮助视障用户理解图片内容"
  img-title="鼠标悬停时的额外提示信息"
/>
```

## API 参考

### 属性 (Props)

#### 基础属性
| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| src | 图片地址 | string | - |
| alt | 替代文本（无障碍） | string | - |
| img-title | 鼠标悬停提示文本 | string | - |
| width | 容器宽度（数字=px，字符串原样） | number/string | 100% |
| height | 容器高度（数字=px，字符串原样） | number/string | - |
| radius | 圆角半径（数字=px，字符串原样） | number/string | - |
| ratio | 宽高比（如 '16/9'、'4:3'、1.777） | string/number | - |
| shape | 形状 | 'square'/'rounded'/'circle' | 'square' |
| disabled | 是否禁用交互 | boolean | false |

#### 显示控制
| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| fit | 裁剪模式（object-fit） | 'fill'/'contain'/'cover'/'none'/'scale-down' | 'cover' |
| position | 对齐位置（object-position） | string | 'center center' |

#### 加载优化
| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| lazy | 是否懒加载 | boolean | true |
| intersection-root-margin | 懒加载预加载距离 | string | '200px' |
| show-progress | 显示加载进度条 | boolean | false |
| decoding | 解码模式 | 'auto'/'async'/'sync' | 'auto' |

#### 占位与错误
| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| placeholder | 自定义占位图URL | string | - |
| placeholder-color | 占位背景色 | string | '#f5f5f5' |
| show-loading | 显示加载动画 | boolean | true |
| fallback | 错误回退图URL | string | - |
| show-error | 显示错误提示 | boolean | true |
| retryable | 显示重试按钮 | boolean | true |
| max-retries | 最大自动重试次数 | number | 3 |

#### 预览功能
| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| preview | 开启点击预览 | boolean | false |
| preview-src | 预览高清图URL | string | - |
| preview-backdrop | 预览背景主题 | 'dark'/'light' | 'dark' |
| zoomable | 允许缩放 | boolean | true |
| rotatable | 显示旋转按钮 | boolean | true |
| downloadable | 显示下载按钮 | boolean | true |
| fullscreenable | 显示全屏按钮 | boolean | true |
| show-info | 显示图片信息 | boolean | false |
| img-draggable | 原图可拖拽 | boolean | false |

#### 响应式与跨域
| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| srcset | 响应式图片源 | string | - |
| sizes | 响应式尺寸 | string | - |
| sources | 多格式源（`<picture>`） | string/array | - |
| crossorigin | 跨域设置 | 'anonymous'/'use-credentials' | - |
| referrer-policy | 引荐策略 | string | - |

#### GIF 控制
| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| gif-play-on-click | GIF点击播放 | boolean | false |
| gif-preview-src | GIF静态预览图 | string | - |

## 高级功能

### 多格式支持（AVIF/WebP）

<div class="demo-block">
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">多格式源（浏览器自动选择）</p>
      <ldesign-image
        sources='[{"type":"image/webp","srcset":"https://picsum.photos/400/300.webp?random=110"},{"type":"image/jpeg","srcset":"https://picsum.photos/400/300?random=110"}]'
        src="https://picsum.photos/400/300?random=110"
        width="100%"
        ratio="4/3"
        fit="cover"
        alt="多格式图片"
      />
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">响应式 WebP</p>
      <ldesign-image
        sources='[{"type":"image/webp","srcset":"https://picsum.photos/400/300.webp?random=111 400w, https://picsum.photos/800/600.webp?random=111 800w"}]'
        src="https://picsum.photos/800/600?random=111"
        width="100%"
        ratio="4/3"
        fit="cover"
        alt="响应式 WebP"
      />
    </div>
  </div>
</div>

```html
<!-- 多格式源 -->
<ldesign-image
  sources='[
    {"type":"image/avif","srcset":"image.avif"},
    {"type":"image/webp","srcset":"image.webp"}
  ]'
  src="image.jpg"  <!-- 回退到 JPEG -->
/>
```

### GIF 控制

<div class="demo-block">
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">点击播放 GIF（默认静止）</p>
      <ldesign-image
        src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmxwOGdheGd4MzVpbGd4Y2l5ZnJmcWZ6ZWZwOGxrZ3h3ZHd2ZWZ5YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JIX9t2j0ZTN9S/giphy.gif"
        gif-play-on-click
        gif-preview-src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy_s.gif"
        width="200"
        height="200"
        shape="rounded"
        fit="cover"
        alt="点击播放 GIF"
      />
      <p style="font-size: 11px; color: #999; margin: 8px 0 0;">点击图片开始播放</p>
    </div>
    <div>
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">普通 GIF（自动播放）</p>
      <ldesign-image
        src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDZvaGVqOHViYjN2bmg1OGRqcnJpYm1oeGw2ZnRxNzk5YjB4aHBnZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2K5jinAlChoCLS/giphy.gif"
        width="200"
        height="200"
        shape="rounded"
        fit="cover"
        alt="自动播放 GIF"
      />
    </div>
  </div>
</div>

```html
<!-- 点击播放 GIF -->
<ldesign-image
  src="animation.gif"
  gif-play-on-click
  gif-preview-src="first-frame.jpg"  <!-- 静态预览图 -->
/>

<!-- 普通 GIF -->
<ldesign-image
  src="animation.gif"
/>
```

### 事件 (Events)

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignLoad | 图片加载成功 | `{ width: number; height: number; src: string; size?: number }` |
| ldesignError | 图片加载失败 | `{ src: string; error: string }` |
| ldesignPreviewOpen | 预览窗口打开 | - |
| ldesignPreviewClose | 预览窗口关闭 | - |
| ldesignDownload | 图片下载触发 | `{ src: string; filename: string }` |

## 实际场景示例

### 电商商品展示

<div class="demo-block">
  <div style="display: flex; gap: 20px;">
    <ldesign-image
      src="https://picsum.photos/400/400?random=140"
      preview-src="https://picsum.photos/1200/1200?random=140"
      width="400"
      height="400"
      fit="contain"
      preview
      downloadable
      rotatable
      show-info
      style="border: 1px solid #e8e8e8;"
      alt="商品主图"
    />
    <div style="display: grid; grid-template-columns: repeat(4, 80px); gap: 8px;">
      <ldesign-image src="https://picsum.photos/80/80?random=141" fit="cover" alt="缩略图1" />
      <ldesign-image src="https://picsum.photos/80/80?random=142" fit="cover" alt="缩略图2" />
      <ldesign-image src="https://picsum.photos/80/80?random=143" fit="cover" alt="缩略图3" />
      <ldesign-image src="https://picsum.photos/80/80?random=144" fit="cover" alt="缩略图4" />
    </div>
  </div>
</div>

```html
<!-- 商品主图 -->
<ldesign-image
  src="/product/thumbnail.jpg"
  preview-src="/product/large.jpg"
  width="400"
  height="400"
  fit="contain"
  preview
  downloadable
  rotatable
  show-info
  alt="商品图片"
/>
```

### 文章封面

<div class="demo-block">
  <ldesign-image
    src="https://picsum.photos/1200/675?random=150"
    width="100%"
    ratio="16/9"
    fit="cover"
    lazy
    show-loading
    placeholder-color="#f0f0f0"
    radius="8"
    alt="文章封面图"
  />
</div>

```html
<ldesign-image
  src="/article/hero.jpg"
  width="100%"
  ratio="16/9"
  fit="cover"
  lazy
  show-loading
  placeholder-color="#f0f0f0"
  alt="文章封面"
/>
```

### 用户头像列表

<div class="demo-block">
  <div style="display: flex; gap: 16px; align-items: center;">
    <ldesign-image
      src="https://picsum.photos/80/80?random=160"
      fallback="https://picsum.photos/80/80?random=169"
      width="80"
      height="80"
      shape="circle"
      fit="cover"
      alt="用户头像"
    />
    <div>
      <div style="font-weight: 600;">John Doe</div>
      <div style="color: #666; font-size: 14px;">john.doe@example.com</div>
    </div>
  </div>
</div>

```html
<ldesign-image
  src="/avatar/user.jpg"
  fallback="/avatar/default.jpg"
  width="80"
  height="80"
  shape="circle"
  fit="cover"
  alt="用户头像"
/>
```

### 相册展示

<div class="demo-block">
  <ldesign-image-group columns="3" gap="8" shape="rounded">
    <ldesign-image
      src="https://picsum.photos/300/300?random=170"
      preview-src="https://picsum.photos/1200/1200?random=170"
      ratio="1/1"
      preview
      downloadable
      show-info
      fit="cover"
      alt="相册图片1"
    />
    <ldesign-image
      src="https://picsum.photos/300/300?random=171"
      preview-src="https://picsum.photos/1200/1200?random=171"
      ratio="1/1"
      preview
      downloadable
      show-info
      fit="cover"
      alt="相册图片2"
    />
    <ldesign-image
      src="https://picsum.photos/300/300?random=172"
      preview-src="https://picsum.photos/1200/1200?random=172"
      ratio="1/1"
      preview
      downloadable
      show-info
      fit="cover"
      alt="相册图片3"
    />
    <ldesign-image
      src="https://picsum.photos/300/300?random=173"
      preview-src="https://picsum.photos/1200/1200?random=173"
      ratio="1/1"
      preview
      downloadable
      show-info
      fit="cover"
      alt="相册图片4"
    />
    <ldesign-image
      src="https://picsum.photos/300/300?random=174"
      preview-src="https://picsum.photos/1200/1200?random=174"
      ratio="1/1"
      preview
      downloadable
      show-info
      fit="cover"
      alt="相册图片5"
    />
    <ldesign-image
      src="https://picsum.photos/300/300?random=175"
      preview-src="https://picsum.photos/1200/1200?random=175"
      ratio="1/1"
      preview
      downloadable
      show-info
      fit="cover"
      alt="相册图片6"
    />
  </ldesign-image-group>
</div>

```html
<ldesign-image-group columns="3" gap="8" shape="rounded">
  <ldesign-image
    v-for="img in images"
    :key="img.id"
    :src="img.thumb"
    :preview-src="img.original"
    ratio="1/1"
    preview
    downloadable
    show-info
  />
</ldesign-image-group>
```

## 性能优化建议

1. **使用懒加载**：对于非首屏图片，始终启用 `lazy` 属性
2. **设置 ratio**：避免布局抖动，提升用户体验
3. **使用 WebP/AVIF**：通过 `sources` 提供现代格式
4. **合理的缩略图**：列表使用小图，预览使用大图
5. **CDN 加速**：使用 CDN 并配置合适的缓存策略

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

部分高级功能（如 AVIF）需要更新的浏览器版本。
