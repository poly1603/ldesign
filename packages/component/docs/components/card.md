# Card 卡片

通用卡片容器。

## 基础用法

包含标题、内容和操作。

<Demo 
  title="基础卡片" 
  description="包含标题、内容和操作的标准卡片。"
  :code='`<ld-card card-title="卡片标题">
  <p>这是卡片的内容区域，可以放置任何内容。</p>
</ld-card>`'
>
  <ld-card card-title="卡片标题">
    <p>这是卡片的内容区域，可以放置任何内容。</p>
  </ld-card>
</Demo>

## 带底部操作

卡片可以包含底部操作区域。

<Demo 
  title="带底部操作" 
  description="在卡片底部添加操作按钮。"
  :code='`<ld-card card-title="卡片标题">
  <p>这是卡片的内容区域。</p>
  <div slot="footer">
    <ld-button type="primary" size="small">确定</ld-button>
    <ld-button size="small">取消</ld-button>
  </div>
</ld-card>`'
>
  <ld-card card-title="卡片标题">
    <p>这是卡片的内容区域。</p>
    <div slot="footer">
      <ld-button type="primary" size="small">确定</ld-button>
      <ld-button size="small">取消</ld-button>
    </div>
  </ld-card>
</Demo>

## 卡片尺寸

卡片有三种尺寸。

<Demo 
  title="不同尺寸" 
  description="通过设置 size 属性来控制卡片大小。"
  :code='`<ld-card card-title="大卡片" size="large">
  <p>大尺寸卡片内容</p>
</ld-card>
<ld-card card-title="中卡片" size="medium">
  <p>中尺寸卡片内容</p>
</ld-card>
<ld-card card-title="小卡片" size="small">
  <p>小尺寸卡片内容</p>
</ld-card>`'
  vertical
>
  <ld-card card-title="大卡片" size="large">
    <p>大尺寸卡片内容</p>
  </ld-card>
  <ld-card card-title="中卡片" size="medium">
    <p>中尺寸卡片内容</p>
  </ld-card>
  <ld-card card-title="小卡片" size="small">
    <p>小尺寸卡片内容</p>
  </ld-card>
</Demo>

## 阴影和边框

可以设置不同的阴影和边框效果。

<Demo 
  title="阴影和边框" 
  description="控制卡片的阴影和边框显示。"
  :code='`<ld-card card-title="始终阴影" shadow="always">
  <p>始终显示阴影</p>
</ld-card>
<ld-card card-title="悬停阴影" shadow="hover">
  <p>悬停时显示阴影</p>
</ld-card>
<ld-card card-title="无阴影" shadow="never">
  <p>不显示阴影</p>
</ld-card>`'
>
  <ld-card card-title="始终阴影" shadow="always">
    <p>始终显示阴影</p>
  </ld-card>
  <ld-card card-title="悬停阴影" shadow="hover">
    <p>悬停时显示阴影</p>
  </ld-card>
  <ld-card card-title="无阴影" shadow="never">
    <p>不显示阴影</p>
  </ld-card>
</Demo>

## 交互式卡片

可以设置卡片为可点击或可悬停状态。

<Demo 
  title="交互式卡片" 
  description="卡片可以支持点击和悬停交互。"
  :code='`<ld-card card-title="可悬停卡片" hoverable>
  <p>悬停时有阴影效果</p>
</ld-card>
<ld-card card-title="可点击卡片" clickable>
  <p>点击可以触发事件</p>
</ld-card>`'
>
  <ld-card card-title="可悬停卡片" hoverable>
    <p>悬停时有阴影效果</p>
  </ld-card>
  <ld-card card-title="可点击卡片" clickable @ldClick="handleCardClick">
    <p>点击可以触发事件</p>
  </ld-card>
</Demo>


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
      <td><code>description</code></td>
      <td>卡片描述</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td>卡片尺寸</td>
      <td><code>'small' | 'medium' | 'large'</code></td>
      <td><code>'medium'</code></td>
    </tr>
    <tr>
      <td><code>shadow</code></td>
      <td>阴影显示时机</td>
      <td><code>'always' | 'hover' | 'never'</code></td>
      <td><code>'always'</code></td>
    </tr>
    <tr>
      <td><code>border</code></td>
      <td>边框样式</td>
      <td><code>'solid' | 'dashed' | 'none'</code></td>
      <td><code>'solid'</code></td>
    </tr>
    <tr>
      <td><code>hoverable</code></td>
      <td>是否可悬停</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>clickable</code></td>
      <td>是否可点击</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>loading</code></td>
      <td>是否加载中</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
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
      <td>点击卡片时触发</td>
      <td><code>(event: MouseEvent) => void</code></td>
    </tr>
    <tr>
      <td><code>ldMouseEnter</code></td>
      <td>鼠标进入时触发</td>
      <td><code>(event: MouseEvent) => void</code></td>
    </tr>
    <tr>
      <td><code>ldMouseLeave</code></td>
      <td>鼠标离开时触发</td>
      <td><code>(event: MouseEvent) => void</code></td>
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
      <td>footer</td>
      <td>卡片底部内容</td>
    </tr>
    <tr>
      <td>header-extra</td>
      <td>卡片头部额外内容</td>
    </tr>
  </tbody>
</table>

<script setup>
const handleCardClick = (event) => {
  console.log('卡片被点击:', event)
  alert('卡片被点击！')
}
</script>

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
