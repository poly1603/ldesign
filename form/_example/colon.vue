<template>
  <div>
    <Space style="margin-bottom: 16px;">
      <span>是否显示冒号：</span>
      <Switch v-model="colon"></Switch>
    </Space>
    <LDesignForm
      :options="options"
      :colon="colon"
    />
  </div>
</template>
<script lang="ts" setup>
import { Input, RadioGroup, Space, Switch } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref } from 'vue';

const colon = ref(false)
const options = ref([{
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