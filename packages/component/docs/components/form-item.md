# FormItem 表单项

表单项组件，用于包装表单控件。

## 基础用法

最基础的表单项用法。

<div class="demo-container">
  <div class="demo-title">基础表单项</div>
  <div class="demo-description">基础的表单项包装。</div>
  <div class="demo-showcase">
    <ld-form style="max-width: 400px;">
      <ld-form-item label="用户名">
        <ld-input placeholder="请输入用户名"></ld-input>
      </ld-form-item>
      <ld-form-item label="密码">
        <ld-input type="password" placeholder="请输入密码"></ld-input>
      </ld-form-item>
    </ld-form>
  </div>
  <div class="demo-code">

```html
<ld-form>
  <ld-form-item label="用户名">
    <ld-input placeholder="请输入用户名"></ld-input>
  </ld-form-item>
  <ld-form-item label="密码">
    <ld-input type="password" placeholder="请输入密码"></ld-input>
  </ld-form-item>
</ld-form>
```

  </div>
</div>

## 必填标记

通过 `required` 属性显示必填标记。

<div class="demo-container">
  <div class="demo-title">必填标记</div>
  <div class="demo-description">显示必填字段的红色星号标记。</div>
  <div class="demo-showcase">
    <ld-form style="max-width: 400px;">
      <ld-form-item label="用户名" required>
        <ld-input placeholder="请输入用户名"></ld-input>
      </ld-form-item>
      <ld-form-item label="邮箱" required>
        <ld-input type="email" placeholder="请输入邮箱"></ld-input>
      </ld-form-item>
      <ld-form-item label="备注">
        <ld-input placeholder="可选项"></ld-input>
      </ld-form-item>
    </ld-form>
  </div>
  <div class="demo-code">

```html
<ld-form>
  <ld-form-item label="用户名" required>
    <ld-input placeholder="请输入用户名"></ld-input>
  </ld-form-item>
  <ld-form-item label="邮箱" required>
    <ld-input type="email" placeholder="请输入邮箱"></ld-input>
  </ld-form-item>
  <ld-form-item label="备注">
    <ld-input placeholder="可选项"></ld-input>
  </ld-form-item>
</ld-form>
```

  </div>
</div>

## 帮助文本

通过 `help` 属性或 `help` 插槽添加帮助文本。

<div class="demo-container">
  <div class="demo-title">帮助文本</div>
  <div class="demo-description">为表单项添加帮助说明文本。</div>
  <div class="demo-showcase">
    <ld-form style="max-width: 400px;">
      <ld-form-item label="用户名" help="用户名长度应在3-20个字符之间">
        <ld-input placeholder="请输入用户名"></ld-input>
      </ld-form-item>
      <ld-form-item label="密码">
        <ld-input type="password" placeholder="请输入密码"></ld-input>
        <div slot="help">密码长度至少8位，包含字母和数字</div>
      </ld-form-item>
    </ld-form>
  </div>
  <div class="demo-code">

```html
<ld-form>
  <ld-form-item label="用户名" help="用户名长度应在3-20个字符之间">
    <ld-input placeholder="请输入用户名"></ld-input>
  </ld-form-item>
  <ld-form-item label="密码">
    <ld-input type="password" placeholder="请输入密码"></ld-input>
    <div slot="help">密码长度至少8位，包含字母和数字</div>
  </ld-form-item>
</ld-form>
```

  </div>
</div>

## 验证状态

表单项支持不同的验证状态。

<div class="demo-container">
  <div class="demo-title">验证状态</div>
  <div class="demo-description">显示不同的验证状态和消息。</div>
  <div class="demo-showcase">
    <ld-form style="max-width: 400px;">
      <ld-form-item label="成功状态" validate-status="success">
        <ld-input value="验证成功"></ld-input>
      </ld-form-item>
      <ld-form-item label="验证中" validate-status="validating">
        <ld-input value="正在验证..."></ld-input>
      </ld-form-item>
      <ld-form-item label="错误状态" validate-status="error" validate-message="用户名已存在">
        <ld-input value="admin"></ld-input>
      </ld-form-item>
    </ld-form>
  </div>
  <div class="demo-code">

```html
<ld-form>
  <ld-form-item label="成功状态" validate-status="success">
    <ld-input value="验证成功"></ld-input>
  </ld-form-item>
  <ld-form-item label="验证中" validate-status="validating">
    <ld-input value="正在验证..."></ld-input>
  </ld-form-item>
  <ld-form-item label="错误状态" validate-status="error" validate-message="用户名已存在">
    <ld-input value="admin"></ld-input>
  </ld-form-item>
</ld-form>
```

  </div>
</div>

## 标签对齐

可以设置标签的对齐方式。

<div class="demo-container">
  <div class="demo-title">标签对齐</div>
  <div class="demo-description">设置标签的不同对齐方式。</div>
  <div class="demo-showcase vertical">
    <div>
      <h4>左对齐</h4>
      <ld-form style="max-width: 400px;">
        <ld-form-item label="用户名" label-align="left" label-width="80px">
          <ld-input placeholder="请输入用户名"></ld-input>
        </ld-form-item>
        <ld-form-item label="邮箱地址" label-align="left" label-width="80px">
          <ld-input placeholder="请输入邮箱"></ld-input>
        </ld-form-item>
      </ld-form>
    </div>
    <div style="margin-top: 20px;">
      <h4>右对齐（默认）</h4>
      <ld-form style="max-width: 400px;">
        <ld-form-item label="用户名" label-align="right" label-width="80px">
          <ld-input placeholder="请输入用户名"></ld-input>
        </ld-form-item>
        <ld-form-item label="邮箱地址" label-align="right" label-width="80px">
          <ld-input placeholder="请输入邮箱"></ld-input>
        </ld-form-item>
      </ld-form>
    </div>
    <div style="margin-top: 20px;">
      <h4>顶部对齐</h4>
      <ld-form style="max-width: 400px;">
        <ld-form-item label="用户名" label-align="top">
          <ld-input placeholder="请输入用户名"></ld-input>
        </ld-form-item>
        <ld-form-item label="邮箱地址" label-align="top">
          <ld-input placeholder="请输入邮箱"></ld-input>
        </ld-form-item>
      </ld-form>
    </div>
  </div>
  <div class="demo-code">

```html
<!-- 左对齐 -->
<ld-form-item label="用户名" label-align="left" label-width="80px">
  <ld-input placeholder="请输入用户名"></ld-input>
</ld-form-item>

<!-- 右对齐 -->
<ld-form-item label="用户名" label-align="right" label-width="80px">
  <ld-input placeholder="请输入用户名"></ld-input>
</ld-form-item>

<!-- 顶部对齐 -->
<ld-form-item label="用户名" label-align="top">
  <ld-input placeholder="请输入用户名"></ld-input>
</ld-form-item>
```

  </div>
</div>

## 自定义标签宽度

可以为每个表单项单独设置标签宽度。

<div class="demo-container">
  <div class="demo-title">自定义标签宽度</div>
  <div class="demo-description">为不同的表单项设置不同的标签宽度。</div>
  <div class="demo-showcase">
    <ld-form layout="horizontal" style="max-width: 500px;">
      <ld-form-item label="姓名" label-width="60px">
        <ld-input placeholder="请输入姓名"></ld-input>
      </ld-form-item>
      <ld-form-item label="手机号码" label-width="80px">
        <ld-input placeholder="请输入手机号码"></ld-input>
      </ld-form-item>
      <ld-form-item label="电子邮箱地址" label-width="120px">
        <ld-input placeholder="请输入邮箱地址"></ld-input>
      </ld-form-item>
    </ld-form>
  </div>
  <div class="demo-code">

```html
<ld-form layout="horizontal">
  <ld-form-item label="姓名" label-width="60px">
    <ld-input placeholder="请输入姓名"></ld-input>
  </ld-form-item>
  <ld-form-item label="手机号码" label-width="80px">
    <ld-input placeholder="请输入手机号码"></ld-input>
  </ld-form-item>
  <ld-form-item label="电子邮箱地址" label-width="120px">
    <ld-input placeholder="请输入邮箱地址"></ld-input>
  </ld-form-item>
</ld-form>
```

  </div>
</div>

## 无标签

表单项可以不显示标签。

<div class="demo-container">
  <div class="demo-title">无标签</div>
  <div class="demo-description">不显示标签的表单项。</div>
  <div class="demo-showcase">
    <ld-form style="max-width: 400px;">
      <ld-form-item>
        <ld-input placeholder="搜索内容"></ld-input>
      </ld-form-item>
      <ld-form-item>
        <ld-button type="primary">搜索</ld-button>
        <ld-button>重置</ld-button>
      </ld-form-item>
    </ld-form>
  </div>
  <div class="demo-code">

```html
<ld-form>
  <ld-form-item>
    <ld-input placeholder="搜索内容"></ld-input>
  </ld-form-item>
  <ld-form-item>
    <ld-button type="primary">搜索</ld-button>
    <ld-button>重置</ld-button>
  </ld-form-item>
</ld-form>
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
      <td>是否必填，如不设置，则会根据校验规则自动生成</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>rules</code></td>
      <td>表单验证规则</td>
      <td><code>object | object[]</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>label-width</code></td>
      <td>标签宽度</td>
      <td><code>string | number</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>label-align</code></td>
      <td>标签对齐方式</td>
      <td><code>'left' | 'right' | 'top'</code></td>
      <td><code>'right'</code></td>
    </tr>
    <tr>
      <td><code>help</code></td>
      <td>提示信息</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>validate-status</code></td>
      <td>校验状态</td>
      <td><code>'validating' | 'success' | 'error'</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>validate-message</code></td>
      <td>校验错误信息</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>show-validate-icon</code></td>
      <td>是否显示校验图标</td>
      <td><code>boolean</code></td>
      <td><code>true</code></td>
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
      <td><code>ldValidateStatusChange</code></td>
      <td>校验状态改变时触发</td>
      <td><code>(status: string, message: string) => void</code></td>
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
      <td>表单控件</td>
    </tr>
    <tr>
      <td>label</td>
      <td>自定义标签内容</td>
    </tr>
    <tr>
      <td>help</td>
      <td>自定义帮助信息</td>
    </tr>
  </tbody>
</table>
