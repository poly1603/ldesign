<template>
  <div>
    <Space style="margin-bottom: 16px;">
      <span>按钮位置：</span>
      <RadioGroup
        v-model="buttonPosition"
      >
        <Radio value="inline">行内</Radio>
        <Radio value="block">独占一行</Radio>
      </RadioGroup>
      <span>按钮对齐方式：</span>
      <RadioGroup
        v-model="buttonAlign"
      >
        <Radio value="left">靠左</Radio>
        <Radio value="center">居中</Radio>
        <Radio value="right">靠右</Radio>
        <Radio value="justify">两端</Radio>
      </RadioGroup>
    </Space>
    <LDesignForm
      :options="options"
      :buttonPosition="buttonPosition"
      :preview-rows="1"
      :buttonAlign="buttonAlign"
    >
      <template #extraContent>
        <Button @click="onAdd">{{ !isVisible ? '显示删除' : '隐藏删除' }}</Button>
        <Button theme="danger" v-if="isVisible">删除</Button>
        
      </template>
    </LDesignForm>
  </div>
</template>
<script lang="ts" setup>
import { Input, RadioGroup, Button, Radio, Space } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref } from 'vue';

const buttonPosition = ref<any>('inline')
const buttonAlign = ref<any>('right')

const isVisible = ref(true)

const options = ref<any[]>([{
  label: '姓名',
  component: Input,
  name: 'name'
}, {
  label: '姓名1',
  component: Input,
  name: 'name1'
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
},{
  label: '姓名',
  component: Input,
  name: 'name'
},{
  label: '姓名',
  component: Input,
  name: 'name'
},{
  label: '姓名',
  component: Input,
  name: 'name'
}])

function onAdd () {
  isVisible.value = !isVisible.value
}
</script>