# Form 表单

具有数据收集、校验和提交功能的表单，包含复选框、单选框、输入框、下拉选择框等元素。

## 基础用法

最基础的表单包括各种输入框、选择器、单选框、多选框等。

<div class="demo-container">
  <div class="demo-title">基础表单</div>
  <div class="demo-description">包括各种表单项的基础表单。</div>
  <div class="demo-showcase">
    <ld-form id="basic-form" style="max-width: 400px;">
      <ld-form-item label="用户名" prop="username" required>
        <ld-input placeholder="请输入用户名"></ld-input>
      </ld-form-item>
      <ld-form-item label="密码" prop="password" required>
        <ld-input type="password" placeholder="请输入密码"></ld-input>
      </ld-form-item>
      <ld-form-item label="邮箱" prop="email">
        <ld-input type="email" placeholder="请输入邮箱"></ld-input>
      </ld-form-item>
      <ld-form-item>
        <ld-button type="primary" html-type="submit">提交</ld-button>
        <ld-button html-type="reset">重置</ld-button>
      </ld-form-item>
    </ld-form>
  </div>
  <div class="demo-code">

```html
<ld-form>
  <ld-form-item label="用户名" prop="username" required>
    <ld-input placeholder="请输入用户名"></ld-input>
  </ld-form-item>
  <ld-form-item label="密码" prop="password" required>
    <ld-input type="password" placeholder="请输入密码"></ld-input>
  </ld-form-item>
  <ld-form-item label="邮箱" prop="email">
    <ld-input type="email" placeholder="请输入邮箱"></ld-input>
  </ld-form-item>
  <ld-form-item>
    <ld-button type="primary" html-type="submit">提交</ld-button>
    <ld-button html-type="reset">重置</ld-button>
  </ld-form-item>
</ld-form>
```

  </div>
</div>

## 表单布局

表单有三种布局方式：水平、垂直和行内。

<div class="demo-container">
  <div class="demo-title">水平布局</div>
  <div class="demo-description">标签和表单控件水平排列。</div>
  <div class="demo-showcase">
    <ld-form layout="horizontal" label-width="80px" style="max-width: 500px;">
      <ld-form-item label="用户名" prop="username">
        <ld-input placeholder="请输入用户名"></ld-input>
      </ld-form-item>
      <ld-form-item label="密码" prop="password">
        <ld-input type="password" placeholder="请输入密码"></ld-input>
      </ld-form-item>
      <ld-form-item label="记住我" prop="remember">
        <input type="checkbox" /> 记住我
      </ld-form-item>
      <ld-form-item>
        <ld-button type="primary">登录</ld-button>
      </ld-form-item>
    </ld-form>
  </div>
  <div class="demo-code">

```html
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
```

  </div>
</div>

<div class="demo-container">
  <div class="demo-title">垂直布局</div>
  <div class="demo-description">标签和表单控件垂直排列。</div>
  <div class="demo-showcase">
    <ld-form layout="vertical" style="max-width: 400px;">
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
  </div>
  <div class="demo-code">

```html
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
```

  </div>
</div>

<div class="demo-container">
  <div class="demo-title">行内布局</div>
  <div class="demo-description">表单项在一行内排列。</div>
  <div class="demo-showcase">
    <ld-form layout="inline">
      <ld-form-item label="用户名" prop="username">
        <ld-input placeholder="用户名" style="width: 120px;"></ld-input>
      </ld-form-item>
      <ld-form-item label="密码" prop="password">
        <ld-input type="password" placeholder="密码" style="width: 120px;"></ld-input>
      </ld-form-item>
      <ld-form-item>
        <ld-button type="primary">登录</ld-button>
      </ld-form-item>
    </ld-form>
  </div>
  <div class="demo-code">

```html
<ld-form layout="inline">
  <ld-form-item label="用户名" prop="username">
    <ld-input placeholder="用户名"></ld-input>
  </ld-form-item>
  <ld-form-item label="密码" prop="password">
    <ld-input type="password" placeholder="密码"></ld-input>
  </ld-form-item>
  <ld-form-item>
    <ld-button type="primary">登录</ld-button>
  </ld-form-item>
</ld-form>
```

  </div>
</div>

## 表单验证

表单提供了验证功能。

<div class="demo-container">
  <div class="demo-title">表单验证</div>
  <div class="demo-description">表单验证功能演示。</div>
  <div class="demo-showcase">
    <ld-form id="validation-form" style="max-width: 400px;">
      <ld-form-item label="用户名" prop="username" required validate-message="用户名不能为空">
        <ld-input placeholder="请输入用户名"></ld-input>
      </ld-form-item>
      <ld-form-item label="邮箱" prop="email" required validate-message="请输入有效的邮箱地址">
        <ld-input type="email" placeholder="请输入邮箱"></ld-input>
      </ld-form-item>
      <ld-form-item label="密码" prop="password" required validate-message="密码长度至少6位">
        <ld-input type="password" placeholder="请输入密码"></ld-input>
      </ld-form-item>
      <ld-form-item>
        <ld-button type="primary" onclick="validateForm()">提交</ld-button>
        <ld-button onclick="resetForm()">重置</ld-button>
      </ld-form-item>
    </ld-form>
    <script>
      function validateForm() {
        const form = document.getElementById('validation-form');
        // 这里可以添加验证逻辑
        console.log('表单验证');
      }
      
      function resetForm() {
        const form = document.getElementById('validation-form');
        // 这里可以添加重置逻辑
        console.log('表单重置');
      }
    </script>
  </div>
  <div class="demo-code">

```html
<ld-form>
  <ld-form-item label="用户名" prop="username" required validate-message="用户名不能为空">
    <ld-input placeholder="请输入用户名"></ld-input>
  </ld-form-item>
  <ld-form-item label="邮箱" prop="email" required validate-message="请输入有效的邮箱地址">
    <ld-input type="email" placeholder="请输入邮箱"></ld-input>
  </ld-form-item>
  <ld-form-item label="密码" prop="password" required validate-message="密码长度至少6位">
    <ld-input type="password" placeholder="请输入密码"></ld-input>
  </ld-form-item>
  <ld-form-item>
    <ld-button type="primary">提交</ld-button>
    <ld-button>重置</ld-button>
  </ld-form-item>
</ld-form>
```

  </div>
</div>

## 表单尺寸

表单有三种尺寸。

<div class="demo-container">
  <div class="demo-title">表单尺寸</div>
  <div class="demo-description">通过 size 属性设置表单尺寸。</div>
  <div class="demo-showcase vertical">
    <div>
      <h4>大尺寸</h4>
      <ld-form size="large" style="max-width: 400px;">
        <ld-form-item label="用户名" prop="username">
          <ld-input placeholder="请输入用户名"></ld-input>
        </ld-form-item>
        <ld-form-item>
          <ld-button type="primary">提交</ld-button>
        </ld-form-item>
      </ld-form>
    </div>
    <div style="margin-top: 20px;">
      <h4>中尺寸（默认）</h4>
      <ld-form size="medium" style="max-width: 400px;">
        <ld-form-item label="用户名" prop="username">
          <ld-input placeholder="请输入用户名"></ld-input>
        </ld-form-item>
        <ld-form-item>
          <ld-button type="primary">提交</ld-button>
        </ld-form-item>
      </ld-form>
    </div>
    <div style="margin-top: 20px;">
      <h4>小尺寸</h4>
      <ld-form size="small" style="max-width: 400px;">
        <ld-form-item label="用户名" prop="username">
          <ld-input placeholder="请输入用户名"></ld-input>
        </ld-form-item>
        <ld-form-item>
          <ld-button type="primary">提交</ld-button>
        </ld-form-item>
      </ld-form>
    </div>
  </div>
  <div class="demo-code">

```html
<ld-form size="large">
  <!-- 表单项 -->
</ld-form>

<ld-form size="medium">
  <!-- 表单项 -->
</ld-form>

<ld-form size="small">
  <!-- 表单项 -->
</ld-form>
```

  </div>
</div>

## 禁用状态

设置表单为禁用状态。

<div class="demo-container">
  <div class="demo-title">禁用状态</div>
  <div class="demo-description">整个表单处于禁用状态。</div>
  <div class="demo-showcase">
    <ld-form disabled style="max-width: 400px;">
      <ld-form-item label="用户名" prop="username">
        <ld-input placeholder="请输入用户名"></ld-input>
      </ld-form-item>
      <ld-form-item label="密码" prop="password">
        <ld-input type="password" placeholder="请输入密码"></ld-input>
      </ld-form-item>
      <ld-form-item>
        <ld-button type="primary">提交</ld-button>
      </ld-form-item>
    </ld-form>
  </div>
  <div class="demo-code">

```html
<ld-form disabled>
  <ld-form-item label="用户名" prop="username">
    <ld-input placeholder="请输入用户名"></ld-input>
  </ld-form-item>
  <ld-form-item label="密码" prop="password">
    <ld-input type="password" placeholder="请输入密码"></ld-input>
  </ld-form-item>
  <ld-form-item>
    <ld-button type="primary">提交</ld-button>
  </ld-form-item>
</ld-form>
```

  </div>
</div>

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
      <td><code>model</code></td>
      <td>表单数据对象</td>
      <td><code>object</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>rules</code></td>
      <td>表单验证规则</td>
      <td><code>object</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>layout</code></td>
      <td>表单布局</td>
      <td><code>'horizontal' | 'vertical' | 'inline'</code></td>
      <td><code>'vertical'</code></td>
    </tr>
    <tr>
      <td><code>label-align</code></td>
      <td>标签的文本对齐方式</td>
      <td><code>'left' | 'right' | 'top'</code></td>
      <td><code>'right'</code></td>
    </tr>
    <tr>
      <td><code>label-width</code></td>
      <td>标签的宽度</td>
      <td><code>string | number</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td>表单内组件的尺寸</td>
      <td><code>'small' | 'medium' | 'large'</code></td>
      <td><code>'medium'</code></td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td>是否禁用该表单内的所有组件</td>
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
      <td><code>show-required-mark</code></td>
      <td>是否显示必填字段的标签旁边的红色星号</td>
      <td><code>boolean</code></td>
      <td><code>true</code></td>
    </tr>
    <tr>
      <td><code>show-validate-icon</code></td>
      <td>是否显示校验图标</td>
      <td><code>boolean</code></td>
      <td><code>true</code></td>
    </tr>
    <tr>
      <td><code>validate-trigger</code></td>
      <td>统一设置字段校验规则</td>
      <td><code>'change' | 'blur' | 'submit'</code></td>
      <td><code>'change'</code></td>
    </tr>
    <tr>
      <td><code>scroll-to-error</code></td>
      <td>提交失败自动滚动到第一个错误字段</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
  </tbody>
</table>

### Form 事件

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
      <td>数据验证成功后回调事件</td>
      <td><code>(values: object) => void</code></td>
    </tr>
    <tr>
      <td><code>ldReset</code></td>
      <td>重置表单时触发</td>
      <td><code>() => void</code></td>
    </tr>
    <tr>
      <td><code>ldValidate</code></td>
      <td>任一表单项被校验后触发</td>
      <td><code>(prop: string, isValid: boolean, message: string) => void</code></td>
    </tr>
    <tr>
      <td><code>ldFieldChange</code></td>
      <td>表单项值改变时触发</td>
      <td><code>(prop: string, value: any) => void</code></td>
    </tr>
  </tbody>
</table>

### Form 方法

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
      <td><code>validate</code></td>
      <td>对整个表单进行校验的方法</td>
      <td><code>(callback?: (isValid: boolean) => void) => Promise&lt;boolean&gt;</code></td>
    </tr>
    <tr>
      <td><code>validateField</code></td>
      <td>对部分表单字段进行校验的方法</td>
      <td><code>(props: string | string[], callback?: (isValid: boolean) => void) => Promise&lt;boolean&gt;</code></td>
    </tr>
    <tr>
      <td><code>resetFields</code></td>
      <td>对整个表单进行重置，将所有字段值重置为初始值并移除校验结果</td>
      <td><code>() => void</code></td>
    </tr>
    <tr>
      <td><code>clearValidate</code></td>
      <td>移除表单项的校验结果</td>
      <td><code>(props?: string | string[]) => void</code></td>
    </tr>
  </tbody>
</table>
