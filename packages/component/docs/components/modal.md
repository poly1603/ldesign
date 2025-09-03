# Modal 模态框

模态对话框。

## 基础用法

最简单的用法。

<Demo 
  title="基础模态框" 
  description="点击按钮打开模态框。"
  :code='`<ld-button type="primary" onclick="document.querySelector(&quot;#modal1&quot;).open = true">打开模态框</ld-button>
<ld-modal id="modal1" title="基础模态框">
  <p>这里是模态框的内容。</p>
</ld-modal>`'
>
  <ld-button type="primary" onclick="showModal('demo-modal-1')">打开模态框</ld-button>
  <ld-modal id="demo-modal-1" title="基础模态框">
    <p>这里是模态框的内容。</p>
    <div slot="footer">
      <ld-button type="primary" size="small" onclick="closeModal('demo-modal-1')">确定</ld-button>
      <ld-button size="small" onclick="closeModal('demo-modal-1')">取消</ld-button>
    </div>
  </ld-modal>
</Demo>

## 自定义页脚

可以自定义页脚按钮。

<div class="demo-container">
  <div class="demo-title">自定义页脚</div>
  <div class="demo-description">自定义页脚按钮内容。</div>
  <div class="demo-showcase">
    <ld-button type="primary" onclick="document.getElementById('custom-footer-modal').visible = true">自定义页脚</ld-button>
    <ld-modal id="custom-footer-modal" modal-title="自定义页脚" ok-text="保存" cancel-text="关闭">
      <p>这是模态框的内容</p>
      <p>页脚按钮文本已自定义</p>
    </ld-modal>
  </div>
  <div class="demo-code">

```html
<ld-modal modal-title="自定义页脚" ok-text="保存" cancel-text="关闭">
  <p>这是模态框的内容</p>
  <p>页脚按钮文本已自定义</p>
</ld-modal>
```

  </div>
</div>

## 隐藏页脚

可以隐藏默认的页脚。

<div class="demo-container">
  <div class="demo-title">隐藏页脚</div>
  <div class="demo-description">隐藏默认页脚，完全自定义内容。</div>
  <div class="demo-showcase">
    <ld-button type="primary" onclick="document.getElementById('no-footer-modal').visible = true">隐藏页脚</ld-button>
    <ld-modal id="no-footer-modal" modal-title="隐藏页脚" hide-footer>
      <p>这是模态框的内容</p>
      <p>没有默认的页脚按钮</p>
      <div style="text-align: right; margin-top: 20px;">
        <ld-button onclick="document.getElementById('no-footer-modal').visible = false">关闭</ld-button>
      </div>
    </ld-modal>
  </div>
  <div class="demo-code">

```html
<ld-modal modal-title="隐藏页脚" hide-footer>
  <p>这是模态框的内容</p>
  <p>没有默认的页脚按钮</p>
  <div style="text-align: right; margin-top: 20px;">
    <ld-button onclick="this.closest('ld-modal').visible = false">关闭</ld-button>
  </div>
</ld-modal>
```

  </div>
</div>

## 不同尺寸

模态框有不同的尺寸。

<div class="demo-container">
  <div class="demo-title">不同尺寸</div>
  <div class="demo-description">可以设置不同的宽度和高度。</div>
  <div class="demo-showcase">
    <ld-button onclick="document.getElementById('small-modal').visible = true">小尺寸</ld-button>
    <ld-button onclick="document.getElementById('medium-modal').visible = true">中尺寸</ld-button>
    <ld-button onclick="document.getElementById('large-modal').visible = true">大尺寸</ld-button>
    
    <ld-modal id="small-modal" modal-title="小尺寸模态框" width="400">
      <p>这是小尺寸的模态框</p>
    </ld-modal>
    
    <ld-modal id="medium-modal" modal-title="中尺寸模态框" width="600">
      <p>这是中尺寸的模态框</p>
    </ld-modal>
    
    <ld-modal id="large-modal" modal-title="大尺寸模态框" width="800">
      <p>这是大尺寸的模态框</p>
    </ld-modal>
  </div>
  <div class="demo-code">

```html
<ld-modal modal-title="小尺寸模态框" width="400">
  <p>这是小尺寸的模态框</p>
</ld-modal>

<ld-modal modal-title="中尺寸模态框" width="600">
  <p>这是中尺寸的模态框</p>
</ld-modal>

<ld-modal modal-title="大尺寸模态框" width="800">
  <p>这是大尺寸的模态框</p>
</ld-modal>
```

  </div>
</div>

## 居中显示

模态框可以垂直居中显示。

<div class="demo-container">
  <div class="demo-title">居中显示</div>
  <div class="demo-description">模态框在屏幕中央显示。</div>
  <div class="demo-showcase">
    <ld-button type="primary" onclick="document.getElementById('centered-modal').visible = true">居中显示</ld-button>
    <ld-modal id="centered-modal" modal-title="居中模态框" centered>
      <p>这个模态框在屏幕中央显示</p>
      <p>无论屏幕高度如何都会居中</p>
    </ld-modal>
  </div>
  <div class="demo-code">

```html
<ld-modal modal-title="居中模态框" centered>
  <p>这个模态框在屏幕中央显示</p>
  <p>无论屏幕高度如何都会居中</p>
</ld-modal>
```

  </div>
</div>

## 全屏模态框

模态框可以全屏显示。

<div class="demo-container">
  <div class="demo-title">全屏模态框</div>
  <div class="demo-description">模态框占满整个屏幕。</div>
  <div class="demo-showcase">
    <ld-button type="primary" onclick="document.getElementById('fullscreen-modal').visible = true">全屏模态框</ld-button>
    <ld-modal id="fullscreen-modal" modal-title="全屏模态框" fullscreen>
      <p>这是全屏模态框</p>
      <p>占满整个屏幕空间</p>
    </ld-modal>
  </div>
  <div class="demo-code">

```html
<ld-modal modal-title="全屏模态框" fullscreen>
  <p>这是全屏模态框</p>
  <p>占满整个屏幕空间</p>
</ld-modal>
```

  </div>
</div>

## 动画效果

模态框支持不同的动画效果。

<div class="demo-container">
  <div class="demo-title">动画效果</div>
  <div class="demo-description">不同的进入和退出动画。</div>
  <div class="demo-showcase">
    <ld-button onclick="document.getElementById('zoom-modal').visible = true">缩放动画</ld-button>
    <ld-button onclick="document.getElementById('slide-up-modal').visible = true">上滑动画</ld-button>
    <ld-button onclick="document.getElementById('slide-down-modal').visible = true">下滑动画</ld-button>
    <ld-button onclick="document.getElementById('fade-modal').visible = true">淡入动画</ld-button>
    
    <ld-modal id="zoom-modal" modal-title="缩放动画" animation="zoom">
      <p>缩放动画效果</p>
    </ld-modal>
    
    <ld-modal id="slide-up-modal" modal-title="上滑动画" animation="slide-up">
      <p>从下往上滑入</p>
    </ld-modal>
    
    <ld-modal id="slide-down-modal" modal-title="下滑动画" animation="slide-down">
      <p>从上往下滑入</p>
    </ld-modal>
    
    <ld-modal id="fade-modal" modal-title="淡入动画" animation="fade">
      <p>淡入淡出效果</p>
    </ld-modal>
  </div>
  <div class="demo-code">

```html
<ld-modal modal-title="缩放动画" animation="zoom">
  <p>缩放动画效果</p>
</ld-modal>

<ld-modal modal-title="上滑动画" animation="slide-up">
  <p>从下往上滑入</p>
</ld-modal>

<ld-modal modal-title="下滑动画" animation="slide-down">
  <p>从上往下滑入</p>
</ld-modal>

<ld-modal modal-title="淡入动画" animation="fade">
  <p>淡入淡出效果</p>
</ld-modal>
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
      <td><code>visible</code></td>
      <td>是否显示模态框</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>modal-title</code></td>
      <td>模态框标题</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>width</code></td>
      <td>模态框宽度</td>
      <td><code>string | number</code></td>
      <td><code>'520px'</code></td>
    </tr>
    <tr>
      <td><code>height</code></td>
      <td>模态框高度</td>
      <td><code>string | number</code></td>
      <td><code>'auto'</code></td>
    </tr>
    <tr>
      <td><code>mask-closable</code></td>
      <td>点击遮罩是否允许关闭</td>
      <td><code>boolean</code></td>
      <td><code>true</code></td>
    </tr>
    <tr>
      <td><code>closable</code></td>
      <td>是否显示右上角的关闭按钮</td>
      <td><code>boolean</code></td>
      <td><code>true</code></td>
    </tr>
    <tr>
      <td><code>centered</code></td>
      <td>是否垂直居中显示</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>fullscreen</code></td>
      <td>是否全屏显示</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>is-draggable</code></td>
      <td>是否可拖拽</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>resizable</code></td>
      <td>是否可调整大小</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>ok-text</code></td>
      <td>确认按钮文字</td>
      <td><code>string</code></td>
      <td><code>'确定'</code></td>
    </tr>
    <tr>
      <td><code>cancel-text</code></td>
      <td>取消按钮文字</td>
      <td><code>string</code></td>
      <td><code>'取消'</code></td>
    </tr>
    <tr>
      <td><code>ok-loading</code></td>
      <td>确认按钮 loading</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>hide-footer</code></td>
      <td>是否隐藏底部按钮</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>animation</code></td>
      <td>动画类型</td>
      <td><code>'zoom' | 'slide-up' | 'slide-down' | 'fade'</code></td>
      <td><code>'zoom'</code></td>
    </tr>
    <tr>
      <td><code>z-index</code></td>
      <td>设置 Modal 的 z-index</td>
      <td><code>number</code></td>
      <td><code>1000</code></td>
    </tr>
  </tbody>
</table>

<script setup>
// 全局模态框管理函数
if (typeof window !== 'undefined') {
  window.showModal = (id) => {
    const modal = document.getElementById(id)
    if (modal) {
      modal.open = true
    }
  }
  
  window.closeModal = (id) => {
    const modal = document.getElementById(id)
    if (modal) {
      modal.open = false
    }
  }
}
</script>

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
      <td><code>ldOk</code></td>
      <td>点击确定回调</td>
      <td><code>() => void</code></td>
    </tr>
    <tr>
      <td><code>ldCancel</code></td>
      <td>点击取消回调</td>
      <td><code>() => void</code></td>
    </tr>
    <tr>
      <td><code>ldClose</code></td>
      <td>点击关闭回调</td>
      <td><code>() => void</code></td>
    </tr>
    <tr>
      <td><code>ldShow</code></td>
      <td>模态框显示时触发</td>
      <td><code>() => void</code></td>
    </tr>
    <tr>
      <td><code>ldHide</code></td>
      <td>模态框隐藏时触发</td>
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
      <td>模态框内容</td>
    </tr>
    <tr>
      <td>title</td>
      <td>自定义标题</td>
    </tr>
    <tr>
      <td>footer</td>
      <td>自定义页脚内容</td>
    </tr>
  </tbody>
</table>
