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
    </Space>
    <LDesignForm
      :options="options"
      :buttonPosition="buttonPosition"
      :spanWidth="260"
    />
  </div>
</template>
<script lang="ts" setup>
import { Input, RadioGroup, Space, Radio } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref } from 'vue';

const buttonPosition = ref<any>('inline')

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