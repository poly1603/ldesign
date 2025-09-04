<template>
  <div>
    <Space style="margin-bottom: 16px;">
      <span>按钮组列数：</span>
      <InputNumber v-model="buttonSpan"/>
    </Space>
    <LDesignForm
      :options="options"
      buttonPosition="inline"
      :previewRows="1"
      :buttonSpan="buttonSpan"
    />
  </div>
</template>
<script lang="ts" setup>
import { Input, InputNumber, RadioGroup, Space } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref } from 'vue';

const buttonSpan = ref(1)

const options = ref<any[]>([{
  label: '姓名',
  component: Input,
  name: 'name',
}])

</script>