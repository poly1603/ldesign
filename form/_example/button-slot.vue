<template>
  <div>
    <h4>插槽方式</h4>
    <LDesignForm
      :options="options"
      :preview-rows="1"
      @submit="onSubmit"
    >
      <template #button="{submit, reset, visible, expand}">
        <Button variant="text" @click="expand">{{ visible ? '收起' : '展开' }}</Button>
        <Button theme="default" variant="outline" @click="reset">重置</Button>
        <Button @click="submit">提交</Button>
      </template>
    </LDesignForm>
    <h4>函数方式</h4>
    <LDesignForm
      :options="options"
      :button="renderCustomButtons"
      :preview-rows="1"
      @submit="onSubmit"
    >
    </LDesignForm>
  </div>
</template>
<script lang="tsx" setup>
import { Input, RadioGroup, Button } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref } from 'vue';


const options = ref([{
  label: '姓名',
  component: Input,
  name: 'name'
}, {
  label: '姓名1',
  component: Input,
  name: 'name1'
}, {
  label: '姓名2',
  component: Input,
  name: 'name2'
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

function renderCustomButtons (_, ctx) {
  return (
    <>
      <Button variant="text" onClick={ctx.expand}>{ctx.visible ? '收起' : '展开'}</Button>
      <Button onClick={ctx.reset} variant="outline" theme="default">重置</Button>
      <Button onClick={ctx.submit}>提交</Button>
    </>
  )
}

function onSubmit (value, ctx) {
  console.log(value, ctx)
}

</script>