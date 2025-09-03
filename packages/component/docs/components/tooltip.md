# Tooltip 工具提示

简单的文字提示气泡框。

## 基础用法

最简单的用法。

<Demo 
  title="基础提示框" 
  description="鼠标移入则显示提示，移出消失，气泡浮层不承载复杂文本和操作。"
  :code='`<ld-tooltip content="这是一个提示">
  <ld-button>悬停显示提示</ld-button>
</ld-tooltip>`'
>
  <ld-tooltip content="这是一个提示">
    <ld-button>悬停显示提示</ld-button>
  </ld-tooltip>
</Demo>

## 不同位置

提示框支持 12 个不同的方位。

<Demo 
  title="不同位置" 
  description="由 placement 属性决定展示效果。"
  :code='`<ld-tooltip content="上方提示" placement="top">
  <ld-button>上方</ld-button>
</ld-tooltip>
<ld-tooltip content="下方提示" placement="bottom">
  <ld-button>下方</ld-button>
</ld-tooltip>
<ld-tooltip content="左侧提示" placement="left">
  <ld-button>左侧</ld-button>
</ld-tooltip>
<ld-tooltip content="右侧提示" placement="right">
  <ld-button>右侧</ld-button>
</ld-tooltip>`'
>
  <ld-tooltip content="上方提示" placement="top">
    <ld-button>上方</ld-button>
  </ld-tooltip>
  <ld-tooltip content="下方提示" placement="bottom">
    <ld-button>下方</ld-button>
  </ld-tooltip>
  <ld-tooltip content="左侧提示" placement="left">
    <ld-button>左侧</ld-button>
  </ld-tooltip>
  <ld-tooltip content="右侧提示" placement="right">
    <ld-button>右侧</ld-button>
  </ld-tooltip>
</Demo>

## 触发方式

提示框支持多种触发方式。

<Demo 
  title="触发方式" 
  description="通过 trigger 属性设置触发方式。"
  :code='`<ld-tooltip content="悬停触发" trigger="hover">
  <ld-button>悬停触发</ld-button>
</ld-tooltip>
<ld-tooltip content="点击触发" trigger="click">
  <ld-button>点击触发</ld-button>
</ld-tooltip>
<ld-tooltip content="聚焦触发" trigger="focus">
  <ld-button>聚焦触发</ld-button>
</ld-tooltip>`'
>
  <ld-tooltip content="悬停触发" trigger="hover">
    <ld-button>悬停触发</ld-button>
  </ld-tooltip>
  <ld-tooltip content="点击触发" trigger="click">
    <ld-button>点击触发</ld-button>
  </ld-tooltip>
  <ld-tooltip content="聚焦触发" trigger="focus">
    <ld-button>聚焦触发</ld-button>
  </ld-tooltip>
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
      <td><code>content</code></td>
      <td>提示文字</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>placement</code></td>
      <td>气泡框位置</td>
      <td><code>'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'</code></td>
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
      <td>显示延迟（毫秒）</td>
      <td><code>number</code></td>
      <td><code>0</code></td>
    </tr>
    <tr>
      <td><code>hide-delay</code></td>
      <td>隐藏延迟（毫秒）</td>
      <td><code>number</code></td>
      <td><code>100</code></td>
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
      <td>触发 tooltip 的元素</td>
    </tr>
    <tr>
      <td>content</td>
      <td>自定义提示内容</td>
    </tr>
  </tbody>
</table>
