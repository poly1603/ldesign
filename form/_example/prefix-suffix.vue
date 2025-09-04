<template>
  <div>
    <LDesignForm :options="options" variant="entry" v-model="form" @change="onChange" />
  </div>
</template>
<script lang="tsx" setup>
import { Input, RadioGroup, Button } from '@ldesign/desktop-next';
import { LDesignForm, type LDesignFormOptions } from '@ldesign/form'
import { AddIcon } from '@ldesign/icons-vue-next';
import { LDesignPopFrame } from '@ldesign/layout';
import { ref, reactive } from 'vue';

const form = reactive({
  name: '',
  sex: '1',
  name1: ''
})

const visible = ref(false)

const options = ref<LDesignFormOptions[]>([{
  label: '姓名',
  component: Input,
  name: 'name',
  suffix: {
    component: Button,
    props: {
      default: '新增',
      variant: 'outline',
      theme: 'primary'
    }
  }
}, {
  label: '姓名1',
  component: Input,
  name: 'name1',
  prefix: <Button
    shape="square"
    variant="outline"
    icon={() => <AddIcon/>}
  ></Button>,
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
    onChange(v) {
      form.name = `${new Date().getSeconds()}`
      // form.value.name = `${form.value.name}${v}`
    }
  }
}])

function onChange(v, ctx) {
}

function onClick() {
  visible.value = true
}

</script>