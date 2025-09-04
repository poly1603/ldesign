<template>
  <div>
    <Space style="margin-bottom: 16px;">
      <span>标题对齐方式</span>
      <RadioGroup
        v-model="labelAlign"
      >
        <Radio value="left">靠左</Radio>
        <Radio value="right">靠右</Radio>
        <Radio value="top">头部</Radio>
      </RadioGroup>
    </Space>
    <LDesignForm
      :options="options"
      :labelAlign="labelAlign"
    />
  </div>
</template>
<script lang="ts" setup>
import { Input, RadioGroup, Space, Radio } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref } from 'vue';

const labelAlign = ref<any>('left')

const options = ref([{
  label: '姓名',
  component: Input,
  name: 'name'
}, {
  label: '超级长的标题',
  component: Input,
  name: 'name1'
}, {
  label: '我的字数',
  component: Input,
  name: 'name2'
}, {
  label: '性别',
  component: RadioGroup,
  name: 'sex',
  props: {
      options: [{
      label: '男',
      value: '0'
    }, {
      label: '女',
      value: '1'
    }]
  }
}])

</script>