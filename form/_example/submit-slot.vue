<template>
  <div>
    <h4>插槽方式</h4>
    <LDesignForm
      :options="options"
      @submit="onSubmit"
    >
      <template #submit="{submit}">
        <Button @click="submit">submit</Button>
      </template>
    </LDesignForm>
    <h4>属性方式</h4>
    <LDesignForm
      :options="options"
      :submit="`submit`"
      @submit="onSubmit"
    >
    </LDesignForm>
    <br/>
    <LDesignForm
      :options="options"
      :submit="{
        default: 'submit'
      }"
      @submit="onSubmit"
    ></LDesignForm>
    <h4>函数方式</h4>
    <LDesignForm
      :options="options"
      :submit="renderCustomSubmit"
      @submit="onSubmit"
    >
    </LDesignForm>
    <h4>不显示提交按钮</h4>
    <LDesignForm
      :options="options"
      :submit="false"
      @submit="onSubmit"
    >
    </LDesignForm>
  </div>
</template>
<script lang="tsx" setup>
import { Input, RadioGroup, Button } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref } from 'vue';


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

function renderCustomSubmit (_, ctx) {
  return (
    <Button onClick={ctx.submit}>submit</Button>
  )
}

function onSubmit (value, ctx) {
  console.log(value, ctx)
}

</script>