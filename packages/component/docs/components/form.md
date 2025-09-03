# Form 表单

表单包含输入框、选择器、复选框、单选框等用户输入的组件。

## 基础用法

最简单的表单用法。

<Demo 
  title="基础表单" 
  description="包含输入框和按钮的基础表单。"
  :code='`<ld-form>
  <ld-form-item label="用户名" prop="username">
    <ld-input placeholder="请输入用户名"></ld-input>
  </ld-form-item>
  <ld-form-item label="密码" prop="password">
    <ld-input type="password" placeholder="请输入密码"></ld-input>
  </ld-form-item>
  <ld-form-item>
    <ld-button type="primary">登录</ld-button>
  </ld-form-item>
</ld-form>`'
>
  <ld-form>
    <ld-form-item label="用户名" prop="username">
      <ld-input placeholder="请输入用户名"></ld-input>
    </ld-form-item>
    <ld-form-item label="密码" prop="password">
      <ld-input type="password" placeholder="请输入密码"></ld-input>
    </ld-form-item>
    <ld-form-item>
      <ld-button type="primary">登录</ld-button>
    </ld-form-item>
  </ld-form>
</Demo>

## 表单布局

表单支持多种布局方式。

<Demo 
  title="水平布局" 
  description="标签和表单控件水平排列。"
  :code='`<ld-form layout="horizontal" label-width="80px">
  <ld-form-item label="用户名" prop="username">
    <ld-input placeholder="请输入用户名"></ld-input>
  </ld-form-item>
  <ld-form-item label="密码" prop="password">
    <ld-input type="password" placeholder="请输入密码"></ld-input>
  </ld-form-item>
  <ld-form-item>
    <ld-button type="primary">登录</ld-button>
  </ld-form-item>
</ld-form>`'
>
  <ld-form layout="horizontal" label-width="80px">
    <ld-form-item label="用户名" prop="username">
      <ld-input placeholder="请输入用户名"></ld-input>
    </ld-form-item>
    <ld-form-item label="密码" prop="password">
      <ld-input type="password" placeholder="请输入密码"></ld-input>
    </ld-form-item>
    <ld-form-item>
      <ld-button type="primary">登录</ld-button>
    </ld-form-item>
  </ld-form>
</Demo>

<Demo 
  title="垂直布局" 
  description="标签和表单控件垂直排列。"
  :code='`<ld-form layout="vertical">
  <ld-form-item label="用户名" prop="username">
    <ld-input placeholder="请输入用户名"></ld-input>
  </ld-form-item>
  <ld-form-item label="密码" prop="password">
    <ld-input type="password" placeholder="请输入密码"></ld-input>
  </ld-form-item>
  <ld-form-item>
    <ld-button type="primary">登录</ld-button>
  </ld-form-item>
</ld-form>`'
>
  <ld-form layout="vertical">
    <ld-form-item label="用户名" prop="username">
      <ld-input placeholder="请输入用户名"></ld-input>
    </ld-form-item>
    <ld-form-item label="密码" prop="password">
      <ld-input type="password" placeholder="请输入密码"></ld-input>
    </ld-form-item>
    <ld-form-item>
      <ld-button type="primary">登录</ld-button>
    </ld-form-item>
  </ld-form>
</Demo>

## API

### Form 属性

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
      <td><code>layout</code></td>
      <td>表单布局</td>
      <td><code>'horizontal' | 'vertical' | 'inline'</code></td>
      <td><code>'horizontal'</code></td>
    </tr>
    <tr>
      <td><code>label-width</code></td>
      <td>标签宽度</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td>表单尺寸</td>
      <td><code>'small' | 'medium' | 'large'</code></td>
      <td><code>'medium'</code></td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td>是否禁用表单</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
  </tbody>
</table>

### Form Item 属性

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
      <td><code>label</code></td>
      <td>标签文本</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>prop</code></td>
      <td>表单域 model 字段</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>required</code></td>
      <td>是否必填</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>validate-message</code></td>
      <td>校验失败时提示文本</td>
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
      <td><code>ldSubmit</code></td>
      <td>表单提交时触发</td>
      <td><code>(data: any) => void</code></td>
    </tr>
    <tr>
      <td><code>ldValidate</code></td>
      <td>表单验证时触发</td>
      <td><code>(valid: boolean, errors: any) => void</code></td>
    </tr>
  </tbody>
</table>
