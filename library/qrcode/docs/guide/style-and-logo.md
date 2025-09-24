# 样式与 Logo

## 渐变与点样式

```vue
<template>
  <QRCode
    text="Style & Logo"
    :width="220"
    :style="{
      foregroundColor: { type: 'linear', direction: 45, colors: [
        { offset: 0, color: '#ff7a45' },
        { offset: 1, color: '#36cfc9' }
      ] },
      backgroundColor: '#fff',
      dotStyle: 'rounded'
    }"
  />
</template>
```

## 中心 Logo

```vue
<template>
  <QRCode
    text="With Logo"
    :width="220"
    :logo="{ src: '/logo.png', size: 44, shape: 'circle', backgroundColor: '#fff', borderWidth: 2, borderColor: '#000' }"
  />
</template>
```
