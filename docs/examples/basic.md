# 基础用法示例

本页面展示了 LDesign 组件库的基础用法示例，帮助你快速了解如何使用各个组件。

## 表单示例

一个包含多种输入组件的基础表单。

<div class="demo-block">
  <div class="form-example">
    <div class="form-item">
      <label>用户名：</label>
      <ld-input placeholder="请输入用户名" prefix-icon="user"></ld-input>
    </div>
    
    <div class="form-item">
      <label>密码：</label>
      <ld-input type="password" placeholder="请输入密码" show-password prefix-icon="lock"></ld-input>
    </div>
    
    <div class="form-item">
      <label>邮箱：</label>
      <ld-input type="email" placeholder="请输入邮箱" suffix="@example.com"></ld-input>
    </div>
    
    <div class="form-item">
      <label>个人简介：</label>
      <ld-input type="textarea" placeholder="请输入个人简介" rows="4" show-count maxlength="200"></ld-input>
    </div>
    
    <div class="form-actions">
      <ld-button>重置</ld-button>
      <ld-button type="primary">提交</ld-button>
    </div>
  </div>
</div>

```html
<div class="form-example">
  <div class="form-item">
    <label>用户名：</label>
    <ld-input placeholder="请输入用户名" prefix-icon="user"></ld-input>
  </div>
  
  <div class="form-item">
    <label>密码：</label>
    <ld-input type="password" placeholder="请输入密码" show-password prefix-icon="lock"></ld-input>
  </div>
  
  <div class="form-item">
    <label>邮箱：</label>
    <ld-input type="email" placeholder="请输入邮箱" suffix="@example.com"></ld-input>
  </div>
  
  <div class="form-item">
    <label>个人简介：</label>
    <ld-input type="textarea" placeholder="请输入个人简介" rows="4" show-count maxlength="200"></ld-input>
  </div>
  
  <div class="form-actions">
    <ld-button>重置</ld-button>
    <ld-button type="primary">提交</ld-button>
  </div>
</div>
```

## 卡片列表示例

使用卡片组件展示信息列表。

<div class="demo-block">
  <div class="card-list">
    <ld-card title="产品介绍" shadow="hover" hoverable>
      <p>这是一个优秀的产品，具有以下特点：</p>
      <ul>
        <li>高性能</li>
        <li>易使用</li>
        <li>可扩展</li>
      </ul>
      <div slot="footer">
        <ld-button type="text">了解更多</ld-button>
        <ld-button type="primary">立即购买</ld-button>
      </div>
    </ld-card>
    
    <ld-card title="用户反馈" shadow="hover" hoverable>
      <p>用户对我们产品的评价：</p>
      <blockquote>
        "这个产品真的很棒，大大提高了我的工作效率！"
      </blockquote>
      <p>— 张三，软件工程师</p>
      <div slot="footer">
        <ld-button type="text">查看更多</ld-button>
        <ld-button type="primary">写评价</ld-button>
      </div>
    </ld-card>
    
    <ld-card title="技术支持" shadow="hover" hoverable>
      <p>我们提供全方位的技术支持：</p>
      <ul>
        <li>24/7 在线客服</li>
        <li>详细的文档</li>
        <li>社区支持</li>
      </ul>
      <div slot="footer">
        <ld-button type="text">联系客服</ld-button>
        <ld-button type="primary">查看文档</ld-button>
      </div>
    </ld-card>
  </div>
</div>

```html
<div class="card-list">
  <ld-card title="产品介绍" shadow="hover" hoverable>
    <p>这是一个优秀的产品，具有以下特点：</p>
    <ul>
      <li>高性能</li>
      <li>易使用</li>
      <li>可扩展</li>
    </ul>
    <div slot="footer">
      <ld-button type="text">了解更多</ld-button>
      <ld-button type="primary">立即购买</ld-button>
    </div>
  </ld-card>
  
  <ld-card title="用户反馈" shadow="hover" hoverable>
    <p>用户对我们产品的评价：</p>
    <blockquote>
      "这个产品真的很棒，大大提高了我的工作效率！"
    </blockquote>
    <p>— 张三，软件工程师</p>
    <div slot="footer">
      <ld-button type="text">查看更多</ld-button>
      <ld-button type="primary">写评价</ld-button>
    </div>
  </ld-card>
  
  <ld-card title="技术支持" shadow="hover" hoverable>
    <p>我们提供全方位的技术支持：</p>
    <ul>
      <li>24/7 在线客服</li>
      <li>详细的文档</li>
      <li>社区支持</li>
    </ul>
    <div slot="footer">
      <ld-button type="text">联系客服</ld-button>
      <ld-button type="primary">查看文档</ld-button>
    </div>
  </ld-card>
</div>
```

## 按钮组合示例

展示不同类型和状态的按钮组合。

<div class="demo-block">
  <div class="button-groups">
    <div class="button-group">
      <h4>基础按钮</h4>
      <ld-button>默认</ld-button>
      <ld-button type="primary">主要</ld-button>
      <ld-button type="dashed">虚线</ld-button>
      <ld-button type="text">文本</ld-button>
      <ld-button type="link">链接</ld-button>
    </div>
    
    <div class="button-group">
      <h4>状态按钮</h4>
      <ld-button status="success">成功</ld-button>
      <ld-button status="warning">警告</ld-button>
      <ld-button status="error">错误</ld-button>
      <ld-button status="danger">危险</ld-button>
    </div>
    
    <div class="button-group">
      <h4>图标按钮</h4>
      <ld-button icon="search">搜索</ld-button>
      <ld-button type="primary" icon="download">下载</ld-button>
      <ld-button icon="setting"></ld-button>
      <ld-button type="primary" loading>加载中</ld-button>
    </div>
    
    <div class="button-group">
      <h4>尺寸按钮</h4>
      <ld-button size="large" type="primary">大按钮</ld-button>
      <ld-button type="primary">中按钮</ld-button>
      <ld-button size="small" type="primary">小按钮</ld-button>
    </div>
  </div>
</div>

```html
<div class="button-groups">
  <div class="button-group">
    <h4>基础按钮</h4>
    <ld-button>默认</ld-button>
    <ld-button type="primary">主要</ld-button>
    <ld-button type="dashed">虚线</ld-button>
    <ld-button type="text">文本</ld-button>
    <ld-button type="link">链接</ld-button>
  </div>
  
  <div class="button-group">
    <h4>状态按钮</h4>
    <ld-button status="success">成功</ld-button>
    <ld-button status="warning">警告</ld-button>
    <ld-button status="error">错误</ld-button>
    <ld-button status="danger">危险</ld-button>
  </div>
  
  <div class="button-group">
    <h4>图标按钮</h4>
    <ld-button icon="search">搜索</ld-button>
    <ld-button type="primary" icon="download">下载</ld-button>
    <ld-button icon="setting"></ld-button>
    <ld-button type="primary" loading>加载中</ld-button>
  </div>
  
  <div class="button-group">
    <h4>尺寸按钮</h4>
    <ld-button size="large" type="primary">大按钮</ld-button>
    <ld-button type="primary">中按钮</ld-button>
    <ld-button size="small" type="primary">小按钮</ld-button>
  </div>
</div>
```

## 输入框组合示例

展示不同类型和状态的输入框。

<div class="demo-block">
  <div class="input-groups">
    <div class="input-group">
      <h4>基础输入框</h4>
      <ld-input placeholder="普通输入框"></ld-input>
      <ld-input placeholder="可清空" clearable></ld-input>
      <ld-input placeholder="禁用状态" disabled></ld-input>
      <ld-input placeholder="只读状态" readonly value="只读内容"></ld-input>
    </div>
    
    <div class="input-group">
      <h4>状态输入框</h4>
      <ld-input status="success" placeholder="成功状态" value="输入正确"></ld-input>
      <ld-input status="warning" placeholder="警告状态" value="需要注意"></ld-input>
      <ld-input status="error" placeholder="错误状态" value="输入错误"></ld-input>
    </div>
    
    <div class="input-group">
      <h4>带图标输入框</h4>
      <ld-input prefix-icon="user" placeholder="用户名"></ld-input>
      <ld-input prefix-icon="mail" placeholder="邮箱地址"></ld-input>
      <ld-input suffix-icon="search" placeholder="搜索内容"></ld-input>
    </div>
    
    <div class="input-group">
      <h4>尺寸输入框</h4>
      <ld-input size="large" placeholder="大尺寸"></ld-input>
      <ld-input placeholder="默认尺寸"></ld-input>
      <ld-input size="small" placeholder="小尺寸"></ld-input>
    </div>
  </div>
</div>

```html
<div class="input-groups">
  <div class="input-group">
    <h4>基础输入框</h4>
    <ld-input placeholder="普通输入框"></ld-input>
    <ld-input placeholder="可清空" clearable></ld-input>
    <ld-input placeholder="禁用状态" disabled></ld-input>
    <ld-input placeholder="只读状态" readonly value="只读内容"></ld-input>
  </div>
  
  <div class="input-group">
    <h4>状态输入框</h4>
    <ld-input status="success" placeholder="成功状态" value="输入正确"></ld-input>
    <ld-input status="warning" placeholder="警告状态" value="需要注意"></ld-input>
    <ld-input status="error" placeholder="错误状态" value="输入错误"></ld-input>
  </div>
  
  <div class="input-group">
    <h4>带图标输入框</h4>
    <ld-input prefix-icon="user" placeholder="用户名"></ld-input>
    <ld-input prefix-icon="mail" placeholder="邮箱地址"></ld-input>
    <ld-input suffix-icon="search" placeholder="搜索内容"></ld-input>
  </div>
  
  <div class="input-group">
    <h4>尺寸输入框</h4>
    <ld-input size="large" placeholder="大尺寸"></ld-input>
    <ld-input placeholder="默认尺寸"></ld-input>
    <ld-input size="small" placeholder="小尺寸"></ld-input>
  </div>
</div>
```

<style>
.demo-block {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 24px;
  margin: 16px 0;
}

.form-example {
  max-width: 400px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: inline-block;
  width: 80px;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-actions {
  text-align: right;
  margin-top: 24px;
}

.form-actions ld-button {
  margin-left: 8px;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.button-groups, .input-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.button-group, .input-group {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.button-group h4, .input-group h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.button-group ld-button, .input-group ld-input {
  margin: 4px 8px 4px 0;
}

.input-group ld-input {
  display: block;
  margin: 8px 0;
}
</style>
