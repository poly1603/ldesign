<template>
  <div>
    <!-- <LDesignForm :options="options" @change="onChange" /> -->
    <Divider/>
    <LDesignForm v-model="value1" :options="options1"/>
    <Divider/>
    {{ value1 }}
  </div>
</template>
<script lang="tsx" setup>
import { Divider, Input, RadioGroup, Button} from '@ldesign/desktop-next';
import { LDesignAreaPicker, LDesignForm } from '@ldesign/form'
import { AddIcon } from '@ldesign/icons-vue-next';
import { ref, reactive } from 'vue';

const options = ref<any[]>([{
  label: '姓名',
  component: Input,
  name: 'name',
  props: {
    suffixIcon: () => <AddIcon onClick={() => {
    }} />,
  }
}, {
  label: '地址',
  component: Input,
  name: 'name1',
  props: {
    defaultValue: '222'
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
    value: '1'
  }
}])

const options1 = ref<any[]>([{
  label: '姓名',
  component: LDesignAreaPicker,
  name: 'name',
  props: {
    onChange: (v) => {
      console.log(v)
    }
  }
}, {
  label: '姓名1',
  component: Input,
  name: 'name1',
  props: {
    value: '1',
    suffixIcon: () => <AddIcon onClick={() => {
    }} />,
  }
}])

let value1 = reactive({
  name: '420100000000000000',
  name1: '23'
})


</script>