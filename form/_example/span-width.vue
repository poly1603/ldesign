<template>
  <div>
    <Space style="margin-bottom: 16px;">
      <span>列宽：</span>
      <InputNumber :step="30" v-model="spanWidth"/>
    </Space>
    <LDesignForm
      :options="options"
      :spanWidth="spanWidth"
    />
  </div>
</template>
<script lang="ts" setup>
import { Input, InputNumber, RadioGroup, Space } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref } from 'vue';

const spanWidth=ref(200)

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
}])

</script>