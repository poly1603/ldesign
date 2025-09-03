# Input 输入框

通过鼠标或键盘输入内容，是最基础的表单域的包装。

## 基础用法

最简单的输入框用法。

<Demo 
  title="基础输入框" 
  description="基本的输入框使用。"
  :code='`<ld-input placeholder="请输入内容"></ld-input>
<ld-input value="默认值" placeholder="请输入内容"></ld-input>`'
>
  <ld-input placeholder="请输入内容"></ld-input>
  <ld-input value="默认值" placeholder="请输入内容"></ld-input>
</Demo>

## 输入框尺寸

输入框有三种尺寸。

<Demo 
  title="不同尺寸" 
  description="通过设置 size 属性来控制输入框大小。"
  :code='`<ld-input size="large" placeholder="大尺寸输入框"></ld-input>
<ld-input size="medium" placeholder="中尺寸输入框"></ld-input>
<ld-input size="small" placeholder="小尺寸输入框"></ld-input>`'
  vertical
>
  <ld-input size="large" placeholder="大尺寸输入框"></ld-input>
  <ld-input size="medium" placeholder="中尺寸输入框"></ld-input>
  <ld-input size="small" placeholder="小尺寸输入框"></ld-input>
</Demo>

## 输入框状态

### 禁用和只读

通过 `disabled` 和 `readonly` 属性设置不同状态。

<Demo 
  title="禁用和只读状态" 
  description="禁用状态下不能输入，只读状态下不能修改但可以选中。"
  :code='`<ld-input placeholder="正常输入框"></ld-input>
<ld-input disabled placeholder="禁用输入框"></ld-input>
<ld-input readonly value="只读输入框"></ld-input>`'
  vertical
>
  <ld-input placeholder="正常输入框"></ld-input>
  <ld-input disabled placeholder="禁用输入框"></ld-input>
  <ld-input readonly value="只读输入框"></ld-input>
</Demo>

## 带清除功能

带移除图标的输入框，点击图标删除所有内容。

<Demo 
  title="带清除功能" 
  description="可以快速清空输入内容。"
  :code='`<ld-input clearable placeholder="可清空的输入框"></ld-input>
<ld-input clearable value="默认内容" placeholder="可清空的输入框"></ld-input>`'
  vertical
>
  <ld-input clearable placeholder="可清空的输入框"></ld-input>
  <ld-input clearable value="默认内容" placeholder="可清空的输入框"></ld-input>
</Demo>

## 密码输入

密码输入框支持显示/隐藏密码。

<Demo 
  title="密码输入" 
  description="密码输入框支持显示和隐藏密码。"
  :code='`<ld-input type="password" placeholder="请输入密码"></ld-input>
<ld-input type="password" show-password placeholder="可显示密码"></ld-input>`'
  vertical
>
  <ld-input type="password" placeholder="请输入密码"></ld-input>
  <ld-input type="password" show-password placeholder="可显示密码"></ld-input>
</Demo>

## 带图标的输入框

通过设置 `prefix-icon` 和 `suffix-icon` 来在输入框内显示图标。

<Demo 
  title="带图标的输入框" 
  description="可以在输入框的前后缀位置添加图标。"
  :code='`<ld-input prefix-icon="user" placeholder="用户名"></ld-input>
<ld-input suffix-icon="search" placeholder="搜索内容"></ld-input>
<ld-input prefix-icon="lock" suffix-icon="eye" placeholder="密码"></ld-input>`'
  vertical
>
  <ld-input prefix-icon="user" placeholder="用户名"></ld-input>
  <ld-input suffix-icon="search" placeholder="搜索内容"></ld-input>
  <ld-input prefix-icon="lock" suffix-icon="eye" placeholder="密码"></ld-input>
</Demo>

## 文本域

用于多行文本输入。

<Demo 
  title="文本域" 
  description="支持多行文本输入和自适应高度。"
  :code='`<ld-input type="textarea" placeholder="请输入多行文本"></ld-input>
<ld-input type="textarea" autosize placeholder="自适应高度"></ld-input>
<ld-input type="textarea" show-count maxlength="100" placeholder="带字数统计"></ld-input>`'
  vertical
>
  <ld-input type="textarea" placeholder="请输入多行文本"></ld-input>
  <ld-input type="textarea" autosize placeholder="自适应高度"></ld-input>
  <ld-input type="textarea" show-count maxlength="100" placeholder="带字数统计"></ld-input>
</Demo>

## 交互式演示

在下面的演示中可以实时调整输入框属性，查看不同配置下的效果。

<ComponentPlayground
  title="输入框属性配置"
  component="ld-input"
  :defaultProps="{
    type: 'text',
    variant: 'outlined',
    size: 'medium',
    placeholder: '请输入内容',
    disabled: false,
    readonly: false,
    clearable: false,
    showPassword: false,
    showCount: false,
    maxlength: undefined
  }"
>
  <template #preview="{ props }">
    <ld-input 
      :type="props.type"
      :variant="props.variant"
      :size="props.size"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :clearable="props.clearable"
      :show-password="props.showPassword"
      :show-count="props.showCount"
      :maxlength="props.maxlength"
      @ldInput="handleInput"
      @ldChange="handleChange"
    ></ld-input>
  </template>
  
  <template #controls="{ props, updateProp }">
    <PropertyControl 
      label="输入类型"
      description="控制输入框的类型"
      type="select"
      :modelValue="props.type"
      @update:modelValue="updateProp('type', $event)"
      :options="[
        { label: '文本', value: 'text' },
        { label: '密码', value: 'password' },
        { label: '邮箱', value: 'email' },
        { label: '电话', value: 'tel' },
        { label: '数字', value: 'number' },
        { label: 'URL', value: 'url' },
        { label: '文本域', value: 'textarea' }
      ]"
    />
    
    <PropertyControl 
      label="输入框风格"
      description="控制输入框的外观"
      type="select"
      :modelValue="props.variant"
      @update:modelValue="updateProp('variant', $event)"
      :options="[
        { label: '边框', value: 'outlined' },
        { label: '填充', value: 'filled' },
        { label: '无边框', value: 'borderless' }
      ]"
    />
    
    <PropertyControl 
      label="输入框尺寸"
      description="控制输入框的大小"
      type="select"
      :modelValue="props.size"
      @update:modelValue="updateProp('size', $event)"
      :options="[
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' }
      ]"
    />
    
    <PropertyControl 
      label="占位符"
      description="输入框的占位符文本"
      type="text"
      :modelValue="props.placeholder"
      @update:modelValue="updateProp('placeholder', $event)"
      placeholder="请输入占位符"
    />
    
    <PropertyControl 
      label="最大长度"
      description="限制输入字符数"
      type="number"
      :modelValue="props.maxlength"
      @update:modelValue="updateProp('maxlength', $event)"
      :min="1"
      :max="1000"
    />
    
    <PropertyControl 
      label="禁用状态"
      description="输入框是否不可输入"
      type="boolean"
      :modelValue="props.disabled"
      @update:modelValue="updateProp('disabled', $event)"
    />
    
    <PropertyControl 
      label="只读状态"
      description="输入框是否只读"
      type="boolean"
      :modelValue="props.readonly"
      @update:modelValue="updateProp('readonly', $event)"
    />
    
    <PropertyControl 
      label="可清空"
      description="是否显示清空按钮"
      type="boolean"
      :modelValue="props.clearable"
      @update:modelValue="updateProp('clearable', $event)"
    />
    
    <PropertyControl 
      label="密码可见性"
      description="密码输入框是否可切换显示"
      type="boolean"
      :modelValue="props.showPassword"
      @update:modelValue="updateProp('showPassword', $event)"
    />
    
    <PropertyControl 
      label="字数统计"
      description="是否显示字数统计"
      type="boolean"
      :modelValue="props.showCount"
      @update:modelValue="updateProp('showCount', $event)"
    />
  </template>
</ComponentPlayground>

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
      <td>输入框类型</td>
      <td><code>'text' | 'password' | 'email' | 'tel' | 'number' | 'url' | 'textarea'</code></td>
      <td><code>'text'</code></td>
    </tr>
    <tr>
      <td><code>variant</code></td>
      <td>输入框风格</td>
      <td><code>'outlined' | 'filled' | 'borderless'</code></td>
      <td><code>'outlined'</code></td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td>输入框尺寸</td>
      <td><code>'small' | 'medium' | 'large'</code></td>
      <td><code>'medium'</code></td>
    </tr>
    <tr>
      <td><code>value</code></td>
      <td>输入框值</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>placeholder</code></td>
      <td>占位符文本</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td>是否禁用</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>readonly</code></td>
      <td>是否只读</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>clearable</code></td>
      <td>是否可清空</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>show-password</code></td>
      <td>是否显示密码切换</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>show-count</code></td>
      <td>是否显示字数统计</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>maxlength</code></td>
      <td>最大输入长度</td>
      <td><code>number</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>prefix-icon</code></td>
      <td>前缀图标</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>suffix-icon</code></td>
      <td>后缀图标</td>
      <td><code>string</code></td>
      <td>-</td>
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
      <td><code>ldInput</code></td>
      <td>输入时触发</td>
      <td><code>(event: InputEvent) => void</code></td>
    </tr>
    <tr>
      <td><code>ldChange</code></td>
      <td>值改变时触发</td>
      <td><code>(event: Event) => void</code></td>
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
    <tr>
      <td><code>ldEnter</code></td>
      <td>按下回车键时触发</td>
      <td><code>(event: KeyboardEvent) => void</code></td>
    </tr>
    <tr>
      <td><code>ldClear</code></td>
      <td>清空内容时触发</td>
      <td><code>(event: MouseEvent) => void</code></td>
    </tr>
  </tbody>
</table>

<script setup>
const handleInput = (event) => {
  console.log('输入事件:', event)
}

const handleChange = (event) => {
  console.log('变化事件:', event)
}
</script>

基本使用。

<div class="demo-container">
  <div class="demo-title">基础输入框</div>
  <div class="demo-description">最简单的输入框用法。</div>
  <div class="demo-showcase">
    <ld-input placeholder="请输入内容"></ld-input>
  </div>
  <div class="demo-code">

```html
<ld-input placeholder="请输入内容"></ld-input>
```

  </div>
</div>

## 禁用状态

通过 `disabled` 属性指定是否禁用 input 组件。

<div class="demo-container">
  <div class="demo-title">禁用状态</div>
  <div class="demo-description">禁用状态下，输入框不可编辑。</div>
  <div class="demo-showcase">
    <ld-input placeholder="禁用状态" disabled></ld-input>
    <ld-input value="禁用状态" disabled></ld-input>
  </div>
  <div class="demo-code">

```html
<ld-input placeholder="禁用状态" disabled></ld-input>
<ld-input value="禁用状态" disabled></ld-input>
```

  </div>
</div>

## 只读状态

通过 `readonly` 属性指定是否只读。

<div class="demo-container">
  <div class="demo-title">只读状态</div>
  <div class="demo-description">只读状态下，输入框不可编辑但可以选择和复制。</div>
  <div class="demo-showcase">
    <ld-input value="只读状态" readonly></ld-input>
  </div>
  <div class="demo-code">

```html
<ld-input value="只读状态" readonly></ld-input>
```

  </div>
</div>

## 不同尺寸

输入框有三种尺寸：大、中、小。

<div class="demo-container">
  <div class="demo-title">不同尺寸</div>
  <div class="demo-description">通过设置 size 属性来控制输入框大小。</div>
  <div class="demo-showcase vertical">
    <ld-input size="large" placeholder="大尺寸"></ld-input>
    <ld-input size="medium" placeholder="中尺寸"></ld-input>
    <ld-input size="small" placeholder="小尺寸"></ld-input>
  </div>
  <div class="demo-code">

```html
<ld-input size="large" placeholder="大尺寸"></ld-input>
<ld-input size="medium" placeholder="中尺寸"></ld-input>
<ld-input size="small" placeholder="小尺寸"></ld-input>
```

  </div>
</div>

## 输入类型

支持多种输入类型。

<div class="demo-container">
  <div class="demo-title">输入类型</div>
  <div class="demo-description">通过 type 属性指定不同的输入类型。</div>
  <div class="demo-showcase vertical">
    <ld-input type="text" placeholder="文本输入"></ld-input>
    <ld-input type="password" placeholder="密码输入"></ld-input>
    <ld-input type="email" placeholder="邮箱输入"></ld-input>
    <ld-input type="number" placeholder="数字输入"></ld-input>
    <ld-input type="tel" placeholder="电话输入"></ld-input>
    <ld-input type="url" placeholder="网址输入"></ld-input>
  </div>
  <div class="demo-code">

```html
<ld-input type="text" placeholder="文本输入"></ld-input>
<ld-input type="password" placeholder="密码输入"></ld-input>
<ld-input type="email" placeholder="邮箱输入"></ld-input>
<ld-input type="number" placeholder="数字输入"></ld-input>
<ld-input type="tel" placeholder="电话输入"></ld-input>
<ld-input type="url" placeholder="网址输入"></ld-input>
```

  </div>
</div>

## 可清空

使用 `clearable` 属性即可得到一个可清空的输入框。

<div class="demo-container">
  <div class="demo-title">可清空</div>
  <div class="demo-description">点击清空图标可以清空输入框内容。</div>
  <div class="demo-showcase">
    <ld-input placeholder="可清空输入框" clearable></ld-input>
    <ld-input value="有内容的输入框" clearable></ld-input>
  </div>
  <div class="demo-code">

```html
<ld-input placeholder="可清空输入框" clearable></ld-input>
<ld-input value="有内容的输入框" clearable></ld-input>
```

  </div>
</div>

## 密码框

使用 `show-password` 属性即可得到一个可切换显示隐藏的密码框。

<div class="demo-container">
  <div class="demo-title">密码框</div>
  <div class="demo-description">点击眼睛图标可以切换密码的显示和隐藏。</div>
  <div class="demo-showcase">
    <ld-input type="password" placeholder="请输入密码" show-password></ld-input>
  </div>
  <div class="demo-code">

```html
<ld-input type="password" placeholder="请输入密码" show-password></ld-input>
```

  </div>
</div>

## 带图标的输入框

可以通过 `prefix-icon` 和 `suffix-icon` 属性在 input 组件首部和尾部增加显示图标。

<div class="demo-container">
  <div class="demo-title">带图标的输入框</div>
  <div class="demo-description">在输入框前后添加图标。</div>
  <div class="demo-showcase vertical">
    <ld-input placeholder="请输入用户名" prefix-icon="user"></ld-input>
    <ld-input placeholder="请输入内容" suffix-icon="search"></ld-input>
    <ld-input placeholder="请输入内容" prefix-icon="user" suffix-icon="search"></ld-input>
  </div>
  <div class="demo-code">

```html
<ld-input placeholder="请输入用户名" prefix-icon="user"></ld-input>
<ld-input placeholder="请输入内容" suffix-icon="search"></ld-input>
<ld-input placeholder="请输入内容" prefix-icon="user" suffix-icon="search"></ld-input>
```

  </div>
</div>

## 带前缀和后缀的输入框

可以通过 `prefix-content` 属性在 input 组件首部增加显示文本。

<div class="demo-container">
  <div class="demo-title">带前缀和后缀的输入框</div>
  <div class="demo-description">在输入框前后添加文本内容。</div>
  <div class="demo-showcase vertical">
    <ld-input placeholder="请输入" prefix-content="Http://"></ld-input>
    <ld-input placeholder="请输入" suffix-content=".com"></ld-input>
  </div>
  <div class="demo-code">

```html
<ld-input placeholder="请输入" prefix-content="Http://"></ld-input>
<ld-input placeholder="请输入" suffix-content=".com"></ld-input>
```

  </div>
</div>

## 字数限制

使用 `max-length` 属性限制输入长度。

<div class="demo-container">
  <div class="demo-title">字数限制</div>
  <div class="demo-description">限制输入框的最大字符数。</div>
  <div class="demo-showcase">
    <ld-input placeholder="最多输入10个字符" max-length="10"></ld-input>
  </div>
  <div class="demo-code">

```html
<ld-input placeholder="最多输入10个字符" max-length="10"></ld-input>
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
      <td>输入框类型</td>
      <td><code>'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'</code></td>
      <td><code>'text'</code></td>
    </tr>
    <tr>
      <td><code>value</code></td>
      <td>输入框内容</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>placeholder</code></td>
      <td>输入框占位文本</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td>是否禁用</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>readonly</code></td>
      <td>是否只读</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td>输入框尺寸</td>
      <td><code>'small' | 'medium' | 'large'</code></td>
      <td><code>'medium'</code></td>
    </tr>
    <tr>
      <td><code>max-length</code></td>
      <td>最大输入长度</td>
      <td><code>number</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>clearable</code></td>
      <td>是否可清空</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>show-password</code></td>
      <td>是否显示切换密码图标</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>prefix-icon</code></td>
      <td>输入框头部图标</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>suffix-icon</code></td>
      <td>输入框尾部图标</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>prefix-content</code></td>
      <td>输入框头部内容</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>suffix-content</code></td>
      <td>输入框尾部内容</td>
      <td><code>string</code></td>
      <td>-</td>
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
      <td><code>ldChange</code></td>
      <td>输入框内容变化时触发</td>
      <td><code>(value: string) => void</code></td>
    </tr>
    <tr>
      <td><code>ldFocus</code></td>
      <td>输入框获得焦点时触发</td>
      <td><code>(event: FocusEvent) => void</code></td>
    </tr>
    <tr>
      <td><code>ldBlur</code></td>
      <td>输入框失去焦点时触发</td>
      <td><code>(event: FocusEvent) => void</code></td>
    </tr>
    <tr>
      <td><code>ldClear</code></td>
      <td>点击清空按钮时触发</td>
      <td><code>() => void</code></td>
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
      <td>使输入框获得焦点</td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>blur</code></td>
      <td>使输入框失去焦点</td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>select</code></td>
      <td>选中输入框中的文字</td>
      <td>-</td>
    </tr>
  </tbody>
</table>
