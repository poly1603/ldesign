<template>
  <div>
    <Space align="center" style="margin-bottom: 16px;">
      <span>间隔：</span>
      <InputNumber v-model="gutter"/>
      <span>内部间隔：</span>
      <InputNumber v-model="space"/>
    </Space>
    <LDesignForm
      :options="options"
      :gutter="gutter"
      :space="space"
    />
  </div>
</template>
<script lang="ts" setup>
import { Input, InputNumber, RadioGroup, Space } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref } from 'vue';

const gutter = ref(16)
const space = ref(8)

const options = ref([{
  label: '姓名',
  component: Input,
  name: 'name'
}, {
  label: '性别',
  component: Input,
  name: 'sex',
}, {
  label: '爱好',
  component: Input,
  name: 'hobby',
}, {
  label: '地址',
  component: Input,
  name: 'address',
}])

</script>