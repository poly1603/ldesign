<template>
  <div>
    <LDesignTitle>默认字符串</LDesignTitle>
    <LDesignForm
      :options="options2"
      v-model="form2"
      @change="onChange"
      @submit="onSubmit"
    />
    <LDesignTitle>清空</LDesignTitle>
    <LDesignForm
      :options="options"
      v-model="form"
      @change="onChange"
      @submit="onSubmit"
    />
    <LDesignTitle>赋值</LDesignTitle>
    <LDesignForm
      :options="options1"
      v-model="form1"
      @change="onChange"
      @submit="onSubmit"
    />
  </div>
</template>
<script lang="tsx" setup>
import { Select } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { LDesignTitle } from '@ldesign/layout';
import { ref, reactive } from 'vue';

const form = reactive({
  orgnature: '',
  orgtype: ''
})

const form1 = reactive({
  orgnature: '',
  orgtype: ''
})

const form2 = reactive({
  orgnature: '',
  orgtype: ''
})

const visible = ref(false)

const options = ref<any[]>([{
  label: '机构性质',
  component: Select,
  name: 'orgnature',
  code: 'ORG_orgnature',
  relation: {
    name: 'orgtype',
    type: 'empty'
  },
  props: {
    value: '04'
  }
}, {
  label: '机构类型',
  component: Select,
  name: 'orgtype',
  code: 'ORG_orgtype',
}])

const options1 = ref<any[]>([{
  label: '机构性质',
  component: Select,
  name: 'orgnature',
  code: 'ORG_orgnature',
  relation: {
    name: 'orgtype',
    type: 0
  },
  props: {
    value: '03'
  }
}, {
  label: '机构类型',
  component: Select,
  name: 'orgtype',
  code: 'ORG_orgtype',
}])

const options2 = ref<any[]>([{
  label: '机构性质',
  component: Select,
  name: 'orgnature',
  code: 'ORG_orgnature',
  relation: 'orgtype',
  props: {
    value: '04'
  }
}, {
  label: '机构类型',
  component: Select,
  name: 'orgtype',
  code: 'ORG_orgtype',
}])

function onChange (v, ctx) {
  // console.log(v, ctx)
}

function onSubmit (v, ctx) {
  // console.log(v, ctx)
}

function onClick () {
  visible.value = true
}

</script>