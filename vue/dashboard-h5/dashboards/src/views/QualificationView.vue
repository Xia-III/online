<template>
  <div class="boxBg2">
    <a-space class="tableHead">
      <template #split>
        <a-divider direction="vertical" />
      </template>
      <a-button type="primary" @click="toQualificationForm">添加资质</a-button>
      <a-input-search :style="{ width: '420px' }" placeholder="资质编号/主体名称/管理账户/手机号" search-button>
        <template #button-icon>
          <icon-search />
        </template>
        <template #button-default>
          搜索
        </template>
      </a-input-search>

    </a-space>

    <a-table :columns="columns" :data="dataList" :row-selection="rowSelection">
      <template #optional="{ record }">
        <a-space class="">
          <a-tag @click="toQualificationForm(record.key)" color='arcoblue'>详情</a-tag>
          <a-tag @click="toQualificationForm(record.key)" color='arcoblue'>申请商户</a-tag>
        
        </a-space>

      </template>
    </a-table>
  </div>
</template>



<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Message } from '@arco-design/web-vue';
import { setToken, UserInfo, addUsers, deleteAll, deleteUsers, getUserLists } from '@/utils/auth'
import {
  IconCaretRight,
  IconCaretLeft,
  IconHome,
  IconCalendar,
} from '@arco-design/web-vue/es/icon';
import { EChartsOption, init } from 'echarts';
import { menuItem, menuType } from '@/api/index';
@Options({
  components: {
    IconCaretRight,
    IconCaretLeft,
    IconHome,
    IconCalendar,
  },
})

export default class Qualification extends Vue {
  show = true;
  rowSelection = {
    type: 'checkbox',
    showCheckedAll: true
  };

  columns = [{
    title: '资质编号',
    dataIndex: 'name',
  }, {
    title: '证件号码',
    dataIndex: 'salary',
  }, {
    title: '主题名称',
    dataIndex: 'address',
  }, {
    title: '类型',
    dataIndex: 'email',
  }, {
    title: '管理账户',
    dataIndex: 'email',
  }, {
    title: '创建时间',
    dataIndex: 'email',
  }
    , {
    title: 'Optional',
    slotName: 'optional'
  }];
  dataList = [{
    key: '1',
    name: 'Jane Doe',
    first: 'Jane',
    last: 'Doe',
    salary: 23000,
    address: '32 Park Road, London',
    email: 'jane.doe@example.com'
  }, {
    key: '2',
    name: 'Alisa Ross',
    first: 'Alisa',
    last: 'Ross',
    salary: 25000,
    address: '35 Park Road, London',
    email: 'alisa.ross@example.com'
  }, {
    key: '3',
    name: 'Kevin Sandra',
    first: 'Kevin',
    last: 'Sandra',
    salary: 22000,
    address: '31 Park Road, London',
    email: 'kevin.sandra@example.com'
  }, {
    key: '4',
    name: 'Ed Hellen',
    first: 'Ed',
    last: 'Hellen',
    salary: 17000,
    address: '42 Park Road, London',
    email: 'ed.hellen@example.com'
  }, {
    key: '5',
    name: 'William Smith',
    first: 'William',
    last: 'Smith',
    salary: 27000,
    address: '62 Park Road, London',
    email: 'william.smith@example.com'
  }];

  toQualificationForm(id:any) {
    // let item24: menuItem = {
    //   name: "资质详情",
    //   key: "1_1_1",
    //   url: 'qualificationForm',
    //   parentId: "1_2",
    //   menuType: menuType.subpage,
    //   icon: '',
    //   items: []
    // };
    // this.$emit('addTab', item24);

  }

  created() {

  }
  mounted() {

  }


}
</script>


<style scoped lang="scss">
body {
  min-height: 100%;
}

.boxBg2 {
  width: 96%;
  height: 100%;
  padding: 0 1%;
  position: absolute;

}
</style>
