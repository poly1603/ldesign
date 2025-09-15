# 组件测试页面

这个页面用于测试所有组件是否正常渲染。

## Button 按钮

<l-button>默认按钮</l-button>
<l-button type="primary">主要按钮</l-button>
<l-button type="success">成功按钮</l-button>
<l-button type="warning">警告按钮</l-button>
<l-button type="error">错误按钮</l-button>

## Input 输入框

<l-input placeholder="请输入内容" />
<l-input type="password" placeholder="请输入密码" />

## Checkbox 复选框

<l-checkbox v-model="checkboxValue1" label="选项1" />
<l-checkbox v-model="checkboxValue2" label="选项2" />
<l-checkbox v-model="checkboxValue3" label="禁用选项" disabled />

## Radio 单选框

<l-radio v-model="radioValue" value="option1" label="选项1" />
<l-radio v-model="radioValue" value="option2" label="选项2" />
<l-radio v-model="radioValue" value="option3" label="选项3" />

## Switch 开关

<l-switch v-model="switchValue1" />
<l-switch v-model="switchValue2" disabled />
<l-switch v-model="switchValue3" loading />

## Alert 警告提示

<l-alert type="info" title="信息提示" description="这是一条信息提示" />
<l-alert type="success" title="成功提示" description="这是一条成功提示" />
<l-alert type="warning" title="警告提示" description="这是一条警告提示" />
<l-alert type="error" title="错误提示" description="这是一条错误提示" />

## Card 卡片

<l-card title="卡片标题">
  <p>这是卡片的内容区域。</p>
  <template #footer>
    <l-button type="primary">确定</l-button>
    <l-button>取消</l-button>
  </template>
</l-card>

## Loading 加载

<l-loading text="加载中..." />

## Badge 徽标

<l-badge value="5">
  <l-button>消息</l-button>
</l-badge>

<l-badge value="99+" type="error">
  <l-button>通知</l-button>
</l-badge>

## Tag 标签

<l-tag>默认标签</l-tag>
<l-tag type="primary">主要标签</l-tag>
<l-tag type="success">成功标签</l-tag>
<l-tag type="warning">警告标签</l-tag>
<l-tag type="error">错误标签</l-tag>

## Select 选择器

<l-select
  placeholder="请选择"
  :options="selectOptions"
/>

<script setup>
import { ref } from 'vue'

const checkboxValue1 = ref(false)
const checkboxValue2 = ref(true)
const checkboxValue3 = ref(false)
const radioValue = ref('option1')
const switchValue1 = ref(false)
const switchValue2 = ref(true)
const switchValue3 = ref(false)

const selectOptions = ref([
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' },
  { value: '3', label: '选项3' }
])
</script>

<style>
.ld-button {
  margin-right: 8px;
  margin-bottom: 8px;
}

.ld-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.ld-badge {
  margin-right: 16px;
}

.ld-input {
  margin-bottom: 16px;
  width: 200px;
}

.ld-select {
  width: 200px;
}

.ld-card {
  margin: 16px 0;
  max-width: 400px;
}
</style>
