# Tooltip 提示框

简单的文字提示气泡框。

## 基础用法

最简单的用法。

<div class="demo-container">
  <div class="demo-title">基础提示框</div>
  <div class="demo-description">鼠标移入则显示提示，移出消失，气泡浮层不承载复杂文本和操作。</div>
  <div class="demo-showcase">
    <ld-tooltip content="这是一个提示">
      <ld-button>悬停显示提示</ld-button>
    </ld-tooltip>
  </div>
  <div class="demo-code">

```html
<ld-tooltip content="这是一个提示">
  <ld-button>悬停显示提示</ld-button>
</ld-tooltip>
```

  </div>
</div>

## 位置

提示框支持 12 个不同的方位。

<div class="demo-container">
  <div class="demo-title">位置</div>
  <div class="demo-description">由 placement 属性决定展示效果。</div>
  <div class="demo-showcase">
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 400px;">
      <!-- 上方 -->
      <ld-tooltip content="Top Left 提示文字" placement="top-start">
        <ld-button>TL</ld-button>
      </ld-tooltip>
      <ld-tooltip content="Top Center 提示文字" placement="top">
        <ld-button>Top</ld-button>
      </ld-tooltip>
      <ld-tooltip content="Top Right 提示文字" placement="top-end">
        <ld-button>TR</ld-button>
      </ld-tooltip>
      
      <!-- 左方 -->
      <ld-tooltip content="Left Top 提示文字" placement="left-start">
        <ld-button>LT</ld-button>
      </ld-tooltip>
      <div></div>
      <ld-tooltip content="Right Top 提示文字" placement="right-start">
        <ld-button>RT</ld-button>
      </ld-tooltip>
      
      <ld-tooltip content="Left Center 提示文字" placement="left">
        <ld-button>Left</ld-button>
      </ld-tooltip>
      <div></div>
      <ld-tooltip content="Right Center 提示文字" placement="right">
        <ld-button>Right</ld-button>
      </ld-tooltip>
      
      <ld-tooltip content="Left Bottom 提示文字" placement="left-end">
        <ld-button>LB</ld-button>
      </ld-tooltip>
      <div></div>
      <ld-tooltip content="Right Bottom 提示文字" placement="right-end">
        <ld-button>RB</ld-button>
      </ld-tooltip>
      
      <!-- 下方 -->
      <ld-tooltip content="Bottom Left 提示文字" placement="bottom-start">
        <ld-button>BL</ld-button>
      </ld-tooltip>
      <ld-tooltip content="Bottom Center 提示文字" placement="bottom">
        <ld-button>Bottom</ld-button>
      </ld-tooltip>
      <ld-tooltip content="Bottom Right 提示文字" placement="bottom-end">
        <ld-button>BR</ld-button>
      </ld-tooltip>
    </div>
  </div>
  <div class="demo-code">

```html
<ld-tooltip content="Top Left 提示文字" placement="top-start">
  <ld-button>TL</ld-button>
</ld-tooltip>
<ld-tooltip content="Top Center 提示文字" placement="top">
  <ld-button>Top</ld-button>
</ld-tooltip>
<ld-tooltip content="Top Right 提示文字" placement="top-end">
  <ld-button>TR</ld-button>
</ld-tooltip>

<ld-tooltip content="Left Center 提示文字" placement="left">
  <ld-button>Left</ld-button>
</ld-tooltip>
<ld-tooltip content="Right Center 提示文字" placement="right">
  <ld-button>Right</ld-button>
</ld-tooltip>

<ld-tooltip content="Bottom Center 提示文字" placement="bottom">
  <ld-button>Bottom</ld-button>
</ld-tooltip>
```

  </div>
</div>

## 触发方式

提示框支持多种触发方式。

<div class="demo-container">
  <div class="demo-title">触发方式</div>
  <div class="demo-description">通过 trigger 属性设置触发方式。</div>
  <div class="demo-showcase">
    <ld-tooltip content="悬停触发" trigger="hover">
      <ld-button>悬停触发</ld-button>
    </ld-tooltip>
    
    <ld-tooltip content="点击触发" trigger="click">
      <ld-button>点击触发</ld-button>
    </ld-tooltip>
    
    <ld-tooltip content="聚焦触发" trigger="focus">
      <ld-button>聚焦触发</ld-button>
    </ld-tooltip>
    
    <ld-tooltip content="手动触发" trigger="manual" id="manual-tooltip">
      <ld-button onclick="toggleManualTooltip()">手动触发</ld-button>
    </ld-tooltip>
    
    <script>
      function toggleManualTooltip() {
        const tooltip = document.getElementById('manual-tooltip');
        tooltip.visible = !tooltip.visible;
      }
    </script>
  </div>
  <div class="demo-code">

```html
<ld-tooltip content="悬停触发" trigger="hover">
  <ld-button>悬停触发</ld-button>
</ld-tooltip>

<ld-tooltip content="点击触发" trigger="click">
  <ld-button>点击触发</ld-button>
</ld-tooltip>

<ld-tooltip content="聚焦触发" trigger="focus">
  <ld-button>聚焦触发</ld-button>
</ld-tooltip>

<ld-tooltip content="手动触发" trigger="manual" id="manual-tooltip">
  <ld-button onclick="toggleManualTooltip()">手动触发</ld-button>
</ld-tooltip>

<script>
  function toggleManualTooltip() {
    const tooltip = document.getElementById('manual-tooltip');
    tooltip.visible = !tooltip.visible;
  }
</script>
```

  </div>
</div>

## 延迟显示

可以设置提示框的显示和隐藏延迟。

<div class="demo-container">
  <div class="demo-title">延迟显示</div>
  <div class="demo-description">通过 show-delay 和 hide-delay 属性设置延迟时间。</div>
  <div class="demo-showcase">
    <ld-tooltip content="延迟1秒显示" show-delay="1000">
      <ld-button>延迟显示</ld-button>
    </ld-tooltip>
    
    <ld-tooltip content="延迟1秒隐藏" hide-delay="1000">
      <ld-button>延迟隐藏</ld-button>
    </ld-tooltip>
    
    <ld-tooltip content="延迟显示和隐藏" show-delay="500" hide-delay="500">
      <ld-button>延迟显示隐藏</ld-button>
    </ld-tooltip>
  </div>
  <div class="demo-code">

```html
<ld-tooltip content="延迟1秒显示" show-delay="1000">
  <ld-button>延迟显示</ld-button>
</ld-tooltip>

<ld-tooltip content="延迟1秒隐藏" hide-delay="1000">
  <ld-button>延迟隐藏</ld-button>
</ld-tooltip>

<ld-tooltip content="延迟显示和隐藏" show-delay="500" hide-delay="500">
  <ld-button>延迟显示隐藏</ld-button>
</ld-tooltip>
```

  </div>
</div>

## 禁用状态

可以禁用提示框。

<div class="demo-container">
  <div class="demo-title">禁用状态</div>
  <div class="demo-description">通过 disabled 属性禁用提示框。</div>
  <div class="demo-showcase">
    <ld-tooltip content="正常提示框">
      <ld-button>正常提示框</ld-button>
    </ld-tooltip>
    
    <ld-tooltip content="禁用的提示框" disabled>
      <ld-button>禁用的提示框</ld-button>
    </ld-tooltip>
  </div>
  <div class="demo-code">

```html
<ld-tooltip content="正常提示框">
  <ld-button>正常提示框</ld-button>
</ld-tooltip>

<ld-tooltip content="禁用的提示框" disabled>
  <ld-button>禁用的提示框</ld-button>
</ld-tooltip>
```

  </div>
</div>

## 箭头指向

可以设置箭头是否指向元素中心。

<div class="demo-container">
  <div class="demo-title">箭头指向</div>
  <div class="demo-description">通过 arrow-point-at-center 属性设置箭头指向。</div>
  <div class="demo-showcase">
    <ld-tooltip content="箭头指向边缘" placement="top">
      <ld-button>箭头指向边缘</ld-button>
    </ld-tooltip>
    
    <ld-tooltip content="箭头指向中心" placement="top" arrow-point-at-center>
      <ld-button>箭头指向中心</ld-button>
    </ld-tooltip>
  </div>
  <div class="demo-code">

```html
<ld-tooltip content="箭头指向边缘" placement="top">
  <ld-button>箭头指向边缘</ld-button>
</ld-tooltip>

<ld-tooltip content="箭头指向中心" placement="top" arrow-point-at-center>
  <ld-button>箭头指向中心</ld-button>
</ld-tooltip>
```

  </div>
</div>

## 自定义内容

可以通过插槽自定义提示框内容。

<div class="demo-container">
  <div class="demo-title">自定义内容</div>
  <div class="demo-description">使用插槽自定义提示框的内容。</div>
  <div class="demo-showcase">
    <ld-tooltip>
      <ld-button>自定义内容</ld-button>
      <div slot="content">
        <div style="padding: 8px;">
          <h4 style="margin: 0 0 8px 0; color: #1976d2;">自定义标题</h4>
          <p style="margin: 0; color: #666;">这是自定义的提示框内容，可以包含任何 HTML 元素。</p>
        </div>
      </div>
    </ld-tooltip>
  </div>
  <div class="demo-code">

```html
<ld-tooltip>
  <ld-button>自定义内容</ld-button>
  <div slot="content">
    <div style="padding: 8px;">
      <h4 style="margin: 0 0 8px 0; color: #1976d2;">自定义标题</h4>
      <p style="margin: 0; color: #666;">这是自定义的提示框内容，可以包含任何 HTML 元素。</p>
    </div>
  </div>
</ld-tooltip>
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
      <td><code>content</code></td>
      <td>显示的内容</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>placement</code></td>
      <td>气泡框位置</td>
      <td><code>'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'</code></td>
      <td><code>'top'</code></td>
    </tr>
    <tr>
      <td><code>trigger</code></td>
      <td>触发行为</td>
      <td><code>'hover' | 'click' | 'focus' | 'manual'</code></td>
      <td><code>'hover'</code></td>
    </tr>
    <tr>
      <td><code>visible</code></td>
      <td>用于手动控制浮层显隐</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td>是否禁用</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>show-delay</code></td>
      <td>显示延时（毫秒）</td>
      <td><code>number</code></td>
      <td><code>0</code></td>
    </tr>
    <tr>
      <td><code>hide-delay</code></td>
      <td>隐藏延时（毫秒）</td>
      <td><code>number</code></td>
      <td><code>0</code></td>
    </tr>
    <tr>
      <td><code>arrow-point-at-center</code></td>
      <td>箭头是否指向目标元素中心</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>z-index</code></td>
      <td>设置浮层的 z-index</td>
      <td><code>number</code></td>
      <td><code>1060</code></td>
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
      <td><code>ldShow</code></td>
      <td>显示时触发</td>
      <td><code>() => void</code></td>
    </tr>
    <tr>
      <td><code>ldHide</code></td>
      <td>隐藏时触发</td>
      <td><code>() => void</code></td>
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
      <td>触发提示框显示的元素</td>
    </tr>
    <tr>
      <td>content</td>
      <td>自定义提示框内容</td>
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
      <td><code>show</code></td>
      <td>显示提示框</td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>hide</code></td>
      <td>隐藏提示框</td>
      <td>-</td>
    </tr>
  </tbody>
</table>
