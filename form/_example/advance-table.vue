<template>
  <div>
    <LDesignForm
      :options="options"
      v-model="form"
      buttonPosition="block"
      @change="onChange"
      @submit="onSubmit"
    />
  </div>
</template>
<script lang="tsx" setup>
import {  RadioGroup, Table } from '@ldesign/desktop-next';
import {LDesignForm} from '@ldesign/form'
import { ref, reactive, computed } from 'vue';


const form = reactive({
})

const visible = ref(false)

const tableData = ref([{
  channel: '12',
  email: '56486484@qq.com',
  createTime: '2025'
}])


const options = computed<any[]>(() => [{
  label: '表格',
  component: Table,
  code: 'ORG_orgnature',
  span: '100%',
  props: {
    columns: [{ colKey: "channel", title: "签署方式" },
    { colKey: "email", title: "邮箱地址", ellipsis: true },
    { colKey: "createTime", title: "申请时间" }],
    data: tableData.value
  }
}])

function onChange (v, ctx) {
  // console.log(v, ctx)
}

function onSubmit (v, ctx) {
  console.log(v, ctx)
}

function onClick () {
  visible.value = true
}


setTimeout(() => {
  tableData.value = [{
  channel: '12333333333klfkawefk',
  email: '56486484@qq.com',
  createTime: '2025333'
}]
}, 1000)

</script>