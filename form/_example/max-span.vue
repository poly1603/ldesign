<template>
  <div>
    <Space style="margin-bottom: 16px;">
      <span>列宽：</span>
      <InputNumber :step="1" v-model="span"/>
    </Space>
    <LDesignForm
      :options="options"
      :span="span"
    />
    <Divider/>
    <LDesignForm
      :options="options"
      :minSpan="2"
    />
    <Divider/>
    <LDesignForm
      :options="options"
      :maxSpan="2"
    />
  </div>
</template>
<script lang="ts" setup>
import { Divider, Input, InputNumber, RadioGroup, Space } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref } from 'vue';

const span=ref(2)

const options = ref<any[]>([{
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