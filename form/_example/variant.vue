<template>
  <div>
    <Space style="margin-bottom: 16px;">
      <span>表单形式：</span>
      <RadioGroup
        v-model="variant"
      >
        <Radio value="default">默认表单</Radio>
        <Radio value="document">文档表单</Radio>
      </RadioGroup>
      <span>最大列数：</span>
      <InputNumber v-model="maxSpan"/>
    </Space>
    <LDesignForm
      :options="options"
      :variant="variant"
      :maxSpan="maxSpan"
    />
  </div>
</template>
<script lang="ts" setup>
import { DatePicker, Input, RadioGroup, Select, Space, Radio, InputNumber } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import type {LDesignFormOptions, LDesignFormVariant} from '@ldesign/form'
import { ref } from 'vue';

const variant= ref<LDesignFormVariant>('default')
const maxSpan = ref(2)
const options = ref<LDesignFormOptions[]>([{
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
}, {
  label: '爱好',
  component: Select,
  name: 'hobby',
  props: {
    options: [{
      label: '篮球',
      value: 'lanqiu'
    }]
  }
}, {
  label: '出生日期',
  name: 'birthday',
  component: DatePicker,
  style: {
    width: '100%'
  }
}, {
  label: '住址',
  name: 'address',
  component: Input
}, {
  label: 'QQ',
  name: 'qq',
  component: Input
}])

</script>