<template>
  <div>
    <p>自带的提交</p>
    <LDesignForm :options="options" v-model="form" @reset="onReset"/>
    <p>自定义提交</p>
    <LDesignForm :options="options" v-model="form" @reset="onReset">
      <template #reset="{reset}">
        <Button @click="reset">重置</Button>
      </template>
    </LDesignForm>
    <Divider/>
    <LDesignForm :options="options" v-model="form" @reset="onReset">
      <template #reset>
        <Button type="reset">重置</Button>
      </template>
    </LDesignForm>
    <Divider/>
    <LDesignForm :options="options" v-model="form" @reset="onReset">
      <template #button="{reset}">
        <Button @click="reset">重置</Button>
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

function onReset (v, ctx) {
  console.log(v, ctx)
  MessagePlugin.info('重置表单')
}

</script>