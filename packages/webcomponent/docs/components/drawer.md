# Drawer 抽屉

抽屉组件是一个从屏幕边缘滑出的面板，常用于显示导航菜单、表单、详情信息等内容。

## 演示示例

<demo-block>
<div class="drawer-demo">
  <h3>基础用法</h3>
  <p>点击按钮打开抽屉</p>
  <button class="demo-btn" onclick="document.getElementById('drawer-basic').visible = true">打开抽屉</button>
  
  <ldesign-drawer 
    id="drawer-basic"
    drawer-title="基础抽屉"
    placement="right">
    <div style="padding: 20px;">
      <h4>这是抽屉内容</h4>
      <p>可以放置任何内容</p>
    </div>
  </ldesign-drawer>
</div>
</demo-block>

<demo-block>
<div class="drawer-demo">
  <h3>不同方向</h3>
  <p>抽屉可以从四个方向弹出</p>
  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
    <button class="demo-btn" onclick="document.getElementById('drawer-left').visible = true">从左侧打开</button>
    <button class="demo-btn" onclick="document.getElementById('drawer-right').visible = true">从右侧打开</button>
    <button class="demo-btn" onclick="document.getElementById('drawer-top').visible = true">从顶部打开</button>
    <button class="demo-btn" onclick="document.getElementById('drawer-bottom').visible = true">从底部打开</button>
  </div>
  
  <ldesign-drawer 
    id="drawer-left"
    drawer-title="左侧抽屉"
    placement="left">
    <div style="padding: 20px;">从左侧滑入</div>
  </ldesign-drawer>
  
  <ldesign-drawer 
    id="drawer-right"
    drawer-title="右侧抽屉"
    placement="right">
    <div style="padding: 20px;">从右侧滑入</div>
  </ldesign-drawer>
  
  <ldesign-drawer 
    id="drawer-top"
    drawer-title="顶部抽屉"
    placement="top">
    <div style="padding: 20px;">从顶部滑入</div>
  </ldesign-drawer>
  
  <ldesign-drawer 
    id="drawer-bottom"
    drawer-title="底部抽屉"
    placement="bottom">
    <div style="padding: 20px;">从底部滑入</div>
  </ldesign-drawer>
</div>
</demo-block>

<demo-block>
<div class="drawer-demo">
  <h3>不同尺寸</h3>
  <p>预设尺寸：xs(200px)、sm(300px)、md(400px)、lg(600px)、xl(800px)</p>
  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
    <button class="demo-btn" onclick="document.getElementById('drawer-xs').visible = true">超小 (xs)</button>
    <button class="demo-btn" onclick="document.getElementById('drawer-sm').visible = true">小 (sm)</button>
    <button class="demo-btn" onclick="document.getElementById('drawer-md').visible = true">中 (md)</button>
    <button class="demo-btn" onclick="document.getElementById('drawer-lg').visible = true">大 (lg)</button>
    <button class="demo-btn" onclick="document.getElementById('drawer-xl').visible = true">超大 (xl)</button>
  </div>
  
  <ldesign-drawer id="drawer-xs" drawer-title="超小抽屉" size="xs">
    <div style="padding: 20px;">宽度 200px</div>
  </ldesign-drawer>
  
  <ldesign-drawer id="drawer-sm" drawer-title="小型抽屉" size="sm">
    <div style="padding: 20px;">宽度 300px</div>
  </ldesign-drawer>
  
  <ldesign-drawer id="drawer-md" drawer-title="中型抽屉" size="md">
    <div style="padding: 20px;">宽度 400px (默认)</div>
  </ldesign-drawer>
  
  <ldesign-drawer id="drawer-lg" drawer-title="大型抽屉" size="lg">
    <div style="padding: 20px;">宽度 600px</div>
  </ldesign-drawer>
  
  <ldesign-drawer id="drawer-xl" drawer-title="超大抽屉" size="xl">
    <div style="padding: 20px;">宽度 800px</div>
  </ldesign-drawer>
</div>
</demo-block>

<demo-block>
<div class="drawer-demo">
  <h3>自定义尺寸</h3>
  <p>支持像素和百分比</p>
  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
    <button class="demo-btn" onclick="document.getElementById('drawer-500px').visible = true">500px</button>
    <button class="demo-btn" onclick="document.getElementById('drawer-50').visible = true">50%</button>
    <button class="demo-btn" onclick="document.getElementById('drawer-full').visible = true">全屏</button>
  </div>
  
  <ldesign-drawer id="drawer-500px" drawer-title="500px 抽屉" size="500px">
    <div style="padding: 20px;">自定义宽度 500px</div>
  </ldesign-drawer>
  
  <ldesign-drawer id="drawer-50" drawer-title="50% 抽屉" size="50%">
    <div style="padding: 20px;">宽度为视口的 50%</div>
  </ldesign-drawer>
  
  <ldesign-drawer id="drawer-full" drawer-title="全屏抽屉" size="full">
    <div style="padding: 20px;">全屏显示</div>
  </ldesign-drawer>
</div>
</demo-block>

<demo-block>
<div class="drawer-demo">
  <h3>暗黑主题</h3>
  <p>使用暗色主题</p>
  <button class="demo-btn" onclick="document.getElementById('drawer-dark').visible = true">打开暗黑抽屉</button>
  
  <ldesign-drawer 
    id="drawer-dark"
    drawer-title="暗黑主题"
    theme="dark">
    <div style="padding: 20px;">暗黑主题的抽屉</div>
  </ldesign-drawer>
</div>
</demo-block>

<demo-block>
<div class="drawer-demo">
  <h3>自定义头部</h3>
  <p>使用插槽自定义头部内容</p>
  <button class="demo-btn" onclick="document.getElementById('drawer-custom-header').visible = true">打开抽屉</button>
  
  <ldesign-drawer id="drawer-custom-header">
    <div slot="header" style="padding: 16px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); color: white;">
      <h3 style="margin: 0;">🎨 自定义头部</h3>
      <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.9;">这是完全自定义的头部内容</p>
    </div>
    <div style="padding: 20px;">抽屉内容</div>
  </ldesign-drawer>
</div>
</demo-block>

<demo-block>
<div class="drawer-demo">
  <h3>带副标题和图标</h3>
  <p>显示副标题和返回按钮</p>
  <button class="demo-btn" onclick="document.getElementById('drawer-subtitle').visible = true">打开抽屉</button>
  
  <ldesign-drawer 
    id="drawer-subtitle"
    drawer-title="用户详情"
    subtitle="查看和编辑用户信息"
    icon="📋"
    show-back>
    <div style="padding: 20px;">
      <p><strong>姓名：</strong>张三</p>
      <p><strong>邮箱：</strong>zhangsan@example.com</p>
      <p><strong>角色：</strong>管理员</p>
    </div>
  </ldesign-drawer>
</div>
</demo-block>

<demo-block>
<div class="drawer-demo">
  <h3>自定义底部</h3>
  <p>使用插槽自定义底部内容</p>
  <button class="demo-btn" onclick="document.getElementById('drawer-custom-footer').visible = true">打开抽屉</button>
  
  <ldesign-drawer 
    id="drawer-custom-footer"
    drawer-title="表单抽屉">
    <div style="padding: 20px;">
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">姓名</label>
        <input type="text" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">邮箱</label>
        <input type="email" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
      </div>
    </div>
    <div slot="footer" style="padding: 16px; display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid #e5e5e5;">
      <button class="demo-btn-secondary" onclick="document.getElementById('drawer-custom-footer').visible = false">取消</button>
      <button class="demo-btn" onclick="alert('提交成功！'); document.getElementById('drawer-custom-footer').visible = false">提交</button>
    </div>
  </ldesign-drawer>
</div>
</demo-block>

## API

### 属性 (Props)

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | `boolean` | `false` | 是否显示抽屉 |
| placement | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | 抽屉位置 |
| size | `string \| number` | `'md'` | 抽屉大小，可选: xs/sm/md/lg/xl/full 或自定义 |
| mask | `boolean` | `true` | 是否显示遮罩 |
| mask-closable | `boolean` | `true` | 点击遮罩是否关闭 |
| closable | `boolean` | `true` | 是否显示关闭按钮 |
| drawer-title | `string` | - | 抽屉标题 |
| subtitle | `string` | - | 副标题 |
| icon | `string` | - | 标题图标 |
| show-back | `boolean` | `false` | 是否显示返回按钮 |
| theme | `'light' \| 'dark'` | `'light'` | 主题 |
| z-index | `number` | `1000` | 层级 |
| animation | `boolean` | `true` | 是否启用动画 |
| animation-duration | `number` | `300` | 动画持续时间（ms） |
| resizable | `boolean` | `false` | 是否可调整大小 |
| min-size | `string \| number` | `200` | 最小尺寸 |
| max-size | `string \| number` | `'90%'` | 最大尺寸 |
| swipe-to-close | `boolean` | `false` | 是否启用滑动关闭 |
| close-on-esc | `boolean` | `true` | 按 ESC 关闭 |
| auto-focus | `boolean` | `true` | 自动聚焦 |
| lock-scroll | `boolean` | `true` | 是否锁定页面滚动 |

### 方法 (Methods)

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| open() | - | `Promise<void>` | 打开抽屉 |
| close(reason?) | `string` | `Promise<void>` | 关闭抽屉 |
| toggle() | - | `Promise<void>` | 切换显示状态 |
| resize(size) | `string \| number` | `Promise<void>` | 调整大小 |
| minimize() | - | `Promise<void>` | 最小化 |
| maximize() | - | `Promise<void>` | 最大化 |
| restore() | - | `Promise<void>` | 恢复 |

### 事件 (Events)

| 事件 | 参数 | 说明 |
|------|------|------|
| drawerBeforeOpen | - | 打开前触发 |
| drawerOpen | - | 打开后触发 |
| drawerBeforeClose | `{ reason: string }` | 关闭前触发 |
| drawerClose | `{ reason: string }` | 关闭后触发 |
| drawerStateChange | `{ state: DrawerState }` | 状态变化时触发 |
| drawerResize | `{ width: number, height: number }` | 大小变化时触发 |

### 插槽 (Slots)

| 插槽 | 说明 |
|------|------|
| (default) | 抽屉主内容区域 |
| header | 自定义头部内容 |
| footer | 自定义底部内容 |
| extra | 头部右侧额外内容 |

## 使用示例

```javascript
// 获取 drawer 元素
const drawer = document.getElementById('my-drawer');

// 打开抽屉
drawer.visible = true;
// 或
await drawer.open();

// 关闭抽屉
drawer.visible = false;
// 或
await drawer.close();

// 切换状态
await drawer.toggle();

// 监听事件
drawer.addEventListener('drawerOpen', () => {
  console.log('抽屉已打开');
});

drawer.addEventListener('drawerClose', (e) => {
  console.log('关闭原因:', e.detail.reason);
});
```

## 重要提示

⚠️ **关于布尔属性的正确用法**：

```html
<!-- ✅ 正确：不设置属性表示 false（默认） -->
<ldesign-drawer id="drawer1" drawer-title="示例"></ldesign-drawer>

<!-- ✅ 正确：只写属性名表示 true -->
<ldesign-drawer id="drawer2" visible drawer-title="示例"></ldesign-drawer>

<!-- ❌ 错误：不要使用 visible="false"，字符串 "false" 会被当作 true -->
<ldesign-drawer id="drawer3" visible="false" drawer-title="示例"></ldesign-drawer>
```

对于所有布尔类型的属性（如 `visible`, `mask`, `closable`, `resizable` 等），都应遵循这个规则。

<style>
.drawer-demo {
  padding: 20px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.demo-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.demo-btn:hover {
  background: #40a9ff;
}

.demo-btn-secondary {
  padding: 8px 16px;
  background: #f0f0f0;
  color: #333;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.demo-btn-secondary:hover {
  background: #e8e8e8;
}
</style>