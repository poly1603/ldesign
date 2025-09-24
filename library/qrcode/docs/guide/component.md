# 组件用法

最简单示例：

```vue
<template>
  <QRCode text="https://ldesign.dev/qrcode" :width="200" format="canvas" />
</template>
```

带下载按钮与 Logo：

```vue
<template>
  <QRCode
    text="组件二维码"
    :width="220"
    format="svg"
    :showDownloadButton="true"
    downloadFilename="component-qrcode"
    :logo="{ src: '/logo.png', size: 44, shape: 'circle' }"
  />
</template>
```

在 VitePress 中直接使用（本站即为示例）：

```md
<LQRCode :width="200" text="Render in VitePress" />
```
