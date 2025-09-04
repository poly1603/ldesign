<template>
  <div>
    <Space style="margin-bottom: 16px;">
      <span>展开方式：</span>
      <RadioGroup
        v-model="expandType"
      >
        <Radio value="visible">显示隐藏</Radio>
        <Radio value="popup">弹窗</Radio>
      </RadioGroup>
    </Space>
    <LDesignForm
      :previewRows="previewRows"
      :options="options"
      :expandType="expandType"
      ref="form"
    />
  </div>
</template>
<script lang="ts" setup>
import { DatePicker, Input, RadioGroup, Select, Space, Radio, Button } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import type {LDesignFormOptions, LDesignFormExpandType} from '@ldesign/form'
import { ref } from 'vue';

const form = ref(null)

function reset () {
  form.value.reset()
}

const previewRows = ref(1)
const expandType= ref<LDesignFormExpandType>('visible')
const options = ref<LDesignFormOptions[]>([{
  label: '姓名',
  component: Input,
  name: 'name',
  props: {
    value: '12',
    defaultValue: '11'
  }
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
    }],
    defaultValue: '1'
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
  component: Input,
  props: {
    defaultValue: ''
  }
}, {
  label: 'QQ',
  name: 'qq',
  component: Input,
  props: {
    defaultValue: ''
  }
}])

</script>