# Table 表格

展示行列数据。

## 基础用法

基础的表格展示用法。

<div class="demo-container">
  <div class="demo-title">基础表格</div>
  <div class="demo-description">最简单的表格用法。</div>
  <div class="demo-showcase">
    <ld-table id="basic-table"></ld-table>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const table = document.getElementById('basic-table');
        if (table) {
          table.columns = [
            { key: 'name', title: '姓名', dataIndex: 'name' },
            { key: 'age', title: '年龄', dataIndex: 'age' },
            { key: 'address', title: '地址', dataIndex: 'address' }
          ];
          table.data = [
            { name: '张三', age: 32, address: '北京市朝阳区' },
            { name: '李四', age: 42, address: '上海市浦东新区' },
            { name: '王五', age: 32, address: '深圳市南山区' }
          ];
        }
      });
    </script>
  </div>
  <div class="demo-code">

```html
<ld-table id="basic-table"></ld-table>
<script>
  const table = document.getElementById('basic-table');
  table.columns = [
    { key: 'name', title: '姓名', dataIndex: 'name' },
    { key: 'age', title: '年龄', dataIndex: 'age' },
    { key: 'address', title: '地址', dataIndex: 'address' }
  ];
  table.data = [
    { name: '张三', age: 32, address: '北京市朝阳区' },
    { name: '李四', age: 42, address: '上海市浦东新区' },
    { name: '王五', age: 32, address: '深圳市南山区' }
  ];
</script>
```

  </div>
</div>

## 带边框表格

添加表格边框。

<div class="demo-container">
  <div class="demo-title">带边框表格</div>
  <div class="demo-description">通过 bordered 属性添加表格边框。</div>
  <div class="demo-showcase">
    <ld-table id="bordered-table" bordered></ld-table>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const table = document.getElementById('bordered-table');
        if (table) {
          table.columns = [
            { key: 'name', title: '姓名', dataIndex: 'name' },
            { key: 'age', title: '年龄', dataIndex: 'age' },
            { key: 'address', title: '地址', dataIndex: 'address' }
          ];
          table.data = [
            { name: '张三', age: 32, address: '北京市朝阳区' },
            { name: '李四', age: 42, address: '上海市浦东新区' },
            { name: '王五', age: 32, address: '深圳市南山区' }
          ];
        }
      });
    </script>
  </div>
  <div class="demo-code">

```html
<ld-table bordered></ld-table>
```

  </div>
</div>

## 斑马纹表格

使用斑马纹表格。

<div class="demo-container">
  <div class="demo-title">斑马纹表格</div>
  <div class="demo-description">通过 striped 属性设置斑马纹。</div>
  <div class="demo-showcase">
    <ld-table id="striped-table" striped></ld-table>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const table = document.getElementById('striped-table');
        if (table) {
          table.columns = [
            { key: 'name', title: '姓名', dataIndex: 'name' },
            { key: 'age', title: '年龄', dataIndex: 'age' },
            { key: 'address', title: '地址', dataIndex: 'address' }
          ];
          table.data = [
            { name: '张三', age: 32, address: '北京市朝阳区' },
            { name: '李四', age: 42, address: '上海市浦东新区' },
            { name: '王五', age: 32, address: '深圳市南山区' },
            { name: '赵六', age: 28, address: '广州市天河区' },
            { name: '钱七', age: 35, address: '杭州市西湖区' }
          ];
        }
      });
    </script>
  </div>
  <div class="demo-code">

```html
<ld-table striped></ld-table>
```

  </div>
</div>

## 不同尺寸

表格有三种尺寸。

<div class="demo-container">
  <div class="demo-title">不同尺寸</div>
  <div class="demo-description">通过 size 属性设置表格尺寸。</div>
  <div class="demo-showcase vertical">
    <div>
      <h4>大尺寸</h4>
      <ld-table id="large-table" size="large"></ld-table>
    </div>
    <div style="margin-top: 20px;">
      <h4>中尺寸（默认）</h4>
      <ld-table id="medium-table" size="medium"></ld-table>
    </div>
    <div style="margin-top: 20px;">
      <h4>小尺寸</h4>
      <ld-table id="small-table" size="small"></ld-table>
    </div>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const data = [
          { name: '张三', age: 32, address: '北京市朝阳区' },
          { name: '李四', age: 42, address: '上海市浦东新区' }
        ];
        const columns = [
          { key: 'name', title: '姓名', dataIndex: 'name' },
          { key: 'age', title: '年龄', dataIndex: 'age' },
          { key: 'address', title: '地址', dataIndex: 'address' }
        ];
        
        ['large-table', 'medium-table', 'small-table'].forEach(id => {
          const table = document.getElementById(id);
          if (table) {
            table.columns = columns;
            table.data = data;
          }
        });
      });
    </script>
  </div>
  <div class="demo-code">

```html
<ld-table size="large"></ld-table>
<ld-table size="medium"></ld-table>
<ld-table size="small"></ld-table>
```

  </div>
</div>

## 加载状态

表格加载状态。

<div class="demo-container">
  <div class="demo-title">加载状态</div>
  <div class="demo-description">表格数据加载中的状态。</div>
  <div class="demo-showcase">
    <ld-table id="loading-table" loading></ld-table>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const table = document.getElementById('loading-table');
        if (table) {
          table.columns = [
            { key: 'name', title: '姓名', dataIndex: 'name' },
            { key: 'age', title: '年龄', dataIndex: 'age' },
            { key: 'address', title: '地址', dataIndex: 'address' }
          ];
        }
      });
    </script>
  </div>
  <div class="demo-code">

```html
<ld-table loading></ld-table>
```

  </div>
</div>

## 空数据

表格空数据状态。

<div class="demo-container">
  <div class="demo-title">空数据</div>
  <div class="demo-description">表格没有数据时的状态。</div>
  <div class="demo-showcase">
    <ld-table id="empty-table" empty-text="暂无数据"></ld-table>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const table = document.getElementById('empty-table');
        if (table) {
          table.columns = [
            { key: 'name', title: '姓名', dataIndex: 'name' },
            { key: 'age', title: '年龄', dataIndex: 'age' },
            { key: 'address', title: '地址', dataIndex: 'address' }
          ];
          table.data = [];
        }
      });
    </script>
  </div>
  <div class="demo-code">

```html
<ld-table empty-text="暂无数据"></ld-table>
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
      <td><code>columns</code></td>
      <td>表格列的配置描述</td>
      <td><code>ColumnConfig[]</code></td>
      <td><code>[]</code></td>
    </tr>
    <tr>
      <td><code>data</code></td>
      <td>数据数组</td>
      <td><code>any[]</code></td>
      <td><code>[]</code></td>
    </tr>
    <tr>
      <td><code>loading</code></td>
      <td>页面是否加载中</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>bordered</code></td>
      <td>是否展示外边框和列边框</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>striped</code></td>
      <td>是否显示斑马纹</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>row-selection</code></td>
      <td>表格行是否可选择</td>
      <td><code>object</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>pagination</code></td>
      <td>分页器配置</td>
      <td><code>object | false</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td>表格大小</td>
      <td><code>'small' | 'medium' | 'large'</code></td>
      <td><code>'medium'</code></td>
    </tr>
    <tr>
      <td><code>empty-text</code></td>
      <td>空数据时显示的文本</td>
      <td><code>string</code></td>
      <td><code>'暂无数据'</code></td>
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
      <td><code>ldSelectionChange</code></td>
      <td>选中项发生变化时的回调</td>
      <td><code>(selectedRowKeys: string[], selectedRows: any[]) => void</code></td>
    </tr>
    <tr>
      <td><code>ldSort</code></td>
      <td>点击排序时触发</td>
      <td><code>(sorter: object) => void</code></td>
    </tr>
    <tr>
      <td><code>ldFilter</code></td>
      <td>筛选时触发</td>
      <td><code>(filters: object) => void</code></td>
    </tr>
    <tr>
      <td><code>ldPageChange</code></td>
      <td>页码改变的回调</td>
      <td><code>(page: number, pageSize: number) => void</code></td>
    </tr>
  </tbody>
</table>

### ColumnConfig

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
      <td><code>key</code></td>
      <td>列的唯一标识</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>title</code></td>
      <td>列头显示文字</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>dataIndex</code></td>
      <td>列数据在数据项中对应的路径</td>
      <td><code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>width</code></td>
      <td>列宽度</td>
      <td><code>string | number</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td><code>align</code></td>
      <td>设置列的对齐方式</td>
      <td><code>'left' | 'right' | 'center'</code></td>
      <td><code>'left'</code></td>
    </tr>
    <tr>
      <td><code>sortable</code></td>
      <td>是否可排序</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>filterable</code></td>
      <td>是否可筛选</td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>render</code></td>
      <td>生成复杂数据的渲染函数</td>
      <td><code>(value: any, record: any, index: number) => any</code></td>
      <td>-</td>
    </tr>
  </tbody>
</table>
