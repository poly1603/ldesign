<template>
  <div>
    <Space style="margin-bottom: 16px;">
      <span>按钮对齐方式</span>
      <RadioGroup
        v-model="buttonAlign"
      >
        <Radio value="left">左对齐</Radio>
        <Radio value="center">居中对齐</Radio>
        <Radio value="right">右对齐</Radio>
        <Radio value="justify">两端对齐</Radio>
      </RadioGroup>
    </Space>
    <LDesignForm
      :options="options"
      :buttonAlign="buttonAlign"
    />
  </div>
</template>
<script lang="ts" setup>
import { Input, RadioGroup, Space, Radio } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref } from 'vue';

const buttonAlign = ref<any>('right')

const options = ref<any[]>([{
  label: '姓名',
  component: Input,
  name: 'name'
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