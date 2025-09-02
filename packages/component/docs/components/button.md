# Button 按钮

按钮用于触发一个操作，如提交表单、打开对话框、取消操作等。

## 基础用法

最简单的按钮用法。

<div class="demo-container">
  <div class="demo-title">基础按钮</div>
  <div class="demo-description">按钮有五种基础类型：主按钮、默认按钮、虚线按钮、文本按钮和链接按钮。</div>
  <div class="demo-showcase">
    <ld-button type="primary">主要按钮</ld-button>
    <ld-button type="default">默认按钮</ld-button>
    <ld-button type="dashed">虚线按钮</ld-button>
    <ld-button type="text">文本按钮</ld-button>
    <ld-button type="link">链接按钮</ld-button>
  </div>
  <div class="demo-code">

```html
<ld-button type="primary">主要按钮</ld-button>
<ld-button type="default">默认按钮</ld-button>
<ld-button type="dashed">虚线按钮</ld-button>
<ld-button type="text">文本按钮</ld-button>
<ld-button type="link">链接按钮</ld-button>
```

  </div>
</div>

## 按钮尺寸

按钮有大、中、小三种尺寸。

<div class="demo-container">
  <div class="demo-title">不同尺寸</div>
  <div class="demo-description">通过设置 size 属性来控制按钮大小。</div>
  <div class="demo-showcase">
    <ld-button type="primary" size="large">大按钮</ld-button>
    <ld-button type="primary" size="medium">中按钮</ld-button>
    <ld-button type="primary" size="small">小按钮</ld-button>
  </div>
  <div class="demo-code">

```html
<ld-button type="primary" size="large">大按钮</ld-button>
<ld-button type="primary" size="medium">中按钮</ld-button>
<ld-button type="primary" size="small">小按钮</ld-button>
```

  </div>
</div>

## 按钮状态

### 禁用状态

添加 `disabled` 属性即可让按钮处于不可用状态。

<div class="demo-container">
  <div class="demo-title">禁用状态</div>
  <div class="demo-description">按钮不可点击。</div>
  <div class="demo-showcase">
    <ld-button type="primary" disabled>禁用按钮</ld-button>
    <ld-button type="default" disabled>禁用按钮</ld-button>
    <ld-button type="dashed" disabled>禁用按钮</ld-button>
    <ld-button type="text" disabled>禁用按钮</ld-button>
    <ld-button type="link" disabled>禁用按钮</ld-button>
  </div>
  <div class="demo-code">

```html
<ld-button type="primary" disabled>禁用按钮</ld-button>
<ld-button type="default" disabled>禁用按钮</ld-button>
<ld-button type="dashed" disabled>禁用按钮</ld-button>
<ld-button type="text" disabled>禁用按钮</ld-button>
<ld-button type="link" disabled>禁用按钮</ld-button>
```

  </div>
</div>

### 加载状态

添加 `loading` 属性即可让按钮处于加载状态。

<div class="demo-container">
  <div class="demo-title">加载状态</div>
  <div class="demo-description">按钮处于加载中状态。</div>
  <div class="demo-showcase">
    <ld-button type="primary" loading>加载中</ld-button>
    <ld-button type="default" loading>加载中</ld-button>
  </div>
  <div class="demo-code">

```html
<ld-button type="primary" loading>加载中</ld-button>
<ld-button type="default" loading>加载中</ld-button>
```

  </div>
</div>

## 危险按钮

`danger` 属性可以让按钮显示为危险状态。

<div class="demo-container">
  <div class="demo-title">危险按钮</div>
  <div class="demo-description">用于危险操作，如删除等。</div>
  <div class="demo-showcase">
    <ld-button type="primary" danger>危险主按钮</ld-button>
    <ld-button type="default" danger>危险按钮</ld-button>
    <ld-button type="dashed" danger>危险虚线按钮</ld-button>
    <ld-button type="text" danger>危险文本按钮</ld-button>
    <ld-button type="link" danger>危险链接按钮</ld-button>
  </div>
  <div class="demo-code">

```html
<ld-button type="primary" danger>危险主按钮</ld-button>
<ld-button type="default" danger>危险按钮</ld-button>
<ld-button type="dashed" danger>危险虚线按钮</ld-button>
<ld-button type="text" danger>危险文本按钮</ld-button>
<ld-button type="link" danger>危险链接按钮</ld-button>
```

  </div>
</div>

## 块级按钮

`block` 属性将使按钮适合其父宽度。

<div class="demo-container">
  <div class="demo-title">块级按钮</div>
  <div class="demo-description">按钮宽度充满父容器。</div>
  <div class="demo-showcase vertical">
    <ld-button type="primary" block>块级主按钮</ld-button>
    <ld-button type="default" block>块级默认按钮</ld-button>
  </div>
  <div class="demo-code">

```html
<ld-button type="primary" block>块级主按钮</ld-button>
<ld-button type="default" block>块级默认按钮</ld-button>
```

  </div>
</div>

## 图标按钮

可以在按钮中添加图标。

<div class="demo-container">
  <div class="demo-title">图标按钮</div>
  <div class="demo-description">带图标的按钮可以更直观地表达按钮功能。</div>
  <div class="demo-showcase">
    <ld-button type="primary" icon="search">搜索</ld-button>
    <ld-button type="default" icon="download">下载</ld-button>
    <ld-button type="primary" icon="plus" icon-only></ld-button>
    <ld-button type="default" icon="setting" icon-only></ld-button>
  </div>
  <div class="demo-code">

```html
<ld-button type="primary" icon="search">搜索</ld-button>
<ld-button type="default" icon="download">下载</ld-button>
<ld-button type="primary" icon="plus" icon-only></ld-button>
<ld-button type="default" icon="setting" icon-only></ld-button>
```

  </div>
</div>

## API

### 属性

<table class="props-table">
  <thead>
    <tr>
      <th>属性</th>
      <th>说明</th>
      <th>类型</th>
      <th>默认值</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>type</code></td>
      <td>按钮类型</td>
      <td><code>'default' | 'primary' | 'dashed' | 'text' | 'link'</code></td>
      <td><code>'default'</code></td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td>按钮尺寸</td>
      <td><code>'small' | 'medium' | 'large'</code></td>
      <td><code>'medium'</code></td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td>是否禁用</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>loading</code></td>
      <td>是否加载中</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>danger</code></td>
      <td>是否危险按钮</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>block</code></td>
      <td>是否块级按钮</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>icon</code></td>
      <td>图标名称</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>icon-only</code></td>
      <td>是否只显示图标</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>href</code></td>
      <td>链接地址（当 type 为 link 时）</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>target</code></td>
      <td>链接打开方式</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>html-type</code></td>
      <td>原生 button 的 type</td>
      <td><code>'button' | 'submit' | 'reset'</code></td>
      <td><code>'button'</code></td>
    </tr>
  </tbody>
</table>

### 事件

<table class="props-table">
  <thead>
    <tr>
      <th>事件名</th>
      <th>说明</th>
      <th>回调参数</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>ldClick</code></td>
      <td>点击按钮时触发</td>
      <td><code>(event: MouseEvent) => void</code></td>
    </tr>
    <tr>
      <td><code>ldFocus</code></td>
      <td>获得焦点时触发</td>
      <td><code>(event: FocusEvent) => void</code></td>
    </tr>
    <tr>
      <td><code>ldBlur</code></td>
      <td>失去焦点时触发</td>
      <td><code>(event: FocusEvent) => void</code></td>
    </tr>
  </tbody>
</table>

### 方法

<table class="props-table">
  <thead>
    <tr>
      <th>方法名</th>
      <th>说明</th>
      <th>参数</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>focus</code></td>
      <td>使按钮获得焦点</td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>blur</code></td>
      <td>使按钮失去焦点</td>
      <td>-</td>
    </tr>
  </tbody>
</table>

### 插槽

<table class="props-table">
  <thead>
    <tr>
      <th>插槽名</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>default</td>
      <td>按钮内容</td>
    </tr>
    <tr>
      <td>icon</td>
      <td>自定义图标</td>
    </tr>
  </tbody>
</table>
