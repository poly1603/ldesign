# Card 卡片

通用卡片容器。

## 基础用法

包含标题、内容和操作区域。

<div class="demo-container">
  <div class="demo-title">基础卡片</div>
  <div class="demo-description">最简单的卡片用法。</div>
  <div class="demo-showcase">
    <ld-card card-title="卡片标题" style="width: 300px;">
      <p>卡片内容</p>
      <p>卡片内容</p>
      <p>卡片内容</p>
    </ld-card>
  </div>
  <div class="demo-code">

```html
<ld-card card-title="卡片标题">
  <p>卡片内容</p>
  <p>卡片内容</p>
  <p>卡片内容</p>
</ld-card>
```

  </div>
</div>

## 简洁卡片

卡片可以只有内容区域。

<div class="demo-container">
  <div class="demo-title">简洁卡片</div>
  <div class="demo-description">没有标题的简洁卡片。</div>
  <div class="demo-showcase">
    <ld-card style="width: 300px;">
      <p>卡片内容</p>
      <p>卡片内容</p>
      <p>卡片内容</p>
    </ld-card>
  </div>
  <div class="demo-code">

```html
<ld-card>
  <p>卡片内容</p>
  <p>卡片内容</p>
  <p>卡片内容</p>
</ld-card>
```

  </div>
</div>

## 带操作区域

可以在卡片右上角自定义操作区域。

<div class="demo-container">
  <div class="demo-title">带操作区域</div>
  <div class="demo-description">在卡片头部添加操作按钮。</div>
  <div class="demo-showcase">
    <ld-card card-title="卡片标题" style="width: 300px;">
      <div slot="header-extra">
        <ld-button type="text" size="small">更多</ld-button>
      </div>
      <p>卡片内容</p>
      <p>卡片内容</p>
      <p>卡片内容</p>
    </ld-card>
  </div>
  <div class="demo-code">

```html
<ld-card card-title="卡片标题">
  <div slot="header-extra">
    <ld-button type="text" size="small">更多</ld-button>
  </div>
  <p>卡片内容</p>
  <p>卡片内容</p>
  <p>卡片内容</p>
</ld-card>
```

  </div>
</div>

## 带页脚

可以在卡片底部添加页脚内容。

<div class="demo-container">
  <div class="demo-title">带页脚</div>
  <div class="demo-description">在卡片底部添加操作按钮或其他内容。</div>
  <div class="demo-showcase">
    <ld-card card-title="卡片标题" style="width: 300px;">
      <p>卡片内容</p>
      <p>卡片内容</p>
      <p>卡片内容</p>
      <div slot="footer">
        <ld-button type="primary" size="small">确定</ld-button>
        <ld-button size="small">取消</ld-button>
      </div>
    </ld-card>
  </div>
  <div class="demo-code">

```html
<ld-card card-title="卡片标题">
  <p>卡片内容</p>
  <p>卡片内容</p>
  <p>卡片内容</p>
  <div slot="footer">
    <ld-button type="primary" size="small">确定</ld-button>
    <ld-button size="small">取消</ld-button>
  </div>
</ld-card>
```

  </div>
</div>

## 带图标的标题

可以在标题前添加图标。

<div class="demo-container">
  <div class="demo-title">带图标的标题</div>
  <div class="demo-description">在卡片标题前添加图标。</div>
  <div class="demo-showcase">
    <ld-card card-title="卡片标题" header-icon="setting" style="width: 300px;">
      <p>卡片内容</p>
      <p>卡片内容</p>
      <p>卡片内容</p>
    </ld-card>
  </div>
  <div class="demo-code">

```html
<ld-card card-title="卡片标题" header-icon="setting">
  <p>卡片内容</p>
  <p>卡片内容</p>
  <p>卡片内容</p>
</ld-card>
```

  </div>
</div>

## 带副标题

可以在标题下方添加副标题。

<div class="demo-container">
  <div class="demo-title">带副标题</div>
  <div class="demo-description">在主标题下方添加副标题说明。</div>
  <div class="demo-showcase">
    <ld-card card-title="卡片标题" subtitle="这是副标题" style="width: 300px;">
      <p>卡片内容</p>
      <p>卡片内容</p>
      <p>卡片内容</p>
    </ld-card>
  </div>
  <div class="demo-code">

```html
<ld-card card-title="卡片标题" subtitle="这是副标题">
  <p>卡片内容</p>
  <p>卡片内容</p>
  <p>卡片内容</p>
</ld-card>
```

  </div>
</div>

## 阴影效果

可以设置卡片的阴影效果。

<div class="demo-container">
  <div class="demo-title">阴影效果</div>
  <div class="demo-description">控制卡片的阴影显示时机。</div>
  <div class="demo-showcase vertical">
    <ld-card card-title="总是显示阴影" shadow="always" style="width: 300px; margin-bottom: 16px;">
      <p>卡片内容</p>
    </ld-card>
    <ld-card card-title="悬停时显示阴影" shadow="hover" style="width: 300px; margin-bottom: 16px;">
      <p>卡片内容</p>
    </ld-card>
    <ld-card card-title="从不显示阴影" shadow="never" style="width: 300px;">
      <p>卡片内容</p>
    </ld-card>
  </div>
  <div class="demo-code">

```html
<ld-card card-title="总是显示阴影" shadow="always">
  <p>卡片内容</p>
</ld-card>
<ld-card card-title="悬停时显示阴影" shadow="hover">
  <p>卡片内容</p>
</ld-card>
<ld-card card-title="从不显示阴影" shadow="never">
  <p>卡片内容</p>
</ld-card>
```

  </div>
</div>

## 边框

可以控制卡片是否显示边框。

<div class="demo-container">
  <div class="demo-title">边框</div>
  <div class="demo-description">控制卡片边框的显示。</div>
  <div class="demo-showcase vertical">
    <ld-card card-title="有边框" bordered style="width: 300px; margin-bottom: 16px;">
      <p>卡片内容</p>
    </ld-card>
    <ld-card card-title="无边框" bordered="false" style="width: 300px;">
      <p>卡片内容</p>
    </ld-card>
  </div>
  <div class="demo-code">

```html
<ld-card card-title="有边框" bordered>
  <p>卡片内容</p>
</ld-card>
<ld-card card-title="无边框" bordered="false">
  <p>卡片内容</p>
</ld-card>
```

  </div>
</div>

## 可悬停

设置卡片可悬停。

<div class="demo-container">
  <div class="demo-title">可悬停</div>
  <div class="demo-description">鼠标悬停时卡片会有交互效果。</div>
  <div class="demo-showcase">
    <ld-card card-title="可悬停卡片" hoverable style="width: 300px;">
      <p>鼠标悬停试试</p>
      <p>卡片内容</p>
      <p>卡片内容</p>
    </ld-card>
  </div>
  <div class="demo-code">

```html
<ld-card card-title="可悬停卡片" hoverable>
  <p>鼠标悬停试试</p>
  <p>卡片内容</p>
  <p>卡片内容</p>
</ld-card>
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
      <td><code>card-title</code></td>
      <td>卡片标题</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>subtitle</code></td>
      <td>卡片副标题</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>header-icon</code></td>
      <td>标题图标</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>shadow</code></td>
      <td>阴影显示时机</td>
      <td><code>'always' | 'hover' | 'never'</code></td>
      <td><code>'always'</code></td>
    </tr>
    <tr>
      <td><code>bordered</code></td>
      <td>是否显示边框</td>
      <td><code>boolean</code></td>
      <td><code>true</code></td>
    </tr>
    <tr>
      <td><code>hoverable</code></td>
      <td>是否可悬停</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
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
      <td>卡片内容</td>
    </tr>
    <tr>
      <td>header</td>
      <td>自定义标题区域</td>
    </tr>
    <tr>
      <td>header-extra</td>
      <td>标题右侧的操作区域</td>
    </tr>
    <tr>
      <td>footer</td>
      <td>卡片底部内容</td>
    </tr>
  </tbody>
</table>
