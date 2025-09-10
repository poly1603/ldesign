# Button 按钮

按钮用于开始一个即时操作。

## 基础用法

基础的按钮用法。

::: demo
```vue
<template>
  <div class="demo-button">
    <l-button>默认按钮</l-button>
    <l-button type="primary">主要按钮</l-button>
    <l-button type="success">成功按钮</l-button>
    <l-button type="warning">警告按钮</l-button>
    <l-button type="error">错误按钮</l-button>
  </div>
</template>

<style scoped>
.demo-button {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
```
:::

## 按钮变体

按钮有四种变体：基础、轮廓、文本和幽灵。

::: demo
```vue
<template>
  <div class="demo-section">
    <div class="demo-row">
      <h4>基础变体</h4>
      <div class="demo-button">
        <l-button type="primary">主要按钮</l-button>
        <l-button type="success">成功按钮</l-button>
        <l-button type="warning">警告按钮</l-button>
        <l-button type="error">错误按钮</l-button>
      </div>
    </div>

    <div class="demo-row">
      <h4>轮廓变体</h4>
      <div class="demo-button">
        <l-button type="primary" variant="outline">主要按钮</l-button>
        <l-button type="success" variant="outline">成功按钮</l-button>
        <l-button type="warning" variant="outline">警告按钮</l-button>
        <l-button type="error" variant="outline">错误按钮</l-button>
      </div>
    </div>

    <div class="demo-row">
      <h4>文本变体</h4>
      <div class="demo-button">
        <l-button type="primary" variant="text">主要按钮</l-button>
        <l-button type="success" variant="text">成功按钮</l-button>
        <l-button type="warning" variant="text">警告按钮</l-button>
        <l-button type="error" variant="text">错误按钮</l-button>
      </div>
    </div>

    <div class="demo-row">
      <h4>幽灵变体</h4>
      <div class="demo-button" style="background: #333; padding: 20px; border-radius: 6px;">
        <l-button ghost>默认按钮</l-button>
        <l-button type="primary" ghost>主要按钮</l-button>
        <l-button type="success" ghost>成功按钮</l-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-row h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
}

.demo-button {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
```
:::
```vue
<template>
  <div class="demo-button">
    <l-button size="small" type="primary">小按钮</l-button>
    <l-button size="medium" type="primary">中按钮</l-button>
    <l-button size="large" type="primary">大按钮</l-button>
  </div>
</template>

<style scoped>
.demo-button {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
```
:::

## 按钮形状

按钮有三种形状：矩形、圆角和圆形。

::: demo
```vue
<template>
  <div class="demo-button">
    <l-button type="primary">矩形按钮</l-button>
    <l-button type="primary" shape="round">圆角按钮</l-button>
    <l-button type="primary" shape="circle" icon="🔍"></l-button>
  </div>
</template>

<style scoped>
.demo-button {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
```
:::

## 禁用状态

按钮不可用状态。

::: demo
```vue
<template>
  <div class="demo-section">
    <div class="demo-row">
      <h4>基础变体</h4>
      <div class="demo-button">
        <l-button disabled>默认按钮</l-button>
        <l-button type="primary" disabled>主要按钮</l-button>
        <l-button type="success" disabled>成功按钮</l-button>
      </div>
    </div>

    <div class="demo-row">
      <h4>轮廓变体</h4>
      <div class="demo-button">
        <l-button variant="outline" disabled>默认按钮</l-button>
        <l-button type="primary" variant="outline" disabled>主要按钮</l-button>
        <l-button type="success" variant="outline" disabled>成功按钮</l-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-row h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
}

.demo-button {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
```
:::

## 加载状态

点击按钮后进行数据加载操作，在按钮上显示加载状态。



