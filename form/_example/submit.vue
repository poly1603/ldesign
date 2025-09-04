<template>
  <div>
    <p>自带的提交</p>
    <LDesignForm :options="options" v-model="form" @submit="onSubmit"/>
    <p>通过submit插槽自定义，调用submit</p>
    <LDesignForm :options="options" v-model="form" @submit="onSubmit">
      <template #submit="{submit}">
        <Button @click="submit">提交</Button>
      </template>
    </LDesignForm>
    <Divider/>
    <p>通过submit插槽自定义，通过设置按钮的type为submit实现</p>
    <LDesignForm :options="options" v-model="form" @submit="onSubmit">
      <template #submit>
        <Button type="submit">提交</Button>
      </template>
    </LDesignForm>
    <Divider/>
    <p>通过button插槽自定义</p>
    <LDesignForm :options="options" v-model="form" @submit="onSubmit">
      <template #button="{submit}">
        <Button @click="submit">提交</Button>
      </template>
    </LDesignForm>
  </div>
</template>
<script lang="tsx" setup>
import { Input, RadioGroup, Button, Divider, MessagePlugin } from '@ldesign/desktop-next';
import { LDesignForm } from '@ldesign/form'
import { AddIcon } from '@ldesign/icons-vue-next';
import { LDesignPopFrame } from '@ldesign/layout';
import { ref, reactive } from 'vue';

const form = reactive({
  name: '',
  sex: '1',
  name1: ''
})

const options = ref<any[]>([{
  label: '姓名',
  component: Input,
  name: 'name',
  props: {
    suffixIcon: () => <AddIcon onClick={() => {
      form.name = 'test'
    }} />
  }
}, {
  label: '姓名1',
  component: Input,
  name: 'name1',
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
    }],
  }
}])

function onSubmit (v, ctx) {
  console.log(v, ctx)
  MessagePlugin.info('表单提交')
}

</script>