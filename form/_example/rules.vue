<template>
  <div>
    <Space>
      <span>是否显示必填星号：</span>
      <Switch v-model="requiredMark"></Switch>
    </Space>
    <h4>统一设置校验信息</h4>
    <LDesignForm
      ref="formEl"
      :options="options"
      :rules="rules"
      :requiredMark="requiredMark"
    />

    <Button @click="validate">校验</Button>

    <h4>单独设置校验信息</h4>
    <LDesignForm
      :options="options1"
      :requiredMark="requiredMark"
    />
  </div>
</template>
<script lang="ts" setup>
import { Input, RadioGroup, Space, Switch, Button } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref } from 'vue';

const formEl = ref(null)
const requiredMark = ref(true)

const rules: any = {
  name: [{
    required: true,
    message: '姓名不能为空',
    trigger: 'submit' // blur, change, all, submit
  }]
}

const options = ref<any[]>([{
  label: '姓名',
  component: Input,
  name: 'name',
  props: {
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
  }]
  }
}, {
  label: '姓名1',
  component: Input,
  name: 'name1'
}, {
  label: '姓名2',
  component: Input,
  name: 'name2'
}])

const options1 = ref<any[]>([{
  label: '姓名',
  component: Input,
  name: 'name',
  rules: [{
    required: true,
    message: '姓名不能为空',
    trigger: 'submit'
  }]
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


async function validate () {
  const res = await formEl.value?.validate()
  console.log(res)
}

</script>